---
title: "Records and guards"
status: done
agent: claude
---

# Goal

Stop the published record recommending a fix that was reverted, and replace the
prose rules with tools — so the link form holds on a day nobody is thinking about
links.

# Inputs

- [`050` — correct the published records](../../../subtasks/100_link-integrity/050_correct-the-published-records.md)
- [`070` — reframe the link checker](../../../subtasks/100_link-integrity/070_reframe-the-link-checker.md)
- [`090` — the tools must say what they skip](../../../subtasks/100_link-integrity/090_tools-must-say-what-they-skip.md)

# Expected Outcome

No published record still argues for the site-absolute rewrite; `move` reports
every link it declined to maintain; `check` gates link form — and neither gate is
red on arrival.

# Outcome

**Done, with one item measured instead of triaged and said so.**

## The record: a dated correction, never a quiet rewrite

`v0.2.1` is tagged and pushed, so anyone who fetched it holds the original text.
Rewriting it in place would produce two versions of one release note with no
indication either changed — the same class of silent wrongness this group is
about. It now carries a dated `[!CAUTION]` block stating that **the measurements
were all correct and only the attribution was wrong**, and ending with the
instruction a stranger most needs: *do not convert relative links to
site-absolute form.*

*"Not one of 101 links got it right"* was kept and annotated, not deleted. It is
the most useful sentence in the group — the moment the correct answer was written
down and read backwards.

## The checker: it now names which layer to suspect

`check-content-links.mjs` was written while the wrong cause was believed, and its
header blamed authors. It now says, in order: **the renderer first, the target
second, the author third** — with the reason attached, that uniform failure
across independent authors is evidence about the tool.

Its tracker exclusion was justified by an invented principle (*"a rotted link is
history"*). It is now justified by a measurement:

| Scope | Pages | Broken |
|---|---:|---:|
| default — docs sections | 173 | **0** |
| `--all` — with the tracker | 978 | **1,372** |

The exclusion stands on that ground, and the header says plainly that the triage
has **not** been done. One signal handed to
[`060`](../../../subtasks/100_link-integrity/060_does-the-tracker-share-it.md):
the tracker's failures are dominated by *relative* links, against a pipeline that
re-roots links itself — a lead, not a conclusion.

## The guards

**`agent-ks move` now reports what it declined.** The skip was always correct;
the *silence* is what let 341 links leave maintenance unnoticed. A run that
maintained 40 links and abandoned 12 looked exactly like one that maintained 52.
Warning, not failure — `move` is doing its job, and refusing to move a file over
someone else's link form would be disproportionate.

**`agent-ks check link-form` is new, and deliberately not merged with
`check links`:**

| Gate | Question | Needs |
|---|---|---|
| `check links` | does this link **resolve**? | a built `dist/` |
| `check link-form` | is this link **maintainable**? | the markdown only, instant |

A link can resolve perfectly and be unmaintainable — that is exactly what the 341
conversions were, and why the resolution gate alone would have called them clean.

Two false-positive classes were closed before shipping, both found by running it
rather than reasoning about it: fenced blocks, and **inline code spans** —
documentation that quotes the wrong form in order to forbid it must not trip the
gate that forbids it.

## What is deliberately unbuilt

`check` does not flag a backticked path that could have been a link. It needs the
[`080`](../../../subtasks/100_link-integrity/080_link-it-dont-name-it.md) content
sweep alongside it; shipping it now would light up ~44 existing instances.
**A gate that is red on arrival is a gate people learn to ignore.**
