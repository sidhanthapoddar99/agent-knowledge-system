---
title: "A link whose label wraps across a newline is invisible to every gate"
status: open
---

# Overview

**Ten links in this repo render correctly and are checked by nothing.** Their
label crosses a newline:

```markdown
[the Opus skill-consistency
  read](./141_audit-skill-consistency-opus.md)
```

Every link-walking tool — `check link-form`, `check skill-links`, `check issues`,
and `agent-ks move` — matches links with a regex applied **one line at a time**,
so neither half of that matches anything.

**This is pre-existing and was not caused by the parser swap** — the old
hand-written blanker missed exactly the same ten. It was found by the audit of
that swap, which compared the links the gates expose against the links the
renderer actually produces: 2,152 exposed, 2,162 rendered, and the difference is
these ten plus two autolinks that are deliberately out of scope.

**Why it matters more than ten links:** `move` cannot maintain what it cannot
see, so any one of these rots silently on the next rename — which is the precise
failure the whole link-integrity effort exists to remove.

**Done when** a link is found wherever the renderer finds one, and the count of
*rendered but unscanned* links is zero and stays zero.

# References

- Where the ten are, with `file:line`: the audit in
  [`070`](../../agent-log/070_rf_tracker-ergonomics-three-fixes/02_working/070_the-parser-audit.md)
- The shared blanker they get scanned through:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs`

# Todo list

- [ ] **Decide the shape.** The blanker already parses; the *link matching* does
      not. Taking link nodes from the same mdast tree would close this and delete
      `MD_LINK_RE` — but that regex has capture groups every rewriting caller
      depends on (`move` reassembles `[text](target "title")`), so the callers
      change too
- [ ] Keep the differential as the acceptance test: **rendered-but-unscanned must
      reach zero**, measured over the whole tree, not over a fixture
- [ ] Fix the ten, or confirm the mechanism fixes them without editing content

# Outcomes and Next Steps

**Open.** Raised 2026-08-04 by the audit of the parser swap. Deliberately not
folded into that change: the swap fixed what *code* is, and this is about what a
*link* is — one mechanism each, and the second one rewrites four callers.

# Details

## Why this was invisible until an oracle was used

Every previous check of these tools compared them against **themselves** — a
fixture of cases someone had already met. This one asked a different question:
*does the set of links the gate sees equal the set the renderer emits?*

That is the same move that has found every real defect in this issue. **A tool
cannot report the links it never looked at**, so the only way to see the gap is
to count from the other end.
