---
title: "dep.yaml and dep.lock: parse, validate and write"
status: review
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
Review. dep.yaml and dep.lock parse, validate, edit and write in `agentks-library`; built in the wave-2 library worktree, not yet merged.

## Result
- **Code:** `apps/agentks-engine/crates/library/src/dep/` — `parse.rs` (`parse_dep_yaml`, `read_dep_yaml`, `parse_lock`, `read_lock`), `write.rs` (`render_lock`, `write_lock`, `render_dep_yaml`, `write_dep_yaml`), `edit.rs` (`add_entry`, `remove_entry`), `local.rs` (`resolve_local`, `local_boundary`), `source.rs` (`GitSource` URL and store-key forms).
- Every rule in 01 is one `ErrorRecord` (kind `library-invalid`) with the line, the key `libraries.<alias>` and a fix; all problems come back at once. A missing file is `config-missing` naming `agentks migrate` and `libraries: {}`. A broken lock is `library-lock-invalid` naming `agentks install`.
- The lock is rendered in a fixed order with its header, written through a temporary file and a rename, and not written when the bytes are unchanged.
- **Tests:** `crates/library/tests/dep_files.rs` (the design example, 15 rule cases each asserting its message and a fix, line numbers, the missing file, lock golden bytes, round trip, write-twice-identical, broken lock) plus unit tests in the module. `cargo test -p agentks-library` runs 41 tests in about 0.02 s.
- `./ctl gate` green in the worktree.

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
- Decided (claude, 2026-10-01): `serde-saphyr` 1.3 parses dep.yaml and dep.lock, because it is maintained, panic-free, reports line and column, and gives `Spanned<T>` for each entry's line; `serde_yaml` is archived. Only its deserialize feature is on; agentks writes both files as text itself, so the order and quoting are fixed.
- Decided (claude, 2026-10-01): `DepEntry::Local` holds the path as written (a `String` relative to `dep.yaml`), not a `RelPath`, because a local library may sit outside the project root but inside the repository (`../../artifacts` from a project in a subfolder), which a `RelPath` cannot express. `resolve_local` canonicalises it and refuses anything outside the repository.
- Decided (claude, 2026-10-01): The repository boundary comes from `Repo::discover` only when a local entry exists, so a project with only git libraries never needs git discovery; not in a repository means the project root is the boundary.
- Decided (claude, 2026-10-01): A git entry's `path` is normalised (`./a/` → `a`, `.` → none), so a cosmetic change does not re-resolve a pin.
- Decided (claude, 2026-10-01): `library add` and `library remove` edit dep.yaml in place and keep comments, then re-parse the result and compare it with the intended value; on any mismatch they rewrite the whole file and report `comments_kept: false`, because a silent wrong edit is worse than a visible rewrite.
- Decided (claude, 2026-10-01): Unknown top-level keys in dep.yaml and dep.lock are errors, like unknown entry keys, because relaxing later is easy and tightening is breaking.

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
