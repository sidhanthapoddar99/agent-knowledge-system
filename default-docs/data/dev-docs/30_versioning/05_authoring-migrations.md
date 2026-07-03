---
title: Authoring Migrations
description: Writing, testing, and shipping a new migration script
sidebar_position: 5
---

# Authoring Migrations

Every engine change that alters the content format ships with a migration
script — **the change does not exist until its script does.** That covers all
three migration types (frontmatter/field, settings schema, **content syntax**
— see [Migrations § Types](./migrations)); the syntax class is the one
historically skipped, so check for it explicitly. This page is the maintainer's
authoring guide.

## The script contract

- **Python, stdlib only.** Migrations are one-off runs, not part of the live
  `.mjs` validator/CLI path — no dependency management, runnable anywhere.
- **Self-documenting.** The module docstring is the runbook: what the change
  is, why it happened, exactly how to run the script, and the authoring date.
  Nothing else enumerates migrations — the docstring is the source of truth.
- **Detect + migrate in one file:**
  - *Detect* (default or explicit mode): read-only; report whether migration is
    needed and where — file + line for every legacy instance.
  - *Migrate*: supports `--dry-run` (report what would change, write nothing)
    and is **idempotent** — re-running after success finds zero instances and
    is a no-op.

`0.1.1_state-to-status.py` is the reference shape for the detect / dry-run /
verify mode set.

## Skeleton

```python
#!/usr/bin/env python3
"""Migrate <old thing> to <new thing>.

Authored: YYYY-MM-DD. Brings content to the engine version in this filename.

<Why the format changed, what exactly is rewritten, edge cases.>

Usage:
    python3 migration/0.2.0_example.py <content-root>            # detect
    python3 migration/0.2.0_example.py <content-root> --dry-run  # preview
    python3 migration/0.2.0_example.py <content-root> --migrate  # apply
"""
```

## Shipping checklist

1. **Name it** `<new-engine-version>_<statement>.py` in repo-root `migration/`.
2. **Test the trio** against a fixture tree: detect finds the planted
   instances; `--dry-run` matches expectations; migrate → re-detect reports
   zero; a second migrate is a no-op.
3. **Run it on the dogfood content** (`default-docs/`) — the framework's own
   tree migrates in the same release that changes the format.
4. **Bump `ENGINE_VERSION`** (minor) in `src/loaders/engine-version.ts`.
5. **Decide the floor** honestly (see [Minimum Version](./minimum-version)):
   breaking → raise `MIN_CONTENT_VERSION`; good-to-have → leave it.
6. **Document**: docstring complete; user-guide versioning page and CLAUDE.md
   contract paragraph still accurate; this section updated if the mechanics
   changed.
7. `site.yaml` in the dogfood config and the `/docs-init` template bump their
   `engine_version` to match.

> [!TIP]
> Write the detect pass first and run it before designing the rewrite — the
> real-world instance count and shapes it finds usually simplify (or correct)
> the migration you thought you needed.
