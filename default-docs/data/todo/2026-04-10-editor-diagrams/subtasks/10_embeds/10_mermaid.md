---
title: "Mermaid embeds — verify + bless the reference pattern"
status: done
---

Mermaid embeds already render site-wide: ` ```mermaid ` fences become
`.diagram-mermaid` divs (`src/parsers/renderers/marked.ts:75`) and
`src/scripts/diagrams.ts` (loaded by `BaseLayout.astro:139`) lazy-loads
mermaid.js on pages that need it. This subtask hardened and blessed that
pipeline rather than building it.

**Closed (sidhantha, 2026-07-03):** capability confirmed working — verified by
build with live demo artifact `notes/02_embed-verification.md` (inline fence +
by-reference forms both emit populated `.diagram-mermaid` divs; docs pages in
`dev-docs/15_scripts/10_diagrams.md` exercise the client render in production).

## Tasks

- [x] **Verify end-to-end** — inline fence and reference form verified via
      `notes/02_embed-verification.md` (issues content type) and existing
      dev-docs pages (docs content type); blog shares the identical
      marked-renderer + BaseLayout pipeline.
- [x] **Bless the canonical reference syntax** — fence + a file-relative
      path: `[[./path.mmd]]` or `[[../assets/path.mmd]]`. Bare names are
      deliberately skipped in fences so documentation examples don't expand
      (`asset-embed.ts`); `../` support added 2026-07-03 per sidhantha. Full
      rules recorded in `notes/02_embed-verification.md`.
- [x] **Error presentation** — folded into
      `subtasks/10_embeds/30_excalidraw.md` as a shared `.diagram-error`
      styling task for all three formats.
