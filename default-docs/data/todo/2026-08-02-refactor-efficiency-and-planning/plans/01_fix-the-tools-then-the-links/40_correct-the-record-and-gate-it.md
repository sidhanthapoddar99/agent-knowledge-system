---
title: "Correct the record, and gate it"
outcome: "No published record still argues for the wrong form, and the rule is enforced by a tool rather than by prose"
who: claude
status: done
subtasks:
  - "[Correct the published records](../../subtasks/100_link-integrity/050_correct-the-published-records.md)"
  - "[Does the tracker share it?](../../subtasks/100_link-integrity/060_does-the-tracker-share-it.md)"
  - "[Reframe the link checker](../../subtasks/100_link-integrity/070_reframe-the-link-checker.md)"
  - "[The tools must say what they skip](../../subtasks/100_link-integrity/090_tools-must-say-what-they-skip.md)"
  - "[Site-wide link rot — re-measure](../../subtasks/100_link-integrity/040_site-wide-link-rot.md)"
---

## Todo

- [x] Correct the published record — `releases/0.2.1.md` carries a dated
      `[!CAUTION]` block, and the *"not one of 101 links got it right"* line is
      kept and annotated rather than deleted
- [ ] **Triage the tracker — NOT DONE.** Measured instead: 1,372 broken with
      `--all`, dominated by relative links, against a pipeline that re-roots
      links itself. The exclusion now rests on that measurement rather than on an
      invented principle, and the triage stays open on
      [`060`](../../subtasks/100_link-integrity/060_does-the-tracker-share-it.md)
- [x] Commit the content link checker, reframed — it now names which layer to
      suspect, in order, and forbids the site-absolute "fix"
- [x] Build the guards — `move` reports every link it declined; `check link-form`
      is a new source-only gate, **green on arrival** because the tree was taken
      to zero first
- [x] Re-measure and record before/after
- [x] Everything to `review`. **Nothing to `done`**
- [ ] `040`'s own prescription — still argues for the root-relative rewrite in
      its Details. Not retracted

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
