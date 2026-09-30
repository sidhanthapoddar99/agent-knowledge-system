---
title: Video build
---

The order in which the video artifact engine is built: four waves, each gated by the one before, so the look and the voice are judged before anything expensive is built on them. The design is [the video artifact engine](../../brainstorm/01_video-artifact-engine/01_index.md); its build tracks and waves are in its build plan section.

# 01 To Do
- [ ] Stage 10: the player spike, the voice spike and the library restructure; sidhantha judges the look and the voice.
- [ ] Stage 20: the compiler, the day-one component set and rich motion.
- [ ] Stage 30: voice in the engine and the standalone artifact, then video pages in the app and the authoring skill.
- [ ] Stage 40: publishing with the migration's Phase 3, then the tests.

# 02 Status and Result
Stage 10 is at review. T1, T2 and T4a are built: T1 and T2 were merged into the main repository on 2026-10-01 (merge commits `2519f9e` and `8d19c0b`), and T4a is commit `ff3c325` in the library repository. The stage waits for sidhantha to watch the example and hear the voices.

Stage 20 is running while stage 10 waits: T5 and T4b are being built now. T3 has not started; the folder form it waited for was designed on 2026-10-01 (decisions 41 to 52 in [the design index](../../brainstorm/01_video-artifact-engine/01_index.md#the-folder-form)). Stages 30 and 40 have not started.

# 03 References
- [The design's tracks and waves](../../brainstorm/01_video-artifact-engine/01_index.md#build-plan)
- [What the design changes elsewhere](../../brainstorm/01_video-artifact-engine/11_changes-to-existing-design.md)
- [Open questions](../../notes/01_initial_discussion/09_open-questions.md)
- [The engine migration](../../../2026-09-29-rust-core-engine-migration/issue.md) — stages 30 and 40 wait on its Phase 1 and Phase 3.

# 04 Decisions
- Decided (claude, 2026-10-01): one stage per wave of the design, with the stage's subtasks in track order, because the waves already encode what blocks what and a second ordering would drift.
- Decided (claude, 2026-10-01): the tracker corrections that started this plan have no subtask of their own, because the design asks for T10 to be the last subtask and the corrections are bookkeeping, recorded in this plan and in the notes they changed.
- Decided (claude, 2026-10-01): stage 10 waits on sidhantha, because its outcome is his judgement of the look and the voice, which no test can give.

# 05 Notes & Analysis
## 01 Why the spikes gate everything
If the look or the voice is not good enough, the design changes in wave 1, cheaply. The library restructure runs in wave 1 because the rename is free only until the library's first tag.
