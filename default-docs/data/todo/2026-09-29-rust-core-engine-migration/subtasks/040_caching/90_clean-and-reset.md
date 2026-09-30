---
title: "Clean and reset — `agentks cache status · clean <root>… · reset`"
status: open
---

Nothing in `~/.agentks/` is cleaned automatically. When the user wants the space back, they run `agentks cache clean <root>…`: agentks scans the given folders for every agentks project, keeps what those projects still need, shows a report, and removes the rest only after a yes. `cache status` shows sizes, and `cache reset` drops the current project's build cache. This leaf builds the logic in the core; the command surface is [070/60](../070_cli/60_cache-commands.md).

# 01 To Do
- [ ] **Find the projects.** Walk each root for `config/dep.yaml`. Skip `.git`, `node_modules`, `target`, `.venv`, `data/builds` and hidden folders other than `config`. Do not follow symlinks out of the root. Show progress on a terminal: it may take two or three minutes on a large disk, and that is accepted.
- [ ] **Collect what is needed.**
    - [ ] Every commit in each found project's `config/dep.lock` (library and template commits).
    - [ ] Proposed, open: also the `dep.lock` of each project's other local branches, read from git without checking them out. Implement behind a flag `--all-branches` (default on) so the choice can flip without code changes; see section 01.
    - [ ] Every build cache entry (by project key) whose recorded project folder exists.
- [ ] **Report** (human and `--json`): projects found; library commits to remove with their size; build caches to remove (missing project folders), with sizes; total space freed; anything skipped and why.
- [ ] **Remove, after `--yes` or a typed confirmation.** Restore write permission on read-only library folders before removing them ([040/60](./60_library-cache.md)). Take the per-commit lock first, so a commit being installed is never removed.
- [ ] **Never remove what a running server uses.** Read `run/` records ([050/40](../050_server/40_lifecycle-ps-stop-logs.md)); a running project's needs are kept even if it lies outside the scanned roots.
- [ ] **`cache status`**: sizes of the build cache (per project) and the library cache, from `build-cache.json` where possible. Changes nothing.
- [ ] **`cache reset`**: remove the current project's build cache folder (all engine versions). If its server is running, tell it to drop its memory cache too (a local control message) or say to restart.
- [ ] **Model and migration downloads** (`models/`, `migrations/`) are listed in `status`. `clean` removes a migration script folder whose version no installed project uses; it never removes models (they are large downloads the user asked for), only reports them.

## Guardrails
- Report first, always. Deleting outside the project needs `--yes` or a typed confirmation (sidhantha, 2026-09-30).
- The skills tell agents to show the report and wait for the user's yes ([130/00](../130_ai-plugins/00_overview.md)).
- Safe by construction: a wrongly removed library is fetched again from its lock; a removed build cache is rebuilt. Content is never touched.

## Done when
- On a fixture tree with three projects, two shared commits and one orphan commit, `cache clean <tree> --json` lists exactly the orphan commit and the build caches of deleted projects; with `--yes` it removes only those.
- A clean that runs while another process installs a commit does not remove it (lock test).
- A project running outside the scanned roots keeps its libraries.
- `cache reset` removes only the current project's build cache.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/`, the cache crate (scan, plan, remove); commands in the CLI crate.

**Read first:**
- [Machine home, section 05 Cleanup](../../notes/02_engine/06_machine-home-and-build-cache.md) and its section 08 (open: other branches' locks).
- [Rust CLI, section 04](../../notes/02_engine/05_rust-cli.md) — `cache status · clean · reset`.
- [The ~/.agentks home (brainstorm)](../../brainstorm/01_initial-discussion/07_agentks-home-and-build-cache.md).

**Depends on:** [040/40](./40_build-cache-on-disk.md), [040/60](./60_library-cache.md), [050/40](../050_server/40_lifecycle-ps-stop-logs.md).
**Unblocks:** [070/60 cache commands](../070_cli/60_cache-commands.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): no automatic cleanup; cleanup is started by the user, from the CLI or by asking an AI, never on a schedule.
- Decided (sidhantha, 2026-09-30): cleanup is given a root folder, scans for every project under it, and removes what none needs. Thoroughness matters more than speed.
- Proposed (claude, 2026-09-30): `cache reset` for one project; reading other branches' locks.

# 05 Notes & Analysis

## 01 Other branches' locks
Open in [the machine home note, section 08](../../notes/02_engine/06_machine-home-and-build-cache.md) and [open questions](../../notes/01_overview/05_open-questions-and-risks.md). Reading them means a branch switch never triggers a download; the cost is scanning git refs. The flag lets the answer change without a rewrite.

## Watch out
- Two roots that overlap (`~/projects` and `~/projects/acme`) must not count a project twice.
- A `config/dep.yaml` inside a library cache or a template folder is not a project. Skip `~/.agentks/` itself.
