---
title: "Feature matrix — PRE-EDIT (baseline)"
---

# Feature matrix — PRE-EDIT baseline

> **This is the PRE-EDIT feature matrix** — the toolkit's state *before* the consolidation loop runs. It is the baseline we measure against. The **POST-EDIT** counterpart, recreated with updated ✅/➕ values once the loop completes, lives in [`05_post-edit-feature-matrix.md`](05_post-edit-feature-matrix.md). Do **not** edit this file during the loop — it's the frozen "before" snapshot.

The toolkit's features fall into categories by *how much they share*. **Category 0** (added during the landscape review — see [`04_cli-landscape-and-category-0.md`](04_cli-landscape-and-category-0.md)) is the shared contract every command speaks. Categories 1–3 are about what a command *does*, scored across content types; **Config** is a 4th tooling target (validation/settings only).

This matrix is about **what we *should* have**, scored against what exists today. Legend:

- ✅ should have — **and exists today**
- ➕ should have — **gap, doesn't exist yet**
- ⚠️ exists in code but **not wired to a command**
- — not applicable

---

## Category 0 — Shared contract + toolkit-level meta (common to ALL commands)

Cross-cutting; scored by *coverage across the command surface* rather than by content type. This is the substrate beneath Categories 1–3.

| Contract element | Pre-edit coverage |
|---|---|
| `--help` | ⚠️ all commands have it, but text is hand-written per script & printed to **stderr** (validators/issues) vs **stdout** (move/img) |
| `-h` short flag | ⚠️ honored by only ~5 of 14 commands (`list`, `move`, `img`, the `check.*` literals); broken on 8/9 issues commands |
| `--json` output | ⚠️ list/show/subtasks/agent-logs/review-queue only; **no validator, no move, no img** |
| Uniform exit codes (0 ok / 1 err·no-match / 2 usage) | ⚠️ `list` 0/1/2; validators 0/1; `review-queue` always 0 |
| Shared error/report format | ⚠️ only `reportAndExit` (the 4 validators); everything else ad-hoc |
| **`help` / discovery command** (list all commands) | ➕ none — `cli.mjs` has no `--help`; catalogue only leaks as an error |
| **Machine-readable manifest** (`help --json`) | ➕ none |
| Shared arg-parser across domains | ➕ `parseArgs` exists but trapped in `issues/_lib`; 5 non-issues scripts hand-roll 3 ways |

---

## Category 1 — Common name **and** common code (type-agnostic file ops)

One implementation, runs on any content regardless of schema. The "move / images" class.

| Feature | Docs | Blog | Issues | Config |
|---|:--:|:--:|:--:|:--:|
| **move** (link-aware move/rename) | ✅ | ✅ | ✅ | — |
| **img** (optimize images + rewrite links) | ✅ | ✅ | ✅ | — |
| **find** (generic path + raw-text search, no schema) | ➕ | ➕ | ➕ | ➕ |
| **link-check** (broken / orphan internal links) | ➕ | ➕ | ➕ | — |

`find` is the unified cross-content search discussed below — it belongs here because path + raw-text grep is genuinely schema-agnostic.

---

## Category 2 — Common name, **type-specific code** (same verb, per-type impl)

Shared vocabulary, different engine per type. A shared core lib can back all three implementations.

| Feature | Docs | Blog | Issues | Config |
|---|:--:|:--:|:--:|:--:|
| **list** | ➕ | ➕ | ✅ | — |
| **show** | ➕ | ➕ | ✅ | — |
| **search** (schema/field-aware filter) | ➕ | ➕ | ✅ | — |
| **check / validate** | ✅ | ✅ | ⚠️ | ✅ |
| **settings** (view/set settings.json or frontmatter meta) | ➕ | — | ➕ | ✅ |
| **new / create** (scaffold an item) | ✅* | ➕ | ➕ | — |

\* docs scaffolding exists only as the `/docs-add-section` slash command, not a CLI wrapper.

**Two gaps this row exposes:**
- **issues `check` is orphaned** — `scripts/issues/check.mjs` exists but isn't in the `COMMANDS` map (no `docs-check-issues` bin).
- **docs/blog have no list/show/search at all** — the root cause of the search failure that prompted this issue.

---

## Category 3 — Type-specific (unique commands, no cross-type analogue)

| Feature | Docs | Blog | Issues | Config |
|---|:--:|:--:|:--:|:--:|
| **subtasks** (list/manage) | — | — | ✅ | — |
| **agent-logs** (list/append) | — | — | ✅ | — |
| **add-comment** | — | — | ✅ | — |
| **set-state** (issue + subtask) | — | — | ✅ | — |
| **review-queue** | — | — | ✅ | — |
| **add-section** (scaffold section) | ✅* | — | — | — |
| **renumber** (re-space `NN_` prefixes) | ➕ | — | — | — |
| **vocabulary** (manage root `settings.json` vocab) | — | — | ➕ | — |

Category 3 is almost entirely **issues**, plus a little **docs**. That asymmetry is real and fine — issues genuinely carry the richest schema.

---

## Proposed search-scoping flags (the original trigger)

Three small additions to the issue search engine (`docs-list`, or whatever `search` becomes), discussed before the wider matrix:

1. **`--path <regex>`** — search the path / filename text (folder slugs and note paths are descriptive; absorbs an earlier "search title only" idea).
2. **`--meta <regex>`** — search only the structured layer: **all** YAML frontmatter + **all** JSON, across every file. A *vertical* cut, distinct from `--search-fields` (which picks a *horizontal* file category).
3. **`--count`** — matches + titles only, no per-line excerpt dump (so a broad query degrades to a summary instead of flooding output).

Rejected: `--depth N` and `--group-by-depth` — a numeric depth is a vaguer proxy for `--search-fields`, which already names the buckets meaningfully.
