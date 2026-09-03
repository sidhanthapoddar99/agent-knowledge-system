---
title: "Build round"
status: done
agent: claude-fable-5-1
---

# Goal

Five builders write the new plugin tree in parallel per the skills-v2 spec

# Inputs

- [the skills-v2 spec](../../notes/skills-v2-spec.md)
- `01_summary.md`

# Expected Outcome

The change, and what it touched.

# Outcome

All five builders finished. Every report below is `done`. The run was cut once
mid-way; the cli and artifacts builders resumed from their files and finished.

| Builder | Report | Result |
|---|---|---|
| cli | [011 cli changes](./011_cli-changes.md) | Self-test 122/122. `new-round` added, `new-iteration` kept as alias. `check issues` errors on a marked `subtasks:` entry and warns on the old log shape. `new-stage --subtask` resolves numbers and slugs to titled links. Templates match spec section 6 |
| docs | [012 harvest docs](./012_harvest-docs.md) | 6 files, 145 harvest rows. 12 old claims contradicted the code and were dropped with locations |
| issues | [013 harvest issues](./013_harvest-issues.md) | 11 files, 298 harvest rows. Status names checked against `issue-status.ts` |
| artifacts | [014 harvest artifacts](./014_harvest-artifacts.md) | 7 references (dataviz split in two). Token names kept. `PROVENANCE.md` hash matches |
| root | [015 commands and root](./015_commands-and-root.md) | 4 command skills, agent shim, README, manifest. Index-check split into `SKILL.md` plus a procedure reference |

Whole-tree check by the orchestrator: `check skill-links` on the temp tree passes,
43 files. The scratch tracker is restored to its clean fixture.

Open points the builders raised, for the reviewer or for Sid:

- A plan stage now has five `#` sections, but the renderer builds the stage heading from `title` and the old validator warned on an `# H1`. Renderer follow-up, spec section 14.
- `issue add-agent-log` still writes a loose file under `agent-log/`; `check issues` warns on it. Remove or re-point in a follow-up.
- `bin/agent-ks` comments carry history text. Left as is per "change nothing else".
- `add-comment` dates the file in UTC. Local time may be wanted.
- The starter template uses `isCollapsible`, a key the loader does not read. Same key in the repo's own user-guide settings. Separate subtask.
- Word counts: `SKILL.md` files sit under 600 by prose count; `wc -w` counts table pipes. Decision: pipes do not count.

Rounds 020, 030 and 040 did not run. Sid stopped the run after the build.
