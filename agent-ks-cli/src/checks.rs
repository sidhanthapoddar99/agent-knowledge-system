use crate::{
    args::Args,
    context::{self, Context},
    issues, links, scaffold,
    util::*,
};
use anyhow::{Result, bail};
use serde_json::{Value, json};
use std::{
    collections::BTreeMap,
    path::{Path, PathBuf},
};
#[derive(Default)]
struct Report {
    errors: Vec<String>,
    warnings: Vec<String>,
}
impl Report {
    fn error(&mut self, p: &Path, s: impl std::fmt::Display) {
        self.errors.push(format!("{}: {s}", display(p)));
    }
    fn warn(&mut self, p: &Path, s: impl std::fmt::Display) {
        self.warnings.push(format!("{}: {s}", display(p)));
    }
    fn json(&mut self, p: &Path) -> Option<Value> {
        match json_file(p) {
            Ok(v) => Some(v),
            Err(e) => {
                self.error(p, e);
                None
            }
        }
    }
    fn fm(&mut self, p: &Path) -> Option<Value> {
        match metadata(p) {
            Ok(v) => Some(v),
            Err(e) => {
                self.error(p, e);
                None
            }
        }
    }
    fn unknown(&mut self, a: &Args, p: &Path, v: &Value, keys: &[&str]) {
        if let Some(map) = v.as_object() {
            for k in map.keys() {
                if !keys.contains(&k.as_str()) {
                    let msg = format!(
                        "Unknown key {k}{}",
                        if a.has("verbose") {
                            format!("; valid keys: {}", keys.join(", "))
                        } else {
                            String::new()
                        }
                    );
                    if a.has("strict") {
                        self.error(p, msg);
                    } else {
                        self.warn(p, msg);
                    }
                }
            }
        }
    }
    fn finish(self, a: &Args, kind: &str, root: &Path) -> Result<i32> {
        let code = if self.errors.is_empty() { 0 } else { 1 };
        if a.has("json") {
            emit(
                &json!({"kind":kind,"root":root,"errors":self.errors,"warnings":self.warnings,"ok": self.errors.is_empty(), "errorCount":self.errors.len(), "warningCount":self.warnings.len(), "counts":{"errors":self.errors.len(),"warnings":self.warnings.len()}}),
            )?;
        } else {
            for s in &self.errors {
                println!("error: {s}");
            }
            if !a.has("quiet") && !a.has("no-warnings") {
                for s in &self.warnings {
                    println!("warning: {s}");
                }
            }
            println!(
                "{} error(s), {} warning(s)",
                self.errors.len(),
                self.warnings.len()
            );
        }
        Ok(code)
    }
}
const PAGE_EXT: &[&str] = &[
    "md",
    "html",
    "mmd",
    "mermaid",
    "dot",
    "gv",
    "excalidraw",
    "drawio",
];
fn section(dir: &Path, root: &Path, r: &mut Report) -> Result<()> {
    let settings = prefer_jsonc(&dir.join("settings.json"));
    if settings.is_file() {
        r.json(&settings);
    } else if dir != root {
        r.error(&settings, "Missing folder settings");
    }
    let re = crate::regex!(r"^(\d{2,5})_.+$");
    let mut prefixes = BTreeMap::new();
    for p in children(dir)? {
        let name = p.file_name().unwrap().to_string_lossy();
        if name.starts_with('.')
            || name.starts_with("__")
            || ["assets", "README.md", "settings.json", "settings.jsonc"].contains(&name.as_ref())
        {
            continue;
        }
        if p.symlink_metadata()?.file_type().is_symlink() {
            r.warn(&p, "Symlink skipped");
            continue;
        }
        if name.ends_with(".meta.json") || name.ends_with(".meta.jsonc") {
            r.json(&p);
            continue;
        }
        let page = p.is_dir()
            || p.extension()
                .is_some_and(|e| PAGE_EXT.iter().any(|x| e == *x));
        if page {
            if let Some(c) = re.captures(&name) {
                let n = c[1].parse::<usize>()?;
                if let Some(other) = prefixes.insert(n, name.to_string()) {
                    r.error(&p, format!("Prefix {n} collides with {other}"));
                }
            } else if p.is_dir() || p.extension().is_some_and(|e| e == "md") {
                r.error(&p, "Missing NN_ ordering prefix (2–5 digits)");
            } else {
                r.warn(&p, "Page needs an NN_ prefix or belongs in assets/");
            }
        }
        if p.is_dir() {
            section(&p, root, r)?;
        } else if p.extension().is_some_and(|e| e == "md") {
            if let Some(fm) = r.fm(&p)
                && fm["title"].as_str().is_none_or(|s| s.trim().is_empty())
            {
                r.error(&p, "Missing frontmatter title");
            }
        } else if !page {
            r.warn(&p, "Non-page file belongs in assets/");
        }
    }
    Ok(())
}
fn blog(root: &Path, r: &mut Report) -> Result<()> {
    let re = crate::regex!(r"^\d{4}-\d{2}-\d{2}-[a-z0-9]+(-[a-z0-9]+)*\.md$");
    for p in children(root)? {
        let name = p.file_name().unwrap().to_string_lossy();
        if name.starts_with('.') || ["assets", "README.md"].contains(&name.as_ref()) {
            continue;
        }
        if p.is_dir() {
            r.error(&p, "Blog must be flat; only assets/ may be a directory");
        } else if p.extension().is_some_and(|e| e == "md") {
            if !re.is_match(&name) {
                r.error(&p, "Expected YYYY-MM-DD-<kebab-slug>.md");
            }
            if let Some(fm) = r.fm(&p)
                && fm["title"].as_str().is_none_or(str::is_empty)
            {
                r.error(&p, "Missing frontmatter title");
            }
        } else {
            r.warn(&p, "Non-markdown file belongs in assets/");
        }
    }
    Ok(())
}
fn config(c: &Context, r: &mut Report) -> Result<()> {
    let p = c.config_dir.join("site.yaml");
    if !p.is_file() {
        r.error(&p, "Missing required file");
        return Ok(());
    }
    for k in ["site", "paths", "theme", "pages"] {
        if c.site.get(k).is_none() {
            r.error(&p, format!("Missing required key {k}"));
        }
    }
    if let Some(pages) = c.site["pages"].as_object() {
        for (name, page) in pages {
            for k in ["base_url", "type", "layout", "data"] {
                if page[k].as_str().is_none_or(str::is_empty) {
                    r.error(&p, format!("pages.{name}: missing {k}"));
                }
            }
            if !["docs", "blog", "issues", "custom"].contains(&page["type"].as_str().unwrap_or(""))
            {
                r.error(&p, format!("pages.{name}: unknown page type"));
            }
            if let Some(s) = page["data"].as_str() {
                match c.resolve_path(s) {
                    Ok(p) if !p.exists() => r.error(&p, "Page data path does not exist"),
                    Err(e) => r.error(&p, format!("pages.{name}: {e}")),
                    _ => {}
                }
            }
        }
    } else {
        r.error(&p, "pages must be a mapping");
    }
    for file in ["navbar.yaml", "footer.yaml"] {
        let p = c.config_dir.join(file);
        if !p.is_file() {
            r.warn(&p, "Missing optional file");
            continue;
        }
        match serde_yaml::from_str::<Value>(&read(&p)?) {
            Err(e) => r.error(&p, e),
            Ok(v) => {
                fn refs(v: &Value, p: &Path, site: &Value, r: &mut Report) {
                    if let Some(o) = v.as_object() {
                        for (k, v) in o {
                            if k == "page"
                                && let Some(s) = v.as_str()
                                && site["pages"].get(s).is_none()
                            {
                                r.error(p, format!("Unknown page reference {s}"));
                            }
                            refs(v, p, site, r);
                        }
                    } else if let Some(a) = v.as_array() {
                        for v in a {
                            refs(v, p, site, r);
                        }
                    }
                }
                refs(&v, &p, &c.site, r);
            }
        }
    }
    Ok(())
}
fn link_check(root: &Path, r: &mut Report, skills: bool) -> Result<()> {
    let mut total = 0;
    for p in walk(root, &["md"])? {
        let raw = read(&p)?;
        for link in links::each(&raw) {
            total += 1;
            if links::external(&link.target) {
                continue;
            }
            if link.target.starts_with('/') {
                if !skills {
                    r.error(
                        &p,
                        format!(
                            "line {}: internal link must be relative: {}",
                            link.line, link.target
                        ),
                    );
                }
                continue;
            }
            let (target, _) = links::split(&link.target);
            let resolved = normalize(&p.parent().unwrap().join(links::decode(target)));
            if !resolved.exists() {
                r.error(
                    &p,
                    format!("line {}: link target not found: {}", link.line, link.target),
                );
            }
        }
    }
    if total == 0 {
        r.error(
            root,
            "No links found; cannot verify the link matcher on this scope",
        );
    }
    Ok(())
}
fn template_check(a: &Args, p: &Path, fm: &Value, name: &str, r: &mut Report) -> Result<()> {
    let text = read(p)?;
    let raw = links::prose(&text);
    let re = crate::regex!(r"(?m)^# (.+)\s*$");
    let template = scaffold::template(name)?;
    let required = re
        .captures_iter(template)
        .map(|c| c[1].trim().to_owned())
        .collect::<Vec<_>>();
    for h in required {
        if !raw.lines().any(|l| l.trim() == format!("# {h}")) {
            r.warn(p, format!("Missing template section # {h}"));
        }
    }
    if ["review", "done", "superseded"].contains(&issues::state(fm)) {
        let section = raw
            .split("# 02 Status and Result")
            .nth(1)
            .unwrap_or("")
            .split("\n# ")
            .next()
            .unwrap_or("")
            .trim();
        let default = template
            .split("# 02 Status and Result")
            .nth(1)
            .unwrap_or("")
            .split("\n# ")
            .next()
            .unwrap_or("")
            .trim();
        if section.is_empty() || section == default {
            r.warn(
                p,
                "Finished or review status requires a result under # 02 Status and Result",
            );
        }
    }
    if let Some(q) = raw.split("## Questions").nth(1) {
        let body = q.split("\n#").next().unwrap_or("").trim();
        if !body.is_empty() && body != "none" && issues::state(fm) != "input-needed" {
            r.warn(p, "Open questions require status input-needed");
        }
    }
    if name == "subtask" {
        let body = raw
            .split("## Agent log")
            .nth(1)
            .unwrap_or("")
            .split("\n#")
            .next()
            .unwrap_or("")
            .trim();
        if body != "none" {
            let ls = links::each(body);
            if ls.len() != 1 {
                r.warn(p, "## Agent log must contain none or one resolving link");
            } else {
                let (s, _) = links::split(&ls[0].target);
                if !p.parent().unwrap().join(links::decode(s)).exists() {
                    r.warn(p, "Agent log link does not exist");
                }
            }
        }
    }
    let _ = a;
    Ok(())
}
fn superseded_pointer(p: &Path, status: &str, r: &mut Report) -> Result<()> {
    if status == "superseded"
        && p.is_file()
        && !crate::regex!(r"(?m)^\s*(?:[-*+]\s+|>\s*)?(?:→|->)\s*\S")
            .is_match(&links::prose(&read(p)?))
    {
        r.warn(p, "Superseded scope needs a destination: add a line such as → absorbed into phase-3 notes/10");
    }
    Ok(())
}
fn ordering_labels(p: &Path, r: &mut Report) -> Result<()> {
    let raw = read(p)?;
    for l in links::each(&raw) {
        let Some(label) = l.label else { continue };
        let Some(c) = crate::regex!(r"^(\d{2,5}(?:/\d{2,5})*)\s+\S[\s\S]*$").captures(&raw[label])
        else {
            continue;
        };
        if links::external(&l.target) {
            continue;
        }
        let (target, _) = links::split(&l.target);
        let target = normalize(&p.parent().unwrap().join(links::decode(target)));
        if !target.exists() {
            continue;
        }
        let actual = links::ordering(&target);
        if !actual.is_empty() && actual != c[1] {
            r.warn(
                p,
                format!(
                    "line {}: ordering label {} does not match target order {actual}",
                    l.line, &c[1]
                ),
            );
        }
    }
    Ok(())
}
fn log_kinds(dir: &Path, meta: &Value, r: &mut Report) -> Result<()> {
    let mut codes = vec!["lp", "au", "rf", "re", "it", "wf"];
    let p = prefer_jsonc(&dir.join("settings.json"));
    if let Some(kinds) = meta.get("agentLogKinds") {
        if let Some(kinds) = kinds.as_object() {
            for (code, kind) in kinds {
                if !crate::regex!(r"^[a-z]{2}$").is_match(code) {
                    r.warn(
                        &p,
                        format!("agentLogKinds code {code} must be two lowercase letters"),
                    );
                    continue;
                }
                let name = kind.as_str().or_else(|| kind["name"].as_str());
                if name.is_none_or(|n| n.trim().is_empty()) {
                    r.warn(&p, format!("agentLogKinds.{code} needs a name"));
                } else {
                    codes.push(code);
                }
                if let Some(icon) = kind.get("icon")
                    && ![
                        "repeat",
                        "search",
                        "wrench",
                        "refresh-cw",
                        "git-branch",
                        "flask",
                        "zap",
                        "flag",
                        "star",
                        "book",
                        "shield",
                        "layers",
                        "clock",
                        "target",
                        "check-circle",
                        "bug",
                        "tag",
                    ]
                    .contains(&icon.as_str().unwrap_or(""))
                {
                    r.warn(&p, format!("agentLogKinds.{code}: unknown icon {icon}"));
                }
            }
        } else {
            r.warn(&p, "agentLogKinds must be an object");
        }
    }
    let logs = dir.join("agent-log");
    if logs.is_dir() {
        for e in walkdir::WalkDir::new(logs).follow_links(false).max_depth(6) {
            let e = e?;
            if e.file_type().is_dir()
                && let Some(c) = crate::regex!(r"^\d{2,5}[_-]([a-z]{2})[_-]")
                    .captures(&e.file_name().to_string_lossy())
                && !codes.contains(&&c[1])
            {
                r.warn(
                    e.path(),
                    format!(
                        "Undeclared agent log kind {}; define it in agentLogKinds",
                        &c[1]
                    ),
                );
            }
        }
    }
    Ok(())
}
fn tracker(a: &Args, root: &Path, r: &mut Report) -> Result<()> {
    let vp = prefer_jsonc(&root.join("settings.json"));
    let vocab = r.json(&vp).unwrap_or(json!({}));
    if !vocab["fields"].is_object() {
        r.error(&vp, "Missing fields vocabulary");
    }
    r.unknown(
        a,
        &vp,
        &vocab,
        &[
            "label",
            "fields",
            "authors",
            "views",
            "draft",
            "statusColors",
            "template",
        ],
    );
    if vocab["fields"].get("status").is_some() {
        r.error(
            &vp,
            "Statuses are fixed in code; fields.status is not supported",
        );
    }
    if vocab.get("statusColors").is_some() {
        r.error(&vp, "Status colors belong in theme CSS");
    }
    if let Some(fields) = vocab["fields"].as_object() {
        for (key, v) in fields {
            if !["priority", "component", "labels"].contains(&key.as_str()) {
                r.warn(&vp, format!("Unknown vocabulary field {key}"));
            }
            for val in strings(&v["values"]) {
                if v["descriptions"][&val].as_str().is_none_or(str::is_empty) {
                    r.error(&vp, format!("fields.{key}: missing description for {val}"));
                }
            }
        }
    }
    let template = a.has("template") || vocab["template"] == true;
    let folder = crate::regex!(r"^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*$");
    for dir in children(root)? {
        if !dir.is_dir()
            || dir.file_name().unwrap().to_string_lossy().starts_with('.')
            || dir.file_name().unwrap() == "assets"
        {
            continue;
        }
        let name = dir.file_name().unwrap().to_string_lossy();
        if !folder.is_match(&name) {
            r.error(&dir, "Expected YYYY-MM-DD-<kebab-slug> folder");
            continue;
        }
        let sp = prefer_jsonc(&dir.join("settings.json"));
        let Some(meta) = r.json(&sp) else {
            continue;
        };
        r.unknown(
            a,
            &sp,
            &meta,
            &[
                "title",
                "description",
                "status",
                "priority",
                "component",
                "labels",
                "author",
                "assignees",
                "draft",
                "agentLogKinds",
            ],
        );
        for k in ["title", "status"] {
            if meta[k].as_str().is_none_or(str::is_empty) {
                r.error(&sp, format!("Missing {k}"));
            }
        }
        if !issues::STATUSES.contains(&issues::state(&meta)) {
            r.error(&sp, format!("Invalid status {}", meta["status"]));
        }
        if let Some(p) = meta["priority"].as_str()
            && !strings(&vocab["fields"]["priority"]["values"])
                .iter()
                .any(|s| s == p)
        {
            r.error(&sp, format!("Priority {p} is not in vocabulary"));
        }
        let components = strings(&meta["component"]);
        if components.len() != 1 {
            r.warn(
                &sp,
                format!("Expected one component, found {}", components.len()),
            );
        }
        for (key, vals) in [
            ("component", components),
            ("labels", strings(&meta["labels"])),
        ] {
            let allowed = strings(&vocab["fields"][key]["values"]);
            for v in vals {
                if !allowed.contains(&v) {
                    r.warn(&sp, format!("{key}: {v} is not in vocabulary"));
                }
            }
        }
        if !dir.join("issue.md").is_file() {
            r.error(&dir.join("issue.md"), "Missing issue body");
        }
        superseded_pointer(&dir.join("issue.md"), issues::state(&meta), r)?;
        log_kinds(&dir, &meta, r)?;
        for p in children(&dir)? {
            let n = p.file_name().unwrap().to_string_lossy();
            if p.is_dir()
                && ![
                    "subtasks",
                    "plans",
                    "notes",
                    "brainstorm",
                    "agent-memory",
                    "agent-log",
                    "comments",
                    "assets",
                ]
                .contains(&n.as_ref())
            {
                r.warn(&p, "Unknown issue anatomy folder");
            } else if p.is_file()
                && p.extension().is_some_and(|e| e == "md")
                && n != "issue.md"
                && n != "glossary.md"
            {
                r.warn(&p, "Supporting markdown belongs in notes/");
            }
        }
        for p in optional_walk(&dir, &["md"])? {
            let relative = rel(&p, &dir);
            let top = relative.split('/').next().unwrap();
            let Some(fm) = r.fm(&p) else {
                continue;
            };
            let status = issues::state(&fm);
            let is_stage = top == "plans" && p.file_name().unwrap() != "overview.md";
            let kind = match top {
                "subtasks" => Some("subtask"),
                "plans" => Some(if is_stage {
                    "plan-stage"
                } else {
                    "plan-overview"
                }),
                _ => None,
            };
            if top != "agent-log" {
                ordering_labels(&p, r)?;
            }
            if top == "subtasks" || is_stage {
                superseded_pointer(&p, status, r)?;
                if !issues::STATUSES.contains(&status) {
                    r.error(&p, format!("Invalid status {status}"));
                }
                if top == "subtasks" && fm.get("status").is_none() {
                    r.warn(&p, "Missing status; defaults to open");
                }
            }
            if top == "agent-log"
                && fm.get("status").is_some()
                && !issues::RUN_STATUSES.contains(&status)
            {
                r.error(
                    &p,
                    format!(
                        "Invalid run status {status}; use {}",
                        issues::RUN_STATUSES.join(", ")
                    ),
                );
            }
            let allowed: &[&str] = match top {
                "subtasks" => &["title", "status", "state", "sidebar_label"],
                "agent-log" => &[
                    "title",
                    "iteration",
                    "agent",
                    "status",
                    "date",
                    "sidebar_label",
                    "color",
                ],
                "comments" => &["author", "date", "title", "sidebar_label"],
                "plans" if is_stage => &[
                    "title",
                    "outcome",
                    "notes",
                    "who",
                    "status",
                    "subtasks",
                    "sidebar_label",
                    "color",
                ],
                "notes" | "brainstorm" | "agent-memory" => &[
                    "title",
                    "description",
                    "sidebar_label",
                    "author",
                    "date",
                    "created",
                    "tags",
                    "color",
                ],
                _ => &[],
            };
            if !allowed.is_empty() {
                r.unknown(a, &p, &fm, allowed);
            }
            if template && let Some(kind) = kind {
                template_check(a, &p, &fm, kind, r)?;
            }
            if relative.split('/').count() > 7 {
                r.warn(&p, "Exceeds five-level folder depth supported by loader");
            }
            if top == "comments" && p.parent() != Some(dir.join("comments").as_path()) {
                r.warn(&p, "Comments must be flat");
            }
            if is_stage {
                if fm.get("agent-logs").is_some() {
                    r.error(
                        &p,
                        "Link logs from the body; stage frontmatter references subtasks",
                    );
                }
                for entry in strings(&fm["subtasks"]) {
                    let ls = links::each(&entry);
                    if ls.len() != 1 || !entry.starts_with('[') || !entry.ends_with(')') {
                        r.error(&p, format!("subtasks entry must be one link: {entry}"));
                        continue;
                    }
                    let (target, _) = links::split(&ls[0].target);
                    let target = normalize(&p.parent().unwrap().join(links::decode(target)));
                    if !target.is_file() || !target.starts_with(dir.join("subtasks")) {
                        r.error(
                            &p,
                            format!("Stage references missing or non-subtask file: {entry}"),
                        );
                    }
                }
            }
        }
        let mut sibling_groups: BTreeMap<PathBuf, Vec<Value>> = BTreeMap::new();
        for sub in issues::subtasks(&dir).unwrap_or_default() {
            let p = PathBuf::from(sub["filePath"].as_str().unwrap());
            sibling_groups
                .entry(p.parent().unwrap().to_owned())
                .or_default()
                .push(sub);
        }
        for (_, subs) in sibling_groups {
            let index = subs
                .iter()
                .find(|s| s["fileName"].as_str().unwrap().starts_with("00_"));
            let siblings = subs
                .iter()
                .filter(|s| !s["fileName"].as_str().unwrap().starts_with("00_"))
                .collect::<Vec<_>>();
            if let Some(index) = index
                && !siblings.is_empty()
            {
                let derived = if siblings.iter().all(|s| s["category"] == "closed") {
                    "done"
                } else if siblings.iter().all(|s| s["status"] == "open") {
                    "open"
                } else {
                    "in-progress"
                };
                if index["status"] != derived
                    && !(derived == "done" && index["category"] == "closed")
                {
                    r.warn(
                        Path::new(index["filePath"].as_str().unwrap()),
                        format!(
                            "Index status {} disagrees with siblings; derived {derived}",
                            index["status"]
                        ),
                    );
                }
            }
        }
        if dir.join("plans").is_dir() {
            let mut open = 0;
            for plan in children(&dir.join("plans"))? {
                if !plan.is_dir() {
                    r.warn(&plan, "plans/ holds plan folders");
                    continue;
                }
                let s = prefer_jsonc(&plan.join("settings.json"));
                if s.is_file() {
                    if let Some(meta) = r.json(&s) {
                        r.unknown(a, &s, &meta, &["title", "status", "description"]);
                        if !issues::STATUSES.contains(&issues::state(&meta)) {
                            r.error(&s, "Invalid plan status");
                        }
                        if issues::category(issues::state(&meta)) != "closed" {
                            open += 1;
                        }
                    }
                } else {
                    r.warn(&s, "Missing plan settings");
                }
                if !plan.join("overview.md").is_file() {
                    r.warn(&plan, "Missing overview.md");
                }
                let mut seen = BTreeMap::new();
                for p in children(&plan)? {
                    if p.is_dir() {
                        r.warn(&p, "Plan stages must be flat files");
                    } else if p.extension().is_some_and(|e| e == "md")
                        && p.file_name().unwrap() != "overview.md"
                    {
                        if let Some(n) = prefix(&p) {
                            if seen.insert(n, p.clone()).is_some() {
                                r.error(&p, format!("Duplicate stage number {n}"));
                            }
                        } else {
                            r.warn(&p, "Missing stage number");
                        }
                    }
                }
            }
            if open > 1 {
                r.warn(
                    &dir.join("plans"),
                    format!("{open} plans are open; highest-numbered is active"),
                );
            }
        }
        for p in optional_walk(&dir.join("agent-log"), &["json", "jsonc"])? {
            if p.file_stem().is_some_and(|s| s == "settings")
                && let Some(v) = r.json(&p)
                && v.get("status").is_some()
                && !issues::RUN_STATUSES.contains(&issues::state(&v))
            {
                r.error(&p, "Invalid run status");
            }
        }
        if dir.join("agent-memory").is_dir() && !dir.join("agent-memory/memory.md").is_file() {
            r.warn(&dir.join("agent-memory"), "Missing memory.md index");
        }
    }
    Ok(())
}
pub fn run(a: &Args) -> Result<i32> {
    let kind = a.command.strip_prefix("check ").unwrap();
    let mut r = Report::default();
    let root: PathBuf = match kind {
        "issues" => context::tracker(a)?,
        "section" => absolute(a.positional(0)?)?,
        "config" => {
            if let Some(p) = a.pos.first() {
                absolute(p)?
            } else {
                Context::resolve(a)?.config_dir
            }
        }
        "blog" => {
            if let Some(p) = a.pos.first() {
                absolute(p)?
            } else {
                Context::resolve(a)?.sections("blog")?[0].1.clone()
            }
        }
        "skill-links" => absolute(a.positional(0)?)?,
        _ => {
            if let Some(p) = a.pos.first() {
                absolute(p)?
            } else {
                Context::resolve(a)?.data_dir
            }
        }
    };
    if !root.is_dir() {
        bail!("Directory not found: {}", root.display());
    }
    match kind {
        "section" => section(&root, &root, &mut r)?,
        "blog" => blog(&root, &mut r)?,
        "config" => {
            let mut args = Args::default();
            args.flags
                .insert("config-dir".into(), root.to_string_lossy().into_owned());
            config(&Context::resolve(&args)?, &mut r)?;
        }
        "issues" => tracker(a, &root, &mut r)?,
        "link-form" | "skill-links" => link_check(&root, &mut r, kind == "skill-links")?,
        "legacy-tags" => {
            let re = crate::regex!(
                r"(?i):::\s*(?:callout|collapsible|tabs?)\b|</?(?:callout|tabs?|collapsible)\b"
            );
            for p in walk(&root, &["md"])? {
                let raw = read(&p)?;
                let (_, body) = frontmatter(&raw)?;
                let offset = raw[..raw.len() - body.len()]
                    .bytes()
                    .filter(|b| *b == b'\n')
                    .count();
                for (i, l) in links::prose(body).lines().enumerate() {
                    if re.is_match(l) {
                        r.error(
                            &p,
                            format!(
                                "line {}: use native Markdown callouts or HTML details",
                                i + offset + 1
                            ),
                        );
                    }
                }
            }
        }
        _ => bail!("Unknown validator {kind}"),
    };
    r.finish(a, kind, &root)
}
