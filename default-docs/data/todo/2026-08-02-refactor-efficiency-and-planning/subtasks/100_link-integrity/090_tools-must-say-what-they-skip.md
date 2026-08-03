---
title: "The tools skip links silently — move must report what it declined, and check must gate link form"
status: in-progress
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

- [x] **`move` reports its skips** — every declined link with file, line and
      target, under a summary naming what it means
- [x] **Warning, not failure**, as recommended. `move` is doing its job
      correctly; refusing to move a file over someone else's link form would be
      disproportionate
- [x] **`check link-form` built** — a new source-only gate. No cross-section
      exception to encode: `020` proved there isn't one
- [ ] **`check` flags a backticked path that resolves to a real file** — not
      built. Left with [`080`](./080_link-it-dont-name-it.md), whose content
      sweep it belongs with
- [x] **Baselined before enforcing.** The tree was taken to zero first, so the
      gate ships green
- [x] Control-tested both directions, for both tools
- [x] Non-zero-count assertion, plus a second one: files found but zero links
      parsed also fails

# Outcomes and Next Steps

**Both guards built and control-tested 2026-08-03. One deferred.**

### `agent-ks move` now says what it declined

```
⚠ 3 site-absolute link(s) left UNMAINTAINED.
  `move` cannot rewrite a target starting with "/" — it cannot know what URL
  prefix a section publishes under. These will not follow a file when it moves.
  Rewrite them as relative links (./x, ../x) to bring them back into maintenance.
```

Control-tested: a clean run reports the 3 that legitimately remain; planting one
more site-absolute link makes it 4. Warning, not error — exit code unchanged.

### `agent-ks check link-form` — a new gate, and deliberately not merged with `check links`

| Gate | Question | Needs |
|---|---|---|
| `check links` | Does this link **resolve**? | a built `dist/` |
| `check link-form` | Is this link **maintainable**? | the markdown only — instant |

A link can resolve perfectly and be unmaintainable. That is not a corner case;
it is exactly what the 341 conversions were, and why the resolution gate alone
would have called them clean.

| Run | Result |
|---|---|
| Default (docs sections) | ✅ **clean** — 568 links across 161 files |
| With one site-absolute link planted | ✅ **1 error**, naming file, line and target |
| Probe removed | ✅ clean again |
| `--all` (includes the tracker) | 2 errors — the cross-issue links parked on [`060`](./060_does-the-tracker-share-it.md) |

**Two false-positive classes were closed before shipping**, both found by running
it rather than reasoning about it: fenced blocks (syntax being shown), and
**inline code spans** — documentation that quotes the wrong form in order to
forbid it must not trip the gate that forbids it.

**Trackers are excluded by default**, matching `check links`. Not on principle:
the issues pipeline re-roots links itself and its rendering is
[`060`](./060_does-the-tracker-share-it.md)'s open question, so converting a
tracker link to relative today could swap a working link for a broken one.

### What is not built

`check` does **not** flag a backticked path that could have been a link. It needs
the [`080`](./080_link-it-dont-name-it.md) content sweep alongside it — shipping
the gate first would light up 44+ existing instances and land red on arrival,
which is the one thing this subtask said not to do.

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

# Reopened — the gate does not check what it claims

**Back to `in-progress` 2026-08-03.** This is the sharpest finding of the two
audits, and it is about the gate I built here.

- 🔴 **`check link-form` passes 306 links `move` cannot maintain.** It tests for
  a leading `/` and nothing else. But `move` resolves targets as **real
  filesystem paths**, so an extensionless slug-form link (`./overview`) is no
  more maintainable than an absolute one. In the non-tracker tree: 238 links
  resolve to a real `.md` source, **306 are extensionless URL-form**, 1 is a real
  non-markdown file. Control-tested — `[target](./target)` pointing at
  `02_target.md` passes the gate, and a dry-run move of that file reports *"No
  link edits needed."*
  **Fix: gate resolvability, not prefix.** Sid has approved; note it turns those
  306 red, so "green on arrival" breaks and the content has to be fixed with it.
- 🔴 **Both tools are wrong about site assets.** There are two asset kinds and
  they are different routes: `/assets/…` is the **site** folder (favicon, logos)
  and is correct as written; `./assets/…` is **colocated per-doc**, rewritten to
  `/content-assets/…`. Today `move` reports `![Logo](/assets/logo.png)` as
  unmaintained and advises a rewrite that **breaks it**, and `check link-form`
  fails `[Download](/assets/spec.pdf)` — the form `references/writing.md`
  requires. Both need the site-assets prefix exempt, and `move` needs an image
  filter.
