---
title: "Sonnet — the round table as a system, and whether the drift gate holds"
status: done
agent: sonnet
unit: audit
---

# Goal

Judge the generated round table not as code but as a **system over time**: does
the staleness gate actually prevent the defect it cites as its precedent, or
relocate it? Is `reindex` a fix or a treadmill? And was there something simpler
that met the real need?

# Inputs

- `_working-index.mjs`, `reindex.mjs`, `new-agent-log.mjs`, `new-iteration.mjs`,
  `check.mjs`
- [`015`](../../../subtasks/110_tracker-ergonomics/015_the-working-index-is-a-table-of-the-round.md),
  including its stated requirements and the rejected alternative

# Expected Outcome

Findings — each with `file:line`, the failure scenario, and whether it was
confirmed by tracing code.

# Outcome

**Verdict: the requirements are met, and the framing overstates what was
bought.** Five findings, one of which changes how the whole thing should be
described.

## The one that matters

> **Nothing forces you through the gate.** No CI job and no git hook calls
> `agent-ks check issues` anywhere in the repo. The only instruction to run it is
> prose in `references/40_operations/42_updating.md:108`.

**Verified independently before recording**: `.github/` contains no reference,
and `.git/hooks/` has nothing but samples.

So the drift moved from *silently wrong forever* to *silently wrong until
somebody voluntarily checks that specific issue* — a real narrowing, and not what
the word "gate" implies. A gate nothing forces you through is a sign.

## The rest

| # | Finding | Verified |
|---|---|---|
| 2 | **`unit:` is exempt from the validation it appears to have.** `new-iteration.mjs:180` checks the value against the fixed vocabulary; `check.mjs` admits the key and never checks the value — unlike `status`, which it errors on. And the staleness error tells you to *"fix it THERE"*, i.e. hand-edit the frontmatter — the one remediation path that bypasses the only validating writer. `unit: audi` renders forever | ✅ traced |
| 3 | **The Kind column is blank almost everywhere.** Reported as 35 of 38 rounds; **the real figure is 47 of 50** — its `find` glob was narrower than the tree. The only rounds carrying `unit:` are the three from this run | ⚠️ corrected on re-count |
| 4 | **The treadmill is narrower than the docblock claims.** `new-iteration` re-renders the *whole* table each round, so a status flip on round N is picked up free when round N+1 opens. The genuine gap is only the **last round of a run**. `reindex.mjs`'s claim that status changes "far more often than a round is created" is asserted, not measured | ✅ traced |
| 5 | **The bare visibility need was met by ~10 lines.** `_working-index.mjs:94-102` — the empty-state text alone — answers *"can an agent see that two thirds of the structure exists"*. The other ~170 lines buy the round-by-round summary, which `015` did ask for. A legitimate scope choice, recorded rather than smuggled — but worth stating plainly | ✅ traced |

## Requirements, checked line by line against `015`

| Requirement | Met | Note |
|---|---|---|
| seeded at scaffold | ✅ | unconditional |
| columns settled | ⚠️ | the candidate *"one line of what it found"* was replaced by `Produced` with no note recording the substitution |
| `kind` from a real source, never guessed | ✅ hollow | never guesses — and is blank on 47 of 50 rounds |
| `who` separates orchestrator from subagent, handles fan-out | ✅ | visible in the shipped backfill |
| rewritten every `new-iteration` | ✅ | unconditional |
| `03_debrief/` decided separately | ✅ | named in the hint, not seeded |
| validator accepts it | ✅ narrowly | only when the file exists, and `unit` is unvalidated |

**Minor, and it is the file's own self-description:** the generated banner says
*"Rewritten by `agent-ks issue new-iteration`"* and does not mention `reindex` —
so a reader trusting the do-not-hand-edit banner cannot learn the fix from the
file itself.

**Checked and found nothing:** no second codepath writes `00_index.md`, and the
generator and the gate call the same function, so there is no
reimplementation-drift risk between what is written and what is checked.
