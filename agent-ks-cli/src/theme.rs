use crate::{args::Args, context::Context, util::*};
use anyhow::{Context as _, Result, bail};
use serde_json::{Value, json};
use std::{
    collections::{BTreeMap, BTreeSet},
    path::{Path, PathBuf},
};
const BUILTIN: &[(&str, &str)] = &[
    (
        "blogs.css",
        include_str!("../../agent-ks-engine/src/styles/blogs.css"),
    ),
    (
        "breakpoints.css",
        include_str!("../../agent-ks-engine/src/styles/breakpoints.css"),
    ),
    (
        "color.css",
        include_str!("../../agent-ks-engine/src/styles/color.css"),
    ),
    (
        "docs.css",
        include_str!("../../agent-ks-engine/src/styles/docs.css"),
    ),
    (
        "element.css",
        include_str!("../../agent-ks-engine/src/styles/element.css"),
    ),
    (
        "font.css",
        include_str!("../../agent-ks-engine/src/styles/font.css"),
    ),
    (
        "footer.css",
        include_str!("../../agent-ks-engine/src/styles/footer.css"),
    ),
    (
        "globals.css",
        include_str!("../../agent-ks-engine/src/styles/globals.css"),
    ),
    (
        "index.css",
        include_str!("../../agent-ks-engine/src/styles/index.css"),
    ),
    (
        "markdown.css",
        include_str!("../../agent-ks-engine/src/styles/markdown.css"),
    ),
    (
        "navbar.css",
        include_str!("../../agent-ks-engine/src/styles/navbar.css"),
    ),
    (
        "reset.css",
        include_str!("../../agent-ks-engine/src/styles/reset.css"),
    ),
    (
        "theme.yaml",
        include_str!("../../agent-ks-engine/src/styles/theme.yaml"),
    ),
];
fn theme_path(c: &Context, name: &str) -> Result<PathBuf> {
    if name == "default" || name == "@theme/default" {
        return Ok(PathBuf::from("@builtin"));
    }
    if name.starts_with('@') && !name.starts_with("@theme/") {
        return c.resolve_path(name);
    }
    if Path::new(name).is_absolute() {
        return Ok(name.into());
    }
    for root in strings(&c.site["theme_paths"]) {
        let p = c
            .resolve_path(&root)?
            .join(name.trim_start_matches("@theme/"));
        if p.join("theme.yaml").is_file() {
            return Ok(p);
        }
    }
    bail!("Theme not found: {name}")
}
fn text(dir: &Path, name: &str) -> Result<String> {
    if dir == Path::new("@builtin") {
        BUILTIN
            .iter()
            .find(|(n, _)| *n == name)
            .map(|(_, s)| s.to_string())
            .with_context(|| format!("Missing embedded theme file {name}"))
    } else {
        read(&inside(&dir.join(name), dir)?)
    }
}
fn css(
    c: &Context,
    dir: &Path,
    skip: &BTreeSet<String>,
    seen: &mut BTreeSet<PathBuf>,
) -> Result<String> {
    if !seen.insert(dir.to_owned()) {
        bail!("Theme inheritance cycle at {}", dir.display());
    }
    let man: Value = serde_yaml::from_str(&text(dir, "theme.yaml")?)?;
    let files = strings(&man["files"]);
    let mut result = String::new();
    if let Some(parent) = man["extends"].as_str()
        && man["override_mode"] != "replace"
    {
        let mut skip = skip.clone();
        if man["override_mode"] == "override" {
            skip.extend(files.clone());
        }
        result += &css(c, &theme_path(c, parent)?, &skip, seen)?;
    }
    for file in files {
        if file.ends_with(".css") && !skip.contains(&file) {
            result.push('\n');
            result += &text(dir, &file)?;
        }
    }
    seen.remove(dir);
    Ok(result)
}
fn expand(value: &str, map: &BTreeMap<String, String>, seen: &mut BTreeSet<String>) -> String {
    let re = crate::regex!(r"var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)");
    re.replace_all(value, |c: &regex::Captures| {
        let key = &c[1];
        if !seen.insert(key.into()) {
            return c[0].to_owned();
        }
        let out = if let Some(v) = map.get(key) {
            expand(v, map, seen)
        } else if let Some(f) = c.get(2) {
            expand(f.as_str(), map, seen)
        } else {
            c[0].to_owned()
        };
        seen.remove(key);
        out
    })
    .into_owned()
}
pub fn run(a: &Args) -> Result<i32> {
    let c = Context::resolve(a)?;
    let active = c.site["theme"]
        .as_str()
        .context("site.yaml requires theme")?;
    let name = a.pos.first().map(String::as_str).unwrap_or(active);
    let dir = theme_path(&c, name)?;
    let css = css(&c, &dir, &BTreeSet::new(), &mut BTreeSet::new())?;
    let clean = crate::regex!(r"(?s)/\*.*?\*/").replace_all(&css, "");
    let vars = crate::regex!(r"(--[\w-]+)\s*:\s*([^;]+?)\s*(?:;|$)");
    let mut light = BTreeMap::new();
    let mut dark = BTreeMap::new();
    let mut depth = 0;
    let mut selector_start = 0;
    let mut body_start = 0;
    let mut mode = 0;
    for (i, ch) in clean.char_indices() {
        if ch == '{' {
            if depth == 0 {
                let selector = clean[selector_start..i].trim();
                mode = if selector.split(',').any(|s| {
                    [
                        ":root",
                        ":root[data-theme=\"light\"]",
                        "[data-theme=\"light\"]",
                        ":root[data-theme='light']",
                        "[data-theme='light']",
                    ]
                    .contains(&s.trim())
                }) {
                    1
                } else if selector.split(',').any(|s| {
                    [
                        "[data-theme=\"dark\"]",
                        ":root[data-theme=\"dark\"]",
                        "[data-theme='dark']",
                        ":root[data-theme='dark']",
                    ]
                    .contains(&s.trim())
                }) {
                    2
                } else {
                    0
                };
                body_start = i + 1;
            }
            depth += 1;
        } else if ch == '}' {
            depth -= 1;
            if depth == 0 {
                if mode > 0 {
                    for m in vars.captures_iter(&clean[body_start..i]) {
                        if mode == 1 {
                            light.insert(m[1].into(), m[2].trim().into());
                        } else {
                            dark.insert(m[1].into(), m[2].trim().into());
                        }
                    }
                }
                selector_start = i + 1;
            }
        }
    }
    let mut merged = light.clone();
    merged.extend(dark);
    let resolve = |map: &BTreeMap<String, String>| {
        map.iter()
            .map(|(k, v)| (k.clone(), expand(v, map, &mut BTreeSet::new())))
            .collect::<BTreeMap<_, _>>()
    };
    let man: Value = serde_yaml::from_str(&text(&dir, "theme.yaml")?)?;
    result(
        a,
        json!({"theme":{"name":man["name"].as_str().unwrap_or(name),"key":name,"path":dir,"active":name==active},"light":resolve(&light),"dark":resolve(&merged)}),
    )
}
