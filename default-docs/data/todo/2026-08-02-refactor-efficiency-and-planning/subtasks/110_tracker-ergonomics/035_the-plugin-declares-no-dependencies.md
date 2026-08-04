---
title: "The plugin declared no dependencies, and now it has none"
status: done
---

# Overview

**`plugins/agent-ks/` had no `package.json` and no `node_modules`, and its
scripts imported `gray-matter` anyway.** Used by `issues/_lib.mjs` and
`issues/check.mjs` at seven call sites, so a resolution failure was never one
broken command — it was most of the toolchain.

**Why it worked, and it is not the reason anyone assumes.** `node` could not
resolve it at all: `node_modules` exists only under `astro-doc-code/`, which is
not an ancestor of the plugin's scripts, so the directory walk never reached it.
Every command worked because `bin/agent-ks` execs **`bun`**, and bun fetches a
missing package on demand.

**Not on every command, and the distinction is the whole size of the problem.**
Bun fetches **once per machine** and keeps the result in a global cache
(`~/.bun/install/cache` — `gray-matter` is sitting there right now); every later
command reads it off disk. So the requirement was never *a network per command*.
It was **a network on first use, on a machine that has never fetched it** — which
is exactly one moment, and exactly the moment a new consumer meets the tool.

**Resolved by removing the dependency rather than declaring it.** `bun` ships
`Bun.YAML`, bun is already mandatory, and every call site only ever read
frontmatter — so the package bought nothing the runtime did not already have.

**Done when** a consumer who installs the plugin and runs `agent-ks check issues`
gets either a working command or a clear error naming what to install — never a
module-resolution stack trace, and never a silent pass. **Met**, and by the
stronger route: there is nothing left to install.

# References

- The round that measured the failure, while reverting the parser:
  [`080`](../../agent-log/070_rf_tracker-ergonomics-three-fixes/02_working/080_cut-it-back.md)
- The differential test that licensed the swap:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/fixtures/frontmatter.test.mjs`
- The shared parser: `plugins/agent-ks/skills/agent-ks-docs/scripts/_frontmatter.mjs`

# Todo list

- [x] **Establish the fact first.** *Measured:* `node` cannot resolve
      `gray-matter` from the plugin's scripts at all. The CLI works only because
      `bin/agent-ks` execs `bun`, which auto-installs. The real dependency was
      **bun plus a network**, not the directory walk
- [x] Survey what other plugins do — **13 of the 14 installed here have zero npm
      dependencies; agent-ks was the only one with any.** The one that genuinely
      needs npm code (playwright) does not bundle it either: its MCP config says
      `npx @playwright/mcp@latest`. The ecosystem's answer is *don't have
      dependencies*, not *declare them*
- [x] Decide the shape — **Sid's ruling: delete `gray-matter`, use `Bun.YAML`.**
      Recorded below with the two options he turned down
- [x] Build `_frontmatter.mjs` — one `readFrontmatter(text) → { data, content }`,
      gray-matter's shape on purpose so the swap stayed a rename
- [x] Prove it with a differential test before swapping anything
- [x] Swap all seven call sites, and fold in the *second* frontmatter parser
      (`_content.mjs` had a hand-rolled one)
- [x] Fix the Windows shim, which still fell back to `node`
- [x] **Run the offline case, do not argue it.** Both commands, cold bun cache
      (`BUN_INSTALL_CACHE_DIR` at an empty temp dir) and the registry pointed at a
      dead address. **Old: hung, killed at 90 s (exit 124). New: exit 0,
      immediate.** The old failure mode is worse than the stack trace this
      subtask assumed — it is a hang with no message at all

# Outcomes and Next Steps

**Done. The plugin ships zero runtime npm dependencies.**

Every remaining non-`node:` import lives in `fixtures/` (`gray-matter` for the
differential test, `micromark` for the code-spans one). **A test may need a
package because a test never runs on a consumer's machine** — that is the same
standing `code-spans.test.mjs` already had, now written down rather than assumed.

**Two live defects fell out of the swap, neither of which was the point:**

| Was | Now | Why |
|---|---|---|
| `"date": "2026-07-01T00:00:00.000Z"` | `"date": "2026-07-01"` | js-yaml resolves an unquoted `date:` into a JS Date at UTC midnight. The CLI had been emitting a timestamp and a timezone the file never carried. The **framework already undid this** (`issues.ts → fmDateString`); the plugin never did |
| `"tags": ""` | `"tags": ["announcement", "getting-started"]` | `_content.mjs` parsed frontmatter with a hand-rolled line regex that read every value as a string, so an inline array collapsed to empty. `blog show --json` has been wrong about tags for its whole life |

**The offline claim is now run, not argued** — and the old behaviour is worse
than this subtask assumed. Cold cache, dead registry, same input:

| | Result |
|---|---|
| **old** (`gray-matter`) | **hung**; killed at 90 s, exit 124. No error, no message |
| **new** (zero deps) | exit 0, immediate, full output |

A stack trace at least tells the reader what to install. A hang tells them
nothing and looks like the tracker is large.

# Details

## Sid's ruling, and the two options he turned down

| | What it cost | What it bought |
|---|---|---|
| **A. Delete `gray-matter`, use `Bun.YAML`** ⭐ *chosen* | a shared module, seven call sites, and a differential test | zero dependencies; works offline, on a cold cache, with nothing to install |
| B. Add a `package.json`, consumer runs `bun install` | ten minutes | an honest declaration — and an install step no other plugin asks for |
| C. Write down "bun + a network" as the contract | ten minutes | nothing breaks today; the first offline user finds out |

A is the only one that makes the problem stop existing rather than describing it.

## The swap cemented bun. That was already true and is now true for a better reason

`Bun.YAML` is a bun global with no node equivalent, so the plugin is bun-only.
It already was — the launcher has refused to start without bun for a while. What
changed is *what bun is for*: it used to be **the package manager** (fetch the
missing dependency), and it is now **the runtime** (parse the YAML). Requiring an
installed tool is a smaller promise than requiring an installed tool plus a
reachable registry.

The Windows shim had not caught up: `bin/agent-ks.cmd` still fell back to `node`,
which after this change would die on `Bun.YAML is not defined` instead of a
module error. It now refuses with the same message as the bash twin.

## How the swap was licensed — a differential test, then a control on the test

`fixtures/frontmatter.test.mjs` **asserts nothing of its own.** It hands the same
bytes to `gray-matter` and to `readFrontmatter` and fails when they disagree —
over 25 hand-written cases plus every `.md` in the tracker.

That is the only honest way to retire a library: not *"the new one looks right"*,
but *"over every real file we have, these two produce the same answer."*

**The first run found three real bugs in the new parser** — an empty `---\n---`
block, a close delimiter with a trailing space, and the date class. Two were
fixed by matching gray-matter's actual delimiter rule, which is looser than the
tidy one you would write from scratch: the close is the first `\n---` *anywhere*,
not a line reading exactly `---`.

The third is kept, deliberately, as the date fix in the table above. It is
**allowlisted narrowly and printed on every run** — the exception fires only when
gray-matter produced an ISO instant at exactly UTC midnight where we produced its
date half, and any other difference in the same file still fails. A tolerance
nobody can see is a tolerance that grows.

**Then the test itself was controlled**, because a differential that passes on
the first try is exactly the result to distrust. Four mutants were fed through
the comparison — drop a key, stringify every value, lose one body character,
change a date to the wrong day. All four were caught; the unmutated parser
passed. In particular the wrong-day mutant proves the date exception is narrow
rather than a blanket amnesty on `date:`.

## Is the data one-to-one? Three layers, and the third is the one that settles it

The differential test reports "0 unexpected disagreements", but that phrasing
hides an allowlist — so it was re-run three ways, each less forgiving than the
last.

**Layer 1 — every key, no allowlist at all.** 1,010 files, 2,011 frontmatter
keys:

| | |
|---|---|
| keys identical | **1,909** |
| keys differing | 102 — and only on two names, `date` (100) and `created` (2) |
| **body differences** | **0** |

Every one of the 102 is the same single shape: `"2026-07-03T00:00:00.000Z"`
against `"2026-07-03"`. Not one difference of any other kind exists.

**Layer 2 — the file itself as the oracle, not either parser.** Comparing each
parsed value against the literal text on that frontmatter line:

| Parser | Matches the file |
|---|---|
| `gray-matter` | **0 / 102** |
| `readFrontmatter` | **102 / 102** |

So those 102 are not a divergence to tolerate. They are 102 places the old
parser was **wrong** and the new one is right — the file says `2026-07-03` and
only one of the two ever said it back.

**Layer 3 — end to end, every command over every issue.** Old CLI against new,
same input, whole `--json` documents:

| Surface | Identical | Differ, date lines only | Differ on anything else |
|---|---|---|---|
| `issue show --full --json` (52 issues) | 30 | 22 | **0** |
| `issue subtasks --json` (52) | 52 | 0 | **0** |
| `issue agent-logs --json` (52) | 37 | 15 | **0** |

`blog show --json` is the one surface that differs for a second reason, and it
is the other fix. The post's frontmatter carries a block list:

```yaml
tags:
  - announcement
  - getting-started
