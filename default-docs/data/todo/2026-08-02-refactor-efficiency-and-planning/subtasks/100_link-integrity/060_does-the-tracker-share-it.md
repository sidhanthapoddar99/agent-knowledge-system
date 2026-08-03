---
title: "Unverified: does the tracker pipeline share the same off-by-one?"
status: open
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

- [ ] Reproduce the probe properly: serve `dist/` and follow a tracker link over
      **real HTTP**, recording the status code — not by reasoning about paths
- [ ] Work out why `issue-body-links.ts` did **not** appear to fire on the page
      probed. Either it is not running, or the probe read the wrong page, or the
      comment is describing intent rather than behaviour
- [ ] Separate the three populations in [`040`](./040_site-wide-link-rot.md)'s
      3,978 before drawing any conclusion:
      **(a)** demo and fixture issues pointing at deliberately fictional paths
      (`/docs/api`, `/contact`) — not defects;
      **(b)** links whose target was genuinely deleted — history, not defects;
      **(c)** correct links broken by the renderer — the only real ones
- [ ] Only then decide whether the tracker needs a fix, and whether it is the
      same fix as [`010`](./010_renderer-drops-a-url-level.md)
- [ ] If the header comment on `issue-body-links.ts` turns out to be wrong,
      correct it — a comment asserting correctness is what stopped this being
      looked at sooner

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER — open question, deliberately unanswered.** One probe, one
> contradiction, no verdict.

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
