---
title: "GFM alerts — native callout support (> [!NOTE])"
status: open
---

Decision settled 2026-07-03 (sidhantha): callouts use GitHub-flavored alert
blockquotes — `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`,
`> [!CAUTION]` — the ecosystem-standard native-markdown form that degrades
gracefully as a plain blockquote anywhere it isn't styled. This replaces the retired
`<callout>` transformer as the platform's callout story and must ship **before**
subtasks 30/40 document it (never document what doesn't render).

- [ ] Add renderer support in the marked pipeline
      (`astro-doc-code/src/parsers/renderers/marked.ts`) — evaluate the
      `marked-alert` extension first; hand-roll a small extension only if it
      doesn't fit the pipeline.
- [ ] Theme CSS for the five alert types in the built-in default theme
      (`src/styles/`), consuming only declared theme variables — status colors
      (`--color-info` / `--color-warning` / `--color-error` / `--color-success`)
      map naturally onto the alert types; verify dark/light both work.
- [ ] Confirm alerts render in all three content types (docs, blog, issues) and in
      the editor preview.
- [ ] Build + visual check on a test page before 30/40 start describing the syntax.
