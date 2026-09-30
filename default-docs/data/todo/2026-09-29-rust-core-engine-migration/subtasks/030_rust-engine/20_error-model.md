---
title: "Error model — typed errors, one error record, fatal versus content errors"
status: open
---

The engine's rule is "when unsure, return an error". That only works if errors are typed, carry where they happened, and look the same in the terminal, on the page and in the dev toolbar. Today the CLI and the Astro engine each have their own shape. This leaf defines one model for all crates.

# 01 To Do
- [ ] **The error record** in `agentks-core`, the shape every content problem takes, as today:
    ```rust
    pub struct ErrorRecord {
        pub file: RelPath,          // project-relative
        pub line: Option<u32>,      // 1-based, in the source file (not the rendered output)
        pub kind: ErrorKind,        // stable, kebab-case on the wire: "link-missing", "slug-collision", …
        pub severity: Severity,     // error | warning
        pub message: String,        // one sentence, plain English
        pub suggestion: Option<String>,
    }
    ```
    `ErrorKind` is one enum for the whole engine, serialised as kebab-case strings that never change once released (tests pin them).
- [ ] **Two classes** ([02/03](../../notes/02_engine/03_rust-engine.md) section 08):
    - **Fatal**: config missing or invalid, the version gate, an unknown alias or layout, a library outside its engine range. Returned as `Err` from loading; the server does not start and the command exits non-zero. The message names the file, the key and the fix.
    - **Content**: a missing link target or embed, a slug collision, bad frontmatter, an unknown library element. Collected, never thrown: the page still renders, carries its errors in its page data, and `agentks check` reports them.
- [ ] **Per-crate error types** with `thiserror`: each crate's public functions return `Result<T, CrateError>`. `anyhow` only in `agentks-cli`'s `main` and in tests.
- [ ] **A collector** for content errors (`ErrorSink`), passed through loading and rendering, so a stage reports without aborting. The site keeps the current set per file, replaced when that file is re-read, so fixed errors disappear.
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
Open. Not started.

## Result
None yet.

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

# 05 Notes & Analysis
## Watch out
- Line numbers must point at the source file, including inside embedded text ([020/40](../020_content-contract/40_embeds-and-dependencies.md) keeps the line map). An error inside an embed names the embedded file.
