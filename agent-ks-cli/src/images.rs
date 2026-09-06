use crate::{
    args::{Args, usage},
    context::Context,
    extras::command,
    links,
    util::*,
};
use anyhow::{Context as _, Result, bail};
use regex::Regex;
use serde_json::json;
use std::{
    collections::BTreeSet,
    fs,
    process::{Command, Stdio},
};
fn number(a: &Args, k: &str) -> Result<Option<f64>> {
    a.get(k)
        .map(|v| {
            let n = v
                .trim_end_matches('%')
                .parse::<f64>()
                .map_err(|_| crate::args::Usage(format!("--{k} requires a positive number")))?;
            if !n.is_finite() || n <= 0.0 {
                return usage(format!("--{k} requires a positive number"));
            }
            Ok(n)
        })
        .transpose()
}
fn size(s: &str) -> Result<u64> {
    let re = crate::regex!(r"(?i)^([0-9]+(?:\.[0-9]+)?)\s*([kmg]?)b?$");
    let c = re
        .captures(s)
        .ok_or_else(|| crate::args::Usage("--target-size requires bytes, KB, MB, or GB".into()))?;
    let m = match c[2].to_lowercase().as_str() {
        "k" => 1024.0,
        "m" => 1048576.0,
        "g" => 1073741824.0,
        _ => 1.0,
    };
    Ok((c[1].parse::<f64>()? * m) as u64)
}
pub fn run(a: &Args) -> Result<i32> {
    if a.pos.is_empty() {
        return usage("img requires image paths");
    }
    if a.has("out") && a.has("in-place") {
        return usage("Use --out or --in-place, not both");
    }
    let exts = [
        "png", "jpg", "jpeg", "webp", "avif", "gif", "tif", "tiff", "bmp",
    ];
    let mut inputs = BTreeSet::new();
    for s in &a.pos {
        let p = absolute(s)?;
        let paths = if s.contains('*') || s.contains('?') {
            let pat = p.file_name().unwrap().to_string_lossy();
            let re = Regex::new(&format!(
                "^{}$",
                regex::escape(&pat).replace(r"\*", ".*").replace(r"\?", ".")
            ))?;
            children(p.parent().unwrap())?
                .into_iter()
                .filter(|p| re.is_match(&p.file_name().unwrap().to_string_lossy()))
                .collect::<Vec<_>>()
        } else if p.is_dir() {
            let mut out = vec![];
            for e in walkdir::WalkDir::new(&p)
                .max_depth(if a.has("recursive") { usize::MAX } else { 1 })
                .follow_links(false)
            {
                let e = e?;
                if e.file_type().is_file() {
                    out.push(e.into_path());
                }
            }
            out
        } else if p.is_file() {
            vec![p]
        } else {
            bail!("Image not found: {s}");
        };
        for p in paths {
            if p.extension()
                .is_some_and(|e| exts.contains(&e.to_string_lossy().to_lowercase().as_str()))
            {
                inputs.insert(p);
            }
        }
    }
    if inputs.is_empty() {
        bail!("No images matched");
    }
    let engine = ["magick", "convert"]
        .into_iter()
        .find(|p| {
            Command::new(p)
                .arg("-version")
                .stdout(Stdio::null())
                .stderr(Stdio::null())
                .status()
                .is_ok_and(|s| s.success())
        })
        .context("ImageMagick is required for img; install magick or convert on PATH")?;
    let format = a
        .get("format")
        .map(|s| s.trim_start_matches('.').to_lowercase())
        .map(|s| if s == "jpeg" { "jpg".into() } else { s });
    if format
        .as_ref()
        .is_some_and(|s| !["webp", "avif", "png", "jpg"].contains(&s.as_str()))
    {
        return usage("--format supports webp, avif, png, jpg");
    }
    let quality = number(a, "quality")?.unwrap_or(80.0);
    if quality > 100.0 {
        return usage("--quality must be 1–100");
    }
    let width = number(a, "width")?;
    let height = number(a, "height")?;
    let max = number(a, "max-dim")?;
    let scale = number(a, "scale")?;
    let dpr = number(a, "dpr")?;
    for k in ["depth", "colors"] {
        number(a, k)?;
    }
    let target = a.get("target-size").map(size).transpose()?;
    let backup = a
        .get("backup")
        .map(absolute)
        .transpose()?
        .unwrap_or_else(|| {
            std::env::temp_dir().join(format!("agent-ks-img-backup-{}", std::process::id()))
        });
    let mut destinations = BTreeSet::new();
    let mut plan = vec![];
    for src in inputs {
        let fmt = format
            .clone()
            .unwrap_or_else(|| src.extension().unwrap().to_string_lossy().to_lowercase());
        let dest = if let Some(out) = a.get("out") {
            absolute(out)?
                .join(src.file_name().unwrap())
                .with_extension(&fmt)
        } else {
            src.with_extension(&fmt)
        };
        if !destinations.insert(dest.clone()) || dest != src && dest.exists() {
            bail!("Destination collision: {}", dest.display());
        }
        plan.push((src, dest, fmt));
    }
    if a.has("dry-run") {
        return result(
            a,
            json!({"dryRun":true,"engine":engine,"backup":if a.has("no-backup")||a.has("out"){None}else{Some(&backup)},"files":plan.iter().map(|(s,d,_)|json!({"from":s,"to":d})).collect::<Vec<_>>()}),
        );
    }
    let links_root = if a.has("rewrite-links") {
        Some(if let Some(p) = a.get("links-root") {
            absolute(p)?
        } else {
            Context::resolve(a)?.content_root
        })
    } else {
        None
    };
    let mut rows = vec![];
    let mut renames = vec![];
    for (index, (src, dest, fmt)) in plan.iter().enumerate() {
        let mut ops = vec![src.to_string_lossy().into_owned(), "-auto-orient".into()];
        let geometry = if width.is_some() || height.is_some() {
            Some(format!(
                "{}x{}>",
                width.map(|n| n.to_string()).unwrap_or_default(),
                height.map(|n| n.to_string()).unwrap_or_default()
            ))
        } else if let Some(m) = max {
            Some(format!("{m}x{m}>"))
        } else if let Some(s) = scale {
            Some(format!("{}%", s.min(100.0)))
        } else {
            dpr.map(|d| format!("{}%", (100.0 / d).min(100.0)))
        };
        if let Some(g) = geometry {
            ops.extend(["-resize".into(), g]);
        }
        if a.has("trim") {
            ops.extend(["-trim".into(), "+repage".into()]);
        }
        if a.has("gray") {
            ops.extend(["-colorspace".into(), "Gray".into()]);
        }
        if let Some(v) = a.get("depth") {
            ops.extend(["-depth".into(), v.into()]);
        }
        if let Some(v) = a.get("colors") {
            ops.extend([
                "-dither".into(),
                a.get("dither").unwrap_or("None").into(),
                "-colors".into(),
                v.into(),
            ]);
        } else if let Some(v) = a.get("dither") {
            ops.extend(["-dither".into(), v.into()]);
        }
        if !a.has("no-strip") {
            ops.push("-strip".into());
        }
        if fmt == "webp" && a.has("lossless") {
            ops.extend(["-define".into(), "webp:lossless=true".into()]);
        }
        if fmt == "png" {
            ops.extend(["-define".into(), "png:compression-level=9".into()]);
        }
        fs::create_dir_all(dest.parent().unwrap())?;
        let temp = dest.with_file_name(format!(
            ".agent-ks-img-{}-{index}.{fmt}",
            std::process::id()
        ));
        if temp.exists() {
            bail!("Temporary output exists: {}", temp.display());
        }
        let mut q = quality as u64;
        let encode = (|| -> Result<()> {
            loop {
                let mut args = ops.clone();
                args.extend([
                    "-quality".into(),
                    q.to_string(),
                    format!("{fmt}:{}", temp.display()),
                ]);
                command(engine, &args, &std::env::current_dir()?)?;
                let bytes = fs::metadata(&temp)?.len();
                if target.is_none_or(|n| bytes <= n) {
                    break;
                }
                if q <= 10 || fmt == "png" || a.has("lossless") {
                    bail!(
                        "Cannot meet target size for {}; original preserved",
                        src.display()
                    );
                }
                q = q.saturating_sub(5).max(10);
            }
            Ok(())
        })();
        if let Err(e) = encode {
            let _ = fs::remove_file(&temp);
            return Err(e);
        }
        let before = fs::metadata(src)?.len();
        let after = fs::metadata(&temp)?.len();
        if !a.has("no-backup") && !a.has("out") {
            fs::create_dir_all(&backup)?;
            let b = backup.join(format!(
                "{index:04}-{}",
                src.file_name().unwrap().to_string_lossy()
            ));
            if b.exists() {
                let _ = fs::remove_file(&temp);
                bail!("Backup already exists: {}", b.display());
            }
            fs::copy(src, &b)?;
        }
        fs::rename(&temp, dest)?;
        if src != dest && !a.has("out") {
            renames.push((src.clone(), dest.clone()));
        }
        rows.push(
            json!({"source":src,"destination":dest,"before":before,"after":after,"quality":q}),
        );
    }
    if let Some(root) = links_root {
        for p in walk(&root, &["md"])? {
            let raw = read(&p)?;
            let (text, _) = links::rewritten(&raw, &p, &p, &renames);
            if text != raw {
                atomic_write(&p, &text)?;
            }
        }
    }
    for (src, _) in renames {
        fs::remove_file(src)?;
    }
    if a.has("quiet") && !a.has("json") {
        Ok(0)
    } else {
        result(
            a,
            json!({"files":rows,"backup":if a.has("no-backup")||a.has("out"){None}else{Some(backup)}}),
        )
    }
}
