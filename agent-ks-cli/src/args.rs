use anyhow::Result;
use serde_json::{Value, json};
use std::collections::BTreeMap;
#[derive(Debug)]
pub struct Usage(pub String);
impl std::fmt::Display for Usage {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}
impl std::error::Error for Usage {}
pub fn usage<T>(s: impl Into<String>) -> Result<T> {
    Err(Usage(s.into()).into())
}
#[derive(Default, Debug)]
pub struct Args {
    pub command: String,
    pub pos: Vec<String>,
    pub flags: BTreeMap<String, String>,
}
pub fn manifest() -> Vec<Value> {
    let mut m: Vec<Value> =
        serde_json::from_str(include_str!("manifest.json")).expect("embedded manifest");
    for c in &mut m {
        let command = command_name(c);
        let flags = c["flags"].as_array_mut().unwrap();
        flags.push(json!({"name":"config-dir","value":"path","desc":"Configuration directory (default ./config); project root is its parent"}));
        if !flags.iter().any(|f| f["name"] == "json") {
            flags.push(json!({"name":"json","desc":"Structured JSON output"}));
        }
        if command == "find" || command.ends_with(" search") || command == "issue list" {
            for (name, value, desc) in [
                ("fixed-strings", None, "Treat the pattern as literal text"),
                ("context", Some("N"), "Include N surrounding lines"),
                ("limit", Some("N"), "Maximum results; zero returns none"),
                ("paths-only", None, "Return unique matching paths"),
            ] {
                if !flags.iter().any(|f| f["name"] == name) {
                    let mut f = json!({"name":name,"desc":desc});
                    if let Some(v) = value {
                        f["value"] = json!(v);
                    }
                    flags.push(f);
                }
            }
        }
        if command == "doc search" {
            flags.push(json!({"name":"section","value":"name","desc":"Search one docs section"}));
        }
    }
    m.push(json!({"bin":"start","group":null,"verb":"start","runtime":"native","summary":"Start the project viewer; clone the framework if absent","flags":[{"name":"config-dir","value":"path","desc":"Configuration directory (default ./config)"},{"name":"framework-dir","value":"path","desc":"Framework checkout (default <project>/agent-knowledge-system)"},{"name":"framework-ref","value":"ref","desc":"Tag or branch for a new clone"},{"name":"detach","desc":"Run the server in the background"},{"name":"no-clean","desc":"Keep build caches"},{"name":"follow","desc":"Follow server logs"},{"name":"dry-run","desc":"Show clone and launch details without changing files"},{"name":"json","desc":"Structured launch plan; use with --dry-run"}]}));
    m
}
pub fn command_name(c: &Value) -> String {
    [
        c["group"].as_str().unwrap_or(""),
        c["verb"].as_str().unwrap_or(""),
    ]
    .into_iter()
    .filter(|x| !x.is_empty())
    .collect::<Vec<_>>()
    .join(" ")
}
impl Args {
    pub fn has(&self, k: &str) -> bool {
        self.flags.contains_key(k)
    }
    pub fn get(&self, k: &str) -> Option<&str> {
        self.flags.get(k).map(String::as_str)
    }
    pub fn required(&self, k: &str) -> Result<&str> {
        self.get(k)
            .ok_or_else(|| Usage(format!("--{k} is required")).into())
    }
    pub fn positional(&self, n: usize) -> Result<&str> {
        self.pos.get(n).map(String::as_str).ok_or_else(|| {
            Usage(format!(
                "{}: missing argument {} (see --help)",
                self.command,
                n + 1
            ))
            .into()
        })
    }
    pub fn number(&self, k: &str, default: usize) -> Result<usize> {
        match self.get(k) {
            Some(s) => s
                .parse()
                .map_err(|_| Usage(format!("--{k} requires a nonnegative integer")).into()),
            None => Ok(default),
        }
    }
    pub fn csv(&self, k: &str) -> Vec<&str> {
        self.get(k)
            .unwrap_or("")
            .split(',')
            .map(str::trim)
            .filter(|s| !s.is_empty())
            .collect()
    }
    pub fn parse(mut input: Vec<String>) -> Result<Self> {
        let mut a = Self::default();
        let mut i = 0;
        // Global config flag works before or after the command, but never beyond --.
        while i < input.len() && input[i] != "--" {
            if input[i] == "--config-dir" {
                if i + 1 == input.len() || input[i + 1].starts_with("--") {
                    return usage("--config-dir requires a path");
                }
                a.flags.insert("config-dir".into(), input.remove(i + 1));
                input.remove(i);
            } else if let Some(v) = input[i].strip_prefix("--config-dir=") {
                a.flags.insert("config-dir".into(), v.into());
                input.remove(i);
            } else {
                i += 1;
            }
        }
        if input.is_empty() {
            a.command = "overview".into();
            return Ok(a);
        }
        if input == ["--version"] || input == ["-V"] || input == ["-v"] || input == ["version"] {
            a.flags.insert("version".into(), "true".into());
            return Ok(a);
        }
        if input[0] == "--json" {
            input.insert(0, "overview".into());
        }
        let m = manifest();
        if ["issue", "doc", "blog", "check", "git", "theme"].contains(&input[0].as_str())
            && (input.len() == 1 || input.get(1).is_some_and(|s| s == "--help" || s == "-h"))
        {
            a.command = "help".into();
            a.pos.push(input[0].clone());
            if input.iter().any(|s| s == "--json") {
                a.flags.insert("json".into(), "true".into());
            }
            return Ok(a);
        }
        if input[0] == "--help" || input[0] == "-h" {
            input[0] = "help".into();
        }
        let mut entry = None;
        for c in &m {
            let name = command_name(c);
            let words: Vec<_> = name.split_whitespace().collect();
            if input.len() >= words.len() && words.iter().enumerate().all(|(i, w)| input[i] == *w) {
                entry = Some(c);
                a.command = name.clone();
                input.drain(..words.len());
                break;
            }
            if c["bin"].as_str() == Some(input[0].as_str()) {
                entry = Some(c);
                a.command = name;
                input.remove(0);
                break;
            }
        }
        let c = match entry {
            Some(c) => c,
            None => return usage(format!("Unknown command: {}. Run agent-ks help.", input[0])),
        };
        let flags = c["flags"].as_array().unwrap();
        let mut it = input.into_iter();
        while let Some(token) = it.next() {
            if token == "--" {
                a.pos.extend(it);
                break;
            }
            if token == "--help" || token == "-h" {
                a.flags.insert("help".into(), "true".into());
                continue;
            }
            if !token.starts_with('-') || token == "-" {
                a.pos.push(token);
                continue;
            }
            let raw = token.trim_start_matches('-');
            let (name, inline) = raw
                .split_once('=')
                .map_or((raw, None), |(k, v)| (k, Some(v)));
            let flag = flags.iter().find(|f| {
                f["name"].as_str() == Some(name)
                    || (token.starts_with('-')
                        && !token.starts_with("--")
                        && f["alias"].as_str() == Some(name))
            });
            let Some(flag) = flag else {
                return usage(format!(
                    "Unknown flag {token}. Valid flags: --help, {}",
                    flags
                        .iter()
                        .map(|f| format!("--{}", f["name"].as_str().unwrap()))
                        .collect::<Vec<_>>()
                        .join(", ")
                ));
            };
            let key = flag["name"].as_str().unwrap();
            let value = if flag.get("value").is_some() {
                match inline {
                    Some(s) if !s.is_empty() => s.to_owned(),
                    Some(_) => return usage(format!("--{key} requires a value")),
                    None => match it.next() {
                        Some(s) if !s.starts_with("--") => s,
                        _ => return usage(format!("--{key} requires a value")),
                    },
                }
            } else {
                if inline.is_some() {
                    return usage(format!("--{key} does not take a value"));
                }
                "true".into()
            };
            if a.flags.insert(key.into(), value).is_some() {
                return usage(format!("--{key} supplied more than once"));
            }
        }
        for k in [
            "limit",
            "context",
            "last",
            "subtasks-min",
            "subtasks-max",
            "depth",
            "max-chars",
        ] {
            if a.has(k) {
                a.number(k, 0)?;
            }
        }
        if !a.has("help") && a.command != "help" {
            let (min, max) = match a.command.as_str() {
                "init" | "find" | "doc show" | "blog show" | "blog search" | "issue show"
                | "issue tree" | "issue context" | "issue agent-logs" | "check section"
                | "check skill-links" | "git updated" | "git log" => (1, 1),
                "doc search" => (1, 2),
                "move" | "issue set-state" => (2, 2),
                "issue subtasks" => (if a.has("all") { 0 } else { 1 }, 1),
                x if x.starts_with("issue new-") || x == "issue add-comment" => (1, 1),
                "doc list" | "theme tokens" | "check blog" | "check config" | "check link-form"
                | "check legacy-tags" => (0, 1),
                "img" => (1, usize::MAX),
                "start" => (0, usize::MAX),
                _ => (0, 0),
            };
            if a.pos.len() < min || a.pos.len() > max {
                return usage(format!(
                    "Usage: agent-ks {} {} [options]; see --help",
                    a.command,
                    synopsis(&a.command)
                ));
            }
            let required: &[&str] = match a.command.as_str() {
                "git changed" => &["since"],
                "git commit" => &["scope", "message"],
                "issue add-comment" => &["author", "body"],
                "issue new-plan" => &["name"],
                "issue new-stage" => &["name", "plan"],
                "issue new-agent-log" => &["name", "kind"],
                "issue new-round" | "issue new-iteration" => &["name", "log"],
                "issue new-subtask" if !a.has("index") => &["name"],
                _ => &[],
            };
            for k in required {
                a.required(k)?;
            }
        }
        Ok(a)
    }
}
fn synopsis(command: &str) -> &str {
    match command {
        "init" => "<bash|zsh|fish|powershell>",
        "find" => "<pattern>",
        "doc search" => "<pattern> [section]",
        "blog search" => "<pattern>",
        "doc list" => "[section]",
        "doc show" | "blog show" => "<name|path|slug>",
        "issue list" | "issue review-queue" | "overview" | "resolve-context" => "",
        "issue show" | "issue tree" | "issue context" | "issue agent-logs" => "<issue-id>",
        "issue subtasks" => "<issue-id> | --all",
        "issue set-state" => "<issue-id|stage-path> <status>",
        "issue add-comment" => "<issue-id> --author <name> --body <markdown>",
        "issue new-subtask" => "<issue-id> --name <slug>",
        "issue new-plan" => "<issue-id> --name <slug>",
        "issue new-stage" => "<issue-id> --plan <folder> --name <slug>",
        "issue new-agent-log" => "<issue-id> --kind <code> --name <slug>",
        "issue new-round" | "issue new-iteration" => "<issue-id> --log <folder> --name <slug>",
        "move" => "<from> <to>",
        "img" => "<path...>",
        "check section" => "<folder>",
        "check skill-links" => "<skills-folder>",
        "check issues" => "",
        "check config" => "[config-folder]",
        "check blog" | "check link-form" | "check legacy-tags" => "[folder]",
        "git updated" | "git log" => "<issue-id|path>",
        "git changed" => "--since <revision>",
        "git commit" => "--scope <path> --message <text>",
        "theme tokens" => "[theme-name]",
        "start" => "[dev|build|preview|doctor|update|stop|status|logs|clean]",
        "help" => "[group [command]]",
        _ => "",
    }
}
fn example(command: &str) -> String {
    match command {
 "init"=>"agent-ks init bash".into(),
 "update"=>"agent-ks update --check\n  agent-ks update\n  agent-ks update --disable".into(),
 "find"=>"agent-ks find 'release process' --fixed-strings --context 2 --limit 20 --json".into(),
 "issue list"=>"agent-ks issue list --status all --search 'authentication' --json".into(),
 "issue context"=>"agent-ks issue context 2026-09-06-cli --last 2 --max-chars 2000 --json".into(),
 "issue tree"=>"agent-ks issue tree 2026-09-06-cli --depth 3 --limit 80 --json".into(),
 "issue new-subtask"=>"agent-ks issue new-subtask 2026-09-06-cli --name verify-search --overview 'Verify search results'".into(),
 "doc list"=>"agent-ks doc list --json".into(),
 "doc show"=>"agent-ks doc show 10_intro.md --json".into(),
 "doc search"=>"agent-ks doc search 'installation' --context 1 --limit 10 --json".into(),
 "blog list"=>"agent-ks blog list --json".into(),
 "blog show"=>"agent-ks blog show introducing-issues --json".into(),
 "blog search"=>"agent-ks blog search 'release' --limit 10 --json".into(),
 "issue show"=>"agent-ks issue show 2026-09-06-cli --json".into(),
 "issue subtasks"=>"agent-ks issue subtasks --all --status review --json".into(),
 "issue agent-logs"=>"agent-ks issue agent-logs 2026-09-06-cli --last 3 --json".into(),
 "issue set-state"=>"agent-ks issue set-state 2026-09-06-cli in-progress --subtask 10 --json".into(),
 "issue add-comment"=>"agent-ks issue add-comment 2026-09-06-cli --author codex --body 'Search verification passed.' --json".into(),
 "issue new-plan"=>"agent-ks issue new-plan 2026-09-06-cli --name implementation --json".into(),
 "issue new-stage"=>"agent-ks issue new-stage 2026-09-06-cli --plan 01_implementation --name verify --subtask 10 --json".into(),
 "issue new-agent-log"=>"agent-ks issue new-agent-log 2026-09-06-cli --kind au --name verify --for 10 --json".into(),
 "issue new-round" | "issue new-iteration"=>"agent-ks issue new-round 2026-09-06-cli --log 010_au_verify --name audit --json".into(),
 "check section"=>"agent-ks check section data/guide --json".into(),
 "check skill-links"=>"agent-ks check skill-links plugins/agent-ks/skills --json".into(),
 "check config" | "check blog" | "check link-form" | "check legacy-tags"=>format!("agent-ks {command} --json"),
 "git updated" | "git log"=>format!("agent-ks {command} data/guide/10_intro.md --json"),
 "git changed"=>"agent-ks git changed --since HEAD~1 --json".into(),
 "git commit"=>"agent-ks git commit --scope data/guide --message 'Document installation' --dry-run --json".into(),
 "theme tokens"=>"agent-ks theme tokens --json".into(),
 "start"=>"agent-ks start --detach\n  agent-ks start status\n  agent-ks start stop".into(),
 "move"=>"agent-ks move data/guide/10_old.md data/guide/20_new.md --dry-run".into(),
 "img"=>"agent-ks img ./data/guide/assets/screen.png --format webp --max-dim 1600 --rewrite-links".into(),
 _=>format!("agent-ks {} {} --json",command,synopsis(command))
}
}
pub fn help(a: &Args) -> Result<i32> {
    let m = manifest();
    let query = if a.command == "help" {
        a.pos.join(" ")
    } else {
        a.command.clone()
    };
    let selected: Vec<_> = m
        .iter()
        .filter(|c| {
            query.is_empty()
                || command_name(c) == query
                || c["group"] == query
                || c["bin"] == query
                || c["verb"] == query
        })
        .collect();
    if selected.is_empty() {
        return usage(format!("Unknown command: {query}"));
    }
    if a.has("json") {
        let entries = selected
            .iter()
            .map(|c| {
                let mut c = (*c).clone();
                let cmd = command_name(&c);
                c["usage"] = json!(format!("agent-ks {cmd} {} [options]", synopsis(&cmd)));
                c["example"] = json!(example(&cmd));
                c
            })
            .collect::<Vec<_>>();
        crate::util::emit(&json!(entries))?;
        return Ok(0);
    }
    if selected.len() != 1 || query.is_empty() {
        println!(
            "agent-ks {} — native knowledge toolkit\n\nUsage: agent-ks [--config-dir PATH] <command> [options]\n",
            env!("CARGO_PKG_VERSION")
        );
        for c in selected {
            println!(
                "  {:24} {}",
                command_name(c),
                c["summary"].as_str().unwrap_or("")
            );
        }
        println!(
            "\nBare agent-ks shows the project overview.\nDiscover: agent-ks help <group> <command> | agent-ks help --json\n\nConfig: --config-dir PATH > AGENTKS_CONFIG_FOLDER > ./config.\nPaths are resolved from the working directory; the config parent is the project root.\nHelp and --version work without a project. Missing config is an error.\n\nOutput: --json emits one JSON document; diagnostics go to stderr.\nExit: 0 success, 1 no result/runtime error/validation errors, 2 invalid usage.\nDependencies: none for reading, search and scaffolding; Git for git commands,\nImageMagick for img, Node.js or Bun for start."
        );
        return Ok(0);
    }
    let c = selected[0];
    let cmd = command_name(c);
    println!(
        "Usage: agent-ks {cmd} {} [options]\n\n{}\n\nOptions:\n  --help, -h  Show this help",
        synopsis(&cmd),
        c["summary"].as_str().unwrap_or("")
    );
    if cmd == "update" || cmd == "init" {
        println!("  This command requires no project config.\n");
    }
    for f in c["flags"].as_array().unwrap() {
        let alias = f["alias"]
            .as_str()
            .map(|s| format!(", -{s}"))
            .unwrap_or_default();
        let value = f["value"]
            .as_str()
            .map(|s| format!(" <{s}>"))
            .unwrap_or_default();
        println!(
            "  --{}{alias}{value}\n      {}",
            f["name"].as_str().unwrap(),
            f["desc"].as_str().unwrap_or("")
        );
    }
    println!(
        "\nExample:\n  {}\n\nConfig: --config-dir PATH > AGENTKS_CONFIG_FOLDER > ./config.\nExit: 0 success, 1 no result/runtime error/validation errors, 2 invalid usage.",
        example(&cmd)
    );
    Ok(0)
}
