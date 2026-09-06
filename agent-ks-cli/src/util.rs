use anyhow::{Context, Result, bail};
use serde_json::{Value, json};
use std::{
    fs,
    io::Write,
    path::{Component, Path, PathBuf},
};
use walkdir::WalkDir;
pub fn emit(v: &Value) -> Result<()> {
    let stdout = std::io::stdout();
    let mut out = stdout.lock();
    serde_json::to_writer_pretty(&mut out, v)?;
    writeln!(out)?;
    Ok(())
}
pub fn read(p: &Path) -> Result<String> {
    fs::read_to_string(p).with_context(|| format!("Cannot read {}", p.display()))
}
pub fn json_file(p: &Path) -> Result<Value> {
    let p = prefer_jsonc(p);
    let text = read(&p)?;
    if let Ok(v) = serde_json::from_str(&text) {
        return Ok(v);
    }
    json5::from_str(&text).with_context(|| format!("Invalid JSON in {}", p.display()))
}
pub fn prefer_jsonc(p: &Path) -> PathBuf {
    let c = p.with_extension("jsonc");
    if c.is_file() { c } else { p.to_owned() }
}
pub fn frontmatter(text: &str) -> Result<(Value, &str)> {
    let t = text.trim_start_matches('\u{feff}');
    let Some((first, rest)) = t.split_once('\n') else {
        return Ok((json!({}), text));
    };
    if first.trim_end_matches('\r') != "---" {
        return Ok((json!({}), text));
    }
    let mut offset = 0;
    for line in rest.split_inclusive('\n') {
        if line.trim_end_matches(['\r', '\n']) == "---" {
            let fm = serde_yaml::from_str::<Value>(&rest[..offset])
                .context("Invalid YAML frontmatter")?;
            return Ok((
                if fm.is_null() { json!({}) } else { fm },
                &rest[offset + line.len()..],
            ));
        }
        offset += line.len();
    }
    bail!("Unclosed YAML frontmatter")
}
pub fn metadata(p: &Path) -> Result<Value> {
    if p.extension().is_some_and(|e| e == "md") {
        Ok(frontmatter(&read(p)?)?.0)
    } else {
        let side = p.with_extension("meta.json");
        if side.is_file() || side.with_extension("jsonc").is_file() {
            json_file(&side)
        } else {
            Ok(json!({}))
        }
    }
}
pub fn normalize(p: &Path) -> PathBuf {
    let mut out = PathBuf::new();
    for c in p.components() {
        match c {
            Component::CurDir => {}
            Component::ParentDir => {
                out.pop();
            }
            _ => out.push(c),
        }
    }
    out
}
pub fn absolute(p: impl AsRef<Path>) -> Result<PathBuf> {
    let p = p.as_ref();
    Ok(normalize(&if p.is_absolute() {
        p.to_owned()
    } else {
        std::env::current_dir()?.join(p)
    }))
}
// Resolve existing ancestors too, so a symlink cannot hide a write outside a scope.
pub fn physical(p: &Path) -> Result<PathBuf> {
    if p.exists() {
        return Ok(p.canonicalize()?);
    }
    let parent = p.parent().context("Path has no parent")?;
    Ok(physical(parent)?.join(p.file_name().context("Path has no filename")?))
}
pub fn inside(p: &Path, root: &Path) -> Result<PathBuf> {
    let p = physical(&normalize(p))?;
    let root = physical(root)?;
    if !p.starts_with(&root) {
        bail!("Path {} is outside {}", p.display(), root.display());
    }
    Ok(p)
}
pub fn rel(p: &Path, base: &Path) -> String {
    pathdiff::diff_paths(p, base)
        .unwrap_or_else(|| p.to_owned())
        .to_string_lossy()
        .replace('\\', "/")
}
pub fn display(p: &Path) -> String {
    rel(p, &std::env::current_dir().unwrap_or_default())
}
pub fn children(p: &Path) -> Result<Vec<PathBuf>> {
    let mut out = fs::read_dir(p)
        .with_context(|| format!("Cannot list {}", p.display()))?
        .map(|e| e.map(|e| e.path()))
        .collect::<std::io::Result<Vec<_>>>()?;
    out.sort_by_key(|p| (prefix(p).unwrap_or(usize::MAX), p.clone()));
    Ok(out)
}
pub fn walk(root: &Path, extensions: &[&str]) -> Result<Vec<PathBuf>> {
    if !root.exists() {
        bail!("Directory not found: {}", root.display());
    }
    let mut out = Vec::new();
    for e in WalkDir::new(root)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            e.depth() == 0 || {
                let n = e.file_name().to_string_lossy();
                !n.starts_with('.')
                    && !["node_modules", "assets", "releases", "target"].contains(&n.as_ref())
            }
        })
    {
        let e = e?;
        if e.file_type().is_file()
            && e.path()
                .extension()
                .is_some_and(|x| extensions.iter().any(|v| x == *v))
        {
            out.push(e.into_path());
        }
    }
    out.sort();
    Ok(out)
}
pub fn optional_walk(root: &Path, extensions: &[&str]) -> Result<Vec<PathBuf>> {
    if !root.exists() {
        Ok(vec![])
    } else {
        walk(root, extensions)
    }
}
pub fn prefix(p: &Path) -> Option<usize> {
    let n = p.file_name()?.to_str()?;
    let (v, _) = n.split_once(['_', '-'])?;
    if !(2..=5).contains(&v.len()) || !v.bytes().all(|b| b.is_ascii_digit()) {
        return None;
    }
    v.parse().ok()
}
pub fn title(p: &Path) -> Result<String> {
    Ok(metadata(p)?["title"]
        .as_str()
        .map(str::to_owned)
        .unwrap_or_else(|| {
            p.file_stem()
                .unwrap_or_default()
                .to_string_lossy()
                .into_owned()
        }))
}
pub fn strings(v: &Value) -> Vec<String> {
    match v {
        Value::String(s) if !s.is_empty() => vec![s.clone()],
        Value::Array(a) => a
            .iter()
            .filter_map(|x| x.as_str().map(str::to_owned))
            .collect(),
        _ => vec![],
    }
}
pub fn create(p: &Path, text: &str) -> Result<()> {
    if let Some(parent) = p.parent() {
        fs::create_dir_all(parent)?;
    }
    let mut file = fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(p)
        .with_context(|| format!("Cannot create {} (already exists?)", p.display()))?;
    file.write_all(text.as_bytes())?;
    Ok(())
}
pub fn atomic_write(p: &Path, text: &str) -> Result<()> {
    let temp = p.with_file_name(format!(
        ".{}.{}.tmp",
        p.file_name().unwrap_or_default().to_string_lossy(),
        std::process::id()
    ));
    create(&temp, text)?;
    if let Ok(meta) = fs::metadata(p) {
        fs::set_permissions(&temp, meta.permissions())?;
    }
    if let Err(e) = fs::rename(&temp, p) {
        let _ = fs::remove_file(&temp);
        return Err(e.into());
    }
    Ok(())
}
pub fn result(a: &crate::args::Args, value: Value) -> Result<i32> {
    let empty = value.as_array().is_some_and(Vec::is_empty) || value.is_null();
    if a.has("json") {
        emit(&value)?;
    } else if let Some(rows) = value.as_array() {
        for row in rows {
            if let Some(s) = row.as_str() {
                println!("{s}");
            } else {
                println!("{}", serde_json::to_string(row)?);
            }
        }
    } else {
        emit(&value)?;
    }
    Ok(if empty { 1 } else { 0 })
}

/// Compile each constant expression once, shared across all files in a command.
#[macro_export]
macro_rules! regex {
    ($pattern:literal $(,)?) => {{
        static RE: std::sync::LazyLock<regex::Regex> =
            std::sync::LazyLock::new(|| regex::Regex::new($pattern).expect("constant regex"));
        &*RE
    }};
}
