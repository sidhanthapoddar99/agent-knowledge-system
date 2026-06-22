---
title: "Before / after — folder structure & tool calling"
---

# Before / after — folder structure & tool calling

Concrete "what it looks like now" vs "what it should look like after the loop". The post-refactor side is the **target** — illustrative, and subject to the naming-model gate (subtask 01). `_cli.mjs`, `_manifest.mjs`, the `help` command, and the new content commands are the load-bearing additions.

---

## 1. Folder structure — PRE-refactor (today, verified)

```
plugins/documentation-guide/
├── bin/                                  # 26 files = 13 commands × {bash, .cmd}
│   ├── docs-list · docs-list.cmd
│   ├── docs-show · docs-show.cmd
│   ├── … (11 more pairs) …
│   └── docs-img · docs-img.cmd
└── skills/documentation-guide/scripts/
    ├── cli.mjs                           # dispatcher: COMMANDS = { name → scriptpath }  (13 entries)
    ├── _env.mjs                          # resolveProjectContext (centralized — good)
    ├── _check-lib.mjs                    # reportAndExit (only shared output convention)
    ├── _order-prefix.mjs
    ├── check-skill-links.mjs             # ORPHAN — no bin, not in COMMANDS
    ├── issues/
    │   ├── _lib.mjs                       # ~560 lines: parseArgs + printHelp TRAPPED here
    │   ├── list.mjs show.mjs subtasks.mjs agent-logs.mjs
    │   ├── set-state.mjs add-comment.mjs add-agent-log.mjs review-queue.mjs
    │   └── check.mjs                      # ORPHAN — no bin, not in COMMANDS
    ├── blog/check.mjs
    ├── config/check.mjs
    ├── docs/check.mjs · docs/move.mjs
    └── images/optimize.mjs · images/_lib.mjs
```

**Problems baked into this shape:** the parser/help/output helpers live inside `issues/_lib` (no other domain can reach them); two scripts have no command name; `move`/`img` (cross-content) are buried under `docs/` and `images/`; no discovery entry; link-rewrite logic duplicated in `move`, `optimize`, and `check-skill-links`.

---

## 2. Folder structure — POST-refactor (target)

```
plugins/documentation-guide/
├── bin/
│   ├── docs · docs.cmd                   # single entry (model B) — `docs <group> <verb>`
│   └── (thin alias pairs kept for muscle memory: docs-list → `docs list`, …)
└── skills/documentation-guide/scripts/
    ├── cli.mjs                           # dispatcher: reads _manifest, supports `help`, routes non-.mjs
    ├── _manifest.mjs        ★NEW         # { name → {script, category, summary, flags[], runtime} }
    ├── _cli.mjs             ★NEW         # SHARED contract: parseArgs · help renderer · json/exit/error
    ├── _env.mjs                          # + `resolve-context` exposure (for polyglot)
    ├── _check-lib.mjs                    # reportAndExit generalized (or folded into _cli)
    ├── _order-prefix.mjs
    ├── _links.mjs           ★NEW         # shared link-rewrite/walk (dedup from move/img/skill-links)
    ├── _query.mjs           ★NEW         # shared list/search core (extracted from issues/list.mjs)
    ├── common/              ★NEW grouping (Category 0 meta + Category 1 cross-content)
    │   ├── help.mjs         ★NEW         # 0b — discovery: `help`, `help <cmd>`, `help --json`
    │   ├── find.mjs         ★NEW         # 1 — cross-content path + raw-text + --meta
    │   ├── git.mjs          ★NEW         # 1 — updated / changed / log / (guarded) commit
    │   ├── move.mjs                       # moved from docs/  (1)
    │   └── img.mjs                        # moved from images/optimize.mjs (1)
    ├── issues/
    │   ├── _lib.mjs                       # SLIMMED — issue-domain logic only (parser/help now in _cli)
    │   ├── list.mjs show.mjs search.mjs subtasks.mjs agent-logs.mjs
    │   ├── set-state.mjs add-comment.mjs add-agent-log.mjs review-queue.mjs
    │   └── check.mjs                      # now WIRED → `docs check issues`
    ├── docs/
    │   ├── list.mjs show.mjs search.mjs  ★NEW (2)
    │   └── check.mjs
    ├── blog/
    │   ├── list.mjs show.mjs search.mjs  ★NEW (2)
    │   └── check.mjs
    ├── config/check.mjs
    └── images/_lib.mjs                    # engine lib stays; optimize.mjs moved to common/img.mjs
```

★NEW = added by the loop. Cross-content verbs now live in `common/` so the **category is visible in the filesystem**; per-type verbs stay in their domain folder. (Under naming model A the *files* are identical — only `bin/` and the dispatcher prefix differ.)

---

## 3. Tool calling — PRE-refactor

```
$ docs-list --search "astro"
   bin/docs-list (bash)                         # self-routes by basename
     └─ cli.mjs "docs-list" --search astro
          └─ COMMANDS["docs-list"] → issues/list.mjs
               • parseArgs (from issues/_lib)   # only `list` honors -h; others --help only
               • help → STDERR, exit depends on whether required args present
               • --json supported here; NOT on validators/move/img
   ✗ no way to ask "what commands exist?"  (cli.mjs --help → "unknown command")
   ✗ broad query floods 38 KB; no --path / --meta / --count
```

Every command is an island: different arg-parsing, inconsistent `-h`, help to stderr vs stdout, `--json` only on some, no discovery.

---

## 4. Tool calling — POST-refactor

```
# Discovery first — learn the whole toolkit in ONE call
$ docs help                 # all commands grouped by category, one-liners
$ docs help --json          # machine-readable manifest  ← the agent's entry point
$ docs help list            # generated flag reference for one command

# Uniform invocation (model B; `docs-list` alias still works)
$ docs list --search astro --path '6-upgrade' --count
   bin/docs (bash)
     └─ cli.mjs "list" …                        # (alias docs-list → cli.mjs list)
          └─ _manifest["list"] → issues/list.mjs
               • _cli.parseArgs (SHARED)         # --help AND -h → STDOUT, exit 0, always
               • --json everywhere; exit 0 ok / 1 err·no-match / 2 usage  (uniform)

# New reach — cross-content (Category 1) and the wired validator
$ docs find "astro" --meta            # search path+frontmatter+JSON across docs+blog+issues+config
$ docs git updated default-docs/data/todo/2026-06-23-cli-toolkit-consolidation
$ docs blog list --search release     # Category 2 now exists for blog + docs
$ docs check issues                   # orphan wired; correct validator for the tracker
```

**What changed for the caller (me, the agent):**

| Before | After |
|---|---|
| No discovery; guess command names | `docs help --json` → full manifest in one call |
| `-h` works on ~5/14 | `--help` **and** `-h` on every command, to stdout |
| `--json` partial | `--json` everywhere, incl. validators |
| Exit codes vary (review-queue always 0) | uniform `0`/`1`/`2` |
| Search = full-text only, issues-only | `--path`/`--meta`/`--count`; `find` spans all content; `search` per-type |
| `docs-check-section` misused on tracker | `docs check issues` is the right tool |
| Cross-content verbs hidden under docs/ & images/ | grouped in `common/`, category-visible |
| Node-only, helpers trapped in issues/_lib | manifest + `_cli.mjs` contract → polyglot-ready (route `.py`) |

> Naming note: model **A** keeps `docs-list`, `docs-find`, `docs-check-issues` as flat bins; model **B** uses `docs <group> <verb>` with flat aliases retained. The folder tree above is identical either way — the gate (subtask 01) only decides the `bin/` surface and dispatcher prefix.
