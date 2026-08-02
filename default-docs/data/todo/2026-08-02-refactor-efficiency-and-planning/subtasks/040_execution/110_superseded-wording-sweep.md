---
title: "Sweep — delete superseded wording, and make the rule explicit"
status: open
---

# Overview

Two halves, and the sweep is the bigger one:

1. **Write the rule** — *correct in place, keep nothing.* No struck-through text,
   no *"this previously said…"*, no annotated-stale sections. Where history
   genuinely matters it goes in the tracker, never in the shipped rule.
2. **Remove the wording that is already there**, and delete the three existing
   rules that mandate keeping it.

**Done when** `grep -riE "superseded|previously (said|read)|deprecated but kept"`
over the skill, the scaffolders and the user-guide returns only the new rule
itself, and no scaffolder emits a keep-the-old-wording instruction.

# References

- The ruling: [What each section is for](../../notes/60_section-responsibilities.md)
  → *Superseded wording is deleted, never kept*
- Provenance: [thread 07](../../brainstorm/07_discuss_section-responsibilities.md) → Q4
- Why it matters at this size: [the recording-overhead audit](../../notes/10_efficiency-audit-2026-08-02.md)
  names *"corrected in place with the superseded wording kept"* as the reason
  files only ever grow

# Todo list

- [ ] Write the rule into the skill, once, where an agent will hit it
- [ ] Delete the rule's opposite in `references/20_sections/26_agent-memory.md`
      — *"answered questions move to an `Answered` section, never deleted"*
- [ ] Delete the same instruction from the **plan scaffolder**,
      `agent-ks-docs/scripts/issues/new-memory-plan.mjs` — it emits the rule into
      every plan file it creates, so this is the one that keeps reproducing
- [ ] Delete it from the user-guide,
      `19_issues/05_sub-docs/07_agent-memory.md`
- [ ] Sweep the skill and user-guide for wording preserved *because it was
      superseded*, and delete it
- [ ] Decide the deprecated-vocabulary entries (`wip`, `blocked` as labels) —
      kept "for back-compat" in `19_issues/04_setup/02_vocabulary.md`. Under the
      greenfield rule these are candidates for deletion, not preservation
- [ ] `./start build` clean afterwards

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## The skill already contradicts itself here

`references/20_sections/26_agent-memory.md` says both:

| Line | Says |
|---|---|
| 57 | *"A superseded section gets DELETED, not annotated as stale."* |
| 77 | *"Answered questions move to an `Answered` section, never deleted."* |

Sid's ruling settles it in the first direction, everywhere. That also means the
argument line 77 rests on — *a decision whose reasoning is lost gets
re-litigated* — has to be met a different way: **the reasoning lives in the
tracker issue that made the decision.** That is not a loss, it is the routing
rule this whole issue is built on.

## Where it is worst

**Skills and `memory/` files, because they load into every session.** A preserved
old sentence there is a permanent tax on every run, paid whether or not anyone
ever needed the history. That is why Sid named those two specifically.

## Not in this sweep

- **`~/.claude/CLAUDE.md:115`** carries the same never-delete rule. It is Sid's
  personal global file — propose the diff, get sign-off. Covered by
  [`020`](./020_update-global-claude-md.md).
- **The consumer's `CLAUDE.md`, and its source-code comments** — both covered by
  [`060`](../060_sidequest-neurasutra.md), which runs last.
