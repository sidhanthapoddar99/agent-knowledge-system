---
title: "The three-reader audit"
status: in-progress
agent: claude
---

# Goal

Subtask 130 — the last thing that happens. Put the previous version of the
`agent-ks-issues` skill and the new one side by side and ask three independent
readers which is better, none of them having seen this issue or the reasoning
behind either version.

**Store the verdicts; act on none of them.** An audit acted on immediately
becomes a fix round with no independent check of its own.

# Inputs

- `subtasks/040_execution/130_independent-skill-audit.md`
- The brief all three read verbatim — reproduced in this file's Setup below
- **Version A (old):** commit `8f0ce28`, 21 files, 2,412 lines
- **Version B (new):** commit `a3c5603`, 22 files, 2,718 lines

Reproduce the comparison in two commands:

```bash
git archive 8f0ce28 plugins/agent-ks/skills/agent-ks-issues | tar -x -C <dir>   # A
git archive a3c5603 plugins/agent-ks/skills/agent-ks-issues | tar -x -C <dir>   # B
```

# Expected Outcome

A verdict per reader: a winner on each of the four questions with its reason, the
worst passage in its own winner, and anything it could not follow. **A reader
that says "both are fine" has not answered.**

# Outcome

Three readers, one brief, no sight of each other. Verdicts land as producer files
beside this one — `071`, `072`, `073` — because each is a substantial output that
has to live somewhere, and re-typing them here would be the duplication this whole
issue exists to remove.

**Merged as a union, not a vote.** If one reader finds a real incoherence, that
finding stands regardless of what the other two said.

## Setup notes worth keeping

**The mix is deliberate:** two model families, two tiers, so a shared blind spot
is less likely than with three of the same.

**The first sol launch failed on a path, not on the work.** `--cwd` pointed at a
scratch directory outside the trusted root in `~/.codex/config.toml`, so the job
resolved to `/home/sid/.claude`, found nothing, and returned in 27 seconds.
Relaunched **`--fresh`** from inside `/home/sid/projects` — never resumed, since
a thread carries its own sandbox state and resuming would have inherited the
wrong one.
