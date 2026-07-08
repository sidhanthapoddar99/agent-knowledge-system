---
title: "Goal — ultracode implementation run (all seven subtasks)"
---

## Goal

Implement the entire issue: all seven subtasks, end to end, with every
recommendation and settled decision from the planning run accepted by the user
(sidhantha, 2026-07-07) as final. The feature ships: artifact loader + embed,
`/artifacts` route, reserved-URL guard, the `agent-ks-artifacts` skill,
sibling-skill integration, user-guide + dev-docs pages, and the provenance
manifest.

## Approach

Multi-agent workflow, Opus at xhigh reasoning for all implementation agents,
orchestrated by the main session:

1. **Build** — three parallel streams: (a) a sequential code chain — subtask
   `30_reserved-url-guard` + `20_route` first (config.ts + the serving route),
   then `10_component` (loader, sidebar, embed, sidecar) on top of it;
   (b) `40_authoring-skill` (plugins tree, no build conflicts);
   (c) `70_upstream-provenance` (manifest, no build conflicts).
2. **Integrate** — after code + skill land: `50_skills-integration` and
   `60_documentation` in parallel.
3. **Verify** — an end-to-end verifier (full build, dev server, headless
   browser screenshots of embed both themes, full-page route, guard error) and
   a consistency/completeness critic; then a fixer applies confirmed findings.

Agents manage their own subtask statuses (`in-progress` → `review`, never
`done`) and tick checkboxes as they land work. The dogfood fixture
`notes/03_planning-overview.html` doubles as a test asset.

## Success criteria

Every subtask at `review` with its verification item satisfied; production
build green; browser-verified embed + full-page route; guard throws on a
reserved base URL; skills parity (repo source == installed cache); validator
clean. Issue stays `in-progress` for human sign-off — closing is human-only.
