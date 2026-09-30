---
title: "agentks install, agentks library and check libraries"
status: open
---

This leaf gives users and agents the commands to manage libraries: `agentks install`, the `agentks library` family (`add`, `remove`, `list`, `show`, `find`, `search`), `agentks check libraries`, and the `agentks library` TUI (a full-screen terminal interface) for people. Every plain command takes `--json`, because agents cannot drive a TUI. The commands are thin: they call the sync, the manifest loader and the catalog from [120/20](./20_fetch-and-resolve.md) and [120/30](./30_manifest-and-catalog.md).

# 01 To Do
- [ ] **`agentks install [--update [ALIAS...]]`.** Runs the sync without a server. Prints added, removed and moved (old → new, with versions). `--update` alone re-resolves every branch, range and latest entry; with aliases, only those.
- [ ] **`agentks library add SOURCE [--as ALIAS] [--path P] [--tag T | --commit C | --branch B]`.**
    - [ ] `SOURCE` is a catalog id, `owner/repo` (GitHub) or a git URL. Default alias: the catalog id, else the repository name, lower-cased to the alias rule.
    - [ ] Print the repository and the manifest summary (name, version, description, element count, engine range) before writing.
    - [ ] Write the entry into `dep.yaml` (stable order), run the sync, write the lock.
    - [ ] An alias that already exists → error; never overwrite.
- [ ] **`agentks library add --local FOLDER [--as ALIAS]`.** Writes a `path:` entry relative to `dep.yaml`.
- [ ] **`agentks library remove ALIAS`.** Removes the entry and its lock record. Cached files stay until `agentks cache clean`.
- [ ] **`agentks library list`.** Alias, source, pinned commit (short), version, element count. Local entries show `local`.
- [ ] **`agentks library show ALIAS`.** The manifest: every element with description and tags.
- [ ] **`agentks library find WORDS`.** Elements across the project's libraries whose name, description or tags match. Results as `alias:element` with description, ranked by field (name > tags > description).
- [ ] **`agentks library search WORDS`.** Catalog entries (libraries and templates) that match.
- [ ] **`agentks check libraries`.** Every manifest check from [120/30](./30_manifest-and-catalog.md), plus every `alias:element` named in a video cue or an artifact's `/_lib/` URL. Reads only files, so it needs no server. Exit 1 on any error.
- [ ] **`agentks library` (no arguments).**
    - [ ] In a terminal: the TUI with three panes — the catalog, this project's libraries, what the machine has cached — and one key to add or install. Use `ratatui`.
    - [ ] Without a terminal (piped, CI, an agent): print `library list` instead. Never block waiting for keys.
- [ ] **Output contract.** Human text by default; one JSON document on stdout with `--json`; diagnostics on stderr; exit 0 / 1 / 2 as the CLI contract in [070/10](../070_cli/10_rename-to-agentks.md).
- [ ] **Help entries** for every command in the binary's catalog (`agentks help library add --json`).
- [ ] **Tests.** Integration tests with fixture repositories: add → list → show → find → remove; add refuses a duplicate alias; `--json` shapes are stable (snapshot tests); `check libraries` finds a bad `alias:element` in a fixture video page and artifact.

## Guardrails
- `agentks start` never adds an entry on its own; only `library add` does, and it prints the source first.
- The TUI is a convenience. Every TUI action has a plain command.
- `cache clean` is not in this leaf; it belongs to [040/90 clean and reset](../040_caching/90_clean-and-reset.md).

## Done when
- `agentks library add agentks-default && agentks library find server --json` returns `icons:server` (or the element the default library ships).
- `agentks library` in a terminal opens the TUI; `agentks library | cat` prints the list.
- Snapshot tests of every `--json` output pass.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, the CLI crate under `apps/agentks-engine/`.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md), section 10 (commands).
- [Rust CLI](../../notes/02_engine/05_rust-cli.md), section 04 (library and cache commands) and the output conventions.
- [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md), section 03 — how skills use `find`, `show`, `add`, `search`.

**Depends on:** [120/20](./20_fetch-and-resolve.md), [120/30](./30_manifest-and-catalog.md), [070/10 rename and CLI contract](../070_cli/10_rename-to-agentks.md).
**Unblocks:** [130/10 plugin port](../130_ai-plugins/10_agentks-plugin-port.md), [180/40 libraries docs](../180_documentation/40_libraries-and-templates.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): `agentks library` works as a TUI and as plain commands; the TUI and the catalog are a convenience ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (sidhantha, 2026-09-30), on claude's proposal: adding a library prints its source.
- Decided (claude, 2026-09-30): `install --update` re-resolves ranges too.

# 05 Notes & Analysis
## Watch out
- The [Rust CLI note](../../notes/02_engine/05_rust-cli.md) says `--update` moves only branch and latest entries. The library note is newer and wins; update the CLI note's line when this leaf lands.
- Keep `find` fast: it runs before an agent builds any visual. Index on first use, not on every call.
