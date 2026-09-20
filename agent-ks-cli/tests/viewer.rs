#![cfg(unix)]
use std::{
    fs,
    os::unix::fs::PermissionsExt,
    path::Path,
    process::{Command, Stdio},
    thread,
    time::{Duration, Instant},
};
use tempfile::TempDir;
const BIN: &str = env!("CARGO_BIN_EXE_agent-ks");
fn put(root: &Path, path: &str, value: &str) {
    let path = root.join(path);
    fs::create_dir_all(path.parent().unwrap()).unwrap();
    fs::write(path, value).unwrap();
}
fn fixture() -> TempDir {
    let d = tempfile::tempdir().unwrap();
    put(d.path(), "config/site.yaml", "engine_version: '1.0.0'\n");
    put(d.path(), "agent-ks-engine/package.json", "{}");
    put(
        d.path(),
        "agent-ks-engine/src/loaders/engine-version.ts",
        "export const ENGINE_VERSION = '1.0.0';\nexport const MIN_CONTENT_VERSION = '0.9.0';\n",
    );
    put(
        d.path(),
        "bin/bun",
        r#"#!/bin/sh
if [ "$1" = --version ]; then exit 0; fi
printf '%s|%s|%s\n' "$CONFIG_DIR" "$PWD" "$*" >> "$TRACE"
if [ "$1" = install ]; then mkdir -p node_modules; exit 0; fi
if [ "$2" = astro ]; then
  case "$5" in
    status) if [ -f "$STATE/$4" ]; then echo http://localhost:9999; fi ;;
    stop) rm -f "$STATE/$4" ;;
    logs) if [ "$6" = --follow ]; then exec sleep 30; else echo server-log; fi ;;
  esac
  exit 0
fi
case "$2" in
  dev|preview)
    if [ "$SLOW" = late ]; then
      (sleep 0.3; touch "$STATE/$2") &
      exec sleep 30
    fi
    touch "$STATE/$2"
    if [ "$SLOW" = 1 ]; then exec sleep 30; fi ;;
