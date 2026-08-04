---
title: "A link whose label wraps across a newline is invisible to every gate"
status: done
---

# Overview

**Eight links in this repo rendered correctly and were checked by nothing.**
Their label crosses a newline:

```markdown
[the Opus skill-consistency
  read](./141_audit-skill-consistency-opus.md)
```

Every link-walking tool — `check link-form`, `check skill-links`, `check issues`,
`agent-ks move` and `agent-ks img --rewrite-links` — applied its regex **one line
at a time**, so neither half of that matched anything.

**The regex was never the problem.** `MD_LINK_RE`'s label group is `[^\]]*`, and
a negated character class already matches newlines — over a whole document it
finds a wrapped link fine. It had only ever been fed one line at a time.

**Why it mattered more than eight links:** `move` cannot maintain what it cannot
see, so any one of these rots silently on the next rename — the precise failure
the whole link-integrity effort exists to remove. **Two of the eight were already
broken** and nothing had ever reported them.

**Done when** a link is found wherever the renderer finds one, and the count of
*rendered but unscanned* links is zero and stays zero. **Met** —
`fixtures/link-coverage.test.mjs` measures exactly that against micromark, and
reports 0 over 1,974 rendered links.

# References

- Where the eight were, with `file:line`: the audit in
  [`070`](../../agent-log/070_rf_tracker-ergonomics-three-fixes/02_working/070_the-parser-audit.md)
- The shared walker: `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs`
  → `eachLink` / `rewriteLinks`
- The acceptance test:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/fixtures/link-coverage.test.mjs`

# Todo list

- [x] **Decide the shape.** *The plan written here was wrong twice over* — it
      said to take link nodes from the mdast tree and delete `MD_LINK_RE`, but
      that tree left with the parser revert **and was never needed**: the regex
      already handles a wrapped label. Only the iteration was broken
- [x] One shared `eachLink(text)` — whole-document, fenced blocks and code spans
      blanked, `line`/`col` derived from the match offset
- [x] `rewriteLinks(text, replacer)` for the two callers that WRITE, splicing by
      offset instead of rebuilding line by line
- [x] Switch all **five** callers (the subtask said four; `check skill-links` was
      the one nobody had counted)
- [x] Keep the differential as the acceptance test: **rendered-but-unscanned must
      reach zero**, measured over the whole tree, not over a fixture
- [x] Control the acceptance test — re-run it with the OLD per-line scan and
      confirm it reports the gap rather than passing
- [x] Fix the two links that turned out to be genuinely broken

# Outcomes and Next Steps

**Done.** Rendered-but-unscanned is **0**, from 8.

| | Before | After |
|---|---|---|
| links `check link-form` sees | 1,956 | 1,964 |
| rendered but unscanned (vs micromark) | 8 | **0** |
| `move` link edits on the control fixture | 1 | **2** |
| `check link-form` runtime | 0.08 s | 0.09 s |

**Two of the eight were broken, and had been all along:**

| Link | What was wrong |
|---|---|
| `../notes/70_reference-by-link-never-by-number.md` | wrong depth — the file is real, but from `subtasks/080_…/` it needed `../../notes/`. The link was in a paragraph citing *"reference by link, never by number"* |
| `./diagram-showcase` | no prefix, no extension — the file is `01_diagram-showcase.md` |

Neither could have been found by any gate. That is the whole argument for this
subtask in two lines: the tools were silent not because the links were fine, but
because the tools never looked at them.

**A third defect fell out on the way.** `agent-ks img --rewrite-links` ran
`txt.replace(MD_LINK_RE, …)` over the raw text with **no fence or code-span
handling at all** — so it would rewrite an image reference inside a worked
example, the same damage `move` was fixed for in August. Routing it through
`rewriteLinks` fixed that as a side effect of sharing one implementation.

# Details

## What actually changed

Two functions in `_links.mjs`, and every caller lost code:

```
  eachLink(text)                    →  every link, in order, with line/col/offset
  rewriteLinks(text, replacer)      →  splice by offset, right-to-left
  blankFencesDoc(text)              →  the fence tracker, applied to a document
```

`blankFencesDoc` exists because a per-line state machine cannot be combined with
a whole-document scan. It is the **same** `makeFenceTracker`, fed the text
instead of a loop, so the two cannot drift apart.

`move` was the one to be careful with, because it writes. It used to record a
**column** and splice within a line; it now records a **document offset** and
splices the whole text. That is what makes a wrapped link rewritable at all — and
it deleted the line-array reassembly rather than adding to it.

## The five callers, not four

The subtask said four. `check-skill-links.mjs` was the fifth, and it is the same
file that had kept a private two-regex link matcher for months after the others
moved off it. **A shared classification with private copies is as many answers as
there are copies** — this is the third time that has been the finding.

## How it was accepted, and how the acceptance was controlled

`fixtures/link-coverage.test.mjs` renders every file with **micromark**, pulls
every `<a href>` out of the HTML, and compares that set against what `eachLink`
reports. It asserts nothing of its own.

That question cannot be answered from inside the tooling. Every earlier check of
these gates compared them against a fixture — cases someone had already met —
which is exactly why eight links stayed invisible for the tool's whole life. **A
tool cannot report the links it never looked at**, so the only way to see the gap
is to count from the other end.

**Then the test was controlled**, because a coverage test that passes on the
first run is the one to distrust. Re-run with the old per-line scan substituted
in, it reports **8 rendered-but-unscanned** and names all eight. With the new
walker it reports 0. The test can fail, and it fails on exactly the defect it
exists to catch.

`move` got its own control fixture — a normal link, two links on one line, a
wrapped label, a link inside a fence, and a link inside a code span. After the
move: the wrapped one rewritten with its wrap intact, both same-line links
rewritten, and **the fenced and spanned ones untouched**. The same fixture
through the installed 0.8.2 plugin plans **1** edit where this tree plans 2.

## Performance

Estimated to be a wash and it was: `check link-form` 0.08 s → 0.09 s over ~1,960
links. Fewer regex invocations (one pass per file rather than one per line),
against a small offset→line lookup per match. Nothing here needed protecting.
