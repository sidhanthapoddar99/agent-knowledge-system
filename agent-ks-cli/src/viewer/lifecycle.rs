use super::{Viewer, say};
use anyhow::{Result, bail};
use std::{
    fs,
    process::Stdio,
    sync::{
        Arc,
        atomic::{AtomicBool, Ordering},
    },
    thread,
    time::{Duration, Instant},
};

fn args(target: &str, verb: &str) -> Vec<String> {
    ["run", "astro", "--", target, verb]
        .map(String::from)
        .to_vec()
}
pub fn control(v: &Viewer, target: &str, verb: &str, follow: bool) -> Result<i32> {
    let mut command = args(target, verb);
    if follow {
        command.push("--follow".into());
    }
    v.run(&command)
}
fn running(v: &Viewer, target: &str) -> Result<bool> {
    if !v.engine.join("node_modules").exists() {
        return Ok(false);
    }
    let out = v
        .command(&args(target, "status"))
        .stdin(Stdio::null())
        .stderr(Stdio::null())
        .output()?;
    let text = String::from_utf8_lossy(&out.stdout);
    Ok(text.contains("http://") || text.contains("https://"))
}
fn stop(v: &Viewer, target: &str, launching: bool) -> Result<()> {
    let registered = running(v, target)?;
    control(v, target, "stop", false)?;
    if launching && !registered {
        say("waiting for the interrupted server launch to register");
        let deadline = Instant::now() + Duration::from_secs(35);
        while Instant::now() < deadline {
            if running(v, target)? {
                control(v, target, "stop", false)?;
                break;
            }
            thread::sleep(Duration::from_millis(200));
        }
    }
    if running(v, target)? {
        bail!("{target} server is still running; run agent-ks stop {target}");
    }
    Ok(())
}
pub fn clean(v: &Viewer) -> Result<()> {
    for target in ["dev", "preview"] {
        if running(v, target)? {
            stop(v, target, false)?;
        }
    }
    for relative in [
        ".astro",
        "dist",
        "node_modules/.vite",
        "node_modules/.astro",
    ] {
        let path = v.engine.join(relative);
        if path.is_symlink() {
            fs::remove_file(&path)?;
        } else if path.exists() {
            fs::remove_dir_all(&path)?;
        }
    }
    say("build caches cleaned");
    Ok(())
}
pub fn serve(v: &Viewer, target: &str, extra: &[String], detach: bool) -> Result<i32> {
    let owned = !running(v, target)?;
    let interrupted = Arc::new(AtomicBool::new(false));
    let signal = interrupted.clone();
    ctrlc::set_handler(move || {
        signal.store(true, Ordering::SeqCst);
    })?;
    let mut command = vec![
        "run".into(),
        target.into(),
        "--".into(),
        "--background".into(),
    ];
    command.extend_from_slice(extra);
    let mut child = v.command(&command).spawn()?;
    let status = loop {
        if interrupted.load(Ordering::SeqCst) {
            let _ = child.kill();
            let _ = child.wait();
            if owned {
                stop(v, target, true)?;
            }
            return Ok(130);
        }
        if let Some(status) = child.try_wait()? {
            break status;
        }
        thread::sleep(Duration::from_millis(50));
    };
    if !status.success() {
        return Ok(status.code().unwrap_or(1));
    }
    control(v, target, "status", false)?;
    if interrupted.load(Ordering::SeqCst) {
        if owned {
            stop(v, target, false)?;
        }
        return Ok(130);
    }
    if detach {
        say("detached; agent-ks ps shows servers, agent-ks stop stops them");
        return Ok(0);
    }
    say(if owned {
        "Ctrl-C stops this server"
    } else {
        "following existing server; Ctrl-C detaches"
    });
    let mut logs = args(target, "logs");
    logs.push("--follow".into());
    let mut follower = match v.command(&logs).spawn() {
        Ok(child) => child,
        Err(error) => {
            if owned {
                stop(v, target, false)?;
            }
            return Err(error.into());
        }
    };
    loop {
        if interrupted.load(Ordering::SeqCst) {
            let _ = follower.kill();
            let _ = follower.wait();
            if owned {
                stop(v, target, false)?;
            }
            return Ok(0);
        }
        if let Some(status) = follower.try_wait()? {
            // A follower can fail independently of the detached daemon.
            if owned && running(v, target)? {
                stop(v, target, false)?;
            }
            return Ok(status.code().unwrap_or(1));
        }
        thread::sleep(Duration::from_millis(50));
    }
}
