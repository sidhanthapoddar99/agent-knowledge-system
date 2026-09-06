use crate::{args::Args, context::Context, util::*};
use anyhow::{Result, bail};
use serde_json::json;
use std::{
    fs,
    ops::Range,
    path::{Path, PathBuf},
};
#[derive(Debug)]
pub struct Link {
    pub target: String,
    pub range: Range<usize>,
    pub label: Option<Range<usize>>,
    pub line: usize,
}
fn blank(bytes: &mut [u8]) {
    for b in bytes {
        if *b != b'\n' && *b != b'\r' {
            *b = b' ';
        }
    }
}
pub fn prose(raw: &str) -> String {
    let mut bytes = raw.as_bytes().to_vec();
    let fence = crate::regex!(r"^ {0,3}(`{3,}|~{3,})");
    let mut open: Option<(u8, usize)> = None;
    let mut offset = 0;
    for line in raw.split_inclusive('\n') {
        let marker = fence
            .captures(line)
            .map(|c| (c[1].as_bytes()[0], c[1].len()));
        if let Some((ch, n)) = open {
            blank(&mut bytes[offset..offset + line.len()]);
            if marker.is_some_and(|(c, len)| c == ch && len >= n) {
                open = None;
            }
        } else if let Some(m) = marker {
            open = Some(m);
            blank(&mut bytes[offset..offset + line.len()]);
        }
        offset += line.len();
    }
    let scanned = String::from_utf8(bytes.clone()).unwrap();
    let ticks = crate::regex!("`+");
    let boundary = crate::regex!(
        r"\n[ \t]{0,3}(?:[ \t]*\r?\n|>|[-*+][ \t]|\d{1,9}[.)][ \t]|#{1,6}[ \t]|[=\-*_]{2,}[ \t\r]*(?:\n|$))"
    );
    let runs = ticks.find_iter(&scanned).collect::<Vec<_>>();
    let mut cursor = 0;
    for (i, start) in runs.iter().enumerate() {
        if start.start() < cursor {
            continue;
        }
        let limit = boundary
            .find_at(&scanned, start.start())
            .map(|m| m.start())
            .unwrap_or(scanned.len());
        if let Some(end) = runs
            .iter()
            .skip(i + 1)
            .take_while(|m| m.start() < limit)
            .find(|m| m.len() == start.len())
        {
            cursor = end.end();
            blank(&mut bytes[start.start()..end.end()]);
        }
    }
    String::from_utf8(bytes).unwrap()
}
pub fn each(raw: &str) -> Vec<Link> {
    let scanned = prose(raw);
    let re = crate::regex!(
        r#"!?\[([^\]]*)\]\((<[^>\n]+>|[^)\s]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)"#,
    );
    let mut out = vec![];
    for c in re.captures_iter(&scanned) {
        let m = c.get(2).unwrap();
        let mut range = m.range();
        if scanned[range.clone()].starts_with('<') {
            range.start += 1;
            range.end -= 1;
        }
        out.push(Link {
            target: raw[range.clone()].to_owned(),
            range,
            label: Some(c.get(1).unwrap().range()),
            line: raw[..c.get(0).unwrap().start()]
                .bytes()
                .filter(|b| *b == b'\n')
                .count()
                + 1,
        });
    }
    // Reference definitions participate in moves and checks too.
    let defs = crate::regex!(r"(?m)^ {0,3}\[[^\]\n]+\]:[ \t]*(<[^>\n]+>|\S+)");
    for c in defs.captures_iter(&scanned) {
        let m = c.get(1).unwrap();
        let mut range = m.range();
        if scanned[range.clone()].starts_with('<') {
            range.start += 1;
            range.end -= 1;
        }
        out.push(Link {
            target: raw[range.clone()].to_owned(),
            range,
            label: None,
            line: raw[..m.start()].bytes().filter(|b| *b == b'\n').count() + 1,
        });
    }
    out.sort_by_key(|l| l.range.start);
    out
}
pub fn external(target: &str) -> bool {
    target.is_empty()
        || target.starts_with('#')
        || target.starts_with("//")
        || crate::regex!(r"(?i)^[a-z][a-z0-9+.-]*:").is_match(target)
}
pub fn split(target: &str) -> (&str, &str) {
    let n = target.find(['#', '?']).unwrap_or(target.len());
    (&target[..n], &target[n..])
}
pub fn decode(s: &str) -> String {
    let b = s.as_bytes();
    let mut out = vec![];
    let mut i = 0;
    while i < b.len() {
        if b[i] == b'%'
            && i + 2 < b.len()
            && b[i + 1].is_ascii_hexdigit()
            && b[i + 2].is_ascii_hexdigit()
            && let Ok(v) = u8::from_str_radix(&s[i + 1..i + 3], 16)
        {
            out.push(v);
            i += 3;
            continue;
        }
        out.push(b[i]);
        i += 1;
    }
    String::from_utf8(out).unwrap_or_else(|_| s.to_owned())
}
pub fn ordering(path: &Path) -> String {
    let mut segments = path
        .components()
        .map(|c| c.as_os_str().to_string_lossy().into_owned())
        .collect::<Vec<_>>();
    if segments.last().is_some_and(|s| s == "00_index.md") {
        segments.pop();
    }
    let re = crate::regex!(r"^(\d{2,5})[_-]");
    let mut labels = vec![];
    for s in segments.iter().rev() {
        if let Some(c) = re.captures(s) {
            labels.push(c[1].to_owned());
        } else {
            break;
        }
    }
    labels.reverse();
    labels.join("/")
}
fn mapped(p: &Path, moves: &[(PathBuf, PathBuf)]) -> PathBuf {
    let physical_path = physical(p).ok();
    for (from, to) in moves {
        if let Ok(rest) = p.strip_prefix(from) {
            return to.join(rest);
        }
        if physical_path
            .as_ref()
            .is_some_and(|p| physical(from).is_ok_and(|from| *p == from))
        {
            return physical(to).unwrap_or_else(|_| to.to_owned());
        }
    }
    p.to_owned()
}

