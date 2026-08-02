---
title: "Version bump — engine 0.1.3 + plugin 0.7.0"
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

## The versioning rule — simple, and it is Sid's

**`X.Y.Z`. Three things in play, one comparison:**

| | |
|---|---|
| the engine's current version | `ENGINE_VERSION` |
| the oldest document version it supports | `MIN_CONTENT_VERSION` |
| the document's own version | `engine_version` in `site.yaml` |

**The document's version must be ≥ the minimum.** That is the whole rule. All
three numbers compare, in order. There is no "only the first two count".

Which index moves is a judgement about the size of the change:

| Index | For |
|---|---|
| 1st (`0`) | reserved — beta versus production |
| 2nd | major upgrades |
| 3rd | smaller additions and fixes |

**This release:** the engine gets a new section reader and a comparator fix — a
small addition, so **`0.1.3`**. The plugin gets a rewritten agent-log model, a new
plans section and a new rule set — that is a major upgrade of the skills, so
**`0.7.0`**.

## What has to change in the code

`compareFormatVersions` currently ignores the third number:

```js
return aMaj - bMaj || aMin - bMin;              // today
return aMaj - bMaj || aMin - bMin || aPat - bPat;   // the fix
```

**Because of that, the gate has never once fired on a real migration.** Every
format change this repo shipped moved only the third number —
`0.1.0_done-to-state`, `0.1.1_state-to-status`, `0.1.2_legacy-custom-tags` — so
content sitting at `0.1.0` compares *equal* to a floor of `0.1.2` and passes.
`0.1.1_state-to-status.py` was a genuinely breaking value remap and was never
forced on anyone. The only thing this gate has ever caught is content with no
`engine_version` key at all.

Also delete the two places that assert the old rule, both from commit `e394b73`
(2026-07-03): the `engine-version.ts` docstring (*"bump ENGINE_VERSION minor"*)
and `user-guide/10_configuration/07_versioning.md:22` (*"a patch bump never
changes the content format"*).

**The floor stays the control.** Ship a bugfix as `0.1.4` and leave the floor at
`0.1.3` — content at `0.1.3` still passes. Fixing the comparator does not make
every bump mandatory; it makes the floor mean what it says.

## Correction — the plugin rule was mine, and it was wrong

An earlier draft said *"under this project's continuous-shipping convention that
is a minor bump."* **No such convention exists** — nothing documents plugin
versioning, and `plugin.json`'s `version` is read by nothing. That sentence was
invented and presented as inherited.

`0.7.0` is still right, but for the actual reason: the skills change is major.

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
