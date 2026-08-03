---
title: "One link rule and a regression"
status: done
agent: claude
---

# Goal

State one link-form rule on every surface that teaches it, convert the content
that violates it, and take the broken-target count to zero.

# Inputs

- [`020` — relative links are the contract](../../../subtasks/100_link-integrity/020_relative-links-are-the-contract.md)
- [`080` — link it, don't name it](../../../subtasks/100_link-integrity/080_link-it-dont-name-it.md)
- [`100` — links whose target does not exist](../../../subtasks/100_link-integrity/100_links-whose-target-does-not-exist.md)

# Expected Outcome

No surface offers the wrong form as an option; the 137 site-absolute links are
accounted for; broken in-body links reach zero — with a gate run after every
batch, never one scripted sweep.

# Outcome

**Done, and the round found two things nobody had asked for.**

## The exception was checked, and it does not exist

`020` said to verify the cross-section exception against `move.mjs` rather than
assume it. A dry-run move of `05_getting-started/03_aliases.md` rewrote
`[Path Aliases](../../05_getting-started/03_aliases.md)` from inside
`10_configuration/03_site/` — correctly.

So **cross-section relative links are maintained**, and the user guide's 115
"cross-section absolute" links were never a convention. They were 115 links that
had opted out of maintenance, and the belief that they represented a rule was an
inference from counting links. The rule got *simpler* instead of gaining a
carve-out.

## The conversion, batched and gated

| Directory | Absolute before | After | Broken links after batch |
|---|---:|---:|---:|
| `dev-docs/` | 19 | 0 | 55 (unchanged) |
| `user-guide/` | 115 | 1 | 55 (unchanged) |

**Unchanged is the correct result.** The conversion fixed nothing and broke
nothing; it moved links back into maintenance without touching what they point
at. A change in that column would have meant the rewrite had altered meaning.

## Then the broken targets: 55 → 0

42 repaired by matching the target's basename within the section and fixing
**only where that match was unique** — 0 ambiguous, nothing invented. Cause was
`19_issues/` being reorganised into subfolders while its links kept pointing at
the old flat layout, invisible for as long as *every* relative link was broken.

**The fence guard was added before applying, not after.** A link inside a fenced
block is syntax being shown; rewriting one silently corrupts a worked example.
Adding it removed 13 false candidates and changed **none** of the 42 — which is
the useful result, because it proved the repairs were all in prose.

Eight more were reasoned individually, and four blog tags turned out to be a
different thing: `PostBody.astro` rendered every tag as a link to `/blog/tag/…`,
a route that was never built. They are `<span>` now, and the hover underline went
with them — nothing should look clickable when nothing happens on click.

## The regression I introduced in stage 20, caught here

The renderer fix had also shifted links to **colocated files**, which `asset-src`
resolves against the source file's directory rather than the page URL. The same
scene file, in the same page, came out two ways:

```
<img>  /content-assets/user-guide/15_writing-content/assets/diagram-showcase.excalidraw   ✓
<a>    /content-assets/user-guide/assets/diagram-showcase.excalidraw                      ✗
```

`internal-links` now returns any href with a non-markdown extension untouched.

**It was found by tracing one link into its built output — not by the count**,
which had gone 418 → 55 and looked like success. That is the lesson of the round:
*a count improving is not evidence a change is correct.*

## Not done

The backticked-path content sweep. The rule is live on all five surfaces; the
~44 existing instances need judgement per instance and were not attempted.
Recorded on [`080`](../../../subtasks/100_link-integrity/080_link-it-dont-name-it.md)
rather than quietly dropped.
