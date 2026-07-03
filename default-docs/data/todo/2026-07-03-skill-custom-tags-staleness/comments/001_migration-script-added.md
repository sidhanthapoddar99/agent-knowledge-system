---
author: claude
date: 2026-07-03
---

# Follow-up — proper migration script added

Subtask 50 shipped `docs-guide check legacy-tags` (detector only; the rewrite
was documented but manual). The migration framework that landed right after
(`2026-07-03-docs-engine-versioning`) requires format changes to ship as
scripts — so the auto-migrating counterpart now exists:
`migration/0.1.2_legacy-custom-tags.py` (detect / locate / migrate `--dry-run`;
callout→GFM alert with type+title mapping, collapsible→`<details>`,
tabs→`###` sections; mention/fence/frontmatter-aware; verified idempotent on a
fixture, dogfood tree detects clean).
