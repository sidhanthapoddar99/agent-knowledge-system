---
title: "Content commands port — today's toolkit on the shared core"
status: in-progress
---

Today's `agent-ks` toolkit (about 6,600 lines of Rust in `agent-ks-cli/`) has its own copies of the rules: frontmatter parsing, link checking, the ordering grammar, the issue status vocabulary. The new engine has one core that the server also uses. This leaf ports every content command into the new binary **on that core**, keeping each command's behaviour, flags and JSON output, and moving the rules that live in the CLI today into the core. It also rebuilds `help` from one manifest.

# 01 To Do
- [ ] **Command framework:** argument parsing, the manifest (`bin`, `group`, `verb`, `runtime`, `summary`, `flags`, example), `help`, `help <group> <verb>`, `help --json`, `--version`, the output and exit-code conventions ([070/00](./00_overview.md)). Port the manifest from [manifest.json](../../../../../../agent-ks-cli/src/manifest.json) and extend it with the new commands.
- [ ] **Queries:** `overview` (bare `agentks`), `resolve-context`, `find`, `doc list · show · search`, `blog list · show · search`.
- [ ] **Tracker reads:** `issue list · show · tree · context · subtasks · agent-logs · review-queue`.
- [ ] **Tracker writers:** `issue set-state · add-comment · new-subtask · new-plan · new-stage · new-agent-log · new-round` (`new-iteration` alias). Move the writers into the core, keeping JSONC comments and formatting, so [060/70](../060_collaboration/70_tracker-live-edits.md) calls the same code. The templates stay embedded in the binary.
- [ ] **Validators:** `check config · section · blog · issues · link-form`, with `--template` for issues. Each finding comes from the same core function the renderer uses; the error record is `file`, `line`, `type`, `message`, `suggestion`.
- [ ] **Files:** `move` (link-aware, `--dry-run`, carries sidecars, rewrites relative links, preserves code examples) and `img`.
- [ ] **Git:** `git updated · changed · log`, and the guarded `git commit` (stages and commits one content path, never pushes), extended with attribution trailers by [060/90](../060_collaboration/90_git-attribution.md).
- [ ] **Leaves the binary** ([Rust CLI, section 06](../../notes/02_engine/05_rust-cli.md)): `check legacy-tags` becomes the detect step of its migration script ([140/00](../140_versioning-and-migrations/00_overview.md)); `check skill-links` becomes a development script in the main repository; the framework-clone and `./start` commands are gone.
- [ ] **Port the tests.** Every case in today's [tests/cli.rs](../../../../../../agent-ks-cli/tests/cli.rs) keeps passing against the new binary (renamed commands only). Add golden-output tests for `--json` of every command on the fixture projects from [020/10](../020_content-contract/10_golden-fixtures.md).

## Guardrails
- Behaviour-preserving: same flags, same JSON keys, same exit codes. A change is a decision recorded in this leaf, not an accident.
- No rule is implemented in the CLI crate. If a command needs a rule, it goes into the core.
- Content commands stay fast: no network, no update check, no runtime.

## Done when
- Today's CLI test suite passes against `agentks`, with names changed only.
- For every command, `--json` output on the fixture projects matches today's `agent-ks` output (a comparison script run once and kept in CI until the 0.x archive).
- `agentks check link-form` and the rendered page report the same broken links on a fixture with seeded errors.
- `cargo tree -p agentks-cli` shows the CLI depends on the core, and no parsing crate is used directly by the CLI crate.

# 02 Status and Result
In progress. The command framework (the first To Do item) is built in wave 2 (branch `wave2/cli`); the command logic waits for the lower crates.

