---
title: "05 — The subagent protocol: the mailbox, and what a brief may repeat"
---

# The subagent protocol

> **Resolved →** [`notes/20_agent-log-structure.md`](../notes/20_agent-log-structure.md)
> — the mailbox rule is in the spec. The brief-content analysis below is kept
> here; it is reasoning, not spec.

Thread question: **what crosses the wire between orchestrator and subagent, and
what should be a pointer instead?**

Sid's framing: *"if I send you a letter and I also messaged you the letter again,
the whole content as it is — rather, I sent you a letter and a two-line message
referring to it."*

## Outbound — the mailbox rule

**Write once, return a pointer.** A subagent that writes findings into
`working/<iteration>/` **must not also return them in full.** It returns a few
lines: what it did, its verdict, and the path. The orchestrator opens the file
only when it needs the detail.

Measured cost of not doing this: an audit scope report is written to a file
(200–440 lines), returned whole, then restated in the merged verdict. **The same
content produced three times, two of them billed output.**

Corollary, and the reason the rule needs teeth: an orchestrator that reads the
full return into context has already paid for it, so it will then restate it
rather than link. The saving only lands if the return really is short.

**`working/` is for outputs, never for instructions.** The moment a brief is
written there, it is a prompt dump again — which is what the old `03_working/`
became: 160 committed brief files.

## Inbound — what a brief may and may not repeat

**Correction to an earlier overstatement in this thread.** A real brief-carrying
prompt was examined (NeuraSutra `053` fix round, ~40 lines). It was already
pointer-shaped for the *work*: *"read this brief, read its linked verdict, do
steps 1 and 2, stop."* That half is correct and irreducible.

What was genuinely duplicated is narrower — the **standing constraints**,
re-typed at every launch:

| Re-typed every time | Already written in |
|---|---|
| never run a git write command | `memory/standing-rules.md` |
| never delete anything under `benchmarks/` | `memory/standing-rules.md` |
| artifacts go under `benchmarks/<scope>/`, never `/tmp` | `memory/standing-rules.md` |
| mutation testing in-memory via `--preload`, never a tree revert | `memory/orchestration.md` |
| do not improvise architecture; report instead | `memory/orchestration.md` |

That is ~12 lines of ~40. **The honest saving on briefs is about 30%, not the
~90% claimed earlier in this thread.** Recorded because the earlier number would
have justified a more aggressive rule than the evidence supports.

**Proposed rule:** a brief names the standing instruction set by reference —
*"standing rules: `memory/orchestration.md`, `memory/standing-rules.md`"* — and
spends its words only on what is specific to this run: the steps, the acceptance
signal, and the report shape.

This is what `agent-memory/` was built for. The mechanism existed and was not
being used.

## What stays run-specific and must not be compressed

Keep writing these in full — they are the brief:

- **which steps, and where to stop** — including "do not also fix things you
  notice outside your steps; report them"
- **the acceptance signal** — which existing tests must flip from pass to fail
- **the report shape** — what to send back, in what form
- **branch and base commit**

A brief that compresses these buys tokens and loses the run.

## Open

- Does the mailbox rule need enforcement, or is stating it enough? A return-size
  cap is checkable; a convention is not. Leaning: state it in the skill, and have
  the orchestrator's own prompt template carry the two-line return format so it
  is the default rather than a discipline.
- Where do **contradictory** findings between subagents get merged? Orchestrator
  work, so the commissioning iteration — confirm in
  [04](./04_discuss_agent-log-shape.md).
