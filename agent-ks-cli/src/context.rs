use crate::{args::Args, util::*};
use anyhow::{Context as _, Result, bail};
use serde::Serialize;
use serde_json::{Value, json};
use std::path::{Path, PathBuf};
#[derive(Serialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Context {
    pub content_root: PathBuf,
    pub config_dir: PathBuf,
    pub data_dir: PathBuf,
    pub env_path: Option<PathBuf>,
    pub env_dir: Option<PathBuf>,
    #[serde(skip)]
    pub site: Value,
}
impl Context {
    pub fn resolve(a: &Args) -> Result<Self> {
        let environment = std::env::var("AGENTKS_CONFIG_FOLDER").ok();
        let selected = a
            .get("config-dir")
            .or(environment.as_deref())
            .unwrap_or("./config");
        if selected.trim().is_empty() {
            bail!(
                "Configuration path is empty. Set --config-dir PATH or AGENTKS_CONFIG_FOLDER=PATH."
            );
        }
        let config = absolute(selected)?;
        if !config.is_dir() {
            bail!("Configuration directory not found: {}", config.display());
        }
        let config = config.canonicalize()?;
        let root = config
            .parent()
            .context("Configuration directory must have a parent")?
            .to_owned();
        let site_path = config.join("site.yaml");
        let site: Value = if site_path.is_file() {
            serde_yaml::from_str(&read(&site_path)?)
                .with_context(|| format!("Invalid YAML in {}", site_path.display()))?
        } else {
            json!({})
        };
        let mut c = Self {
            content_root: root.clone(),
            config_dir: config,
            data_dir: root.join("data"),
            env_path: None,
            env_dir: None,
            site,
        };
        if let Some(data) = c.site["paths"]["data"].as_str() {
            c.data_dir = c.resolve_alias_value(data)?;
        }
        Ok(c)
    }
    pub fn resolve_alias_value(&self, s: &str) -> Result<PathBuf> {
        if let Some(rest) = s.strip_prefix("@root") {
            if !rest.is_empty() && !rest.starts_with('/') {
                bail!("Unknown alias: {s}");
            }
            return Ok(normalize(
                &self.framework_root().join(rest.trim_start_matches('/')),
            ));
        }
        if s.starts_with('@') {
            bail!("Nested path aliases are not supported: {s}");
        }
        Ok(normalize(&self.config_dir.join(s)))
    }
    pub fn framework_root(&self) -> PathBuf {
        if self.content_root.join("astro-doc-code").is_dir() {
            self.content_root.clone()
        } else if self
            .content_root
            .parent()
            .is_some_and(|p| p.join("astro-doc-code").is_dir())
        {
            self.content_root.parent().unwrap().to_owned()
        } else {
            self.content_root.join("agent-knowledge-system")
        }
    }
    pub fn resolve_path(&self, s: &str) -> Result<PathBuf> {
        if let Some(alias) = s.strip_prefix('@') {
            let (key, tail) = alias.split_once('/').unwrap_or((alias, ""));
            let base = if key == "root" {
                self.framework_root()
            } else {
                self.resolve_alias_value(
                    self.site["paths"][key]
                        .as_str()
                        .with_context(|| format!("Unknown path alias @{key}"))?,
                )?
            };
            let p = normalize(&base.join(tail));
            return inside(&p, &base);
        }
        Ok(normalize(&self.config_dir.join(s)))
    }
    pub fn sections(&self, kind: &str) -> Result<Vec<(String, PathBuf)>> {
        let mut out = Vec::new();
        if let Some(pages) = self.site["pages"].as_object() {
            for (name, p) in pages {
                if p["type"] == kind
                    && let Some(source) = p["data"].as_str()
                {
                    out.push((name.clone(), self.resolve_path(source)?));
                }
            }
        }
        if out.is_empty() {
            match kind {
                "issues" => out.push(("todo".into(), self.data_dir.join("todo"))),
                "blog" => out.push(("blog".into(), self.data_dir.join("blog"))),
                "docs" => {
                    for p in children(&self.data_dir)? {
                        let name = p.file_name().unwrap().to_string_lossy();
                        if p.is_dir()
                            && !name.starts_with('.')
                            && !["todo", "blog", "pages", "assets"].contains(&name.as_ref())
                        {
                            out.push((name.into_owned(), p));
                        }
                    }
                }
                _ => {}
            }
        }
        Ok(out)
    }
    pub fn classify(&self, p: &Path) -> Result<&'static str> {
        if p.starts_with(&self.config_dir) {
            return Ok("config");
        }
        for kind in ["issues", "blog"] {
            if self
                .sections(kind)?
                .iter()
                .any(|(_, root)| p.starts_with(root))
            {
                return Ok(kind);
            }
        }
        Ok("docs")
    }
}
pub fn tracker(a: &Args) -> Result<PathBuf> {
    if let Some(p) = a.get("tracker") {
        let p = absolute(p)?;
        if !p.is_dir() {
            bail!("Tracker directory not found: {}", p.display());
        }
        return Ok(p.canonicalize()?);
    }
    let c = Context::resolve(a)?;
    let sections = c.sections("issues")?;
    if sections.len() != 1 {
        bail!("Multiple issue trackers configured; select one with --tracker PATH");
    }
    let p = sections[0].1.clone();
    if !p.is_dir() {
        bail!("Tracker directory not found: {}", p.display());
    }
    Ok(p)
}
