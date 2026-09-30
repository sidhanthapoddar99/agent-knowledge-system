---
title: "Elements: the video component set"
status: open
---

Video artifacts name library components in typed fields of their `.video.yaml` file, as `alias:name`. The player holds the mechanics; the library holds the looks. This leaf is the migration's side of filling the default library with the components videos need on day one, in `components/<category>/`: styles, layouts, slide templates, animation presets, transitions, backgrounds, frames, annotations, chart templates and illustrations. The video issue builds it as [T4b video component set](../../../2026-09-29-narrated-video-pages/subtasks/050_video-component-set.md), against the contracts its player spike fixes. When it is done, a video can say `template: ks:process-3`, `in: ks:dissolve` or `do: show title rise-blur` and look designed from the first one.

# 01 To Do
- [ ] **The day-one set** in `components/<category>/`, with counts as targets ([the day-one set](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/08_library-components.md#08-the-day-one-set)):
    - [ ] `styles` (3), `layouts` (8), `slides` (12 templates with slots).
    - [ ] `animations` (32): entrances, emphasis, exits and annotation presets.
    - [ ] `transitions` (10), `backgrounds` (10).
    - [ ] `frames` (12): devices, windows and containers, each an SVG with one slot ([120/75](./75_elements-frames-and-widgets.md)).
    - [ ] `annotations` (8), `charts` (8 templates), `illustrations` (12).
- [ ] **Icons** come from [120/70](./70_elements-icons.md); a video names them in its `icon:` field.
- [ ] **Manifest entries** with `category`, a description an agent can choose by, and tags.
- [ ] **A preview page** in the library's `preview/` that plays every preset, transition and template with the player's build.
- [ ] **Bump the library version** (minor) and tag, or fold into the first tag ([120/60](./60_default-library-scaffold.md)).

## Guardrails
- The player's built-ins (the stage, the grid, nine layouts, the twelve item kinds, a minimal preset pack, a plain style) live in the player, not here. A library adds to them and never replaces one.
- Every SVG passes the video compiler's allowlist: no `<style>`, no animation elements, no links, no outside references.
- Components are named only in video files and artifacts; markdown never names one.
- There are no script widgets in version 1: a counter is the `count` preset, a progress bar is the `progress` chart, typing is the `type` preset.

## Done when
- Every day-one component exists with a manifest entry and passes the library check and `agentks check libraries`.
- The preview page plays every preset, transition and template.
- `agentks check video` reports an unknown `ks:…` name in a deliberately broken copy of the video issue's example.

# 02 Status and Result
Open. Not started. Waits for the video issue's player spike, which fixes the component contracts, and its library restructure.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the library repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`, folders under `components/`.

**Read first**
- [Video artifacts: what the engine provides](../../notes/04_ecosystem/05_video-pages.md).
- The video issue's [library components](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/08_library-components.md) and [scenes, motion and the timeline](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/04_scenes-and-timeline.md).
- [Library system](../../notes/04_ecosystem/01_library-system.md), sections 06 and 13.

**Depends on:** [120/60](./60_default-library-scaffold.md), [120/70](./70_elements-icons.md), [120/75](./75_elements-frames-and-widgets.md), the video issue's [T1 player spike](../../../2026-09-29-narrated-video-pages/subtasks/010_player-spike.md) and [T4a library restructure](../../../2026-09-29-narrated-video-pages/subtasks/030_library-restructure.md).
**Unblocks:** the video issue's [T8 authoring skill](../../../2026-09-29-narrated-video-pages/subtasks/100_authoring-skill.md), whose recipes name these components.

# 04 Decisions
- Decided (sidhantha, 2026-09-30): library elements are used only in video artifacts and artifact pages; a video names them in typed fields of its file ([video artifacts](../../notes/04_ecosystem/05_video-pages.md)).
- Decided (sidhantha, 2026-09-30), on claude's proposal: pages name an element as `alias:element`.
- Decided (claude, 2026-10-01): the `counter`, `progress` and `typewriter` script widgets are dropped, because they are the `count` preset, the `progress` chart and the `type` preset, which are data and seek exactly.
- Decided (claude, 2026-10-01): the video issue's T4b builds this leaf, because one track should own the component set; this leaf stays in the libraries group so the group lists all the default library's content.

# 05 Notes & Analysis
## Watch out
- Most video components are data (JSON) or SVG, inlined into the compiled video by Rust. They are never served over `/_lib/`, so nothing is fetched at play time except images.
