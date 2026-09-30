---
title: T8 Authoring skill — agentks-video with its references, the look gate and three examples
status: open
---

A video that passes the check is not yet a good video. This track writes the agentks-video skill, which teaches agents the order of work, the recipes and pacing, and makes them look at every slide in light and dark before calling a video done.

# 01 To Do
- [ ] **`plugins/agentks/skills/agentks-video/SKILL.md`**, about 2,000 tokens: triage, the order of work, the never-table, the trigger description.
- [ ] **References:** `format.md` (both forms and who owns what, every key, the action grammar, anchors, errors), `recipes.md` (message to slide recipe, pacing numbers, motion rules), `writing-for-the-ear.md`.
- [ ] **Three examples**, each passing `agentks check video`: the product tour as a folder, a concept explainer as a folder with one component of its own in `components/` and a morph across two scene files, a data story as a single file under 4 KB.
- [ ] **One file or a folder, and fixing one scene:** the rule for choosing the form, and the fix-one-scene workflow with `agentks check video <scene file>` and `agentks video preview <scene file> --sheet`.
- [ ] **The look gate:** the agent opens the review sheet in light and dark, fixes every diagnostic, and only then calls the video done.
- [ ] **Keeping it true:** CI checks the three examples, compares `format.md` with the JSON Schema key by key, and looks up every component the recipe table names in the default library.
- [ ] **The evaluation:** five prompts through the skill-creator's loop, scored on first-try check, no pacing warnings, no diagnostics after the look step, running time within 15% of target, and sidhantha's judgement. Keep the review-sheet screenshots in both themes.

## Guardrails
- The skill describes the current format only, with no history.
- It names only components that exist in the default library.
- Write only in `plugins/agentks/skills/agentks-video/`.

## Done when
- The three examples pass the check and play in the standalone page with no diagnostic.
- The CI checks above pass.
- The five evaluation prompts score as above, and sidhantha judges the results good.

# 02 Status and Result
Not started. Waits for T3, T4b, T5 and T7a.

## Result
Nothing yet.

## Agent log
none

# 03 References
- [The authoring skill](../brainstorm/01_video-artifact-engine/10_authoring-skill.md) — the whole design of this track.
- [The artifact format](../brainstorm/01_video-artifact-engine/03_artifact-format.md) — the source for `format.md`.
- [Library components](../brainstorm/01_video-artifact-engine/08_library-components.md#08-the-day-one-set) — the components the recipes name.
- [130/10 Plugin port](../../2026-09-29-rust-core-engine-migration/subtasks/130_ai-plugins/10_agentks-plugin-port.md) — where the skill joins the plugin.

# 04 Decisions
None yet.

# 05 Notes & Analysis
## Watch out
- A 3-minute video should cost an agent about 13,000 to 15,000 tokens in total, about 2,500 written. A skill that pushes this far higher needs trimming.
