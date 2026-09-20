mod lifecycle;
mod maintenance;

use crate::{
    args::{Args, usage},
    context::Context,
    util::*,
};
use anyhow::{Context as _, Result, bail};
use serde_json::json;
use std::{
    fs,
    io::{self, IsTerminal, Write},
    path::PathBuf,
    process::{Command, Stdio},
};

pub struct Viewer {
    pub root: PathBuf,
    pub engine: PathBuf,
    pub config: PathBuf,
    pub runner: &'static str,
}

pub fn say(message: impl std::fmt::Display) {
    eprintln!("[agent-ks start] {message}");
}
pub fn interactive() -> bool {
    io::stdin().is_terminal() && std::env::var("START_NONINTERACTIVE").as_deref() != Ok("1")
}
pub fn ask(question: &str, default: bool) -> Result<bool> {
    if !interactive() {
        return Ok(false);
    }
    eprint!("[agent-ks start] {question} ");
    io::stderr().flush()?;
    let mut answer = String::new();
    io::stdin().read_line(&mut answer)?;
    Ok(match answer.trim().to_ascii_lowercase().as_str() {
        "" => default,
        "y" | "yes" => true,
        _ => false,
    })
}

impl Viewer {
    pub fn command(&self, args: &[String]) -> Command {
        #[cfg(windows)]
        let mut cmd = {
            let mut c = Command::new("cmd.exe");
            c.args(["/d", "/s", "/c", self.runner]);
            c
        };
        #[cfg(not(windows))]
        let mut cmd = Command::new(self.runner);
        cmd.args(args)
            .current_dir(&self.engine)
            .env("CONFIG_DIR", &self.config);
        cmd
    }
    pub fn run(&self, args: &[String]) -> Result<i32> {
        Ok(self.command(args).status()?.code().unwrap_or(1))
    }
}

pub fn run(a: &Args) -> Result<i32> {
    let mut launch = a.pos.clone();
    match a.command.as_str() {
        "ps" => launch.insert(0, "status".into()),
        "stop" => launch.insert(0, "stop".into()),
        _ => {
            if launch.is_empty() {
                launch.push("dev".into());
            }
        }
    }
    if launch[0] == "ps" {
        launch[0] = "status".into();
    }
    if launch[0].starts_with('-') {
        launch.insert(0, "dev".into());
    }
    if ["stop", "status", "logs"].contains(&launch[0].as_str())
        && (launch.len() > 2
            || launch
                .get(1)
                .is_some_and(|s| !["dev", "preview"].contains(&s.as_str())))
    {
        return usage("Server selector must be dev or preview");
    }
    if a.has("json") && !a.has("dry-run") {
        return usage(format!(
            "{} --json requires --dry-run; live viewer output is a log stream",
            a.command
        ));
    }
    let c = Context::resolve(a)?;
    if !c.config_dir.join("site.yaml").is_file() {
        bail!("Missing site.yaml in {}", c.config_dir.display());
    }
    let root = if let Some(p) = a.get("framework-dir") {
        absolute(p)?
    } else {
        c.framework_root()
    };
    let engine = root.join("agent-ks-engine");
    let missing = !root.exists();
    let control = ["stop", "status", "logs", "clean", "update"].contains(&launch[0].as_str());
    let remote = "https://github.com/sidhanthapoddar99/agent-knowledge-system.git";
    if a.has("dry-run") {
        return result(
            a,
            json!({"configDir":c.config_dir,"projectRoot":c.content_root,"frameworkDir":root,"clone":missing && !control,"repository":remote,"frameworkRef":a.get("framework-ref"),"command":"native viewer","arguments":launch,"detach":a.has("detach")}),
        );
    }
    if missing {
        if control {
            bail!(
                "No framework checkout at {}; start the viewer first",
                root.display()
            );
        }
        if let Some(parent) = root.parent() {
            fs::create_dir_all(parent)?;
        }
        let temp = tempfile::Builder::new()
            .prefix(".agent-ks-clone-")
            .tempdir_in(root.parent().context("Framework must have a parent")?)?;
        let mut cmd = Command::new("git");
        cmd.args(["clone", "--depth", "1"]);
        if let Some(reference) = a.get("framework-ref") {
            if reference.starts_with('-') {
                return usage("--framework-ref must be a tag or branch");
            }
            cmd.args(["--branch", reference]);
        }
        say(format!("Cloning viewer into {}", root.display()));
        if !cmd.arg(remote).arg(temp.path()).status()?.success() {
            bail!("Framework clone failed");
        }
        if !temp.path().join("agent-ks-engine/package.json").is_file() {
            bail!("Cloned repository has no engine package.json");
        }
        fs::rename(temp.path(), &root)?;
    }
    if !engine.join("package.json").is_file() {
        bail!(
            "{} is not an agent-knowledge-system framework checkout",
            root.display()
        );
    }
    let mut viewer = Viewer {
        root,
        engine,
        config: c.config_dir,
        runner: "bun",
    };
    if launch[0] == "update" {
        maintenance::update(&viewer, true)?;
        return Ok(0);
    }
    if ["stop", "status", "logs"].contains(&launch[0].as_str())
        && !viewer.engine.join("node_modules").exists()
    {
        say("dependencies are not installed — no server can be running");
        return Ok(0);
    }
    viewer.runner = ["bun", "npm"]
        .into_iter()
        .find(|r| {
            let candidate = Viewer {
                runner: r,
                root: viewer.root.clone(),
                engine: viewer.engine.clone(),
                config: viewer.config.clone(),
            };
            candidate
                .command(&["--version".into()])
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .status()
                .is_ok_and(|s| s.success())
        })
        .context("The viewer requires Bun or npm on PATH")?;
    if ["stop", "status", "logs"].contains(&launch[0].as_str()) {
        let targets: Vec<&str> = match launch.get(1) {
            Some(s) => vec![s],
            None if launch[0] == "logs" => vec!["dev"],
            None => vec!["dev", "preview"],
        };
        let mut code = 0;
        for target in targets {
            let current = lifecycle::control(&viewer, target, &launch[0], a.has("follow"))?;
            if current != 0 {
                code = current;
            }
        }
        return Ok(code);
    }
    if launch[0] == "clean" {
        lifecycle::clean(&viewer)?;
        launch.remove(0);
        if launch.is_empty() {
            return Ok(0);
        }
    }
    maintenance::update(&viewer, false)?;
    maintenance::shallow(&viewer)?;
    maintenance::dependencies(&viewer)?;
    maintenance::version(&viewer)?;
    match launch[0].as_str() {
        "dev" | "preview" => lifecycle::serve(&viewer, &launch[0], &launch[1..], a.has("detach")),
        "build" | "doctor" => {
            if launch[0] == "build" && !a.has("no-clean") {
                lifecycle::clean(&viewer)?;
            }
            viewer.run(
                &[
                    vec!["run".into(), "build".into(), "--".into()],
                    launch[1..].to_vec(),
                ]
                .concat(),
            )
        }
        _ => viewer.run(&[vec!["run".into()], launch].concat()),
    }
}
