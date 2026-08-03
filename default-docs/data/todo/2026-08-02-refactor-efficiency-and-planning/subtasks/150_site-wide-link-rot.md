---
title: "Site-wide link rot — 4,295 broken links, and nothing checks them"
status: open
---

# Overview

**4,295 in-page links across the built site do not resolve.** Measured
2026-08-03 by parsing every rendered `<article>`, resolving each `href` against
its own page URL the way a browser does, and checking the target exists.

| Section | Checked | Broken | Share |
|---|---:|---:|---:|
| `todo` (tracker) | 43,580 | **3,978** | 9% |
| `user-guide` | 667 | **243** | 36% |
| `dev-docs` | 214 | **70** | 33% |
| `blog` | 7 | **4** | 57% |
| `user-guide/issues` | 210 | 0 | — fixed in [`140`](./140_user-guide-relative-links-404.md) |

**Done when** every section reads 0, and a check in `agent-ks` fails on a new one.

# References

- The section already fixed, and the method that measured it:
  [`140`](./140_user-guide-relative-links-404.md)
- The round that found it: [0.2.1](../agent-log/020_wf_ship-the-split/02_working/180_release-0-2-1.md)
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
      root-relative rewrite as [`140`](./140_user-guide-relative-links-404.md),
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
      ([`130`](./130_skill-links-checks-the-wrong-tree.md) is the precedent, twice)
- [ ] Control-test it: a deliberately broken link fails it, removing that link
      returns it to zero

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — measured and scoped; nothing fixed outside `19_issues/`.

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
[the empty section](./120_config-page-missing-data-dir.md) and
[the gate reading the wrong tree](./130_skill-links-checks-the-wrong-tree.md).

## The measurement, written down so it can be repeated

Parse each `dist/**/index.html`; take the `<article>` body only, since nav and
sidebar links are generated and always correct; `urljoin(page_url, href)`; check
the resolved path exists as a directory holding `index.html`, or as a file.

**Assert a non-zero checked count.** A run that collects nothing must not report
clean — that is the trap the skill checker fell into twice, and it is the reason
the first measurement of `19_issues/` was wrong by 20 links.
