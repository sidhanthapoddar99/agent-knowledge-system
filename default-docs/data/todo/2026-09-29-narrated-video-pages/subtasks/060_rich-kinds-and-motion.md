---
title: T5 Rich kinds and motion — charts, stats, trees, tables, annotations, send, focus and morph
status: review
---

The player spike covers the plain kinds and presets. Explainers also need charts, counting stats, file trees, tables, drawn annotations, packets along arrows, a camera focus and morphing between slides. This track adds them to the player, all seekable.

# 01 To Do
- [x] **Chart marks** in `kinds/chart`: bar, column, line, area, donut, funnel, drawn from a chart template's `data`, with `chart.2` addressing a mark and the `grow` entrance.
- [x] **Counting stats** in `kinds/stat`: a registered integer CSS property shown with `counter()`, decimals as a scaled integer, no script per frame.
- [x] **Trees** in `kinds/tree`: a file tree built from paths, `tree.data/docs` addressing a folder or file.
- [x] **Tables** in `kinds/table`: up to 8 rows, rows staggered, `table.2` addressing a row.
- [x] **Annotations:** an emphasis preset's `overlay` draws a library annotation around its target with a line draw.
- [x] **`send`:** a packet dot along an arrow's path with `offset-path` and `offset-distance`.
- [x] **`focus` and `unfocus`:** scale and translate on the slide layer, other items dimmed; text stays sharp after the scale.
- [x] **`morph`:** opt-in per slide; same-id items glide by measure, invert and play, built once and seekable.
- [x] **Reduced motion** for each new effect: fades instead of motion, no camera zoom.
- [x] **Diagnostics** for the new kinds: text-fit, overflow and overlap cover them.
- [x] **Review fix:** `pick()` in `resolve.ts` looks names up with `Object.hasOwn`, with a test.

## Guardrails
- Write only in `apps/packages/agentks-video/`.
- WAAPI only. No animation library, no `requestAnimationFrame` loop for motion.
- Seeking to any time must show the same frame as playing to it.
- The whole player stays under 30 KB gzipped, and under 22 KB for what every video loads. New kinds load only when a video uses them if the budget needs it.
- Tests for this track run in under 10 seconds.

## Done when
- Each new kind and verb plays in the dev harness from fixture `VideoData`, in Chrome, Firefox and Safari.
- Seek determinism holds for slides using them, compared by screenshot.
- The size report stays inside the budget.
- sidhantha judges the motion good enough.

# 02 Status and Result
Review: every to-do is built and checked in Chromium and Firefox. Safari is untested, because WebKit cannot launch on this machine without system libraries. sidhantha has not yet judged the motion.

## Result
- **The code:** `apps/packages/agentks-video/` in the worktree `.agentks-worktrees/video-t5`, branch `wave3/video-t5`, not yet committed. New: `src/draw/kinds/stat.ts`, `src/draw/kinds/data/` (tree, table, and chart with its bar and plot marks), `src/motion/extras/` (camera, morph, annotations) and `src/draw/extras.ts`, which loads the last two folders on demand. `README.md` has the new contracts (chart templates, tables, the `$grow` token, annotations, `morph`) and a section on the rich kinds and motion.
- **The dev page:** `cd apps/packages/agentks-video && bun run dev`, then http://localhost:5199/?video=rich: one slide per chart mark, stats, a tree, a table, annotations, `send`, `focus` and a `morph`. Add `&motion=reduced` or `&sheet`; `?video=crowded&sheet` shows the diagnostics.
- **Seek equals play:** 29 moments, each in the middle of a new kind's or verb's motion. In Chromium the played and the seeked frames match at 0.000% of pixels at all 29. In Firefox they differ by at most 0.30%, except the camera focus on a tree folder at 0.87% (1.9% on an earlier run). The differences are text edges, largest away from the zoom centre, because Firefox settles a pause a few milliseconds from the time it reports, as T1 found. Running animations were 0 ms apart in both browsers. The 3-minute example still matches: Chromium 0.000% at all ten times, Firefox at most 0.35%.
- **Reduced motion:** with `?motion=reduced` the camera stays still during a focus (its transform stays `none`), `send` makes the track glow, counts, columns and table rows fade in place, a pulse glows and the morph is a fade.
- **Diagnostics:** the rich video's review sheet shows no diagnostics in light and dark. The crowded video reports text-fit, overflow and overlap for a table, a chart and a tree.
- **Size:** 20.12 KB gzipped for what every video loads and 29.01 KB for the whole player, against caps of 22 KB and 30 KB. On demand: the data kinds 4.97 KB, the motion extras 2.98 KB, the review sheet 0.86 KB.
- **Tests and gate:** 61 unit tests in about 20 ms; `ctl test video` (tests, build, size) and `ctl gate -q` green.
- **The review fix:** `pick()` looks up both library and built-in names with `Object.hasOwn`. A test checks that `constructor`, `toString`, `__proto__`, `hasOwnProperty` and `ks:constructor` are unknown names.
- **Evidence** is in `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system/data/player-spike/t5/`: `report.md`, `seek/` (each played and seeked pair), `reduced/`, the review sheets of the rich video (light and dark) and the crowded one, and `tour-regression/seek-vs-play/` for the 3-minute example.

## Agent log
none

# 03 References
- [Scenes, motion and the timeline](../brainstorm/01_video-artifact-engine/04_scenes-and-timeline.md) — item kinds, verbs, presets, transitions, morph, seeking.
- [The player](../brainstorm/01_video-artifact-engine/06_player.md) — how a moment is drawn, diagnostics, size budget, reduced motion.
- [Library components](../brainstorm/01_video-artifact-engine/08_library-components.md) — chart templates and annotations.
- [010 T1 Player spike](./010_player-spike.md) — the player this track extends.

