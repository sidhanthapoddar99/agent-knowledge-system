---
title: "Migration playbook — moving the 30 existing projects from full-clone to thin-shell"
state: open
---

Once subtasks 01-05 land, the engine ships as a package. But the 30 existing docs projects are still full clones. Each needs a one-time migration.

## What "migrated" means per project

Before:
```
my-docs/
├── src/                           ← full copy of the engine
├── astro.config.mjs               ← project-coupled, references src/
├── package.json                   ← Astro + every transitive dep
├── dynamic_data/                  ← the only unique part
├── .env
└── node_modules/                  ← bloated
```

After:
```
my-docs/
├── astro.config.mjs               ← 5 lines
├── package.json                   ← peer-dep on Astro, dep on documentation-template
├── dynamic_data/                  ← unchanged
├── .env                           ← unchanged
└── node_modules/                  ← lean
```

`src/` is gone. Everything that was in it now resolves through the package.

## Playbook structure

A short markdown doc the project owner runs through. Should fit on one screen + a code block. Suggested location: the engine repo's `dynamic_data/data/user-guide/30_migration/` (or wherever the user-guide ends up after the engine repo restructure).

Steps roughly:

1. **Backup** — `git checkout -b pre-migration-backup && git push`
2. **Delete the engine bits** — `rm -rf src/ astro.config.mjs package.json package-lock.json bun.lockb node_modules/`
3. **Re-init `package.json`** with the dep on `documentation-template` and the right Astro peer
4. **Drop in the new minimal `astro.config.mjs`** (provide the exact 5 lines)
5. **`bun install`**
6. **`bun run dev`** — verify the site loads with the same content as before
7. **Diff check** — `astro build` and visually diff the dist HTML against the pre-migration build for any regression

## Edge cases to call out in the playbook

- **Custom layouts** in `dynamic_data/themes/<name>/layouts/` — these still work post-migration (consumer-owned), just verify the override mechanism still resolves
- **Custom themes** with non-standard CSS imports — same: consumer-owned, but check the path resolution still finds them
- **Local patches** to engine source — if the project owner has hand-edited `src/loaders/...` for a one-off fix, the migration **drops the patch**. Surface this loudly: ask them to identify any local engine edits before migration; either upstream them or skip migration for that project
- **`.env` differences** — the engine reads the same env var names, but some may move. Document the diff if any
- **Astro version pinning** — the consumer's `package.json` should pin Astro to whatever the engine's peer dep declares; surface any mismatch

## Order of migration

Don't migrate all 30 at once. Suggested cohorts:

1. **One pilot** — pick the simplest, most-recently-updated project. Migrate, run for a week. Capture pain points; iterate the playbook.
2. **Three more** of varying complexity. Refine the playbook again.
3. **The rest** — by then the playbook is sharp; can be done in batches.

## Acceptance

- Migration playbook written, ≤200 lines, includes the exact commands and the diff-check step
- Edge cases (customisations, patches, env) explicitly documented
- Pilot migration done — one project moved successfully, playbook updated based on what surprised
- Per-project migration tracking — light table somewhere (a comment on this subtask, or a notes/ doc) listing which of the 30 are migrated

## Out of scope

- Automated migration tooling (a `documentation-template migrate` CLI). If the manual playbook proves painful at scale, consider it then; until then, manual + grep is fine.
- Changes to `dynamic_data/` shape during migration. The migration is a *distribution* change; content stays as-is.
