use crate::{
    args::{Args, usage},
    content,
    context::{self, Context},
    issues,
    util::*,
};
use anyhow::Result;
use serde_json::{Value, json};
use std::path::Path;
pub fn run(a: &Args) -> Result<i32> {
    match a.command.as_str() {
        "overview" => {
            let c = Context::resolve(a)?;
            let mut sections = vec![];
            for kind in ["docs", "blog", "issues"] {
                for (name, p) in c.sections(kind)? {
                    let mut row = json!({"name":name,"type":kind,"path":rel(&p,&c.content_root),"files":optional_walk(&p,content::TEXT_EXT)?.len()});
                    if kind == "issues" && p.is_dir() {
                        let mut counts = serde_json::Map::new();
                        for d in issues::issue_dirs(&p)? {
                            let m = json_file(&d.join("settings.json"))?;
                            let s = issues::state(&m);
                            let n = counts.get(s).and_then(Value::as_u64).unwrap_or(0);
                            counts.insert(s.to_owned(), json!(n + 1));
                        }
                        row["statuses"] = json!(counts);
                    }
                    sections.push(row);
                }
            }
            let v = json!({"projectRoot":c.content_root,"configDir":c.config_dir,"dataDir":c.data_dir,"sections":sections,"next":["agent-ks issue list","agent-ks issue context <id>","agent-ks find <pattern>","agent-ks --help"]});
            if a.has("json") {
                emit(&v)?;
            } else {
                println!(
                    "agent-ks {}\nProject: {}\nConfig: {}\n",
                    env!("CARGO_PKG_VERSION"),
                    c.content_root.display(),
                    c.config_dir.display()
                );
                for s in &sections {
                    println!(
                        "{:<20} {:<8} {:>5} files  {}",
                        s["name"].as_str().unwrap(),
                        s["type"].as_str().unwrap(),
                        s["files"],
                        s["path"].as_str().unwrap()
                    );
                    if let Some(statuses) = s["statuses"].as_object() {
                        println!(
                            "  {}",
                            statuses
                                .iter()
                                .map(|(s, n)| format!("{s}: {n}"))
                                .collect::<Vec<_>>()
                                .join(" · ")
                        );
                    }
                }
                println!("\nNext: agent-ks issue list | agent-ks find <pattern> | agent-ks --help");
            }
            Ok(0)
        }
        "issue tree" | "issue context" => {
            let root = context::tracker(a)?;
            let dir = issues::issue(&root, a.positional(0)?)?;
            let max = a.number("limit", 200)?;
            let depth = a.number("depth", 5)?;
            if a.command == "issue tree" {
                let mut rows = vec![];
                for p in walk(&dir, content::TEXT_EXT)? {
                    let relative = rel(&p, &dir);
                    if relative.split('/').count() > depth {
                        continue;
                    }
                    let mut row = json!({"path":relative,"bytes":p.metadata()?.len()});
                    if p.extension().is_some_and(|e| e == "md") {
                        let fm = metadata(&p)?;
                        row["title"] = fm["title"].clone();
                        row["status"] = fm["status"].clone();
                    }
                    rows.push(row);
                }
                let total = rows.len();
                rows.truncate(max);
                return result(
                    a,
                    json!({"issue":a.positional(0)?,"root":dir,"total":total,"truncated":total>rows.len(),"files":rows}),
                );
            }
            let meta = json_file(&dir.join("settings.json"))?;
            let all = issues::subtasks(&dir)?;
            let mut subs = all
                .iter()
                .filter(|s| issues::category(s["status"].as_str().unwrap()) != "closed")
                .cloned()
                .collect::<Vec<_>>();
            let active_count = subs.len();
            subs.truncate(max);
            for sub in &mut subs {
                let p = Path::new(sub["filePath"].as_str().unwrap());
                sub["filePath"] = json!(rel(p, &dir));
            }
            let mut logs = issues::logs(&dir, false)?;
            let last = a.number("last", 3)?;
            if logs.len() > last {
                logs.drain(..logs.len() - last);
            }
            for log in &mut logs {
                if let Some(rounds) = log["rounds"].as_array_mut() {
                    let count = rounds.len();
                    if count > max {
                        rounds.drain(..count - max);
                    }
                    log["roundCount"] = json!(count);
                    log["roundsTruncated"] = json!(count > max);
                }
            }
            let mut plans = vec![];
            if dir.join("plans").is_dir() {
                for p in children(&dir.join("plans"))? {
                    if p.is_dir() {
                        let settings = prefer_jsonc(&p.join("settings.json"));
                        let m = if settings.is_file() {
                            json_file(&settings)?
                        } else {
                            json!({})
                        };
                        plans.push(json!({"path":rel(&p,&dir),"title":m["title"],"status":issues::state(&m),"overview":rel(&p.join("overview.md"),&dir)}));
                    }
                }
            }
            let active = plans
                .iter()
                .rev()
                .find(|p| issues::category(p["status"].as_str().unwrap()) != "closed")
                .cloned();
            let plan_count = plans.len();
            if plan_count > max {
                plans.drain(..plan_count - max);
            }
            let body_path = dir.join("issue.md");
            let budget = a.number("max-chars", 4000)?;
            let (body, truncated) = if body_path.is_file() {
                let text = read(&body_path)?;
                let body = text.chars().take(budget).collect::<String>();
                let truncated = body.len() < text.len();
                (body, truncated)
            } else {
                (String::new(), false)
            };
            result(
                a,
                json!({"issue":a.positional(0)?,"root":dir,"meta":meta,"body":{"path":"issue.md","text":body,"truncated":truncated},"activePlan":active,"plans":plans,"planCount":plan_count,"plansTruncated":plan_count>max,"subtasks":{"total":all.len(),"active":active_count,"truncated":active_count>subs.len(),"items":subs},"recentLogs":logs,"memory":if dir.join("agent-memory/memory.md").is_file(){Some("agent-memory/memory.md")}else{None}}),
            )
        }
        _ => usage(format!("Unknown command {}", a.command)),
    }
}
