---
title: "Link integrity — one renderer bug, and the wrong conclusion drawn from it"
status: in-progress
---

# Overview

> [!IMPORTANT]
> **Triaged 2026-08-03, after the live check. Read this table first — the
> group's framing below it is one revision out of date.**
>
> The off-by-one was real for the *built* docs site and is **not** the root
> cause of the group. The root cause is that **a relative href resolves against
> whatever base the current address has, and the dev server and the built site
> do not agree on that base.** Six subtasks survive that correction unchanged,
> three need re-measuring, three are pointers or answered questions, and one is
> superseded.

| | What it is | Still worth pursuing? |
|---|---|---|
| [`010`](./010_renderer-drops-a-url-level.md) | the depth-shift diagnosis + the shipped fix | 🔴 **Superseded.** Correct for the built site, wrong in dev. Replaced by render-time absolute resolution on [`2026-06-09` `03`](../../../2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md). **The code is still in the tree** — it goes when that lands, not before, or the breakage moves to production |
| [`020`](./020_relative-links-are-the-contract.md) | relative is the rule, on every surface | 🟢 **Yes** — and the rule itself was vindicated. Two open items: the two asset kinds, and cross-root portability |
| [`030`](./030_user-guide-relative-links-404.md) | 85 broken links in the issues user-guide | 🟡 **Yes, but re-measure.** The measurement holds for the built site; its *conclusion* still argues for the root-relative rewrite and has never been rewritten |
| [`040`](./040_site-wide-link-rot.md) | "4,295 broken links site-wide" | 🔴 **The number is not usable.** Codex found the count inflated ~27× by repeated sidebars, and the tracker share is the dev/build gap, not rot. Re-measure or close it — do not cite it |
| [`050`](./050_correct-the-published-records.md) | correcting `0.2.1` and the records | 🟢 **Yes**, and it now needs a **third** correction block — the tracker claim |
| [`060`](./060_does-the-tracker-share-it.md) | does the tracker share the bug? | ✅ **Answered — no.** Awaiting review only |
| [`070`](./070_reframe-the-link-checker.md) | reframe `check links` | 🟢 **Yes.** Anchors are never checked, the count is inflated, and it can only ever see the built site |
| [`080`](./080_link-it-dont-name-it.md) | a file reference is a link, not a backticked path | 🟢 **Yes, and it is untouched.** Fully independent of everything above — the one item here no diagnosis affected |
| [`090`](./090_tools-must-say-what-they-skip.md) | `move` and `check` must not skip silently | 🟢 **Yes.** The gate passes 306 links `move` cannot maintain, and both tools are wrong about site assets |
| [`100`](./100_links-whose-target-does-not-exist.md) | 55 links with no target | 🟢 **Yes** — genuinely dead targets, independent of resolution |
| [`110`](./110_live-check.md) | the fifteen clicked links | ✅ **Done its job.** It is the evidence the rest is re-based on |
| [`120`](./120_dev-and-build-disagree-on-the-base.md) | the real diagnosis + the three options | 🟡 **Sid's call**, and the June issue already decided it |
| [`130`](./130_what-the-wrong-diagnosis-taught.md) | damage inventory, nine surfaces | 🟢 **Yes** — three fixed, the rest listed |
| [`140`](./140_dual-slug-url-resolution.md) · [`150`](./150_plans-auto-resolution.md) | routing defects found by the live check | ⬜ **Pointers only** — the work is on `2026-06-09-issue-link-resolution` |

**The one thing to do next**, and everything else waits behind it: land
render-time absolute link resolution. It removes [`010`](./010_renderer-drops-a-url-level.md)'s
regression, the dev/build split, and the Comprehensive-panel bug in one change —
and it was decided on 2026-06-09, before this group existed.

**Everything below this box was written before the live check.** It is kept
rather than rewritten because the wrong reasoning is the useful part of the
record.

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
- [x] [`010`](./010_renderer-drops-a-url-level.md) — fix the renderer, with a
      control test that fails when the fix is reverted. **Closed 2026-08-04**:
      two audit edge cases fixed (`mailto:`, diagram pages), four handed to
      `2026-06-09` `03` because they are defects of the shift it deletes
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

**Worked 2026-08-03 on Sid's go-ahead. Broken in-body links: 418 → 0.**

| Subtask | State |
|---|---|
| [`010`](./010_renderer-drops-a-url-level.md) renderer | **done** — fixed, control-tested both directions, zero content files changed. Two audit edge cases closed out 2026-08-04; the shift itself still awaits its replacement |
| [`020`](./020_relative-links-are-the-contract.md) the rule | review — no cross-section exception exists; 129 links converted |
| [`050`](./050_correct-the-published-records.md) records | review — `0.2.1` carries a dated correction block |
| [`070`](./070_reframe-the-link-checker.md) checker | review — reframed and committed; exclusion now measured, not asserted |
| [`090`](./090_tools-must-say-what-they-skip.md) guards | review — `move` reports its skips, `check link-form` shipped green |
| [`100`](./100_links-whose-target-does-not-exist.md) dead targets | review — 55 → 0 |
| [`060`](./060_does-the-tracker-share-it.md) tracker | **open** — measured, not triaged. See below |
| [`080`](./080_link-it-dont-name-it.md) backticked paths | **open** — rule landed, content sweep not done |
| [`040`](./040_site-wide-link-rot.md) re-measure | **open** — its own prescription still needs retracting |

**The finding that changed the shape of the work:** there is no cross-section
exception. A dry-run `move` proved relative links are maintained across sections,
so the 115 "cross-section absolute" links in the user guide were not a convention
— they were links that had opted out of maintenance. One rule, no carve-outs.

**And one defect was introduced and caught inside this run.** The renderer fix
also shifted links to colocated *files*, which `asset-src` resolves against the
source directory — the same asset came out at two different URLs from `<img>` and
`<a>` in one page. Found by tracing a link into its built output rather than
trusting a count that had just improved from 418 to 55.

## What is left, and why each is parked rather than forgotten

- **[`060`](./060_does-the-tracker-share-it.md) — 1,372 broken links in the
  tracker, measured, untriaged.** They are dominated by *relative* links that do
  not resolve, and the issues pipeline has its own re-rooting pass, so the docs
  fix does not apply. This is a real lead and explicitly not a conclusion. Both
  link gates exclude trackers by default until it is settled.
- **[`080`](./080_link-it-dont-name-it.md) — the content sweep.** The rule is
  live on every surface; converting the ~44 existing backticked paths is a
  judgement call per instance and was not attempted. The matching `check` rule is
  deliberately unbuilt for the same reason: shipping it now would land red.
- **[`040`](./040_site-wide-link-rot.md)** still prescribes the root-relative
  rewrite in its own Details. Harmless while the renderer is fixed; wrong to
  leave for a reader.

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
