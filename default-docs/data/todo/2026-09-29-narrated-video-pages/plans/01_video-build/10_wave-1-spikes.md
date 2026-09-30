---
title: 'Wave 1: the two spikes and the library restructure'
status: review
outcome: sidhantha has watched the example in the player, looked at its review sheet and heard the voices, and judged both good enough to build on
who: sidhantha
subtasks:
- '[T1 Player spike — the framework-free player plays the 3-minute example](../../subtasks/010_player-spike.md)'
- '[T2 Voice spike — Kokoro clips with word timings, joined into one stream](../../subtasks/020_voice-spike.md)'
- '[T4a Library restructure — components/<category>/ and the full Lucide icon set](../../subtasks/030_library-restructure.md)'
---

The gate for everything else. The player and the voice are the two things that can fail, so they are tried first and judged by sidhantha before anything is built on them. The library restructure runs beside them, because it is free only until the library's first tag.

# 01 To Do
- [ ] sidhantha watches the example in the player and looks at its review sheet in light and dark.
- [ ] sidhantha listens to three voices and picks the default, and hears how "agentks" is said.
- [ ] Record the answers to the two open questions in [open questions](../../notes/01_initial_discussion/09_open-questions.md), and confirm or overturn the five provisional ones.

# 02 Status and Result
The work is built; the stage waits for sidhantha's judgement of the look and the voice. All three subtasks are at review.

- **T1, the player:** merged into the main repository (NeuraLabsHQ/agent-knowledge-system) on 2026-10-01 by merge commit `2519f9e`. The example plays start to end in Chromium and Firefox, seeking matches playing, and the review sheet lists no diagnostic. The player is 20.09 KB gzipped against a 30 KB cap.
- **T2, the voice:** merged into the main repository on 2026-10-01 by merge commit `8d19c0b`. All 27 beats become clips with word timings. The joins measure silent (the loudest sample near a join is -84 dBFS). Three voices are ready for sidhantha to hear.
- **T4a, the library restructure:** on the library repository's `main` as commit `ff3c325`. The library has `components/<category>/` and the full Lucide icon set.
- **Not tested:** Safari on macOS and iOS, because both spikes ran on Linux. [T6](../../subtasks/070_voice-in-the-engine.md) carries that test.
- **The folder form** was designed on 2026-10-01 (decisions 41 to 52 in [the design index](../../brainstorm/01_video-artifact-engine/01_index.md#the-folder-form)). It changes nothing in this stage: both forms compile to the same `VideoData`, so the player spike's single-file fixture stays valid.

# 03 References
- [The design's done-when for the two spikes](../../brainstorm/01_video-artifact-engine/01_index.md#done-when-for-the-two-spikes)
- [Open questions](../../notes/01_initial_discussion/09_open-questions.md) — the two open questions and the five provisional ones.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## 01 What would change the design here
A look that is not good enough changes the player or the layout system. A voice that is not good enough, or joins that can be heard, changes the voice model or the delivery to one clip per beat.
