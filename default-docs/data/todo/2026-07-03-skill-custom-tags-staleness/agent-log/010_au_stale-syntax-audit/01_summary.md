---
title: "Summary — stale-syntax audit"
---

# Summary — stale-syntax audit

One-session audit (2026-07-03) into why agents mass-produced `:::callout` markup the
framework never parses, and whether the plugin skills carry more errors of the same
species. Verdict: the staleness is real but **contained to one section** — the
"Custom tags" block duplicated across both skills' writing references.

What the audit established (evidence in milestones #1–#2):

- **Root cause:** the skill references document a `:::` directive syntax that never
  existed; the real transformers use HTML-tag form (`<callout>` / `<tabs>` /
  `<collapsible>`) and aren't wired into any parser pipeline anyway. The framework
  fixed its own user-guide for this in April 2026 but the fix never reached the
  plugin skills.
- **Sweep findings:** all three tag snippets are stale in both files; `writing.md`'s
  "full list and syntax" pointer targets a user-guide page deleted in April. The
  diagrams (Mermaid/Graphviz) claims are accurate. Repo plugin source and installed
  cache `0.5.1` are byte-identical, so fixes must land in both.
- **Tracker placement:** no duplicate — framework wiring stays with
  `2026-04-20-custom-tags`; this issue owns the skill-prose side.

Where things stand: audit closed, no edits made yet. The actionable fix is
`subtasks/10_fix-skill-writing-references.md` (open); reinstating full guidance
after wiring is `subtasks/20_reinstate-syntax-docs-after-wireup.md` (blocked on
2026-04-20-custom-tags).
