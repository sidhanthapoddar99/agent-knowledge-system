---
title: "Narrated video pages"
---

# Goal

Let an agent explain the system the way a good video does: pictures that move with a voice that explains them. A video is **an ordinary markdown file**, cheap for an AI to write (a few thousand tokens for five minutes), readable on disk as a transcript, and **played live in the browser**. Nothing is rendered to MP4 and no media is committed to git.

## Context

- **Where this came from.** A discussion on 2026-09-29 about adding Remotion to agentks so architecture could be explained by video. Research showed Remotion is a poor fit (licence, React build, headless Chrome and FFmpeg to render). A lighter design was built and tested instead. See [the research note](./notes/01_initial_discussion/02_research-remotion-and-alternatives.md).
- **A working spike exists on branch `spike/narrated-video`**, commit `8874d1f` on top of `main`. A page with `video: true` in its frontmatter plays as a narrated video: each `##` heading is a scene, each paragraph is spoken by the browser's voice, and **bold** text focuses the matching part of the scene's diagram, code, list or table. The demo is the Architecture Tour page in dev-docs, under Architecture: about five minutes from a 6.3 KB file. See [the spike](./notes/01_initial_discussion/03_the-spike.md).
- **The user wants much more than the spike.** A proper video engine with richer scenes, a better voice, caching, downloadable preset libraries, and reusable project elements. See [the requirements](./notes/01_initial_discussion/01_index.md).
- **Relation to the engine migration.** The player is browser code, so it moves into the new Vite frontend unchanged. Audio generation and library downloads belong to the Rust side. See [2026-09-29-rust-core-engine-migration](../2026-09-29-rust-core-engine-migration/issue.md) and [the relation note](./notes/01_initial_discussion/08_relation-to-the-engine-migration.md).

## Done when

The discussion stage is done when:

- the open questions in [open questions](./notes/01_initial_discussion/09_open-questions.md) are decided or parked with a reason;
- a second spike (grid scenes, cues and the first widgets) has been judged by the user as good enough to build on;
- the work is split into subtasks or a plan.

## Scope decisions

- **In:** the markdown video format, the player, scene layouts and widgets, the motion style, narration audio (browser voice and a generated voice), audio and library caching under `~/.agentks`, downloadable preset libraries, project-level reusable elements.
- **Out:** MP4 or other rendered video files; storing media in git; motion-graphics-level animation (Remotion or HyperFrames style keyframing); packaging preset libraries inside the agentks binary.

Related: [2026-09-29-rust-core-engine-migration](../2026-09-29-rust-core-engine-migration/issue.md) · [2026-04-10-editor-diagrams](../2026-04-10-editor-diagrams/issue.md)
