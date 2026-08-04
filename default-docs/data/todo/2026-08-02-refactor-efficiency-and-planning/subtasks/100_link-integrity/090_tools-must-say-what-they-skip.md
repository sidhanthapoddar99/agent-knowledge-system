---
title: "The tools skip links silently — move must report what it declined, and check must gate link form"
status: done
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
- [x] **`check link-form` resolves the target on disk** — the existence test, not
      just the leading-slash test. Warns rather than fails; see below
- [x] **`check` flags a backticked path that resolves to a real file** — built
      2026-08-04 on [`200`](./200_link-tooling-blind-spots.md), warns, 52 found.
      It had been parked behind
      [a file reference is a link](./080_link-it-dont-name-it.md)'s content
      sweep; that sweep was dropped on 2026-08-04 and the gate was named there
      as the higher-value half, because it catches every future instance instead
      of clearing today's 95
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

**Trackers were excluded at first**, matching `check links`. That exclusion is
**gone as of 2026-08-04** — its reason was replaced twice and never measured
true, and including the tracker turned out to cost two findings rather than
thousands. The gate now covers everything: **1,859 links across 991 files.**

### The backticked-path half, built later

`check` now reports a backticked path that names a real document — built
2026-08-04 on [`200`](./200_link-tooling-blind-spots.md). It **warns**, on the
same reasoning as `move`'s skip report, and it will stay a warning: resolvability
proves a path *could* be a link and never that it *should* be one, so a page
whose subject is paths trips it legitimately.

It had been parked behind
[a file reference is a link](./080_link-it-dont-name-it.md)'s content sweep. That
sweep was **dropped** — a script cannot tell a reference from an example — and
the gate was named there as the higher-value half, because it catches every
future instance instead of clearing today's. The honest test finds **52**, not
the 95 the naive scan had estimated.

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

# The gate did not check what it claimed — reopened, then closed

**Reopened `in-progress` 2026-08-03, closed 2026-08-04.** The sharpest finding of
the two audits, and it was about the gate this subtask had just built.

🔴 **`check link-form` passed 306 links `move` cannot maintain.** It tested for a
leading `/` and nothing else — a check on the *shape* of a link rather than on
what it points at. `move` resolves targets as **real filesystem paths**, so
`./design-philosophy` (the file is `02_design-philosophy.md`) is no more
maintainable than an absolute link, and rather harder to spot: a site-absolute
link announces itself, this one looks exactly like the correct form.

## What shipped

**`check link-form` now runs two tests.** Both live in the same pass because both
answer *can our tooling maintain this link* — the second is not a new gate.

| Test | Severity | Question |
|---|---|---|
| Not site-absolute | **error** — exit 1 | is this a path at all? |
| Resolves on disk | **warning** — exit unchanged | is it a path that exists? |

**Warning, not error, on the same reasoning as `move`'s skip report.** It arrives
with 306 pre-existing hits; a gate that is red on arrival is a gate people learn
to ignore, which is the failure this gate exists to prevent. It tightens to an
error once [the content is converted](./170_relative-but-not-a-path.md).

**The resolution is `move`'s own arithmetic**, `path.resolve(dir, rel)`, and it
lives beside `isIgnorableTarget` in `_links.mjs` — the file that already declares
itself the one home for link-target classification. That is what makes it a test
of maintainability rather than a second opinion about it.

## `move` corrected the design mid-build, twice over

The first version accepted two targets that resolve without naming a file of
their own name. A dry-run of `move` on a fixture settled both:

| Form | Accepted? | Why |
|---|---|---|
| a directory — `./20_themes` | ✅ yes | `move` maps directory paths as readily as file paths |
| extension dropped — `./20_themes/01_overview` | ❌ **no** | `move` rewrote `…/01_overview.md` and walked **silently past** `…/01_overview` in the same file |

The second is the one worth keeping: it looks harmless — the `NN_` prefix
survives, `grep` and an editor still find the file — and the maintaining tool
still cannot follow it. Accepting it would have repeated, one step smaller,
exactly the mistake the leading-slash-only test made. The measured tree has **2**
of them and **0** directory targets, so neither carve-out was load-bearing; the
demonstration decided it, not the counts.

They are reported with different wording, because they are different repairs: one
is a missing extension, the other is a slug that has to be matched back to its
file.

## Control tests, 2026-08-04

| Run | Result |
|---|---|
| Fixture: real path, directory, anchor-on-real-file, external, pure anchor | ✅ clean — 6 links, 0 findings |
| Plant a slug-form link | ✅ 1 warning, exit **0** |
| Plant a site-absolute link | ✅ 1 error, exit **1** |
| Remove both | ✅ clean again |
| Extensionless link whose `.md` exists | ✅ warned, with the add-the-extension wording |
| `move` dry-run on the same fixture | ✅ rewrote 2, skipped the extensionless and the slug — **the agreement this gate claims** |
| Real tree | 0 errors, **306** warnings, 240 resolved — matches the audit's 306 exactly |
| `--all` (tracker included) | 2 errors (parked on [`060`](./060_does-the-tracker-share-it.md)), 322 warnings — 16 of them tracker |
| `move` dry-run on real content, before and after | ✅ `2 link edit(s) across 2 file(s)` both times — no regression |

**A second zero-assertion was added with the feature**, matching the one already
guarding the parser: if links were parsed and *none* resolve, that is the
resolver being broken rather than the content, and it fails.

## Closed with one item open, deliberately

**`check` still does not flag a backticked path that could have been a link.** The
existence test was the harder and higher-value half and shipped first; the
backtick check now falls out of the same resolver almost for free. It is carried
on [`170`](./170_relative-but-not-a-path.md)'s todo list rather than holding this
subtask open, because the tool work here is finished.

**The couple-them-together constraint is dissolved, not ignored.** This subtask
said not to ship a gate that goes red on arrival with no fix available — warning
severity is what answers that, and it is why the gate could land before the 306
links are converted instead of waiting on them.
