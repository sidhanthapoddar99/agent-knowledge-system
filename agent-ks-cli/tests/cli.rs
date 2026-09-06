use serde_json::{Value, json};
use std::{
    fs,
    path::Path,
    process::{Command, Output},
};
use tempfile::TempDir;
const BIN: &str = env!("CARGO_BIN_EXE_agent-ks");
fn put(root: &Path, p: &str, text: &str) {
    let p = root.join(p);
    fs::create_dir_all(p.parent().unwrap()).unwrap();
    fs::write(p, text).unwrap();
}
fn project() -> TempDir {
    let d = tempfile::tempdir().unwrap();
    put(
        d.path(),
        "config/site.yaml",
        "site: {name: Test}\npaths: {data: ../data}\ntheme: default\npages:\n  manual: {type: docs, layout: '@docs/default', data: '@data/manual', base_url: /manual}\n  tasks: {type: issues, layout: '@issues/default', data: '@data/tasks', base_url: /tasks}\n",
    );
    put(d.path(), "data/manual/settings.json", "{}");
    put(
        d.path(),
        "data/manual/10_intro.md",
        "---\ntitle: 'Rust: a toolkit'\n---\nBefore\nneedle [literal]\nAfter\n",
    );
    put(
        d.path(),
        "data/tasks/settings.json",
        r#"{"fields":{"priority":{"values":["high"],"descriptions":{"high":"Important"}},"component":{"values":["cli"],"descriptions":{"cli":"CLI"}},"labels":{"values":[],"descriptions":{}}}}"#,
    );
    put(
        d.path(),
        "data/tasks/2026-09-06-cli/settings.json",
        r#"{"title":"CLI","status":"open","priority":"high","component":["cli"]}"#,
    );
    put(
        d.path(),
        "data/tasks/2026-09-06-cli/issue.md",
        "# CLI\nA needle in the body.\n",
    );
    d
}
fn call(root: &Path, args: &[&str]) -> Output {
    Command::new(BIN)
        .args(args)
        .current_dir(root)
        .env_remove("AGENTKS_CONFIG_FOLDER")
        .env_remove("CONFIG_DIR")
        .output()
        .unwrap()
}
fn ok(root: &Path, args: &[&str]) -> Value {
    let o = call(root, args);
    assert_eq!(
        o.status.code(),
        Some(0),
        "{args:?}: {}",
        String::from_utf8_lossy(&o.stderr)
    );
    serde_json::from_slice(&o.stdout)
        .unwrap_or_else(|_| panic!("Invalid JSON: {}", String::from_utf8_lossy(&o.stdout)))
}
#[test]
fn config_precedence_and_missing() {
    let d = project();
    let v = ok(d.path(), &["resolve-context", "--json"]);
    assert_eq!(
        v["dataDir"],
        json!(d.path().join("data").canonicalize().unwrap())
    );
    let sub = d.path().join("data");
    assert_eq!(call(&sub, &["resolve-context"]).status.code(), Some(1));
    let o = Command::new(BIN)
        .args(["resolve-context", "--json"])
        .current_dir(&sub)
        .env("AGENTKS_CONFIG_FOLDER", "../config")
        .output()
        .unwrap();
    assert!(o.status.success());
    assert_eq!(
        call(d.path(), &["--config-dir=missing", "resolve-context"])
            .status
            .code(),
        Some(1)
    );
    let o = Command::new(BIN)
        .args(["--config-dir", "config", "resolve-context", "--json"])
        .current_dir(d.path())
        .env("AGENTKS_CONFIG_FOLDER", "missing")
        .output()
        .unwrap();
    assert!(o.status.success());
    assert_eq!(
        call(d.path(), &["resolve-context", "--config-dir="])
            .status
            .code(),
        Some(1)
    );
}
#[test]
fn help_on_every_command() {
    let d = tempfile::tempdir().unwrap();
    let m = ok(d.path(), &["help", "--json"]);
    for c in m.as_array().unwrap() {
        let mut args = vec![];
        if let Some(g) = c["group"].as_str() {
            args.push(g);
        }
        args.push(c["verb"].as_str().unwrap());
        args.push("--help");
        let o = call(d.path(), &args);
        assert!(
            o.status.success(),
            "{args:?}: {}",
            String::from_utf8_lossy(&o.stderr)
        );
        let text = String::from_utf8(o.stdout).unwrap();
        assert!(text.contains("Usage:"));
        assert!(text.contains("Config:"));
    }
    for g in ["issue", "doc", "blog", "check", "git", "theme"] {
        assert!(call(d.path(), &[g, "--help"]).status.success());
    }
    assert_eq!(
        call(d.path(), &["find", "needle", "--typo"]).status.code(),
        Some(2)
    );
    assert!(call(d.path(), &["--version"]).status.success());
}
#[test]
fn literal_context_limits_and_alias_paths() {
    let d = project();
    let v = ok(
        d.path(),
        &[
            "find",
            "needle [literal]",
            "--fixed-strings",
            "--context",
            "1",
            "--json",
        ],
    );
    let h = &v[0];
    assert_eq!(h["line"], 5);
    assert_eq!(h["before"][0]["text"], "Before");
    assert_eq!(h["after"][0]["text"], "After");
    assert_eq!(
        call(d.path(), &["find", "needle", "--limit", "0", "--json"])
            .status
            .code(),
        Some(1)
    );
    assert_eq!(
        call(d.path(), &["find", "[", "--json"]).status.code(),
        Some(2)
    );
    let issues = ok(d.path(), &["issue", "list", "--search", "needle", "--json"]);
    assert_eq!(issues[0]["id"], "2026-09-06-cli");
    let human = call(
        d.path(),
        &["issue", "list", "--search", "needle", "--context", "1"],
    );
    assert!(String::from_utf8_lossy(&human.stdout).contains("# CLI"));
    let docs = ok(d.path(), &["doc", "list", "--json"]);
    assert_eq!(docs[0]["title"], "Rust: a toolkit");
}
#[test]
fn scaffold_round_plan_state_and_no_partial_selector_write() {
    let d = project();
    let id = "2026-09-06-cli";
    let sub = ok(
        d.path(),
        &[
            "issue",
            "new-subtask",
            id,
            "--name",
            "work",
            "--group",
            "040_execution",
            "--json",
        ],
    );
    assert!(
        sub["path"]
            .as_str()
            .unwrap()
            .contains("040_execution/010_work.md")
    );
    let plan = ok(
        d.path(),
        &["issue", "new-plan", id, "--name", "ship", "--json"],
    );
    let plan = plan["folder"].as_str().unwrap();
    ok(
        d.path(),
        &[
            "issue",
            "new-stage",
            id,
            "--plan",
            plan,
            "--name",
            "verify",
            "--subtask",
            "10",
            "--json",
        ],
    );
    let failed = call(
        d.path(),
        &[
            "issue",
            "new-stage",
            id,
            "--plan",
            plan,
            "--name",
            "missing",
            "--subtask",
            "99",
            "--json",
        ],
    );
    assert_eq!(failed.status.code(), Some(1));
    assert!(
        !d.path()
            .join(format!("data/tasks/{id}/plans/{plan}/20_missing.md"))
            .exists()
    );
    let log = ok(
        d.path(),
        &[
            "issue",
            "new-agent-log",
            id,
            "--kind",
            "au",
            "--name",
            "verify",
            "--for",
            "10",
            "--json",
        ],
    );
    let log = log["folder"].as_str().unwrap();
    assert_eq!(
        call(
            d.path(),
            &[
                "issue",
                "new-round",
                id,
                "--log",
                log,
                "--name",
                "report",
                "--report"
            ]
        )
        .status
        .code(),
        Some(2)
    );
    let round = ok(
        d.path(),
        &[
            "issue",
            "new-round",
            id,
            "--log",
            log,
            "--name",
            "audit",
            "--json",
        ],
    );
    assert_eq!(round["round"], 1);
    assert_eq!(round["indexUpdated"], true);
    let report = ok(
        d.path(),
        &[
            "issue",
            "new-round",
            id,
            "--log",
            log,
            "--name",
            "findings",
            "--report",
            "--json",
        ],
    );
    assert_eq!(report["report"], 1);
    ok(
        d.path(),
        &[
            "issue",
            "set-state",
            id,
            "done",
            "--subtask",
            "10",
            "--json",
        ],
    );
    let subs = ok(
        d.path(),
        &["issue", "subtasks", id, "--status", "all", "--json"],
    );
    assert_eq!(subs["subtasks"][0]["status"], "done");
    let context = ok(
        d.path(),
        &["issue", "context", id, "--max-chars", "5", "--json"],
    );
    assert_eq!(context["body"]["truncated"], true);
    assert_eq!(context["subtasks"]["active"], 0);
}
#[test]
fn move_links_preserve_code_titles_and_sidecars() {
    let d = project();
    let root = d.path();
    put(root, "data/manual/20_map.mmd", "graph TD; A-->B");
    put(root, "data/manual/20_map.meta.json", "{\"title\":\"Map\"}");
    put(
        root,
        "data/manual/30_refs.md",
        "---\ntitle: Refs\n---\n[20 map](./20_map.mmd \"Title\")\n[`map`](./20_map.mmd#node)\n`[code](./20_map.mmd)`\n```md\n[example](./20_map.mmd)\n```\n[reference]: ./20_map.mmd\n",
    );
    ok(
        root,
        &[
            "move",
            "data/manual/20_map.mmd",
            "data/manual/40_map.mmd",
            "--no-git",
            "--json",
        ],
    );
    assert!(root.join("data/manual/40_map.meta.json").exists());
    let text = fs::read_to_string(root.join("data/manual/30_refs.md")).unwrap();
    assert!(text.contains("[40 map](./40_map.mmd \"Title\")"));
    assert!(text.contains("[`map`](./40_map.mmd#node)"));
    assert!(text.contains("`[code](./20_map.mmd)`"));
    assert!(text.contains("[example](./20_map.mmd)"));
    assert!(text.contains("[reference]: ./40_map.mmd"));
}
#[cfg(unix)]
#[test]
fn symlink_write_escape_rejected() {
    let d = project();
    let outside = tempfile::tempdir().unwrap();
    let base = d.path().join("data/tasks/2026-09-06-cli/subtasks");
    std::os::unix::fs::symlink(outside.path(), &base).unwrap();
    let out = call(
        d.path(),
        &["issue", "new-subtask", "2026-09-06-cli", "--name", "escape"],
    );
    assert_eq!(out.status.code(), Some(1));
    assert_eq!(fs::read_dir(outside.path()).unwrap().count(), 0);
}
#[test]
fn jsonc_state_is_surgical() {
    let d = project();
    let p = "data/tasks/2026-09-06-cli/settings.jsonc";
    put(
        d.path(),
        p,
        "{\n  // retained\n  \"nested\": {\"status\": \"done\"},\n  \"title\": \"CLI\",\n  \"status\": \"open\",\n}\n",
    );
    ok(
        d.path(),
        &[
            "issue",
            "set-state",
            "2026-09-06-cli",
            "in-progress",
            "--json",
        ],
    );
    let text = fs::read_to_string(d.path().join(p)).unwrap();
    assert!(text.contains("// retained"));
    assert!(text.contains("\"nested\": {\"status\": \"done\"}"));
    assert!(text.contains("\"status\": \"in-progress\""));
}
#[test]
fn validators_fail_real_defects() {
    let d = project();
    put(
        d.path(),
        "data/manual/010_duplicate.md",
        "No frontmatter\n[broken](./missing.md)\n",
    );
    for args in [
        vec!["check", "section", "data/manual", "--json"],
        vec!["check", "link-form", "data/manual", "--json"],
    ] {
        let out = call(d.path(), &args);
        assert_eq!(out.status.code(), Some(1));
        let v: Value = serde_json::from_slice(&out.stdout).unwrap();
        assert!(v["counts"]["errors"].as_u64().unwrap() > 0);
    }
    let v = ok(d.path(), &["check", "config", "--json"]);
    assert_eq!(v["counts"]["errors"], 0);
}
#[test]
fn viewer_plan_and_embedded_theme() {
    let d = project();
    let v = ok(d.path(), &["start", "--dry-run", "--json"]);
    assert_eq!(v["clone"], true);
    assert!(!d.path().join("agent-knowledge-system").exists());
    let v = ok(d.path(), &["theme", "tokens", "--json"]);
    assert!(v["light"].as_object().unwrap().len() > 20);
}

