---
title: "Version bump — engine 0.2.0 + plugin 0.7.0"
status: done
---

# Overview

Ship the issue as a **breaking** release. Two independent versions must move, and
only one of them can force a consumer to act.

**Done when** the engine version and floor are raised, the plugin version and
marketplace listing match reality, and a consumer on the old content format is
**stopped at startup** with a message that walks them through the migration.

> [!NOTE]
> **Answered 2026-08-03 — the version is `0.2.0`.** Not `0.1.3`, not `0.1.4`.
>
> The release carries a second content-format change beyond the status
> vocabulary: the agent log's three slots gained numeric prefixes and the
> child-log rule became a prefix comparison
> ([the numbering spec](../notes/80_agent-log-numbering-spec.md)), shipped by
> [number the agent log's own slots](./080_presentation-and-numbering/030_agent-log-slot-numbering.md) with its
> own converter. Two breaking changes behind one gate is what the gate is for;
> splitting them stops the same consumer twice.
>
> The open question was `0.1.3` versus `0.1.4` — a floor below the last
> migration is a gate that lets un-migrated content through. **Sid answered
> `0.2.0`**, which settles it from above and matches the scheme's own rule: the
> second place is for major upgrades, and this release ships a new section
> reader, one status vocabulary across every file kind, status colours moved to
> theme CSS, and a renamed slot layout. Three of those four have converters.
>
> The three migrations were then renamed onto the release version, so no script
> names a version no engine ever had. Reasoning and the rejected alternative:
> [the release iteration file](../agent-log/020_wf_ship-the-split/02_working/150_version-bump.md).

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

- [x] **`compareFormatVersions` must compare the PATCH segment.** Without this
      the floor below does nothing — see *The gate has never fired*, first
- [x] `ENGINE_VERSION` `0.1.2` → **`0.2.0`**
- [x] `MIN_CONTENT_VERSION` `0.1.2` → **`0.2.0`** — with the comparator fixed,
      this is what makes upgrading mandatory
- [x] Fix the doc claims that say a patch bump cannot change the format:
      `engine-version.ts` docstring, `user-guide/10_configuration/07_versioning.md`,
      and `dev-docs/30_versioning/` (three sites, all saying *"(minor)"*)
- [x] Rename the three unreleased migrations onto the release version —
      `0.1.3_*` / `0.1.4_*` → `0.2.0_*`, plus every live reference to them
- [x] `default-docs/config/site.yaml` → `engine_version: "0.2.0"` — **last**,
      after the migration runs, never first
- [x] Bump `plugin.json` → `0.7.0`, and update its `description`
- [ ] **Sync the marketplace listing** — separate repo, no commit authority here.
      Sid's, see below
- [x] Smoke-test the gate: point the engine at un-migrated content and confirm it
      **stops** with the migration message rather than rendering
- [ ] Smoke-test a real consumer upgrade end to end — needs a second checkout in
      consumer mode; not done, and the dogfood tree is not a substitute
- [x] Verify the CLI verb count in the description against `agent-ks help` —
      it was wrong (29 vs 35); the count was **removed** rather than corrected
- [x] Write the release note and set the tag convention (new this round —
      [`releases/`](../../../../../releases/README.md))

# Outcomes and Next Steps

**Shipped 2026-08-03.** Engine `0.2.0`, floor `0.2.0`, plugin `0.7.0`, content
declaration `0.2.0`, and the three migrations renamed onto the release version.
The blow-by-blow — including the migration-rename decision and what it cost — is
[the release iteration file](../agent-log/020_wf_ship-the-split/02_working/150_version-bump.md).

**The gate was proved, not assumed.** With the engine at `0.2.0` and `site.yaml`
still declaring `0.1.2`, `./start build` stopped with the full migration runbook.
That is the **first time this gate has ever refused real content** — every
previous format change moved only the third place, which the old comparator
discarded.

Gates after the bump: build **948 pages** clean · `check issues` 51 folders, 0
errors, 1 pre-existing warning · `check skill-links` clean · all three control
harnesses pass.

## Left for Sid

- **The marketplace listing** — `sids-plugin-marketplace/.claude-plugin/marketplace.json`
  still advertises *"28 CLI commands"* and the old version. Separate repo, no
  commit authority from this session. Worth deciding whether that description
  should be **generated** from `plugin.json` instead of maintained twice.
- **A real consumer upgrade, end to end** — needs a second checkout in consumer
  mode with 0.1.x content. The dogfood tree cannot stand in for it: it was
  migrated as each converter shipped, so its chain run is a re-run, not a first
  run.
**Done 2026-08-03, on Sid's word:** the branch was fast-forwarded into `main` and
pushed (37 commits), and **all four releases are published** — `v0.1.0`,
`v0.1.1`, `v0.1.2` at their historical commits and `v0.2.0` at the tip, which is
correctly the only one marked Latest.

`v0.2.0` went through the workflow end to end — its first real run, green, body
byte-identical to `releases/0.2.0.md`. The three retro ones were published with
`gh release create --latest=false`, because **a workflow triggered by a tag runs
the workflow file as it exists at the tagged commit** — and June/July commits
have no `.github/workflows/`, so pushing those tags fires nothing. Worth knowing
before anyone assumes an old tag will self-publish.

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

**This release — and the draft above got it wrong.** It read the engine change as
"a new section reader and a comparator fix", which is a small addition, and
proposed `0.1.3`. That undercounted: the release also unifies the status
vocabulary across every file kind, moves status colours out of tracker settings
into theme CSS, and renames the agent log's slot layout — three content-format
changes with three converters, on top of the new reader. That is a major upgrade,
so **`0.2.0`**, and Sid called it as such. The plugin gets a rewritten agent-log
model, a new plans section and a new rule set — major on that side too, so
**`0.7.0`**.

Worth keeping as a lesson about this scheme: **the size of a version bump is
judged from what a consumer must do, not from how much code moved.** Four
migrations' worth of consumer work is not a third-place change however small the
diff looks.

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

**The floor stays the control.** Ship a bugfix as `0.2.1` and leave the floor at
`0.2.0` — content at `0.2.0` still passes. Fixing the comparator does not make
every bump mandatory; it makes the floor mean what it says.

**Both were done, and the gate then fired for real** — the build refused content
declaring `0.1.2` with the full runbook message. That confirmation is the point:
a comparator fix nobody exercises is indistinguishable from the bug.

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

**Resolved 2026-08-03, by removal.** Re-counted at bump time the number had moved
again — 35 verbs, against 29 claimed. Correcting it would have bought one
accurate number and the same drift a week later, so **the count is gone from
`plugin.json` entirely** and the description points at `agent-ks help` for the
live list. Nothing in this repo now states a countable claim about the CLI. The
marketplace copy still does, and it is Sid's to change.

## Order matters, and getting it wrong hides the breakage

1. Land the code.
2. Ship the migration script.
3. Raise `ENGINE_VERSION` and `MIN_CONTENT_VERSION`.
4. Run the migration on this repo's own `default-docs/`.
5. **Only then** set `engine_version: "0.2.0"` in `site.yaml`.

Bumping `site.yaml` first defeats the gate's purpose — it tells the engine the
content is already migrated when it is not, and moves the breakage somewhere
nothing points at it.

**Followed exactly, and step 3-before-5 is what produced the proof.** Between
raising the constants and setting the declaration there is a window where this
repo's own content is, by its own declaration, un-migrated — so the build in
that window is the smoke test, for free and against real content rather than a
fixture.
