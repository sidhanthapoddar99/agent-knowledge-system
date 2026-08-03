---
title: "The tools skip links silently — move must report what it declined, and check must gate link form"
status: open
---

# Overview

**Every rule in this group is currently enforced by prose, and prose is what
failed.** `020` and `080` fix the wording. This subtask makes the wording
unnecessary.

Two tools already have all the information and say nothing with it:

- **`agent-ks move`** resolves every markdown link and rewrites it. When it meets
  a site-absolute link it returns early and moves on — **no count, no warning,
  nothing in the output.** A run that maintained 40 links and abandoned 12 looks
  exactly like a run that maintained 52.
- **`agent-ks check`** has no opinion about link form at all. Three separate
  checks run over this repo and none of them would have flagged the 341
  conversions. That is why Sid reading a diff was the only thing that caught it.

**Sid decided 2026-08-03 that this checking should exist** — it was previously an
open question inside [`020`](./020_relative-links-are-the-contract.md).

**Done when** `move` reports every link it declined to maintain, `check` fails on
a site-absolute internal link and on a backticked path that could have been a
link, and both are control-tested in each direction.

# References

- The rule being enforced: [`020`](./020_relative-links-are-the-contract.md)
- The other rule being enforced: [`080`](./080_link-it-dont-name-it.md)
- The skip, in code: `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs`
  → `isIgnorableTarget`, line 28
- What rewrites the survivors: `plugins/agent-ks/skills/agent-ks-docs/scripts/docs/move.mjs`
- The other link gate, which measures **resolution** rather than **form**:
  [`070`](./070_reframe-the-link-checker.md)
- The rule this group produced, from the sibling group:
  [`090/00`](../090_silent-failure-defects/00_overview.md) — *a check that cannot
  see its subject must fail, never pass*

# Todo list

- [ ] **`move` reports its skips.** Every link it declined, with the file and the
      target, and a one-line summary: *"N links left unmaintained (site-absolute —
      `move` cannot rewrite these)."* Silence currently reads as success
- [ ] Decide whether a skip should be a **warning or a failure** in `move`.
      Recommended: warning. `move` is doing its job correctly; the defect is in
      the content it met, and refusing to move a file over it would be
      disproportionate
- [ ] **`check` gains a link-form gate** — a site-absolute link to an internal
      target is an error. External `http(s)` untouched. The cross-section
      exception, if [`020`](./020_relative-links-are-the-contract.md) confirms one
      exists, is encoded here rather than remembered
- [ ] **`check` flags a backticked path that resolves to a real file** — the
      [`080`](./080_link-it-dont-name-it.md) rule. Only when the path resolves;
      guessing at prose is how a gate becomes noise people disable
- [ ] Baseline the gate against today's tree **before** enforcing: 137
      site-absolute links exist right now (measured, see
      [`020`](./020_relative-links-are-the-contract.md)). Decide what the gate
      does about pre-existing ones — fix-then-enforce, or grandfather with a
      recorded list. **Do not ship a gate that is red on arrival**
- [ ] Control-test both directions for each gate: it fires on the defect, and it
      stays quiet on a clean tree. Neither half alone proves anything
- [ ] Assert a non-zero count of links examined — a run that inspected nothing
      fails rather than passing

# Outcomes and Next Steps

> [!NOTE]
> **PLACEHOLDER** — decided 2026-08-03, not started. Depends on
> [`020`](./020_relative-links-are-the-contract.md) settling the cross-section
> exception, because the gate has to encode it.

# Details

## Two gates, two different questions — do not merge them

There is now a link checker in [`070`](./070_reframe-the-link-checker.md) and a
link-form gate here. They sound like one tool and are not:

| Gate | Question | Needs |
|---|---|---|
| [`070`](./070_reframe-the-link-checker.md) | Does this link **resolve** in the built site? | a `dist/` — runs after a build |
| this one | Is this link in the **form our tooling can maintain**? | the markdown only — runs anywhere, instantly |

A link can resolve perfectly and still be unmaintainable — that is precisely what
the 341 conversions produced, and why `070` alone would have reported them clean.
Merging the two would put a fast source check behind a slow build.

## Why `move`'s silence is the root of the whole group

The 341 links were converted to a form that **opts out of link maintenance
permanently**. Had `move` printed *"12 links skipped — site-absolute, not
maintained"* even once during that work, the contradiction would have surfaced in
the ordinary course of using the tool.

It printed nothing, because from `move`'s point of view nothing went wrong. The
skip is correct behaviour — `move` genuinely cannot know what URL prefix a
section publishes under. **The defect is not the skip. It is that the skip is
invisible**, so a shrinking set of maintained links looks identical to a healthy
one.

That is the same shape as every item in the sibling group
[`090`](../090_silent-failure-defects/00_overview.md): a true statement about a
smaller subject than the reader believes.

## The rule this makes structural

Both [`020`](./020_relative-links-are-the-contract.md) and
[`080`](./080_link-it-dont-name-it.md) end in prose that someone has to read and
remember. This subtask is what makes them hold on a day nobody is thinking about
links — which is the only day that matters, because the 341 conversions were
performed by someone who had read both skill files that same week.
