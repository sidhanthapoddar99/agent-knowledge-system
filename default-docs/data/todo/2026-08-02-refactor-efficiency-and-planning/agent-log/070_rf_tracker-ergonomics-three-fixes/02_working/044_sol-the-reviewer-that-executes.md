---
title: "Sol — the reviewer with a shell, checked against a CommonMark oracle"
status: done
agent: gpt-5.6-sol
---

# Goal

The one reviewer that **executes**. Reading does not catch arithmetic, offset or
off-by-one bugs, and the other three could only read. Attack the generator, the
blanker and the CLI wiring by running them, with `micromark` as an independent
CommonMark oracle rather than an opinion about the spec.

# Inputs

- the commit, the run brief, and the whole tree at `b7cccb9`
- its own scratch fixtures, plus real tracked data

# Expected Outcome

Findings — each with the exact command, its actual output, and whether it was
reproduced or reasoned.

# Outcome

**Six findings, all six reproduced by execution. Two of them nobody who was only
reading could have found.**

> The sandbox mounted `/tmp` read-only, so scratch cases were driven through an
> in-memory filesystem shim over the unmodified CLI. Final `git status --short`
> was empty; nothing tracked was touched.

## The two only a shell could find

**1 · `--group` agent logs are never traversed, so a stale index inside one
passes.** The validator only descends into direct children that already look like
agent logs; a grouping folder is warned about and then skipped. Every grouped log
— **and every child log inside one** — escapes the new staleness error entirely.
Reproduced end to end on a deliberately-stale grouped fixture: `errorCount: 0`,
`exit=0`.

**2 · Folder-form rounds and producers are silently dropped from the table.** The
validator explicitly accepts numbered *directories*; the generator skips
everything that is not a file. Reproduced on **real tracked data** —
`2026-07-01-demo-issue-anatomy-showcase/agent-log/010_lp_implement-sections/`
contains `040_research-codecs/`, and the rendered table jumps straight from
`03` to `05`. The validator reports nothing.

> [!WARNING]
> **This is the design's own failure mode, arriving through the door it left
> open.** The table's entire justification is that a hand-typed one silently
> disagrees with the files it describes. This one silently omits them, and the
> gate cannot see it because the gate compares the file to a generator that has
> the same blind spot.

## The rest

| # | Finding | How |
|---|---|---|
| 3 | **Escaped backticks hide a real broken link.** `\`…\`` is literal per CommonMark; the scanner blanks between them. `micromark` renders the link, the gate reports `errorCount: 0` | reproduced, oracle-checked |
| 4 | **An invalid longer run prevents discovery of a later valid closer.** `micromark` reads the whole construct as one code span; the gate abandoned the opener at the longer inner run and falsely errored on the link it was quoting | reproduced, oracle-checked |
| 5 | **A multiline YAML title breaks the table.** `cell()` escapes `\|` and not newlines, so a valid literal-block title splits one row across lines — and can forge cells | reproduced |
| 6 | **Missing frontmatter invents a title from the filename**, contradicting the generated banner and `reindex --help`, both of which say every cell comes from frontmatter and nothing is invented | reproduced |

Findings 3 and 4 were reached independently of the other reviewer that found
them, and confirmed here against a real CommonMark implementation rather than
against a reading of the spec.

## What it ran and found nothing wrong with

- **Idempotence**: `reindex` twice on the real tracker — `5 round table(s)
  already current`, SHA-256 identical before and after. No same-input failure.
- **Edge matrix**: unicode and pipes in titles ✅ · CRLF ✅ · an orphan producer
  correctly renders a `(no round file)` row ✅ · five-digit and symlink entries
  omitted, consistent with the round grammar.
- **Offsets**: length and newline count preserved on single, wrapped and stray-run
  inputs — `length=true newlines=true` in all three.
- **CLI wiring**: `new-agent-log --group`, `new-iteration` into a grouped log, and
  `new-agent-log --parent` for a child log all worked and produced correct rows.
  The failure is not the writers — it is finding 1, the validator not looking.
- **Final real-tree gates**: `check issues` 0 errors / 2 pre-existing warnings ·
  `check link-form` 0 errors / 52 warnings.
