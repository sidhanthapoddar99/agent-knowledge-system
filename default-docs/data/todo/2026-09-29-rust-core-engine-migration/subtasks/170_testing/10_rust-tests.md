---
title: "Rust tests — the shared harness, unit and integration layers"
status: open
---

The Rust engine and the CLI are one binary, and most of agentks's rules live in it: ordering, URLs, links, frontmatter, the tracker rules, the version gate, caching, the `/api` protocol. This leaf builds the shared Rust test harness and the integration layer that tests the binary from the outside, and sets the rules every crate's own unit tests follow. When it is done, `cargo test --workspace` proves every rule without a browser, fast enough to run on every push.

# 01 To Do
- [ ] **Test layout per crate.** Each crate in the workspace ([030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md)) keeps unit tests next to the code (`#[cfg(test)] mod tests`) and its own small fixtures under `crates/<crate>/tests/fixtures/`.
    - [ ] Write the rule into `AGENTS.md` of the main repository: a new rule ships with a unit test in the same change.
- [ ] **A shared test-support crate.** `apps/agentks-engine/crates/agentks-test-support/` (dev-dependency only, never linked into the binary):
    - [ ] `TempProject` — builds a project folder in a temporary directory from a fixture folder or inline files (`config/site.yaml`, `config/dep.yaml`, sections), and sets `AGENTKS_HOME` to a sibling temporary folder.
    - [ ] `TempGitRepo` — initialises git in a `TempProject` and makes commits with fixed dates, for the tracker's git-derived dates.
    - [ ] `FakeLibraryRepo` — a local bare git repository with tags and a `manifest.json`, served by path (`git:` or `path` source), so library tests need no network.
    - [ ] `ServerHandle` — starts the server in-process on a free port and returns a WebSocket client that speaks the `/api` protocol ([050/20](../050_server/20_websocket-api.md)).
- [ ] **CLI integration tests** in `apps/agentks-engine/tests/cli/`, run against the built binary with `assert_cmd`:
    - [ ] Every command's `--help` and `help --json` entry exists and matches the catalog.
    - [ ] Exit codes: 0 success, 1 no results / runtime failure / validation errors, 2 invalid usage.
    - [ ] `--json` output is one JSON document on stdout; diagnostics go to stderr.
    - [ ] The content commands carried over from agent-ks (`check`, `find`, `issue …`, `move`) against fixture trackers, with the same results as today's CLI on the same input.
    - [ ] `init --template` against a `FakeLibraryRepo`; `install` writes `dep.lock`; `cache clean` and `cache reset` remove exactly what they claim.
- [ ] **Server integration tests** in `apps/agentks-engine/tests/server/`:
    - [ ] Each `/api` request kind returns the documented shape for a fixture project (`manifest`, `page`, `sidebar`, `issues-index`, `issue`, `blog-index`, `custom`).
    - [ ] A file edit pushes new hashes for exactly the affected keys: the page, every page that embeds it, the section sidebar, the tracker index when a tracker file changed.
    - [ ] Security: a wrong `Host`, a foreign `Origin`, a `../` path and a symlink out of the project are all refused ([050/50](../050_server/50_security.md)).
    - [ ] A second `agentks start` on the same project attaches instead of starting a new server.
- [ ] **Snapshot tests for rendered output** with `insta`: each golden fixture from [020/10](../020_content-contract/10_golden-fixtures.md) renders to a reviewed snapshot. A changed snapshot fails until a person or agent accepts it with `cargo insta review`.
- [ ] **Property tests** with `proptest` where the input space is large: URL derivation from paths, `NN_` prefix stripping, relative link resolution. Each property states a rule ("resolving a link and deriving the target's URL gives the same URL as deriving the source's URL and joining the link").
- [ ] **Coverage report** with `cargo llvm-cov`, published as a CI artifact. Not a gate; a map of what is untested.

## Guardrails
- No test reads or writes the real `~/.agentks`; `TempProject` always sets `AGENTKS_HOME`.
- No network in `cargo test`. Library tests use `FakeLibraryRepo`.
- No sleeps to wait for the watcher. Wait for the pushed message, with a timeout that fails the test.
- Test-support code never ships: it is a dev-dependency only.

## Done when
- `cargo test --workspace` passes on Linux, macOS and Windows in CI, with no network.
- Deleting any single rule in `agentks-core` (try three at random) makes at least one test fail.
- `cargo insta test --check` passes with no pending snapshots.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `NeuraLabsHQ/agent-knowledge-system`, folder `apps/agentks-engine/` (local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`).
- **Read first:**
  - [Development workflow and testing](../../notes/05_delivery/05_development-workflow-and-testing.md), sections 04 and 05.
  - [The Rust engine](../../notes/02_engine/03_rust-engine.md) and [sync engine and server](../../notes/02_engine/04_sync-engine-and-server.md) — what the tests call.
  - [The Rust CLI](../../notes/02_engine/05_rust-cli.md) — the command surface and exit codes.
  - Today's CLI tests, to carry over their cases: the inline `#[cfg(test)]` modules under [agent-ks-cli/src](../../../../../../agent-ks-cli/src), and the CLI [README](../../../../../../agent-ks-cli/README.md).
- **Depends on:** [010/20 main repo skeleton](../010_project-setup/20_main-repo-skeleton.md), [030/10 workspace and crate boundaries](../030_rust-engine/10_workspace-and-crate-boundaries.md).
- **Unblocks:** [170/20 route and content parity](./20_route-and-content-parity.md), [170/40 performance budget](./40_performance-budget.md), [060/95 collaboration tests](../060_collaboration/95_collaboration-tests.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): the CLI and the engine share one core, so a rule is tested once ([the Rust engine](../../notes/02_engine/03_rust-engine.md)).
- Decided (claude, 2026-09-30): `insta` for snapshots, `proptest` for property tests, `assert_cmd` for the binary, `tokio-tungstenite` for the WebSocket client. Each is the standard crate for its job, so a new contributor already knows it.
- Decided (claude, 2026-09-30): coverage is reported, not gated, because a coverage number rewards tests that execute code without checking it.

# 05 Notes & Analysis

## 01 Which layer tests what

| Question | Layer |
|---|---|
| Is this rule right for this input? | Unit test in the crate |
| Does the rule hold for every input shape? | Property test |
| Does this page render the same as last reviewed? | Snapshot |
| Does the command behave as documented? | CLI integration |
| Does the server answer and push correctly? | Server integration |
| Does it look and behave right in a browser? | [170/30 end to end](./30_end-to-end.md) |
| Does it match today's engine? | [170/20 parity](./20_route-and-content-parity.md) |

## Watch out
- Windows paths: every URL test runs on Windows in CI, because a `\` leaking into a URL is the classic bug here.
- Git dates: fixture commits need fixed author and committer dates (`GIT_AUTHOR_DATE`, `GIT_COMMITTER_DATE`), or the tracker's `updated` field changes every run.
- Snapshot churn: when a render change is intended, update the snapshots in the same commit and say why in the message.
