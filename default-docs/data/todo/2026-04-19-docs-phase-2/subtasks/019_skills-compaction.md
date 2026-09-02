---
title: "agent-ks-docs + agent-ks-issues skills — compact and dedupe"
status: review
---

# Overview

Make the two skills lean. Every rule gets one home. Other files link to it. Stale facts get fixed. History asides get deleted.

Trigger: Sid asked for an analysis of both skills on 2026-09-02, then chose the "tidy plus dedupe" option.

# References

- The two skills: `plugins/agent-ks/skills/agent-ks-docs/` and `plugins/agent-ks/skills/agent-ks-issues/`.
- The rule that skills are history-free: repo `CLAUDE.md`, section "Skills are lean and history-free".
- Status vocabulary in code: `astro-doc-code/src/loaders/issue-status.ts`. Eight statuses. Plans and stages accept all eight. Runs accept five.

# Todo list

- [x] Fix stale facts
  - [x] "7 statuses" → 8 in three files
  - [x] Closed category names `superseded` everywhere it lists `done` / `dropped`
  - [x] Plans and stages accept `superseded`; removed the "dropped plus pointer" wording
  - [x] Removed the three "Status: stub" notes
  - [x] `./start` no longer runs a sanity build; fixed the two places that said it does
  - [x] Blog frontmatter example drops `cover` (nothing reads it)
- [x] Deleted history asides (six in the issues skill, one in `cli-toolkit.md`)
- [x] One home per rule
  - [x] Link rule and ordering label → `agent-ks-docs/references/writing.md#linking`
  - [x] Markdown mechanics → `writing.md` only
  - [x] Project tree and two modes → `settings-layout.md` §1 only
  - [x] Lifecycle, closing authority, AI rules → `00_overview.md` only
  - [x] Agent-log trigger and floor → `24_agent-logs.md` only; `SKILL.md` keeps the short box
  - [x] Command table → `cli-toolkit.md` only
  - [x] Haiku subagent patterns → `41_searching.md` only
- [x] Both `SKILL.md` files are now a map plus the must-know rules
- [x] Gates pass: `agent-ks-dev check skill-links`, `agent-ks-dev check issues`

# Outcomes and Next Steps

Nineteen skill files changed. Not committed; the working tree holds the diff.

| File | Before (words) | After (words) |
|---|---|---|
| `agent-ks-docs/SKILL.md` | 2,522 | 1,109 |
| `agent-ks-docs/references/*` | 10,863 | 9,840 |
| `agent-ks-issues/SKILL.md` | 4,355 | 2,233 |
| `agent-ks-issues/references/*` | 26,903 | 23,557 |

Verified:
- `agent-ks-dev check skill-links` — all checks passed, 44 files scanned, repo source tree.
- `agent-ks-dev check issues` — no errors.
- Grep for the stale strings ("canonical 7", "Status: stub", "earlier version", "Sync note", "sanity build") returns nothing. "true on disk" now appears in one file.

Deferred:
- `24_agent-logs.md` is still ~830 lines. The worked examples and the index-honesty section stay, because they are the instances the rule needs. A further cut is a separate decision.
- The installed plugin cache is frozen at the last release. It picks these changes up at the next release, per the normal flow.
- Repo `CLAUDE.md` still describes the issues skill as carrying "its own tracker-flavoured writing reference". That is still true of `10_writing.md`, so no change was made.

Next: Sid reviews the diff, then commits. Closing this subtask is Sid's.

# Details

## Decision: the writing mirror is dropped

`agent-ks-issues/references/10_writing/10_writing.md` carried a full copy of the markdown mechanics from `agent-ks-docs/references/writing.md`, with a sync note. The copy is gone. `10_writing.md` now holds only the tracker-specific rules and links to `writing.md` for the mechanics.

Reason. The issues skill already linked into the docs skill in four places (images, settings, the CLI reference, artifacts). So "self-contained" was not true before this change. A second copy costs a sync rule that nobody runs, and the two copies had already drifted. One home is cheaper and cannot drift.

Cost. An agent working in the tracker that needs callout or diagram syntax must open one file in the sibling skill. The link is relative and checked by `agent-ks check skill-links`.

## Decision: the `docs-*` legacy names section is deleted

`cli-toolkit.md` and the docs `SKILL.md` explained that flat `docs-<name>` binaries once existed and should be rewritten when found. That is history. The skill rule says history lives in git and the tracker, so both mentions are deleted. If a consumer project still carries old names, `agent-ks help` shows the current form.

## Decision: the link rule lives in the docs skill, not the issues skill

The analysis reply proposed `10_writing.md` as the home. The docs skill's `writing.md` won instead, because the rule applies to every content type and the issues skill already points into the docs skill. The ordering-label spec moved with it. `10_writing.md` keeps only the tracker deltas: tracker URLs keep prefixes, `Related:` lines, the type glyph.

## Where each rule now lives

| Rule | Home |
|---|---|
| Relative links, link not path, ordering label | `agent-ks-docs/references/writing.md` → Linking |
| Callouts, collapsibles, diagrams, assets, `[[path]]` embedding | `agent-ks-docs/references/writing.md` |
| Project tree, consumer vs dogfood mode | `agent-ks-docs/references/settings-layout.md` §1 |
| Every CLI command and flag | `agent-ks-docs/references/cli-toolkit.md` |
| Lifecycle, `superseded`, closing authority, AI rules | `agent-ks-issues/references/00_anatomy/00_overview.md` |
| When an agent log opens | `agent-ks-issues/references/20_sections/24_agent-logs.md` |
| Haiku subagent patterns | `agent-ks-issues/references/40_operations/41_searching.md` |
