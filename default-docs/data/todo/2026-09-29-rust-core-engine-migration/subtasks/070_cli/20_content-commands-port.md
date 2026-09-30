---
title: "Content commands port — today's toolkit on the shared core"
status: open
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
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/agentks-cli/` (commands) and the core crate (rules and writers).

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

# 05 Notes & Analysis

## Watch out
- `move` must keep rewriting links in frontmatter `subtasks:` lists of plan stages, which today's version does; the fixture must include a plan.
