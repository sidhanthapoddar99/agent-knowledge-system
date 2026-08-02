---
title: "Version bump — engine 0.1.3 (gated) + plugin 0.6.8"
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

- [ ] **`compareFormatVersions` must compare the PATCH segment.** Without this
      the floor below does nothing — see *The gate has never fired*, first
- [ ] `ENGINE_VERSION` `0.1.2` → **`0.1.3`**
- [ ] `MIN_CONTENT_VERSION` `0.1.2` → **`0.1.3`** — with the comparator fixed,
      this is what makes upgrading mandatory
- [ ] Fix the two doc claims that say a patch bump cannot change the format:
      `engine-version.ts` docstring, and
      `user-guide/10_configuration/07_versioning.md:22`
- [ ] `default-docs/config/site.yaml` → `engine_version: "0.1.3"` — **last**,
      after the migration runs, never first
- [ ] Bump `plugin.json` → `0.6.8`, and update its `description`
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

## The versioning scheme — Sid's, and it is the one to follow

Stated 2026-08-02:

| Index | Means |
|---|---|
| 1st (`0`) | **Reserved** — beta versus production. Stays `0` while the project is in beta |
| 2nd | Major upgrades |
| 3rd | Smaller tweaks and bug fixes |

**Every format migration this repo has ever shipped followed it** —
`0.1.0_done-to-state` → `0.1.1_state-to-status` → `0.1.2_legacy-custom-tags`.
Three patch bumps, no minor bump, ever.

So this release is **`0.1.3`**, and the plugin is **`0.6.8`**.

## THE GATE HAS NEVER FIRED — the finding that makes this work

`compareFormatVersions` compares **major.minor only**:

```js
return aMaj - bMaj || aMin - bMin;   // patch is not compared
```

Two docs assert this is correct by definition — the `engine-version.ts` docstring
(*"bump ENGINE_VERSION minor"*) and
`user-guide/10_configuration/07_versioning.md:22` (*"a patch bump never changes
the content format"*).

**But every actual migration was a patch bump, so none of them were ever
enforced.** Content declaring `0.1.0` compares *equal* to a floor of `0.1.2`, so
`0.1.1_state-to-status.py` — a genuinely breaking value remap — was never once
forced on a consumer. The only thing this gate has ever caught is content with no
`engine_version` at all (`0.0.0`).

The written rule and the shipped practice have disagreed since the contract was
introduced, and the practice is the one that is right.

**So the comparator is what changes**, not the version number:

```js
return aMaj - bMaj || aMin - bMin || aPatch - bPatch;
```

**This does not make every patch bump mandatory.** `MIN_CONTENT_VERSION` remains
the control: ship a genuine bugfix as `ENGINE_VERSION` `0.1.4`, leave the floor
at `0.1.3`, and content at `0.1.3` still passes. The change only makes the floor
*capable* of being set at patch granularity — which is the granularity every real
migration has used.

Raising the floor is justified here by the repo's own rule — *"ONLY for breaking
changes (old content fails/misrenders without the migration)"* — and
[`100`](./040_execution/100_migration-script.md) counts **78 files in this repo
alone** carrying status values the new vocabulary rejects.

## Correction — the plugin "minor bump" rule was never a convention

An earlier draft of this subtask said *"under this project's continuous-shipping
convention that is a minor bump"* and put the plugin at `0.7.0`. **There is no
such convention.** Nothing in the repo, the skills or the user-guide documents
plugin versioning; `plugin.json` carries a `version` field that nothing reads.
That sentence was invented and presented as inherited.

Under the scheme above this release is a 3rd-index bump: **`0.6.8`**.

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
5. **Only then** set `engine_version: "0.1.3"` in `site.yaml`.

Bumping `site.yaml` first defeats the gate's purpose — it tells the engine the
content is already migrated when it is not, and moves the breakage somewhere
nothing points at it.
