---
title: "Three links the tooling still cannot see — and one it edits when it shouldn't"
status: open
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

- [ ] 🔴 **`move` rewrites a link inside an inline code span.** It tracks fenced
      blocks and nothing else, so a documentation example telling a reader *what
      to type* gets silently edited into something else. Demonstrated 2026-08-04
      on a fixture: a file containing `` `[Overview](./01_overview.md)` `` had
      that example rewritten to `./02_overview.md` by a dry-run move. **This is
      the one that writes — do it first.** The fix already exists,
      `_links.mjs → blankCodeSpans`, which `check link-form` uses; `move` has
      only to call it
- [ ] **Titled links are never parsed at all.** `MD_LINK_RE`'s target pattern is
      `[^)\s]+`, so it stops at the space in `[x](/y "title")` — the link is not
      reported, not counted, not maintained. **Two exist in the content today.**
      Inherited from [`070`](./070_reframe-the-link-checker.md) on closing
- [ ] **A backticked path that resolves to a real document** is a link that was
      never written: `move` cannot rewrite it, a reader cannot click it, an agent
      has to search to resolve it. Inherited from
      [`090`](./090_tools-must-say-what-they-skip.md); the resolver the gate now
      carries answers it almost for free. **95 exist.** Warn rather than fail —
      they are honest text, not broken links, and the rule that fires on them
      today is *convert it when you edit the file*
      ([`080`](./080_link-it-dont-name-it.md))
- [ ] **Reference-style links (`[x][ref]` plus `[ref]: ./target`) are invisible**
      to every tool here. Unverified — listed because it is the same class and
      cheap to settle. **Measure before building anything:** if the content holds
      none, say so and drop it rather than adding a parser for nothing

# Done when

- [ ] `move` leaves code spans alone — control-tested with a fixture where the
      same link appears once as prose and once inside backticks; one rewritten,
      one not
- [ ] The gate parses titled links, and the two in the content are either
      reported or shown to be correct
- [ ] Backticked-path detection warns, with a counted baseline
- [ ] Reference-style links measured; built only if the count is non-zero
- [ ] **The parsed-link count goes UP.** Every fix here makes a tool see more, so
      `check link-form`'s *"N link(s) across M file(s)"* must rise. If it does
      not, the fix did not take

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
