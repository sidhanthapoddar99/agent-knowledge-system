---
title: "Docs — user-guide + bundled guide"
status: open
---

# Overview

Document the plans section for humans: the user-guide prose under
`19_issues/`, and the framework-bundled anatomy guide rendered on every issue's
**Guide** panel.

**Done when** someone who has never seen the tracker can read the user-guide and
place a plan correctly, and the Guide panel's anatomy tree shows the new section.

# References

- Shape: [Brainstorm: the plans section](../030_brainstorm-plans-section.md) — gate
- Skill twin that must not contradict this:
  [Skill: the plans section](./030_skill-plans-section.md)
- Targets: `default-docs/data/user-guide/19_issues/`,
  `astro-doc-code/src/layouts/issues/default/guide.ts`

# Todo list

- [ ] User-guide: add the section to the anatomy overview
- [ ] User-guide: update the design-philosophy page — *why* the plan is not
      agent-memory
- [ ] `guide.ts`: the anatomy tree and the section legend
- [ ] Grep the user-guide for `agent-memory/plans` and fix every hit
- [ ] Rebuild and eyeball the Guide panel on the demo fixture
- [ ] `agent-ks check section` / `check issues` clean

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Why `guide.ts` is not optional and not a duplicate

Per the project's own rule, `guide.ts` is the **plugin-independent twin** of the
`agent-ks-issues` skill — a static anatomy legend compiled into the site, present
at every build whether or not anyone has the plugin installed. The skill carries
the manual; `guide.ts` carries the map.

That makes it the one place where restating content is correct rather than
wasteful, and it also makes it the easiest thing in this issue to forget. A skill
change that leaves it stale ships a visible contradiction to every consumer site.

## Scope boundary

Prose and the legend only. The routing, sidebar and panel work is `010` — if this
subtask finds itself editing an `.astro` file, it has drifted.
