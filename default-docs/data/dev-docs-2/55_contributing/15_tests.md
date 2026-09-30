---
title: "Tests"
description: "Where each kind of test lives in the main repository, which tools run it, and the rules every test follows."
---

This page tells you where to put a test and what runs it. `ctl test` runs every suite, and the gate's test rung runs `ctl test`, so every test on this page runs on every push.

## The suites

| Suite | Where | Run by |
|---|---|---|
| Rust unit tests | A `#[cfg(test)]` module inside the file they test | `cargo test --workspace` |
| Rust integration tests | `apps/agentks-engine/crates/<crate>/tests/` | `cargo test --workspace` |
| The `/api` schema test | `apps/agentks-engine/crates/api/tests/contract.rs` | `cargo test`: fails when the committed `apps/agentks-engine/schema/api.schema.json` differs from the Rust types, and checks each payload in `apps/agentks-engine/schema/fixtures/` against the types |
| The theme contract check | `apps/agentks-engine/themes/check-contract.ts` | `ctl test engine`, with Bun |
| The migration chain test | `apps/agentks-engine/migrations/tests/test_docs_chain.py` | `ctl test engine`, with uv |
| UI package tests | `apps/packages/agentks-ui` | `bun test` with happy-dom |
| Client tests | `apps/agentks-client` | Vitest with happy-dom |
| Homepage tests | `apps/agentks-homepage` | `bun test` |

`ctl test engine` runs the three engine suites together: the Rust tests, the theme check and the chain test.

The client uses Vitest rather than `bun test` for one reason. Vitest resolves modules through the client's Vite config, so tests load the one copy of Preact the build ships. `bun test` would load a second copy from the UI package.

## Rust test tools

| Crate | For |
|---|---|
| `insta` | Snapshot tests |
| `proptest` | Property tests |
| `assert_cmd` | Running the `agentks` binary and checking its output and exit code |
| `tokio-tungstenite` | A WebSocket client for server tests |

Each is the standard crate for its job, so a new contributor already knows it.

## Testing without the outside world

The library crate reaches the network and the store through traits, and the server reaches the engine through one. Tests replace them with fakes and still run the real code around them.

| Trait | In | Lets tests |
|---|---|---|
| `GitRemote`, `CommitStore` | `agentks-library` | Run the library sync against a fake remote and a folder store |
| `Backend` | `agentks-server` | Run the real HTTP and WebSocket transport against a hand-built backend |

Some tests do need a real program. The git crate's tests build scripted repositories in temporary folders and run the real `git`. The migrate crate runs one real script through `uv`.

## Rules every test follows

- **Tests never touch a developer's real machine home.** They set `AGENTKS_HOME` to a temporary folder.
- **Tests may unwrap.** The workspace denies `unwrap`, `expect` and `panic` in library code; `clippy.toml` allows them inside tests.
- **A JavaScript or Python test file follows the naming pattern**: `test_*.py`, `*_test.py`, `*.test.*` or `*.spec.*`. The test worker finds suites by these names, and an app with no matching file is reported as having no tests.
- **Coverage is reported, not gated.** A coverage target rewards tests that run code without checking it.
- **A rule is tested once.** The CLI and the server share one Rust core, so a rule's test lives in the crate that owns the rule, not in each command.

## Browser tests

Some things can only be proved in a browser, because the local client is a single-page app: the page a reader sees exists only after the client renders it.

- **Playwright** drives the browser tests. It runs all three browser engines.
- **Route parity** checks that every route one rendering serves, the other serves too.
- **Rendered-content comparison** reads the rendered main content of each page and compares headings and their IDs, links, text, tables and code, after normalising whitespace and attribute order. Links are compared by the target they resolve to, not by their `href` text.
- **Screenshots** of each layout, in light and dark mode, are reviewed by eye.
- **Performance budgets** start from the first correct measurement plus a margin. A regression of more than 10% against the last default-branch run fails CI, with each timing the median of three runs.

Tests prove parity. The maintainers using agentks every day prove it is usable, and that is the final check.

## Related

- [ctl and the gate](./10_ctl-and-the-gate.md): how the test rung runs these suites.
- [Adding a crate or an app](./25_adding-a-crate-or-an-app.md): wiring a new app's tests into `ctl`.
