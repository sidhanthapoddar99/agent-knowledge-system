---
title: Update code for the new states (frontend + backend)
state: open
---

Implement `notes/01_lifecycle-vocabulary.md` end-to-end. **Coordinate with subtask
07** — the `state`→`status` field rename and the value migration ride one script /
one pass; build this subtask's validation against the *canonical* field name.
Read the note first; it wins over anything stale here.

**Backend — the single constant**

- [ ] **One exported constant** in `src/loaders/issues.ts` declaring the 7 statuses,
      the 4-category grouping (`not-started` / `in-progress` / `review` / `closed`),
      and default colors — the single source every other surface imports. Replace
      the `SubtaskState` union + the scattered hardcoded lists with it.
- [ ] **Shared validation for issues AND subtasks** — loader validates both levels
      against the constant. **Unknown status = hard error** (fail the build/dev
      server), with a detailed copy-pasteable message: file path, offending value,
      the legal vocabulary, pointer to the migration check. Remove today's silent
      default-to-`open` for invalid subtask states (issues.ts:630) and the free-form
      `status: string` pass-through for issues.
- [ ] **Root `settings.jsonc` contract change** — `fields.status.values` is no
      longer honored (statuses are code-owned); accept only optional `colors`
      overrides there. Loader warns if a tracker still declares `values` that
      differ from the constant. Update the bundled root `settings.jsonc` (values →
      comment explaining they're now fixed; add the new colors; annotate `wip`
      label as deprecated).
- [ ] **Category derivation** — expose `category` on loaded issues/subtasks
      (computed, never read from files); drop any assignees→in-progress derivation.

**CLI (`docs-guide` — repo source AND installed cache, diff-verified)**

- [ ] `issue set-state` — accept the 7 statuses on both issues and subtasks; **fix
      the bug found 2026-07-02 where subtask targeting is silently ignored and the
      issue status gets flipped instead** (document the working syntax in `--help`).
      Rename/alias the verb to match the unified `status` naming.
- [ ] `issue list` / `review-queue` — filter by status AND by category; default
      scope becomes "everything not in the Closed category".
- [ ] `check issues` — validate both levels against the constant (error, not warn);
      replace `_lib.mjs` / `check.mjs` local lists with the shared vocabulary
      (import or generated copy — decide and document).

**Frontend (`src/layouts/issues/default/`)**

- [ ] **StateTabs → category tabs** — 4 tabs (In Progress · Review · Not Started ·
      Closed; Review stays highlighted), counts by category. Status-level counts
      move into the tab tooltip or subline if cheap.
- [ ] **Status badges** — 7 statuses with the decided colors in `IssuesTable`,
      `IssuesCards`, detail header, subtask checklist rendering; colors read from
      the constant with settings.jsonc override.
- [ ] **FilterBar** — category filter (primary) + status filter (secondary);
      update `client.ts` filter logic.
- [ ] **Review-debt promotion** — an issue surfaces under Review when any subtask
      is in the Review *category* (`input-needed` OR `review`); update
      `IndexBody.astro` logic (incl. `CLOSED_STATUSES` → category check).
- [ ] **Views in root `settings.jsonc`** — replace the label-based "Blocked" view
      with `status: blocked`; revisit/remove "Assigned" (assignees no longer signal
      progress).
- [ ] Subtask state counts under headers (`DetailBody`, `SubDocLayout`) use the new
      statuses/categories.

**Verification**

- [ ] Full build green + `docs-guide check issues` green on all trackers AFTER the
      subtask-07 migration has run (sequence: constant + validation in place →
      migration script converts files → hard validation turned on / verified).
- [ ] Manually exercise: category tabs filter correctly, badges show decided
      colors, a deliberately-invalid status produces the detailed hard error.
