---
title: T4b Video component set — the default library ships the day-one components
status: review
---

Videos look good only if the library already holds good frames, presets, layouts, slide templates and charts, so the video file composes them instead of building them. This track fills the default library with the day-one set against the contracts the player spike fixes.

# 01 To Do
- [ ] **The day-one set** in the library repository's `components/<category>/`, with counts as targets:
    - [x] `styles` (3): `clean`, `bold-style`, `blueprint`.
    - [x] `layouts` (8) and `slides` (12 templates with slots and a default choreography).
    - [x] `animations` (32): entrances, emphasis, exits and annotation presets, springs as CSS `linear()` curves.
    - [x] `transitions` (10).
    - [ ] `backgrounds` (10). Another workflow owns it.
    - [ ] `frames` (12): six devices and windows, six containers, each an SVG with one screen slot. Another workflow owns it.
    - [ ] `annotations` (8). Another workflow owns it.
    - [ ] `charts` (8 templates over the player's marks). Waits for the player's chart marks.
    - [ ] `illustrations` (12), drawn for the library or adapted from CC0 sources, each licence in `LICENSES/`. Another workflow owns it.
- [ ] **Frames as the one source.** Redraw the six HTML frames' chrome once as SVG in `components/frames/<name>-frame.svg`; the HTML versions become widgets `components/widgets/<name>-view.html`, whose chrome the `--sync-shared` step copies from the SVG.
- [ ] **Manifest entries** for every component: `category`, `file`, a description an agent can choose by, and tags.
- [x] **A preview page** in `preview/` that plays every preset, transition and template on sample items with the player's build.
- [ ] **`AGENTS.md` and `README.md`** in the library describe `components/<category>/`, the `category` field and the per-category contracts.

## Guardrails
- Write only in the library repository's `components/`, `preview/`, `LICENSES/`, `AGENTS.md` and `README.md`. T4a owns the structure and the Lucide import.
- Build against the contracts T1 fixes. Do not invent a component shape the player cannot read.
- Every SVG must pass the allowlist: no `<style>`, no animation elements, no links, no outside references.
- Presets use only `opacity`, `transform`, `filter`, `clip-path`, `stroke-dashoffset`, `offset-distance`, theme colour roles and the counter property.
- No colour hex codes: colours come through the style's roles.
- Each component stays under its category's size cap.

## Done when
- Every day-one component exists, has a manifest entry with `category`, and passes the library's check.
- The preview page plays every preset, transition and slide template with the player build.
- Each frame SVG and its `-view` widget come from one source, and the sync step leaves no drift.
- sidhantha judges the preview good enough.

# 02 Status and Result
Styles, layouts, slide templates, animations and transitions are built, and one preview page plays them all. All three batches are merged into the library's `main` (`f858a86`) and pushed; the library's CI is green. Backgrounds, frames, annotations and illustrations belong to another workflow. Charts wait for the player's chart marks.

## Result
- **65 components, in three batches**, each merged into the library's `main`:
    - `lib-video-styles`: 3 styles (`clean`, `bold-style`, `blueprint`), 8 layouts (`hero-left`, `hero-right`, `z-pattern`, `big-number`, `timeline-5`, `compare-3`, `focus-side`, `steps-4`) and 10 transitions (`dissolve`, `slide-up`, `push-up`, `iris`, `blinds-wipe`, `split-wipe`, `zoom-through`, `flip`, `cover`, `reveal`).
    - `lib-video-animations`: 32 presets. There are 12 entrances, 6 emphasis moves, 6 exits and 8 annotation presets.
    - `lib-video-slides`: 12 slide templates, each with slots and a default choreography. Every name ends in `-slide`.
- **Every component has a manifest entry.** On the library's `main` after the merges, `python3 scripts/check.py` passes with 2,106 elements: 2,041 before plus 65. The library's 37 unit tests pass, and `preview/video/fixtures/build.py --check` passes.
- **The preview page is `preview/video/index.html`**. It plays six reels with the player's production build, which `scripts/preview_player.py` copies in from the agentks checkout: slide templates, templates at their limits, animations, transitions, layouts, and a style tour. Pickers at the top choose the style (`clean`, `bold-style`, `blueprint` or the built-in `plain`), light or dark, the voice, and play or the review sheet. Under the video, a list names each slide's library components; clicking one jumps there. A coverage line checks that every style, layout, transition, animation and slide template in `manifest.json` appears in some reel. It reports that all 65 do.
- **Browser check.** Chromium opened the merged copy for all 48 combinations: 6 reels, 4 styles, 2 themes. The script seeked through every slide. No page errors and no console errors appeared, and a missing component file stops the page with an error that names the file. Firefox loaded the page too. The screenshots are in the agentks checkout, under `data/player-spike/components/` (git-ignored).
- **Checked again with the T5 player** (agentks `main` at `96b747b`), after the merge: headless Chromium loaded all 96 views (6 reels, 4 styles, 2 themes, play and review sheet) with no page error, no console error, no error box and no player report. This check only loaded each view; it did not step through the slides, so the two gaps below are not re-checked.
- **What did not play:**
    - The 8 annotation presets. The player at 8ac9115 drew their slide as a `player.unsupported` error slate. T5 adds annotation overlays, so this may now play; it has not been re-checked slide by slide.
    - One layout warning. In the templates-at-their-limits reel, slide 7 holds `code-explain-slide` with its 12-line maximum. The code does not fit at the `clean` style's 30 px or the `bold-style` style's 32 px, so the player reports `layout.text-fit`. It fits in `blueprint` and `plain`.

## Agent log
none

# 03 References
- [Library components](../brainstorm/01_video-artifact-engine/08_library-components.md) — the categories, names, the manifest, each category's contract, the day-one set, today's content.
- [Scenes, motion and the timeline](../brainstorm/01_video-artifact-engine/04_scenes-and-timeline.md) — presets and transitions.
- [The layout system](../brainstorm/01_video-artifact-engine/05_layout-system.md) — layouts, areas and slots.
- [010 T1 Player spike](./010_player-spike.md) — fixes the component contracts.
- [030 T4a Library restructure](./030_library-restructure.md) — the structure this track fills.
- [120/80 The video component set](../../2026-09-29-rust-core-engine-migration/subtasks/120_libraries/80_elements-video-cue-kit.md) and [120/75 Frames and widgets](../../2026-09-29-rust-core-engine-migration/subtasks/120_libraries/75_elements-frames-and-widgets.md) — the migration's side of the same library.

# 04 Decisions
## 01 Styles name theme variables, not literal colours
- Decided (claude, 2026-10-01): each style maps its colour roles to theme contract variables. A style never gives literal light and dark colours, because the player's `applyStyle` wraps every role value in `var()`. A literal colour would break the page with no error, and the guardrail forbids a shape the player cannot read. Each style gets its identity from the variables it picks, its fonts, type sizes, spacing, motion and defaults.

## 02 Names that clash with Lucide icons take a suffix
- Decided (claude, 2026-10-01): `bold` became `bold-style`. `blinds` became `blinds-wipe` and `split` became `split-wipe`. The presets `letters`, `stamp` and `underline` became `letter-by-letter`, `stamp-in` and `underline-sweep`. The reason is that names must be unique across the library, and each of these is a Lucide icon name. The annotations batch set the pattern (`tick-mark`, `star-mark`). For the same reason, `words` became `word-by-word` to pair with `letter-by-letter`, and `tick` became `tick-it` to match the other `-it` presets. Slide templates all end in `-slide`, so a template never clashes with an icon or a layout.

## 03 The style set
- Decided (claude, 2026-10-01): `blueprint` sets all text in the mono font, because the player has only a text font and a code font. So mono headings over a proportional body cannot be expressed.
- Decided (claude, 2026-10-01): `bold-style` uses `--color-brand-secondary` as its accent, because that is the higher-contrast brand shade in both light and dark mode in the agentks themes.
- Decided (claude, 2026-10-01): style defaults name only built-ins and components that exist (`self:soft-grid`, `self:soft-gradient`, `self:blueprint-grid`, `self:dissolve`, `self:cover`, `self:reveal`). No style sets a `show` default, because nobody has said whether it would override each item kind's default entrance.

## 04 Layout shapes
- Decided (claude, 2026-10-01): `hero-left` and `hero-right` use 5 columns of text and 7 of visual, so they differ from the built-in `split`. `steps-4` is a rising staircase, because the built-in `full` and `thirds` already cover a flat row. `compare-3` has a fixed name row, so the three names line up. `timeline-5` points span rows 2 to 4, because a shorter area turns into a row once a slide head takes its band. Each manifest description names every area, so an agent can place items.

## 05 Transitions differ from the built-ins and settle exactly
- Decided (claude, 2026-10-01): the ten transitions do things the built-in fade, slide and push do not, and each falls back to `fade` for reduced motion. Each `in` ends on its resting value, because the player keeps a transition's `in` values for the life of the slide. `flip` ends on `transform: none` for this reason. Every settled frame is pixel-identical to the same slide after a cut.
- Decided (claude, 2026-10-01): `reveal` clips the new slide so that its edge tracks the old slide's edge. The reason is that the player always draws the new slide on top.

## 06 The animation set
- Decided (claude, 2026-10-01): three presets from the design were dropped. `slide-up` duplicates the built-in `rise` and clashes with the `slide-up` transition. `spotlight` is what the `focus` verb does. `slide-out-down`, `fade-down` and `scale-out` duplicate the built-in `sink` and `shrink`. In their place the set gained `iris-in`, `bounce`, `sink-blur`, `slide-out-right` and `pop-out`, so each exit mirrors an entrance.
- Decided (claude, 2026-10-01): exits carry their own accelerating easing and last 0.5 s, because the style's ease-out drops most of an item within about 70 ms on an exit. Plain entrances leave duration and easing out, so they follow the style.
- Decided (claude, 2026-10-01): `reveal-up` and `iris-in` end on `clipPath: none`, because a clip left in place would cut off a later glow or highlight bar.
- Decided (claude, 2026-10-01): `color-shift` changes an icon's stroke only. The reason is that an emphasis on the item adds colours channel by channel, so a text colour shift saturates to white in dark mode.
- Decided (claude, 2026-10-01): annotation presets draw, hold and fade in one `linear()` easing over three keyframes. They animate only `strokeDashoffset`, opacity and `color`, so they work whether the player animates the SVG root or each path. `cross-out` uses `big-cross` rather than `strike-through`, because an X reads right on cards, icons and text alike.

## 07 Slide templates
- Decided (claude, 2026-10-01): a content template has no title slot, and the slide's `head` is its heading. The reason is that its heading then looks the same as on every other slide. The title, section, quote and closing templates carry their own title and are used without a head.
- Decided (claude, 2026-10-01): templates set no `bg` and use only built-in presets and layouts, placing items by grid spans. The reason is that a templated slide should match the slides around it.
- Decided (claude, 2026-10-01): the steps and diagram templates join their parts with one arrow chain, so a slide stays within six items.

## 08 The preview page
- Decided (claude, 2026-10-01): one page, `preview/video/index.html`, plays the fixtures the three batches wrote. It does not assemble its own. The reason is that a second copy of the same sample slides would drift. The page keeps each fixture's slides and times. It then loads every component the fixture names fresh from `components/`, found through `manifest.json`. So an edited component shows on reload, and a stale inlined copy cannot hide a change.
- Decided (claude, 2026-10-01): the style picker swaps the style, and does only two of the compiler's default fills. A slide with no background gets the style's `bg`, and each slide head gets the style's `head` entrance. The reason is that background and heads carry most of a style's look, and the page must not become a second compiler. The style tour reel is chosen by style, because each tour fixture was made for one style.
- Decided (claude, 2026-10-01): the page opens with captions only, and the browser voice is one pick away. The reason is that narration gets in the way when you are judging motion.
- Decided (claude, 2026-10-01): the player's build is not kept in the library. git ignores `preview/video/player/`, and `scripts/preview_player.py` copies a fresh build in from the agentks checkout, or fails when there is none. The reason is that a copy kept in git falls behind the player without anyone noticing; the batches' copy was already older than T5.
- Decided (claude, 2026-10-01): `index.html` is the only preview page. The batches' own pages (`play.html`, `slides.html`, `fixtures/animations.html`) are removed, because each played a subset of the same reels and carried its own copy of the theme variables. `theme.css` is the one theme stand-in.

# 05 Notes & Analysis
## Issues hit
- The library batches copied whole `components/` trees from an older base. Copying one over main replaced main's newer frames and broke the widget sync check. A merge must take only each batch's changed files, as git's merge does.
- `manifest.json` conflicts right after the `kv-table` entry when the styles batch merges, because both sides appended there. Keep both sides. The animations batch put its block elsewhere and merges cleanly.

## Watch out
- **Contract gaps for T1 (the player).** A style cannot own a palette, because role values are only variable names. `space.radius` is required but nothing reads it. There are only two font roles. Nobody has said whether the compiler rewrites `self:` to the video's alias inside a style's `defaults` or a preset's `overlay`. A transition's `in` fills for the whole slide. An elbow arrow into a labelled icon ends inside the label. The overlay behaviour of annotation presets is unspecified.
- **Stale names in the design.** [Library components](../brainstorm/01_video-artifact-engine/08_library-components.md), note 04 and the authoring skill still say `bold`, `blinds`, `split` and the old preset names.
- `images`, `scripts` and `fonts` ship contracts only in version 1. Images come from each project's own `assets/`.
