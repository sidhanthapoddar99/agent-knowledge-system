---
title: "Feature matrix — POST-EDIT (shipped)"
---

# Feature matrix — POST-EDIT (shipped)

> **POST-EDIT counterpart** to the frozen baseline in [`01_feature-matrix.md`](01_feature-matrix.md). Every cell below is re-scored against the **shipped** state — verified by running `docs help`, the commands, the validators, and the self-test harness (**117/117 green under bun**), not assumed. The toolkit went from **13 → 28 commands** behind a single manifest-driven dispatcher.

Legend (same as pre-edit):

- ✅ should have — **and exists today**
- ➕ should have — **gap, doesn't exist yet** (→ deferred follow-up)
- ⚠️ exists in code but **not wired to a command**
- — not applicable

---

## Category 0 — Shared contract + toolkit-level meta (common to ALL commands)

| Contract element | Pre-edit | Post-edit |
|---|---|---|
| `--help` | ⚠️ hand-written per script, stderr vs stdout split | ✅ central interceptor in `cli.mjs`, **generated from the manifest**, always stdout + exit 0 |
| `-h` short flag | ⚠️ ~5 of 14 commands | ✅ every command (same central interceptor) |
| `--json` output | ⚠️ 5 issue commands only | ✅ every data command + validators + `docs help`; sync-write so large payloads aren't truncated |
| Uniform exit codes (0 ok / 1 err·no-match / 2 usage) | ⚠️ inconsistent | ✅ uniform; `127` added for missing polyglot interpreter |
| Shared error/report format | ⚠️ `reportAndExit` (validators only) | ✅ `_cli.mjs` (`parseArgs`/`emitJson`/`writeStdout`/`die`/`usageError`) + `reportAndExit` `--json` |
| **`help` / discovery command** | ➕ none | ✅ `docs help` (grouped) + `docs help <command>` (flags) |
| **Machine-readable manifest** (`help --json`) | ➕ none | ✅ `docs help --json` dumps `_manifest.mjs` |
| Shared arg-parser across domains | ➕ trapped in `issues/_lib`, 5 hand-rolled variants | ✅ lifted to `_cli.mjs`; issues re-export it; new scripts import it |
| **(new) project-context handoff for non-JS** | — | ✅ `docs resolve-context` (KEY=value / `--json`) |
| **(new) written contract spec** | — | ✅ `scripts/CONTRACT.md` |

**Category 0: fully closed.** Every ⚠️/➕ flipped to ✅, plus two net-new contract elements (resolve-context, CONTRACT.md).

---

## Category 1 — Common name **and** common code (type-agnostic file ops)

| Feature | Docs | Blog | Issues | Config |
|---|:--:|:--:|:--:|:--:|
| **move** (link-aware move/rename) | ✅ | ✅ | ✅ | — |
| **img** (optimize images + rewrite links) | ✅ | ✅ | ✅ | — |
| **find** (generic path + raw-text search, no schema) | ✅ | ✅ | ✅ | ✅ |
| **git updated / changed / log** (git-derived metadata) | ✅ | ✅ | ✅ | ✅ |
| **git commit** (guarded, scoped, never pushes) | ✅ | ✅ | ✅ | ✅ |
| **link-check** (broken / orphan internal links) | ➕ | ➕ | ➕ | — |

**find shipped** (`docs-find`, all four content types incl. config, with `--meta`/`--path`/`--type`/`--count`/`--paths-only`). **git group is net-new** vs pre-edit — it belongs here (schema-agnostic, runs over any content path). **link-check remains ➕** — it was the explicit *stretch* of subtask 11 and was deliberately deferred (see delta).

---

## Category 2 — Common name, **type-specific code** (same verb, per-type impl)

| Feature | Docs | Blog | Issues | Config |
|---|:--:|:--:|:--:|:--:|
| **list** | ✅ | ✅ | ✅ | — |
| **show** | ✅ | ✅ | ✅ | — |
| **search** (schema/field-aware filter) | ✅ | ✅ | ✅ | — |
| **check / validate** | ✅ | ✅ | ✅ | ✅ |
| **settings** (view/set settings.json or frontmatter meta) | ➕ | — | ➕ | ✅ |
| **new / create** (scaffold an item) | ✅* | ➕ | ➕ | — |

**Both headline gaps closed:** docs/blog `list`/`show`/`search` shipped (`_content.mjs` + 6 thin commands) — the root-cause fix for the original search failure; and the **orphaned issues validator is wired** (`docs-check-issues`, `check` issues ⚠️ → ✅). `settings` and CLI `new/create` remain ➕ (deferred — see delta). \* docs scaffolding is still the `/docs-add-section` slash command, not a CLI command.

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

Category 3 was already complete for the shipped commands and is **unchanged** — the consolidation touched their *contract* (uniform `--help`/`-h`/`--json`/exit codes via the dispatcher) but not their behavior. `renumber` and `vocabulary` remain ➕ (deferred).

---

## Search-scoping flags (the original trigger)

| Flag | Pre-edit | Post-edit |
|---|---|---|
| `--path <regex>` (path/filename text) | ➕ | ✅ on `docs-list` **and** `docs find` |
| `--meta <regex>` (frontmatter + JSON/YAML only) | ➕ | ✅ on `docs-list` **and** `docs find` |
| `--count` (counts + titles, no excerpts) | ➕ | ✅ on `docs-list`, `docs find`, `*-search` |

`docs-list --path astro` now finds the astro-upgrade issue in one call — the failure that triggered this whole issue.

---

## Delta vs pre-edit baseline

**Moved ➕/⚠️ → ✅ (shipped):**
- **Category 0 entirely closed** — uniform `--help`/`-h`/`--json`/exit codes via a central manifest-driven dispatcher; `docs help` discovery + `docs help --json`; shared `_cli.mjs` contract; **+** two net-new elements (`docs resolve-context`, `CONTRACT.md`).
- **Category 1** — `find` shipped across all content types; the original search-scoping flags (`--path`/`--meta`/`--count`) landed; **git group net-new** (updated/changed/log + guarded commit).
- **Category 2** — docs/blog `list`/`show`/`search` shipped (root-cause fix); orphaned issues validator wired (`docs-check-issues`).
- **Surface:** 13 → **28 commands**, dual addressing (`docs <group> <verb>` + flat `docs-*` alias), polyglot-ready dispatcher (runtime routing + interpreter detection), plugin **0.2.1 → 0.3.0**.

**Remains ➕ (deliberately deferred — candidate follow-ups):**
- **link-check** (Cat 1) — broken/orphan internal-link checker. Was the *stretch* of subtask 11; `docs find --path`/`docs-move`'s link rewriter cover adjacent ground, but a dedicated orphan/broken-link audit is unbuilt.
- **settings** (Cat 2) — a general view/set for `settings.json` / frontmatter meta (issues have `set-state` for status only; config validation exists but no editor).
- **new / create** (Cat 2) — CLI scaffolding for a docs page / blog post / issue (docs has the `/docs-add-section` slash command; no per-item CLI `new`).
- **renumber** (Cat 3) — re-space `NN_` prefixes to open insert room.
- **vocabulary** (Cat 3) — manage the tracker's root `settings.json` vocabulary from the CLI.

**Deferred-by-design, not gaps:** these are all *additive* future commands; none blocks the consolidation goal (one dispatcher, one contract, discoverability, the search fix). They are recorded as a follow-up comment on the issue.

**Verification:** self-test harness **117/117 green (bun)**; `docs help` reports 28 commands (general 5 / issue 8 / check 5 / doc 3 / blog 3 / git 4) matching every doc table; `docs help --json` matches `_manifest.mjs`.
