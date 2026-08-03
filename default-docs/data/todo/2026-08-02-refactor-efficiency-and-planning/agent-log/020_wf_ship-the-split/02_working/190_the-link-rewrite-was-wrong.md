---
title: "The link rewrite was wrong — Sid stopped it, and the renderer was the bug all along"
status: done
agent: claude
---

# Goal

Continue the site-wide link fix from
[`180`](./180_release-0-2-1.md) — and instead, stop it, revert it, and work out
why it was wrong.

This round is written as the exchange rather than as a summary. The conversation
is the method: every correction in it came from Sid pushing back on a confident
answer, and a flattened version would read as though the reasoning arrived on its
own.

# Inputs

- The uncommitted continuation of the link sweep — 195 more converted links
- The 146 already pushed in `a5c75bd`
- [`140`](../../../subtasks/100_link-integrity/030_user-guide-relative-links-404.md)
  and [`150`](../../../subtasks/100_link-integrity/040_site-wide-link-rot.md),
  both of which had already concluded the content was at fault

# Expected Outcome

Originally: drive the broken-link count to zero. Actually: establish which layer
was broken, undo what had been done to the wrong one, and scope the damage
before touching anything else.

# Outcome

**The rewrite was wrong, all 341 links are reverted, and the cause is a
three-line omission in one renderer file.** Nothing has been fixed yet — Sid
asked for the damage to be scoped first.

## The stop

Mid-sweep, with a diagnostic already running:

> *"wait there has been lot of wrong changes please wait before making these
> substantial wrong changes. in the markdown all links are relative `[](./)` not
> absolutely position.*
> *1. Did you update the skill in anyway to make it absolute*
> *2. I can see a lot of places the changes were made in the actual doc where
> these links were made absolute. These are automatically resolved. Right? So
> none of the links are actually broken.*
> *3. Did you properly analyze this? Because I think we should wait a moment
> before editing and think what's happening."*

Question 3 was the one that mattered. The answer was no.

## What the investigation found

**The renderer, not the content.**
`internal-links.ts` → `rewriteHref()` strips the `.md` extension and the `NN_`
ordering prefix, then emits the `./` or `../` **unchanged**. Every page is built
as `<slug>/index.html`, so its URL ends in a slash and the file's own name has
become a directory segment. The URL base is one level deeper than the source
directory:

```
source   05_getting-started/02_installation.md    dir  = 05_getting-started/
URL      /user-guide/getting-started/installation/  base = …/installation/

./05_claude-skills.md  →  ./claude-skills
  resolves to  /user-guide/getting-started/installation/claude-skills   404
  intended     /user-guide/getting-started/claude-skills                200
```

Confirmed over real HTTP against a served `dist/`, not by reasoning about paths.

**And the replacement form was one the tooling cannot see.** `_links.mjs` →
`isIgnorableTarget`, line 28:

```js
if (url.startsWith('/')) return true;              // site-absolute (incl. /assets/)
```

`agent-ks move` skips site-absolute links entirely, by design — it resolves every
link to a real filesystem path and rebuilds it with
`path.relative(fileDir, targetAbs)`, and an absolute link is not a path relative
to the file. So all 341 converted links had been silently removed from move's
maintenance and would have rotted on the next file move with nothing to catch it.

Sid's objection was not a preference. It was a fact about the tooling, provable
in one line of code, and it had never been checked.

## How the wrong conclusion was reached

The measurement was right. **The attribution was wrong**, in four steps worth
naming because they are repeatable:

1. **Only one hypothesis was ever enumerated.** *Content wrong* and *renderer
   wrong* both explain a 404. Only the first was tested.
2. **The strongest evidence was read backwards.**
   [`140`](../../../subtasks/100_link-integrity/030_user-guide-relative-links-404.md)
   argued, as grounds for rewriting: *"not one of 101 links got it right."* **A
   tool that 101 independent authors use wrongly 101 times is a broken tool.**
3. **The replacement form was chosen without reading its consumer's contract.**
   `move.mjs` was opened for the first time *after* the revert.
4. **The renderer is 81 lines**, and was opened for the first time after the
   rewrite had been committed and pushed.

## The revert

| | |
|---|---|
| Uncommitted conversions discarded | 195 |
| Pushed conversions restored from `a5c75bd^` | 146 |
| Verified against pre-session baseline `e8cddad` | root-relative 113 → 115, relative 370 → 372 |
| The +2 | cross-section links added with the using-with-AI rewrite, matching a convention that predates this work (`0937abe`) |

Committed as `ee404bb` on `fix/relative-link-rendering`. **Pushed history was not
rewritten** — the restore is a new commit.

An important distinction surfaced while verifying: the repo already had a
coherent two-part convention nobody had written down — **relative within a
section (372 links), site-absolute across sections (115)**. The rewrite had been
converting the first group into the second.

## Sid's second pass — "such assumptions are dangerous"

> *"we need to review your previous decisions as well lets discuss that as well
> — such assumptions are dangerous"*

