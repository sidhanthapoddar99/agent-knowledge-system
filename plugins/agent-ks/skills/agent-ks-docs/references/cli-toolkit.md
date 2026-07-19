# `agent-ks` CLI toolkit — complete reference

The `agent-ks` plugin ships a single command-line entrypoint, **`agent-ks`**, added to `$PATH` automatically when the plugin is installed. Every operation is a subcommand:

```
agent-ks <group> <verb> [flags]
```

There is **one binary** (`agent-ks`, plus its Windows `agent-ks.cmd` twin) routing through a single dispatcher driven by a command manifest. The name is prefix-namespaced so it never collides with other tools on `PATH` (a bare `docs` does — e.g. NVIDIA CUDA ships one).

> **Discover, don't memorise.** `agent-ks help` lists every command grouped · `agent-ks help <group> <verb>` shows one command's flags · `agent-ks help --json` dumps the whole manifest. This reference is the static mirror of that.

## The contract (uniform across every command)

- **`--help` / `-h`** → usage to stdout, exit `0`. Works on the bare dispatcher (`agent-ks`, `agent-ks --help`) and on every command.
- **`--json`** → wherever a command returns data, `--json` emits a single valid JSON document to stdout (and nothing else).
- **Exit codes**: `0` ok (for queries: found / non-empty) · `1` clean no-result *or* a handled runtime error · `2` usage error · `127` a command's interpreter is missing (polyglot).
- **Streams**: human/data output → stdout; diagnostics/errors → stderr.
- Full spec for authors: [`../scripts/CONTRACT.md`](../scripts/CONTRACT.md).

---

## General / cross-content

| Command | What it does | Key flags |
|---|---|---|
| `agent-ks help [command]` | List commands, or show one command's flags | `--json` (dump manifest) |
| `agent-ks resolve-context` | Emit the `.env`-derived `CONTENT_ROOT` / `CONFIG_DIR` / `DATA_DIR` (so non-JS scripts skip `.env` discovery) | `--json` (else `KEY=value` lines) |
| `agent-ks find <regex>` | Schema-agnostic search across **all** content at once (docs + blog + issues + config) | `--meta` (structured layer only) · `--path` (match path text) · `--type docs,blog,issues,config` · `--count` · `--paths-only` · `--case-sensitive` · `--json` |
| `agent-ks move <from> <to>` | Link-aware move/rename — rewrites inbound + outbound Markdown links | `--dry-run` · `--no-git` · `--root <dir>` |
| `agent-ks img <path…>` | Optimize images so git stays small | `--dpr <N>` (undo retina) · `--max-dim <px>` · `--gray` · `--format <webp\|avif\|png\|jpg>` (`-f`) · `--quality <N>` (`-q`) · `--strip` · `--target-size <SIZE>` (e.g. `100KB`) · `--rewrite-links` · `--out <dir>` · `--dry-run` |

`agent-ks find` complements the per-type `*-search` commands: it answers "where is this string, anywhere", they answer "find the page/post/issue about X".

---

## Issue tracker — `agent-ks issue …`

| Command | What it does | Key flags |
|---|---|---|
| `agent-ks issue list` | Multi-field filter + free-text regex search over the tracker | `--status open,blocked,in-progress,input-needed,review,done,dropped` (default: not-Closed; `all` = every status; `--include-closed` widens) · `--priority` · `--component` · `--label` · `--assignee` · `--search <regex>` · `--search-fields body,settings,comments,subtasks,notes,agent-log` · `--path <regex>` · `--meta <regex>` · `--count` · `--limit <N>` · `--paths-only` · `--json` · `--tracker <path>` |
| `agent-ks issue show <id>` | One issue's metadata + subtask/comment/agent-log heads | `--full` (bodies) · `--json` · `--tracker` |
| `agent-ks issue subtasks [id]` | Subtasks for one issue, or `--all` cross-issue | `--all` · `--status <vals>` · `--flat` · `--json` · `--tracker` |
| `agent-ks issue set-state <id> <status>` | Set an issue status, or a subtask status via `--subtask <num\|slug>` (or a subtask path) | `--subtask <num\|slug>` · `--tracker` |
| `agent-ks issue agent-logs <id>` | Last N agent-log entries | `--last <N>` · `--full` · `--json` · `--tracker` |
| `agent-ks issue add-comment <id>` | Append a comment (auto-incremented prefix) | `--author <name>` · `--body <md>` · `--date` · `--slug` · `--tracker` |
| `agent-ks issue add-agent-log <id>` | Append an agent-log entry | `--body <md>` · `--status <state>` · `--iteration <N>` · `--agent <name>` · `--group <a[/b]>` · `--date` · `--slug` · `--tracker` |
| `agent-ks issue new-agent-log <id>` | Scaffold an activity folder with the six standard slots | `--kind <code>` · `--name <slug>` · `--goal <text>` · `--json` · `--tracker` |
| `agent-ks issue review-queue` | Items awaiting review (Review-category status — `review`/`input-needed` — + any active issue w/ a Review-category subtask) | `--json` · `--tracker` |

