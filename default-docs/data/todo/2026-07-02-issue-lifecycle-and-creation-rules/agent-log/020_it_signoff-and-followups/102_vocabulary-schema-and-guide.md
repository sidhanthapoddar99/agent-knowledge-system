---
title: "Milestone 2 — root-settings schema reshape + tracker Guide modal (subtasks 11 + 12)"
iteration: 2
status: success
---

## Goal

Subtasks 11 + 12, landed as one wave — both reshape the tracker-root vocabulary
schema and its validation, so doing them together avoids editing the same files
(loader, CLI check, settings, docs) twice.

## Approach & result

**Schema decisions (low-blast-radius on purpose).**
- **12 — colours-only.** Dropped `fields.status` from settings; added a top-level
  `statusColors` map (flat status→hex, overrides only). A `fields.status` block
  is now a hard error; unknown `statusColors` keys are a hard error (a colour for
  a non-existent status is a typo). The loader merges overrides onto
  `DEFAULT_STATUS_COLORS` — which *fixes a latent bug*: previously a partial
  override silently lost the other six defaults.
- **11 — descriptions.** Chose a **parallel `descriptions` map** over an
  array-of-objects rewrite, so `values` stays `string[]` and filters / ordering /
  client-config are untouched. Every `component` and `labels` value must have a
  description (hard error otherwise); `priority` optional.

**Framework.** `issue-status.ts` gained the message builders + `resolveStatusColors`
+ `STATUS_DESCRIPTIONS`/`CATEGORY_DESCRIPTIONS`. `issues.ts` gained
`resolveVocabulary()` (validates + resolves at load, before any issue is read),
exposes `LoadedIssues.statusColors`, and **synthesises an in-memory `fields.status`**
so the five badge layouts read colours unchanged. The load-time error hint now
names the real file (`.jsonc`) via `resolveSettingsPath`.

**CLI.** `check.mjs` enforces the same three rules (forbidden `fields.status`,
invalid `statusColors` key, missing component/label description); `statusColors`
added to the root key set, `status` removed from the field key set.

**Migration (detection+guidance only — JSONC comments are load-bearing).** A
**single** `2026-07-03_root-settings-schema.py` with two facets — A: status
colours-only, B: required descriptions — `detect`/`guide`/`verify`. (Initially two
scripts; merged at sidhantha's suggestion, since both touch only the tracker-root
file, share the detection-only pattern, and are one v0.7.0 transition. The
separate, already-applied per-file `2026-07-02_state-to-status.py` stays — a
different, auto-writing migration from the loop.) Docstring documents the exact
hard build error each facet prevents (sidhantha hit the `fields.status` one
mid-implementation and asked for it spelled out). Negative-tested on a synthetic
old-shape tracker: `detect` reports both facets, `verify` exits 1, `guide` hoists
only non-default colours and flags an invalid key. Migrated our own
`data/todo/settings.jsonc` by hand (comments → `descriptions`/`statusColors`);
`verify` clean.

**Guide modal (11).** `parts/index/GuideModal.astro` — native `<dialog>`,
self-contained open/close, a "Guide" button before the view toggle. Renders the
**fixed** lifecycle from the `issue-status.ts` constants (categories + status
badges from the resolved `statusColors` + the new descriptions) with a
fixed/editable split, and the **editable** priority/component/label vocabularies
from settings with their descriptions. Verified in the built AND dev-server HTML:
4 categories, 7 status badges, 3 editable + 1 fixed tag, descriptions rendered.

## Verification

Build green (647pp); `docs-guide check issues` exit 0 (CLI scripts + migrations
mirrored to the cache, `diff -rq` identical); `_selftest.mjs` PASS.

## Next

Subtask 10 (review-status inheritance).
