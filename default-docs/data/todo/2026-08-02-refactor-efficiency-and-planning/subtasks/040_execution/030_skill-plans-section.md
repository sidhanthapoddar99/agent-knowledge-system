---
title: "Skill — teach the plans section, retire the old one"
status: open
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

- [ ] Add the section to the anatomy table in `SKILL.md`
- [ ] Write the plans reference under `references/20_sections/`
- [ ] Update the routing guidance — the "two questions, four boxes" table gains
      a home for *forward view*
- [ ] Update `26_agent-memory.md` — remove `plans/`, keep the rest
- [ ] Update every CLI mention of `new-memory-plan`
- [ ] **Delete**, do not narrate, the old shape — project rule below
- [ ] `agent-ks check skill-links` clean
- [ ] Cold-read test: does a fresh agent file a plan correctly from the skill alone?

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

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