esac
exit "${SCRIPT_EXIT:-0}"
"#,
    );
    fs::set_permissions(d.path().join("bin/bun"), fs::Permissions::from_mode(0o755)).unwrap();
    d
}
fn command(d: &TempDir, args: &[&str]) -> Command {
    let mut cmd = Command::new(BIN);
    cmd.current_dir(d.path())
        .args(args)
        .env_remove("AGENTKS_CONFIG_FOLDER")
        .env(
            "PATH",
            format!("{}:/usr/bin:/bin", d.path().join("bin").display()),
        )
        .env("START_NONINTERACTIVE", "1")
        .env("TRACE", d.path().join("trace"))
        .env("STATE", d.path())
        .env_remove("START_SKIP_VERSION_CHECK");
    cmd
}
fn run(d: &TempDir, args: &[&str]) {
    let out = command(d, args).output().unwrap();
    assert!(
        out.status.success(),
        "{args:?}: {}",
        String::from_utf8_lossy(&out.stderr)
    );
}
fn trace(d: &TempDir) -> String {
    fs::read_to_string(d.path().join("trace")).unwrap_or_default()
}
#[test]
fn native_lifecycle_and_scoped_controls() {
    let d = fixture();
    run(&d, &["start", "--detach", "--port", "9999"]);
    assert!(trace(&d).contains("run dev -- --background --port 9999"));
    run(&d, &["start", "preview", "--detach"]);
    run(&d, &["ps"]);
    run(&d, &["stop", "dev"]);
    assert!(!d.path().join("dev").exists());
    assert!(d.path().join("preview").exists());
    run(&d, &["start", "logs", "preview"]);
    run(&d, &["stop"]);
    assert!(!d.path().join("preview").exists());
    assert_eq!(trace(&d).matches("|install\n").count(), 1);
    let physical_root = d.path().canonicalize().unwrap();
    for line in trace(&d).lines() {
        assert!(line.starts_with(physical_root.join("config").to_str().unwrap()));
        assert!(line.contains(physical_root.join("agent-ks-engine").to_str().unwrap()));
    }
    for args in [&["stop", "typo"][..], &["ps", "--typo"], &["ps", "--json"]] {
        assert_eq!(command(&d, args).output().unwrap().status.code(), Some(2));
    }
}
#[test]
fn clean_stops_servers_before_removing_caches_and_builds_propagate_failures() {
    let d = fixture();
    run(&d, &["start", "--detach"]);
    put(d.path(), "agent-ks-engine/.astro/keep", "lock");
    put(d.path(), "agent-ks-engine/dist/keep", "output");
    run(&d, &["start", "clean", "build"]);
    assert!(!d.path().join("dev").exists());
    assert!(!d.path().join("agent-ks-engine/.astro").exists());
    assert!(!d.path().join("agent-ks-engine/dist").exists());
    let log = trace(&d);
    assert!(log.find("run astro -- dev stop").unwrap() < log.find("run build").unwrap());
    put(d.path(), "agent-ks-engine/dist/keep", "output");
    run(&d, &["start", "build", "--no-clean"]);
    assert!(d.path().join("agent-ks-engine/dist/keep").exists());
    assert_eq!(
        command(&d, &["start", "build"])
            .env("SCRIPT_EXIT", "7")
            .output()
            .unwrap()
            .status
            .code(),
        Some(7)
    );
}
#[test]
fn versions_block_launch_but_never_block_controls() {
    let d = fixture();
    run(&d, &["start", "--detach"]);
    for version in ["0.0.0", "2.0.0"] {
        put(
            d.path(),
            "config/site.yaml",
            &format!("engine_version: '{version}'\n"),
        );
        let out = command(&d, &["start", "preview", "--detach"])
            .output()
            .unwrap();
        assert_eq!(out.status.code(), Some(1));
        assert!(!d.path().join("preview").exists());
        run(&d, &["ps"]);
    }
    run(&d, &["stop"]);
    assert!(!d.path().join("dev").exists());
}
fn await_trace(d: &TempDir, value: &str) {
    let deadline = Instant::now() + Duration::from_secs(5);
    while Instant::now() < deadline {
        if trace(d).contains(value) {
            return;
        }
        thread::sleep(Duration::from_millis(20));
    }
    panic!("missing {value}: {}", trace(d));
}
#[test]
fn interrupts_stop_owned_servers_and_preserve_attached_servers() {
    for owned in [true, false] {
        let d = fixture();
        if !owned {
            run(&d, &["start", "--detach"]);
        }
        let mut child = command(&d, &["start"])
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .unwrap();
        await_trace(&d, "logs --follow");
        Command::new("kill")
            .args(["-INT", &child.id().to_string()])
            .status()
            .unwrap();
        let deadline = Instant::now() + Duration::from_secs(5);
        while child.try_wait().unwrap().is_none() {
            if Instant::now() > deadline {
                let _ = child.kill();
                panic!("interrupt did not terminate CLI");
            }
            thread::sleep(Duration::from_millis(20));
        }
        assert_eq!(d.path().join("dev").exists(), !owned);
    }
}
#[test]
fn unix_bootstrap_forwards_env_as_data_and_preserves_exit_code() {
    let d = tempfile::tempdir().unwrap();
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
    fs::copy(root.join("start"), d.path().join("start")).unwrap();
    put(
        d.path(),
        ".env",
        "CONFIG_DIR=first\nexport CONFIG_DIR=\"./content with spaces\" # comment\n",
    );
    put(
        d.path(),
        "bin/agent-ks",
        "#!/bin/sh\nprintf '%s\\n' \"$@\"\nexit 7\n",
    );
    fs::set_permissions(
        d.path().join("bin/agent-ks"),
        fs::Permissions::from_mode(0o755),
    )
    .unwrap();
    let out = Command::new("bash")
        .arg(d.path().join("start"))
        .args(["stop", "preview"])
        .env_remove("CONFIG_DIR")
        .env(
            "PATH",
            format!("{}:/usr/bin:/bin", d.path().join("bin").display()),
        )
        .output()
        .unwrap();
    assert_eq!(out.status.code(), Some(7));
    let text = String::from_utf8(out.stdout).unwrap();
    assert!(text.starts_with("start\n--config-dir\n./content with spaces\n--framework-dir\n"));
    assert!(text.ends_with("stop\npreview\n"));
}

#[test]
fn interrupted_launch_stops_late_registration() {
    let d = fixture();
    let mut child = command(&d, &["start"])
        .env("SLOW", "late")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .unwrap();
    await_trace(&d, "run dev -- --background");
    Command::new("kill")
        .args(["-TERM", &child.id().to_string()])
        .status()
        .unwrap();
    let deadline = Instant::now() + Duration::from_secs(5);
    while child.try_wait().unwrap().is_none() {
        if Instant::now() > deadline {
            let _ = child.kill();
            panic!("late launch was not stopped");
        }
        thread::sleep(Duration::from_millis(20));
    }
    assert!(!d.path().join("dev").exists());
    assert!(trace(&d).contains("run astro -- dev stop"));
}

#[test]
fn controls_do_not_clone_and_npm_fallback_runs_native_commands() {
    let d = fixture();
    for cmd in ["ps", "stop"] {
        let out = command(&d, &[cmd, "--framework-dir", "missing"])
            .output()
            .unwrap();
        assert_eq!(out.status.code(), Some(1));
        assert!(!d.path().join("missing").exists());
    }
    fs::rename(d.path().join("bin/bun"), d.path().join("bin/npm")).unwrap();
    run(&d, &["start", "build", "--no-clean", "--", "--verbose"]);
    assert!(trace(&d).contains("run build -- --verbose"));
    let before = trace(&d);
    run(&d, &["start", "update"]);
    assert_eq!(trace(&d), before);
}
