---
title: "Summary"
---

# State

**Opened late, 2026-08-04 — the work below had already happened inline before
this log existed.** Sid caught the omission. Recorded rather than back-filled
silently: a log opened after the fact is exactly the shape that lets a run's
reasoning evaporate.

Two subtasks landed and are committed. **An independent audit is still running**,
and its findings land in `02_working/` — that is the main reason this log exists.

# Goal

**Put the rendering check where it belongs, remove the shift it could not see
through, and have someone independent look at every path change of the last four
days.**

Three threads, one cause. A gate that read `dist/` could not see the environment
a person browses in; a renderer change was built on that gate's evidence and was
wrong for a day; and the same evidence underwrites a week of other path work that
nobody has re-examined.

# Todo

References this run executes against:

- [`180`](../../subtasks/100_link-integrity/180_rendered-link-check-belongs-to-this-repo.md)
  — the rendering gate is in the wrong tree
- [`190`](../../subtasks/100_link-integrity/190_the-depth-shift-is-removed.md)
  — the depth shift is removed
- The project [`CLAUDE.md`](../../../../../../CLAUDE.md) → *Three stages*, Sid's
  framing that decides which tree a tool belongs in

- [x] Write the three stages into the project `CLAUDE.md`, with the two link
      checkers as the worked example
- [x] Write `scripts/check-links.mjs` — crawl a **running server**, follow
      redirects, resolve against the **final** URL, check fragments, `--compare`
      two servers
- [x] Remove the depth shift from `internal-links.ts`, keep the reasoning in
      place so it is not re-added, and rewrite the file header that described the
      shift as the file's purpose
- [x] Open `180` and `190`, update the group overview
- [ ] **The audit** — every path / URL / slug / routing / asset change since
      2026-08-01, executed rather than read, both servers compared. Findings →
      `02_working/`
- [ ] Run `--compare` dev vs preview and record the disagreement set on
      [`120`](../../subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md)
- [ ] Control-test the new crawler both directions, then remove
      `check-content-links.mjs` from the plugin — **not before**

# Out of Scope

- **Render-time absolute resolution**, the permanent fix. Decided 2026-06-09 on
  `2026-06-09-issue-link-resolution` subtask 03 and owned there.
- **Whether the server should redirect one URL form to the other.** A real
  question, parked on [`190`](../../subtasks/100_link-integrity/190_the-depth-shift-is-removed.md),
  and not required by the fix.
- The blog — still under development (Sid, 2026-08-04).

# Outcome

In progress. What is settled:

## The four combinations, traced end to end

Full step-by-step on
[`190`](../../subtasks/100_link-integrity/190_the-depth-shift-is-removed.md)
→ *The full trace*. The result in one table, docs only, same link throughout
(`[Installation](./02_installation.md)`, a sibling on disk):

| | dev — **no** trailing slash | prod — **has** trailing slash |
|---|---|---|
| **no shift** → `./installation` | ✅ 4 broken *(anchors only)* | ❌ **546 broken** |
| **shift** → `../installation` | ❌ broken *(reproduced in a browser)* | ✅ 4 broken *(anchors only)* |

**A perfect diagonal.** The renderer writes the href at build time; which column
the reader lands in is decided at request time by a server it has never met. The
columns differ by exactly one URL segment — the same amount the shift changes —
so no constant can satisfy both.

**Both previous rounds measured one column and concluded the other did not
exist.** 2026-08-03 added the shift having seen only the trailing-slash column
(a tool that reads `dist/` and *constructs* URLs with a slash): it read as
`418 → 55`. 2026-08-04 removed it having seen only the no-slash column (dev,
preview, a browser): it read as a clean fix. `astro dev` and `astro preview` are
route tables and never add the slash; a static host is a file server and always
does — **so testing dev against preview is testing one column twice.**

## `trailingSlash: 'always'` — tested, and incomplete on its own

Sid's proposal, tested 2026-08-04. On the shipped behaviour, paired with the
shift restored: **546 → 4**, and those 4 are missing anchors rather than path
failures.

**But it breaks dev in a new way.** Astro's dev server then answers `404` for the
no-slash form instead of redirecting, and **our own layouts still emit hrefs
without the slash** — sidebar, pagination, index tables, all built by our code
rather than Astro's. Clicking any sidebar item in dev gives a 404; 10 of 10 links
broken across the first 40 pages crawled.

So the config is most of an answer and needs a second piece: the layouts must
emit trailing slashes too. **Left uncommitted and undecided — Sid's call.**

## The rest:

**The depth shift is gone, and why it survived a day is the finding.** It was
control-tested in both directions — 418 broken with it off, 55 with it on — and
**the control could not have failed.** Both numbers came from a tool that reads
`dist/` and *constructs* each page URL as `'/' + path + '/'`, so both directions
were measured in the one environment where the shift was correct. The form a
person actually navigates to — no trailing slash, which is what the sidebar
emits — was never in the sample.

**Two directions of one method are still one method.** This issue had already
written that rule down for reviewers, after two independent audits agreed on a
finding that fifteen browser clicks then destroyed. It was never applied to a
control test, where it matters just as much: a control proves the measurement
responds to the change, not that the measurement is asking the right question.

Caught by Sid, in a browser, in one click.

**The new crawler found three bugs in itself before it found anything else** — a
dead port hanging the run forever, `--body-only` silently narrowing the *crawl*
so it never left the home page, and links resolved against the requested path
rather than the post-redirect one. That last is the same trailing-slash trap,
inside the tool built to find it. Each is now a comment where it happened; detail
on [`180`](../../subtasks/100_link-integrity/180_rendered-link-check-belongs-to-this-repo.md).
