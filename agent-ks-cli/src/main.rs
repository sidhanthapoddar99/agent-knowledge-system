mod args;
mod checks;
mod content;
mod context;
mod extras;
mod images;
mod issues;
mod links;
mod navigate;
mod scaffold;
mod theme;
mod update;
mod util;
use anyhow::Result;
use args::Args;
use std::io::{self, Write};

fn run() -> Result<i32> {
    let raw: Vec<String> = std::env::args().skip(1).collect();
    if raw == ["__update-check"] {
        return update::background(false);
    }
    if raw == ["__auto-update"] {
        return update::background(true);
    }
    let a = Args::parse(raw)?;
    if a.has("version") {
        println!("agent-ks {}", env!("CARGO_PKG_VERSION"));
        return Ok(0);
    }
    if a.has("help") || a.command == "help" {
        return args::help(&a);
    }
    if a.command == "update" {
        return update::run(&a);
    }
    if a.command == "init" {
        return update::init(&a);
    }
    match a.command.as_str() {
        "resolve-context" => {
            let c = context::Context::resolve(&a)?;
            if a.has("json") {
                util::emit(&serde_json::to_value(&c)?)?;
            } else {
                println!(
                    "CONTENT_ROOT={}\nCONFIG_DIR={}\nDATA_DIR={}",
                    c.content_root.display(),
                    c.config_dir.display(),
                    c.data_dir.display()
                );
            }
            Ok(0)
        }
        "find" | "doc list" | "doc show" | "doc search" | "blog list" | "blog show"
        | "blog search" => content::run(&a),
        x if x.starts_with("issue new-") || x == "issue add-comment" || x == "issue set-state" => {
            scaffold::run(&a)
        }
        "issue tree" | "issue context" => navigate::run(&a),
        x if x.starts_with("issue ") => issues::run(&a),
        x if x.starts_with("check ") => checks::run(&a),
        "move" => links::move_path(&a),
        _ => extras::run(&a),
    }
}
fn main() {
    let code = match run() {
        Ok(code) => code,
        Err(e) => {
            if e.chain().any(|e| {
                e.downcast_ref::<io::Error>()
                    .is_some_and(|e| e.kind() == io::ErrorKind::BrokenPipe)
            }) {
                0
            } else {
                eprintln!("agent-ks: {e:#}");
                if e.downcast_ref::<args::Usage>().is_some() {
                    2
                } else {
                    1
                }
            }
        }
    };
    let _ = io::stdout().flush();
    std::process::exit(code);
}
