---
title: "Video pages: a style picker that saves, and the play and sheet views for readers"
status: open
---

The library's video preview page (`preview/video/` in the library repository) has a Style picker and a View picker, and sidhantha found both very useful on 2026-10-01. Today they are preview-page tools only. This leaf brings them into the app. In edit mode, the author picks a style for a video, sees it at once, and saves it into that video's own file. In both modes, anyone viewing a video can switch between the play view and the sheet of every slide.

# 01 To Do
- [ ] **The style picker, in edit mode.**
    - [ ] The video page shows a Style picker while the page is in edit mode. It lists the styles the project can use, as the engine reports them: the built-in `plain` plus every style pack in the project's libraries (`ks:clean`, `ks:bold`, `ks:blueprint` today). The client never builds this list itself.
    - [ ] Picking a style redraws the video with it at once, the way the preview page does, without writing anything.
    - [ ] Saving writes the choice as the `style` key of the video's controller file (`NN_*.video.yaml`, or `video.yaml` in a video folder). This is the key the format already defines ([01/03 artifact format](../brainstorm/01_video-artifact-engine/03_artifact-format.md)). Choosing `plain` removes the key, because `plain` is the default.
    - [ ] The engine does the write: the client asks it to set one key, and the engine changes that key only, keeping the file's comments, key order and formatting. It goes through the editor's save path, so the watcher, the echo suppression and the undo behave as they do for any other save.
    - [ ] Leaving edit mode, or reloading, with an unsaved pick shows the saved style again.
- [ ] **The play and sheet views, in view mode and in edit mode.**
    - [ ] The video page has a View switch: play and sheet. Play is the default.
    - [ ] The sheet is the review sheet the player already draws (`sheet.ts`, [01/06 the player](../brainstorm/01_video-artifact-engine/06_player.md#07-layout-diagnostics-and-the-review-sheet)): every slide's end state, plus the middle of each morph, on one screen.
    - [ ] In view mode the sheet shows the slides only. The layout diagnostics show in edit mode, as they do on the standalone page.
    - [ ] Clicking a slide in the sheet opens the play view at that slide.
    - [ ] The reader's last view is remembered per project in the client's UI state (`aks:<key>:<kind>:<scope>`), not written to any file, because it is a reader's preference, not part of the document.
    - [ ] The standalone page's `?sheet` keeps working.

## Guardrails
- The filesystem is the document: the chosen style lives in the video's own file, so it shows the same in the app, on a static site, in the standalone page and to `cat`. Never keep it in browser storage.
- Rules stay in Rust: the style list and the file write are the engine's; the client only asks.
- A scene file never gets a `style` key; the format rejects one (`video-unknown-key`).
- Theme contract only, for the pickers' CSS.

## Done when
- In edit mode, picking `ks:blueprint` and saving changes exactly one line of the controller file, and the video shows that style after a reload, in view mode, and on the standalone page.
- Picking `plain` and saving removes the `style` key.
- A reader switches to the sheet, reloads, and still sees the sheet; clicking a slide plays from that slide.
- In view mode the sheet shows no diagnostics; in edit mode it does.

# 02 Status and Result
Open. Waits on the video page kind and its player island ([T7b](./090_video-pages-in-the-app.md)) and on the editor's save path.

## Result
None yet.

## Agent log
none

# 03 References
- [T7b Video pages in the app](./090_video-pages-in-the-app.md) — the video page, its layout and the player island this leaf extends.
- [T7a Standalone artifact](./080_standalone-artifact.md) — the standalone page and its `?sheet`.
- [01/06 The player](../brainstorm/01_video-artifact-engine/06_player.md#07-layout-diagnostics-and-the-review-sheet) — the review sheet.
- [01/03 Artifact format](../brainstorm/01_video-artifact-engine/03_artifact-format.md) — the controller's `style` key.
- Engine issue: [110/20 edit in place](../../2026-09-29-rust-core-engine-migration/subtasks/110_editing/20_edit-in-place.md), [110/40 save path and sync](../../2026-09-29-rust-core-engine-migration/subtasks/110_editing/40_save-path-and-sync.md), [050/35 file writes and echo suppression](../../2026-09-29-rust-core-engine-migration/subtasks/050_server/35_file-writes-and-echo-suppression.md), [090/10 UI state persistence](../../2026-09-29-rust-core-engine-migration/subtasks/090_frontend-performance/10_ui-state-persistence.md).
- The model to copy: the library repository's `preview/video/index.html` (the `style` and `view` pickers, and `applyStyle`).

# 04 Decisions
## 01 The style is saved in the file, the view in the browser
- Decided (claude, 2026-10-01): the style is part of the document, so it goes in the controller file, where every renderer reads it. The play or sheet view is how one person likes to look at it, so it goes in the per-project UI state. sidhantha asked for a style choice that "actually saves that this particular doc should be in this particular style".

## 02 The sheet hides diagnostics in view mode
- Decided (claude, 2026-10-01): a reader gets the slides only, because layout diagnostics are for whoever can fix them, and the author sees them in edit mode.

# 05 Notes & Analysis
## Watch out
- The preview page applies a style by setting `data.style = "ks:<name>"` on the compiled video before mounting it. In the app the engine compiles the video, so a picked but unsaved style has to reach the player without a recompile. Check whether the player can take a style override at mount time before building a second path.