## Result
- **Command framework, done.** `crates/cli/src/args/` declares every command with clap 4.6 (derive): 65 commands with every flag of today's manifest plus the new ones. The clap tree is the manifest; `src/catalog/table.rs` adds each command's example and needs (project, network, outside programs). `agentks help` lists every command, `agentks help <group>` a group, `agentks help <group> <command>` the full help with its example, `agentks help --json` the catalog (`command`, `group`, `verb`, `aliases`, `summary`, `usage`, `arguments`, `flags` with `name`/`alias`/`value`/`required`/`default`/`values`, `example`, `project`, `network`, `runtime`). A test checks the table and the clap tree name exactly the same commands.
- Conventions: `--config-dir` and `--json` work before or after any command; unknown flags and bad values exit 2; `--json` writes one document; exit 1 for no result, runtime errors and validation errors.
- Every content command is wired: it finds the project through `agentks_config::discover`, opens the site where it reads content, then calls the owning crate or says which piece is missing (`agentks: not implemented yet: doc search (content search in agentks-site)`), exit 1. `check config` calls `agentks_config::load` and prints the findings in today's `check` JSON shape (`kind`, `root`, `errors`, `warnings`, `ok`, `errorCount`, `warningCount`, `counts`). `theme css` calls `Site::theme_css`.
- `img` is ported (`src/img/`), except `--rewrite-links`, which waits for the index crate's reference rewrite.
- `check legacy-tags` and `check skill-links` are not in the binary (a test checks it).
- `resolve-context` loads the config through `agentks_config::load` and prints the project root, config folder, `@data` folder, each section's folder, the project key and how the project was found (`src/run/project.rs`, `context_report`, with a unit test).
- Tests: 29 unit tests and 5 integration tests (`crates/cli/tests/cli.rs` runs the binary: version, help, `help --json`, six exit-2 cases, an unbuilt command's error document, `shell-init`), 0.2 s warm.
- **Left:** the queries, tracker writers, validators, `move`, git helpers and `theme tokens`, which need functions in `agentks-site`, `agentks-content`, `agentks-index`, `agentks-git` and `agentks-render` first; porting today's `tests/cli.rs` cases; the golden `--json` comparison against `agent-ks`.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/cli/` (commands), `agentks-content` (rules and writers) and `agentks-index` (links). The file map is in [030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md)'s Result.

**Read first:**
- [Rust CLI, sections 01, 05 and 06](../../notes/02_engine/05_rust-cli.md).
- [The Rust engine, sections 08 and 09](../../notes/02_engine/03_rust-engine.md) — one error record; what the core replaces.
- Today's code to port: [args.rs](../../../../../../agent-ks-cli/src/args.rs), [content.rs](../../../../../../agent-ks-cli/src/content.rs), [issues.rs](../../../../../../agent-ks-cli/src/issues.rs), [scaffold.rs](../../../../../../agent-ks-cli/src/scaffold.rs), [checks.rs](../../../../../../agent-ks-cli/src/checks.rs), [links.rs](../../../../../../agent-ks-cli/src/links.rs), [navigate.rs](../../../../../../agent-ks-cli/src/navigate.rs), [extras.rs](../../../../../../agent-ks-cli/src/extras.rs), [images.rs](../../../../../../agent-ks-cli/src/images.rs), [context.rs](../../../../../../agent-ks-cli/src/context.rs).
- The [agent-ks-cli skill's contract](../../../../../../plugins/agent-ks/skills/agent-ks-cli/references/contract.md), if present, for the promises the skills make about the CLI.

**Depends on:** [070/10](./10_rename-to-agentks.md), [030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md), [030/60 tracker loader](../030_rust-engine/60_tracker-loader.md), [020/10](../020_content-contract/10_golden-fixtures.md).
**Unblocks:** [060/70](../060_collaboration/70_tracker-live-edits.md), [060/90](../060_collaboration/90_git-attribution.md), the skills port ([130/10](../130_ai-plugins/10_agentks-plugin-port.md)).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the CLI and the server share one core, so each rule has one implementation.
- Proposed (claude, 2026-09-30), adopted here: `check legacy-tags` and `check skill-links` leave the shipped binary ([Rust CLI, section 06](../../notes/02_engine/05_rust-cli.md)).
- Decided (claude, 2026-10-01): clap is the manifest instead of today's `manifest.json`, and a small table adds each command's example and needs, with a test that the two name the same commands, because the help text and the parser then come from one declaration and cannot drift. `help --json` drops the 0.x `bin` field (there is one binary) and replaces `runtime: "native"` with `project`, `network` and `runtime` (the outside programs a command needs).
- Decided (claude, 2026-10-01): a content command whose lower-crate function does not exist yet finds the project first and then exits 1 with `not implemented yet: <command> (<crate piece>)`, because the CLI must not answer from a rule of its own; a stand-in answer would look right and be wrong.
- Decided (claude, 2026-10-01, revised after review): `resolve-context` loads the config and prints `PROJECT_ROOT`, `CONFIG_DIR`, `DATA_DIR` (only when the `@data` alias is set), one `SECTION.<name>=<folder>` line per section, `PROJECT_KEY` and `FOUND_BY`. JSON: `projectRoot`, `configDir`, `dataDir` (null when unset), `sections` (`name`, `type`, `dir`), `projectKey`, `foundBy`. This keeps the content folders the note and the skills expect, because only the loaded config names them. `CONTENT_ROOT` becomes `PROJECT_ROOT`, since in 1.0 the content root is the project root. There is no default `DATA_DIR`: `@data` is a user alias, and guessing `<root>/data` would look right and be wrong. The section name is written as it is in the key, so two sections never share one. Until `agentks_config::load` lands, the command exits 1 with its not-implemented error.
- Decided (claude, 2026-10-01): `resolve-context` does not print the port yet. The only port API, `agentks_server::choose_port`, records a derived port in `ports.json`, and a read-only command must not write. 070/30 adds the port once a read-only lookup exists.
- Decided (claude, 2026-10-01): `img` stays in the cli crate (as the crate map says) and shells out to ImageMagick; simple `*`/`?` globs and folder walks replace the `regex` and `walkdir` dependencies.
- Decided (claude, 2026-10-01): `issue set-state` to `done` or `dropped` asks for a typed confirmation on a terminal, and passes `by_person` to `with_status` only when the person types the status word. `--yes` does not skip this question. With no terminal, which is every agent's run, the command refuses and says why. Only a person closes work, and a flag would let an agent claim to be one. A person without a terminal edits the status in the file.

# 05 Notes & Analysis

## Watch out
- `move` must keep rewriting links in frontmatter `subtasks:` lists of plan stages, which today's version does; the fixture must include a plan.
