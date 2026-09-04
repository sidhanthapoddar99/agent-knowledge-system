---
title: Brief — re-audit one skill after the fix round
---

# Brief for every re-audit reviewer

You audit one skill of the `agent-ks` plugin for the second time. A first reviewer audited it, the orchestrator ruled on every finding, and a fix agent applied the rulings. You did none of that. You check two things: did the fixes land, and is the skill now right.

## Read, in this order

1. [05_brief.md](./05_brief.md) — why we do this, where things are, the eight checks, the house rules, the rules for you. All of it still holds.
2. [20_fixes.md](./20_fixes.md) — the cross-cutting decisions A to I, the deferred list, and the verdict on every finding of your skill.
3. Your skill's first report, `1N_<skill>.md` in this folder.
4. The skill itself, every file, as it is now.

## What to check

**Closure.** For every finding the verdict marked `fix`, read the place it names and say whether it is closed. Three answers: `closed`, `partly` (say what is left), `open` (say why). A finding marked `defer`, `reject` or `engine` needs no check. Do not re-argue a verdict.

**Regressions.** A fix can break what it touched. Read every changed passage for a new false claim, a lost fact, a broken link, a sentence that no longer holds together, a rule that lost its reason, or a word cap now exceeded. Decision I in the verdict file states the caps.

**Fresh eyes.** Then run the eight checks from the first brief again, on the whole skill, as if you had never seen it. The first reviewer missed things; find them. Do not repeat a finding that is already closed.

**Run it again.** Do the dry run with the same prompt the first reviewer used, so the two runs compare. Report where it went better and where it still goes wrong.

## Your report

Write it to the file named in your prompt. Use this shape exactly.

```markdown
---
title: <skill-name> — re-audit
---

# <skill-name>

**Verdict:** one line. `ready`, `needs fixes` or `not ready`.

**Measured:** SKILL.md <N> body words · references: <name> <N> lines, …

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | closed / partly / open | one sentence when not closed |

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | blocker / major / minor | `file:line` | one sentence | one sentence | one sentence, concrete |

## The dry run, second time

The same prompt. What went better, in order. What still went wrong. Ten lines or fewer.
```

Severity as before: a blocker makes the agent do the wrong thing or fail to trigger; a major wastes context or leaves it guessing; a minor is style.

Report only what you verified. Say `unsure` when you are, and what would settle it.
