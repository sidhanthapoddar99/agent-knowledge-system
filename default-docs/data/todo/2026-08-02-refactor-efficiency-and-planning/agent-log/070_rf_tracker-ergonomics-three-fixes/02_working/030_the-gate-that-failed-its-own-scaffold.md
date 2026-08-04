---
title: "The link gate failed every freshly scaffolded agent log — a code span that wraps"
status: done
agent: claude
---

# Goal

Not planned. Running `agent-ks check link-form` to verify round 02 turned up an
error inside **this run's own** `01_summary.md` — a link the scaffolder's `# Todo`
template deliberately *shows* rather than uses. Every agent log created by the
tool has failed the gate since the existence test shipped.

# Inputs

- `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs`
- `plugins/agent-ks/skills/agent-ks-docs/scripts/check-link-form.mjs`

# Expected Outcome

The fix, and which finding it closes.

# Outcome

## Two bugs, and the second was mine

**Bug one — a code span that wraps.** `blankCodeSpans` works one line at a time,
and a markdown code span may open on one line and close on the next. The
scaffolder's template is exactly that:

```
> `- [x] [The plans section](../../subtasks/010_plans.md) — framework, CLI and
> validator; four new scaffolders`
```

A line-based blanker cannot see that span, so the link inside it was scanned as
content. **The gate was accusing the tool's own output of the thing the output is
teaching** — the same shape as the double-backtick false positive found the day
before, one level up.

Fixed with `blankCodeSpansDoc`, which blanks **per paragraph** rather than per
line. Not over the whole document: a span never crosses a blank line in markdown,
and pairing across one would let two unrelated stray backticks swallow everything
between them — trading a false positive for a false negative, which is worse.
Fenced blocks are emptied before matching, which also puts a blank line either
side of every fence so nothing pairs across one.

**Bug two — I introduced it, and the gate caught it in one run.** The first
version reused the regex `/(`+)[\s\S]*?\1/`. Over a whole paragraph that
backtracks: given a stray run of three backticks with no partner, it matches
**one** of the three, pairs it with the next unrelated single backtick, blanks
everything between, and leaves the real span after it exposed. It removed the
original false positive and produced a different one, in a file whose subject is
false positives.

The regex is gone. Both blankers now share a hand-written scanner that reads the
full run, looks for a run of exactly that length, and — **when there is none —
emits the run as itself and carries on**, which is what markdown does.

## Control test — eight cases, both directions

Run as a fixture, not against the tree, because a control that only ever asks
"is it quiet now?" cannot tell silence from correctness.

| Case | Wanted | Result |
|---|---|---|
| a bare link in prose | survives | ✅ |
| `` `[x](./q.md)` `` — single-backtick span | blanked | ✅ |
| ` `` [`x`](./q.md) `` ` — double-backtick span | blanked | ✅ |
| a stray ` ``` ` run followed by a real span | the span is blanked, not the gap | ✅ |
| a stray ` ``` ` run followed by a real **link** | the link survives | ✅ |
| the wrapped template span | blanked | ✅ |
| a real link one paragraph after it | survives | ✅ |
| byte length and line count of the blanked text | unchanged, so columns still line up | ✅ |

**Rows four and five are the ones that matter** — they are bug two stated as a
test, and either alone would pass a broken implementation. Whole-tree result:
`link-form` went from 1 error to **0**, warnings unchanged at 52, and neither the
issues nor the skill-links gate moved.
