# `docs-guide` CLI toolkit — complete reference

The `documentation-guide` plugin ships a single command-line entrypoint, **`docs-guide`**, added to `$PATH` automatically when the plugin is installed. Every operation is a subcommand:

```
docs-guide <group> <verb> [flags]
```

There is **one binary** (`docs-guide`, plus its Windows `docs-guide.cmd` twin) routing through a single dispatcher driven by a command manifest. The name is prefix-namespaced so it never collides with other tools on `PATH` (a bare `docs` does — e.g. NVIDIA CUDA ships one).

> **Discover, don't memorise.** `docs-guide help` lists every command grouped · `docs-guide help <group> <verb>` shows one command's flags · `docs-guide help --json` dumps the whole manifest. This reference is the static mirror of that.

## The contract (uniform across every command)

- **`--help` / `-h`** → usage to stdout, exit `0`. Works on the bare dispatcher (`docs-guide`, `docs-guide --help`) and on every command.
- **`--json`** → wherever a command returns data, `--json` emits a single valid JSON document to stdout (and nothing else).
- **Exit codes**: `0` ok (for queries: found / non-empty) · `1` clean no-result *or* a handled runtime error · `2` usage error · `127` a command's interpreter is missing (polyglot).
- **Streams**: human/data output → stdout; diagnostics/errors → stderr.
- Full spec for authors: [`../scripts/CONTRACT.md`](../scripts/CONTRACT.md).

---

## General / cross-content

| Command | What it does | Key flags |
|---|---|---|
| `docs-guide help [command]` | List commands, or show one command's flags | `--json` (dump manifest) |
| `docs-guide resolve-context` | Emit the `.env`-derived `CONTENT_ROOT` / `CONFIG_DIR` / `DATA_DIR` (so non-JS scripts skip `.env` discovery) | `--json` (else `KEY=value` lines) |
| `docs-guide find <regex>` | Schema-agnostic search across **all** content at once (docs + blog + issues + config) | `--meta` (structured layer only) · `--path` (match path text) · `--type docs,blog,issues,config` · `--count` · `--paths-only` · `--case-sensitive` · `--json` |
| `docs-guide move <from> <to>` | Link-aware move/rename — rewrites inbound + outbound Markdown links | `--dry-run` · `--no-git` · `--root <dir>` |
| `docs-guide img <path…>` | Optimize images so git stays small | `--dpr <N>` (undo retina) · `--max-dim <px>` · `--gray` · `--format <webp\|avif\|png\|jpg>` (`-f`) · `--quality <N>` (`-q`) · `--strip` · `--target-size <SIZE>` (e.g. `100KB`) · `--rewrite-links` · `--out <dir>` · `--dry-run` |

`docs-guide find` complements the per-type `*-search` commands: it answers "where is this string, anywhere", they answer "find the page/post/issue about X".

---

## Issue tracker — `docs-guide issue …`

| Command | What it does | Key flags |
|---|---|---|
| `docs-guide issue list` | Multi-field filter + free-text regex search over the tracker | `--status open,blocked,in-progress,input-needed,review,done,dropped` (default: not-Closed; `all` = every status; `--include-closed` widens) · `--priority` · `--component` · `--label` · `--assignee` · `--search <regex>` · `--search-fields body,settings,comments,subtasks,notes,agent-log` · `--path <regex>` · `--meta <regex>` · `--count` · `--limit <N>` · `--paths-only` · `--json` · `--tracker <path>` |
| `docs-guide issue show <id>` | One issue's metadata + subtask/comment/agent-log heads | `--full` (bodies) · `--json` · `--tracker` |
| `docs-guide issue subtasks [id]` | Subtasks for one issue, or `--all` cross-issue | `--all` · `--status <vals>` · `--flat` · `--json` · `--tracker` |
| `docs-guide issue set-state <id> <status>` | Set an issue status, or a subtask status via `--subtask <num\|slug>` (or a subtask path) | `--subtask <num\|slug>` · `--tracker` |
| `docs-guide issue agent-logs <id>` | Last N agent-log entries | `--last <N>` · `--full` · `--json` · `--tracker` |
| `docs-guide issue add-comment <id>` | Append a comment (auto-incremented prefix) | `--author <name>` · `--body <md>` · `--date` · `--slug` · `--tracker` |
| `docs-guide issue add-agent-log <id>` | Append an agent-log entry | `--body <md>` · `--status <state>` · `--iteration <N>` · `--agent <name>` · `--group <a[/b]>` · `--date` · `--slug` · `--tracker` |
| `docs-guide issue review-queue` | Items awaiting review (status=review + open w/ review subtask) | `--json` · `--tracker` |

