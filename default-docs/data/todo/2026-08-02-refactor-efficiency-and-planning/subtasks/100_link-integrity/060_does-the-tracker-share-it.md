---
title: "Answered: the tracker does not share the off-by-one, and does not need to"
status: done
---

# Overview

**One probe suggests the tracker has the same broken link resolution as the docs.
It contradicts what the code comments say, and it has not been confirmed. Nothing
should be changed on the strength of it.**

This subtask exists to *settle the question*, not to act on it. It is filed
separately and marked unverified on purpose — the whole reason this group exists
is that a single unconfirmed reading was acted on last time.

**Done when** there is a yes or no backed by a reproduction, and either a fix is
scoped or the question is closed as "the tracker is fine".

# References

- The docs-side defect this may or may not mirror:
  [`010`](./010_renderer-drops-a-url-level.md)
- The tracker's own link pass, which claims sub-docs are already correct:
  `astro-doc-code/src/parsers/postprocessors/issue-body-links.ts` — see the
  header comment, lines 11–13
- The shared pass that runs for every content type:
  `astro-doc-code/src/parsers/postprocessors/internal-links.ts`
- The measurement that first counted tracker breakage:
  [`040`](./040_site-wide-link-rot.md) — 3,978 of 43,580

# Todo list

- [x] Reproduce the probe properly: serve `dist/` and follow a tracker link over
      **real HTTP**, recording the status code — not by reasoning about paths
- [x] Work out why `issue-body-links.ts` did **not** appear to fire on the page
      probed. Either it is not running, or the probe read the wrong page, or the
      comment is describing intent rather than behaviour
- [x] Separate the three populations in [`040`](./040_site-wide-link-rot.md)'s
      3,978 before drawing any conclusion:
      **(a)** demo and fixture issues pointing at deliberately fictional paths
      (`/docs/api`, `/contact`) — not defects;
      **(b)** links whose target was genuinely deleted — history, not defects;
      **(c)** correct links broken by the renderer — the only real ones
- [x] Only then decide whether the tracker needs a fix, and whether it is the
      same fix as [`010`](./010_renderer-drops-a-url-level.md)
- [x] If the header comment on `issue-body-links.ts` turns out to be wrong,
      correct it — a comment asserting correctness is what stopped this being
      looked at sooner. **Done 2026-08-04, and it was wrong in the way that
      matters most: right conclusion, wrong reason** — see below

# Outcomes and Next Steps

**Answered 2026-08-03 by clicking, in [`110`](./110_live-check.md). No.**

**The tracker does not share the docs off-by-one, and the reason is that it does
not have the condition that causes it.** Two properties, both verified by
request:

| Property | Docs | Tracker |
|---|---|---|
| Page URL ends in a slash | yes, in the built site | no |
| URL keeps the `NN_` prefix | no — stripped | **yes** |

With no trailing slash, the browser already resolves `./x` against the parent
directory, which is where the author meant it. With prefixes kept, the source
path and the URL path are the same string. So a relative link written against the
filesystem is correct as written, and a shift would break it.

Twelve of fifteen links opened the right page, covering every within-tracker
shape: sibling, cross-group, up-two, up-three into another issue, nested,
anchored, and slug-form.

### What the 1,372 actually was

Not link rot, and not a second transform bug. It is what `dist/` reports for a
tracker whose links resolve correctly in a browser — **the built site adds the
trailing slash the dev server omits**, so a static read of `dist/` and a live
request disagree about what every relative href means. That gap is the real
defect and it is now [`120`](./120_dev-and-build-disagree-on-the-base.md).

The tracker exclusion in both gates therefore **stands, but for a new reason**:
not "tracker links are broken and we are hiding it", but "the gate reads the one
environment where the question cannot be asked."

### What is genuinely broken, and it is not this subtask's subject

A tracker link that **leaves** the tracker — into docs or blog — keeps the source
spelling, because the target section's slug transform is never applied. Plus a
plan's `overview.md`, which is not a route of its own. Both on
[`120`](./120_dev-and-build-disagree-on-the-base.md).

# Details

## What the probe showed

Against the built site:

```
page:              /todo/2026-04-10-editor-core/
emitted href:      ../notes/01_client-side-rendering
browser resolves:  /todo/notes/01_client-side-rendering
that target:       does not exist
```

Taken alone, that is the same shape as the docs defect.

## Why it is not being believed yet

`issue-body-links.ts` exists precisely to re-root links on an issue's root
`issue.md`, and the page probed **is** that page. If it had fired, the emitted
href would have been re-rooted at the issue folder — and it plainly was not. So
one of these is true, and none has been established:

1. The postprocessor is not running on this page at all.
2. The probe picked up a link from somewhere other than the issue body.
3. The postprocessor runs and its output is still wrong.

The header comment claims sub-doc pages "are served at a URL depth that MATCHES
their file depth, so their relative links already resolve correctly". That
comment compares **segment counts**. Relative resolution does not care about
segment counts — it cares whether the base is a file or a directory. A page
served at `…/name/` is a directory base regardless of how many segments precede
it. So the comment may be describing a true thing that does not imply what it
says it implies.

**That is a reading, not a finding.** It needs a reproduction.

## Why this is a separate subtask

The last time a single unverified reading of link behaviour was acted on, 341
content links were rewritten into a form the tooling cannot maintain. The cost of
filing this separately and leaving it open is one folder entry. The cost of being
wrong about it in the other direction is another cleanup like this one.

# Closed 2026-08-04

**The answer stands — no, and the comment that asserted it now says why
correctly.**

`issue-body-links.ts` claimed sub-doc pages are safe because they are *"served at
a URL depth that MATCHES their file depth"*. **That reasoning is wrong.**
Relative resolution does not compare segment counts; it asks whether the
browser's base is a directory or a file — `/a/b/` resolves `./x` to `/a/b/x`,
`/a/b` resolves it to `/a/x`. Depth never enters into it.

The real reasons are the two properties [`110`](./110_live-check.md) verified:
tracker pages are served **without a trailing slash**, and tracker URLs **keep
their `NN_` prefixes**. Docs have neither. The comment now states both, records
that fifteen links were opened by hand to establish it, and warns that a static
read of `dist/` reports these links as broken because the built site adds the
slash the dev server omits.

**Why a right answer with wrong reasoning was worth fixing at all.** This comment
is *why nobody opened the question sooner* — it read as authoritative, and a
reader checking it against a real failure would have found the reasoning did not
hold and concluded the conclusion was wrong too. A load-bearing comment that
cannot survive being checked is worse than one that says nothing: it spends trust
it has not earned, and it spends it exactly when someone is investigating.

Filing this as its own subtask cost one folder entry. It bought not repeating the
341-link mistake in the tracker, where there are 1,069 relative links.