#[test]
fn index_round_numbering_and_malformed_tracker_reports() {
    let d = project();
    let id = "2026-09-06-cli";
    let index = ok(
        d.path(),
        &[
            "issue",
            "new-subtask",
            id,
            "--index",
            "--group",
            "040_work",
            "--json",
        ],
    );
    assert!(
        index["path"]
            .as_str()
            .unwrap()
            .ends_with("040_work/00_overview.md")
    );
    let log = ok(
        d.path(),
        &[
            "issue",
            "new-agent-log",
            id,
            "--kind",
            "lp",
            "--name",
            "test",
            "--json",
        ],
    );
    let log = log["folder"].as_str().unwrap();
    for n in 1..=11 {
        let round = ok(
            d.path(),
            &[
                "issue",
                "new-round",
                id,
                "--log",
                log,
                "--name",
                "check",
                "--json",
            ],
        );
        assert_eq!(round["round"], n);
    }
    let index = fs::read_to_string(
        d.path()
            .join(format!("data/tasks/{id}/agent-log/{log}/00_index.md")),
    )
    .unwrap();
    assert!(index.contains("./110_check.md"));
    assert!(!index.contains("One link per round"));
    put(
        d.path(),
        &format!("data/tasks/{id}/subtasks/010_bad.md"),
        "---\ntitle: [invalid\n---\nbody",
    );
    let out = call(d.path(), &["check", "issues", "--json"]);
    assert_eq!(out.status.code(), Some(1));
    let report: Value = serde_json::from_slice(&out.stdout).unwrap();
    assert!(report["errorCount"].as_u64().unwrap() > 0);
}

