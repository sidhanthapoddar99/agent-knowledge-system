---
title: "Summary — display-first diagram implementation loop"
agent: claude
date: 2026-07-03
---

## What shipped (4 milestones, one session, 2026-07-03)

The full display-first scope of this issue: **diagrams render everywhere as
embeds, and diagram files render as first-class pages** — for Mermaid,
Graphviz, and Excalidraw. Editor-side editing (`30_editor/`) deliberately
untouched.

1. **Excalidraw embeds** (`101`): `![Name](./assets/x.excalidraw)` →
   fetched + rendered read-only via `exportToSvg` (lazy chunk); plain link
   stays a link (with a new generic `<a href>` colocated-file rewrite);
   caption + open-file link; lightbox zoom; dark-mode invert with readable
   caption. Mermaid/graphviz embeds verified as already working
   (`notes/02_embed-verification.md` is the living demo).
2. **Embeds skills + docs** (`102`): user-guide "Two embed mechanisms"
   section; both skill writing references updated + cache-mirrored.
3. **First-class pages foundation** (`103`): `src/loaders/diagram-pages.ts`
   — prefixed `.mmd/.mermaid/.dot/.gv/.excalidraw` files become ordinary
   `LoadedContent` (sidebar/routing free); `assets/` excluded; optional
   `XX_name.meta.json` sidecar with filename-fallback titles; slug-collision
   error pages; `allow_diagram_pages` opt-out; permanent live demos in
   `dev-docs/15_scripts/`.
4. **Formats + first-class skills/docs** (`104`): graphviz page verified;
   new user-guide page `06_diagram-pages.md` + four touchpoints;
   `docs-layout.md` skill section; cache in sync.

## Verification

Every milestone verified on the real built site (static build + headless
chromium): rendered SVGs, sidebar titles, collision error, opt-out flag both
ways, lightbox, dark mode. Key artifacts:
`notes/02_embed-verification.md`, `dev-docs/15_scripts/11_*/12_*` demos.

## State at close

- `10_embeds/`: 10+20 **done** (human-closed), 30+40+50 **review**.
- `20_first-class/`: all five **review**.
- `30_editor/`: open, deferred by scope decision.
- Issue: `in-progress` (editor group outstanding); review badges signal the
  8 subtasks awaiting human sign-off.
- Gotchas recorded in `agent-memory/pipeline-facts.md` (clsx hoisting,
  stale `@excalidraw/utils`, font-subset worker noise).

## Not committed

All work is in the working tree — nothing committed or pushed (per
operating rules; commit when the human signs off).
