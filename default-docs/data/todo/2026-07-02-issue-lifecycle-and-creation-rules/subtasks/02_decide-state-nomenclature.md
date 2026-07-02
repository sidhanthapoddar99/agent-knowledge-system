---
title: Decide the state nomenclature and category grouping
status: review
---

Finalize the expanded lifecycle before any code moves. **Decided 2026-07-02** in a
brainstorm session (`brainstorm/01_discuss_lifecycle-decisions.md`), graduated to
**`notes/01_lifecycle-vocabulary.md` — the ground truth every implementation subtask
builds against.** Summary of what was settled:

- [x] **4 hardcoded categories · 7 hardcoded statuses** (Variant 2 — statuses fixed
      too, no user-defined values; only color overrides allowed). Not Started
      (`open`, `blocked`) · In Progress (`in-progress`) · Review (`input-needed`,
      `review`) · Closed (`done`, `dropped`).
- [x] **`blocked` only, no `deferred`** — blocked means structural dependency on
      another issue/subtask, reason in prose; no `blocked-by` field, no promotion,
      no stale-blocked detection.
- [x] **Review promoted to its own category** — supersedes the earlier idea of
      overloading one `review` status with two meanings: `input-needed` (stuck,
      user input required; question written inline in the subtask itself) vs
      `review` (done, awaiting sign-off).
- [x] **One shared enum + field name + validation for issues AND subtasks** — the
      `state` → `status` rename is subtask 07; category is derived, never stored.
- [x] **Hard rule on values, soft rule on transitions** — unknown status is a
      startup **error** with a detailed copy-pasteable message; any transition jump
      is legal (guidance only). Policy reversal recorded: in-progress is a real
      status, not derived from `assignees`; and status values are code-enforced, a
      deliberate departure from "convention, never code-enforced" for this one axis.
- [x] **Colors** — open `#888888` · blocked `#d1854f` · in-progress `#61afef` ·
      input-needed `#e8a54b` · review `#f0c674` · done `#7ec699` · dropped
      `#c678dd` (three unchanged from today; magenta over red for the abandoned
      terminal to avoid the priority-urgent collision).
- [x] **Migration stance** — mechanical only (rename + `closed`→`done`,
      `cancelled`→`dropped`); NO automatic status assignment from `wip` labels;
      `wip` kept but deprecated; the one `blocked`-labeled issue gets a human glance.
- [x] **UI filters by category, not status** — 4 tabs; status shows as the badge.
- [x] Fate of labels: `wip` deprecated-in-place (annotated, not removed); `blocked`
      label superseded by the status once code lands.

Marked review: decisions were made by sidhantha in-session; sign-off is confirming
the note captures them faithfully.