#[test]
fn metadata_search_and_legacy_syntax() {
    let d = project();
    put(
        d.path(),
        "data/manual/20_artifact.html",
        "<p>only-body-token</p>",
    );
    assert_eq!(
        call(d.path(), &["find", "only-body-token", "--meta"])
            .status
            .code(),
        Some(1)
    );
    put(
        d.path(),
        "data/manual/30_legacy.md",
        "---\ntitle: ':::tabs'\n---\n`<tab>`\n```md\n:::callout\n```\n:::collapsible\n<tab>live</tab>\n",
    );
    let out = call(d.path(), &["check", "legacy-tags", "data/manual", "--json"]);
    let v: Value = serde_json::from_slice(&out.stdout).unwrap();
    assert_eq!(v["errorCount"], 2);
}

#[cfg(unix)]
#[test]
fn viewer_dispatch_and_clone_preserve_config() {
    use std::os::unix::fs::PermissionsExt;
    let d = project();
    let bins = d.path().join("fake-bin");
    let framework = d.path().join("custom-viewer");
    put(d.path(), "custom-viewer/scripts/start.mjs", "// fixture");
    put(d.path(), "custom-viewer/.env", "CONFIG_DIR=do-not-change\n");
    put(
        d.path(),
        "fake-bin/node",
        "#!/bin/sh\nif [ \"$1\" = --version ]; then echo v24.0.0; exit 0; fi\nprintf '%s\\n' \"$CONFIG_DIR\" \"$PWD\" \"$@\" > \"$TEST_LAUNCH\"\n",
    );
    put(
        d.path(),
        "fake-bin/git",
        "#!/bin/sh\nfor last do :; done\nmkdir -p \"$last/scripts\"\nprintf '// cloned fixture\\n' > \"$last/scripts/start.mjs\"\n",
    );
    for name in ["node", "git"] {
        fs::set_permissions(bins.join(name), fs::Permissions::from_mode(0o755)).unwrap();
    }
    let capture = d.path().join("launch.txt");
    for clone in [false, true] {
        let target = if clone {
            d.path().join("agent-knowledge-system")
        } else {
            framework.clone()
        };
        let o = Command::new(BIN)
            .args([
                "start",
                "--framework-dir",
                target.to_str().unwrap(),
                "--detach",
            ])
            .current_dir(d.path())
            .env_remove("AGENTKS_CONFIG_FOLDER")
            .env("PATH", format!("{}:/usr/bin:/bin", bins.display()))
            .env("CONFIG_DIR", "wrong")
            .env("TEST_LAUNCH", &capture)
            .output()
            .unwrap();
        assert!(o.status.success(), "{}", String::from_utf8_lossy(&o.stderr));
        let launch = fs::read_to_string(&capture).unwrap();
        assert!(
            launch.contains(
                d.path()
                    .join("config")
                    .canonicalize()
                    .unwrap()
                    .to_str()
                    .unwrap()
            )
        );
        assert!(launch.ends_with("dev\n--detach\n"));
        assert!(target.join("scripts/start.mjs").is_file());
    }
    assert_eq!(
        fs::read_to_string(framework.join(".env")).unwrap(),
        "CONFIG_DIR=do-not-change\n"
    );
}

