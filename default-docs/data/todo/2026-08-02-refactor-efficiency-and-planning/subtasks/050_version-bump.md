---
title: "Version bump — engine 0.2.0 (gated) + plugin 0.7.0"
status: open
---

# Overview

Ship the issue as a **breaking** release. Two independent versions must move, and
only one of them can force a consumer to act.

**Done when** the engine version and floor are raised, the plugin version and
marketplace listing match reality, and a consumer on the old content format is
**stopped at startup** with a message that walks them through the migration.

# References

- The migration script this pairs with:
  [`100`](./040_execution/100_migration-script.md) — must ship together
- Everything under [Execution](./040_execution/00_overview.md) must land first
- Engine gate: `astro-doc-code/src/loaders/engine-version.ts`
- Plugin version: `plugins/agent-ks/.claude-plugin/plugin.json`
- Marketplace listing (separate repo):
  `sids-plugin-marketplace/.claude-plugin/marketplace.json`
- Convention: `migration/README.md`

# Todo list

- [ ] `ENGINE_VERSION` `0.1.2` → **`0.2.0`** — a MINOR bump; see why a patch
      cannot work, below
- [ ] `MIN_CONTENT_VERSION` `0.1.2` → **`0.2.0`** — this is what makes upgrading
      mandatory
- [ ] `default-docs/config/site.yaml` → `engine_version: "0.2.0"` — **last**,
      after the migration runs, never first
- [ ] Bump `plugin.json` → `0.7.0`, and update its `description`
- [ ] Sync the marketplace listing (drift note below)
- [ ] Smoke-test the gate: point the engine at un-migrated content and confirm it
      **stops** with the migration message rather than rendering
- [ ] Smoke-test a real consumer upgrade end to end
- [ ] Verify the CLI verb count in the description against `agent-ks help`

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## There are TWO versions, and only one of them gates anything

Measured 2026-08-02. Conflating them is the easy mistake here.

| Version | Where | Covers | Gates a consumer? |
|---|---|---|---|
| **Plugin** `0.6.7` | `plugins/agent-ks/.claude-plugin/plugin.json` | the skills + the `agent-ks` CLI | **No.** Nothing checks it. A stale plugin just gives stale instructions |
| **Engine** `0.1.2` | `ENGINE_VERSION` in `engine-version.ts` | the **content format** | **Yes**, together with `MIN_CONTENT_VERSION` |

Content declares `engine_version` in `site.yaml`; `loadSiteConfig()` throws at
startup when it falls outside `[MIN_CONTENT_VERSION, ENGINE_VERSION]`. **That
error is the only mechanism in this project that can force a consumer to act.**

## A +0.0.1 patch bump CANNOT be made mandatory — by design

From `compareFormatVersions` in `engine-version.ts`:

> *"Numeric per-segment comparison on **major.minor ONLY** — a patch bump never
> changes content format by definition, so it never trips the gate."*

So `0.1.2 → 0.1.3` is invisible to the gate no matter what `MIN_CONTENT_VERSION`
is set to. **Making the upgrade mandatory requires a minor bump: `0.2.0`.** That
is not a scope increase — it is the smallest bump the mechanism can enforce.

The repo's own rule agrees on when to raise the floor:

> *"Raise `MIN_CONTENT_VERSION` ONLY for breaking changes (old content
> fails/misrenders without the migration)."*

This qualifies — see [`100`](./040_execution/100_migration-script.md): **78 files
in this repo alone** carry status values the new vocabulary rejects.

## Why the plugin still goes to 0.7.0, not 0.6.8

The plugin version gates nothing, so it does not need to be minimal — it needs to
be **honest**. Consumers must act on this release: run a migration, stop using
`new-memory-plan`, relearn the agent-log shape. Shipping that as a patch would be
a false signal even though nothing enforces it.

## The marketplace description has already drifted

Grepped 2026-08-02: `0.6.7` appears **once** in this repo — good, nothing to
chase. But the marketplace repo carries its own copy of the long description, and
it advertises *"28 CLI commands"* where `plugin.json` says *29*, while
`agent-ks help` lists 33.

**This is the audit's own finding in miniature — a fact with two homes drifts,
and nobody notices.** Worth deciding whether the marketplace description should
be generated from `plugin.json` rather than maintained twice. Small work,
permanent payoff, and this is when the drift becomes visible.

## Order matters, and getting it wrong hides the breakage

1. Land the code.
2. Ship the migration script.
3. Raise `ENGINE_VERSION` and `MIN_CONTENT_VERSION`.
4. Run the migration on this repo's own `default-docs/`.
5. **Only then** set `engine_version: "0.2.0"` in `site.yaml`.

Bumping `site.yaml` first defeats the gate's purpose — it tells the engine the
content is already migrated when it is not, and moves the breakage somewhere
nothing points at it.
