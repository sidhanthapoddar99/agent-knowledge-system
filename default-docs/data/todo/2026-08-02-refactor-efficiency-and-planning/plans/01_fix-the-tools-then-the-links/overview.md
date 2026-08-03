---
title: "Fix the tools, then the links"
---

Close the last silent-failure defect, then the whole link-integrity group, in one
run. Four stages.

**Stages reference the subtasks they schedule; they never restate them.** The
chips under each stage are resolved live, so this plan cannot show a status that
has moved on — it stores none.

## The order, and why it is not the obvious one

The obvious order starts with the renderer, because it is the cause of
everything. It is wrong, by one stage.

```
  10  the tools tell the truth   ← every later gate is quoted from these
       │
  20  the renderer               ← the actual defect
       │
  30  one rule, every surface    ← edits the skills heavily. Needs stage 10 live
       │                            or "skill-links clean" means nothing again
  40  correct the record, gate it
```

**Stage 10 first because every stage after it quotes a gate.** Today
`agent-ks check skill-links` reports on the installed plugin rather than the
working tree, so a green during stage 30 — which edits skill files heavily —
would describe a copy nobody touched. That already happened once: every
"skill-links clean" recorded in this issue before 2026-08-03 was about the wrong
tree.

**Stage 40 last because it encodes decisions the earlier stages take.** The link
form gate has to know whatever [`020`](../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
concludes about cross-section links, and the records can only be corrected once
the corrected story is settled.

## The rule this plan is really removing

Three defects in this run share one mechanism, and each stage removes one
instance of it:

> **A rule required for correctness, written as a preference.** When the caller
> skips it, the system returns a plausible result anyway — it renders, it reads
> right, and it is already broken.

| Written as | Actually | Stage |
|---|---|---|
| *"or the resolved URL — also works"* | `move` cannot maintain absolute links | 30 |
| *"or backticked repo paths in prose"* | nothing can maintain a backticked path | 30 |
| the scan root inferred from where you stand | only the human knows which tree they mean | 10 |

## Standing constraints for the whole run

- **`done` and `dropped` are Sid's.** Every stage and subtask closes at `review`.
- **Control-test both directions on every fix** — the guard fires on the defect,
  and stays quiet on correct input. Neither half alone proves anything. This is
  not ceremony here: both of the last two guards written in this issue were wrong
  on first draft and the control test is what caught them.
- **No mass content edit without a batch-and-check loop.** Stage 30 proposes the
  second large link edit in this repo. The first was 341 files and wrong.
- **Commit on `fix/relative-link-rendering` only. No micro-commits. Do not push.**

## Outcome

> [!NOTE]
> **PLACEHOLDER** — written 2026-08-03, not started.
