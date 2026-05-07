---
title: "Update plugin skill + CLI wrappers to expose derived dates"
---

- [ ] **`docs-list`**: gain `--sort updated` and `--sort created` options. The "Updated" column in formatted output reads from the derived field. Existing flags don't change shape; just plumb the new field through.
- [ ] **`docs-show`**: header block shows both "Created" and "Updated" lines, formatted as ISO 8601 (or short date — match existing style). Today the header has `Updated: 2026-04-10` (manual); after this change it should read `Created: 2026-04-10` and `Updated: <derived ISO>`.
- [ ] **`docs-review-queue`** and any other CLI that surfaces dates: same treatment — read derived `updated`, never `settings.json → updated`.
- [ ] **Plugin skill reference** (`plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md`): replace the "issues have an `updated` field in `settings.json`" mental model with "issues have a derived `updated` date computed from git history; `created` comes from the folder slug; do not write `updated` into `settings.json`."
- [ ] **Plugin skill writing reference** (`writing.md` or wherever the skill explains issue authoring): drop the "remember to bump `updated` when editing" guidance. That advice no longer applies.

## Files likely touched

- `plugins/documentation-guide/scripts/issues/list.mjs`, `show.mjs`, `review-queue.mjs`, `_lib.mjs`.
- `plugins/documentation-guide/skills/documentation-guide/references/issue-layout.md`
- `plugins/documentation-guide/skills/documentation-guide/references/writing.md` (if it currently mentions the manual `updated` field).
