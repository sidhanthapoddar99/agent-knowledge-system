---
title: "Claude Code Extensions — Plugins, Skills, MCP, Hooks, Subagents, Slash Commands"
created: 2026-04-25
tags: [claude-code, reference, extensions, plugins]
---

# Claude Code Extensions — what each thing is and how they relate

> [!summary]
> **Plugins are containers**, not a separate kind of capability. The actual capabilities a plugin can ship are: **Skills**, **Slash Commands**, **Hooks**, **MCP Servers**, **Subagents**. The model only ever interacts with the *contents*, never with "the plugin" as a unit. Plugins exist to solve **distribution, lifecycle, trust, and discovery** — not to add new model behaviour.

---

## TL;DR — the six things

| Thing | What it is | Who/what fires it | Where it lives |
|---|---|---|---|
| **Skill** | Markdown file (`SKILL.md` + optional refs/scripts) the *model* reads when triggered | Model — when description matches user intent | `skills/<name>/SKILL.md` |
| **Slash command** | Templated prompt; `/foo` expands into a pre-written prompt | User typing `/foo` | `commands/<name>.md` |
| **Hook** | Shell command the *harness* runs on lifecycle events | Runtime, not Claude | `settings.json → hooks` |
| **MCP server** | Separate process exposing tools/resources/prompts over the Model Context Protocol | Model calls a tool the server registered | `.mcp.json` registers the server; server runs externally |
| **Subagent** | Specialised Claude config (system prompt, tool allowlist, model) you can spawn | Main agent invokes via the `Agent` tool | `agents/<name>.md` |
| **Plugin** | A *bundle* containing any combination of the above | N/A — it's the package, not a capability | `plugin.json` + folders for each capability type |

> [!note] Mental model
> Plugin = the package. Skills/Commands/Hooks/MCP/Subagents = the capabilities the package contains. The model deals with the *unpacked* contents — it has no first-class concept of "plugin X."

---

## The five capability types in detail

### 1. \[[Skills]]

**Purpose:** Teach the model *how* to do something in your project.

A skill is a markdown file with YAML frontmatter:

```markdown
---
name: documentation-guide
description: Use this skill for ANY work in this Astro-based docs project — markdown, frontmatter, issue tracker, settings.json, etc. TRIGGER eagerly...
---

# Body — the actual instructions, conventions, examples

## Triage — pick the right reference file

| If the task involves… | Read |
|---|---|
| Frontmatter, custom tags  | `references/writing.md` |
| Issue tracker             | `references/issue-layout.md` |
```

**Lifecycle**:
1. Claude Code shows the skill's `description` in a system reminder (always in context, ~50-100 words)
2. When the model decides the description matches the user's intent, it loads the SKILL.md body
3. The model can optionally read referenced files (`references/`, `scripts/`) on demand
4. Optional bundled scripts can be executed via Bash

**Triggering is description-driven**. If the description doesn't match, the body never loads. This is why writing a tight, specific description matters.

> [!tip]
> Skills are *passive*. They don't run on their own; they teach. To make Claude *do* something specific (like a one-shot operation), use a Slash Command instead — or the skill can document a slash command's usage.

---

### 2. Slash Commands

**Purpose:** Give the user (and the model) a one-shot trigger that expands into a pre-written prompt.

A slash command is a markdown file:

```markdown
---
description: Run a security review of the current branch
---

Review the changes in the current branch for OWASP Top 10 issues...
```

**Lifecycle**:
1. User types `/<name>` (or model invokes via the Skill tool)
2. The body is injected into the conversation as if the user had typed it
3. Model proceeds normally from that point

**Variables**: `$ARGUMENTS`, `$1`, `$2`, … allow templated prompts:

```markdown
Run the linter on $1 and report errors.
```

User types `/lint src/foo.ts` → expands to "Run the linter on src/foo.ts and report errors."

> [!note] Skill vs Command
> A **skill** is a *reference document* the model reads when relevant. A **command** is an *invocable prompt template* the user fires explicitly. Both are markdown; the difference is who triggers and when.

---

### 3. Hooks

**Purpose:** Have the *runtime* do something automatically on lifecycle events. Not Claude — the harness.

Configured in `settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "echo 'about to run bash'" }
        ]
      }
    ]
  }
}
```

**Events**:
- `PreToolUse` / `PostToolUse` — before/after a tool call
- `UserPromptSubmit` — before each prompt is sent to the model
- `Stop` / `SubagentStop` — when the agent finishes
- `Notification` — when Claude needs user attention
- `SessionStart` — when a new session opens
- … plus more

