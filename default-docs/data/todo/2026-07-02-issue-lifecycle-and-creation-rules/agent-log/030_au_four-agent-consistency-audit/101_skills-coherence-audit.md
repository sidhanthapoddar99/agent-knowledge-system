---
title: "Iteration 1 — skills coherence audit (agent: skills vs code)"
iteration: 1
status: success
---

## Goal

One Opus agent, read-only: audit both plugin skills — `doc-issues` (SKILL.md + all
five reference bands) and `documentation-guide` (SKILL.md + `cli-toolkit.md`) —
for internal coherence and consistency with the shipped v0.7.0 code
(`issue-status.ts`, `issues.ts`, `check.mjs`, the CLI scripts), plus the repo-root
`CLAUDE.md`. The cache copy was excluded (already proven byte-identical).

## Approach

Grep-driven sweeps for the deleted migration filenames and the pre-rename anatomy
targets, `check-skill-links.mjs` on both skill roots, then close reads of every
reference that describes the lifecycle, the root-settings schema, review-debt, or
CLI verbs — each claim traced to the actual script/loader line.

## Result — 2 discrepancies (both minor), everything structural clean

1. **`documentation-guide/references/cli-toolkit.md:48` — misleading.** The
   `review-queue` one-liner said "status=review + open w/ review subtask"; the
   real behaviour (per `review-queue.mjs` and its own `--help`) is the whole
   **Review category** (`review` OR `input-needed`) plus **any active** (non-closed)
   issue with a Review-category subtask. The sibling `41_searching.md:47` states
   it correctly — this was the lone imprecise summary.
2. **`doc-issues/references/00_anatomy/02_per-issue-settings.md:14` — minor.**
   The canonical per-issue example used `"labels": ["feature", "wip"]` while the
   vocabulary reference itself marks `wip` DEPRECATED (transient state rides on
   `in-progress`/`blocked` statuses now).

Verified correct (highlights): no instruction anywhere to put status values or
colors under `fields.status`; `statusColors` documented top-level; descriptions
required/optional split matches `check.mjs`; lifecycle vocabulary matches
`issue-status.ts` byte-for-byte in SKILL.md, `00_overview.md`, and `_lib.mjs`;
review-badge inheritance described as display-only; zero references to the two
deleted migration filenames or the two pre-rename anatomy filenames; all CLI
verb/flag descriptions match the scripts (`set-state` positional, `subtasks
--status all`, `check issues --tracker`); sibling-skill cross-references and
CLAUDE.md current. Also noted (not a defect): `24_agent-logs.md` uses a separate
milestone-status axis (`not-started|in-progress|success|failed`) — a different
vocabulary from the issue lifecycle, intentionally.

## Next

Both nits fixed in the fix wave (milestone 105).
