---
title: "The 0.2.0 release — engine, floor, migrations and the plugin"
status: done
agent: claude
---

# Goal

Ship the breaking release. Engine and floor to **`0.2.0`**, the three unreleased
migrations renamed onto the release version, every document that quotes a
version number brought back into line, and the gate **proved to fire** on
un-migrated content rather than assumed to.

Held all week on Sid's word — the bump was explicitly not part of the
long-running loop ([authority](../../../agent-memory/knowledge/authority-and-scope.md)).
He gave it on 2026-08-03: *"considering the changes on the feature additions, I
think it's safe to bump the feature to version 0.2.0 for engine and min version
required."*

# Inputs

- [the version-bump subtask](../../../subtasks/050_version-bump.md) — the plan,
  including the open question this round answers
- [`migration/README.md`](../../../../../../../migration/README.md) — the naming
  and chain convention
- [the audit's deferred item](./140_audit-brief.md) — *"`agent-ks` on PATH is a
  stale 0.6.7"*, whose fix is this release

# Expected Outcome

A release a consumer cannot half-adopt: old content stopped at startup with a
message that walks their AI through the chain, and this repo's own tree already
on the far side of it.

# Outcome

## The version, and the question it settles

The subtask carried an open question: `0.1.3` as originally written, or `0.1.4`
to match the last migration's filename. **Sid answered neither — `0.2.0`**, and
by the scheme's own rule that is the right call. The second place is for major
upgrades, and this release adds a section reader (plans), unifies the status
vocabulary across every file kind, moves status colours out of settings into
theme CSS, and renames the agent log's slot layout. Three of those four are
format changes with their own converters. That is not "small additions and
fixes".

| | Was | Now |
|---|---|---|
| `ENGINE_VERSION` | `0.1.2` | **`0.2.0`** |
| `MIN_CONTENT_VERSION` | `0.1.2` | **`0.2.0`** |
| `default-docs/config/site.yaml → engine_version` | `0.1.2` | **`0.2.0`** (set last) |
| `plugins/agent-ks/template/config/site.yaml` | `0.1.2` | **`0.2.0`** |
| plugin `version` | `0.6.7` | **`0.7.0`** |

**The floor equals the engine, deliberately.** Every format change in this
release is breaking: 0.1.x content declares agent-log statuses from a vocabulary
that no longer validates, may carry `statusColors` in tracker settings (now a
hard error), and names its agent-log slots `summary.md` / `working/` /
`debrief/` where the reader expects the numbered forms. None of that degrades —
it misreads — so there is no version between 0.1.2 and 0.2.0 that anything
should be allowed to sit at.

## The migrations were renamed onto the release version

`0.1.3_agent-log-status-vocabulary.py`, `0.1.3_status-colors-to-css.py` and
`0.1.4_agent-log-slot-numbering.py` are now all `0.2.0_*`.

**Why, in one line: no engine ever existed at 0.1.3 or 0.1.4**, so no content
tree could ever legitimately declare one, and the README's naming rule — *"the
engine version the script brings content to"* — was false for three of seven
scripts. They were drafted during this cycle against a bump that never happened.

Nothing about the consumer flow depended on it either way; a tree at 0.1.2 runs
everything in `(0.1.2, 0.2.0]` and gets the same three scripts under either
name. The gain is that a maintainer reading `migration/` can now tell which
release shipped what, which is the only question that listing answers.

**The cost, stated because it is real:** scripts sharing a version have no
defined order between them. Checked before renaming rather than assumed — all
three discover their own work by walking the tree (`rglob`), none consumes a
file list another produced, so they are order-independent by construction.
[`migration/README.md`](../../../../../../../migration/README.md) now states
that as a rule for future authors: *if a change depends on an earlier one having
run, it is not a sibling — it is the next version.*

Rejected: leaving the names alone and amending the README to explain why three
filenames name versions that never shipped. That is documenting an
inconsistency instead of removing it, and the explanation would have to be
re-read by every future maintainer.

## The gate fires — proved, not asserted

This is the part worth keeping. With the engine at `0.2.0` and `site.yaml` still
declaring `0.1.2`, `./start build` **stopped**:

```
This content targets engine 0.1.2, but this engine is 0.2.0 and supports content
0.2.0 or newer. The content must be migrated from 0.1.2 to 0.2.0 — ask your AI
to do it: the migration scripts live in migration/ at the repo root, named by
the version they bring content to. Run each script between 0.1.2 and 0.2.0 in
version order (detect pass, then --dry-run, then migrate), verify with agent-ks
check, then set engine_version: "0.2.0" in site.yaml.
```

**This is the first time in the project's history that the gate has refused real
content.** Every previous format change moved only the third place, and the
comparator discarded it — so `0.1.0` compared *equal* to a floor of `0.1.2` and
passed. The comparator fix landed earlier in this issue; this release is where
it first bites. `0.1.1_state-to-status.py` was a genuinely breaking value remap
and reached nobody.

Order was followed as the subtask specifies — code, then migrations, then the
constants, then run the chain, and **only then** the `site.yaml` declaration.
Bumping the declaration first would have made the gate silent about exactly the
thing it exists to catch.

## Running the chain on this repo's own tree

All three detects, against `default-docs/`:

| Script | Result |
|---|---|
| `0.2.0_agent-log-status-vocabulary.py detect` | nothing to migrate |
| `0.2.0_status-colors-to-css.py detect` | no `statusColors` blocks found |
| `0.2.0_agent-log-slot-numbering.py detect` | 0 slots to number, 0 link lines to rewrite; 24 legacy-shape logs skipped, history stays as written |
| `0.2.0_agent-log-slot-numbering.py verify` | exit 0 |

A zero-hit detect is a passed check, not a skipped script — this repo was
migrated as each converter shipped, so the chain re-run is the confirmation.

## Documents brought back into line

Every one of these quoted a version or a rule that the bump falsified. The two
gate messages were **generated from the code** rather than hand-edited, because
those blocks are quoted verbatim by contract:

| File | What was stale |
|---|---|
| `engine-version.ts` | bump-discipline paragraph said every migration had moved the third place; floor comment had no reason attached |
| `user-guide/10_configuration/07_versioning.md` | declaration example, both gate messages, and *"`ENGINE_VERSION` bumped (minor)"* |
| `dev-docs/30_versioning/01_overview.md` | the anchors table's `engine_version` example |
| `dev-docs/30_versioning/02_version-gate.md` | both verbatim messages |
| `dev-docs/30_versioning/03_minimum-version.md` | *"Bump `ENGINE_VERSION` (minor)"*, twice — the exact word the scheme is stated positionally to avoid |
| `dev-docs/30_versioning/04_migrations.md` | the `migration/` listing (four scripts, now seven), the chain example, and a missing migration class |
| `dev-docs/30_versioning/05_authoring-migrations.md` | *"(minor)"* in the shipping checklist |
| `plugins/.../references/settings-layout.md` | the `engine_version` example |
| `plugins/agent-ks/template/config/site.yaml` | new projects would have been scaffolded below the floor and stopped on first run |

`04_migrations.md` gained a **file / folder layout** migration class, which the
types table did not have: a change to where content files live or what they are
named, renames on disk plus every inbound link rewritten. That is what
`0.2.0_agent-log-slot-numbering.py` is, and it fit none of the three existing
rows.

## The plugin description, and a count that will not drift again

`plugin.json` → `0.7.0`, and the description rewritten: the plans section and
the numbered agent-log slots now appear, the CLI verb lists are current (they
were missing `new-iteration`, `new-plan`, `new-stage`, `new-subtask`,
`check legacy-tags` and `theme tokens`), and it states that **bun is required**
— the node fallback was removed this week and a consumer needs to know before
installing, not after.

**The advertised command count is gone rather than corrected.** It said 29;
`agent-ks help` lists 35; the marketplace repo's copy says 28. Three homes for
one number, which is this issue's own subject in miniature. The description now
points at `agent-ks help` for the live list. A number nothing checks was always
going to drift again.

> [!IMPORTANT]
> **Sid — the marketplace listing is yours.**
> `sids-plugin-marketplace/.claude-plugin/marketplace.json` carries its own copy
> of this description, advertising *"28 CLI commands"*, and it lives in a repo
> this session has no commit authority over. It needs the same treatment: the
> count dropped, the version at `0.7.0`. Worth deciding whether that description
> should be **generated** from `plugin.json` rather than maintained twice —
> small work, and the drift is now visible.

## Gates

| Gate | Result |
|---|---|
| `./start build` | **948 pages**, clean |
| `check issues` | 51 folders, 0 errors, 1 pre-existing warning (`2026-04-10-issues-layout/agent-log/exploration/`) |
| `check skill-links` | 3 skills, 44 files, clean |
| `verification/agent-log-slot-numbering/control.py` | all cases pass (re-run after the rename — it names the script by path) |
| `verification/agent-log-slot-numbering/legacy-detector-control.mjs` | all cases pass |
| `verification/plan-stage-alias/control.mjs` | 22/22 |

The sidebar-typography probe was **not** re-run: this change touches no UI, and
a probe re-run over an untouched surface is a green tick that means nothing.

## Found on the way — and not fixed here

`agent-ks check config` reports one error, and it is **pre-existing**, not from
this round:

```
✗ site.yaml pages.issues-test.data: resolved path does not exist
  (@data/issues-test → default-docs/data/issues-test)
```

`default-docs/data/issues-test` has no git history — it never existed in this
repo. The interesting half is that **the build does not care**: 948 pages built
green with a page entry pointing at a missing folder. A validator catches it, the
thing the validator is meant to protect does not. Tracked as
[`120`](../../../subtasks/120_config-page-missing-data-dir.md) rather than fixed
inline, because the fix is a judgement — delete the entry, or make the loader
refuse — and that is a decision, not a typo.
