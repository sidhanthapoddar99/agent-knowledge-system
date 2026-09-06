use crate::{
    args::{Args, usage},
    util::{atomic_write, read, result},
};
use anyhow::{Context, Result, anyhow, bail};
use fs2::FileExt;
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sha2::{Digest, Sha256};
use std::{
    fs::{self, File, OpenOptions},
    io::{Cursor, Read},
    path::{Path, PathBuf},
    process::{Command, Stdio},
    time::{Duration, SystemTime, UNIX_EPOCH},
};

const REPO: &str = "sidhanthapoddar99/agent-knowledge-system";
const COOLDOWN: u64 = 5 * 60 * 60;
const MAX_BINARY: u64 = 64 * 1024 * 1024;
const MAX_API: u64 = 8 * 1024 * 1024;
const MAX_REF: u64 = 64 * 1024;
const MAX_MANIFEST: u64 = 1024 * 1024;
const CURRENT: &str = env!("CARGO_PKG_VERSION");
#[derive(Serialize, Deserialize)]
#[serde(default)]
struct Settings {
    enabled: bool,
    pin: Option<String>,
}
impl Default for Settings {
    fn default() -> Self {
        Self {
            enabled: true,
            pin: None,
        }
    }
}
#[derive(Default, Serialize, Deserialize)]
#[serde(default, rename_all = "camelCase")]
struct State {
    checked_at: u64,
    available: Option<String>,
    error: Option<String>,
}
fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}
fn state_dir() -> Result<PathBuf> {
    if let Some(p) = std::env::var_os("AGENTKS_UPDATE_DIR") {
        if p.is_empty() {
            bail!("AGENTKS_UPDATE_DIR must not be empty");
        }
        return Ok(PathBuf::from(p));
    }
    #[cfg(windows)]
    let base = std::env::var_os("LOCALAPPDATA").map(PathBuf::from);
    #[cfg(not(windows))]
    let base = std::env::var_os("XDG_STATE_HOME")
        .filter(|p| !p.is_empty())
        .map(PathBuf::from)
        .or_else(|| std::env::var_os("HOME").map(|h| PathBuf::from(h).join(".local/state")));
    Ok(base
        .context("Cannot locate user update state; set AGENTKS_UPDATE_DIR")?
        .join("agent-ks"))
}
fn load<T: for<'a> Deserialize<'a> + Default>(p: &Path) -> Result<T> {
    if !p.exists() {
        return Ok(T::default());
    }
    serde_json::from_str(&read(p)?)
        .with_context(|| format!("Invalid update state in {}", p.display()))
}
fn save(p: &Path, v: &impl Serialize) -> Result<()> {
    fs::create_dir_all(p.parent().unwrap())?;
    atomic_write(p, &(serde_json::to_string_pretty(v)? + "\n"))
}
fn lock(dir: &Path) -> Result<Option<File>> {
    fs::create_dir_all(dir)?;
    let file = OpenOptions::new()
        .create(true)
        .truncate(false)
        .read(true)
        .write(true)
        .open(dir.join("update.lock"))?;
    match file.try_lock_exclusive() {
        Ok(()) => Ok(Some(file)),
        Err(e)
            if e.kind() == std::io::ErrorKind::WouldBlock
                || e.raw_os_error() == fs2::lock_contended_error().raw_os_error() =>
        {
            Ok(None)
        }
        Err(e) => Err(e.into()),
    }
}
fn version(s: &str) -> Option<(u64, u64, u64)> {
    let parts = s.split('.').collect::<Vec<_>>();
    if parts.len() != 3
        || parts
            .iter()
            .any(|s| s.is_empty() || !s.bytes().all(|b| b.is_ascii_digit()))
    {
        return None;
    }
    Some((
        parts[0].parse().ok()?,
        parts[1].parse().ok()?,
        parts[2].parse().ok()?,
    ))
}
fn select_release(v: &Value) -> Result<Option<String>> {
    let releases = v
        .as_array()
        .context("GitHub release response must be an array")?;
    Ok(releases
        .iter()
        .filter(|r| r["draft"] != true && r["prerelease"] != true)
        .filter(|r| r["published_at"].as_str().is_some_and(|v| !v.is_empty()))
        .filter_map(|r| r["tag_name"].as_str()?.strip_prefix("agent-ks-cli-v"))
        .filter_map(|s| version(s).map(|v| (v, s)))
        .max_by_key(|(v, _)| *v)
        .map(|(_, s)| s.to_owned()))
}
fn bounded(mut reader: impl Read, max: u64) -> Result<Vec<u8>> {
    let mut data = Vec::new();
    reader.by_ref().take(max + 1).read_to_end(&mut data)?;
    if data.len() as u64 > max {
        bail!("Update response exceeds size limit");
    }
    Ok(data)
}
fn fetch(url: &str, max: u64) -> Result<Vec<u8>> {
    let agent: ureq::Agent = ureq::Agent::config_builder()
        .timeout_global(Some(Duration::from_secs(45)))
        .https_only(true)
        .build()
        .into();
    let mut response = agent
        .get(url)
        .header(
            "User-Agent",
            concat!("agent-ks/", env!("CARGO_PKG_VERSION")),
        )
        .header("Accept", "application/vnd.github+json")
        .call()
        .with_context(|| format!("Could not download {url}"))?;
    bounded(response.body_mut().as_reader(), max)
}
fn ref_object(v: &Value, expected_ref: Option<&str>) -> Result<(String, String)> {
    if let Some(expected) = expected_ref
        && v["ref"].as_str() != Some(expected)
    {
        bail!("Git ref response did not match {expected}");
    }
    let object = v["object"]
        .as_object()
        .context("Git ref response needs an object")?;
    let kind = object
        .get("type")
        .and_then(Value::as_str)
        .context("Git ref object needs a type")?;
    let sha = object
        .get("sha")
        .and_then(Value::as_str)
        .context("Git ref object needs a SHA")?;
    if sha.len() != 40 || !sha.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        bail!("Git ref object needs a full commit SHA");
    }
    Ok((kind.to_owned(), sha.to_ascii_lowercase()))
}
fn manifest_version(data: &[u8]) -> Result<String> {
    let text = std::str::from_utf8(data).context("CLI manifest must be UTF-8")?;
    let mut package = false;
    for line in text.lines() {
        let line = line.trim();
        if line.starts_with('[') {
            package = line == "[package]";
            continue;
        }
        if package
            && let Some((key, value)) = line.split_once('=')
            && key.trim() == "version"
        {
            let value = value.trim();
            let value = value
                .strip_prefix('"')
                .and_then(|value| value.strip_suffix('"'))
                .context("CLI package version must be a quoted string")?;
            if version(value).is_none() {
                bail!("CLI package version must be stable X.Y.Z");
            }
            return Ok(value.to_owned());
        }
    }
    bail!("CLI manifest has no package version")
}
fn validate_release(v: &Value, tag: &str, platform_asset: &str) -> Result<()> {
    if v["tag_name"].as_str() != Some(tag)
        || v["draft"] == true
        || v["prerelease"] == true
        || v["published_at"]
            .as_str()
            .is_none_or(|value| value.is_empty())
    {
        bail!("Numbered CLI release is missing, draft, prerelease, or unpublished");
    }
    let assets = v["assets"]
        .as_array()
        .context("Numbered CLI release needs an asset list")?;
    for required in [platform_asset, "SHA256SUMS"] {
        let matching = assets
            .iter()
            .filter(|entry| entry["name"].as_str() == Some(required))
            .collect::<Vec<_>>();
        if matching.len() != 1
            || matching[0]["state"].as_str() != Some("uploaded")
            || matching[0]["size"].as_u64().unwrap_or(0) == 0
        {
            bail!("Numbered CLI release needs one uploaded {required} asset");
        }
    }
    Ok(())
}
fn tag_commit(tag: &str, get: &impl Fn(&str, u64) -> Result<Vec<u8>>) -> Result<String> {
    let url = format!("https://api.github.com/repos/{REPO}/git/ref/tags/{tag}");
    let value: Value = serde_json::from_slice(&get(&url, MAX_REF)?)?;
    let (mut kind, mut sha) = ref_object(&value, Some(&format!("refs/tags/{tag}")))?;
    for _ in 0..5 {
        match kind.as_str() {
            "commit" => return Ok(sha),
            "tag" => {
                let url = format!("https://api.github.com/repos/{REPO}/git/tags/{sha}");
                let value: Value = serde_json::from_slice(&get(&url, MAX_REF)?)?;
                (kind, sha) = ref_object(&value, None)?;
            }
            _ => bail!("Numbered CLI tag must resolve to a commit"),
        }
    }
    bail!("Numbered CLI tag dereference exceeds five objects")
}
fn latest_from_alias(get: &impl Fn(&str, u64) -> Result<Vec<u8>>) -> Result<String> {
    let alias_url = format!("https://api.github.com/repos/{REPO}/git/ref/tags/cli-latest");
    let alias: Value = serde_json::from_slice(&get(&alias_url, MAX_REF)?)?;
    let (kind, commit) = ref_object(&alias, Some("refs/tags/cli-latest"))?;
    if kind != "commit" {
        bail!("cli-latest must be a lightweight commit tag");
    }

    let manifest_url =
        format!("https://raw.githubusercontent.com/{REPO}/{commit}/agent-ks-cli/Cargo.toml");
    let release = manifest_version(&get(&manifest_url, MAX_MANIFEST)?)?;
    let tag = format!("agent-ks-cli-v{release}");
    let release_url = format!("https://api.github.com/repos/{REPO}/releases/tags/{tag}");
    let release_data: Value = serde_json::from_slice(&get(&release_url, MAX_API)?)?;
    validate_release(&release_data, &tag, &asset()?)?;
    if tag_commit(&tag, get)? != commit {
        bail!("cli-latest and its numbered stable release target different commits");
    }
    Ok(release)
}
fn latest_from_history(get: &impl Fn(&str, u64) -> Result<Vec<u8>>) -> Result<String> {
    let mut found: Option<String> = None;
    for page in 1..=10 {
        let url = format!("https://api.github.com/repos/{REPO}/releases?per_page=100&page={page}");
        let data: Value = serde_json::from_slice(&get(&url, MAX_API)?)?;
        if let Some(candidate) = select_release(&data)?
            && found
                .as_ref()
                .is_none_or(|old| version(&candidate) > version(old))
        {
            found = Some(candidate);
        }
        if data.as_array().unwrap().len() < 100 {
            return found.context("No stable CLI release has been published yet");
        }
    }
    bail!("Release history exceeds 1,000 entries; cannot reliably select the latest CLI release")
}
fn latest(get: &impl Fn(&str, u64) -> Result<Vec<u8>>) -> Result<String> {
    let alias = latest_from_alias(get).and_then(|candidate| {
        if version(&candidate) < version(CURRENT) {
            bail!("cli-latest points to {candidate}, older than installed {CURRENT}");
        }
        Ok(candidate)
    });
    match alias {
        Ok(candidate) => Ok(candidate),
        Err(alias_error) => latest_from_history(get).map_err(|history_error| {
            anyhow!(
                "cli-latest lookup failed: {alias_error:#}; release-history fallback failed: {history_error:#}"
            )
        }),
    }
}
fn asset() -> Result<String> {
    let arch = std::env::consts::ARCH;
    let platform = match (std::env::consts::OS, arch) {
        ("linux", "x86_64" | "aarch64") => "unknown-linux-musl.tar.gz",
        ("macos", "x86_64" | "aarch64") => "apple-darwin.tar.gz",
        ("windows", "x86_64") => "pc-windows-msvc.zip",
        _ => bail!("No prebuilt CLI update for this platform"),
    };
    Ok(format!("agent-ks-{arch}-{platform}"))
}
fn checked_archive(archive: &[u8], sums: &[u8], asset: &str) -> Result<Vec<u8>> {
    let text = std::str::from_utf8(sums)?;
    let matches = text
        .lines()
        .filter_map(|l| {
            let f = l.split_whitespace().collect::<Vec<_>>();
            (f.len() == 2 && f[1] == asset).then(|| f[0])
        })
        .collect::<Vec<_>>();
    if matches.len() != 1
        || matches[0].len() != 64
        || !matches[0].bytes().all(|b| b.is_ascii_hexdigit())
    {
        bail!("Missing or ambiguous checksum for {asset}");
    }
    if format!("{:x}", Sha256::digest(archive)) != matches[0].to_ascii_lowercase() {
        bail!("Checksum mismatch; existing binary preserved");
    }
    if asset.ends_with(".zip") {
        let mut zip = zip::ZipArchive::new(Cursor::new(archive))?;
        if zip.len() != 1 {
            bail!("Unexpected update archive contents");
        }
        let entry = zip.by_index(0)?;
        if entry.name() != "agent-ks.exe"
            || !entry.is_file()
            || entry.unix_mode().is_some_and(|m| m & 0o170000 == 0o120000)
        {
            bail!("Update ZIP must contain only a regular agent-ks.exe");
        }
        bounded(entry, MAX_BINARY)
    } else {
        let mut tar = tar::Archive::new(flate2::read::GzDecoder::new(Cursor::new(archive)));
        let mut data = None;
        for entry in tar.entries()? {
            let entry = entry?;
            if data.is_some()
                || entry.path()?.as_ref() != Path::new("agent-ks")
                || !entry.header().entry_type().is_file()
            {
                bail!("Update archive must contain only a regular agent-ks binary");
            }
            data = Some(bounded(entry, MAX_BINARY)?);
        }
        data.context("Empty update archive")
    }
}
fn candidate(release: &str, get: &impl Fn(&str, u64) -> Result<Vec<u8>>) -> Result<Vec<u8>> {
    if version(release).is_none() {
        return usage("Expected a stable version X.Y.Z");
    }
    let asset = asset()?;
    let base = format!("https://github.com/{REPO}/releases/download/agent-ks-cli-v{release}");
    let sums = get(&format!("{base}/SHA256SUMS"), 64 * 1024)?;
    let archive = get(&format!("{base}/{asset}"), MAX_BINARY)?;
    checked_archive(&archive, &sums, &asset)
}
fn verify_binary(p: &Path, release: &str) -> Result<()> {
    let capture = tempfile::tempfile()?;
    let mut child = Command::new(p)
        .arg("--version")
        .env("AGENTKS_AUTO_UPDATE", "0")
        .stdin(Stdio::null())
        .stdout(capture.try_clone()?)
        .stderr(Stdio::null())
        .spawn()
        .context("Downloaded binary could not run")?;
    let deadline = std::time::Instant::now() + Duration::from_secs(10);
    loop {
        if let Some(status) = child.try_wait()? {
            use std::io::{Seek, SeekFrom};
            let mut capture = capture;
            capture.seek(SeekFrom::Start(0))?;
            let out = bounded(capture, 1024)?;
            if !status.success()
                || String::from_utf8_lossy(&out).trim() != format!("agent-ks {release}")
            {
                bail!(
                    "Downloaded binary version does not match release; existing binary preserved"
                );
            }
            return Ok(());
        }
        if std::time::Instant::now() >= deadline {
            let _ = child.kill();
            let _ = child.wait();
            bail!("Downloaded binary version check timed out; existing binary preserved");
        }
        std::thread::sleep(Duration::from_millis(20));
    }
}
fn install(
    release: &str,
    get: &impl Fn(&str, u64) -> Result<Vec<u8>>,
    replace: impl FnOnce(&Path) -> Result<()>,
) -> Result<()> {
    let bytes = candidate(release, get)?;
    let temp = tempfile::tempdir()?;
    let file = temp.path().join(if cfg!(windows) {
        "agent-ks.exe"
    } else {
        "agent-ks"
    });
    fs::write(&file, bytes)?;
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&file, fs::Permissions::from_mode(0o755))?;
    }
    verify_binary(&file, release)?;
    replace(&file)
}
fn disabled() -> bool {
    std::env::var("AGENTKS_AUTO_UPDATE")
        .is_ok_and(|v| ["0", "false", "off"].contains(&v.to_ascii_lowercase().as_str()))
}
fn development(exe: &Path) -> bool {
    exe.ancestors().any(|p| {
        p.join("Cargo.toml").is_file() && p.file_name().is_some_and(|n| n == "agent-ks-cli")
    })
}
fn due(s: &State, t: u64) -> bool {
    s.checked_at == 0 || t < s.checked_at || t - s.checked_at >= COOLDOWN
}
// No network on the command's critical path, and no background output in agent pipes.
fn schedule(install_updates: bool) -> Result<()> {
    let exe = std::env::current_exe()?;
    #[cfg(windows)]
    if let Some(parent) = exe.parent()
        && let Ok(entries) = fs::read_dir(parent)
    {
        for entry in entries.flatten() {
            let name = entry.file_name();
            let name = name.to_string_lossy();
            if name.starts_with(".agent-ks-old-")
                && name.ends_with(".exe")
                && entry.file_type().is_ok_and(|t| t.is_file())
            {
                let _ = fs::remove_file(entry.path());
            }
        }
    }
    if disabled() || development(&exe) {
        return Ok(());
    }
    let dir = state_dir()?;
    let settings: Settings = load(&dir.join("settings.json"))?;
    if !settings.enabled || settings.pin.is_some() {
        return Ok(());
    }
    let Some(guard) = lock(&dir)? else {
        return Ok(());
    };
    let mut state: State = load(&dir.join("state.json"))?;
    if !due(&state, now()) {
        return Ok(());
    }
    state.checked_at = now();
    save(&dir.join("state.json"), &state)?;
    drop(guard);
    let mut command = Command::new(exe);
    command
        .arg(if install_updates {
            "__auto-update"
        } else {
            "__update-check"
        })
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    // Child receives the resolved directory even if its working directory changes.
    command.env("AGENTKS_UPDATE_DIR", &dir);
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        command.creation_flags(0x08000000);
    }
    command.spawn()?;
    Ok(())
}
fn check_and_apply(
    state: &mut State,
    install_updates: bool,
    get: &impl Fn(&str, u64) -> Result<Vec<u8>>,
    replace: impl FnOnce(&Path) -> Result<()>,
) {
    state.checked_at = now();
    let attempt = (|| -> Result<()> {
        let v = latest(get)?;
        state.available = Some(v.clone());
        if install_updates && version(&v) > version(CURRENT) {
            install(&v, get, replace)?;
        }
        Ok(())
    })();
    state.error = attempt.err().map(|e| e.to_string());
}
pub fn background(install_updates: bool) -> Result<i32> {
    let dir = state_dir()?;
    let Some(_guard) = lock(&dir)? else {
        return Ok(0);
    };
    let settings: Settings = load(&dir.join("settings.json"))?;
    if disabled() || !settings.enabled || settings.pin.is_some() {
        return Ok(0);
    }
    let mut state: State = load(&dir.join("state.json"))?;
    state.checked_at = now();
    let exe = std::env::current_exe()?;
    check_and_apply(&mut state, install_updates, &fetch, |p| replace_at(&exe, p));
    save(&dir.join("state.json"), &state)?;
    Ok(0)
}
pub fn run(a: &Args) -> Result<i32> {
    let controls = ["enable", "disable", "pin", "unpin", "status", "check"]
        .iter()
        .filter(|k| a.has(k))
        .count();
    if controls > 1 {
        return usage("Choose one of --check, --status, --enable, --disable, --pin or --unpin");
    }
    if a.has("background") {
        if a.has("json") || controls > usize::from(a.has("check")) {
            return usage("--background accepts only optional --check");
        }
        return schedule(!a.has("check")).map(|_| 0);
    }
    let dir = state_dir()?;
    if a.has("status") {
        let settings: Settings = load(&dir.join("settings.json"))?;
        let state: State = load(&dir.join("state.json"))?;
        return result(
            a,
            json!({"current":CURRENT,"automaticUpdates":settings.enabled&&!disabled()&&settings.pin.is_none(),"pin":settings.pin,"cooldownHours":5,"stateDir":dir,"state":state}),
        );
    }
    let Some(_guard) = lock(&dir)? else {
        bail!("Another update check or installation is running; try again shortly");
    };
    let mut settings: Settings = load(&dir.join("settings.json"))?;
    if ["enable", "disable", "pin", "unpin"]
        .iter()
        .any(|k| a.has(k))
    {
        if a.has("enable") {
            settings.enabled = true;
        }
        if a.has("disable") {
            settings.enabled = false;
        }
        if let Some(v) = a.get("pin") {
            if version(v).is_none() {
                return usage("--pin requires X.Y.Z");
            }
            settings.pin = Some(v.into());
        }
        if a.has("unpin") {
            settings.pin = None;
        }
        save(&dir.join("settings.json"), &settings)?;
        return result(
            a,
            json!({"automaticUpdates":settings.enabled,"pin":settings.pin,"cooldownHours":5}),
        );
    }
    let mut state: State = load(&dir.join("state.json"))?;
    let selected = settings
        .pin
        .clone()
        .map(Ok)
        .unwrap_or_else(|| latest(&fetch));
    state.checked_at = now();
    let selected = match selected {
        Ok(v) => {
            state.available = Some(v.clone());
            state.error = None;
            v
        }
        Err(e) => {
            state.error = Some(e.to_string());
            save(&dir.join("state.json"), &state)?;
            return Err(e);
        }
    };
    save(&dir.join("state.json"), &state)?;
    let available = if settings.pin.is_some() {
        selected != CURRENT
    } else {
        version(&selected) > version(CURRENT)
    };
    if a.has("check") || !available {
        return result(
            a,
            json!({"current":CURRENT,"latest":selected,"updateAvailable":available,"pinned":settings.pin,"installed":false}),
        );
    }
    let exe = std::env::current_exe()?;
    install(&selected, &fetch, |p| replace_at(&exe, p))?;
    result(
        a,
        json!({"previous":CURRENT,"current":selected,"installed":true,"executable":exe}),
    )
}

