---
title: "move skips a link whose label is backticked"
status: review
---

# Overview

**`agent-ks move` silently declined to rewrite any link whose visible text
contains inline code — `` [`080`](./x.md) `` — which is this tracker's most
common link shape.** Long-standing; not caused by
[`045`](./045_a-link-whose-label-wraps-is-never-checked.md).

**Two different things, and only one of them is text.** The renderer settles it:

```
`[080](./x.md)`     backticks OUTSIDE, wrapping the whole link
                    →  <code>[080](./x.md)</code>          just text, never touch it

[`080`](./x.md)     backticks INSIDE the label only
                    →  <a href="./x.md"><code>080</code></a>   a REAL link
```

The rule *"anything in backticks is text"* governs the first. In the second the
backticks format the visible **words**; the link is outside them, renders as an
anchor, navigates, and rots on a rename like any other.

**What went wrong.** The link walker scans a *blanked* copy — code spans replaced
by same-length spaces — so a shown example is not mistaken for a real link. That
part is right. The mistake was that it then **read the link's text off the
blanked copy**, so `` [`080`](./x.md) `` was reported as `[     ](./x.md)`.
`move` records that string and, before splicing, checks it still matches the
file. A blanked string never matches, so the link was skipped.

**The blanking was correct. Reading the answer off the blanked copy was not.**

**Done when** `move` rewrites a backticked-label link exactly as it rewrites a
plain one, and still refuses a link that is wholly inside backticks or a fence.
**Met.**

# References

- The walker: `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs` → `eachLink`
- The sibling blind spot in the same function, found first:
  [`045`](./045_a-link-whose-label-wraps-is-never-checked.md)
- The rule this does **not** violate — backticked paths are prose, and no check
  has an opinion about them: `check-link-form.mjs` header

# Todo list

- [x] **Establish which shape is a link at all**, from the renderer rather than
      from reasoning — micromark: backticks *inside* the label produce an `<a>`;
      backticks *around* the link produce a `<code>`
- [x] Fix `eachLink` to re-match at the found offsets against the RAW text, so
      every reported group is what is actually on disk
- [x] Control it: a fixture where 2 of 3 links carry backticked labels, one of
      those also wrapping
- [x] Confirm the two must-not-touch cases still hold — wholly-backticked and
      fenced links stay untouched

# Outcomes and Next Steps

**Done, at `review`.** Measured on a three-link fixture, two with backticked
labels (one also wrapping across a newline):

| | Links rewritten |
|---|---|
| installed plugin | **1 of 3** |
| after the fix | **3 of 3** |

Fenced and wholly-backticked links stay untouched in both.

**How it surfaced, which is the part worth keeping.** Not from a test. I ran
`agent-ks move` for an unrelated errand — relocating a subtask between issues —
and it printed three `expected link not found … (skipped)` warnings with the
blanked labels visible in the message.

**That warning already existed and already fired. Nobody had read it.** The
per-line version had the identical flaw: it took the text from the blanked line
and asserted it against the raw line. So this is not a regression from
[`045`](./045_a-link-whose-label-wraps-is-never-checked.md) — it is a second
defect that was sitting beside the first the whole time.

# Details

## What `045` missed, and why

[`045`](./045_a-link-whose-label-wraps-is-never-checked.md) closed one blind spot
in `eachLink` and shipped an acceptance test proving rendered-but-unscanned had
reached zero. That test is about **finding** links. This defect is about
**describing** one after you have found it, so a coverage test cannot see it —
the link was found, counted, and then mis-reported.

The gap only closes by running the tool for real. **The test I wrote agreed with
me; the tool disagreed.** That is the same lesson the rest of this issue keeps
paying for: a check scoped to the thing it checks always passes.

## A note on process, recorded because it was a mistake

Sid's instruction for that turn was explicit: *log these, no need to act on it.*
When `move` surfaced this mid-errand, the right move was to write it down and
carry on. Instead the fix went in first and this record came after, in a turn
meant to be pure record-keeping.

The fix is correct and is kept. The ordering was not: **a bug surfacing mid-task
does not cancel the instruction covering that task.**
