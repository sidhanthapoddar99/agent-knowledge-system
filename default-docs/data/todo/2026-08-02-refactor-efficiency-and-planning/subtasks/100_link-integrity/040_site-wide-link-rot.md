---
title: "Site-wide link rot — the 4,295 was wrong, and the real figure is now zero"
status: done
---

# Overview

> [!CAUTION]
> **The 4,295 below is retracted. Do not cite it.** Two independent problems:
> Codex found the count inflated roughly 27× by sidebar links repeated on every
> page, and the tracker's 3,978 — the bulk of it — was withdrawn outright when
> fifteen tracker links were opened by hand and twelve resolved
> ([`110`](./110_live-check.md)). The table is kept as the record of what was
> believed, not as a measurement.

**Originally recorded as:** 4,295 in-page links across the built site do not
resolve. Measured 2026-08-03 by parsing every rendered `<article>`, resolving
each `href` against its own page URL the way a browser does, and checking the
target exists.

| Section | Checked | Broken | Share |
|---|---:|---:|---:|
| `todo` (tracker) | 43,580 | **3,978** | 9% |
| `user-guide` | 667 | **243** | 36% |
| `dev-docs` | 214 | **70** | 33% |
| `blog` | 7 | **4** | 57% |
| `user-guide/issues` | 210 | 0 | — fixed in [`140`](./030_user-guide-relative-links-404.md) |

**Done when** every section reads 0, and a check in `agent-ks` fails on a new one.

# References

- The section already fixed, and the method that measured it:
  [`140`](./030_user-guide-relative-links-404.md)
