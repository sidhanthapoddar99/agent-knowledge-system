---
title: "The using-with-AI page describes a world that no longer exists"
status: open
---

# Overview

`user-guide/19_issues/09_using-with-ai.md` is the page a reader opens to learn
how to point an agent at this tracker. It is wrong in four independent ways, and
the first one is the worst:

| Line | Says | Actually |
|---|---|---|
| 13 | *"⏸ **Not implemented yet.** … the content below is the *expected* workflow"* | The skill shipped as `agent-ks-issues`, is installed, and auto-triggers |
| 122, 147–165 | Invokes helpers as `node scripts/issues/show.mjs …` | The entrypoint is `agent-ks issue show …`. **And `node` does not work** — `gray-matter` is unresolvable from `plugins/`, so a reader following this page gets a module-not-found error |
| 135 | A second *"⏸ Not implemented yet"* | Same |
| 81 | *"Write an agent-log entry every iteration. Goal / Approach / Result / Next"* | That four-section body is retired. A round file's head is Goal / Inputs / Expected Outcome / Outcome, in `02_working/` |

Found while updating this page's folder tree for
[the slot numbering](./100_agent-log-slot-numbering.md) — that change fixed the
tree and nothing else, deliberately, because the rest is a different problem.

**Done when** a reader can follow the page end to end and every command they type
works.

# References

- The change that surfaced it: [slot numbering](./100_agent-log-slot-numbering.md)
- The truth for commands: `agent-ks help`, and
  `plugins/agent-ks/skills/agent-ks-docs/references/cli-toolkit.md` (outside the
  site root, so a path rather than a link)
- The truth for the agent-log shape: [agent-log structure](../notes/20_agent-log-structure.md)

# Todo list

- [ ] Delete both *"Not implemented yet"* callouts — the skill shipped
- [ ] Replace every `node scripts/issues/*.mjs` invocation with `agent-ks …`.
      **Verify each command actually runs** rather than transcribing it; a
      user-guide command that errors is worse than no command
- [ ] Fix the round-file recipe to the current head and location
- [ ] Read the whole page for anything else predating the skill — it was written
      as a forecast, so the staleness is unlikely to stop at four spots

# Outcomes and Next Steps

> [!NOTE]
> **PLACEHOLDER** — nothing done. This is the finding, not the fix.

## Why it is its own subtask and not a line in another one

The page is stale because it was written **before** the thing it documents
existed, and never revisited after it shipped. That is a different failure from
a doc that drifted: drift is fixed by correcting sentences, a forecast is fixed
by rewriting against reality and checking every claim.

Doing it inside the slot-numbering change would have hidden a four-way
correctness problem inside a naming change, and made that change impossible to
review.
