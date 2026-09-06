use crate::{
    args::{Args, usage},
    content, context,
    util::*,
};
use anyhow::{Result, bail};
use serde_json::{Value, json};
use std::path::{Path, PathBuf};
pub const STATUSES: &[&str] = &[
    "open",
    "blocked",
    "in-progress",
    "input-needed",
    "review",
    "done",
    "dropped",
    "superseded",
];
pub const RUN_STATUSES: &[&str] = &["open", "in-progress", "input-needed", "done", "dropped"];
pub fn category(s: &str) -> &str {
    match s {
        "done" | "dropped" | "superseded" => "closed",
        "review" | "input-needed" => "review",
        "in-progress" => "in-progress",
        _ => "not-started",
    }
}
pub fn state(v: &Value) -> &str {
    v["status"].as_str().unwrap_or("open")
}
pub fn issue_dirs(root: &Path) -> Result<Vec<PathBuf>> {
    let re = crate::regex!(r"^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*$");
    Ok(children(root)?
        .into_iter()
        .filter(|p| p.is_dir() && re.is_match(&p.file_name().unwrap().to_string_lossy()))
        .collect())
}
pub fn issue(root: &Path, id: &str) -> Result<PathBuf> {
    let p = inside(&root.join(id), root)?;
    if !prefer_jsonc(&p.join("settings.json")).is_file() {
        bail!("Issue not found: {id}");
    }
    Ok(p)
}
pub fn subtasks(dir: &Path) -> Result<Vec<Value>> {
    let root = dir.join("subtasks");
    let mut out = vec![];
    for p in optional_walk(&root, &["md"])? {
        let relpath = rel(&p, &root);
        if relpath.split('/').count() > 6 {
            continue;
        }
        let fm = metadata(&p)?;
        let slug = p.file_stem().unwrap().to_string_lossy();
        let group = Path::new(&relpath)
            .parent()
            .unwrap_or(Path::new(""))
            .components()
            .map(|x| x.as_os_str().to_string_lossy().into_owned())
            .collect::<Vec<_>>();
        out.push(json!({"slug":slug,"sequence":prefix(&p),"title":title(&p)?,"status":state(&fm),"category":category(state(&fm)),"groupPath":group,"filePath":p,"fileName":p.file_name().unwrap().to_string_lossy()}));
    }
    out.sort_by(|a, b| {
        a["groupPath"]
            .to_string()
            .cmp(&b["groupPath"].to_string())
            .then(a["sequence"].as_u64().cmp(&b["sequence"].as_u64()))
    });
    Ok(out)
}
pub fn select_subtask(dir: &Path, selector: &str, from: &Path) -> Result<PathBuf> {
    let mut found = vec![];
    for s in subtasks(dir)? {
        let p = PathBuf::from(s["filePath"].as_str().unwrap());
        let slug = s["slug"].as_str().unwrap();
        let clean = slug.split_once(['_', '-']).map(|(_, s)| s).unwrap_or(slug);
        let matches = if let Ok(n) = selector.parse::<u64>() {
            s["sequence"] == n
        } else {
            s["fileName"] == selector
                || slug == selector
                || clean == selector
                || [
                    dir.to_owned(),
                    dir.join("subtasks"),
                    from.to_owned(),
                    dir.parent().unwrap().to_owned(),
                    std::env::current_dir()?,
                ]
                .iter()
                .any(|b| normalize(&b.join(selector)) == p)
        };
        if matches {
            found.push(p);
        }
    }
    if found.len() != 1 {
        bail!(
            "Subtask selector {selector:?} matched {} files; use an unambiguous path. Nothing written.",
            found.len()
        );
    }
    Ok(found.remove(0))
}
pub fn logs(dir: &Path, full: bool) -> Result<Vec<Value>> {
    let root = dir.join("agent-log");
    let re = crate::regex!(r"^(\d{2,5})[_-]([a-z]{2})[_-](.+)$");
    let mut out = vec![];
    if !root.is_dir() {
        return Ok(out);
    }
    for e in walkdir::WalkDir::new(&root)
        .follow_links(false)
        .max_depth(6)
    {
        let e = e?;
        if !e.file_type().is_dir() {
            continue;
        }
        let name = e.file_name().to_string_lossy();
        let Some(c) = re.captures(&name) else {
            continue;
        };
        let p = e.path();
        let settings = if prefer_jsonc(&p.join("settings.json")).is_file() {
            json_file(&p.join("settings.json"))?
        } else {
            json!({})
        };
        let index_path = p.join("00_index.md");
        let index = if index_path.is_file() {
            let mut v =
                json!({"fileName":"00_index.md","filePath":index_path,"title":title(&index_path)?});
            if full {
                v["body"] = json!(read(&index_path)?);
            }
            v
        } else {
            Value::Null
        };
        let mut rounds = vec![];
        for file in children(p)? {
            if file.extension().is_none_or(|x| x != "md") || file == index_path {
                continue;
            }
            let fm = metadata(&file)?;
            let seq = prefix(&file);
            let round = seq.filter(|n| *n >= 10).map(|n| n / 10);
            let mut r = json!({"name":file.file_stem().unwrap().to_string_lossy(),"fileName":file.file_name().unwrap().to_string_lossy(),"filePath":file,"title":title(&file)?,"prefix":seq,"round":round,"report":round.map(|_|seq.unwrap()%10),"status":state(&fm),"agent":fm["agent"]});
            if full {
                r["body"] = json!(read(&file)?);
            }
            rounds.push(r);
        }
        out.push(json!({"name":name,"groupPath":rel(p.parent().unwrap(),&root).split('/').filter(|s|!s.is_empty()&&*s!=".").collect::<Vec<_>>(),"filePath":p,"sequence":c[1].parse::<usize>()?,"kind":&c[2],"slug":&c[3],"status":settings["status"],"index":index,"rounds":rounds}));
    }
    out.sort_by(|a, b| a["filePath"].as_str().cmp(&b["filePath"].as_str()));
    Ok(out)
}
fn matches_values(meta: &Value, key: &str, wanted: &[&str]) -> bool {
    wanted.is_empty()
        || strings(&meta[key])
            .iter()
            .any(|s| wanted.contains(&s.as_str()))
}
fn list(a: &Args, root: &Path) -> Result<i32> {
    let statuses = a.csv("status");
    for s in &statuses {
        if *s != "all" && !STATUSES.contains(s) {
            return usage(format!(
                "Unknown status {s}; valid: {}",
                STATUSES.join(", ")
            ));
        }
    }
    let re = a
        .get("search")
        .map(|s| content::pattern(a, s))
        .transpose()?;
    let meta_re = a.get("meta").map(|s| content::pattern(a, s)).transpose()?;
    let path_re = a.get("path").map(|s| content::pattern(a, s)).transpose()?;
    let fields = a.csv("search-fields");
    for f in &fields {
        if ![
            "body",
            "issue",
            "settings",
            "title",
            "comments",
            "subtasks",
            "notes",
            "agent-log",
            "agent-logs",
            "plans",
            "brainstorm",
            "agent-memory",
        ]
        .contains(f)
        {
            return usage(format!("Unknown search field {f}"));
        }
    }
    let mut out = vec![];
    let mut hidden = 0;
    for dir in issue_dirs(root)? {
        let id = dir.file_name().unwrap().to_string_lossy();
        let meta = json_file(&dir.join("settings.json"))?;
        if ![
            ("priority", "priority"),
            ("component", "component"),
            ("labels", "label"),
            ("type", "type"),
        ]
        .iter()
        .all(|(key, flag)| matches_values(&meta, key, &a.csv(flag)))
        {
            continue;
        }
        let mut assignees = strings(&meta["assignee"]);
        assignees.extend(strings(&meta["assignees"]));
        let assigned = a.csv("assignee");
        if !assigned.is_empty()
            && !assigned.iter().any(|s| {
                (*s == "unassigned" && assignees.is_empty())
                    || (*s == "assigned" && !assignees.is_empty())
                    || assignees.iter().any(|v| v == s)
            })
        {
            continue;
        }
        if a.get("created-after").is_some_and(|d| &id[..10] < d)
            || a.get("created-before").is_some_and(|d| &id[..10] > d)
        {
            continue;
        }
        if [
            "has-review-subtasks",
            "has-open-subtasks",
            "has-closed-subtasks",
            "subtasks-min",
            "subtasks-max",
        ]
        .iter()
        .any(|k| a.has(k))
        {
            let subs = subtasks(&dir)?;
            if a.has("has-review-subtasks") && !subs.iter().any(|s| s["category"] == "review")
                || a.has("has-open-subtasks") && !subs.iter().any(|s| s["status"] == "open")
                || a.has("has-closed-subtasks") && !subs.iter().any(|s| s["category"] == "closed")
                || subs.len() < a.number("subtasks-min", 0)?
                || subs.len() > a.number("subtasks-max", usize::MAX)?
            {
                continue;
            }
        }
        let need_files = re.is_some() || meta_re.is_some() || path_re.is_some();
        let all_files = if need_files {
            walk(&dir, &["md", "json", "jsonc", "yaml", "yml"])?
        } else {
            vec![]
        };
        if let Some(re) = &path_re
            && !re.is_match(&id)
            && !all_files.iter().any(|p| re.is_match(&rel(p, root)))
        {
            continue;
        }
        let mut hits = vec![];
        if let Some(re) = &re {
            let mut selected = vec![];
            let scope = a
                .get("scope")
                .map(|s| inside(&dir.join(s), &dir))
                .transpose()?;
            for p in &all_files {
                let r = rel(p, &dir);
                let top = r.split('/').next().unwrap();
                let field = match top {
                    "issue.md" => "body",
                    "settings.json" | "settings.jsonc" => "settings",
                    other => other,
                };
                if !(fields.is_empty()
                    || fields.contains(&field)
                    || (field == "body" && fields.contains(&"issue"))
                    || (field == "settings" && fields.contains(&"title"))
                    || (field == "agent-log" && fields.contains(&"agent-logs")))
                    || scope.as_ref().is_some_and(|s| !p.starts_with(s))
                {
                    continue;
                }
                selected.push(p.clone());
            }
            hits = content::search(a, &selected, re, false, Path::new(""))?;
            if hits.is_empty() {
                continue;
            }
        }
        if let Some(re) = &meta_re {
            let more = content::search(a, &all_files, re, true, Path::new(""))?;
            if more.is_empty() {
                continue;
            }
            hits.extend(more);
        }
        let status = state(&meta);
        let visible = if !statuses.is_empty() {
            statuses.contains(&"all") || statuses.contains(&status)
        } else {
            a.has("include-closed") || a.has("include-cancelled") || category(status) != "closed"
        };
        if !visible {
            hidden += 1;
            continue;
        }
        let mut r = json!({"id":id,"status":status,"priority":meta["priority"],"component":strings(&meta["component"]),"labels":strings(&meta["labels"]),"type":strings(&meta["type"]),"assignees":assignees,"title":meta["title"]});
        if re.is_some() || meta_re.is_some() {
            r["matches"] = json!(hits);
        }
        out.push(r);
    }
    if hidden > 0 && statuses.is_empty() && !a.has("quiet-tips") {
        eprintln!("tip: {hidden} closed issue(s) also match. Use --status all to include them.");
    }
    out.truncate(a.number("limit", usize::MAX)?);
    let code = if out.is_empty() { 1 } else { 0 };
    if a.has("paths-only") {
        let mut paths = std::collections::BTreeSet::new();
        for r in &out {
            if let Some(hits) = r["matches"].as_array() {
                for h in hits {
                    paths.insert(h["path"].as_str().unwrap().to_owned());
                }
            } else {
                paths.insert(
                    root.join(r["id"].as_str().unwrap())
                        .to_string_lossy()
                        .into_owned(),
                );
            }
        }
        return result(a, json!(paths));
    }
    if a.has("json") {
        emit(&json!(out))?;
    } else {
        for r in &out {
            let base = format!(
                "{}\t{}\t{}",
                r["id"].as_str().unwrap(),
                r["status"].as_str().unwrap(),
                r["title"].as_str().unwrap_or("")
            );
            if let Some(hits) = r["matches"].as_array() {
                if a.has("count") {
                    println!("{base}\t{} matches", hits.len());
                } else {
                    for h in hits {
                        if let Some(lines) = h["before"].as_array() {
                            for line in lines {
                                println!(
                                    "{base}\t{}:{}-\t{}",
                                    h["path"].as_str().unwrap(),
                                    line["line"],
                                    line["text"].as_str().unwrap()
                                );
                            }
                        }
                        println!(
                            "{base}\t{}:{}\t{}",
                            h["path"].as_str().unwrap(),
                            h["line"],
                            h["snippet"].as_str().unwrap()
                        );
                        if let Some(lines) = h["after"].as_array() {
                            for line in lines {
                                println!(
                                    "{base}\t{}:{}-\t{}",
                                    h["path"].as_str().unwrap(),
                                    line["line"],
                                    line["text"].as_str().unwrap()
                                );
                            }
                        }
                    }
                }
            } else {
                println!("{base}");
            }
        }
        if a.has("count") {
            println!("# {} issue(s)", out.len());
        }
    }
    Ok(code)
}
pub fn run(a: &Args) -> Result<i32> {
    let root = context::tracker(a)?;
    if a.command == "issue list" {
        return list(a, &root);
    }
    if a.command == "issue review-queue" {
        let mut rows = vec![];
        for dir in issue_dirs(&root)? {
            let meta = json_file(&dir.join("settings.json"))?;
            let cat = category(state(&meta));
            let n = subtasks(&dir)?
                .iter()
                .filter(|s| s["category"] == "review")
                .count();
            if cat == "review" || (cat != "closed" && n > 0) {
                rows.push(json!({"id":dir.file_name().unwrap().to_string_lossy(),"status":state(&meta),"reason":if cat=="review"{"issue".to_owned()}else{format!("{n} review subtask{}", if n == 1 { "" } else { "s" })},"title":meta["title"]}));
            }
        }
        return result(a, json!(rows));
    }
    if a.command == "issue subtasks" {
        let dirs = if a.has("all") {
            issue_dirs(&root)?
        } else {
            vec![issue(&root, a.positional(0)?)?]
        };
        let status = a
            .get("status")
            .or(a.get("state"))
            .unwrap_or("all")
            .split(',')
            .collect::<Vec<_>>();
        for s in &status {
            if *s != "all" && !STATUSES.contains(s) {
                return usage(format!("Unknown status {s}"));
            }
        }
        let default_scope = !a.has("status") && !a.has("state");
        let mut rows = vec![];
        let mut groups = serde_json::Map::new();
        for d in dirs {
            let id = d.file_name().unwrap().to_string_lossy().into_owned();
            let base = d.join("subtasks");
            let mut group_rows = vec![];
            if base.is_dir() {
                for e in walkdir::WalkDir::new(&base)
                    .min_depth(1)
                    .sort_by(|a, b| {
                        (prefix(a.path()).unwrap_or(usize::MAX), a.file_name())
                            .cmp(&(prefix(b.path()).unwrap_or(usize::MAX), b.file_name()))
                    })
                    .max_depth(5)
                    .follow_links(false)
                {
                    let e = e?;
                    if e.file_type().is_dir() {
                        let p = e.path();
                        let gp = rel(p, &base)
                            .split('/')
                            .map(str::to_owned)
                            .collect::<Vec<_>>();
                        let settings = prefer_jsonc(&p.join("settings.json"));
                        let label = if settings.is_file() {
                            json_file(&settings)?["title"].as_str().map(str::to_owned)
                        } else {
                            None
                        };
                        let fallback = p.file_name().unwrap().to_string_lossy();
                        let clean = fallback
                            .split_once(['_', '-'])
                            .map(|(_, s)| s)
                            .unwrap_or(&fallback)
                            .replace(['_', '-'], " ");
                        group_rows.push(json!({"groupPath":gp,"sequence":prefix(p),"title":label.unwrap_or(clean)}));
                    }
                }
            }
            groups.insert(id.clone(), json!(group_rows));
            for sub in subtasks(&d)? {
                if default_scope && sub["category"] == "closed" {
                    continue;
                }
                if !status.contains(&"all") && !status.contains(&sub["status"].as_str().unwrap()) {
                    continue;
                }
                rows.push(json!({"issue":id,"file":rel(Path::new(sub["filePath"].as_str().unwrap()),&base),"slug":sub["slug"],"groupPath":sub["groupPath"],"status":sub["status"],"title":sub["title"],"sequence":sub["sequence"]}));
            }
        }
        if a.has("json") {
            emit(&json!({"subtasks":rows,"groups":groups}))?;
        } else {
            let mut current = String::new();
            for row in &rows {
                let id = row["issue"].as_str().unwrap();
                let file = row["file"].as_str().unwrap();
                let status = row["status"].as_str().unwrap();
                let title = row["title"].as_str().unwrap();
                if a.has("flat") {
                    println!("{id}\t{file}\t{status}\t{title}");
                } else {
                    if current != id {
                        println!("# {id}");
                        current = id.to_owned();
                    }
                    let indent = "  ".repeat(row["groupPath"].as_array().unwrap().len() + 1);
                    println!("{indent}[{status}] {file} — {title}");
                }
            }
        }
        return Ok(if rows.is_empty() { 1 } else { 0 });
    }
    let dir = issue(&root, a.positional(0)?)?;
    if a.command == "issue agent-logs" {
        let mut rows = logs(&dir, a.has("full"))?;
        let last = a.number("last", 3)?;
        if last > 0 && rows.len() > last {
            rows.drain(..rows.len() - last);
        }
        return result(a, json!(rows));
    }
    let meta = json_file(&dir.join("settings.json"))?;
    let mut comments = vec![];
    for p in optional_walk(&dir.join("comments"), &["md"])? {
        if p.parent() != Some(dir.join("comments").as_path()) {
            continue;
        }
        let fm = metadata(&p)?;
        let mut v = json!({"name":p.file_stem().unwrap().to_string_lossy(),"sequence":prefix(&p),"date":fm["date"],"author":fm["author"],"filePath":p});
        if a.has("full") {
            v["body"] = json!(read(&p)?);
        }
        comments.push(v);
    }
    let id = dir.file_name().unwrap().to_string_lossy();
    let mut v = json!({"id":id,"created":id.get(..10),"meta":meta,"subtasks":subtasks(&dir)?,"comments":comments,"agentLogs":logs(&dir,a.has("full"))?});
    if a.has("full") && dir.join("issue.md").is_file() {
        v["body"] = json!(read(&dir.join("issue.md"))?);
    }
    result(a, v)
}
