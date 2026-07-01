---
color: var(--color-success)
---

# Guide (framework view)

**Scope:** the reference block rendered on every issue's Guide panel — a static
template with **generated islands**. The framework-bundled twin of the skill's manual:
present at every build/deploy even when the plugin isn't installed.

## Structure (implemented)

Ordered by **complexity, descending** — the Guide is a reference you open when
confused, and confusion concentrates where the machinery is:

```
Guide
├── Overview      — what an issue is · one pointer per section · Glossary link
│                   · the IDEAL FULL-ISSUE TREE (the one home for folder shapes)
├── Agent log     ★ generated kinds table · meta files · milestones · status tints
├── Subtasks      — states · groups (done/total) · surfaces
├── Agent memory  — index + topics · belongs/doesn't
├── Brainstorm    — kind words · graduation marker
├── Notes         — contrast with brainstorm
├── Comments      — flat log · NNN = id
└── Issue         — issue.md + settings.json · created/updated derivation · color note
```

- **Pointer-style prose** — bullets over paragraphs; scannable, more content per line.
- **Frontmatter tables inline** — each section carries its own fields table
  (milestone: iteration/status/agent/date · subtask: title/state · comment:
  author/date). No consolidated appendix — a lookup should be one hop.
- **One combined tree in Overview** instead of per-section trees or an end
  appendix — one home per shape, nothing to rot in two places.
- **Right-rail "On this page" outline** — `h2`s are id-stamped (`guide-<slug>`);
  `#guide-<slug>` hashes deep-link (activate panel + scroll), same pattern as
  `#comment-N`.

## Generated vs static

- **Generated:** the agent-log **kinds table** — symbol · code · name · "use for",
  built from the issue's effective `agentLogKinds` (defaults + additions).
  `AgentLogKind` gained an optional **`desc`** field so custom kinds get a
  description cell too (defaults carry framework descriptions).
- **Static:** everything else — the legend text, frontmatter tables, tree,
  status-tint legend.
- Candidate second island (not built): subtask state values + colours from the
  tracker root vocabulary. Add if the vocabulary ever diverges in practice.

## Guide vs Glossary (settled)

- **Guide = template + generated**, mechanical, reflects the issue's effective options.
- **Glossary = pure `glossary.md`**, author markdown, never generated (see `10_glossary`).

## Decided

- Complexity-descending section order (memory slotted after subtasks).
- Overview is prose pointers (no table); the full-issue tree lives there and only there.
- Frontmatter tables inline per section; no appendix.
- `guide.ts` becomes `buildIssueGuide(kindMap)` → `{ html, headings }`; DetailBody
  renders per issue; MetaSidebar gets the TOC panel.
- Keep in sync with the `documentation-guide` skill: skill = full manual, Guide = map.
