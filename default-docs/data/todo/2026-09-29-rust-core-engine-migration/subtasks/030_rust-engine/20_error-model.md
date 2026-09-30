---
title: "Error model — typed errors, one error record, fatal versus content errors"
status: review
---

The engine's rule is "when unsure, return an error". That only works if errors are typed, carry where they happened, and look the same in the terminal, on the page and in the dev toolbar. Today the CLI and the Astro engine each have their own shape. This leaf defines one model for all crates.

# 01 To Do
- [x] **The error record** in `agentks-core`, the shape every content problem takes, as today:
    ```rust
    pub struct ErrorRecord {
        pub file: RelPath,          // project-relative
        pub line: Option<u32>,      // 1-based, in the source file (not the rendered output)
        pub kind: ErrorKind,        // stable, kebab-case on the wire: "link-missing", "slug-collision", …
        pub severity: Severity,     // error | warning
        pub message: String,        // one sentence, plain English
        pub key: Option<String>,    // the config key path, for config problems: "pages.todo.layout"
        pub suggestion: Option<String>,
    }
    ```
    `ErrorKind` is one enum for the whole engine, serialised as kebab-case strings that never change once released (tests pin them).
- [x] **Two classes** ([02/03](../../notes/02_engine/03_rust-engine.md) section 08):
    - **Fatal**: config missing or invalid, the version gate, an unknown alias or layout, a library outside its engine range. Returned as `Err` from loading; the server does not start and the command exits non-zero. The message names the file, the key and the fix.
    - **Content**: a missing link target or embed, a slug collision, bad frontmatter, an unknown library element. Collected, never thrown: the page still renders, carries its errors in its page data, and `agentks check` reports them.
- [x] **Per-crate error types** with `thiserror`: each crate's public functions return `Result<T, CrateError>`. `anyhow` only in `agentks-cli`'s `main` and in tests.
- [x] **A collector** for content errors (`ErrorSink`), passed through loading and rendering, so a stage reports without aborting. The site keeps the current set per file, replaced when that file is re-read, so fixed errors disappear.
- [ ] **Rendering errors for people**: the CLI prints `file:line: kind: message` plus the suggestion, and `--json` prints the records. The page data's `errors` array holds the same records ([80](./80_page-data-interface.md)).
- [ ] **No panics in library code**: clippy denies `unwrap`, `expect` and `panic` outside tests ([10](./10_workspace-and-crate-boundaries.md)). A panic in the server is caught per request by the server layer and logged as an internal error with the request URL.

## Guardrails
- Never convert a content error into a guess: a missing target stays missing, visible on the page.
- Error kinds are part of the public contract (skills and CI read them). Renaming one needs a migration note.

## Done when
- Every content-error spec fixture ([020/10](../020_content-contract/10_golden-fixtures.md)) produces the record in its `expected.json`, identically from `agentks check --json` and from the page data.
- A config fixture with a bad alias makes `agentks start` exit non-zero before binding a port, with file, key and fix in the message.
- `cargo clippy --workspace -- -D warnings` passes with the panic lints on.

# 02 Status and Result
Review. The model is in `agentks-core` and every crate has its error type. Two pieces belong to the crates that print and serve: the CLI's `--json` output of records ([070/10](../070_cli/10_rename-to-agentks.md)) and the server's per-request panic catch ([050/20](../050_server/20_websocket-api.md)).

## Result
- **Record:** `agentks_core::ErrorRecord { file: RelPath, line: Option<u32>, kind: ErrorKind, severity: Severity, message, key: Option<String>, suggestion: Option<String> }` in `crates/core/src/error/mod.rs`. On the wire the kind is the field `type`; empty optional fields are left out. `Display` gives the form people read: `file:line: kind: message (key K)` then `  fix: suggestion` on its own line; the CLI prints exactly that.
- **Kinds:** one `ErrorKind` enum of 41 kebab-case names (config, themes, libraries, content, tracker, `internal`, `not-implemented`) in `crates/core/src/error/kind.rs`. The test `wire_names_are_pinned` holds the literal list; serde, `name()` and the JSON Schema read one table (the `name_enum!` macro), so they cannot disagree.
- **Classes:** a content problem goes to `ErrorSink` (collect, group by file, `has_errors`) and the work goes on; a fatal problem is an `Err` from loading. A load that finds several fatal problems returns them all as an `ErrorList`, which is never empty, so the user fixes them in one pass.
- **Per crate:** each crate has one `thiserror` enum (`ConfigError`, `GitError`, `CacheError`, `ContentError`, `LibraryError`, `MigrateError`, `IndexError`, `RenderError`, `SiteError`, `SyncError`, `ServerError`), each with `NotImplemented` for unbuilt parts. `anyhow` is not a dependency yet; it joins only at the binary's edge.
- **Request failures** are a separate closed list, `agentks_api::ReplyErrorKind` (`not-found`, `invalid-request`, `forbidden`, `conflict`, `busy`, `fatal`, `internal`, `not-implemented`), and `SiteError::to_reply` is the one mapping from a site error to a reply; a fatal reply carries the `ErrorRecord`s.
- **No panics:** `cargo clippy --workspace --all-targets -- -D warnings` passes with `unwrap_used`, `expect_used`, `panic`, `todo` and `unimplemented` denied.
- **Tests:** 7 in `agentks-core` for the model (pinned names, serde names, refusal of unknown names, the wire shape, the human form, the sink, the non-empty list).

## Agent log
none

# 03 References
- **Where:** `agentks-core` (record, kinds, sink); every crate (its error type).
- **Read first:** [02/03 The Rust engine](../../notes/02_engine/03_rust-engine.md) section 08; today's [cache.ts](../../../../../../agent-ks-engine/src/loaders/cache.ts) (`addError`) and the CLI's [checks.rs](../../../../../../agent-ks-cli/src/checks.rs) (today's two shapes).
- **Depends on:** [10](./10_workspace-and-crate-boundaries.md).
- **Unblocks:** every leaf that reports errors.

# 04 Decisions
- Decided (sidhantha, 2026-09-29, rule 4 of the design rules): when the code cannot be sure of an answer, it returns an error.
- Decided (claude, 2026-09-30): one `ErrorKind` enum with stable kebab-case names; `thiserror` per crate, `anyhow` only at the binary's edge.

- Decided (claude, 2026-09-30): the wire field of the kind is `type`, as in today's engine and every example in the notes; the Rust field is `kind`, renamed by serde.
- Decided (claude, 2026-09-30): the record gains an optional `key` (the config key path, such as `pages.todo.layout`), because [020/20](../020_content-contract/20_config-folder.md) requires the key path in every config error; optional, so it breaks nothing.
- Decided (claude, 2026-09-30): request failures are not project problems, so they are a separate closed list in `agentks-api` (`ReplyErrorKind`), and content problems never fail a request: they travel in the data's `errors`. This drops the `content` reply type [050/20](../050_server/20_websocket-api.md) listed.
- Decided (claude, 2026-09-30): a fatal `Err` carries every problem one load found (`ErrorList`, never empty), not only the first.
- Decided (claude, 2026-09-30): the first kind list has 41 names; later leaves add kinds as they need them (adding is safe), and the pinned test list changes with each.

# 05 Notes & Analysis
## Watch out
- Line numbers must point at the source file, including inside embedded text ([020/40](../020_content-contract/40_embeds-and-dependencies.md) keeps the line map). An error inside an embed names the embedded file.
