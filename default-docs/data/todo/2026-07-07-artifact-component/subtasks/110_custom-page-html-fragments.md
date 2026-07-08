---
title: "Custom pages — HTML fragment inserts (theme-native, no iframe)"
status: open
---

Side-note idea captured from sidhantha (2026-07-08): the artifact method
suggests an improvement to the **custom page** layout type
(`src/layouts/custom/*`, today driven purely by YAML data under
`data/pages/`). A custom page should optionally be able to carry an **HTML
fragment** instead of (or alongside) YAML: not a full artifact document — no
`<html>`/`<head>`/`<body>`, no chrome of its own — just a `<div>`-rooted
content fragment that gets **injected inline into the custom page's content
area**.

The key property that distinguishes this from artifacts: a fragment renders
**in the host page's DOM**, so the site theme applies natively — it consumes
`var(--color-*)` / semantic tokens directly with no iframe boundary, no
route-side injection, no `data-theme` handshake. Where an artifact is a
self-contained *document* (own world, iframe, `/artifacts` route), a fragment
is an *insert* (host's world by construction). That makes it the natural tool
for bespoke landing/marketing/custom sections that YAML's fixed component
schema can't express, while staying fully on-theme.

Open design questions (deliberate before implementing — likely a brainstorm
entry when picked up):

- File shape and discovery: a `.fragment.html` (or similar) referenced from
  the page's YAML? A new `type` in the custom-page schema? Naming must not
  collide with first-class artifact `.html` scanning.
- Script/trust stance: inline fragments execute in the host page — same
  first-party trust argument as artifacts, but no iframe isolation at all;
  state the rule explicitly.
- Sanitization/contract: what the fragment may contain (no `<head>`-type
  elements; styles scoped how? `:global` leakage rules); validation at load.
- Skill + docs: `agent-ks-artifacts` gains the fragment-vs-artifact decision
  guidance (insert → fragment, document → artifact); custom-page docs updated
  (user-guide `25_layouts/`, dev-docs).
- Relation to [[2026-04-10-new-layout-types]] — cross-cutting with custom
  layout work; center of gravity kept here because the authoring method and
  theme-integration reasoning come from the artifact feature.

## Tasks

- [ ] Brainstorm the design (file shape, discovery, trust, scoping) — new
      entry in this issue's `brainstorm/`, recommendation per thread.
- [ ] Implement: custom-page loader + layout accept an HTML fragment insert
      rendered inline in the content area, theme-native.
- [ ] Skill + docs: fragment-vs-artifact decision guidance in
      `agent-ks-artifacts` (repo + cache); user-guide + dev-docs pages.
- [ ] Verify: a demo custom page with a fragment renders on-theme in both
      modes with zero fragment-side theme code; YAML-only custom pages
      regress clean.
