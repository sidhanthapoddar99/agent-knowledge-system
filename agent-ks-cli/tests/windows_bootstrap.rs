#![cfg(windows)]
use std::{fs, path::Path, process::Command};

#[test]
fn powershell_bootstrap_and_installer_parse() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
    for file in ["scripts/bootstrap.ps1", "agent-ks-cli/install.ps1"] {
        let output = Command::new("powershell.exe")
            .args(["-NoProfile", "-Command", "$tokens=$null; $errors=$null; [System.Management.Automation.Language.Parser]::ParseFile($env:TEST_SCRIPT,[ref]$tokens,[ref]$errors) | Out-Null; if ($errors.Count) { $errors | Out-String | Write-Error; exit 1 }"])
            .env("TEST_SCRIPT", root.join(file))
            .output().unwrap();
        assert!(
            output.status.success(),
            "{file}: {}",
            String::from_utf8_lossy(&output.stderr)
        );
    }
}

#[test]
fn windows_bootstrap_forwards_config_and_exit_code() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
    let d = tempfile::tempdir().unwrap();
    fs::create_dir_all(d.path().join("scripts")).unwrap();
    fs::create_dir_all(d.path().join("bin")).unwrap();
    fs::copy(
        root.join("scripts/bootstrap.ps1"),
        d.path().join("scripts/bootstrap.ps1"),
    )
    .unwrap();
    fs::write(
        d.path().join(".env"),
        "CONFIG_DIR=first\nexport CONFIG_DIR=\"./content with spaces\" # comment\n",
    )
    .unwrap();
    fs::write(d.path().join("bin/agent-ks.cmd"), "@echo off\r\necho %~1\r\necho %~2\r\necho %~3\r\necho %~4\r\necho %~6\r\necho %~7\r\nexit /b 7\r\n").unwrap();
    let output = Command::new("powershell.exe")
        .args(["-NoProfile", "-ExecutionPolicy", "Bypass", "-File"])
        .arg(d.path().join("scripts/bootstrap.ps1"))
        .args(["stop", "preview"])
        .env_remove("CONFIG_DIR")
        .env(
            "PATH",
            format!(
                "{};{}",
                d.path().join("bin").display(),
                std::env::var("PATH").unwrap()
            ),
        )
        .output()
        .unwrap();
    assert_eq!(
        output.status.code(),
        Some(7),
        "{}",
        String::from_utf8_lossy(&output.stderr)
    );
    let text = String::from_utf8_lossy(&output.stdout).replace("\r\n", "\n");
    assert_eq!(
        text.trim(),
        "start\n--config-dir\n./content with spaces\n--framework-dir\nstop\npreview"
    );
}
