use crate::{
    args::{Args, usage},
    context, issues,
    util::*,
};
use anyhow::{Context as _, Result, bail};
use serde_json::{Value, json};
use std::{
    fs,
    path::{Path, PathBuf},
};
pub fn template(name: &str) -> Result<&'static str> {
    Ok(match name {
        "subtask" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/subtask.md")
        }
        "plan-overview" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/plan-overview.md")
        }
        "plan-stage" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/plan-stage.md")
        }
        "log-index-lp" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/log-index-lp.md")
        }
        "log-index-rf" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/log-index-rf.md")
        }
        "log-index-au" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/log-index-au.md")
        }
        "log-index-re" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/log-index-re.md")
        }
        "log-index-it" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/log-index-it.md")
        }
        "log-index-wf" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/log-index-wf.md")
        }
        "log-round" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/log-round.md")
        }
        "comment" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/comment.md")
        }
        "log-index" => {
            include_str!("../../plugins/agent-ks/skills/agent-ks-cli/templates/log-index.md")
        }
        _ => bail!("Unknown embedded template {name}"),
    })
}
pub fn render(name: &str, fields: Value, lead: Option<&str>) -> Result<String> {
    let (_, body) = frontmatter(template(name)?)?;
    let mut body = body.trim().to_owned();
    if let Some(lead) = lead.filter(|s| !s.trim().is_empty()) {
        let end = body.find("\n# ").map(|n| n + 1).unwrap_or(body.len());
        body.replace_range(..end, &format!("{}\n\n", lead.trim()));
    }
    let mut fields = fields;
    fields
        .as_object_mut()
        .unwrap()
        .retain(|_, v| !v.is_null() && v != "" && v.as_array().is_none_or(|a| !a.is_empty()));
    Ok(format!(
        "---\n{}---\n\n{}\n",
        serde_yaml::to_string(&fields)?,
        body.trim()
    ))
}
fn slug(s: &str) -> Result<String> {
    let v = crate::regex!("[^a-z0-9]+")
        .replace_all(&s.to_lowercase(), "-")
        .trim_matches('-')
        .to_owned();
    if v.is_empty() {
        return usage("Name must contain letters or digits");
    }
    Ok(v)
}
fn group(base: &Path, raw: &str) -> Result<PathBuf> {
    let mut p = base.to_owned();
    let parts: Vec<_> = raw.split('/').filter(|s| !s.is_empty()).collect();
    if parts.len() > 4 {
        return usage("Grouping is limited to four levels");
    }
    let group_re = crate::regex!("[^a-z0-9_-]+");
    for s in parts {
        if s == "." || s == ".." || s.contains('\\') {
            return usage("Group must use folder names without traversal");
        }
        let clean = group_re
            .replace_all(&s.to_lowercase(), "-")
            .trim_matches('-')
            .to_owned();
        if clean.is_empty() {
            return usage("Empty group name");
        }
        p.push(clean);
    }
    inside(&p, base)
}
fn positions(p: &Path) -> Result<Vec<usize>> {
    if !p.exists() {
        return Ok(vec![]);
    }
    let mut ns = children(p)?
        .iter()
        .filter_map(|p| prefix(p))
        .collect::<Vec<_>>();
    ns.sort_unstable();
    Ok(ns)
}
fn next(p: &Path, step: usize, floor: usize) -> Result<usize> {
    Ok(positions(p)?
        .last()
        .map(|n| n + step)
        .unwrap_or(floor)
        .max(floor))
}
fn checked_prefix(a: &Args, default: usize, width: usize) -> Result<String> {
    if let Some(v) = a.get("prefix") {
        if !v.chars().all(|c| c.is_ascii_digit()) || v.len() > 5 || v.is_empty() {
            return usage("--prefix must be 1–5 digits");
        }
        Ok(format!("{:0width$}", v.parse::<usize>()?))
    } else {
        Ok(format!("{default:0width$}"))
    }
}
fn link(to: &Path, from: &Path) -> Result<String> {
    let text = title(to)?.replace(['[', ']'], "");
    let p = rel(to, from);
    Ok(format!(
        "[{text}]({}{})",
        if p.starts_with('.') { "" } else { "./" },
        p.replace(' ', "%20")
    ))
}
fn subtask_links(a: &Args, key: &str, issue: &Path, from: &Path) -> Result<Vec<String>> {
    a.csv(key)
        .iter()
        .map(|s| link(&issues::select_subtask(issue, s, from)?, from))
        .collect()
}
fn status(a: &Args) -> Result<&str> {
    let s = a.get("status").unwrap_or("open");
    if !issues::STATUSES.contains(&s) {
        return usage(format!("Unknown status {s}"));
    }
    Ok(s)
}
fn created(a: &Args, issue: &Path, p: &Path, mut extra: Value) -> Result<i32> {
    let o = extra.as_object_mut().unwrap();
    o.insert(
        "issue".into(),
        json!(issue.file_name().unwrap().to_string_lossy()),
    );
    o.insert("path".into(), json!(display(p)));
    if p.is_dir() {
        o.insert(
            "folder".into(),
            json!(p.file_name().unwrap().to_string_lossy()),
        );
    } else {
        o.insert(
            "file".into(),
            json!(p.file_name().unwrap().to_string_lossy()),
        );
    }
    if a.has("json") {
        emit(&extra)?;
    } else {
        println!("Created {}", display(p));
    }
    Ok(0)
}
fn set_state(a: &Args, root: &Path) -> Result<i32> {
    let id = a.positional(0)?;
    let state = a.positional(1)?;
    if !issues::STATUSES.contains(&state) {
        return usage(format!("Unknown status {state}"));
    }
    let direct = inside(&root.join(id), root)?;
    let p = if direct.is_file() && direct.extension().is_some_and(|e| e == "md") {
        direct
    } else {
        let dir = issues::issue(root, id)?;
        if let Some(sel) = a.get("subtask") {
            issues::select_subtask(&dir, sel, &dir)?
        } else {
            prefer_jsonc(&dir.join("settings.json"))
        }
    };
    let p = inside(&p, root)?;
    let original = read(&p)?;
    let new = if p.extension().is_some_and(|x| x == "md") {
        let (_, body) = frontmatter(&original)?;
        if body.len() == original.len() {
            bail!("No frontmatter in {}", p.display());
        }
        let end = original.len() - body.len();
        let fm = &original[..end];
        let re = crate::regex!(r"(?m)^status:[^\r\n]*");
        if re.is_match(fm) {
            format!("{}{}", re.replace(fm, format!("status: {state}")), body)
        } else {
            let close = fm.rfind("---").context("No closing delimiter")?;
            format!("{}status: {state}\n{}{}", &fm[..close], &fm[close..], body)
        }
    } else {
        let meta = json_file(&p)?;
        if !meta.is_object() {
            bail!("Settings must be an object");
        }
        // Use a string-aware top-level key scan to retain JSONC comments and layout.
        set_json_status(&original, state)?
    };
    atomic_write(&p, &new)?;
    if a.has("json") {
        emit(&json!({"path":display(&p),"status":state}))?;
    } else {
        println!("Set status: {state} in {}", display(&p));
    }
    Ok(0)
}
fn set_json_status(original: &str, value: &str) -> Result<String> {
    let re = crate::regex!(r#"(?m)("status"\s*:\s*)("(?:\\.|[^"\\])*"|null)"#);
    // Parse the complete document and confirm the matched value belongs to the top level.
    let parsed: Value = json5::from_str(original)?;
    if parsed.get("status").is_none() {
        bail!("Top-level status field is missing");
    }
    let mut depth = 0usize;
    let mut quote = None;
    let mut escape = false;
    let mut line_comment = false;
    let mut block_comment = false;
    let bytes = original.as_bytes();
    let mut levels = vec![0; bytes.len()];
    let mut i = 0;
    while i < bytes.len() {
        levels[i] = depth;
        let b = bytes[i];
        let next = bytes.get(i + 1).copied();
        if line_comment {
            if b == b'\n' {
                line_comment = false;
            }
            i += 1;
            continue;
        }
        if block_comment {
            if b == b'*' && next == Some(b'/') {
                block_comment = false;
                i += 2;
            } else {
                i += 1;
            }
            continue;
        }
        if let Some(q) = quote {
            if escape {
                escape = false;
            } else if b == b'\\' {
                escape = true;
            } else if b == q {
                quote = None;
            }
            i += 1;
            continue;
        }
        if b == b'/' && next == Some(b'/') {
            line_comment = true;
            i += 2;
            continue;
        }
        if b == b'/' && next == Some(b'*') {
            block_comment = true;
            i += 2;
            continue;
        }
        if b == b'"' || b == b'\'' {
            quote = Some(b);
        } else if b == b'{' || b == b'[' {
            depth += 1;
        } else if b == b'}' || b == b']' {
            depth = depth.saturating_sub(1);
        }
        i += 1;
    }
    let matches = re
        .captures_iter(original)
        .filter(|c| levels[c.get(0).unwrap().start()] == 1)
        .collect::<Vec<_>>();
    if matches.len() != 1 {
        bail!(
            "Expected one quoted top-level status field; found {}",
            matches.len()
        );
    }
    let c = &matches[0];
    let m = c.get(2).unwrap();
    let mut out = original.to_owned();
    out.replace_range(m.range(), &serde_json::to_string(value)?);
    Ok(out)
}
pub fn run(a: &Args) -> Result<i32> {
    let root = context::tracker(a)?;
    if a.command == "issue set-state" {
        return set_state(a, &root);
    }
    let dir = issues::issue(&root, a.positional(0)?)?;
    if a.command == "issue add-comment" {
        let author = a.required("author")?;
        let body = a.required("body")?;
        let date = a
            .get("date")
            .map(str::to_owned)
            .unwrap_or_else(|| chrono::Utc::now().format("%Y-%m-%d").to_string());
        chrono::NaiveDate::parse_from_str(&date, "%Y-%m-%d")
            .map_err(|_| crate::args::Usage("--date requires YYYY-MM-DD".into()))?;
        let name = slug(a.get("slug").unwrap_or(author))?;
        let base = inside(&dir.join("comments"), &root)?;
        let p = base.join(format!("{:03}_{date}_{name}.md", next(&base, 1, 1)?));
        let text = render("comment", json!({"author":author,"date":date}), Some(body))?;
        create(&p, &text)?;
        return created(a, &dir, &p, json!({"author":author,"date":date}));
    }
    let name = slug(if a.has("index") {
        a.get("name").unwrap_or("overview")
    } else {
        a.required("name")?
    })?;
    let title = a.get("title").map(str::to_owned).unwrap_or_else(|| {
        let mut s = name.replace('-', " ");
        s[..1].make_ascii_uppercase();
        s
    });
    match a.command.as_str() {
        "issue new-subtask" => {
            let base = group(
                &inside(&dir.join("subtasks"), &dir)?,
                a.get("group").unwrap_or(""),
            )?;
            let n = if a.has("index") {
                0
            } else {
                next(&base, 10, 10)?
            };
            let prefix = if a.has("index") {
                "00".to_owned()
            } else {
                format!("{n:03}")
            };
            let p = base.join(format!("{prefix}_{name}.md"));
            let text = render(
                "subtask",
                json!({"title":title,"status":"open"}),
                a.get("overview"),
            )?;
            create(&p, &text)?;
            created(
                a,
                &dir,
                &p,
                json!({"title":title,"group":a.get("group"),"index":a.has("index")}),
            )
        }
        "issue new-plan" => {
            let base = inside(&dir.join("plans"), &root)?;
            let prefix = checked_prefix(a, next(&base, 1, 1)?, 2)?;
            let p = base.join(format!("{prefix}_{name}"));
            let state = status(a)?;
            if positions(&base)?.contains(&prefix.parse()?) {
                bail!("Plan number {prefix} already exists");
            }
            let text = render("plan-overview", json!({"title":title}), a.get("overview"))?;
            fs::create_dir_all(&base)?;
            fs::create_dir(&p)?;
            create(
                &p.join("settings.json"),
                &format!(
                    "{}\n",
                    serde_json::to_string_pretty(&json!({"title":title,"status":state}))?
                ),
            )?;
            create(&p.join("overview.md"), &text)?;
            created(
                a,
                &dir,
                &p,
                json!({"title":title,"status":state,"files":["settings.json","overview.md"]}),
            )
        }
        "issue new-stage" => {
            let base = inside(
                &dir.join("plans").join(a.required("plan")?),
                &dir.join("plans"),
            )?;
            if !base.is_dir() {
                bail!("Plan not found; create it with issue new-plan");
            }
            let ns = positions(&base)?;
            let default = if a.has("after") && !a.has("prefix") {
                let n = a.number("after", 0)?;
                if !ns.contains(&n) {
                    bail!("No stage {n}");
                }
                match ns.iter().find(|v| **v > n) {
                    Some(next) if next - n < 2 => {
                        bail!("No gap after stage {n}; renumber with agent-ks move")
                    }
                    Some(next) => n + (next - n) / 2,
                    None => n + 10,
                }
            } else {
                ns.last().map(|n| n + 10).unwrap_or(10)
            };
            let prefix = checked_prefix(a, default, 2)?;
            let n = prefix.parse::<usize>()?;
            if ns.contains(&n) {
                bail!("Stage {n} already exists");
            }
            let p = base.join(format!("{prefix}_{name}.md"));
            let links = subtask_links(a, "subtask", &dir, &base)?;
            let state = status(a)?;
            let text = render(
                "plan-stage",
                json!({"title":title,"status":state,"outcome":a.get("outcome"),"notes":a.get("notes"),"who":a.get("who"),"subtasks":links}),
                None,
            )?;
            create(&p, &text)?;
            created(
                a,
                &dir,
                &p,
                json!({"title":title,"status":state,"stage":n,"subtasks":links,"plan":a.get("plan")}),
            )
        }
        "issue new-agent-log" => {
            let kind = a.required("kind")?;
            if !crate::regex!("^[a-z]{2}$").is_match(kind) {
                return usage("--kind requires a two-letter lowercase code");
            }
            let base = group(
                &inside(&dir.join("agent-log"), &dir)?,
                a.get("group").unwrap_or(""),
            )?;
            let nested = crate::regex!(r"^\d{2,5}[_-][a-z]{2}[_-]")
                .is_match(&base.file_name().unwrap().to_string_lossy());
            let prefix = checked_prefix(a, next(&base, 10, if nested { 120 } else { 10 })?, 3)?;
            if positions(&base)?.contains(&prefix.parse()?) {
                bail!("Log number {prefix} already exists");
            }
            let p = base.join(format!("{prefix}_{kind}_{name}"));
            let links = subtask_links(a, "for", &dir, &p)?;
            let key = format!("log-index-{kind}");
            let key = if template(&key).is_ok() {
                key.as_str()
            } else {
                "log-index"
            };
            let (_, body) = frontmatter(template(key)?)?;
            let mut lines = body.trim().lines().map(str::to_owned).collect::<Vec<_>>();
            if let Some(goal) = a.get("goal") {
                lines[0] = goal.to_owned();
            }
            if !links.is_empty() {
                for l in &mut lines {
                    if l.starts_with("Serves:") {
                        *l = format!("Serves: {}", links.join(", "));
                    }
                }
            }
            let text = render(key, json!({"title":"Index"}), Some(&lines.join("\n")))?;
            fs::create_dir_all(&base)?;
            fs::create_dir(&p)?;
            create(
                &p.join("settings.json"),
                "{\n  \"status\": \"in-progress\"\n}\n",
            )?;
            create(&p.join("00_index.md"), &text)?;
            created(
                a,
                &dir,
                &p,
                json!({"group":a.get("group"),"files":["settings.json","00_index.md"]}),
            )
        }
        "issue new-round" | "issue new-iteration" => new_round(a, &root, &dir, &name, &title),
        _ => bail!("Unknown writer {}", a.command),
    }
}
fn new_round(a: &Args, root: &Path, dir: &Path, name: &str, title: &str) -> Result<i32> {
    let base = group(&inside(&dir.join("agent-log"), dir)?, a.required("log")?)?;
    if !base.is_dir() {
        bail!("Agent log not found; create it with issue new-agent-log");
    }
    let ns = positions(&base)?
        .into_iter()
        .filter(|n| *n >= 10)
        .collect::<Vec<_>>();
    let max = ns.iter().max().map(|n| n / 10).unwrap_or(0);
    let round = a.number("round", if a.has("report") { max } else { max + 1 })?;
    if !(1..=9999).contains(&round) {
        return usage("Round must be 1–9999; create a round before adding reports");
    }
    let digit = if a.has("report") {
        if !ns.contains(&(round * 10)) {
            bail!("Round {round} has no round file");
        }
        (1..=9)
            .find(|n| !ns.contains(&(round * 10 + n)))
            .context("Round already has nine reports")?
    } else {
        0
    };
    let n = round * 10 + digit;
    if ns.contains(&n) {
        bail!("Round {round} already exists; use --report");
    }
    let file = format!("{n:02}_{name}.md");
    let p = base.join(&file);
    let (_, body) = frontmatter(template("log-round")?)?;
    let mut lines = body.trim().lines().map(str::to_owned).collect::<Vec<_>>();
    if let Some(goal) = a.get("goal") {
        lines[0] = goal.to_owned();
    }
    for input in a.csv("inputs") {
        let found = [
            base.clone(),
            dir.to_owned(),
            root.to_owned(),
            std::env::current_dir()?,
        ]
        .iter()
        .map(|b| normalize(&b.join(input)))
        .find(|p| p.is_file())
        .with_context(|| format!("Input file not found: {input}. Nothing written."))?;
        lines.push(format!("- {}", link(&found, &base)?));
    }
    let text = render(
        "log-round",
        json!({"title":title,"status":"open","agent":a.get("agent").unwrap_or("codex")}),
        Some(&lines.join("\n")),
    )?;
    let index = base.join("00_index.md");
    let index_text = if index.is_file() {
        let original = read(&index)?;
        let entry = format!(
            "- [{}](./{file}){}",
            title.replace(['[', ']'], ""),
            a.get("goal").map(|s| format!(" — {s}")).unwrap_or_default()
        );
        let mut lines = original.lines().map(str::to_owned).collect::<Vec<_>>();
        if let Some(h) = lines.iter().position(|l| l.trim() == "## Files") {
            let end = lines
                .iter()
                .enumerate()
                .skip(h + 1)
                .find(|(_, l)| l.starts_with("# ") || l.starts_with("## "))
                .map(|(i, _)| i)
                .unwrap_or(lines.len());
            if crate::links::each(&lines[h + 1..end].join("\n")).is_empty() {
                lines.splice(h + 1..end, [String::new(), entry, String::new()]);
            } else {
                lines.insert(end, entry);
            }
        } else {
            lines.extend(["".into(), "## Files".into(), entry]);
        }
        Some(format!("{}\n", lines.join("\n")))
    } else {
        None
    };
    create(&p, &text)?;
    if let Some(text) = &index_text
        && let Err(e) = atomic_write(&index, text)
    {
        let _ = fs::remove_file(&p);
        return Err(e);
    }
    created(
        a,
        dir,
        &p,
        json!({"log":a.get("log"),"round":round,"report":digit,"prefix":format!("{n:02}"),"indexUpdated":index_text.is_some()}),
    )
}
