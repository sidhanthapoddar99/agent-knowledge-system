---
title: "Markdown-embedded HTML fragments from assets/ (theme-native, no background)"
status: open
---

Side-note idea captured from sidhantha (2026-07-08): HTML files placed in a
docs folder's `assets/` should be embeddable **inside markdown pages** via the
existing embed syntaxes — the `[[./assets/…]]` wiki-embed and/or the
`![](./assets/…)`-style reference — the way diagram files already embed. The
embedded fragment renders **theme-native**: it consumes the default theme CSS
variables directly and carries **no background of its own** (transparent, so
it sits on the page like any other markdown block, not like a framed
artifact). Detailed rules deliberately deferred ("we can define the rules
later") — this subtask captures the intent and the design questions.

This completes a three-tier spectrum the feature family now spans:

| Tier | Unit | Theme | Isolation |
|---|---|---|---|
| First-class artifact (`NN_.html`) | whole document | `site`/`self` via route injection | iframe |
| Custom-page fragment ([110](110_custom-page-html-fragments.md)) | page insert | native (host DOM) | none |
| **Markdown embed (this)** | in-page block | native (host DOM), no background | none |

Notably consistent with the existing rule: `assets/` is excluded from the
first-class page scan precisely because it's the *embed-only* bucket — this
gives those files their embed path.

## Open design questions (brainstorm before implementing)

- Syntax: `[[./assets/x.html]]` inside a fence vs bare, and/or the `()[]`
  reference form — mirror whichever the diagram embeds standardized.
- Inline injection vs iframe: intent says inline (theme-native, transparent),
  which means fragment rules apply (no `<head>`/`<body>`, div-rooted content,
  scripts execute in the host page — same trust statement as subtask 110).
- Interaction with the artifact renderer: these must NOT go through the
  `.artifact` container (no border, no background, no affordance bar) —
  they're content blocks, not framed embeds.
- Sanitization/scoping: how fragment CSS is prevented from leaking into the
  page (and vice versa) without an iframe boundary.
- Skills + docs: embed guidance in `agent-ks-docs` (images/docs-layout
  references) + fragment-vs-artifact decision row in `agent-ks-artifacts`;
  user-guide + dev-docs.

## Tasks

- [ ] Brainstorm entry: syntax choice, injection mechanics, trust/scoping
      rules (with [110](110_custom-page-html-fragments.md) — same fragment
      contract, decide together).
- [ ] Implement the embed path (preprocessor/renderer stage + assets serving),
      theme-native, backgroundless.
- [ ] Skills + docs updates (repo + cache parity).
- [ ] Verify: a demo page embedding an assets/ HTML fragment renders on-theme
      in both modes, no background box, no artifact chrome; diagram embeds
      regress clean.
