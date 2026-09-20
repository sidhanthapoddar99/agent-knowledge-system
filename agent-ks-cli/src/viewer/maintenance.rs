use super::{Viewer, ask, interactive, say};
use anyhow::{Result, bail};
use sha2::{Digest, Sha256};
use std::{
    fs,
    path::PathBuf,
    process::{Command, Stdio},
};

pub fn dependencies(v: &Viewer) -> Result<()> {
    let mut hash = Sha256::new();
    for name in [
        "package.json",
        if v.runner == "bun" {
            "bun.lock"
        } else {
            "package-lock.json"
        },
    ] {
        let path = v.engine.join(name);
        if path.exists() {
            hash.update(fs::read(path)?);
        }
    }
    let wanted = format!("{:x}", hash.finalize());
    let stamp = v.engine.join("node_modules/.start-deps-stamp");
    if fs::read_to_string(&stamp).is_ok_and(|s| s.trim() == wanted) {
        return Ok(());
    }
    if v.runner == "npm" {
        say(
            "npm installs a separate node_modules per project; Bun shares cached packages across projects",
        );
        if interactive() && !ask("proceed with npm install? [Y/n]", true)? {
            bail!("Install cancelled");
        }
    }
    say(format!("installing dependencies with {}", v.runner));
    if v.run(&["install".into()])? != 0 {
        bail!("Dependency install failed");
    }
    fs::create_dir_all(stamp.parent().unwrap())?;
    fs::write(stamp, wanted)?;
    Ok(())
}
fn git(v: &Viewer, args: &[&str]) -> Option<String> {
    Command::new("git")
        .arg("-C")
        .arg(&v.root)
        .args(args)
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_owned())
}
fn upstream(v: &Viewer) -> Option<String> {
    git(v, &["diff", "--quiet"])?;
    git(v, &["diff", "--cached", "--quiet"])?;
    git(
        v,
        &["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{u}"],
    )
}
pub fn update(v: &Viewer, force: bool) -> Result<()> {
    let explain = |s| {
        if force {
            say(s);
        }
    };
    if !force && (!interactive() || std::env::var("START_SKIP_UPDATE_CHECK").as_deref() == Ok("1"))
    {
        return Ok(());
    }
    let Some(dir) = git(v, &["rev-parse", "--absolute-git-dir"]) else {
        explain("not a git checkout");
        return Ok(());
    };
    if !force {
        let hours = std::env::var("START_UPDATE_INTERVAL_HOURS")
            .unwrap_or_else(|_| "6".into())
            .parse::<f64>()
            .unwrap_or(0.0);
        let stamp = PathBuf::from(dir).join(".start-update-stamp");
        if hours.is_finite() && hours > 0.0 {
            if fs::metadata(&stamp)
                .and_then(|m| m.modified())
                .ok()
                .and_then(|t| t.elapsed().ok())
                .is_some_and(|age| age.as_secs_f64() < hours * 3600.0)
            {
                return Ok(());
            }
            let _ = fs::write(stamp, "");
        }
    }
    let Some(upstream) = upstream(v) else {
        explain("working tree has changes or this branch tracks no upstream; skipping update");
        return Ok(());
    };
    say(format!("checking {upstream} for updates"));
    if git(v, &["fetch", "--quiet"]).is_none() {
        say("fetch failed; continuing with current checkout");
        return Ok(());
    }
    let (Some(local), Some(remote)) = (
        git(v, &["rev-parse", "HEAD"]),
        git(v, &["rev-parse", "@{u}"]),
    ) else {
        explain("cannot read local or upstream commit");
        return Ok(());
    };
    if local == remote {
        say("up to date");
        return Ok(());
    }
    if git(v, &["merge-base", "HEAD", "@{u}"]).as_deref() != Some(local.as_str()) {
        say("local branch diverged from upstream; resolve manually before pulling");
        return Ok(());
    }
    say(format!(
        "{} new commit(s) available",
        git(v, &["rev-list", "--count", "HEAD..@{u}"]).unwrap_or_else(|| "?".into())
    ));
    if !interactive() {
        say("run agent-ks start update interactively to pull");
        return Ok(());
    }
    if ask("pull now? [Y/n]", true)? && git(v, &["pull", "--ff-only", "--quiet"]).is_none() {
        say("pull failed; continuing with current checkout");
    }
    Ok(())
}
pub fn shallow(v: &Viewer) -> Result<()> {
    if !interactive()
        || std::env::var("START_SKIP_UPDATE_CHECK").as_deref() == Ok("1")
        || v.config.starts_with(&v.root)
    {
        return Ok(());
    }
    let Some(dir) = git(v, &["rev-parse", "--absolute-git-dir"]) else {
        return Ok(());
    };
    let declined = PathBuf::from(dir).join(".start-shallow-declined");
    if declined.exists()
        || git(v, &["rev-parse", "--is-shallow-repository"]).as_deref() != Some("false")
        || upstream(v).is_none()
    {
        return Ok(());
    }
    if git(v, &["rev-parse", "HEAD"]) != git(v, &["rev-parse", "@{u}"]) {
        return Ok(());
    }
    if !ask(
        "consumer checkout has full git history; shrink to a shallow clone? [y/N]",
        false,
    )? {
        let _ = fs::write(declined, "");
        return Ok(());
    }
    if git(v, &["fetch", "--depth", "1", "--quiet"]).is_some() {
        git(v, &["reflog", "expire", "--expire=now", "--all"]);
        git(v, &["gc", "--prune=now", "--quiet"]);
    } else {
        say("shallow fetch failed; leaving checkout as-is");
    }
    Ok(())
}
fn number(s: &str) -> Option<[u64; 3]> {
    let values: Vec<u64> = s
        .split('.')
        .map(str::parse)
        .collect::<std::result::Result<_, _>>()
        .ok()?;
    values.try_into().ok()
}
pub fn version(v: &Viewer) -> Result<()> {
    if std::env::var("START_SKIP_VERSION_CHECK").as_deref() == Ok("1") {
        return Ok(());
    }
    let source =
        fs::read_to_string(v.engine.join("src/loaders/engine-version.ts")).unwrap_or_default();
    let constant = |name: &str| -> Option<String> {
        let re = regex::Regex::new(&format!(
            r#"(?m)^export const {name}\s*=\s*['"](\d+\.\d+\.\d+)['"]"#
        ))
        .ok()?;
        Some(re.captures(&source)?[1].to_owned())
    };
    let (Some(engine), Some(floor)) = (constant("ENGINE_VERSION"), constant("MIN_CONTENT_VERSION"))
    else {
        say("cannot read engine version constants; deferring to the engine version gate");
        return Ok(());
    };
    let site: serde_json::Value =
        serde_yaml::from_str(&fs::read_to_string(v.config.join("site.yaml"))?)?;
    let declared = site
        .get("engine_version")
        .and_then(|s| s.as_str())
        .unwrap_or("0.0.0");
    let (Some(current), Some(min), Some(max)) = (number(declared), number(&floor), number(&engine))
    else {
        say("cannot parse engine_version; deferring to the engine version gate");
        return Ok(());
    };
    let mut migrations = Vec::new();
    if let Ok(entries) = fs::read_dir(v.engine.join("migration")) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.ends_with(".py")
                && let Some((prefix, _)) = name.split_once('_')
                && let Some(version) = number(prefix)
                && version > current
                && version <= max
            {
                migrations.push((version, name));
            }
        }
    }
    migrations.sort();
    if current < min {
        for (_, name) in migrations {
            say(format!(
                "migration: {}",
                v.engine.join("migration").join(name).display()
            ));
        }
        bail!(
            "Content targets {declared}; engine {engine} requires {floor} or newer. Run each migration: detect, dry-run, migrate, detect again. Update site.yaml engine_version last."
        );
    }
    if current > max {
        bail!("Content targets {declared}, newer than engine {engine}; run agent-ks start update");
    }
    say(format!(
        "content {declared}; engine {engine} (floor {floor})"
    ));
    for (_, name) in migrations {
        say(format!("optional migration: {name}"));
    }
    Ok(())
}
