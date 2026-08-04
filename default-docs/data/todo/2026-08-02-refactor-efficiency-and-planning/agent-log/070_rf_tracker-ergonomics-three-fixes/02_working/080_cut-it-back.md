---
title: "Cut it back — the parser out, the backticked-path rule out"
status: done
agent: claude
---

# Goal

Sid, reading the audit: *"ham log over engineering to nahin kar rahe?"* — and
then, on the parser: *"simple piece of code rakho, keep it as simple as possible.
Revert that."*

He is right, and the evidence was already in the audit: over 1,056 files the
parser exposed **exactly the same links** as the code it replaced. It fixed
nothing that was real.

# Inputs

- [the parser audit](./070_the-parser-audit.md) — the 20× measurement
- Sid's rule, stated plainly: **only `[](…)` and `[[…]]` are links. Everything in
  backticks is text.**

# Expected Outcome

Less code, same results, and the limits written down instead of removed.

# Outcome

**Two things deleted, one kept, and every number held.**

## 1 · The backticked-path warning is gone

`check-link-form.mjs` warned whenever a code span named a real file — *"write it
as a link so `agent-ks move` maintains it."* **52 of them**, and every one was
telling an author to rewrite correct prose.

The rule could not tell a path being **named** from a path being **pointed at**:

```markdown
- `user-guide/05_getting-started/04_data-structure.md` — end-user explanation
```

That is a README listing the tree. Nothing is wrong with it. Converting this
class by sweep is what got 341 links reverted once already, and the rule was a
slower version of the same sweep.

**What stays is a convention for a reader, not a check** — convert one when you
meet it while editing. The bulk conversion is `migration/`'s, ran once.

## 2 · The parser is out

Three npm packages and an AST walk, replaced by ~35 lines with three rules: pair
runs of equal length, read the whole document, never cross a block boundary.

| | parser | simple |
|---|---|---|
| Links exposed over 1,058 files | 2,157 | **2,157 — 0 disagreements** |
| `check link-form` | 2.53 s | **0.08 s** |
| `check issues` | 2.01 s | **0.14 s** |
| Undeclared dependencies | 4 | **1** |

**The control is the middle row, and it is the whole argument.** Not "the gates
still pass" — the *set* of links each one exposes, compared item by item across
every file in the repo. Identical.

## 3 · The one thing kept, and it earned it

`fixtures/code-spans.test.mjs` — 31 cases, each asked of micromark and of our
code, failing on disagreement. It asserts nothing of its own.

It is now doing the job it is actually best at: **stating the limits rather than
hiding them.** 8 of 31 fail, and that is the deliverable —

| Direction | Count | Means |
|---|---|---|
| blanker hides a link micromark renders | **3** | the dangerous one: escaped backticks outside a span, a heading mid-span, a pipe-less GFM table |
| blanker shows a link micromark treats as code | **5** | noisy, not dangerous: indented code, raw HTML, a blockquote-wrapped span |

None of the 8 occurs in this repo. They are written down, in a file that runs in
under a second, instead of being engineered away for 20× the runtime.

**The first cut left 15 failures, 12 of them dangerous.** Adding one rule — a
span may not cross a block boundary — took that to 8 and 3. That was worth six
lines; chasing the last three would have been the parser again by another route.

## What this found on the way

**`node` cannot resolve the plugin's imports at all.** The dependency subtask
assumed the failure; running it produced it in one command. `node_modules` exists
only in `astro-doc-code/`, which is not an ancestor of the plugin scripts — the
CLI works because it `exec`s **`bun`**, which fetches a missing package on demand.
Recorded on
[`035`](../../../subtasks/110_tracker-ergonomics/035_the-plugin-declares-no-dependencies.md),
whose first task was exactly this and is now done.

**The five `check issues` warnings are not defects.** They are the issues-layout
testbed — `exploration/phase-1/deeper/test-level-3.md` — deliberate content for
nesting depth. Renaming them to satisfy the convention would break what they
test. Left alone, on purpose.

# Gates

| | |
|---|---|
| Link exposure, parser vs simple, 1,058 files | ✅ **2,157 = 2,157, 0 disagreements** |
| `check link-form` | ✅ 0 errors, **0 warnings** (was 52) |
| `check skill-links` | ✅ 44 files |
| `check issues` | ✅ 7 warnings, all pre-existing and all deliberate |
| `code-spans.test.mjs` | ⚠️ 8 of 31 diverge — **documented, none occurring in this repo** |
