---
title: "Stale custom-tags syntax in plugin skill writing references"
---

# Goal

Fix the custom-tags sections of both skills' writing references so they stop
documenting a `:::` directive syntax that has never existed in the framework, and
so they honestly describe the current rendering status of custom tags. The skill is
the operating manual agents follow in good faith — a stale syntax example there
gets mass-produced, not merely misread.

## Context / background

Discovered 2026-07-03 in a consumer-project session. The chain of events:

1. The `doc-issues` skill's writing reference
   (`references/10_writing/10_writing.md`, ~line 65) and the `documentation-guide`
   skill's `references/writing.md` (~line 40) both show custom tags in a directive
   form: `:::callout{type="info"}` … `:::` (same for `collapsible` and `tabs`).
2. Following the skill, 24 migration agents wrote **45 files** in a consumer
   project using that syntax.
3. The framework has **no `:::` directive parser anywhere** — a grep of
   `astro-doc-code/src/` for `:::` custom-tag handling returns nothing. The real
   transformers use the HTML-tag form and live in `astro-doc-code/src/custom-tags/`:
   `<callout type="warning" title="…">…</callout>`, `<tabs>`/`<tab>`,
   `<collapsible>` (tag names confirmed in `callout.ts`, `tabs.ts:105,172`,
   `collapsible.ts:36`).
4. Deeper: even the correct HTML-tag syntax doesn't render today. The
   `createCustomTagsRegistry()` in `src/custom-tags/index.ts` is **not wired into
   any parser pipeline** — established when the user-guide custom-tags page was
   deleted for exactly this reason
   ([docs-phase-2 comment 004](../2026-04-19-docs-phase-2/comments/004_custom-tags-removed.md)).
5. The skill references were evidently written against the intended/planned design
   and never updated when the custom-tags work was parked — the same staleness the
   framework caught and fixed in its own user-guide in April was never propagated
   to the plugin skills.

Full audit trail (root cause + sweep for sibling staleness):
`agent-log/010_au_stale-syntax-audit/`.

**Related — distinct scope:**

- [2026-04-20-custom-tags](../2026-04-20-custom-tags/issue.md) owns the *framework*
  side: wiring the transformers into the pipeline, showcase, author-defined tags.
  This issue owns the *skill/plugin prose* side only.
- [2026-06-22-updating-skills-and-documentation](../2026-06-22-updating-skills-and-documentation/issue.md)
  (closed) was the general skill-maintenance batch; this staleness postdates it.

## Done when…

- Neither skill reference shows `:::` directive syntax for custom tags.
- The snippets show the real `<callout>` / `<tabs>` / `<collapsible>` tag form
  **with an explicit caveat** that the transformers are not yet wired into the
  parser pipeline (rendering currently depends on consumer CSS workarounds), OR the
  section is removed until wiring lands — mirroring the framework's own user-guide
  decision.
- The `writing.md` pointer sending readers to `user-guide/15_writing-content/` for
  "the full list and syntax" of custom tags is corrected (that page was removed
  2026-04-20; content preserved at
  [2026-04-20-custom-tags/notes/01_original-user-doc.md](../2026-04-20-custom-tags/notes/01_original-user-doc.md)).
- Edits land in **both** the repo-local plugin source (`plugins/documentation-guide/`)
  and the installed cache (currently `0.5.1`) — they are identical today and must
  stay in sync.

## Scope decisions

- **In:** the two writing references, their user-guide pointers, repo + cache parity.
- **Out:** wiring the transformers (2026-04-20-custom-tags), restoring the
  user-guide page (same issue), and any consumer-project cleanup of the 45 files.
- Mermaid/Graphviz claims in the same references were audited and are **accurate**
  (wired client-side via `src/scripts/diagrams.ts` from `BaseLayout.astro`) — no
  change there.