**Search scoping** (`list`): `--path` matches the file/folder path text; `--meta` matches only the structured layer (frontmatter + `settings.json`); `--count` summarises instead of dumping excerpts. `docs-guide issue list --path astro --status all` finds the astro issue in one call.

**Don't `Grep` the tracker** — `docs-guide issue list` understands the schema (vocabulary, subtask states, frontmatter); `Grep` only sees text.

---

## Validators — `docs-guide check …`

Exit `0` clean / `1` problems found (CI-friendly). All support `--json`.

| Command | What it validates |
|---|---|
| `docs-guide check blog` | `data/blog/` — `YYYY-MM-DD-<slug>.md` naming, frontmatter `title:`, no nested folders |
| `docs-guide check config` | `site.yaml` / `navbar.yaml` / `footer.yaml` — required keys, `pages:`, alias resolution |
| `docs-guide check section <folder>` | A docs section — `NN_` prefixes, `settings.json`, frontmatter `title:`, prefix collisions |
| `docs-guide check issues` | The issue tracker — schema, vocabulary, subtask states, anatomy folders (brainstorm / agent-memory / agent-log activity grammar, `agentLogKinds`) (`--quiet`, `--strict`, `--tracker`). Use this on `data/todo/`, **not** `check section` |
| `docs-guide check skill-links` | Maintainer tool: relative links between the skill's `.md` files resolve |

---

## Docs + blog content — `docs-guide doc …` / `docs-guide blog …`

| Command | What it does | Key flags |
|---|---|---|
| `docs-guide doc list [section]` | List sidebar doc pages (rel · section · title) | `--json` |
| `docs-guide doc show <name\|path>` | One doc page's metadata + frontmatter | `--json` |
| `docs-guide doc search <regex> [section]` | Regex search over doc pages | `--count` · `--case-sensitive` · `--json` |
| `docs-guide blog list` | List blog posts (date · slug · title), newest first | `--json` |
| `docs-guide blog show <slug\|date>` | One post's metadata + frontmatter | `--json` |
| `docs-guide blog search <regex>` | Regex search over blog posts | `--count` · `--case-sensitive` · `--json` |

---

## Git-derived content metadata — `docs-guide git …`

| Command | What it does | Key flags |
|---|---|---|
| `docs-guide git updated <path>` | Last-commit date/author/subject for any issue/doc/post (the history the tracker derives `updated` from) | `--json` |
| `docs-guide git changed --since <ref>` | Content changed under `data/` since a ref — review sweeps | `--since <ref>` (required) · `--type docs,blog,issues` · `--json` |
| `docs-guide git log <path>` | Commit history of one content folder/file | `--limit <N>` · `--json` |
| `docs-guide git commit --scope <path> --message <msg>` | **Guarded**: stages + commits **only** that path. Never pushes; commit stays explicit | `--scope <path>` (required) · `--message <msg>` / `-m` (required) · `--dry-run` · `--json` |

---

## Notes for maintainers

- **Single source of truth** is `../scripts/_manifest.mjs`; help and this contract are generated from it. The self-test harness (`../scripts/_selftest.mjs`, run under **bun**) checks every command against the contract.
- **Polyglot-ready**: the dispatcher routes by each command's `runtime`; a future Python command drops in via a manifest entry + a `.py` script honouring the contract, with no dispatcher change.
- **Legacy `docs-*` names**: earlier versions shipped 28 flat binaries (`docs-list`, `docs-check-blog`, …). Those are retired — everything is now `docs-guide <group> <verb>`. The flat names survive only as internal manifest ids (and `docs-guide help docs-list` still resolves them). If you find old `docs-<name>` invocations in a project's `CLAUDE.md`, memory, or scripts, update them to the `docs-guide` subcommand form.
