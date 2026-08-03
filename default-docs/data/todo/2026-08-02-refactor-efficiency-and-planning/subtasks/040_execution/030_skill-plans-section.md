---
title: "Skill — teach the plans section, retire the old one"
status: done
---

# Overview

Teach `agent-ks-issues` the plans section: what it is, when to open a plan, what
makes one active, and how it relates to `subtasks/` (the checklist) and
`agent-memory/` (working state). **Delete** the old `agent-memory/plans/`
material rather than deprecating it in place.

**Done when** an agent with no prior context, reading only the skill, files a
plan in the right place and knows which one is active.

# References

- Shape: [Brainstorm: the plans section](../030_brainstorm-plans-section.md) — **gate**
- Implementation it documents: [Code the plans section](./010_code-the-plans-section.md)
- Bundled twin that must stay in sync:
  [Docs: user-guide + bundled guide](./050_docs-update-plans-section.md)
- Skill source: `plugins/agent-ks/skills/agent-ks-issues/`

# Todo list

- [x] Add the section to the anatomy table in `SKILL.md`
- [x] Write the plans reference under `references/20_sections/`
- [x] Update the routing guidance — the "two questions, four boxes" table gains
      a home for *forward view*
- [x] Update `26_agent-memory.md` — remove `plans/`, keep the rest
- [x] Update every CLI mention of `new-memory-plan`
- [x] **Delete**, do not narrate, the old shape — project rule below
- [x] `agent-ks check skill-links` clean
- [x] Cold-read test: does a fresh agent file a plan correctly from the skill alone?

# Outcomes and Next Steps

`plans/` is taught in three places, all consistent: the skill
(`references/20_sections/28_plans.md`, plus the section table and routing box in
`SKILL.md`), the user guide (`19_issues/05_sub-docs/09_plans.md`), and the
bundled `guide.ts` that ships to consumers without the plugin.

**The distinction the skill now makes, in the words it uses:**

| | Holds | In a word |
|---|---|---|
| `subtasks/` | the actionable item and the detail to execute it | **scope** |
| `plans/` | what runs when, what blocks what, who waits on whom | **order** |
| `agent-memory/` | what is true and binding, and how we got here | **memory** |

And the sentence written against the failure mode: **a plan is not a list of
work — it is the ordering and the blocking, which is exactly what a subtask
cannot express, because a subtask does not know about its siblings.**

## The old shape is deleted, not deprecated

`agent-memory/plans/` is gone from `26_agent-memory.md` (~180 lines of plan-file
template, cycle definitions, execution-order tables and column specs), from the
user-guide's agent-memory page (~150 lines), and from `guide.ts`. `new-memory-plan.mjs`
was `git rm`-ed, and every CLI mention of it replaced by `new-plan` / `new-stage`.

**No deprecation note anywhere**, per the project rule — the transition is carried
by this issue and by the migration script, not by a stale aside in a shipped rule.

## Verified

- **Cold-read test, run against the fixture rather than argued:** the demo issue
  now carries two plans, and the rules resolve without ambiguity — 01 is `done`
  with a `## Closed` section, 02 is `in-progress`, and the renderer pins 02 as
  active with no `active:` field anywhere. Confirmed from the live DOM:
  `active plan is pinned — ● Hardening the edges`.
- Internal links: 0 broken across the skill (checked outside code fences).
- `./start build` clean; `agent-ks check issues` exit 0.

`agent-ks check skill-links` does not exist as a command — the subtask assumed
it. The link check was run directly instead and is recorded above.

# Details

## The project rule that governs this edit

> **Skills are lean and history-free.** A skill describes the *current* system
> only — never past formats, removed features, renamed fields, or "content
> written before X may…" notes. History lives in git and the issue tracker;
> format transitions live in `migration/` scripts. When editing a skill and you
> find a historical aside, delete it rather than preserving it.

So there is **no deprecation note** for `agent-memory/plans/`. It is removed as
though it never existed, and the transition is carried by the migration script
from `010` plus this issue.

## The distinction the skill has to make clearly

Three things sound alike and are not, and the current skill only separates two of
them:

| | Holds | Lifecycle |
|---|---|---|
| `subtasks/` | The **checklist** — what work exists, scoped as self-sufficient work orders | Stable; a subtask is written once and ticked |
| `plans/` | The **forward view** — what is left, in what order, who is blocked, what changed about the plan | Live; rewritten as work lands |
| `agent-memory/` | Agent **working state** — knowledge that is binding, history of how we got here | Mutable / write-once by folder |

The failure mode to write against: an agent that treats the plan as a second
copy of the subtask list. The plan is not a list of work — it is the **ordering
and the blocking**, which is exactly what a subtask cannot express because a
subtask does not know about its siblings.

## Sequencing

This must land **before** `060_sidequest-neurasutra-memory`. Consumer repos link
to the skill rather than copying it, so the skill is the upstream and fixing a
consumer first would put a stale copy in the field.
