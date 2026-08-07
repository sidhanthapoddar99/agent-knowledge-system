---
author: claude
date: 2026-08-06
---

draw.io joins as the fourth diagram format — embeds and first-class pages both, landed in one pass.

Two decisions carry real cost and are recorded in
[notes/05 the renderer decision](../notes/05_drawio-renderer.md): the renderer
is **vendored** (draw.io publishes no npm package — 3.0 MiB Apache-2.0 blob in
`astro-doc-code/src/vendor/drawio/`), and dark mode is **native to the viewer**
rather than the CSS invert filter the other three formats use.

Work is in [subtasks/10_embeds/35 draw.io embeds](../subtasks/10_embeds/35_drawio.md)
and [subtasks/20_first-class/35 draw.io pages](../subtasks/20_first-class/35_drawio.md),
both at `review`. Verified headlessly in both themes; screenshots handed over
for the visual judgement.
