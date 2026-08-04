---
title: "Relative in shape, a URL in fact — 322 links named a slug instead of a file"
status: done
---

# Overview

**A link can be relative, pass every gate, and still not be a path.** `./design-philosophy`
is relative. The file is `02_design-philosophy.md`. Nothing on disk is called
`design-philosophy`, so no filesystem tool can follow it — it is the published
URL written in a relative shape.

This is the same defect the group has been chasing all along, wearing the one
costume nothing checks for. A site-absolute link at least *announces* itself with
a leading `/`; this one looks exactly like the correct form.

Counted by the gate itself, `agent-ks check link-form --all --json`, 2026-08-04 —
every relative target that does not exist on disk:

| Section | Missing targets |
|---|---:|
| `user-guide/` | **292** |
| `dev-docs/` | **14** |
| `todo/` (tracker) | **16** |
| **total** | **322** |

**The user-guide is where it lives.** The tracker is almost clean, which fits:
tracker links were written against the file tree from the start, while the
user-guide's were rewritten twice — first to site-absolute form in the 341-link
conversion, then back out of it by
[`020`](./020_relative-links-are-the-contract.md). The conversion back restored
the *shape* and not the *target*.

> **This replaces an earlier count of 334** (294 / 14 / 26), taken by hand before
> the gate existed. Two things changed and both narrow it: the gate skips fenced
> blocks and inline code spans — a link *shown* as syntax is not a link — and it
> tests existence rather than assuming an extensionless target is a slug. The
> tracker's 26 → 16 is the bulk of the difference. **The gate's number is the one
> to work from**, because it is the one that will report zero when the job is
> done.

**Done when** every internal link names a file that exists on disk, and a gate
fails when one does not.

# The demonstration

Not inferred — run. `agent-ks move` on
`user-guide/19_issues/02_design-philosophy.md`, dry run. Eight links point at
that file:

| Written as | Count | What `move` did |
|---|---:|---|
| `../02_design-philosophy.md` — the real path | 2 | ✅ **rewritten** to `../03_…` |
| `../design-philosophy` · `./design-philosophy` — the slug | 6 | ❌ **silently skipped** |

`move` printed `2 link edit(s) across 2 file(s)` and a warning about 13
site-absolute links elsewhere. About the six it had just walked past: nothing.

**That silence is the finding.** `move.mjs:261` resolves each target by path
arithmetic and compares it to the file being moved; a slug never matches, so the
link falls through the `continue` on line 268 — which is the same branch a link
that legitimately points somewhere else takes. It is not classified as
unmaintainable, so it is not counted, so it is not reported. **A site-absolute
link is skipped loudly; this one is skipped invisibly.**

# Why nothing caught it

**One row of this table is now false, and that is the point of
[`090`](./090_tools-must-say-what-they-skip.md).** `check link-form` asked only
*does this start with `/`*; it now resolves the target on disk and **fails**. The
rest still hold — which is why the gate had to be the one to change.

| Gate | Why it passes | |
|---|---|---|
| `check link-form` — **fixed** | asked only *does this start with `/`* | now an error; found all 322 |
| `check links` | resolves against the **built site**, where the slug is exactly what works | green |
| `move` | has no concept of a target it cannot resolve | reports nothing |
| the build | renders the href as written | green |

**Every check agrees, and the link is still wrong** — because each one asks about
a different artefact than the rule does. The rule is about the filesystem; two of
the four gates look at the site, one looks at a prefix, and one looks at a diff.

This is the group's recurring shape once more: *a wrong answer indistinguishable
from a right one until someone looks.*

# The gate named them — the list was a command, not a survey

**Built and control-tested 2026-08-04 on [`090`](./090_tools-must-say-what-they-skip.md).**
`agent-ks check link-form` resolves every relative target on disk and reports each
one that does not exist, with file, line, target and link text. So this subtask
never needed a script written to find its own work:

```
agent-ks check link-form --json     # the current list, always current
```

