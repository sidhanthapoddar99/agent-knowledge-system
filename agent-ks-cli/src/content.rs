use crate::{
    args::{Args, Usage},
    context::Context,
    util::*,
};
use anyhow::Result;
use regex::{Regex, RegexBuilder};
use serde_json::{Value, json};
use std::{
    collections::BTreeSet,
    path::{Path, PathBuf},
};
pub const TEXT_EXT: &[&str] = &[
    "md",
    "json",
    "jsonc",
    "yaml",
    "yml",
    "html",
    "mmd",
    "mermaid",
    "dot",
    "gv",
    "excalidraw",
    "drawio",
];
pub fn pattern(a: &Args, s: &str) -> Result<Regex> {
    let source = if a.has("fixed-strings") {
        regex::escape(s)
    } else {
        s.to_owned()
    };
    RegexBuilder::new(&source)
        .case_insensitive(!a.has("case-sensitive"))
        .build()
        .map_err(|e| Usage(format!("Invalid search pattern: {e}")).into())
}
pub fn search(
    a: &Args,
    files: &[PathBuf],
    re: &Regex,
    meta: bool,
    base: &Path,
) -> Result<Vec<Value>> {
    let context = a.number("context", 0)?;
    let mut hits = vec![];
    for path in files {
        if meta
            && !path.extension().is_some_and(|e| {
                ["md", "json", "jsonc", "yaml", "yml"]
                    .iter()
                    .any(|x| e == *x)
            })
        {
            continue;
        }
        let text = read(path)?;
        let lines: Vec<_> = text.lines().collect();
        let range = if meta && path.extension().is_some_and(|e| e == "md") {
            if lines.first() != Some(&"---") {
                continue;
            }
            let end = lines
                .iter()
                .skip(1)
                .position(|l| *l == "---")
                .map(|n| n + 1)
                .unwrap_or(1);
            1..end
        } else {
            0..lines.len()
        };
        for i in range {
            if re.is_match(lines[i]) != a.has("invert-match") {
                let mut h = json!({"path":rel(path,base),"line":i+1,"snippet":lines[i].trim()});
                if context > 0 {
                    h["before"] = json!(
                        (i.saturating_sub(context)..i)
                            .map(|n| json!({"line":n+1,"text":lines[n]}))
                            .collect::<Vec<_>>()
                    );
                    h["after"] = json!(
                        (i + 1..lines.len().min(i.saturating_add(context).saturating_add(1)))
                            .map(|n| json!({"line":n+1,"text":lines[n]}))
                            .collect::<Vec<_>>()
                    );
                }
                hits.push(h);
            }
        }
    }
    Ok(hits)
}
pub fn files(c: &Context) -> Result<Vec<PathBuf>> {
    let mut out = walk(&c.config_dir, TEXT_EXT)?;
    out.extend(optional_walk(&c.data_dir, TEXT_EXT)?);
    for kind in ["docs", "blog", "issues"] {
        for (_, p) in c.sections(kind)? {
            out.extend(optional_walk(&p, TEXT_EXT)?);
        }
    }
    out.sort();
    out.dedup();
    Ok(out)
}
pub fn pages(c: &Context, kind: &str, section: Option<&str>) -> Result<Vec<Value>> {
    let mut out = vec![];
    let blog = crate::regex!(r"^(\d{4}-\d{2}-\d{2})-(.+)\.md$");
    for (name, root) in c.sections(kind)? {
        if section.is_some_and(|s| s != name && root.file_name().is_none_or(|n| n != s)) {
            continue;
        }
        for p in optional_walk(&root, TEXT_EXT)? {
            let file = p.file_name().unwrap().to_string_lossy();
            if file == "README.md"
                || file.ends_with(".meta.json")
                || file.ends_with(".meta.jsonc")
                || file == "settings.json"
                || file == "settings.jsonc"
            {
                continue;
            }
            if kind == "blog" {
                if let Some(m) = blog.captures(&file) {
                    out.push(json!({"rel":rel(&p,&c.data_dir),"date":&m[1],"slug":&m[2],"title":title(&p)?,"path":p}));
                }
            } else if p
                .extension()
                .is_some_and(|e| !["json", "jsonc", "yaml", "yml"].iter().any(|v| e == *v))
            {
                out.push(
                    json!({"rel":rel(&p,&c.data_dir),"section":name,"title":title(&p)?,"path":p}),
                );
            }
        }
    }
    out.sort_by(|a, b| {
        if kind == "blog" {
            b["date"]
                .as_str()
                .cmp(&a["date"].as_str())
                .then(a["slug"].as_str().cmp(&b["slug"].as_str()))
        } else {
            a["rel"].as_str().cmp(&b["rel"].as_str())
        }
    });
    Ok(out)
}
pub fn output_hits(a: &Args, mut hits: Vec<Value>) -> Result<i32> {
    hits.truncate(a.number("limit", usize::MAX)?);
    let paths: BTreeSet<_> = hits.iter().filter_map(|h| h["path"].as_str()).collect();
    let code = if hits.is_empty() { 1 } else { 0 };
    if a.has("paths-only") {
        if a.has("json") {
            emit(&json!(paths))?;
        } else {
            for p in paths {
                println!("{p}");
            }
        }
    } else if a.has("json") {
        emit(&json!(hits))?;
    } else if a.has("count") {
        println!("{} match(es) in {} file(s)", hits.len(), paths.len());
    } else {
        for h in hits {
            if let Some(before) = h["before"].as_array() {
                for l in before {
                    println!(
                        "{}:{}-\t{}",
                        h["path"].as_str().unwrap(),
                        l["line"],
                        l["text"].as_str().unwrap()
                    );
                }
            }
            println!(
                "{}:{}\t{}",
                h["path"].as_str().unwrap(),
                h["line"],
                h["snippet"].as_str().unwrap_or("")
            );
            if let Some(after) = h["after"].as_array() {
                for l in after {
                    println!(
                        "{}:{}-\t{}",
                        h["path"].as_str().unwrap(),
                        l["line"],
                        l["text"].as_str().unwrap()
                    );
                }
            }
        }
    }
    Ok(code)
}
pub fn run(a: &Args) -> Result<i32> {
    let c = Context::resolve(a)?;
    if a.command == "find" {
        let re = pattern(a, a.positional(0)?)?;
        let types = a.csv("type");
        for t in &types {
            if !["docs", "blog", "issues", "config"].contains(t) {
                return crate::args::usage(format!("Unknown content type {t}"));
            }
        }
        let mut selected = vec![];
        for p in files(&c)? {
            if types.is_empty() || types.contains(&c.classify(&p)?) {
                selected.push(p);
            }
        }
        let hits = if a.has("path") {
            selected.iter().filter(|p|re.is_match(&rel(p,&c.content_root))).map(|p|json!({"path":rel(p,&c.content_root),"line":0,"snippet":rel(p,&c.content_root)})).collect()
        } else {
            search(a, &selected, &re, a.has("meta"), &c.content_root)?
        };
        return output_hits(a, hits);
    }
    let (group, verb) = a.command.split_once(' ').unwrap();
    let kind = if group == "doc" { "docs" } else { "blog" };
    let section = if verb == "list" {
        a.pos.first().map(String::as_str)
    } else if verb == "search" {
        a.get("section").or(a.pos.get(1).map(String::as_str))
    } else {
        None
    };
    let mut rows = pages(&c, kind, section)?;
    if verb == "search" {
        let re = pattern(a, a.positional(0)?)?;
        let selected = rows
            .iter()
            .map(|r| PathBuf::from(r["path"].as_str().unwrap()))
            .collect::<Vec<_>>();
        return output_hits(a, search(a, &selected, &re, false, &c.data_dir)?);
    }
    if verb == "show" {
        let q = a.positional(0)?;
        rows.retain(|r| {
            let p = Path::new(r["path"].as_str().unwrap());
            r["rel"] == q
                || r["slug"] == q
                || r["date"] == q
                || p == Path::new(q)
                || p.file_name().is_some_and(|n| n == q)
                || p.file_stem().is_some_and(|n| n == q)
        });
        if rows.len() > 1 {
            return crate::args::usage(format!("Ambiguous page {q}; use its full path"));
        }
        let Some(mut r) = rows.pop() else {
            return result(a, Value::Null);
        };
        r["frontmatter"] = metadata(Path::new(r["path"].as_str().unwrap()))?;
        r.as_object_mut().unwrap().remove("path");
        return result(a, r);
    }
    for r in &mut rows {
        r.as_object_mut().unwrap().remove("path");
    }
    if a.has("json") {
        return result(a, json!(rows));
    }
    for r in &rows {
        println!(
            "{}\t{}\t{}",
            r["rel"].as_str().unwrap(),
            r["section"].as_str().or(r["date"].as_str()).unwrap_or(""),
            r["title"].as_str().unwrap_or("")
        );
    }
    Ok(if rows.is_empty() { 1 } else { 0 })
}
