---
title: "Thread inlined files into both loaders' caches"
status: review
---

# Overview

Make the asset-embed preprocessor report the files it inlines, and make both
content caches treat those files as dependencies of the page that inlined them.

Done when: editing a file referenced by `[[path]]` updates the served page —
in the tracker and in docs/blog alike — with no dev-server restart, and the
first-class diagram pages that already work keep working.

# References

- [the issue](../issue.md) — what was measured, why each loader misses it, and
  the shape of the fix.
- `astro-doc-code/src/loaders/diagram-pages.ts` — the `dependencyFiles`
  contract this mirrors. It is the existing right answer for "a page depends
  on a file that is not the page".

# Todo list

- [x] **A sink on `ProcessContext`** — an optional set the preprocessor writes
      absolute paths into. Optional so every other processor and every
      existing caller is unaffected.
- [x] **Record both embed sites** in `asset-embed.ts` — the plain `[[path]]`
      pass *and* the pass that runs inside fenced code blocks. The fenced one
      is the common case for diagram source, so missing it would leave the
      original bug in place.
- [x] **Return them** from `base-parser.parseMarkdownFile` on `LoadedContent`.
- [x] **`data.ts`** — add them to the array already handed to
      `cacheManager.setCache`.
- [x] **`issues.ts`** — carry the previous parse's set on the cache entry and
      add their mtimes to the signature.
- [x] **Verify with the same probe that found it**, including the control: a
      first-class diagram page must still update, and a `[[…]]` embed of a
      non-diagram file must now update too.

# Outcomes and Next Steps

**Landed.** One fact — "this page inlined that file" — produced once by the
preprocessor and consumed by both caches.

| File | Change |
|---|---|
| `parsers/types.ts` | `ProcessContext.embeddedFiles` sink + `LoadedContent.embeddedFiles` |
| `parsers/preprocessors/asset-embed.ts` | records at **both** embed sites — plain and inside fences |
| `parsers/core/base-parser.ts` | creates the sink per parse, returns what it caught |
| `loaders/data.ts` | folds them into the `setCache` dependency list |
| `loaders/issues.ts` | `CacheEntry.embedded` + their mtimes in the signature |

**Verified against the exact repro that found the bug**, server-side with the
browser removed, then again end to end:

| Case | Before | After |
|---|---|---|
| `[[../assets/embed-test.mmd]]` in a tracker note | 0 (stale) | **2** |
| `[[../assets/upstream-integrity-manifest.json]]` in a tracker note | 0 (stale) | **1** |
| *Control:* first-class `05_mermaid-full-page.mmd` | 1 | **1** — unchanged |

(The counts are marker occurrences in the served HTML; the `.mmd` case shows
twice because the source appears in the fence and in the rendered container.)

In a browser with the page left open, the `[[…]]` case now reports
`auto: true` — it updates with no manual reload, matching every other diagram
path.

Gates: build 1,229 pages · typecheck clean in every touched file · check
issues clean · skill-links clean · link-form clean for this change.

**Next:** none. The two remaining link-form errors in the tree belong to Sid's
`verification/` deletion and to untracked work under
`2026-05-08-runtime-stack-migration`.

# Details

## Why the sink, rather than returning a value

`Processor.process()` returns the transformed string; there is no second
return channel, and widening that signature would touch every processor for
one processor's need. A mutable set on the context is the smaller change and
matches how `addError` already reports out-of-band from inside a pass.

## Why `issues.ts` needs the previous set

Its signature is computed *before* the decision to parse, so on a cold cache
there is no set yet. Storing the set alongside the cached data closes the
loop: the first parse discovers the dependencies, and every subsequent
signature includes them. A newly *added* `[[…]]` needs no special handling —
adding it edits the markdown file, whose mtime is already in the walk.

## What not to do

Do not walk `assets/` in `computeSignature`. It would fix the symptom for the
tracker only, leave docs/blog broken, and make every request stat a tree that
is mostly irrelevant. The dependency is a fact the parse discovers, not a
directory to sweep.