**It shipped as a warning and was tightened to an error the same day**, once the
tree hit zero. That staging is the only reason the gate could land before the
content was fixed; the tightening is what closes the class permanently.

Two decisions the gate settled, which this subtask had listed as open:

- **A directory target (`./20_themes`) is legitimate** — `move` maps directory
  paths as readily as file paths. **0** exist today.
- **Dropping the extension is not** — `./20_themes/01_overview` where
  `01_overview.md` exists is silently skipped by `move`, demonstrated on a
  fixture. **2** exist; they are reported with a distinct add-the-extension
  message, because that is a one-character repair rather than a slug lookup.
- **Anchors are split off before resolving**, so `./page#section` is judged on
  `./page` alone. Fragment validity is [`070`](./070_reframe-the-link-checker.md)'s
  question, against a running server — not a filesystem one.

# The 322 are two jobs, not one — probed 2026-08-04

Each missing target was walked back to the file it must have meant: segment by
segment, matching each path segment against the real directory entries with `NN_`
prefixes and `.md` stripped. **The multi-segment case is why this had to be done
per segment** — `./tokens/overview` is a slug in *both* halves, and matching only
the filename reports it dead when it is simply `./04_tokens/01_overview.md`.

| Class | Count | What it is |
|---|---:|---|
| **Mechanically fixable** | **300** | exactly one candidate file, every segment. Cosmetic today — the site serves them |
| **Ambiguous** | **0** | nothing needs a human to choose |
| **Genuinely dead** | **18** | the target does not exist under any spelling. **Broken for a reader right now** |
| **Off-by-one `../` count** | **4** | reaching out of `data/` to repo files, one level short |

**The 22 in the bottom two rows are the ones that actually cost a reader
something**, and they were invisible until the existence test existed. They are
not slug-form at all — this subtask went looking for a cosmetic defect and the
gate turned up real link rot alongside it. Sample, verified by hand:
`180_rendered-link-check-belongs-to-this-repo.md:26` writes
`../../../../../CLAUDE.md`; six levels reach the repo root, five reach
`default-docs/`, which holds no such file.

**Fix the 22 first.** They are a small, hand-checkable set with a real symptom,
and they do not depend on the 300 in any way.

# Closed 2026-08-04 — 322 → 0, and the gate now fails on the next one

| Step | Result |
|---|---|
| 22 genuinely broken links, by hand | 322 → 300 |
| 300 slug-form links, by parser | 300 → **0** |
| `check link-form` tightened from warning to error | red on the next one, in **any** consumer tree |
| `migration/0.2.3_slug-form-links.py` | the same fix, shipped to consumers |

**The acceptance test the class needed, because there is no visible symptom:**
build before, build after, diff every emitted `href`.

```
86,452 hrefs · 1,216 pages · byte-identical
```

That is the whole point stated as a number — the source changed and the site did
not, which is why nothing caught this for two rewrites. And the thing it bought,
measured the same way: a `move` dry-run over the eight links pointing at
`19_issues/02_design-philosophy.md` rewrote **2 before, 8 after**. That is the
demonstration in *The demonstration* below, run again with the opposite result.

## The 22 — done 2026-08-04, by hand

**322 → 300**, and the arithmetic is exact: one was a gate false positive, 21
were real. Each was verified individually rather than pattern-replaced, which is
what turned up the two corrections below.

| What was wrong | Count | Fix |
|---|---:|---|
| An agent-log summary linked its own round files as siblings | 6 | `./080_status-colours.md` → `./02_working/080_…` |
| A slug pointing at a **`.html` artifact** | 7 | `./suffix-icons` → `./02_suffix-icons.html` |
| `../` count one level short of the repo root | 4 | 5 → 6 levels for `CLAUDE.md`, 6 → 7 for `plugins/…` |
| A renamed subtask, link never updated | 1 | `./070_sidebar-icons-and-overview.md` → `./070_ui-subtasks-overview-icons.md` |
| `../subtasks/` from inside `agent-log/`, missing a level | 1 | → `../../subtasks/` |
| A **quoted** broken link, written as a live link | 1 | made a code span — it is an illustration, not a reference |
| Gate false positive | 1 | see below |

