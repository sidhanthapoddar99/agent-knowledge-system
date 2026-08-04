---
title: "Correct the records that argued for root-relative — 0.2.1 is tagged and pushed"
status: done
---

# Overview

**Three records argue for a fix that turned out to be wrong, and one of them is
published.** They were written before the cause was known, and each one blames
the authors of the content rather than the renderer.

The release note for **`0.2.1` is tagged and pushed**, so it cannot simply be
edited away — a reader who fetched that tag already has the wrong statement.

**Done when** all three say what actually happened, the release note carries a
correction rather than a quiet rewrite, and no record still recommends converting
content links to absolute form.

# References

- The real cause: [`010`](./010_renderer-drops-a-url-level.md)
- Why the recommended form was the wrong one:
  [`020`](./020_relative-links-are-the-contract.md)
- The revert: `ee404bb` on `fix/relative-link-rendering`
- The published note: `releases/0.2.1.md` — tag `v0.2.1`

# Todo list

**All six verified done 2026-08-04** — `0.2.1` carries dated correction blocks
with the original wording deliberately left visible, `030`'s and `040`'s
prescriptions are gone, and `CHANGELOG.md` never carried the claim.

- [x] `releases/0.2.1.md:79` — "All 101 are now root-relative. The section reads
      210 links checked, 0 broken." **This describes work that has been
      reverted.** Correct it, and say plainly that the diagnosis was wrong
- [x] Decide **how** to correct a published note: amend in place with a dated
      correction block, or leave it and correct in `0.2.2`. Recommended: a dated
      correction block in `0.2.1` **and** a line in the next release, because
      someone reading `0.2.1` alone must not be misled
- [x] [`030`](./030_user-guide-relative-links-404.md) — rewrite the *"Why
      root-relative, rather than fixing the relative form"* section. Keep the
      measurements; they were right. Replace the conclusion
- [x] [`040`](./040_site-wide-link-rot.md) — it currently prescribes "the same
      scripted root-relative rewrite" for 313 more links. Remove that
      prescription before anyone follows it
- [x] Re-check `CHANGELOG.md` for the same claim
- [x] Keep the wrong reasoning visible rather than deleting it — a corrected
      record teaches; a silently-fixed one repeats

# Outcomes and Next Steps

**Corrected 2026-08-03.**

`releases/0.2.1.md` carries a dated `[!CAUTION]` correction block rather than a
quiet rewrite — the tag is pushed, and two versions of one release note with no
indication that either changed is the same class of silent wrongness this whole
group is about. It states what was claimed, what turned out to be true, that the
**measurements were all correct and only the attribution was wrong**, and it ends
with the instruction a reader most needs: *do not convert relative links to
site-absolute form.*

That same file now carries a second dated correction, from
[`090/040`](../090_silent-failure-defects/040_two-commands-not-one-guess.md),
about the skill-link scan root. One release, two retractions.

**The line worth preserving was preserved.** *"Not one of 101 links got it
right"* stays, annotated with what it actually meant: 101 independently written
links failing identically is evidence about the tool. It is the most useful
sentence in this group — the moment the correct answer was written down and read
backwards.

~~Still open: the conclusions inside `030` and `040`.~~ **Both closed 2026-08-04**
with their wrong conclusions removed. The release note was corrected first
because it is the one a stranger reads.

# Details

## What each record claims, and what is true

| Record | Claim | Truth |
|---|---|---|
| `releases/0.2.1.md:79` | "All 101 are now root-relative" | Reverted. They are relative again |
| `releases/0.2.1.md:72` | "Every relative link in the issues user-guide was a 404 — all 85" | **True**, and still true — the renderer is unfixed |
| [`030`](./030_user-guide-relative-links-404.md) | Root-relative is right because writers cannot count `../` | Wrong. Writers counted correctly; the renderer dropped a level |
| [`040`](./040_site-wide-link-rot.md) | Fix the other 313 by the same rewrite | Wrong, and dangerous — it would spread the defect |

Note the split: **the measurements are all still valid.** Only the conclusions
are wrong. That distinction should survive into the corrected records, because
"the numbers were wrong" and "the numbers were right and I misread them" are very
different lessons.

