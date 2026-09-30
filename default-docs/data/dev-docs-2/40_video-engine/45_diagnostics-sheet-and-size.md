---
title: "Diagnostics, the review sheet and size"
description: "What the player reports about layout and bad data, the ?sheet review page, the player's size budget and the gate that enforces it, and what loads on demand."
---

The player reports what only a browser can see: text that does not fit, items that leave their area, items that overlap. It also reports data it cannot play, and a voice that does not start. This page explains those reports, the review sheet that shows a whole video at once, and the size budget that keeps the player small. Read it before you add a diagnostic, change the sheet or add code to the player.

## Layout diagnostics

After laying out a slide, the player checks its end state: every item that will be shown, drawn in its final place.

| Code | Reported when |
|---|---|
| `layout.text-fit` | Text still does not fit its area at the style's smallest size. It is drawn at that size and overflows visibly. It is never clipped |
| `layout.overflow` | An item's box leaves its area, or the stage's safe area |
| `layout.overlap` | Two items' boxes overlap, other than an item placed on a frame's screen |

Each diagnostic names the slide by its number and its id, the item, and the item's line in its file. It does not name the file, because `VideoData` holds one `source` for the whole video. In a video folder, the slide id is the scene file's slug, and slugs are unique in a folder. So `agentks video info <video> --slide <id>` prints the scene file to open.

**The player never hides or fixes a problem.** It draws the slide as written and reports it. A player that shrank text past the style's floor, or moved an item out of the way, would ship a slide nobody checked.

**Where diagnostics go.** Every diagnostic is a `diagnostic` event, and the handle keeps the list in `diagnostics`. In the local app they show beside the Rust errors. The review sheet lists them. On a published page they go only to the event.

**Why Rust does not check layout.** Styles use the site's font stacks, so only the reader's browser knows which font is drawn.

## Player errors

The player also checks the data it is given. A `player.` code means the data broke the contract: an unknown name (`player.unknown-name`), a preset in the wrong role, a span off the grid, an SVG that does not parse, a part that does not exist. The video crate's checks exist to catch all of these first. So a `player.` error is a bug in the compiler, or in a hand-written fixture.

A slide that cannot be built draws an **error slate** instead: its code, its line and its message. The other slides play. A Rust content error attached to a slide draws the same slate. The player never skips a broken slide silently, and never shows one half-drawn.

| Voice code | Reported when |
|---|---|
| `voice.unavailable` | The browser has no voice for the video's language after 1.2 s |
| `voice.stalled` | The browser accepted speech but did not start it within 2.5 s |

Both switch the player to captions only, as an `error` event.

## The review sheet

The standalone page with `?sheet` draws every slide at its end state, and the middle of each morph, as a grid of thumbnails on one screen. The diagnostics are listed beside the grid, each with its slide's number and id, and outlined on the thumbnails.

| Query | Effect |
|---|---|
| `?sheet` | The whole video on one screen |
| `?sheet&slide=4` | Slide 4 at full size |
| `?theme=light`, `?theme=dark` | The theme mode |
| `?voice=none` | Play with captions only |

So one screenshot per theme shows a whole video. The authoring skill makes this a gate: an agent may not call a video done before it has looked at the sheet in light and dark and fixed every diagnostic. The sheet builds each slide alone, with no transition, from the same slide builder the player uses. It is its own chunk, loaded only with `?sheet`.

## The size budget

| Cap, gzipped | Covers |
|---|---|
| 22 KB | What every video loads: the standalone entry and everything it imports statically |
| 30 KB | The whole player, every chunk included |

For scale, a static docs page with two small islands ships about 8 KB, and the Excalidraw island about 410 KB. A three-minute video's compiled data is about 10 KB gzipped, because it inlines only the components it uses.

**The gate.** `scripts/size.ts` reads the production build in `dist/`. It follows the static imports of `standalone.js` to find what every video loads, sums the gzipped size of each chunk, and fails when either cap is crossed. `ctl test video` runs the unit tests and then this check, so a change that crosses a line fails the gate ([ctl and the gate](../55_contributing/10_ctl-and-the-gate.md)).

## What loads on demand

- **The review sheet** is its own chunk, loaded by a dynamic import only with `?sheet`.
- **Heavy kinds and effects.** A kind or an effect that not every video uses loads as its own chunk when keeping it in the shared bundle would cross the 22 KB line. The budget reserves this room for charts, trees and tables, and for morph and the camera.
- **The player itself** is the `video-player` island's chunk in the app and on a published site. A page with no video never downloads it ([performance and offline](../25_frontend/40_performance-and-offline.md)).

The rule is the cap, not a fixed list of chunks. A split that the cap does not need only adds a request.

## Related

- [The player](./40_the-player.md): how a slide is built and drawn.
- [Serving and publishing](./60_serving-and-publishing.md): the standalone page that hosts the sheet.
- [Tests](./65_tests.md): the browser checks that use the sheet.
