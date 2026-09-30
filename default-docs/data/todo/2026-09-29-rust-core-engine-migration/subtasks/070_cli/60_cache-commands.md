---
title: "Cache commands — `cache status`, `cache clean <root>…`, `cache reset`"
status: open
---

The command surface for the machine cache. `cache status` shows sizes and changes nothing; `cache clean <root>…` finds every agentks project under the given folders, keeps what they need, reports, and removes the rest after a yes; `cache reset` drops the current project's build cache. The logic is built in [040/90](../040_caching/90_clean-and-reset.md); this leaf wires it into the CLI with the right output, confirmation and exit codes.

# 01 To Do
- [ ] **`agentks cache status [--json]`**: build cache per project (path, engine versions, size, last used), library cache (commits, size), migrations and models folders (size), the running servers' cache snapshots when available ([040/95](../040_caching/95_cache-metrics.md)).
- [ ] **`agentks cache clean <root>... [--yes] [--json] [--all-branches|--current-branch-only]`**:
    - [ ] At least one root is required; no implicit `~`.
    - [ ] Show progress on a terminal while scanning.
    - [ ] Print the report; without `--yes`, ask for a typed confirmation (`remove`) on a terminal; with no terminal and no `--yes`, print the report and exit `0` without removing.
    - [ ] `--json` with `--yes` removes and returns the report plus what was removed; `--json` without `--yes` is a dry run.
- [ ] **`agentks cache reset [--yes]`**: the current project's build cache; ask on a terminal; tell a running server to drop its memory cache or say to restart it.
- [ ] **Skill text** for agents: show the report, wait for the user's yes, then run with `--yes` ([130/00](../130_ai-plugins/00_overview.md)).

## Guardrails
- Deleting outside the project always shows a report first and needs `--yes` or a typed confirmation (sidhantha, 2026-09-30).
- Never scheduled, never run by another command.

## Done when
- `cache clean <fixture> --json` (no `--yes`) removes nothing and lists the orphans; with `--yes` it removes exactly them.
- Without a terminal and without `--yes`, nothing is removed.
- `cache status --json` includes every section above.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References

**Where:** main repository, `apps/agentks-engine/crates/cli/`.

**Read first:**
- [Rust CLI, section 04](../../notes/02_engine/05_rust-cli.md).
- [Machine home, section 05](../../notes/02_engine/06_machine-home-and-build-cache.md).

**Depends on:** [040/90](../040_caching/90_clean-and-reset.md), [070/20](./20_content-commands-port.md).
**Unblocks:** the cleanup section of the docs ([180/00](../180_documentation/00_overview.md)).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): cache cleanup is started by the user, is given a root folder, scans it, and never runs on a schedule.
- Decided (claude, 2026-09-30): without a terminal and without `--yes`, `clean` is a dry run.

# 05 Notes & Analysis

## Watch out
- Whether a cache-clear button also appears in the dev toolbar is open question 04 ([open questions](../../notes/01_overview/05_open-questions-and-risks.md)). If it does, it calls `reset` for the current project only, never `clean`.
