---
title: "Theme CSS delivery — stop inlining 65 KB into every page"
status: done
---

# Overview

The browser half of the load-time problem. The merged theme CSS is inlined into `<head>`
on every page: **64,938 bytes per page across 988 pages — 46.2% of the entire built site
(64,085,632 of 138,481,123 bytes).** Every page ships the same block again, and no browser
cache can help because it is not a file.

Split it. Inline only the token layer so the zero-flash guarantee survives, and link the
bulk as one cacheable file.

# References

- [the parent issue](../../issue.md) — this is the browser half of the same load-time subject as the index-loader subtask
- [the theming and CSS surface audit](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/013_surface_theming-and-css.md) — where the 46.2% and the byte counts come from, plus how `theme.ts` merges and injects
- [the theme parity analysis](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/023_question_theme-css-parity.md) — the recommended split and the gzip figures

# Todo list

- [ ] Measure the current per-page byte count and the site total, to have a before number
- [ ] Split the merged CSS into a token layer and a bulk layer
- [ ] Inline the token layer only — it must carry `:root` and `[data-theme=dark]`
- [ ] Serve the bulk as one file with an ETag and a content-hashed URL
- [ ] Confirm no flash of unstyled content on a cold cache, in both light and dark
- [ ] Re-measure and record

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off: what landed (with evidence
> — commits, measurements, links to the agent-log), what was deferred, and the
> concrete next steps. A subtask reaching `review` with this marker still in
> place is flagged by the template lint.

# Details

## Why it is inlined today, and why that must partly survive

The inline block sits at character 1,060 of the document, while the Vite bundle `<link>`
sits at character 66,444. Inlining is deliberate: there is no stylesheet round-trip, so
there is no unstyled flash even on a cold cache, and the dark-mode boot script runs after
the styles are already present.

**Do not simply switch to a linked file.** The architecture notes describe "serve raw CSS
files" as identical behaviour; it is not — it reintroduces a round-trip before first paint.

## The split

| Layer | Contents | Gzipped | Delivery |
|---|---|---|---|
| Tokens | `color`, `font`, `element`, `breakpoints` — carrying `:root` and `[data-theme=dark]` | **3,421 bytes** | Stay inline |
| Bulk | everything else | **9,466 bytes** | One linked file, ETagged, content-hashed |

That moves roughly three quarters of the payload out of every page and into a file the
browser caches once.

## Done when

- [ ] Per-page inline CSS is under 5 KB gzipped, measured on a built page
- [ ] The bulk stylesheet is served once with an ETag and returns 304 on repeat
- [ ] No flash of unstyled content on a hard-reloaded cold cache, light and dark
- [ ] Total built-site bytes drop measurably — record before and after
- [ ] Dark mode still switches with no re-render

## Watch for

`--color-text-tertiary` is used in `markdown.css` and declared by nothing. Splitting the
CSS will not fix that, and it may make it more visible. It has its own subtask under
[correctness](../030_correctness/040_undeclared-css-variables.md).
