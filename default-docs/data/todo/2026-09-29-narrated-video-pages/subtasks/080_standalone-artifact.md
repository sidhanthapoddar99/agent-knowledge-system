---
title: T7a Standalone artifact — one shell writer for the route, video preview and build
status: open
---

A video is first an independent artifact. This track gives sidhantha the first real video he can open: one engine function writes the standalone player page, and the server route, agentks video preview and agentks build all call it.

# 01 To Do
- [ ] **The shell writer** in `crates/video`: one function writes the standalone page's HTML with the compiled `VideoData`, the player chunk, the theme and the transcript.
- [ ] **`?sheet`** opens the review sheet: every slide's end state and the middle of each morph, with the player's diagnostics beside it; `?sheet&slide=n` opens one slide; `?theme=light` or `dark` sets the mode.
- [ ] **`agentks video preview <video> [--sheet]`**, where `<video>` is a `.video.yaml` file, a video folder or a scene file (a scene opens the page at that scene), writes the page to the build cache and opens it, with no server.
- [ ] **The `/artifacts/<path>.video` route** on the server, serving the same shell for a single file or a video folder (`<path>` is the file's path without `.video.yaml`, or the folder's path).

## Guardrails
- One writer, three callers. The route, `video preview` and `agentks build` never carry their own copy.
- The page is engine HTML, not author HTML, so it adds nothing to the `/artifacts` trust question.
- `video preview` needs no running server.
- Write only in `crates/video`, `crates/cli` and the server crate's route table.

## Done when
- `agentks video preview` on the example opens a page that plays it, and `--sheet` shows all its slides with no diagnostic.
- The server's `/artifacts/<path>.video` serves the same page for a video in a docs section and in a tracker's `notes/`, in both forms.
- A test shows the route and `video preview` produce the same HTML for the same input.
- sidhantha opens the example as an artifact.

# 02 Status and Result
Not started. T1 is built and was merged on 2026-10-01. Waits for T3; the route also needs [050/10](../../2026-09-29-rust-core-engine-migration/subtasks/050_server/10_http-and-routes.md).

## Result
Nothing yet.

## Agent log
none

# 03 References
- [How it fits the new architecture](../brainstorm/01_video-artifact-engine/09_architecture-fit.md) — the shell step, the server, the CLI, security.
- [The player](../brainstorm/01_video-artifact-engine/06_player.md#07-layout-diagnostics-and-the-review-sheet) — diagnostics and the review sheet.
- [010 T1 Player spike](./010_player-spike.md) and [040 T3 Format and compiler](./040_format-and-compiler.md) — what this page puts together.
- [050/10 HTTP and routes](../../2026-09-29-rust-core-engine-migration/subtasks/050_server/10_http-and-routes.md) — the route table.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## Watch out
- `agentks build` writes the same page to `artifacts/<path>.video/index.html` in T9; keep the writer free of server-only assumptions.
