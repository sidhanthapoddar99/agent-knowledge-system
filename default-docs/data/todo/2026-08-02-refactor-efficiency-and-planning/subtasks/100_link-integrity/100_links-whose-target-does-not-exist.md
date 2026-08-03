---
title: "55 links point at pages that do not exist — visible only now the renderer is fixed"
status: open
---

# Overview

**With the renderer fixed, 55 broken in-body links remain, and none of them is a
rendering defect.** They were invisible while *every* relative link was broken —
you cannot see a wrong target in a set where every target fails.

Measured 2026-08-03 over the built site: 173 pages, 15,589 in-body links, 55
errors (down from 418 before the fix).

| Count | Kind | Fix |
|---:|---|---|
| 46 | Relative link whose target genuinely does not exist | correct the link, or create the page |
| 4 | `/blog/tag/…` | the tag feature was never built — remove the links or build it |
| 3 | Stale `/docs/…` base from a section rename | repoint at `/dev-docs/…` |
| 2 | Other site-absolute link with a missing target | correct or remove |

**Done when** `agent-ks check links` reports zero over the non-tracker sections,
and every link that was deleted rather than repaired is accounted for.

# References

- The fix that exposed them: [`010`](./010_renderer-drops-a-url-level.md)
- The measuring tool: [`070`](./070_reframe-the-link-checker.md)
- The form rule these must be corrected *into*:
  [`020`](./020_relative-links-are-the-contract.md) — relative, not absolute
- The gate that should stop them recurring:
  [`090`](./090_tools-must-say-what-they-skip.md)

# Todo list

- [ ] Work section by section, **gate after each**. Not one scripted sweep —
      the last mass link edit in this repo was 341 files and wrong
- [ ] For each: decide **repair or delete**, and never invent a target. A link to
      a page that was deliberately removed should go, not be repointed at the
      nearest survivor
- [ ] Correct into **relative** form. These are exactly the links that would
      "resolve" if written site-absolute, and would then be invisible to
      `agent-ks move` forever
- [ ] The 4 `/blog/tag/…` links need a product decision: build the tag route, or
      stop rendering tags as links
- [ ] Re-measure and record; the target is **0**, because a gate that is red on
      arrival is a gate people learn to ignore

# Outcomes and Next Steps

> [!NOTE]
> **PLACEHOLDER** — filed 2026-08-03 the moment the renderer fix made them
> visible. Not started.

# Details

## The worked example, so the shape is clear

`default-docs/data/user-guide/19_issues/01_overview.md:105`:

```markdown
- [Lifecycle and Review](./lifecycle-and-review) — the seven-status model
```

The file it means is at `19_issues/04_setup/06_lifecycle-and-review.md`. The link
is missing the `setup/` segment — it was written pointing at the wrong directory,
and has been wrong since it was written.

**Nothing could have caught it.** Before the renderer fix every relative link on
every non-index page 404'd, so a link that was *also* aimed at the wrong folder
looked exactly like its 100 correct neighbours. That is the same
indistinguishable-failure shape the sibling group
[`090`](../090_silent-failure-defects/00_overview.md) is named after: a defect
hidden inside a larger defect.

## Why this is filed separately rather than folded into the renderer fix

Because folding it in is precisely the error this group exists to correct.

A rendering measurement pointed at content once before and 341 files were edited
on the strength of it. The renderer fix is now verified in both directions and
changed **zero** content files — that separation is the evidence that the
diagnosis was right this time, and it survives only if the content corrections
are a different change with their own reasoning.
