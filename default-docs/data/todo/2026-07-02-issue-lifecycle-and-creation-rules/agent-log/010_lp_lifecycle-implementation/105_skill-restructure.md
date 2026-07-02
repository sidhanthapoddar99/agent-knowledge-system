---
title: "Milestone 5 — doc-issues skill restructure (subtask 09)"
iteration: 5
status: success
---

## Goal

Subtask 09 — the three structural rough edges left by the doc-issues/documentation-guide
skill split. Run LAST because it renames the same reference files subtasks 06 + 08 edited.
One plugin version bump for the whole restructure.

## Approach & result

**Part 1 — fold the flat `references/` into band folders.** 20 flat files navigable only
by a numeric-band convention → five folders that make the bands visible, so the folder
listing itself reads as a table of contents:

```
00_anatomy/    00_overview 01_folder-layout 02_settings 03_vocabulary
10_writing/    10_writing
20_sections/   20_issue-md … 27_guide-and-glossary
40_operations/ 41_searching 42_updating 43_moving-restructuring
60_examples/   61_multiple-subtasks … 64_phase-index
```

Filenames kept stable (only the folder changed) to minimise external-reference churn. Did
the moves + link rewrites with a deterministic script (`git mv` + relative-path recompute)
rather than by hand — **83 links rewritten** under doc-issues (34 in SKILL.md's triage
table + 49 inter-reference), plus the `00_overview.md` index reworked to name the five
folders, plus the sibling's `writing.md` sync-note path. Verified every relative link with
`check-skill-links.mjs` pointed at each skill root — **both green**.

**Part 2 — documentation-guide prerequisite, stated up front.** The old top-of-SKILL.md
aside said "reach for the sibling only when you leave the tracker" — but some *in-tracker*
work needs it. Rewrote it into an explicit prerequisite block: **images/screenshots inside
an issue → load `documentation-guide` and read `images.md`** (the `docs-guide img`
workflow; `10_writing.md` says *never commit a raw screenshot*, `images.md` is *how*); plus
the leaving-the-tracker cases (`settings-layout.md`) and the shared-CLI pointer
(`cli-toolkit.md`). Links are cross-skill relative and validate.

**Part 3 — a written home rule for scripts.** The structure already followed the right
split; it just wasn't written down. Added CONTRACT.md §8 "Where a script lives": durable,
reusable capability → a `docs-guide` subcommand under `scripts/` (manifest entry,
dispatched, self-tested); one-shot dated data migration → `migration/YYYY-MM-DD_<name>.py`
(run by explicit path, idempotent detect/locate/migrate/verify, kept as historical record).
`doc-issues` ships no scripts of its own. No relocation needed — subtask 07's migration
script was already in the right home.

## Verification

- `check-skill-links` on **both** skill roots (repo + cache) → ✓ all checks passed.
- `_selftest.mjs` (under bun) → PASS.
- Version bumped once: `0.5.0 → 0.6.0`.
- `rsync --delete` repo → cache (removes the now-stale flat reference files) + `diff -rq`
  → **IDENTICAL**. Confirmed the cache `references/` listing is the five band folders and
  `docs-guide` still routes issue commands.
- Final sweep: no live functional link to an old flat `references/NN_*.md` path remains;
  historical references in other issues' folders + this issue's own 06/103 records are
  intentionally left (append-only history).

## Next

Subtask 09 → review. **All nine subtasks now review** → write `01_summary.md` and stop the
loop; the issue stays open for sidhantha's sign-off (he owns `done`).