## Why a published record gets a correction, not an edit

`v0.2.1` is tagged and pushed. Anyone who fetched it has the original text.
Quietly rewriting it produces two versions of the same release note with no
indication that either changed — which is the same class of silent wrongness this
whole group is about.

The recommendation is a **dated correction block inside `0.2.1.md`**, stating
what was claimed, what turned out to be true, and pointing at
[`010`](./010_renderer-drops-a-url-level.md). It costs a paragraph and leaves the
record honest.

## The line worth preserving

[`030`](./030_user-guide-relative-links-404.md) contains, as its argument for the
rewrite:

> *"not one of 101 links got it right"*

**Do not delete that sentence.** It is the single most useful line in this whole
group — it is the moment the correct answer was written down and read backwards.
Keep it, and annotate it with what it actually meant.

# Reopened — records the audits found still wrong

**Back to `in-progress` 2026-08-03.**

- [x] 🟢 **A published page still teaching the forbidden form — fixed 2026-08-04.**
  [`01_issue-md.md`](../../../../user-guide/19_issues/05_sub-docs/01_issue-md.md)
  said cross-links are *"usually maintained at the URL level
  (`/todo/<id>#goal`)"*. It had been missed while 16 sibling pages under
  `19_issues/` were edited. Now states the relative fragment as the only form,
  with the reason: it names the file on disk, so `move` follows it and an editor
  opens it.
- [x] 🟢 **The callout example — fixed 2026-08-04.**
  [`02_markdown-basics.md`](../../../../user-guide/15_writing-content/02_markdown-basics.md)
  demonstrated `[links](/user-guide)`. It sits inside a fence, so the gate skips
  it **by design** — which is exactly why it mattered: no check would ever have
  caught it, and a fenced example is what an author copies. Now a relative link
  to a page that exists.
- [x] 🟢 **The skill did not follow its own rule — fixed 2026-08-04.**
  `agent-ks-docs/SKILL.md` carried **12 backticked `references/…` paths against
  1 link**, in the same file that states *"reference by LINK, never by a
  backticked path"*. All 12 converted to the text-mirror form
  (`` [`references/writing.md`](./references/writing.md) ``), which keeps the
  path visible as text while making it maintainable — and `move` rewrites the
  text along with the target, so the two cannot drift.

  **A rule contradicted by the file stating it is worse than a rule stated
  nowhere**: a reader copies what they see, not what they are told.

- [x] ⬜ **"Say 129 converted, not 137" — checked, and it does not apply.** The
  two numbers count different things and the record already keeps them apart:

  | Figure | What it counts | Where |
  |---:|---|---|
  | 137 | site-absolute links that **existed** — 115 `user-guide` + 19 `dev-docs` + 3 tracker | the inventory, in [`020`](./020_relative-links-are-the-contract.md) *Details* |
  | 129 | links **converted** in `73ea791` | [`020`](./020_relative-links-are-the-contract.md) *Outcomes* |
  | 8 | left deliberately — 5 dead targets, 2 cross-issue tracker links, 1 remaining | the difference, and it is accounted for |

  Every occurrence of `137` in the group is an inventory statement, and no record
  claims 137 were converted. **Changing them would have introduced the error the
  finding was warning about.** Recorded rather than acted on — a finding that
  reads plausibly and is wrong is worth keeping visible.

# Closed 2026-08-04

**The original job was done on 2026-08-03** — `releases/0.2.1.md` carries a dated
correction block rather than a quiet rewrite, which is the whole point: the tag
is pushed, and two versions of one release note with no sign either changed is
the same silent wrongness this group exists to correct. That note now carries
**three** dated corrections.

The two subtasks this one was waiting on have since been closed with their wrong
conclusions removed: [`030`](./030_user-guide-relative-links-404.md) (the
argument for root-relative deleted, the measurement kept) and
[`040`](./040_site-wide-link-rot.md) (the prescription to rewrite 313 more links
retracted in place, and re-measured to **0**).

**Nothing published still recommends converting relative links to absolute
form.** Verified across the release notes, both skills, `guide.ts`, and the
user-guide and dev-docs content.
