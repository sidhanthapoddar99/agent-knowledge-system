---
title: Root settings — status becomes colors-only; hard-error on a values field
status: review
---

Sidhantha's direction (2026-07-02, post-loop sign-off): the root-settings `status`
entry must **not** carry a `values` array. Statuses are fixed in
`issue-status.ts`; a `values` list in settings reads as authoritative to any future
reader — human, agent, or code — and *will* eventually be consumed as if it were
the vocabulary. Today `data/todo/settings.jsonc:18` has exactly that (kept as
"documentation only", loader-ignored). Silent-ignore is the bug: error loudly
instead. The only thing a tracker may configure about status is **colors**.

- [x] **Hard startup error** when a `fields.status` object is present — message
      builder `statusFieldForbiddenMessage()` in `issue-status.ts`, thrown from
      the new `resolveVocabulary()` in `issues.ts` at load time (the fileHint now
      names the real `.jsonc`). Mirrored in `check.mjs` (error, not drift).
- [x] Reshape to colors-only — `fields.status` dropped; a top-level
      `statusColors` map (flat status→hex) added to `IssuesVocabulary`. Keys are
      validated against the fixed vocabulary via `resolveStatusColors()` — an
      unknown key (`unknownStatusColorMessage`) is a hard error, not ignored.
      Loader merges overrides onto `DEFAULT_STATUS_COLORS` (fixes a latent bug
      where a partial override lost the other six defaults) and exposes the
      resolved map as `LoadedIssues.statusColors`; it also synthesises an
      in-memory `fields.status` so the five badge layouts stay untouched.
- [x] Migration — the status-colours check is **facet A of the single merged
      `migration/2026-07-03_root-settings-schema.py`** (per CONTRACT.md §8; merged
      with subtask 11's descriptions facet at sidhantha's suggestion — the two are
      one root-settings v0.7.0 transition on the same file, same detection-only
      pattern). `detect`/`guide`/`verify`, no auto-write (JSONC comments are
      load-bearing). `guide` hoists only non-default colours and flags invalid
      keys; docstring documents the hard build error. Negative-tested.
- [x] Migrated our own `data/todo/settings.jsonc` — `fields.status` gone,
      top-level `statusColors` added, fixed-vocabulary comment kept. `verify`
      clean.
- [~] Propagate the new shape: loader types **done**; docs (user-guide
      vocabulary + setup-new-tracker + themes example) and skill reference
      `00_anatomy/03_overall-issue-tracker-vocabulary.md` (renamed from
      `03_vocabulary.md`) — **in flight this wave** (doc-propagation sweep).
      Plugin version bump + cache mirror at finalize.
- [x] Build green (647pp) + `docs-guide check issues` exit 0 (CLI mirrored).

**Sequencing:** landed WITH subtask 11 — both reshape root-settings vocabulary
validation; one plugin version bump for the wave.