pub fn rewritten(
    raw: &str,
    old_file: &Path,
    new_file: &Path,
    moves: &[(PathBuf, PathBuf)],
) -> (String, usize) {
    let mut edits: Vec<(Range<usize>, String)> = vec![];
    let order_re = crate::regex!(r"^(\d{2,5}(?:/\d{2,5})*)(\s+)(\S[\s\S]*)$");
    let mut count = 0;
    for l in each(raw) {
        if external(&l.target) || l.target.starts_with('/') {
            continue;
        }
        let (part, suffix) = split(&l.target);
        let old = normalize(&old_file.parent().unwrap().join(decode(part)));
        let new = mapped(&old, moves);
        if old == new && old_file == new_file {
            continue;
        }
        let target = rel(&new, new_file.parent().unwrap());
        let target = format!(
            "{}{}{}",
            if target.starts_with('.') { "" } else { "./" },
            target.replace('%', "%25").replace(' ', "%20"),
            suffix
        );
        if target != l.target {
            edits.push((l.range, target));
            count += 1;
        }
        if let Some(label) = l.label
            && let Some(c) = order_re.captures(&raw[label.clone()])
        {
            let ord = ordering(&new);
            let next = if ord.is_empty() {
                c[3].to_owned()
            } else {
                format!("{}{}{}", ord, &c[2], &c[3])
            };
            if next != raw[label.clone()] {
                edits.push((label, next));
            }
        }
    }
    edits.sort_by_key(|(r, _)| std::cmp::Reverse(r.start));
    let mut out = raw.to_owned();
    for (r, s) in edits {
        out.replace_range(r, &s);
    }
    (out, count)
}
pub fn move_path(a: &Args) -> Result<i32> {
    let root = if let Some(p) = a.get("root") {
        absolute(p)?
    } else {
        Context::resolve(a)?.content_root
    };
    let from = inside(&absolute(a.positional(0)?)?, &root)?;
    let to = inside(&absolute(a.positional(1)?)?, &root)?;
    if !from.exists() {
        bail!("Source does not exist: {}", from.display());
    }
    if from == root || to.starts_with(&from) {
        bail!("Cannot move a root or move a directory into itself");
    }
    if to.exists() {
        bail!("Destination already exists: {}", to.display());
    }
    let mut moves = vec![(from.clone(), to.clone())];
    if from.is_file()
        && from.extension().is_some_and(|e| {
            [
                "html",
                "mmd",
                "mermaid",
                "dot",
                "gv",
                "excalidraw",
                "drawio",
            ]
            .iter()
            .any(|v| e == *v)
        })
    {
        for ext in ["meta.json", "meta.jsonc"] {
            let s = from.with_extension(ext);
            if s.exists() {
                let d = to.with_extension(ext);
                if d.exists() {
                    bail!("Sidecar destination already exists: {}", d.display());
                }
                moves.push((s, d));
            }
        }
    }
    let mut edits = vec![];
    let mut count = 0;
    for p in walk(&root, &["md"])? {
        let raw = read(&p)?;
        let dest = mapped(&p, &moves);
        let (text, n) = rewritten(&raw, &p, &dest, &moves);
        if text != raw {
            count += n;
            edits.push((p, dest, raw, text));
        }
    }
    let output = json!({"dryRun":a.has("dry-run"),"moves":moves.iter().map(|(s,d)|json!({"from":s,"to":d})).collect::<Vec<_>>(),"editedFiles":edits.len(),"editedLinks":count});
    if a.has("dry-run") {
        return result(a, output);
    }
    // Plan every edit before mutation; restore text and moved paths on failure.
    for (old, _, raw, _) in &edits {
        if read(old)? != *raw {
            bail!("File changed while preparing move: {}", old.display());
        }
    }
    let mut moved = vec![];
    let mut written = vec![];
    let apply = (|| -> Result<()> {
        for (src, dst) in &moves {
            if let Some(p) = dst.parent() {
                fs::create_dir_all(p)?;
            }
            fs::rename(src, dst)?;
            moved.push((src, dst));
        }
        for (_, dest, raw, text) in &edits {
            atomic_write(dest, text)?;
            written.push((dest, raw));
        }
        Ok(())
    })();
    if let Err(e) = apply {
        for (p, raw) in written.iter().rev() {
            if let Err(restore) = atomic_write(p, raw) {
                eprintln!("Rollback failed for {}: {restore}", p.display());
            }
        }
        for (src, dst) in moved.iter().rev() {
            if let Err(restore) = fs::rename(dst, src) {
                eprintln!("Rollback failed for {}: {restore}", src.display());
            }
        }
        return Err(e);
    }
    result(a, output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn mapped_matches_equivalent_physical_paths() {
        let dir = tempfile::tempdir().unwrap();
        let assets = dir.path().join("manual/assets");
        fs::create_dir_all(&assets).unwrap();
        let source = assets.join("screen.png");
        let destination = assets.join("screen.webp");
        fs::write(&source, b"png").unwrap();
        fs::write(&destination, b"webp").unwrap();
        let lexical_source = assets.join("../assets/screen.png");

        assert!(source.strip_prefix(&lexical_source).is_err());
        assert_eq!(
            mapped(&source, &[(lexical_source, destination.clone())]),
            physical(&destination).unwrap()
        );
    }
}
