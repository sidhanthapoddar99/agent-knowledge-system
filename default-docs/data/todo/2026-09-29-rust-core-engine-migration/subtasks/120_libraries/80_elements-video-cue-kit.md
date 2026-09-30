---
title: "Elements: the video cue kit (scene templates and script widgets)"
status: open
---

Narrated video pages name library elements inside their cues, as `alias:element`. This leaf fills the default library with the elements videos need beyond the player's built-in widgets: **scene templates** (a ready layout such as a request flow or a before-and-after) and **script widgets** (small animations that follow the widget contract). It waits for the video issue to settle its cue syntax and widget contract, because both decide what these elements look like. When it is done, a video page can use `<!-- scene: video:request-flow -->` or `<!-- panel: video:counter -->` and play it locally and on a published site.

# 01 To Do
- [ ] **Wait for the inputs.** Start only when [the video issue](../../../2026-09-29-narrated-video-pages/issue.md) has decided the cue syntax and the widget contract ([its open questions](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/09_open-questions.md)). Until then this leaf stays `open`; record the dependency in its result line if someone picks it up early.
- [ ] **Scene templates.** Five to start, each a self-contained element the player loads into a scene's layout:
    - [ ] `request-flow` — client → server → database, with numbered hops.
    - [ ] `before-after` — two panels side by side.
    - [ ] `layers` — a stacked architecture diagram.
    - [ ] `timeline` — events on a horizontal line.
    - [ ] `split-code` — code on one side, explanation on the other.
- [ ] **Script widgets.** Three that follow the widget contract: they receive their cue and their panel, and animate only inside the panel.
    - [ ] `counter` (a number animating to a value), `progress` (a bar), `typewriter` (text appearing).
- [ ] **Icons for scenes** come from [120/70](./70_elements-icons.md); scene templates reference them as `alias:element` through the player, not by path.
- [ ] **Manifest entries** with descriptions that say which cue uses them and what parameters they take; tag `video` plus a role tag (`scene`, `widget`).
- [ ] **A sample video page** in the library's test project that uses every element; it must pass `agentks check libraries` and play in the browser.
- [ ] **Bump the library version** (minor) and tag.

## Guardrails
- Built-in widgets (file tree, flow, browser frame, phone frame, chart, code, terminal, diagram) live in the player in the shared UI package, not here. Do not duplicate them as elements.
- Script widgets run sandboxed and cannot reach the player around them.
- Elements are named only inside cues; narration prose stays plain markdown.

## Done when
- The sample video page plays every scene template and widget in the local client and in a static build.
- `agentks check libraries` reports an unknown `video:…` name in a deliberately broken copy of the sample page.

# 02 Status and Result
Open. Not started. Blocked in practice on the video issue's cue syntax.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the library repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`, folder `video/`.

**Read first**
- [Video pages: what the engine provides](../../notes/04_ecosystem/05_video-pages.md), sections 01–03.
- The video issue: [issue.md](../../../2026-09-29-narrated-video-pages/issue.md), [the video engine](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/04_video-engine.md), [libraries and reusable elements](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/07_libraries-and-reusable-elements.md).
- [Library system](../../notes/04_ecosystem/01_library-system.md), section 13.

**Depends on:** [120/60](./60_default-library-scaffold.md), [120/70](./70_elements-icons.md), [120/75](./75_elements-frames-and-widgets.md), [100/40 video pages](../100_layouts/40_video-pages.md), the video issue's cue syntax.
**Unblocks:** the video issue's widget work.

# 04 Decisions
- Decided (sidhantha, 2026-09-30): library elements are used only in video pages and artifact pages; a video names them inside cues ([video pages](../../notes/04_ecosystem/05_video-pages.md)).
- Decided (sidhantha, 2026-09-30), on claude's proposal: pages name an element as `alias:element`.

# 05 Notes & Analysis
## Watch out
- Library script widgets are plain HTML and JS in a sandboxed frame, so they do not depend on the UI framework (Preact 11, [080/10](../080_ui-and-client/10_ui-framework-decision.md)); keep them that way.

## Open until the work starts
- The cue syntax and the widget contract — owned by the video issue. See [open questions and risks](../../notes/01_overview/05_open-questions-and-risks.md) (video pages row).
