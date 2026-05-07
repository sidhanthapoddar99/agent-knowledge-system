## Goal

This tracker is **comprehensive memory of thought-work for AI-augmented development**, not a project-management tool. An issue is a folder that captures one coherent unit of *thinking + execution*: planning notes, work breakdown, agent execution log, dialog. The tracker's value is the recorded reasoning, not "what's left to do".

A few residual fields don't fit this model and have empirically rotted into noise:

- **`due`** — author-maintained future date, never enforced. Audit on 2026-05-07: 9 of 10 issues with `due` set were past their date with new subtasks still landing. 90% rot rate.
- **`milestone`** — author-maintained release-bucket assignment. Used as a project-management primitive (sprint-lite). The team-shape this tracker is built for (1–4 humans + AI agents) doesn't run release planning the way milestones expect.

This issue does the cleanup: drops both fields cleanly, surfaces priority in their place, codifies the tracker's actual mental model in writing so the dropped fields don't get re-introduced, and lays down the two best-practice rules we've discussed.

## Scope

Eight subtasks. Each touches a different surface, so most can land independently — see the ordering note below for the one real coupling.

## What "drop" means here

**No reference means no reference.** When milestone and due are dropped, they are gone — schema, validator, plugin code, current `settings.json` files, views config, CLI templates, docs, the historical design-philosophy note. No `// removed milestone` comments. No "deprecated, ignored if present" notes. No migration shim. The fields never existed.

The one exception: the dev-docs writeup (subtask 8) records the *history* of what was removed and why. That's a deliberate historical record, not a deprecation marker.

## Ordering note

Most subtasks are independent. The one coupling: **the validator must be relaxed before fields are stripped from existing `settings.json` files**, otherwise `docs-check-section` will fail every issue mid-migration. Inside subtasks 1 and 2, the order is: relax validator → strip from issues → remove from schema → update CLI templates. One commit per field, each commit self-contained.

See subtasks for the breakdown. Subtask 03 covers the derived `updated`-date mechanism (cache loader + UI integration); design rationale and per-step implementation detail live in [`notes/derived-issues-updates/`](./notes/derived-issues-updates/00_design-rationale.md).
