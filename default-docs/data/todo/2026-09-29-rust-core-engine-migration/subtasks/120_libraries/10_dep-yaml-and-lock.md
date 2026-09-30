---
title: "dep.yaml and dep.lock: parse, validate and write"
status: open
---

Every agentks project declares its libraries in `config/dep.yaml`, and agentks records what it resolved in `config/dep.lock`. This leaf builds the Rust types, the parser, the validator and the lock writer for both files. It does not fetch anything; [120/20 fetch and resolve](./20_fetch-and-resolve.md) does. When it is done, the engine can load both files, reject every invalid form with an error that names the fix, and write a lock that changes by a small, stable diff.

# 01 To Do
- [ ] **Types.** Model the two files as Rust types with serde, in the crate that owns libraries.
    - [ ] `DepFile { libraries: BTreeMap<Alias, Entry> }`. A `BTreeMap` keeps aliases sorted, so writes are stable.
    - [ ] `Entry` is an enum: `Git { source: GitSource, path: Option<RelPath>, selector: Selector }` or `Local { path: RelPath }`.
    - [ ] `GitSource` is `Github { owner, repo }` or `Url(String)`. `github: owner/repo` normalises to `https://github.com/owner/repo.git` for fetching, but keeps its written form for the lock.
    - [ ] `Selector` is `Latest`, `Tag(VersionReq or exact Version)`, `Commit(40-char hex)` or `Branch(String)`.
    - [ ] `LockFile { libraries: BTreeMap<Alias, LockEntry> }` with `LockEntry { source, path, requested, commit, version }`.
- [ ] **Parse `dep.yaml`.** Read `config/dep.yaml` with a YAML parser that reports line and column. Unknown keys inside an entry are errors, not ignored.
- [ ] **Validate `dep.yaml`.** Every rule below is one error with the file, the alias and the fix:
    - [ ] The file is missing → "config/dep.yaml is required; run `agentks migrate` (0.x project) or create it with `libraries: {}`".
    - [ ] Not valid YAML, or no `libraries:` key.
    - [ ] An alias outside `^[a-z][a-z0-9-]*$`.
    - [ ] Both `github` and `git`; neither `github`, `git` nor `path`.
    - [ ] A local entry (only `path`) with a selector.
    - [ ] More than one of `tag`, `commit`, `branch`.
    - [ ] A `commit` that is not 40 hex characters.
    - [ ] A `tag` that is neither an x.y.z version (with or without `v`) nor a valid semver range.
    - [ ] A local `path` that escapes the project's repository after canonicalising (for example `../../other-project`). Use the project root from [020/20 config folder](../020_content-contract/20_config-folder.md) and the repository root from git; refuse when unsure.
    - [ ] A git `path` that is absolute or contains `..`.
- [ ] **Parse the lock.** A missing `dep.lock` is an empty lock, not an error. A lock that does not parse is an error naming `agentks install`.
- [ ] **Write the lock.** Only through one function, called only by `start`, `install`, `library add` and `library remove`.
    - [ ] Aliases sorted, fields in a fixed order (`github`/`git`, `path`, `requested`, `commit`, `version`), a header comment "written by agentks, committed, never edited by hand".
    - [ ] Write to a temporary file in `config/` and rename it over `dep.lock`, so a crash never leaves half a lock.
    - [ ] Write nothing when nothing changed, so `git status` stays clean.
- [ ] **`requested` strings.** Render the selector as written: `latest`, `tag 1.4.0`, `tag ^2.1`, `commit 3f9c…`, `branch main`. [120/20](./20_fetch-and-resolve.md) compares this string with the current `dep.yaml` to find changed entries.
- [ ] **Tests.** Unit tests for every validation rule (one fixture per rule, asserting the message), a round trip (parse → write → parse gives the same value), and a golden test that the written lock is byte-identical across runs.

## Guardrails
- agentks never edits `dep.yaml` except through `agentks library add` and `library remove`, which rewrite it with the same stable order and keep comments where the YAML library allows. If comments cannot be kept, say so in the command output rather than dropping them silently.
- No content hash in the lock. The commit is the hash.
- Local entries never appear in the lock.

## Done when
- `cargo test` passes the validation, round-trip and golden-output tests.
- Loading the example `dep.yaml` from [the library system note, section 03](../../notes/04_ecosystem/01_library-system.md) succeeds, and each invalid variant fails with its own message.
- Writing the same lock twice gives identical bytes.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, in the library crate under `apps/agentks-engine/` ([030/10](../030_rust-engine/10_workspace-and-crate-boundaries.md) fixes the crate name).

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md), sections 03 (`dep.yaml`), 04 (selectors) and 05 (`dep.lock`).
- [Project config](../../notes/02_engine/02_project-config.md), section 07.
- [Libraries, dep.yaml and dep.lock](../../brainstorm/02_future-stages/09_libraries-and-dependencies.md) — the discussion.

**Depends on:** [020/20 config folder](../020_content-contract/20_config-folder.md) (finding `config/` and the project root), [030/20 error model](../030_rust-engine/20_error-model.md).
**Unblocks:** [120/20 fetch and resolve](./20_fetch-and-resolve.md), [120/40 commands](./40_library-commands-and-tui.md), [140/30 docs migration](../140_versioning-and-migrations/30_docs-migration-0x-to-1.md) (creates an empty `dep.yaml`).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): `dep.yaml` is required even when empty; local paths are relative to `dep.yaml`; any git URL is allowed; tag, commit, branch or latest; ranges allowed; x.y.z versions ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (claude, 2026-09-30): the lock nests entries under `libraries:`, mirroring `dep.yaml` (same note).
- Decided (claude, 2026-09-30): no selector means the latest release (same note).

# 05 Notes & Analysis
## 01 The two files
```yaml
# config/dep.yaml
libraries:
  icons:
    github: NeuraLabsHQ/agent-knowledge-system-library
  kit:
    github: acme/design-kit
    path: libraries/frames
    tag: 1.4.0
  shapes:
    git: https://gitlab.com/acme/shapes.git
    tag: ^2.1
  team:
    path: ../artifacts
```
```yaml
# config/dep.lock — written by agentks, committed, never edited by hand
libraries:
  icons:
    github: NeuraLabsHQ/agent-knowledge-system-library
    requested: latest
    commit: 9d02e11c5a7f0000000000000000000000000000
    version: 2.1.0
```

## Watch out
- `serde_yaml` is unmaintained; pick a maintained YAML crate that reports positions (check crates.io at start and record the choice in 04 Decisions).
- The alias rule forbids underscores and upper case. Keep it strict; relaxing later is easy, tightening is a breaking change.
- Windows paths: normalise `\` to `/` before the escape check.