Audited every change made this session, mechanically rather than from memory:

| Change | Verified how | Verdict |
|---|---|---|
| `check-skill-links.mjs` reads the working tree | control-tested 4 ways | sound |
| `issues/check.mjs` digit lint | before/after 1 → 3 warnings | sound |
| `config.ts` refuses a missing data path | control test caught the first draft breaking 2 working pages | sound |
| Migration iteration-mismatch report | measured on real pre-migration data, 83/83 false positives if ungated | sound |
| 13 skill reference files | 7 testable behaviour claims, all 7 re-checked against code | sound |
| `check-content-links.mjs` | **not verified — built on the wrong model** | contaminated |
| Root-relative link decision | **argued, never measured** | wrong |

**The pattern is clean and it is the finding of the round: everything that was
executed held; the only two things that failed are the two that were reasoned
to.** Both failures came from arguing rather than measuring, and nothing else
this session was assumption-driven.

## Two authority decisions surfaced for Sid

Scoping the audit follow-ups turned up something adjacent. The seven findings
were all verified — two of them corrected *themselves* under execution, including
the `title`-fails-the-build claim, which a real build disproved. But the **fix**
for `020` shipped a three-row *Closing authority* table into `00_overview.md`,
now the single home 14 files link to:

| Status sits on | Who closes | Source |
|---|---|---|
| Issue / subtask | user only | **Sid's rule** |
| Agent log, child log, iteration file | agent | **extension** |
| Plan, plan stage | agent | **extension** |

Rows 2 and 3 extend Sid's `done`/`dropped` rule to objects he never ruled on.
Reasoned, recorded, and reversible in one line — `040` even flags it as *"one
design call taken rather than escalated"* — but his to confirm. Materially
different from the link error: that was an untested factual inference; this is a
judgment call made explicitly and cheaply undone.

## Restructure, and a live demonstration

Sid asked for the issue's loose subtasks to be grouped. Sixteen moved into four
folders — `010_initial-research/`, `080_presentation-and-numbering/`,
`090_silent-failure-defects/`, `100_link-integrity/` — each with an index leaf,
grouped by lifecycle and failure mode rather than topic.

Every move ran through `agent-ks move`, **which recomputed 6 relative links
across 4 files on the first move alone.** That is the tool the reverted rewrite
would have blinded. The restructure was accidentally the best available argument
for why the revert was right.

Five new subtasks scope what is owed, all `open` and blocked on Sid's go-ahead.
Committed as `317e5a9`.

## The migration subtask, re-verified rather than trusted

Asked whether
[`100`](../../../subtasks/040_execution/100_migration-script.md) could close, the
claims were re-run rather than read:

| Check | Result |
|---|---|
| Migration detect, second run | nothing left to migrate |
| Old status values remaining | 0 |
| `iteration:` fields remaining | 1 — inside a code example in an old note, correct to leave |
| `agent-ks check issues` | clean |

**The work holds.** Two paperwork defects block a clean close: the file corrects
its blast radius to 75 at line 162 and still says 78 at lines 331 and 335,
naming the wrong number as the acceptance test; and
[`040_execution/00_overview.md`](../../../subtasks/040_execution/00_overview.md)
still lists `100` as `in-progress` when it is at `review`.

# Gates

| Gate | Result |
|---|---|
| Link revert vs baseline `e8cddad` | verified — 113 → 115 root-relative, 370 → 372 relative |
| Renderer defect reproduced | **over real HTTP** — 404 on the resolved URL, 200 on the intended one |
| `move` skips absolute links | confirmed in source, `_links.mjs:28` |
| `agent-ks check issues` after restructure | 51 folders, 0 errors, 1 pre-existing warning |
| Migration re-verified | detect finds nothing; 0 old status values |
| Skill behaviour claims re-checked | 7 of 7 hold |

# Left for Sid

- **Approval to start the fixes.** All five subtasks under
  [`100_link-integrity/`](../../../subtasks/100_link-integrity/00_overview.md) are
  `open` by request — the damage was to be scoped first.
- **The closing-authority table** — rows 2 and 3 are an extension of his rule to
  objects he never ruled on.
- **Two paperwork fixes** before
  [`100`](../../../subtasks/040_execution/100_migration-script.md) closes.
- **Twelve items at `review`** in `040_execution/` waiting on sign-off, plus
  `020` parked at `input-needed` because it proposes a diff to his own
  `~/.claude/CLAUDE.md`.
- **`check-content-links.mjs` is still uncommitted** and built on the wrong
  model — scoped in
  [`070`](../../../subtasks/100_link-integrity/070_reframe-the-link-checker.md).

# The line worth keeping

From [`140`](../../../subtasks/100_link-integrity/030_user-guide-relative-links-404.md),
written as the argument *for* the rewrite:

> *"not one of 101 links got it right"*

It is the moment the correct answer was written down and read backwards. **When
every user of a thing uses it wrongly, suspect the thing.** The record keeps the
sentence rather than deleting it, because a corrected record teaches and a
silently-fixed one repeats.