**Proof the 6 were wrong rather than a convention:** the same file's line 24
already wrote `./02_working/150_version-bump.md`. The correct form was sitting
four lines above the broken ones.

**The 7 `.html` ones were misclassified by my own probe**, which stripped `.md`
and `.mdx` when matching a slug back to its file and not `.html`. They are
ordinary slug-form links — the same class as the 300 — and were reported as dead
only because the probe could not see the artifact. Corrected here rather than
left to look like link rot.

## The gate accused a document of the thing it was demonstrating

`050_correct-the-published-records.md:132` quotes the correct link form inside a
**double-backtick** code span, because the thing being quoted itself contains
backticks:

```
`` [`references/writing.md`](./references/writing.md) ``
```

The gate blanked code spans with `` /`[^`]*`/ `` — a single-backtick pattern. It
stopped at the first inner backtick, left the link exposed, and reported it. **A
gate that flags the one file quoting the rule correctly is worse than no gate**,
and it is the same class as the fenced-block bug that had already been fixed in
`move`: markup being *shown* is not markup being *used*.

Fixed in `_links.mjs → blankCodeSpans`, which matches an opening run of N
backticks to a closing run of N. Control-tested on a fixture carrying a
single-backtick span, a double-backtick span, and a real link — only the real
link is reported. On the tree it removed exactly one finding and changed nothing
else.

**`move` has the same hole and it is worse there**, because `move` *writes*.
Demonstrated 2026-08-04: a file containing
`` `[Overview](./01_overview.md)` `` — a documentation example telling the reader
what to type — had that example silently rewritten to `./02_overview.md` by a
dry-run move. `move` tracks fenced blocks and nothing else. Carried as a todo
below; the helper it needs now exists.

## The 300 — converted by parsing, not by pattern

**A regex over the file text is what got the last sweep in this group reverted.**
It rewrote a link that was already inside a link, and destroyed a teaching
example in a page whose subject was how to write links. So the converter reuses
the gate's own primitives — fence tracker, code-span blanker, link regex — and
edits only inside a parsed link target. It refuses rather than guesses: zero or
several candidate files is a reported refusal, never a pick.

Control-tested on a fixture carrying all five cases before it was allowed near
the tree: live link **changed**; single-backtick span, double-backtick span,
fenced block, and an already-correct link **untouched**; anchor preserved.

**Result: 300 links in 70 files, 0 refused.** The gate went to zero in both
scopes — docs `✓ all checks passed`, `--all` down to the 2 site-absolute tracker
links parked on [`060`](./060_does-the-tracker-share-it.md).

## The migration script, and the control that makes it trustworthy

`migration/0.2.3_slug-form-links.py` — `detect` · `locate` · `migrate --dry-run`
· `verify`. A consumer upgrading into the stricter gate meets a wall of errors on
content that has never changed; this is what answers that, and its docstring
leads with the symptom rather than the rule.

It is a **stdlib-Python reimplementation** of the JavaScript converter, which
makes the strongest control available here possible: run each over the same
pre-conversion tree and diff the results.

| Control | Result |
|---|---|
| Python `detect` on the pre-conversion tree | **300** — the same number the JS gate and converter found |
| Python `migrate`, diffed against the JS-converted tree | **byte-identical**, 70 files |
| Re-run `migrate` on its own output | 0 rewrites — idempotent |
| `verify` on the converted tree | clean, exit 0 |
| Fixture: link inside a code span / fenced block | untouched by both |

**Two implementations agreeing on 300 links across 70 files is worth more than
either one passing its own tests**, because they share no code — only the rule.

A note on the refusals seen when testing against an extracted subtree: links
reaching out to repo-root files (`../../…/CLAUDE.md`, `plugins/…`) correctly
refuse there, because in that copy the target genuinely is not on disk. On the
real tree the same run refuses nothing. The script says so on its summary line
rather than only on stderr, so `0 link(s)` plus exit 1 cannot read as a bug.

## What this does not close

- **The version bump and the release are Sid's.** `ENGINE_VERSION` is still
  `0.2.2` and the script is named `0.2.3` — the naming rule in
  `migration/README.md` covers exactly this case, and a release that lands on a
  different number renames it. The floor does **not** move: slug-form links
  render correctly, so old content still works unmigrated. This is a
  good-to-have migration, not a breaking one
- **`move` still rewrites links inside inline code spans** — carried above

# Todo list

- [x] **Extend `check link-form` to resolve the target on disk** — the existence
      test, not just the leading-slash test. Landed on
      [`090`](./090_tools-must-say-what-they-skip.md)
- [x] Control-tested both directions, including agreement with a `move` dry-run
      on the same fixture
- [x] Anchors and directory targets decided — see above
- [x] **Fix the 22 genuinely broken ones first** — done 2026-08-04, by hand.
      322 → 300, table above
- [x] **Convert the 300** — done 2026-08-04 by parsing, not by pattern. 300
      links in 70 files, 0 refused
- [x] **Tighten the gate from warning to error** — done the same day; that
      staging was the whole reason it shipped as a warning
- [x] Verify the conversion changed no rendered URL — **86,452 hrefs across
      1,216 pages, byte-identical** before and after
- [x] Re-run the `move` demonstration: **8 of 8** rewritten, against 2 before
- [x] Ship it to consumers — `migration/0.2.3_slug-form-links.py`, an
      independent Python implementation, control-tested against the JS one on
      the same tree

**Four items moved rather than closed**, to
[link tooling blind spots](./200_link-tooling-blind-spots.md): `move` rewriting
links inside code spans, titled links the regex never parses, backticked-path
detection, and reference-style links. None of them is this subtask's acceptance
test; all four are the same family and belong together.

# Details

## Why this is not a style question

The rule is not "use the source form because it is tidier". A link is a
**reference to a file**, and the project's load-bearing principle is that these
documents are filesystem-first — written so `move`, `grep`, an editor and an
agent walking the tree can all follow them. A slug is a fact about one consumer,
the rendered site. Writing it into the source makes the document depend on the
renderer it is supposed to be independent of.

Concretely, a slug-form link costs:

- **`agent-ks move` cannot follow it**, so it rots on the next rename with
  nothing reporting it — proven above.
- **`grep` for the filename does not find the reference**, so a file's inbound
  links are invisible from the tree.
- **An editor cannot open it**, and neither can Obsidian.
- **It encodes the prefix-stripping rule into content**, so changing that rule —
  or a section that does not strip prefixes, as the tracker does not — silently
  breaks every link written this way.

## Both forms resolve on the site, which is why nobody noticed

Since 0.2.2 the router accepts both spellings and redirects the source form to
the canonical slug ([`140`](./140_dual-slug-url-resolution.md)). So this is
**not** a rendering defect and fixing it changes nothing a reader sees. That is
precisely why it needs a gate rather than a bug report: there is no symptom to
notice.

## Where it came from

[`030`](./030_user-guide-relative-links-404.md) measured 85 broken links and its
fix converted them to site-absolute form. That was reverted, and
[`020`](./020_relative-links-are-the-contract.md) converted 129 links back to
relative. **The conversion back went to slug form, not path form** — understandably,
since the site-absolute links being converted already named slugs
(`/user-guide/issues/design-philosophy`), and dropping the base is the obvious
transformation. Nothing at the time asked whether the remaining path named a
file.

**The generalisable point:** a conversion that fixes the *form* of a link is not
the same as one that fixes its *target*, and a gate that tests the form will
certify both alike.
