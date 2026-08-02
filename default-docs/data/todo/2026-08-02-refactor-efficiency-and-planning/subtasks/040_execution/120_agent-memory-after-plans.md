---
title: "Agent memory — what it becomes once plans/ leaves it"
status: open
---

# Overview

`agent-memory/` is documented today as an index plus **three** lifecycle
buckets — `plans/`, `knowledge/`, `history/`. The plans section takes the first
one away, and roughly **150 lines of the user-guide's agent-memory page are the
plan-file format**, which moves with it.

**This is bigger than a find-and-replace**, and it was missed in the original
scoping: the plans work was scoped as *add a section*, and nobody counted what
had to leave the section it came from.

**Done when** `agent-memory/` is documented as index + `knowledge/` + `history/`
in all four homes, no page still teaches the plan format from inside agent
memory, and nothing has grown a replacement "current state" store.

# References

- The decided shape:
  [What each section is for](../../notes/60_section-responsibilities.md) →
  *`agent-memory/` — memory*
- Where plans went: [The plans section](../../notes/50_plans-section-spec.md)
- Pairs with: [`010`](./010_code-the-plans-section.md) — do not land this before
  the section exists, or the docs describe a section nobody can use
- The four homes: `plugins/agent-ks/skills/agent-ks-issues/references/20_sections/26_agent-memory.md`
  · `default-docs/data/user-guide/19_issues/05_sub-docs/07_agent-memory.md`
  · `astro-doc-code/src/layouts/issues/default/guide.ts`
  · `plugins/agent-ks/skills/agent-ks-docs/scripts/issues/new-memory-plan.mjs`

# Todo list

- [ ] Cut `plans/` from the three-bucket model everywhere it is taught — it is
      **two** buckets now, plus the index
- [ ] Move the plan-file format documentation out of the agent-memory page and
      into the plans section's own docs
- [ ] Retire or repoint `agent-ks issue new-memory-plan` — it scaffolds into the
      old location and emits the never-delete rule
      ([`110`](./110_superseded-wording-sweep.md))
- [ ] Fix the graduated levels: `memory.md` alone → plus flat topic files → plus
      `knowledge/` and `history/`
- [ ] Fix the precedence line — `knowledge/` > `history/`, with `plans/` gone
- [ ] **Check nothing grew a replacement.** Specifically that `memory.md` is not
      given a "current state" section to fill the gap
- [ ] `guide.ts`'s agent-memory block, and the skill's `26_agent-memory.md`
- [ ] `./start build` clean; `agent-ks check issues` clean

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## The trap this subtask exists to avoid

`agent-memory/` had a bucket for *live, rewritten every session*. That bucket is
now empty, and the obvious move is to let `memory.md` absorb it — a small
"where we are" section at the top of the index.

**Do not.** The framework's own documentation already warns against it: an index
that accumulates a current-state section competes with the plan for the same job
and loses silently, because nothing says which is authoritative. The plan is one
sidebar click away. The index stays a map.

This is the same defect as the one this whole issue is about, arriving from the
opposite direction: a fact with two homes and no rule about which wins.

## Why it is more work than it reads

The user-guide's agent-memory page is not a short page. Its `## plans/` section
documents the numbering bands, the plan-file template, the cycle a plan is built
from, identity-versus-order, the execution-order section, the table columns and
how to keep a plan honest — roughly 150 lines, all of which is now the plans
section's material.

Moving it is the right call rather than deleting it: it is good documentation
written in the wrong place.