**Search scoping** (`list`): `--path` matches the file/folder path text; `--meta` matches only the structured layer (frontmatter + `settings.json`); `--count` summarises instead of dumping excerpts. `agent-ks issue list --path astro --status all` finds the astro issue in one call.

**Don't `Grep` the tracker** — `agent-ks issue list` understands the schema (vocabulary, subtask states, frontmatter); `Grep` only sees text.

---

## Validators — `agent-ks check …`

Exit `0` clean / `1` problems found (CI-friendly). All support `--json`.

| Command | What it validates |
|---|---|
| `agent-ks check blog` | `data/blog/` — `YYYY-MM-DD-<slug>.md` naming, frontmatter `title:`, no nested folders |
| `agent-ks check config` | `site.yaml` / `navbar.yaml` / `footer.yaml` — required keys, `pages:`, alias resolution |
| `agent-ks check section <folder>` | A docs section — `NN_` prefixes, `settings.json`, frontmatter `title:`, prefix collisions |
| `agent-ks check issues` | The issue tracker — schema, vocabulary, subtask states, anatomy folders (brainstorm / agent-memory / agent-log activity grammar, `agentLogKinds`) (`--quiet`, `--strict`, `--tracker`). Use this on `data/todo/`, **not** `check section` |
| `agent-ks check legacy-tags [root]` | Retired custom-tags syntax (`:::callout` / `<callout>` / `<tabs>` / `<collapsible>`) anywhere under a content root, each hit with its native replacement (GFM alert, `<details>`, flattened sections). Fenced code examples are skipped. Part of the migration toolkit — see `references/doc-migration.md` |
| `agent-ks check skill-links` | Maintainer tool: relative links between the skill's `.md` files resolve |

---

## Docs + blog content — `agent-ks doc …` / `agent-ks blog …`

| Command | What it does | Key flags |
|---|---|---|
| `agent-ks doc list [section]` | List sidebar doc pages (rel · section · title) | `--json` |
| `agent-ks doc show <name\|path>` | One doc page's metadata + frontmatter | `--json` |
| `agent-ks doc search <regex> [section]` | Regex search over doc pages | `--count` · `--case-sensitive` · `--json` |
| `agent-ks blog list` | List blog posts (date · slug · title), newest first | `--json` |
| `agent-ks blog show <slug\|date>` | One post's metadata + frontmatter | `--json` |
| `agent-ks blog search <regex>` | Regex search over blog posts | `--count` · `--case-sensitive` · `--json` |

---

## Git-derived content metadata — `agent-ks git …`

| Command | What it does | Key flags |
|---|---|---|
| `agent-ks git updated <path>` | Last-commit date/author/subject for any issue/doc/post (the history the tracker derives `updated` from) | `--json` |
| `agent-ks git changed --since <ref>` | Content changed under `data/` since a ref — review sweeps | `--since <ref>` (required) · `--type docs,blog,issues` · `--json` |
| `agent-ks git log <path>` | Commit history of one content folder/file | `--limit <N>` · `--json` |
| `agent-ks git commit --scope <path> --message <msg>` | **Guarded**: stages + commits **only** that path. Never pushes; commit stays explicit | `--scope <path>` (required) · `--message <msg>` / `-m` (required) · `--dry-run` · `--json` |

---

## Notes for maintainers

- **Single source of truth** is `../scripts/_manifest.mjs`; help and this contract are generated from it. The self-test harness (`../scripts/_selftest.mjs`, run under **bun**) checks every command against the contract.
- **Polyglot-ready**: the dispatcher routes by each command's `runtime`; a future Python command drops in via a manifest entry + a `.py` script honouring the contract, with no dispatcher change.
- **Legacy `docs-*` names**: earlier versions shipped 28 flat binaries (`docs-list`, `docs-check-blog`, …). Those are retired — everything is now `agent-ks <group> <verb>`. The flat names survive only as internal manifest ids (and `agent-ks help docs-list` still resolves them). If you find old `docs-<name>` invocations in a project's `CLAUDE.md`, memory, or scripts, update them to the `agent-ks` subcommand form.
