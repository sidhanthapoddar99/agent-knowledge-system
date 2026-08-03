---
title: "Summary"
---

# State

**Done and live. Nothing committed.**

The restructure is applied: `~/.claude/CLAUDE.md` is 2,875 words (from 3,580)
plus five triggered reference files under `~/.claude/references/`, totalling
7,541. Three rounds — diagnose, audit, apply-and-fix — are recorded in
`02_working/`. The proposed texts and the reasoning are in `03_debrief/`.

Two of Sid's own corrections outweighed any audit finding: the permission rule
(the danger is a **side-effect** edit, not collaborative editing) and the removal
of *"no re-arguing a decision I have made"*, which as written suppressed telling
him he was wrong.

Left for him: nothing is committed in `~/.claude`; the core is 2,875 against his
~2,000 target, and cutting further means removing protections four reviewers
judged silent-when-absent.

---

**History below.** Round 1 landed; round 2 in flight.

Round 1 — three reviews on three lenses (Codex `gpt-5.6-sol` external, Fable,
Sonnet) plus a seven-question interview with Sid. All three converged on the same
root cause: **the rules are unconditional**, and Codex made it measurable by
building ~55 realistic inputs where obeying a rule as written is wrong. Recorded
in [`010`](02_working/010_three-reads-and-sids-taste.md).

Round 2 — the replacement text is written
([`03_debrief/01`](03_debrief/01_proposed-claude-md.md), 3,580 → ~2,000 words)
and is now under a **four-way adversarial audit** (Opus, Fable, Sonnet, Codex).
Each auditor also answers three fixed scenarios *as if the new file were in
force* — Sid's idea, and the better test: it checks the instructions by running
them rather than by reading them.

Next: merge the four audits, apply what they find, hand Sid the final text.
**The file is his; this run proposes and never applies.**

# Goal

**Make the global operating instructions coherent, and stop the harness
overspending.**

The trigger was a measured failure of calibration across one session. The same
agent, under the same file:

- **Understated** — stated a diagnosis of a link bug as fact when it had never
  been checked, and rewrote 341 content links on the strength of it
  ([the round](../020_wf_ship-the-split/02_working/190_the-link-rewrite-was-wrong.md)).
- **Overstated** — answered "is this file out of date?" with a build, five
  control tests, a fixture tracker and a multi-section report. The true answer
  was one line: *the table in `040_execution/00_overview.md` says `review`, the
  files say `done`.*

Sid's framing, which is the thesis of this run:

> *"It's not just trust. When you start doubting everything, then it's an issue —
> you overspend and might get the wrong answer."*

**Doubt is a budget.** Universal verification is not rigour; it spends the budget
on the 95% that was fine and leaves nothing for the 5% that mattered, while
burying the signal in noise. The link failure came from too little doubt at one
specific point; the response was to apply maximum doubt everywhere, which is an
overcorrection that replaces judgement with policy.

**The structural diagnosis.** The file's rules are near-universally
*unconditional* — they state what to do and never the case where they do not
apply. Three consequences, each observed:

| Rule as written | Over-applies as |
|---|---|
| *"Length is whatever comprehension costs… erring long is cheap"* | every fact gets a full explanation, including one-line facts |
| *"Explain in plain terms — always… unconditional on purpose"* | the answer is buried under the reasoning that produced it |
| *"Measure, don't argue"* + *"control-test both directions"* + *"a clean first result is the one to distrust"* | a **reading** question gets answered with a **test suite** |

And where two rules conflict — *"lead with the answer"* against *"erring long is
cheap"* — nothing ranks them, so the conflict resolves by **whichever is more
elaborated**. The longer-argued rule wins, which is backwards: length of
argument tracks what Sid was last burned by, not what matters most.

**Sid's design instinct, which this run adopts:** *"maybe 3 examples would be
better than 10 instructions."* Instructions are compressed judgement and must be
re-derived at every use; examples are demonstrated judgement. The examples must
be **contrastive pairs** — *this, not that* — because the boundary is the
information, and a one-sided example gets pattern-matched on surface features.

# Todo

- [ ] Scaffold this log and write the brief — **this file is the brief**; agent
      prompts are pointers at it
- [ ] Commission three independent reviews, each on a **distinct lens**, none
      seeing the others:
      - **Codex `gpt-5.6-sol`** (external, own shell, `xhigh`, read-only) —
        *conflicts and triggers*: where does the file contradict itself, which
        rules carry no condition, what is measurably duplicated
      - **Fable** — *the rewrite*: plain language a model actually follows, and
        the candidate contrastive examples
      - **Sonnet** — *the boundary*: what belongs in `CLAUDE.md` at all versus
        what should move to a skill, and how precedence gets stated
- [ ] Interview Sid on the judgement calls the rewrite turns on — his taste is
      an input, not something to infer
- [ ] Merge as a **union, not a vote** — one reviewer finding something is a
      finding
- [ ] Write the proposed file and hand it over as a reviewable diff
- [ ] Compact the areas that are procedure rather than judgement, and point at
      the skill that owns each

# Out of Scope

- **Editing `~/.claude/CLAUDE.md`.** It is Sid's file. This run proposes; he
  applies. Same rule that parked
  [`020`](../../subtasks/040_execution/020_update-global-claude-md.md).
- The `100_link-integrity/` fixes. Still awaiting his go-ahead, unchanged by this.
- This repo's own `CLAUDE.md` and the `agent-ks` skills, **unless** the boundary
  review concludes something must move out of the global file into them — in
  which case the destination is named here and the move is a separate change.

# Outcome

> [!NOTE]
> **PLACEHOLDER** — round 1 in flight.
