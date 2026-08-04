---
title: "The parser audit — the swap is correct, and it costs 20×"
status: done
agent: gpt-5.6-sol
---

# Goal

One narrow executing check on the only unreviewed code in this run: the swap from
a hand-rolled code-span scanner to a real markdown parser. Not a review round —
one question, answered by running things: **does it behave correctly on the real
tree and on hostile input?**

# Inputs

- commit `1c8c052`, compared against `06098a9` via `git archive` (no stash, no
  worktree — the old executables run against the *current* content)
- 1,056 markdown files under `default-docs/` and `plugins/`

# Expected Outcome

Findings — each with `file:line`, the exact command, and whether it was
reproduced.

# Outcome

> [!WARNING]
> **Not clean.** The link behaviour is exactly correct and exactly unchanged, and
> two other things are not: a 20× slowdown, and a fallback that would let `move`
> write.

## The half that is clean, and it is the half that mattered

**Zero link regressions, measured as a set rather than a count.** Over all 1,056
files the audit compared the links the gates *expose* against the links micromark
actually *renders*:

| | |
|---|---|
| exposed, old vs new | **2,152 vs 2,152 — `oldOnly: 0`, `newOnly: 0`** |
| `check-skill-links` old private regex vs the shared parser | 215 vs 215, identical |
| `move --dry-run` on the real tree | 22 edits / 15 files, byte-identical both versions |
| parser throws, over the whole repo | **0** |
| CRLF line alignment, all four callers | no off-by-one; the hidden line absent everywhere |
| offsets: BOM, tabs, emoji, CJK, lone surrogate, 1 M-char line, no trailing newline | code-unit length and line count preserved in every case |

**`split('')` splits an emoji into two code units and replaces both with two
spaces** — which is exactly what `slice`, regex indices and mdast offsets use, so
every reported `line:column` stays correct.

## Finding 1 — a 20× slowdown, and an unbounded case

Measured, same tree, same commands:

| | before | after |
|---|---|---|
| `check link-form` | 0.13 s | **2.53 s** |
| `check issues` | 0.14 s | **2.01 s** |
| `move --dry-run` | 0.30 s | **6.81 s** |

And it is not bounded. A pathological document — 10,000 nested `[` or a
10,000-cell GFM table — takes 3–4 s; doubling either **exceeded a 10-second
timeout**. Notably a merely *long* line is fine (1 M plain characters in 106 ms),
so the cost is adversarial grammar shape, not size. `try/catch` does not help:
these stall rather than throw.

**Fixed as far as it goes.** A cheap pre-filter now skips parsing entirely for a
document with no backtick, tilde, `<` or indented line — but most documentation
has backticks, so it recovers only ~0.4 s. **The rest is what parsing costs**, and
it is stated in the source and the release note rather than hidden: ~3 ms a file,
paid once per run, to remove four false negatives.

## Finding 2 — the fallback would have let `move` write

`blankCodeRegions` caught a parse failure and returned the text **unblanked**.
Demonstrated: with the fallback active, `` `[not-a-link](./missing.md)` `` — which
micromark does not render as a link at all — is exposed to the caller's regex, and
`move` treats it as a rewrite candidate.

So a parser bug would have turned a mutating tool loose on quoted examples: the
exact damage the blanker exists to prevent, arriving through its error path.

**It now throws.** The audit could not reach the catch by any means — 10,000
random documents, every UTF-16 code unit, the whole repo, all zero throws — so it
guards against a parser bug rather than against bad markdown, and the right
behaviour for a guard that fires is to stop.

## Finding 3 — ten rendered links that no gate has ever seen

Pre-existing, and missed identically by the old scanner. A link whose **label
wraps across a newline** matches nothing, because every caller applies its regex
one line at a time. Ten in this repo.

It also disproves a sentence the parser swap wrote about itself — *"the gate and
the renderer disagree about nothing by construction."* They agree about what
**code** is. What a **link** is still belongs to a regex. Corrected in the source,
and filed as
[`045`](../../../subtasks/110_tracker-ergonomics/045_a-link-whose-label-wraps-is-never-checked.md).

## What the audit's method is worth repeating

Every earlier check of these tools compared them against **themselves**. This one
counted from the other end — *does the set of links the gate sees equal the set
the renderer emits?* — and that is what surfaced ten links nobody had ever
checked, plus the exact-equality result that makes "no regression" a measurement
instead of a hope.
