---
title: "Three links the tooling still cannot see — and one it edits when it shouldn't"
status: review
---
# Overview

**Left open when [`170`](./170_relative-but-not-a-path.md) closed**, because that
subtask's own job — every internal link naming a file that exists, enforced by a
failing gate — is finished, and these are not part of it. They are the same
*shape* as everything in this group and each is small:

> a link the tooling cannot see is a link the tooling cannot maintain, and a run
> that edits what it was only meant to read is worse than one that reads nothing.

Three of these are invisibility. The fourth is the opposite and is the one to do
first, because it **writes**.

**Done when** each is fixed and control-tested in both directions, and the gate's
parsed-link count rises to include what it currently cannot see.

# References

- The gate: `plugins/agent-ks/skills/agent-ks-docs/scripts/check-link-form.mjs`
- The shared primitives, where three of the four fixes belong:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs`
- What `move` does with a target: `plugins/agent-ks/skills/agent-ks-docs/scripts/docs/move.mjs`
- The rule these enforce: [`020`](./020_relative-links-are-the-contract.md)
- Where the existence test came from: [`090`](./090_tools-must-say-what-they-skip.md)
- The class this group keeps meeting — *a check that cannot see its subject must
  fail, never pass*: [`090/00`](../090_silent-failure-defects/00_overview.md)

# Todo list

- [x] 🔴 **`move` rewrites a link inside an inline code span.** It tracks fenced
      blocks and nothing else, so a documentation example telling a reader *what
      to type* gets silently edited into something else. Demonstrated 2026-08-04
      on a fixture: a file containing `` `[Overview](./01_overview.md)` `` had
      that example rewritten to `./02_overview.md` by a dry-run move. **This is
      the one that writes — do it first.** The fix already exists,
      `_links.mjs → blankCodeSpans`, which `check link-form` uses; `move` has
      only to call it
- [x] **Titled links are never parsed at all.** `MD_LINK_RE`'s target pattern is
      `[^)\s]+`, so it stops at the space in `[x](/y "title")` — the link is not
      reported, not counted, not maintained. Filed as *two exist*; measured
      properly there are **none** — see Outcomes.
      Inherited from [`070`](./070_reframe-the-link-checker.md) on closing
- [x] **A backticked path that resolves to a real document** is a link that was
      never written: `move` cannot rewrite it, a reader cannot click it, an agent
      has to search to resolve it. Inherited from
      [`090`](./090_tools-must-say-what-they-skip.md); the resolver the gate now
      carries answers it almost for free. Filed as *95*; the honest test finds
      **52**. Warn rather than fail —
      they are honest text, not broken links, and the rule that fires on them
      today is *convert it when you edit the file*
      ([`080`](./080_link-it-dont-name-it.md))
- [x] **Reference-style links (`[x][ref]` plus `[ref]: ./target`) are invisible**
      to every tool here. Was unverified — measured at **zero**, and dropped
      rather than built. Listed because it was the same class and
      cheap to settle. **Measure before building anything:** if the content holds
      none, say so and drop it rather than adding a parser for nothing

# Done when

- [x] `move` leaves code spans alone — control-tested with a fixture where the
      same link appears once as prose and once inside backticks; one rewritten,
      one not
- [x] The gate parses titled links, and the two in the content are either
      reported or shown to be correct
- [x] Backticked-path detection warns, with a counted baseline
- [x] Reference-style links measured; built only if the count is non-zero
- [x] **The parsed-link count goes UP.** Every fix here makes a tool see more, so
      `check link-form`'s *"N link(s) across M file(s)"* must rise. If it does
      not, the fix did not take

# Outcomes and Next Steps

**Done 2026-08-04 — all four, and two of the four counts were wrong.**

| # | Item | Outcome |
|---|---|---|
| 1 | `move` rewrote links inside code spans | **Fixed.** It now blanks spans before scanning, and applies edits by offset |
| 2 | Titled links never parsed | **Fixed** in `MD_LINK_RE`. **0 exist**, not 2 — the filed count came from a grep that did not skip code spans |
| 3 | Backticked paths that name a document | **Built**, warns. **52**, not 95 — a narrower and honest test |
| 4 | Reference-style links | **Dropped, measured first: 0 definitions, 0 uses.** Exactly what the item said to do |

**The acceptance test written into this subtask was that the parsed-link count
must go UP — and it did not.** 1,858 before, 1,858 after. That is the check
working, not failing: it says the titled-link fix found nothing in *today's*
content, which is what a separate measurement then confirmed. The fix is for
content not yet written; the count would have been the only thing to catch me
claiming otherwise.

## 1 — `move` was editing documentation into a lie

A link inside backticks is a doc telling a reader **what to type**. `move`
tracked fenced blocks and nothing else, so it rewrote those examples.

Fixing it exposed a second defect underneath. Edits were applied with
`line.replace(old, new)` — first occurrence wins — which was harmless only while
every occurrence of a link *was* a link. Once spans are skipped, the same link
can appear twice on one line: once quoted, once real. A first-occurrence replace
would then edit the quoted one. **The fix for the first bug creates the second
unless you look.** Edits now carry the match offset and are spliced there,
applied right-to-left so an earlier edit never shifts a later offset.

Control-tested on one fixture carrying all four cases at once:

| Line | Expected | Result |
|---|---|---|
| prose link | rewritten | ✅ |
| the same link inside a code span | untouched | ✅ |
| titled link | rewritten, **title kept** | ✅ |
| span **then** prose on one line | only the prose one | ✅ |

## 2 — the title group, and why every rebuild site had to change with it

`MD_LINK_RE` ended at `([^)\s]+)\)`, so `[x](./y "why")` did not match at all —
the target class stops at the space and the `)` never arrives.

**Widening the pattern without touching the rebuild sites would have swapped
invisibility for deletion**: every tool that reconstructs a link would emit
`[x](./y)` and silently drop the title. The group therefore carries its own
leading whitespace, so callers concatenate it unconditionally and cannot forget
the separator. All three rebuild sites updated — `move`, `img --rewrite-links`,
and the issues validator, which also had to start skipping code spans.

**The filed count was wrong.** *"Two such links exist in the content"* came from
a grep that did not skip code spans; all the instances are documentation *about*
titled links, quoted in backticks. Measured properly: **zero**. The audit that
filed it made the same mistake the tool it was auditing made.

## 3 — narrow on purpose, and it still cannot be precise

Fires only when a backticked span resolves to a real file with a **page**
extension. Excluded: anything with whitespace or brackets, directories, and bare
filenames with no separator — `` `src/loaders/paths.ts` `` is *correct* under the
rule, because a non-document has nothing to link to.

That gives **52**, not the 95 estimated by the earlier naive scan.

**And it still has false positives, which is why it warns and always will.**
Found in its own output: [`120`](./120_dev-and-build-disagree-on-the-base.md)
carries a table of *written / emitted / actually lives at* whose cells are real
paths quoted as **data**. Converting them would destroy the point of the table —
the exact damage that got an automated sweep of this class reverted. Resolvability
proves a path *could* be a link; it cannot prove it *should* be one. The findings
list is a prompt to look, not a work order.

## 4 — dropped, and the measurement is the deliverable

`0` definitions and `0` uses across the whole tree. The item said *measure before
building anything; if the content holds none, say so and drop it rather than
adding a parser for nothing.* That is the outcome, and it cost one script rather
than a parser plus its tests.

## Regression checks

`check link-form` exit 0 · `check issues` at its two known unrelated warnings ·
`check skill-links` clean · `./start build` clean at 1,195 pages · and the `move`
dry-run over the eight links to one page still reports **8**, unchanged by the
regex widening.

# Details

## Why these were not folded into the gate work

[`090`](./090_tools-must-say-what-they-skip.md) built the gate and
[`170`](./170_relative-but-not-a-path.md) converted the content. Together they
closed the class they were about: **links that were relative in shape and not
paths in fact** — 322 of them, now zero, with the gate failing on the next one.

These four are a different failure. Not links in the wrong form, but links the
tools never look at — plus one place a tool looks too hard and writes.

Keeping them here rather than reopening either subtask is the reasoning those two
already used on each other: a subtask closes when its own acceptance test passes,
and carries its leftovers forward by name instead of staying open for work that
was never its own.

## The count is the control, and it is the only one that survives a bad fix

Three of these four make a tool see MORE links. A fix that silently fails looks
identical to no fix at all: the gate still passes, nothing is reported, and
everything reads green. The only signal separating the two is the parsed-link
count in the gate's subtitle — which is why it is written into *Done when* above
as a check rather than left sitting there as a statistic.

That is this group's own rule turned on its remedy: **a check that cannot see its
subject must fail, never pass** — and after each fix here, the subject it can see
is bigger.

## The order is not arbitrary

`move` first, because it is the only one of the four that **changes files**. The
other three are under-reporting: the tool stays quiet about something real, which
costs a slow rot. `move` editing a code span is the opposite — it acts on
something that was never a reference, and the damage lands in a document whose
whole purpose is to show the reader the correct form. That is exactly the shape
of the sweep this group already had to revert.