- The round that found it: [0.2.1](../../agent-log/020_wf_ship-the-split/02_working/180_release-0-2-1.md)
- The checker to model it on:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/check-skill-links.mjs`

# Todo list

- [ ] **Triage the tracker's 3,978 first — most are probably not defects.** Demo
      and fixture issues link to deliberately fictional paths (`/docs/api`,
      `/contact`, `/docs/getting-started`). Separate *fictional by design* from
      *meant to work and doesn't* before rewriting anything
- [ ] Decide whether tracker prose should be link-checked at all. An issue is a
      record of what someone thought at the time; a link that rotted because its
      target was deleted is **history**, not a bug
- [ ] Fix `user-guide` (243) and `dev-docs` (70) — the same scripted
      root-relative rewrite as [`140`](./030_user-guide-relative-links-404.md),
      which took minutes
- [ ] `dev-docs` carries a second, different defect: absolute links to a `/docs/…`
      prefix that no longer exists (`/docs/architecture/parser/overview`). That is
      a rename never swept, not a relative-path mistake — fix it separately or the
      count will not go to zero
- [ ] `blog`'s four are `/blog/tag/<name>` — **pages the layout links and the
      build never generates.** A missing feature, not a bad link. Decide: build
      tag pages, or stop linking them
- [ ] **Write the checker**, wired in as `agent-ks check links`. Resolve rendered
      `href`s against `dist/`, and **fail loudly when `dist/` is absent** rather
      than passing — a gate that cannot see anything must not report clean
      ([`130`](../090_silent-failure-defects/030_skill-links-checks-the-wrong-tree.md) is the precedent, twice)
- [ ] Control-test it: a deliberately broken link fails it, removing that link
      returns it to zero

# Outcomes and Next Steps

**Closed 2026-08-04 at zero, and this subtask fixed none of it.**

Re-measured on a fresh build with `agent-ks check links`, the gate this subtask
asked for and [`070`](./070_reframe-the-link-checker.md) /
[`090`](./090_tools-must-say-what-they-skip.md) delivered:

| Sections | Pages | Links checked | Broken |
|---|---:|---:|---:|
| `user-guide` · `dev-docs` · `blog` · docs | 342 | 15,586 *(see below)* | **0** |

> **The 15,586 is not a body-link count and must not be quoted as one.** The tool
> matches `<article|main>` and a built page opens `<main>` first, so the sidebar
> is counted on every page. Checked against one real page while closing
> [`070`](./070_reframe-the-link-checker.md): **112 links counted, 9 actually in
> the body.** The overall inflation is ~27×, so the true in-body figure is in the
> hundreds. **The 0 is unaffected** — a broken link is a broken link whichever
> region it sits in, and the sidebar links are generated and correct. Only the
> denominator is wrong. Fixing the region match is [`070`](./070_reframe-the-link-checker.md)'s.
>
> **And `0 broken` means `0 broken PATHS`.** The tool discards fragments
> (`check-content-links.mjs:225` takes `.pathname`), so anchors are unchecked —
> four broken ones were known to exist at the time of this measurement.

**243, 70 and 4 → 0.** Not by rewriting content: the cause was the renderer
([`010`](./010_renderer-drops-a-url-level.md)), and the router changes in 0.2.2
made both URL spellings resolve. The link-form conversion in
[`020`](./020_relative-links-are-the-contract.md) swept the rest.

### Every item on the todo list, and who actually closed it

| Item | Outcome |
|---|---|
| Triage the tracker's 3,978 | **Void** — the claim was retracted by [`110`](./110_live-check.md) |
| Decide whether tracker prose should be link-checked | **Answered by the tool** — the tracker is excluded from `check links` by default, `--all` includes it as a measurement |
| Fix `user-guide` (243) and `dev-docs` (70) | **0 today.** Fixed upstream by the renderer, not by the scripted rewrite this item proposed — which was the wrong fix |
| `dev-docs` stale `/docs/…` prefix | **0 today** — verified by grep, swept by `020` |
| `blog`'s four `/blog/tag/<name>` | **Gone** — no such link remains in content or in any layout. The open question of whether to *build* tag pages is recorded on [`100`](./100_links-whose-target-does-not-exist.md) |
| Write the checker as `agent-ks check links` | **Shipped** by [`070`](./070_reframe-the-link-checker.md) / [`090`](./090_tools-must-say-what-they-skip.md), including the fail-loudly-without-`dist/` requirement |
| Control-test it | **Done** with the checker, not here |

Nothing was moved out of this subtask on closing, because nothing unique was
left in it.

### The tracker figure, and why it is still not a number to act on

`check links --all` reports **1,718 broken of 53,488 links across 1,171 pages**.
That is measured against `dist/`, which is exactly the artefact
[`120`](./120_dev-and-build-disagree-on-the-base.md) says cannot answer the
question — a built page is served with a trailing slash and the dev server serves
the same page without one, so a relative link means two different things in the
two environments. **It is the same mistake as the 3,978, at a smaller scale.**
[`060`](./060_does-the-tracker-share-it.md) and
[`120`](./120_dev-and-build-disagree-on-the-base.md) own it; it is not evidence
of 1,718 defects.

### What this subtask was actually worth

Not its fix — it never had one, and the fix it proposed (scripted rewrite to
root-relative) was the mistake the whole group exists to correct. **Its value was
the demand for a gate**, in the *Why nothing caught it* section below: the skill
link-checker existed, had caught real defects, and the identical gap over `data/`
had simply never been closed. That argument produced `check links` and
`check link-form`, and those outlive every number in this file.

# Details

## The mechanism, and why every writer got it wrong

Pages build as `<slug>/index.html`, so every page URL ends in a slash. A browser
resolves `./x` and `../x` against **that**:

| From | Link | Resolves to | Intended |
|---|---|---|---|
| `/user-guide/issues/design-philosophy/` | `./sub-docs/plans` | `…/design-philosophy/sub-docs/plans` ✗ | `/user-guide/issues/sub-docs/plans` |
| `/user-guide/issues/setup/per-issue/` | `../design-philosophy` | `…/issues/setup/design-philosophy` ✗ | `/user-guide/issues/design-philosophy` |

Writing a correct relative link means counting `../` against a URL depth that is
**not visible in the source tree**: the folder is `05_sub-docs/`, the URL segment
is `sub-docs/`, and the page contributes a level of its own.

In the section already fixed, **not one of 101 relative links was correct.** A
100% failure rate indicts the form, not the writers — which is the argument for
root-relative everywhere: one spelling, valid from every page, and one form for
`agent-ks move` to rewrite.

## Why nothing caught it

Three checks run over this repo and **none looks at links inside `data/`**:

- `./start build` renders a link and never follows it.
- `agent-ks check issues` validates tracker schema, not prose.
- `check-skill-links` covers `plugins/` only — and **its existence is the whole
  argument.** It was written because this exact class of breakage was happening
  between skill files, it has caught real defects since, and the identical gap
  over `data/` was simply never closed.

A 36% failure rate in the user guide survived because it is invisible from the
inside: every page renders, every link is styled like a link, and only clicking
one tells you. Same shape as
[the empty section](../090_silent-failure-defects/020_config-page-missing-data-dir.md) and
[the gate reading the wrong tree](../090_silent-failure-defects/030_skill-links-checks-the-wrong-tree.md).

## The measurement, written down so it can be repeated

Parse each `dist/**/index.html`; take the `<article>` body only, since nav and
sidebar links are generated and always correct; `urljoin(page_url, href)`; check
the resolved path exists as a directory holding `index.html`, or as a file.

**Assert a non-zero checked count.** A run that collects nothing must not report
clean — that is the trap the skill checker fell into twice, and it is the reason
the first measurement of `19_issues/` was wrong by 20 links.