**What hooks can do**:
- **Block** a tool call (exit code 1 + reason on stderr)
- **Inject context** (stdout becomes a system reminder for the model)
- **Side effects** (post to Slack, write a log, run a linter, etc.)

> [!warning]
> Hooks run with your shell permissions. A malicious or buggy hook can do real damage. Treat hook authorship like writing a `.git/hooks/` script — same trust model.

---

### 4. MCP Servers

**Purpose:** Add **new tools** the model can call. Hooks add *behaviours*; MCP adds *capabilities*.

An MCP server is a **separate process** (Python, Node, Go, anything) that speaks the Model Context Protocol over stdio, HTTP, or SSE. It exposes:

- **Tools** — model-callable functions (e.g., `query_database`, `fetch_github_issue`)
- **Resources** — readable data sources (e.g., a file system, a wiki)
- **Prompts** — templated workflows the model can invoke

Registered in `.mcp.json` (project) or `~/.claude.json` (user):

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**Tool naming convention**: `mcp__<server-name>__<tool-name>`. So a `puppeteer` server's `click` tool appears in the model's tool list as `mcp__puppeteer__puppeteer_click`.

> [!example]
> In this very session you can see `mcp__puppeteer__puppeteer_click`, `mcp__ide__executeCode`, etc. — tools from MCP servers that registered themselves at session start.

---

### 5. Subagents

**Purpose:** Provide specialised Claude configurations the main agent can spawn.

A subagent is a markdown file under `agents/` with:

```markdown
---
name: code-reviewer
description: Independent code review for security and correctness
tools: [Read, Grep, Bash]   # tool allowlist
model: sonnet               # optional model override
---

# System prompt for this specialist

You are an experienced code reviewer specialising in...
```

**How they're used**:
- Main agent invokes via the `Agent` tool: `Agent({ subagent_type: "code-reviewer", prompt: "..." })`
- Subagent runs with its own clean context, its own system prompt, its own tool allowlist
- Returns a single message (the result) to the main agent
- Useful for: parallel work, isolating context, specialised expertise (security review, debugging)

> [!tip]
> A subagent inherits the main agent's authorisation but starts with a fresh context. Use them when you want to push *bulky reads* off the main context (e.g., "read these 30 files and summarise") or when you want a different *system prompt persona* (e.g., a strict critic).

---

## Plugins — the container

A plugin bundles any combination of the above into a single distributable unit.

### Plugin folder shape

