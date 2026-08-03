---
title: "Link integrity — one renderer bug, and the wrong conclusion drawn from it"
status: in-progress
---

# Overview

**Everything in this group descends from a single off-by-one in the renderer, and
from the fact that it was diagnosed as an authoring problem instead.**

A link written relative to the file's own directory is correct on disk. The page
is then emitted as `<slug>/index.html`, so its URL base is one level deeper than
the source directory, and the link resolves inside the page rather than beside
it. That is [`010`](./010_renderer-drops-a-url-level.md), and it is the cause of
everything else here.

[`030`](./030_user-guide-relative-links-404.md) and
[`040`](./040_site-wide-link-rot.md) measured the breakage correctly and then
attributed it to the wrong layer — they concluded the authors were wrong and
prescribed converting content to site-absolute form. That was carried out on
**341 links** before Sid stopped it, and has been reverted (`ee404bb` on
`fix/relative-link-rendering`).

> [!IMPORTANT]
> **Nothing in this group is being fixed yet.** Sid asked for the damage to be
> scoped first and the work to start only on his approval. As of 2026-08-03 the
> only change that has landed is the revert.

# References

- The revert commit: `ee404bb` on branch `fix/relative-link-rendering`
- The defective transform:
  `astro-doc-code/src/parsers/postprocessors/internal-links.ts`
- The tool the wrong form would have blinded:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs` → `isIgnorableTarget`
- The same class of silent-success defect, three more instances:
  [`090` — silent failure defects](../090_silent-failure-defects/)

# Todo list

- [x] Revert the 341 converted links and verify against the pre-session baseline
- [x] Find the actual cause and confirm it over real HTTP rather than by
      reasoning about paths
- [x] Scope the damage, including the records already published
- [x] **Re-verify the revert against git rather than against the record**, and
      confirm nothing else was edited under the wrong belief — 2026-08-03, results
      in Details
- [x] Scope widened on Sid's review, 2026-08-03 — two subtasks added,
      [`080`](./080_link-it-dont-name-it.md) and
      [`090`](./090_tools-must-say-what-they-skip.md), and
      [`020`](./020_relative-links-are-the-contract.md)'s reach extended past the
      two skill files
- [ ] **Sid's approval to begin** — then work the group in the order below
- [ ] [`010`](./010_renderer-drops-a-url-level.md) — fix the renderer, with a
      control test that fails when the fix is reverted
- [ ] [`020`](./020_relative-links-are-the-contract.md) — one link-form rule,
      stated identically on every surface, with the reason attached
- [ ] [`080`](./080_link-it-dont-name-it.md) — a file reference is a link, never a
      backticked path. Same defect shape as `020`, other half of the rule
- [ ] [`050`](./050_correct-the-published-records.md) — correct `0.2.1`'s release
      note and the two subtasks that argue for the wrong form
- [ ] [`060`](./060_does-the-tracker-share-it.md) — settle whether the tracker
      pipeline has the same defect. **Unverified; do not act on it yet**
- [ ] [`070`](./070_reframe-the-link-checker.md) — reframe the link checker,
      which was built on the wrong model
- [ ] [`090`](./090_tools-must-say-what-they-skip.md) — make `move` report its
      skips and `check` gate link form. **Last, because it encodes whatever `020`
      decides**
- [ ] Re-measure [`040`](./040_site-wide-link-rot.md)'s counts once the renderer
      is fixed, and record before/after side by side

# Outcomes and Next Steps

> [!IMPORTANT]
> **Scoping complete; work not started.** The revert has landed and been
> verified. Everything else in this group is blocked on Sid's go-ahead.

# Details

## Why these nine are one group

They are not nine link bugs. They are **one defect, one wrong inference from
it, the rule that let the inference look permitted, and the cleanup all three
require**:

| # | Subtask | Kind |
|---|---|---|
| [`010`](./010_renderer-drops-a-url-level.md) | Relative links render one level too deep | **the cause** |
| [`020`](./020_relative-links-are-the-contract.md) | The skill offers absolute links as an equal option | **why the wrong fix looked allowed** |
| [`080`](./080_link-it-dont-name-it.md) | The skill offers backticked paths as an equal option | same shape, other half of the rule |
| [`030`](./030_user-guide-relative-links-404.md) | 85 broken links in the issues user-guide | measurement — right numbers, wrong diagnosis |
| [`040`](./040_site-wide-link-rot.md) | 4,295 broken site-wide | measurement — right numbers, wrong diagnosis |
| [`050`](./050_correct-the-published-records.md) | The records that argued for the wrong form | fallout, and some of it is published |
| [`060`](./060_does-the-tracker-share-it.md) | Does the tracker share the defect? | **open question, unverified** |
| [`070`](./070_reframe-the-link-checker.md) | The checker built on the wrong model | fallout |
| [`090`](./090_tools-must-say-what-they-skip.md) | Nothing mechanical enforces any of the above | **the guard, so the rule stops living in prose** |

## The revert, re-verified against git — 2026-08-03

The record said the 341 links were reverted. Checked rather than trusted, since
this group exists because a record was believed over a source:

| Check | Result |
|---|---|
| `git diff a5c75bd~1 -- default-docs/data` (baseline → working tree) | **only tracker files differ** — no `user-guide/` or `dev-docs/` change survives |
| Commits touching `scripts/` or `references/` since the rewrite | **none** — the link tooling was never edited under the wrong belief |
| Content still in the converted form | none. The 137 site-absolute links present today all predate the rewrite |

**Two things were built on the wrong premise and both are already tracked:** the
content link checker, uncommitted, owned by
[`070`](./070_reframe-the-link-checker.md); and three published records, owned by
[`050`](./050_correct-the-published-records.md). Nothing else.

The one thing this did **not** clear: `_manifest.mjs` is modified and
`check-content-links.mjs` is untracked. Both are that checker's registration, so
they belong to [`070`](./070_reframe-the-link-checker.md) rather than being loose
ends.

## The reasoning failure, stated plainly

The measurement was correct every time. The 404s are real; they reproduce over
HTTP today. **What went wrong was attribution**, and it went wrong in a way worth
naming because it is repeatable:

1. Only one hypothesis was ever enumerated — *the content is wrong*. The other —
   *the renderer is wrong* — explains the same evidence and was never tested.
2. The strongest available evidence was read backwards. The record argued, as
   grounds for rewriting: *"not one of 101 links got it right."* **A tool that
   101 independent authors use wrongly 101 times is a broken tool.**
3. The replacement form was chosen without reading the contract of the tool that
   consumes it. `agent-ks move` skips site-absolute links by design, so every
   converted link left move's maintenance permanently and silently.

The renderer is 81 lines. It was opened for the first time *after* the rewrite
had been made, committed and pushed.

## What this cost, and what caught it

| | |
|---|---|
| Content links converted | 341 (195 uncommitted, 146 pushed in `a5c75bd`) |
| Records published on the wrong premise | 3 — one of them tagged `v0.2.1` |
| Tooling written on the wrong premise | 1 — the content link checker |
| Caught by | **Sid, reading the diff.** No gate, no test, and no reviewer |

That last row is the finding with the longest reach: three separate checks run
over this repo and not one of them has an opinion about link form or link
resolution. See [`070`](./070_reframe-the-link-checker.md).
