---
title: "Correct the record, and gate it"
outcome: "No published record still argues for the wrong form, and the rule is enforced by a tool rather than by prose"
who: claude
status: open
subtasks:
  - "[Correct the published records](../../subtasks/100_link-integrity/050_correct-the-published-records.md)"
  - "[Does the tracker share it?](../../subtasks/100_link-integrity/060_does-the-tracker-share-it.md)"
  - "[Reframe the link checker](../../subtasks/100_link-integrity/070_reframe-the-link-checker.md)"
  - "[The tools must say what they skip](../../subtasks/100_link-integrity/090_tools-must-say-what-they-skip.md)"
  - "[Site-wide link rot — re-measure](../../subtasks/100_link-integrity/040_site-wide-link-rot.md)"
---

## Todo

- [ ] Correct the three records. `v0.2.1` is **tagged and pushed** — a dated
      correction block, never a quiet rewrite. Keep the wrong reasoning visible
- [ ] Triage the tracker's 3,978 into the three populations before deciding
      whether the checker's tracker exclusion survives
- [ ] Commit the content link checker, reframed as a **rendering** gate
- [ ] Build the two guards: `move` reports every link it declined to maintain,
      `check` gates link form. **Baseline first — do not ship a gate that is red
      on arrival**
- [ ] Re-measure the site-wide counts and record before/after side by side
- [ ] Everything to `review`. **Nothing to `done`**

**Two gates, two questions — do not merge them.** The rendering gate asks *does
this link resolve?* and needs a build. The form gate asks *is this link
maintainable?* and needs only the markdown. A link can resolve perfectly and
still be unmaintainable — that is exactly what the 341 conversions produced, and
why the rendering gate alone would have called them clean.

**The line that has to survive this stage.** The record for
[`030`](../../subtasks/100_link-integrity/030_user-guide-relative-links-404.md)
contains, as its argument for the rewrite:

> *"not one of 101 links got it right"*

Do not delete it. Annotate it. It is the moment the correct answer was written
down and read backwards, and a corrected record teaches where a silently-fixed
one repeats.