This is the actual layout, taken from a real installed plugin (`claude-md-management` in `claude-plugins-official`):

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json          ← manifest (name, version, author, description)
├── README.md                 ← human-readable description, usage, screenshots
├── LICENSE                   ← required for sharing
├── *.png / *.gif             ← screenshots embedded in the README
├── skills/
│   └── <name>/
│       └── SKILL.md          ← progressive disclosure: SKILL.md + references/ + scripts/
├── commands/
│   └── <name>.md             ← templated prompts
├── agents/
│   └── <name>.md             ← subagent configs
├── hooks/                    ← (or hooks declared in plugin's settings.json)
└── .mcp.json                 ← MCP server config (if shipping a server)
```

The manifest (`.claude-plugin/plugin.json`) is minimal — name, version, author, description, optionally `homepage`, `repository`, `keywords`:

```json
{
  "name": "claude-md-management",
  "description": "Tools to maintain and improve CLAUDE.md files...",
  "version": "1.0.0",
  "author": { "name": "Anthropic", "email": "support@anthropic.com" }
}
```

A plugin can ship **just one skill**, or **all five capability types**, or anything in between. There's no requirement; folders simply don't exist if there's nothing to put in them.

### Marketplaces

A marketplace is a Git repo (or local path) listing one or more plugins:

```
my-marketplace/
├── .claude-plugin/
│   └── marketplace.json   ← lists the plugins this marketplace ships
└── plugins/
    ├── plugin-a/          ← each plugin is a folder with the shape above
    └── plugin-b/
```

Users add a marketplace once: `/plugin marketplace add <git-url-or-path>`. Then install plugins from it: `/plugin install plugin-a@<marketplace-name>`.

### How plugins are stored and loaded — the cache vs the registration

**This is the single most important thing to understand about plugin scopes:**

When you install a plugin, two distinct things happen:

1. **The plugin files are downloaded and cached ONCE at user level** — regardless of which scope you "installed" it into. The cache lives at:
   ```
   ~/.claude/plugins/cache/<marketplace-name>/<plugin-name>/<version>/
   ```
   For example, after installing `claude-md-management@claude-plugins-official`, the files land at `~/.claude/plugins/cache/claude-plugins-official/claude-md-management/1.0.0/`. Multiple versions can coexist in the same cache (each in its own version folder).

2. **A boolean entry is written to the chosen scope's `settings.json`** under `enabledPlugins`:
   ```json
   "enabledPlugins": {
     "claude-md-management@claude-plugins-official": true
   }
   ```
   This boolean — and only this boolean — is what differs across scopes. The plugin files themselves are not duplicated per scope.

**At session start**, Claude Code computes the active plugin set as the **union** of `enabledPlugins` across all applicable scopes (Managed + Local + Project + User). Each enabled plugin's contents (skills, commands, etc.) are loaded **once** even if multiple scopes enable it. The `/reload-plugins` output reflects this — it shows aggregated counts (`4 plugins · 4 skills · 5 agents · 1 hook`), not duplicated per-scope tallies.

**Implication:** "installing a plugin at project scope" is a misnomer. The files always live in your user-level cache; project scope just means "this project's `settings.json` has the boolean set to true." A teammate who clones the repo gets the boolean from the committed `settings.json`, but the actual plugin files only download to *their* user-level cache when they first open the project.

### Why plugins exist

Plugins solve **distribution problems**, not capability problems:

| Without plugins | With plugins |
|---|---|
| Hand-copy skills/commands/agents into each project | One install command |
| No way to push updates to consumers | `/plugin update` |
| No discovery mechanism | Marketplaces are searchable |
| Trust is per-file | Trust the marketplace + plugin author |
| No version metadata | `plugin.json` has versioning; cache stores multiple versions |

> [!important]
> **The model never sees "the plugin."** It sees the unpacked skills, commands, tools. Naming conventions like `<plugin>:<skill>` (e.g., `ralph-loop:ralph-loop`) leak the plugin name into the skill's identity, but the model doesn't reason about plugins as first-class entities.

---

## Scopes — where things live

Claude Code has a **4-scope hierarchy**. Almost everything (settings, plugins, MCP servers, hooks, skills, commands, agents) can live at one or more scopes.

### The 4 scopes

| Scope | Location | Visibility | Typical use |
|---|---|---|---|
| **Managed** | Set by admin via managed settings | Locked, can't be overridden by user | Enterprise IT |
| **User** | `~/.claude/` | All your projects, this machine | Personal preferences, global tools |
| **Project** | `<repo>/.claude/`, `.mcp.json` | This project, all team members (committed to git) | Team-shared tools, project conventions |
| **Local** | `<repo>/.claude/settings.local.json`, `~/.claude.json` | This project, just you (gitignored) | Personal overrides, machine-specific tweaks |

**Precedence** (more specific wins): Managed > Local > Project > User.

### Per-capability scope behaviour

Not everything follows the same merge/override rules. Here's the cheat sheet:

| Capability | Multi-scope behaviour |
|---|---|
| **Settings (`settings.json`)** | More-specific scope wins (merge for arrays like `permissions`) |
| **Plugins** | Files cached **once** at user level (`~/.claude/plugins/cache/...`). Each scope's `settings.json` independently sets `enabledPlugins[name]: true`. Active set = union across scopes. Plugin loads once even if multiple scopes enable it. Use `--scope` on `/plugin enable|disable` to target a specific scope's boolean |
| **Marketplaces** | **User scope only.** `extraKnownMarketplaces` in project settings is a discovery hint, not an install path |
| **MCP servers** | Coexist independently across scopes — no override; can't disable a project-scoped server from user scope |
| **Hooks** | All scopes' hooks **merge** into one active set. Only kill switch is `disableAllHooks: true` at any scope (managed hooks survive even that) |
| **Skills** | Project-scoped skills (`.claude/skills/`) and user-scoped (`~/.claude/skills/`) both load; the model sees them all in its trigger list |
| **Slash Commands** | Same — user + project + plugin commands all available; namespace prefix prevents collision |
| **Subagents** | Same — all visible to the `Agent` tool |

> [!note] The "global vs local plugin" question, answered (with empirical proof)
> **The same plugin can be enabled at multiple scopes simultaneously, and there's no duplication problem because the files are only stored once.**
>
> Verified live: `claude-md-management` enabled in BOTH `<repo>/.claude/settings.local.json` AND `~/.claude/settings.json` at the same time. The `~/.claude/plugins/cache/claude-plugins-official/claude-md-management/1.0.0/` folder has exactly one copy. `/reload-plugins` reports "1 plugin loaded" — not two. The two scope booleans OR together; the runtime de-duplicates at load.
>
> Earlier I worried about "duplicate skill registrations" if the same plugin installed at two scopes. That worry was wrong — the architecture stores the files once, and "scope" is just *which settings file holds the enable boolean*. If a UI flow ever appears to gate this, it's UX polish, not an architectural constraint.

---

## When to use which capability

Decision matrix for "I want to add ___ to Claude Code":

| Goal | Use |
|---|---|
| Teach Claude project conventions / domain knowledge | **Skill** |
| One-line trigger for a common workflow ("/review", "/deploy") | **Slash command** |
| Auto-format on every save / block dangerous commands / log every tool call | **Hook** |
| Add new tools the model can call (database query, browser automation, custom API) | **MCP server** |
| Specialised reviewer / researcher / executor with a different system prompt | **Subagent** |
| Distribute any combination of the above to other people / projects | **Plugin** |

> [!tip] Skills + commands often pair
> Common pattern: a skill teaches the *concepts* (what's in the project, how it works, when to use what); a slash command provides the *one-shot trigger* for the most common operations the skill describes. The skill body can reference the commands it ships alongside.

---

## Common patterns

### Pattern A — Personal toolkit
Everything at **user scope**. Your skills, commands, hooks, MCP servers, subagents follow you across all your machines (synced via dotfiles or similar).

### Pattern B — Team-shared project conventions
Project-scoped skills + commands + hooks committed to `.claude/`. Everyone on the team gets them by cloning the repo.

### Pattern C — Framework with a plugin
A framework repo doubles as a marketplace. Consumers `/plugin marketplace add <framework-repo>` once, then `/plugin install <framework-name>` per project. Updates flow via `/plugin update`.

### Pattern D — Hybrid
Personal commands + skills at user scope; project-specific skills committed to the project; framework plugin installed at user scope and shared across many similar projects.

---

## Quick reference — file locations

```
# User scope ── ~/.claude/
~/.claude/
├── settings.json                   ← global settings + enabledPlugins (user)
├── skills/<name>/SKILL.md          ← global skills (hand-authored, not from a plugin)
├── commands/<name>.md              ← global commands
├── agents/<name>.md                ← global subagents
├── claude.json                     ← MCP servers (user scope)
└── plugins/
    └── cache/
        └── <marketplace-name>/
            └── <plugin-name>/
                └── <version>/      ← THE ACTUAL PLUGIN FILES live here, ONCE,
                    ├── .claude-plugin/plugin.json   ← regardless of which scope
                    ├── README.md                     ← enabled them
                    ├── LICENSE
                    ├── *.png                         ← README screenshots
                    ├── skills/<name>/SKILL.md
                    ├── commands/<name>.md
                    ├── agents/<name>.md
                    └── .mcp.json (if any)

# Project scope (committed to git)
<repo>/.claude/
├── settings.json                   ← project settings + enabledPlugins (project)
├── skills/<name>/SKILL.md          ← project skills
├── commands/<name>.md              ← project commands
└── agents/<name>.md                ← project subagents

# Project local (gitignored)
<repo>/.claude/settings.local.json  ← personal overrides + enabledPlugins (local)

# Project MCP (committed to git)
<repo>/.mcp.json                    ← project MCP servers

# Local-scope MCP (in your home, scoped to "current project" by Claude Code)
~/.claude.json                      ← MCP servers (local scope)
```

> [!note] Plugin files only live in one place
> Notice how the project scope folders (`<repo>/.claude/`) have skills, commands, agents — but **no `plugins/`** directory. That's because project-scope plugin "install" only writes the `enabledPlugins` boolean into the project's `settings.json`. The plugin files themselves only ever live in your user-level cache. A teammate cloning the repo gets the boolean from the committed `settings.json`; their own user-level cache downloads the files when they first open the project.

---

## References

Official Claude Code docs (sources verified during writing):

- **Settings & scopes** — https://docs.claude.com/en/docs/claude-code/settings
- **Plugins** — https://docs.claude.com/en/docs/claude-code/plugins
- **MCP** — https://docs.claude.com/en/docs/claude-code/mcp
- **Hooks** — https://docs.claude.com/en/docs/claude-code/hooks
- **Slash commands** — https://docs.claude.com/en/docs/claude-code/slash-commands
- **Subagents** — https://docs.claude.com/en/docs/claude-code/sub-agents
- **Skills** — https://docs.claude.com/en/docs/claude-code/skills

> [!info]
> The Claude Code docs are the authoritative source — Anthropic ships changes regularly. If something in this doc disagrees with the live docs, trust the live docs.
