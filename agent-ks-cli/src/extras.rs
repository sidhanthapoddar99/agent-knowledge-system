use crate::{
    args::{Args, usage},
    context::Context,
    util::*,
};
use anyhow::{Context as _, Result, bail};
use serde_json::{Value, json};
use std::{
    path::{Path, PathBuf},
    process::{Command, Stdio},
};
pub fn command(program: &str, args: &[String], cwd: &Path) -> Result<String> {
    let o = Command::new(program)
        .args(args)
        .current_dir(cwd)
        .stdin(Stdio::null())
        .output()
        .with_context(|| format!("Cannot run {program}; install it and ensure it is on PATH"))?;
    if !o.status.success() {
        bail!(
            "{program} failed ({}): {}",
            o.status,
            String::from_utf8_lossy(&o.stderr).trim()
        );
    }
    Ok(String::from_utf8(o.stdout)?.trim_end().to_owned())
}
fn git(args: &[&str], cwd: &Path) -> Result<String> {
    command(
        "git",
        &std::iter::once("--literal-pathspecs".to_owned())
            .chain(args.iter().map(|s| (*s).to_owned()))
            .collect::<Vec<_>>(),
        cwd,
    )
}
fn target(c: &Context, s: &str) -> Result<PathBuf> {
    for p in [
        absolute(s)?,
        c.data_dir.join("todo").join(s),
        c.data_dir.join(s),
        c.content_root.join(s),
    ] {
        if p.exists() {
            return Ok(p);
        }
    }
    for (_, root) in c.sections("issues")? {
        let p = root.join(s);
        if p.exists() {
            return Ok(p);
        }
    }
    bail!("Content path not found: {s}")
}
fn git_run(a: &Args) -> Result<i32> {
    let c = Context::resolve(a)?;
    if a.command == "git changed" {
        let since = a.required("since")?;
        if since.starts_with('-') {
            return usage("--since must be a revision, not an option");
        }
        let root = PathBuf::from(git(&["rev-parse", "--show-toplevel"], &c.content_root)?);
        let raw = git(
            &[
                "diff",
                "--name-only",
                "-z",
                since,
                "--",
                &c.data_dir.to_string_lossy(),
            ],
            &root,
        )?;
        let mut files = vec![];
        let types = a.csv("type");
        for t in &types {
            if !["docs", "blog", "issues", "config"].contains(t) {
                return usage(format!("Unknown content type {t}"));
            }
        }
        for s in raw.split('\0').filter(|s| !s.is_empty()) {
            let p = root.join(s);
            if types.is_empty() || types.contains(&c.classify(&p)?) {
                files.push(rel(&p, &c.content_root));
            }
        }
        files.sort();
        let code = if files.is_empty() { 1 } else { 0 };
        if a.has("json") {
            emit(&json!({"since":since,"count":files.len(),"files":files}))?;
        } else {
            for f in files {
                println!("{f}");
            }
        }
        return Ok(code);
    }
    if a.command == "git commit" {
        let scope = target(&c, a.required("scope")?)?;
        let message = a.required("message")?;
        let cwd = if scope.is_dir() {
            scope.as_path()
        } else {
            scope.parent().unwrap()
        };
        let scoped = scope.to_string_lossy();
        let pending = git(&["status", "--porcelain=v1", "-z", "--", &scoped], cwd)?;
        if pending.is_empty() {
            bail!("Nothing to commit under {}", scope.display());
        }
        let files = pending
            .split('\0')
            .filter(|s| !s.is_empty())
            .collect::<Vec<_>>();
        if a.has("dry-run") {
            return result(
                a,
                json!({"dryRun":true,"scope":rel(&scope,&c.content_root),"message":message,"files":files}),
            );
        }
        git(&["add", "--", &scoped], cwd)?;
        git(&["commit", "--only", "-m", message, "--", &scoped], cwd)?;
        let hash = git(&["rev-parse", "--short", "HEAD"], cwd)?;
        return result(
            a,
            json!({"committed":true,"hash":hash,"scope":rel(&scope,&c.content_root),"message":message,"files":files}),
        );
    }
    let p = target(&c, a.positional(0)?)?;
    let cwd = if p.is_dir() {
        p.as_path()
    } else {
        p.parent().unwrap()
    };
    let limit = if a.command == "git updated" {
        1
    } else {
        a.number("limit", 20)?
    };
    let raw = git(
        &[
            "log",
            &format!("-n{limit}"),
            "--format=%H%x00%cI%x00%an%x00%s",
            "--",
            &p.to_string_lossy(),
        ],
        cwd,
    )?;
    let commits = raw
        .lines()
        .filter(|s| !s.is_empty())
        .map(|line| {
            let v = line.splitn(4, '\0').collect::<Vec<_>>();
            json!({"hash":v.first(),"date":v.get(1),"author":v.get(2),"subject":v.get(3)})
        })
        .collect::<Vec<_>>();
    let code = if commits.is_empty() { 1 } else { 0 };
    let path = rel(&p, &c.content_root);
    if a.command == "git updated" {
        if let Some(mut v) = commits.first().cloned() {
            v["path"] = json!(path);
            result(a, v)?;
        } else {
            result(a, Value::Null)?;
        }
    } else {
        result(
            a,
            json!({"path":path,"count":commits.len(),"commits":commits}),
        )?;
    }
    Ok(code)
}
pub fn run(a: &Args) -> Result<i32> {
    if a.command.starts_with("git ") {
        git_run(a)
    } else if ["start", "ps", "stop"].contains(&a.command.as_str()) {
        crate::viewer::run(a)
    } else if a.command == "theme tokens" {
        crate::theme::run(a)
    } else if a.command == "img" {
        crate::images::run(a)
    } else {
        crate::navigate::run(a)
    }
}
