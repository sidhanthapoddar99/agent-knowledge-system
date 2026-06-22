---
title: "CLI landscape & Category 0 (shared contract + discovery)"
---

# CLI landscape & Category 0

Full structural map of the toolkit as it exists today, the **Category 0** concept (the shared contract every command speaks), and the consolidation approach — optimized for an **AI agent as the primary end user**.

## The landscape

```
bin/<name> + <name>.cmd   ← 13 identical shims, self-route by basename (bash + Windows .cmd)
        │
   cli.mjs                ← dispatcher: a 13-entry COMMANDS map { name → script }
        │
   scripts/<domain>/*.mjs  ← 21 files across 5 domains + 5 shared libs
   issues/(9) blog/(1) config/(1) docs/(2) images/(1)
   libs: _env  _check-lib  _order-prefix  issues/_lib  images/_lib
```

**The core structural problem — two civilizations:**

- **`issues/` is mature.** `issues/_lib.mjs` (~560 lines) has a real arg-parser (`parseArgs`), a help renderer (`printHelp`), search-backend abstraction (rg→grep→js), `--json`/`--paths-only`, lazy env resolution. 8 commands lean on it.
- **Everything else is ad-hoc.** `blog`/`config`/`docs`/`images` reinvent arg-parsing **three different ways**; only the 4 validators share one thing (`reportAndExit` in `_check-lib`).

The good parts are **trapped inside `issues/_lib`** where no other domain can reach them. That single fact causes most inconsistencies.

## Inventory of inconsistencies (what bites an agent)

| Problem | Reality |
|---|---|
| No discovery | `cli.mjs` has no `--help`; no command lists the 13 commands (catalogue only leaks as an error) |
| `-h` broken | only `list.mjs` of 9 issues commands honors `-h`; other 8 take only `--help` |
| Help non-uniform | issues + validators → **stderr**; `move`/`img` → **stdout**; `--help` exit codes vary |
| `--json` partial | 5 issues commands have it; **no validator / move / img**; `--paths-only` on 1 command only |
| Exit codes diverge | `list` 0/1/2; validators 0/1; `review-queue` always 0 |
| Two orphans | `issues/check.mjs` (the real tracker validator) + `check-skill-links.mjs` ship with **no command name** |
| Latent bug | `docs-show --full` uses `path`/`fs` without importing them → `ReferenceError` (dead on arrival) |
| Duplication | link-rewriting logic 3× (move/img/skill-links); 2-level tree-walkers 2×; external-tool detection 2× |

**Env/path resolution is the one well-centralized piece** — `_env.mjs → resolveProjectContext()` (DOCS_PROJECT_ROOT override → walk up for `.env` → consumer-convention probe). Keep it; expose it cross-language (see Python below).

## Category 0 — the shared contract every command speaks

Categories 1–3 are about *what a command does*. **Category 0 is the substrate beneath all of them.**

**0a — Uniform contract** (lifted into a top-level `_cli.mjs`, consumed by every domain):
- `--help` **and** `-h` everywhere; help to **stdout**; exit `0`.
- `--json` everywhere — **including validators** (machine-readable findings).
- One exit scheme: `0` ok · `1` error/no-match · `2` usage error.
- One error/report format (generalize `reportAndExit` beyond the validators).

**0b — Meta commands** (about the toolkit, not content):
- **`help` / discovery** — `docs help` lists all commands grouped by domain; `docs help <command>` shows its flags; **`docs help --json`** dumps the whole manifest. This is the keystone.

## The consolidation approach — agent-first discoverability

The design goal: an agent learns the **entire toolkit in one call**, never by reading 14 inconsistent `--help`s. In priority order:

1. **Turn `COMMANDS` into a manifest** — `name → { script, category, summary, flags[] }`. One registry = source of truth for routing **and** help **and** discovery.
2. **Generate help from the manifest** via a shared `_cli.mjs` renderer — help text is never hand-written again; kills the stderr/stdout/exit drift in one move.
3. **Ship `docs help --json`** — full machine-readable manifest dump. *The single most valuable feature for an AI end user*: introspect programmatically, pick the right command + flags, stop guessing. Direct structural fix for the broad-search-missed-the-issue failure that started this issue.
4. **Lift parser + output helpers** out of `issues/_lib` into `_cli.mjs` so all domains (and Python later) share them — making universal `--json` and `-h` nearly free.
5. **Wire the two orphans, fix `show --full`, normalize exit codes** — cheap correctness wins.
6. **Dedup** link-rewriting / tree-walkers / tool-detection into shared libs (after the contract gives them a home).

## The `git` command (Category 1)

Git fits Category 1 (common code over any content path) and is genuinely useful because the tracker **already derives `updated` from git history**. Surface what the framework computes internally:

- `git updated <path>` — last-commit date for any issue/doc/post (the derived `updated`).
- `git changed --since <ref>` — content changed under `data/` (review sweeps / "what's new").
- `git log <issue>` — git history of one folder.
- *(guarded)* `git commit --scope <path>` — stage + commit only that content with a conventional message. **Commit/push stay explicit — never automatic.**

Category 1 becomes: `move` · `img` · `find` · `git`.

## Cross-platform (Windows)

**Works today and stays working for all JS proposals.** Every command has a `.cmd` twin mirroring the bash shim (resolves `cli.mjs` via `%~dp0`, prefers `bun` → `node`, passes `%~n0` + `%*`). Manifest, help, discovery, contract lift, subcommands, and the `git` command are all pure JS on the bun/node already required — zero new OS surface. `docs-move` already shells `git mv` via `child_process` with a working `.cmd`, so the `git` command's shelling is a proven pattern.

## Future Python (the one real caveat)

The dispatcher is language-agnostic at the shim layer, **but** the contract must live in the **manifest + a written spec** (arg grammar, help shape, `--json`, exit codes) — not in JS helpers — for a `.py` to honor it. Two Windows-specific needs:
- Interpreter detection (`py -3` → `python3` → `python`) mirroring the bun→node fallback; Python is **not** guaranteed installed (bun/node is).
- Expose `_env` resolution as a `resolve-context` sub-command emitting JSON, so non-JS scripts get the content root without re-implementing `.env` discovery.

Net: polyglot is feasible without forking the contract — as long as the contract is **data (manifest) + spec**, not buried in `issues/_lib`.