#[test]
fn image_conversion_rewrites_links_and_preserves_backup() {
    let engine = ["magick", "convert"].into_iter().find(|name| {
        Command::new(name)
            .arg("-version")
            .output()
            .is_ok_and(|o| o.status.success())
    });
    let Some(engine) = engine else {
        eprintln!("Image integration requires ImageMagick; skipped on this host");
        return;
    };
    let d = project();
    let src = d.path().join("data/manual/assets/screen.png");
    fs::create_dir_all(src.parent().unwrap()).unwrap();
    assert!(
        Command::new(engine)
            .args(["-size", "100x80", "gradient:red-blue"])
            .arg(&src)
            .status()
            .unwrap()
            .success()
    );
    let original = fs::read(&src).unwrap();
    put(
        d.path(),
        "data/manual/30_image.md",
        "---\ntitle: Image\n---\n![Screenshot](./assets/screen.png)\n",
    );
    ok(
        d.path(),
        &[
            "img",
            "data/manual/assets/screen.png",
            "--format",
            "webp",
            "--max-dim",
            "50",
            "--backup",
            "backups",
            "--rewrite-links",
            "--json",
        ],
    );
    assert_eq!(
        fs::read(d.path().join("backups/0000-screen.png")).unwrap(),
        original
    );
    assert!(d.path().join("data/manual/assets/screen.webp").is_file());
    assert!(
        fs::read_to_string(d.path().join("data/manual/30_image.md"))
            .unwrap()
            .contains("./assets/screen.webp")
    );
}

