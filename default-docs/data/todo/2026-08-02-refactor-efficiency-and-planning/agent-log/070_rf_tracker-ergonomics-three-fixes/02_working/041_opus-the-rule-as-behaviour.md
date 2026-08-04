---
title: "Opus — the rule as behaviour, re-decided from the shipped text alone"
status: done
agent: opus
unit: audit
---

# Goal

Re-decide all 14 worked cases using **only** the text that shipped — the issues
reference, `SKILL.md`, `guide.ts`, and `new-agent-log --help` — never the
tracker's own table. Then invent new situations the 14 do not cover.

The lens is deliberate: a rule that reads well and behaves badly is the normal
failure, not the rare one.

# Inputs

- the four shipped surfaces, as committed at `b7cccb9`
- [`020`](../../../subtasks/110_tracker-ergonomics/020_when-a-run-earns-an-agent-log.md)
  for the 14 cases — read for the *questions*, not the answers

# Expected Outcome

Findings — each with `file:line`, the situation, and whether it was traced to
specific text or reasoned.

# Outcome

**Verdict: the restructure did not fully land.** Eleven findings, six rated high.
The headline is not a wording fault — it is that the *replaced* rule is still
shipped in three other files, one of which states it as exhaustive and cites the
rewritten file as its authority.

## The findings that were verified against the tree

| # | Finding | Status |
|---|---|---|
| 1 | The old rule survives in `references/60_examples/61_multiple-subtasks.md:69` (*"and nothing else opens one"*), `63_agent-loops.md:88`, and **`24_agent-logs.md:746`** — the same file as the new rule | ✅ grepped, all four sites present |
| 2 | Trigger 3 and the floor contradict each other three lines apart: *"the floor wins"* vs *"the user asked — always, no other test applies"* | ✅ both strings in the shipped block |
| 10 | *"Never file count"* vs *"a one-line change earns neither a subtask nor an agent log"* — `SKILL.md:119` and `guide.ts:176`, 45 lines from the new prohibition in the same rendered document | ✅ both confirmed |

**The behavioural consequence of finding 1 is what matters.** `24_agent-logs.md:746`
says *"inline work opens no folder however much reasoning it carried"* — that is
case 7 (the hard bug: an hour, three wrong diagnoses, a four-line fix, 🟢 Required)
reversed, and case 7 is the flagship example in the file-count prohibition row.
And `:746` also restores delegation as a trigger, against the limits table's
*"never triggers alone"* 700 lines above it.

**Why the acceptance test missed all of this:** the 14 cases were re-run against
the rewritten *section*. The claim *"14 of 14 unchanged"* is true of one file and
false of the shipped plugin.

## The structural findings

- **Cases 2 and 3 — the loops — get no verdict at all.** Nothing in the shipped
  text addresses repetition or breadth. Floor 2 says *"**one** self-contained
  pass"*, so it cannot reach four passes; trigger 1 is written for sequential
  dependence, so it does not fire on independent work. **Concurrent-or-repeated
  but independent work falls between the trigger and the floor** — and that is a
  large share of real autonomous runs. Same gap reappears as new situation 17
  (two parallel bounded jobs, both clean).
- **The floor is retrospective; the trigger demands a prospective act.** The text
  says *open the log before the first stage*. But floor 2 (*nothing discarded*)
  and trigger 2 are facts you only have afterwards. Open it as instructed, have
  stage 1 return "nothing to do", and you are holding a log the rule now says
  should not exist — with the Boundaries section forbidding the tidy-up. In
  practice agents resolve this by opening one for everything, which is the
  failure `010` created.
- **Case 10 — "a quick check audit" — flips to 🟢.** `audit → finding → fix` is
  the limits table's own worked example of a stage chain. The word *quick* is
  doing all the work, and size is prohibited.
- **Case 14 — a design discussion — flips to 🟢.** A discussion that settles
  anything did so by rejecting alternatives, and *"a rejected approach"* is
  trigger 2 verbatim. That collides with the skill's own explicit-save-only
  discussion policy.

## The surface-coverage table

Four surfaces are supposed to say the same thing at different lengths. They do
not:

| Element | reference | SKILL | `guide.ts` | `--help` |
|---|---|---|---|---|
| question · triggers · floor | ✅ | ✅ | ✅ | ✅ |
| 🟡 Ask, capped once per session | ✅ | ⚠️ fragment | ❌ | ❌ |
| verify **and** audit | ✅ | ✅ | ✅ | ❌ verify half only |
| *delegated never triggers alone* | ✅ | ❌ | ❌ | ❌ |
| *never a validator error* | ✅ | ✅ | ❌ | ❌ |
| routing: *first of several → open one now* | ✅ | ❌ | ❌ | ❌ |

`guide.ts` is the surface a consumer **without the plugin** has, and it is the one
with no Ask verdict — for the interactive mode the whole floor exists to serve.

## The one it argued should have shipped and did not

The tracker's strongest passage — *weight this up sharply for anything that
changes a rule, an instruction or a skill, because when one turns out wrong the
only way to withdraw it is to find the reasoning that produced it* — reached none
of the four surfaces. Applied to **this very commit**: one coherent pass, no
course change ⇒ floor 2 ⇒ no log. It qualified only because a *different*
subtask's rejected alternative happened to be recorded.

> [!IMPORTANT]
> **The rule that governs rule-changes does not know that rule-changes are
> special.** That is `010`'s failure arriving from the opposite direction.