```

Old: `"tags": ""`. New: `["announcement", "getting-started"]`. The file has two
tags; only one of the two parsers has ever agreed with it.

## What was measured, and against what

The before/after is the two commands: `agent-ks` (installed 0.8.1, still on
`gray-matter`) against `agent-ks-dev` (this tree), same input, diffed.

**The first sweep reported every command identical, and it was wrong** — and the
same trap fired a second time, later, on a different sweep that reported 1 issue
compared instead of 52.

**Both were zsh not word-splitting an unquoted variable.** `for id in $ids` over
a newline-separated list is one iteration in zsh, not 52; `agent-ks $cmd` passes
the whole string as a single argument, so both sides fail identically and
"agreement" measures nothing. The shape to distrust is a comparison harness that
comes back **completely** clean on its first run.

Two things caught it, and both are cheap enough to be standard: a **control case
that must differ**, and **printing the count of things actually compared** rather
than only the verdict. A sweep that says "52 identical" has told you more than
one that says "all identical". Use `while IFS= read -r` over a file, never
`for x in $var`.

The corrected sweep:

| Result | Commands |
|---|---|
| identical | `check issues` · `check blog` · `check config` · `issue list --count` · `issue list --status all --count` · `issue review-queue` · `issue subtasks --flat` · `doc list` · `blog list` · `find --count` |
| differ, both fixes | `issue show --json` (the date) · `blog show --json` (the tags) |

Gates after: differential 1,035 documents / 0 unexpected disagreements ·
self-test PASS · `check issues` clean (4 pre-existing warnings on a demo folder) ·
`check link-form` 1,956 links clean · `check skill-links` 44 files clean ·
build 1,214 pages.

`fixtures/code-spans.test.mjs` reports 8 of 31 — **unchanged by this work**, and
verified unchanged by running it against the installed 0.8.1 copy too. It is that
fixture's documented divergence set, not a regression here.