// Stage on the executable's filesystem before changing its path. Windows cannot
// overwrite a running EXE, so keep a recoverable backup while swapping names.
fn replace_at(exe: &Path, candidate: &Path) -> Result<()> {
    let parent = exe.parent().context("Executable has no parent directory")?;
    let mut stage = tempfile::Builder::new()
        .prefix(".agent-ks-update-")
        .tempfile_in(parent)?;
    std::io::copy(&mut File::open(candidate)?, stage.as_file_mut())?;
    stage
        .as_file()
        .set_permissions(exe.metadata()?.permissions())?;
    stage.as_file().sync_all()?;
    #[cfg(not(windows))]
    {
        stage
            .persist(exe)
            .map_err(|e| e.error)
            .context("Could not replace CLI; existing binary preserved")?;
    }
    #[cfg(windows)]
    {
        let backup = parent.join(format!(".agent-ks-old-{}.exe", std::process::id()));
        if backup.exists() {
            bail!("Update backup already exists: {}", backup.display());
        }
        fs::rename(exe, &backup)
            .context("Could not move running CLI; existing binary preserved")?;
        if let Err(e) = stage.persist(exe) {
            fs::rename(&backup, exe)
                .context("Could not restore previous CLI from update backup")?;
            return Err(e.error.into());
        }
        let _ = fs::remove_file(backup);
    }
    Ok(())
}
pub fn init(a: &Args) -> Result<i32> {
    let shell = a.positional(0)?;
    let exe = std::env::current_exe()?;
    let bin = exe
        .parent()
        .context("Executable has no parent")?
        .to_string_lossy();
    let quote = |s: &str| format!("'{}'", s.replace('\'', "'\"'\"'"));
    let path = exe.to_string_lossy();
    let script = match shell {
        "bash" | "zsh" => format!(
            "export PATH={}:\"$PATH\"\n{} update --background >/dev/null 2>&1\n",
            quote(&bin),
            quote(&path)
        ),
        "fish" => format!(
            "fish_add_path -- {}\n{} update --background >/dev/null 2>&1\n",
            quote(&bin),
            quote(&path)
        ),
        "powershell" => format!(
            "$env:PATH = '{}' + [IO.Path]::PathSeparator + $env:PATH\n& '{}' update --background *> $null\n",
            bin.replace('\'', "''"),
            path.replace('\'', "''")
        ),
        _ => return usage("init supports bash, zsh, fish and powershell"),
    };
    if a.has("json") {
        result(a, json!({"shell":shell,"script":script}))
    } else {
        print!("{script}");
        Ok(0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{cell::Cell, io::Write};
    fn tgz(name: &str, data: &[u8], kind: tar::EntryType) -> Vec<u8> {
        let mut archive = tar::Builder::new(flate2::write::GzEncoder::new(
            Vec::new(),
            flate2::Compression::default(),
        ));
        let mut h = tar::Header::new_gnu();
        h.set_size(data.len() as u64);
        h.set_mode(0o755);
        h.set_entry_type(kind);
        h.set_cksum();
        archive.append_data(&mut h, name, data).unwrap();
        archive.into_inner().unwrap().finish().unwrap()
    }
    fn sums(data: &[u8], name: &str) -> Vec<u8> {
        format!("{:x}  {name}\n", Sha256::digest(data)).into_bytes()
    }
    fn alias_response(
        url: &str,
        release: &str,
        commit: &str,
        tag_object: &str,
        platform_asset: &str,
    ) -> Option<Vec<u8>> {
        let tag = format!("agent-ks-cli-v{release}");
        let value = if url.ends_with("/git/ref/tags/cli-latest") {
            json!({"ref":"refs/tags/cli-latest","object":{"type":"commit","sha":commit}})
        } else if url.contains("raw.githubusercontent.com") {
            return Some(
                format!("[package]\nname = \"agent-ks\"\nversion = \"{release}\"\n").into_bytes(),
            );
        } else if url.ends_with(&format!("/releases/tags/{tag}")) {
            json!({
                "tag_name": tag,
                "draft": false,
                "prerelease": false,
                "published_at": "2026-09-06T00:00:00Z",
                "assets": [
                    {"name":platform_asset,"state":"uploaded","size":1},
                    {"name":"SHA256SUMS","state":"uploaded","size":1}
                ]
            })
        } else if url.ends_with(&format!("/git/ref/tags/{tag}")) {
            json!({"ref":format!("refs/tags/{tag}"),"object":{"type":"tag","sha":tag_object}})
        } else if url.ends_with(&format!("/git/tags/{tag_object}")) {
            json!({"object":{"type":"commit","sha":commit}})
        } else {
            return None;
        };
        Some(serde_json::to_vec(&value).unwrap())
    }
    #[test]
    fn release_selection_skips_other_streams_drafts_prereleases_and_uses_numeric_versions() {
        let releases = json!([
            {"tag_name":"agent-ks-engine-v99.0.0"}, {"tag_name":"agent-ks-cli-v999.0.0","draft":true},
            {"tag_name":"agent-ks-cli-v998.0.0","prerelease":true}, {"tag_name":"agent-ks-cli-v997.0.0-beta.1"},
            {"tag_name":"agent-ks-plugin-v99.0.0"}, {"tag_name":"agent-ks-cli-v2.9.0"},
            {"tag_name":"agent-ks-cli-v2.10.0","published_at":"2026-09-06T00:00:00Z"},
            {"tag_name":"agent-ks-cli-v1.0.0","published_at":"2026-09-05T00:00:00Z"}
        ]);
        assert_eq!(
            select_release(&releases).unwrap().as_deref(),
            Some("2.10.0")
        );
        assert!(version("1.2.3/evil").is_none());
        assert!(version("1.2").is_none());
        assert_eq!(
            latest(&|_, _| Ok(serde_json::to_vec(&releases).unwrap())).unwrap(),
            "2.10.0"
        );
        assert!(latest(&|_, _| Ok(b"[]".to_vec())).is_err());
    }
    #[test]
    fn alias_fast_path_resolves_version_and_validates_numbered_release() {
        let commit = "a".repeat(40);
        let tag_object = "b".repeat(40);
        let platform_asset = asset().unwrap();
        let history_calls = Cell::new(0);
        let get = |url: &str, _| {
            if let Some(response) =
                alias_response(url, "99.0.0", &commit, &tag_object, &platform_asset)
            {
                return Ok(response);
            }
            if url.contains("/releases?per_page=") {
                history_calls.set(history_calls.get() + 1);
            }
            bail!("unexpected URL: {url}")
        };
        assert_eq!(latest(&get).unwrap(), "99.0.0");
        assert_eq!(history_calls.get(), 0);
    }
    #[test]
    fn malformed_or_unsafe_alias_falls_back_to_stable_history() {
        let releases = json!([
            {"tag_name":"agent-ks-cli-v2.10.0","published_at":"2026-09-06T00:00:00Z"}
        ]);
        let get = |url: &str, _| {
            if url.ends_with("/git/ref/tags/cli-latest") {
                Ok(br#"{"ref":"refs/tags/cli-latest","object":{"type":"branch","sha":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"}}"#.to_vec())
            } else if url.contains("/releases?per_page=") {
                Ok(serde_json::to_vec(&releases).unwrap())
            } else {
                bail!("unexpected URL: {url}")
            }
        };
        assert_eq!(latest(&get).unwrap(), "2.10.0");
    }
    #[test]
    fn stale_alias_older_than_installed_falls_back_to_history() {
        let commit = "a".repeat(40);
        let tag_object = "b".repeat(40);
        let platform_asset = asset().unwrap();
        let releases = json!([
            {"tag_name":"agent-ks-cli-v0.1.2","published_at":"2026-09-06T00:00:00Z"}
        ]);
        let get = |url: &str, _| {
            if let Some(response) =
                alias_response(url, "0.1.1", &commit, &tag_object, &platform_asset)
            {
                Ok(response)
            } else if url.contains("/releases?per_page=") {
                Ok(serde_json::to_vec(&releases).unwrap())
            } else {
                bail!("unexpected URL: {url}")
            }
        };
        assert_eq!(CURRENT, "0.1.2");
        assert_eq!(latest(&get).unwrap(), "0.1.2");
    }
    #[test]
    fn alias_release_must_be_published_stable_with_required_assets() {
        let platform_asset = asset().unwrap();
        let invalid = json!({
            "tag_name":"agent-ks-cli-v1.2.3",
            "draft":false,
            "prerelease":true,
            "published_at":"2026-09-06T00:00:00Z",
            "assets":[
                {"name":platform_asset,"state":"uploaded","size":1},
                {"name":"SHA256SUMS","state":"uploaded","size":1}
            ]
        });
        assert!(validate_release(&invalid, "agent-ks-cli-v1.2.3", &platform_asset).is_err());
        let missing_checksum = json!({
            "tag_name":"agent-ks-cli-v1.2.3",
            "draft":false,
            "prerelease":false,
            "published_at":"2026-09-06T00:00:00Z",
            "assets":[{"name":platform_asset,"state":"uploaded","size":1}]
        });
        assert!(
            validate_release(&missing_checksum, "agent-ks-cli-v1.2.3", &platform_asset).is_err()
        );
    }
    #[test]
    fn download_integrity_failure_does_not_fall_back_to_an_older_release() {
        let commit = "a".repeat(40);
        let tag_object = "b".repeat(40);
        let platform_asset = asset().unwrap();
        let history_calls = Cell::new(0);
        let archive = b"corrupt archive".to_vec();
        let get = |url: &str, _| {
            if let Some(response) =
                alias_response(url, "99.0.0", &commit, &tag_object, &platform_asset)
            {
                return Ok(response);
            }
            if url.contains("/releases?per_page=") {
                history_calls.set(history_calls.get() + 1);
                return Ok(b"[]".to_vec());
            }
            if url.ends_with("SHA256SUMS") {
                return Ok(format!("{}  {platform_asset}\n", "0".repeat(64)).into_bytes());
            }
            if url.ends_with(&platform_asset) {
                return Ok(archive.clone());
            }
            bail!("unexpected URL: {url}")
        };
        let mut state = State::default();
        check_and_apply(&mut state, true, &get, |_| panic!("must not replace"));
        assert!(
            state
                .error
                .as_deref()
                .is_some_and(|error| error.contains("Checksum mismatch")),
            "{:?}",
            state.error
        );
        assert_eq!(history_calls.get(), 0);
    }
    #[test]
    fn cooldown_and_exclusive_lock() {
        let state = State {
            checked_at: 100,
            ..State::default()
        };
        assert!(!due(&state, 100 + COOLDOWN - 1));
        assert!(due(&state, 100 + COOLDOWN));
        assert!(due(&state, 99));
        let dir = tempfile::tempdir().unwrap();
        let first = lock(dir.path()).unwrap().unwrap();
        assert!(lock(dir.path()).unwrap().is_none());
        drop(first);
        assert!(lock(dir.path()).unwrap().is_some());
    }
    #[test]
    fn verify_archives_before_extracting() {
        let name = "agent-ks-x86_64-unknown-linux-musl.tar.gz";
        let good = tgz("agent-ks", b"binary", tar::EntryType::Regular);
        assert_eq!(
            checked_archive(&good, &sums(&good, name), name).unwrap(),
            b"binary"
        );
        assert!(checked_archive(&good, b"bad hash", name).is_err());
        let mut changed = good.clone();
        changed.push(0);
        assert!(checked_archive(&changed, &sums(&good, name), name).is_err());
        let unexpected = tgz("elsewhere", b"binary", tar::EntryType::Regular);
        assert!(checked_archive(&unexpected, &sums(&unexpected, name), name).is_err());
        let symlink = tgz("agent-ks", b"", tar::EntryType::Symlink);
        assert!(checked_archive(&symlink, &sums(&symlink, name), name).is_err());
        assert!(bounded(Cursor::new(b"too large"), 3).is_err());
    }
    #[test]
    fn windows_zip_validation() {
        let mut zip = zip::ZipWriter::new(Cursor::new(Vec::new()));
        zip.start_file("agent-ks.exe", zip::write::SimpleFileOptions::default())
            .unwrap();
        zip.write_all(b"exe").unwrap();
        let data = zip.finish().unwrap().into_inner();
        let name = "agent-ks-x86_64-pc-windows-msvc.zip";
        assert_eq!(
            checked_archive(&data, &sums(&data, name), name).unwrap(),
            b"exe"
        );
        let mut zip = zip::ZipWriter::new(Cursor::new(Vec::new()));
        zip.start_file("../agent-ks.exe", zip::write::SimpleFileOptions::default())
            .unwrap();
        zip.write_all(b"exe").unwrap();
        let data = zip.finish().unwrap().into_inner();
        assert!(checked_archive(&data, &sums(&data, name), name).is_err());
    }
    #[test]
    fn replacement_failure_preserves_old_file() {
        let d = tempfile::tempdir().unwrap();
        let exe = d.path().join("agent-ks");
        fs::write(&exe, b"old").unwrap();
        assert!(replace_at(&exe, &d.path().join("missing")).is_err());
        assert_eq!(fs::read(&exe).unwrap(), b"old");
        let next = d.path().join("new");
        fs::write(&next, b"new").unwrap();
        replace_at(&exe, &next).unwrap();
        assert_eq!(fs::read(exe).unwrap(), b"new");
    }
    #[test]
    fn background_failure_is_cached_and_check_only_never_installs() {
        let mut state = State::default();
        check_and_apply(&mut state, true, &|_, _| bail!("offline"), |_| {
            panic!("must not install")
        });
        assert_eq!(
            state.error.as_deref(),
            Some("cli-latest lookup failed: offline; release-history fallback failed: offline")
        );
        assert!(!due(&state, now()));
        check_and_apply(
            &mut state,
            false,
            &|url, _| {
                assert!(url.contains("api.github.com"));
                Ok(br#"[{"tag_name":"agent-ks-cli-v99.0.0","published_at":"2026-09-06T00:00:00Z"}]"#.to_vec())
            },
            |_| panic!("check-only must not install"),
        );
        assert!(state.error.is_none());
        assert_eq!(state.available.as_deref(), Some("99.0.0"));
    }
    #[cfg(unix)]
    #[test]
    fn automatic_update_downloads_verifies_and_replaces() {
        let d = tempfile::tempdir().unwrap();
        let exe = d.path().join("agent-ks");
        fs::write(&exe, b"old").unwrap();
        let script = b"#!/bin/sh\nprintf 'agent-ks 99.0.0\\n'\n";
        let asset = asset().unwrap();
        let archive = tgz("agent-ks", script, tar::EntryType::Regular);
        let checksums = sums(&archive, &asset);
        let get = |url: &str, _| {
            if url.contains("api.github.com") {
                Ok(br#"[{"tag_name":"agent-ks-cli-v99.0.0","published_at":"2026-09-06T00:00:00Z"}]"#.to_vec())
            } else if url.ends_with("SHA256SUMS") {
                assert!(url.contains("/releases/download/agent-ks-cli-v99.0.0/"));
                Ok(checksums.clone())
            } else {
                assert!(url.contains("/releases/download/agent-ks-cli-v99.0.0/"));
                Ok(archive.clone())
            }
        };
        let mut state = State::default();
        check_and_apply(&mut state, true, &get, |p| replace_at(&exe, p));
        assert!(state.error.is_none(), "{:?}", state.error);
        assert_eq!(fs::read(&exe).unwrap(), script);
        let bad = tgz(
            "agent-ks",
            b"#!/bin/sh\necho agent-ks 1.0.0\n",
            tar::EntryType::Regular,
        );
        let get = |url: &str, _| {
            if url.ends_with("SHA256SUMS") {
                Ok(sums(&bad, &asset))
            } else {
                Ok(bad.clone())
            }
        };
        assert!(install("99.0.0", &get, |p| replace_at(&exe, p)).is_err());
        assert_eq!(fs::read(exe).unwrap(), script);
    }
}