#[test]
fn tracker_reports_scope_and_link_label_drift() {
    let d = project();
    put(
        d.path(),
        "data/tasks/2026-09-06-cli/subtasks/010_next.md",
        "---\ntitle: Next\nstatus: superseded\n---\nNo destination recorded.\n",
    );
    put(
        d.path(),
        "data/tasks/2026-09-06-cli/issue.md",
        "[020 Next](./subtasks/010_next.md)\n",
    );
    let report = ok(d.path(), &["check", "issues", "--json"]);
    let warnings = report["warnings"].to_string();
    assert!(warnings.contains("ordering label"));
    assert!(warnings.contains("Superseded scope"));
}

#[test]
fn update_preferences_and_shell_init_need_no_project() {
    let d = tempfile::tempdir().unwrap();
    let run = |args: &[&str]| {
        Command::new(BIN)
            .args(args)
            .current_dir(d.path())
            .env("AGENTKS_UPDATE_DIR", d.path().join("state"))
            .env_remove("AGENTKS_AUTO_UPDATE")
            .output()
            .unwrap()
    };
    for (args, enabled) in [
        (vec!["update", "--disable", "--json"], false),
        (vec!["update", "--enable", "--json"], true),
    ] {
        let out = run(&args);
        assert!(out.status.success());
        let v: Value = serde_json::from_slice(&out.stdout).unwrap();
        assert_eq!(v["automaticUpdates"], enabled);
    }
    assert!(run(&["update", "--pin", "0.1.0"]).status.success());
    let v: Value = serde_json::from_slice(&run(&["update", "--status", "--json"]).stdout).unwrap();
    assert_eq!(v["pin"], "0.1.0");
    assert_eq!(v["cooldownHours"], 5);
    assert_eq!(v["automaticUpdates"], false);
    assert!(run(&["update", "--unpin"]).status.success());
    assert_eq!(run(&["update", "--pin", "bad"]).status.code(), Some(2));
    assert_eq!(
        run(&["update", "--disable", "--check"]).status.code(),
        Some(2)
    );
    for shell in ["bash", "zsh", "fish", "powershell"] {
        let out = run(&["init", shell, "--json"]);
        assert!(out.status.success());
        let v: Value = serde_json::from_slice(&out.stdout).unwrap();
        assert!(
            v["script"]
                .as_str()
                .unwrap()
                .contains("update --background")
        );
    }
}

#[test]
fn ordinary_commands_never_start_updates_and_background_obeys_cooldown() {
    let d = project();
    let state = d.path().join("state");
    let exe = d.path().join(if cfg!(windows) {
        "copied.exe"
    } else {
        "copied"
    });
    // Avoid a writable executable handle during parallel subprocess tests.
    fs::hard_link(BIN, &exe)
        .or_else(|_| fs::copy(BIN, &exe).map(|_| ()))
        .unwrap();
    let run = |args: &[&str]| {
        Command::new(&exe)
            .args(args)
            .current_dir(d.path())
            .env("AGENTKS_UPDATE_DIR", &state)
            .env_remove("AGENTKS_AUTO_UPDATE")
            .output()
            .unwrap()
    };
    assert!(run(&["overview", "--json"]).status.success());
    assert!(!state.exists());
    assert!(run(&["update", "--disable"]).status.success());
    let out = run(&["update", "--background"]);
    assert!(out.status.success());
    assert!(out.stdout.is_empty() && out.stderr.is_empty());
    assert!(!state.join("state.json").exists());
    assert!(run(&["update", "--enable"]).status.success());
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    put(
        d.path(),
        "state/state.json",
        &json!({"checkedAt":now,"available":null,"error":null}).to_string(),
    );
    let before = fs::read(state.join("state.json")).unwrap();
    let out = run(&["update", "--background"]);
    assert!(out.status.success());
    assert!(out.stdout.is_empty() && out.stderr.is_empty());
    assert_eq!(fs::read(state.join("state.json")).unwrap(), before);
}