# 04 Decisions
## 01 Contract
- Decided (claude, 2026-10-01): a chart template's `mark` sets its direction (`bar` is horizontal, `column` vertical) and `ChartDef` has no `orient`, because two fields that must agree are one field too many.
- Decided (claude, 2026-10-01): a chart `show` with no preset takes the template's `show.preset` and `show.stagger`, a rule for the compiler, because the template is where a chart's entrance lives: bars grow, a donut draws.
- Decided (claude, 2026-10-01): a table arrives as `head` and `rows` of strings, each cell as the author wrote it, and the player allows a header and 1 to 7 rows (`player.table-shape` otherwise), because the player must not reformat a number such as `7.80`, and the schema allows 8 rows with the header first.
- Decided (claude, 2026-10-01): presets get a fourth token, `$grow`, the `clip-path` inset a part grows from; a kind sets it with `data-grow` on the part (none: rightwards; empty: the part cannot grow, which is an error), because columns rise and funnel stages open from the middle while `grow` stays one JSON preset.
- Decided (claude, 2026-10-01): the built-in pack has a `morph` transition with empty keyframe lists and `reduced: fade`, because the player builds morph's motion from the two slides while its duration and easing still come from data.
## 02 Loading and size
- Decided (claude, 2026-10-01): tree, table and chart load as one on-demand chunk, and camera, morph and annotations as another, both before the first layout (`src/draw/extras.ts`), because building a slide then stays synchronous, and two chunks cost 1.3 KB less in total than one per extra.
- Decided (claude, 2026-10-01): the build puts everything else under `src/` into one player chunk, with a code-splitting group in `vite.config.ts`, and the on-demand motion code moved into `src/motion/extras/`, because the bundler had split `view.ts` into its own chunk, which cost every video about 1 KB and a request, and the config should name folders rather than files.
## 03 Kinds
- Decided (claude, 2026-10-01): a line, an area and a donut run an entrance or exit over several parts as one continuous motion, each part taking its share (a line slice by its width, a donut segment by its value), because a staggered draw of many slices looked busy.
- Decided (claude, 2026-10-01): line and area slices are opaque, overlap by a pixel, and earlier slices sit above later ones, because otherwise seams show between slices and a line covers the dot at a joint.
- Decided (claude, 2026-10-01): donut segments are shades of the item's tone, `grow` on a donut is an error, and a donut part is marked on its legend row, because a ring has no edge to grow from and a bar behind the whole chart would cover the other segments.
- Decided (claude, 2026-10-01): a folder part addresses the folder's row and every row under it, because showing a folder means showing what it holds.
- Decided (claude, 2026-10-01): a table's whole entrance or exit always runs row by row, header first; its rows are CSS subgrid rows; a column of numbers aligns right; its default size is `l`, because the design asks for rows staggered, a row must be a box an animation can move while the columns line up, and at `m` a table read as small.
- Decided (claude, 2026-10-01): a stat's digits get a fixed width after layout, and a negative value counts its size behind a minus sign, because a counting number must not shift sideways, and a CSS counter cannot count through zero with a sign.
## 04 Motion
- Decided (claude, 2026-10-01): each annotation stroke's `pathLength` is its unstretched length over its drawn length, because non-scaling strokes lay dashes along the on-screen line, so with a plain `pathLength="1"` a dash of 1 did not match the whole line and the draw did not finish at its end.
- Decided (claude, 2026-10-01): an annotation exists only while its emphasis runs, because an emphasis leaves no trace.
- Decided (claude, 2026-10-01): morph glides with one uniform scale; it crossfades an item whose look changed or whose proportions change by more than 8%; arrows fade; an item the new slide shows by an action enters by that action; the new slide is see-through while the morph runs, because a stretched item squashes its text and arrows are routed, not placed.
- Decided (claude, 2026-10-01): a morph starts where the viewer saw the old slide, after its moves and its camera, so the camera reports where it ends, because a morph from a focused slide would otherwise jump first.
- Decided (claude, 2026-10-01): moves add up, each from where the one before left the item, because T1's second move of an item started from its home.
- Decided (claude, 2026-10-01): the player checks a morph too (`player.morph-unmatched` for the first slide or a slide that shares no id with the one before, ids starting with `_` not counting), because a morph with nothing to glide must not play as a plain fade.
- Decided (claude, 2026-10-01): under reduced motion, `send` makes the arrow's track glow in place, and line draws (arrows, annotations) stay unless their preset names a fallback, because a packet moves and a line draw does not.
- Decided (claude, 2026-10-01): the built-in `rise` and `drop` fall back to `fade` and `pulse` to `glow`, and a unit test checks that no built-in entrance, emphasis or exit moves or scales under reduced motion (the `mark` sweep excepted), because tables and trees enter with `rise`, so their rows still moved for a reader who asked for no motion.
- Decided (claude, 2026-10-01): the standalone page takes `?motion=reduced`, because reduced motion must be checkable without changing the system setting.
## 05 Names
- Decided (claude, 2026-10-01): `pick()` and the new `roleOf()` look names up by own keys only, and the separate verb-to-role tables in `anim.ts` and the fixture script are gone, because `constructor` or `toString` must not resolve to an inherited property, and one table cannot drift.
- Decided (claude, 2026-10-01): classes that clashed were renamed: a bar's lane is `vx-lane` (the scrubber owns `vx-track`) and shapes are `vx-s-<shape>` (a box shape had the stage's `vx-box`), and SVG elements come from one helper in `view.ts`, because a shared class name styled the wrong thing.

# 05 Notes & Analysis
## Watch out
- Morph is opt-in per slide, so an id reused by accident never moves anything.
