---
title: "Drop `updated` from issue settings.json schema and validators"
---

- [ ] Remove the `updated` field from the issue `settings.json` schema (wherever it's documented / typed). The field is now ignored if present; new issues should not include it.
- [ ] Update the `docs-check-section` validator (`plugins/documentation-guide/scripts/issues/check.mjs` or its loader helpers) so it neither requires nor warns on a missing `updated` field. If a stale `updated` field is present, optionally emit an info-level note ("ignored — derived from git history") so humans clean it up over time.
- [ ] **Migration: strip `updated` from existing tracker issues.** Sweep `default-docs/data/todo/*/settings.json` and remove the field. One commit, no behaviour change (since the loader no longer reads it). The git commit itself becomes the new `updated` for every touched issue — that's fine, it's accurate.
- [ ] Update the issue creation CLI (any `add-issue` / `new-issue` plugin script) to stop emitting `updated` in new `settings.json` files.
- [ ] Test: every issue in the tracker still loads, layouts still render, no validator errors on the migrated tracker.

## Files likely touched

- `plugins/documentation-guide/scripts/issues/check.mjs`, `_lib.mjs`, any `add-*.mjs` that templates a new `settings.json`.
- All `default-docs/data/todo/*/settings.json` (mass strip — small change per file, scriptable).
- Any TypeScript / JSON-schema definition of the issue settings shape under `astro-doc-code/src/`.
