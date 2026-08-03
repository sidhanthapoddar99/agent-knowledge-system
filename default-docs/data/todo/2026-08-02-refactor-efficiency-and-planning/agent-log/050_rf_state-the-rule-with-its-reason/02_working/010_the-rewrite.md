---
title: "The rewrite — the rule now carries its reason"
---

# What this round did

**Thirteen files changed, plus this record and the subtask's checkboxes. The rule
did not change; what changed is that every surface stating it now says *why*, and
the why is the architectural one.**

Before this round, every restatement of "internal references are relative" gave
the same single reason: `agent-ks move` cannot maintain a link starting with `/`.
That framing makes the rule sound like a tooling limitation a better tool would
remove — which is exactly the framing under which content links were once
converted to a form `move` silently drops.

Every restatement now leads with the architectural reason instead, and keeps the
`move` argument underneath it as a *consequence*: these documents are written
filesystem-first so that filesystem tools work on them — `move`, `grep`, an
editor, an agent walking the tree — and a relative link is the only form that is
**true on disk**, so it is the only form all of them can follow. The rendered
site is one consumer of the documents, not the thing being built.

Short versions everywhere. The full principle stays in the repo's `CLAUDE.md`
under *"The filesystem is the document. The app renders it."* and was not copied.

# Per item

## Item 1 — say why, and say the real why

Added the filesystem-first paragraph **above** the `move` argument in
`docs-layout.md` → *Cross-linking between docs pages*, and rewrote the `move`
paragraph so it reads as the mechanical consequence rather than the reason. The
sentence that carries the load: *a better `move` would not change the answer,
because a `/` link was never a path to begin with.*

The same short version was then propagated to every other surface that states
the rule — see the table below.

## Item 2 — a leading `/` is not always wrong

The rule table in `docs-layout.md` said `/x` → *"nothing internal"*. That
contradicted `references/writing.md`, where `/assets/logo.png` is correct and
required. The table is now four rows, and it separates the two asset **routes**
rather than presenting two styles:

| Form | Means |
|---|---|
| `./x` · `../x` | relative to this file's directory — every reference to a file inside the project |
| `/assets/…` | the site assets folder (favicon, logos, shared symbols) — the one internal case where a leading `/` is correct, because it genuinely *is* a site-level URL |
| `/x` — anything else | a URL counted from the site root. Nothing. |
| `https://…` | external |

Colocated (`./assets/…`) stays the default and the site folder stays the
exception; the exception is now stated wherever the rule is, instead of only in
`writing.md`.

## Item 3 — the stale depth claim

`docs-layout.md` promised the renderer *"adjusts the URL depth for you"*. That is
the interim one-level shift, correct only on the built site. Replaced with what
survives: `NN_` ordering prefixes and the `.md` extension are stripped, and
**both URL spellings are accepted**. The same stale clause was in the docs
`SKILL.md` universal conventions ("prefixes, extensions **and the URL-depth
offset**") and was corrected there too.

## Item 4 — keep the warning, delete the story

The incident narration ("341 content links were converted … all 341 had to be
reverted", and the "44 lines apart" aside in the *Move* callout) is gone from
both places in `docs-layout.md`, and the phrase "and the incident behind it" is
gone from the docs `SKILL.md`. Skills are history-free; the tracker holds it.

**The rule the story was carrying is kept and is now stronger**, because it
states the principle rather than the anecdote: a relative link that 404s on the
built site is a renderer defect to file — converting it inverts the model, making
correct-on-disk content wrong on disk to satisfy one consumer, and dropping the
link out of maintenance permanently.

## Item 6 — repeat it deliberately, with weight

Treated as the opposite of deduplication, per the brief. **The fact is now stated
in 15 places across 13 files** (`docs-layout.md` and `writing.md` carry two each),
**and every one of them now carries the reason rather than only the
instruction.** Counted against the files, not estimated:

| Surface | Restatements |
|---|---:|
| docs skill — `docs-layout.md` (cross-linking block · Move callout) | 2 |
| docs skill — `writing.md` (universal rules · asset embedding) | 2 |
| docs skill — `SKILL.md` | 1 |
| issues skill — `SKILL.md` · `10_writing.md` · `43_moving-restructuring.md` | 3 |
| scripts — `_links.mjs` · `check-link-form.mjs` · `check-content-links.mjs` · `move.mjs` | 4 |
| user-guide — `02_markdown-basics.md` · `19_issues/03_folder-structure.md` | 2 |
| dev-docs — `06_post-processing.md` | 1 |

Three surfaces gained the fact where it was previously absent entirely — each one
a place an author would plausibly look and not find it:

- `references/writing.md` → *Universal rules*. The general writing reference had
  **no link-form rule at all**.
- `default-docs/data/user-guide/15_writing-content/02_markdown-basics.md` →
  *Links*. This section was three lines of example code and no rule — the single
  most likely page for an author to consult about link syntax.
- `default-docs/data/user-guide/19_issues/03_folder-structure.md` → *Reference by
  link, never by number*. Taught link-vs-number and said nothing about link
  *form*.

The **mechanism stays single**. `_links.mjs → isIgnorableTarget` is still the only
place that classifies a target, and its comment now says so explicitly — no other
file may re-implement the classification and no restatement may contradict it.
Nothing was added that re-derives the rule in code.

## Item 7 — the two smallest findings

**The boundary leak is fixed.** The exception read "a file with nothing to link
to … it is about reachability — the file is outside the site". Taken literally
that covers the skill's own `.md` files, which are outside the site and *must*
use relative links — `agent-ks check skill-links` exists to enforce exactly that.
Both the issues `SKILL.md` and `10_writing/10_writing.md` now say the test is
**"the target is not a document"** (source code, config, a path being discussed
as a value), and both spell out that *"not served on the site"* is the wrong
reading, naming the skill files as the case that proves it.

**The `guide.ts` half was NOT changed — see below.**

# Files touched

| File | What its restatement now says |
|---|---|
| `plugins/agent-ks/skills/agent-ks-docs/references/layouts/docs-layout.md` | The primary statement. Filesystem-first reason above the `move` argument; four-row rule table separating `/assets/` from every other `/`; depth claim replaced with prefixes + extension + both spellings; incident deleted, warning kept and restated as a principle. The *Move* callout reframed as the mechanical half of the same idea |
| `plugins/agent-ks/skills/agent-ks-docs/SKILL.md` | Universal convention rewritten: reason first, `move` as consequence, `/assets/…` named as the one exception, URL-depth claim dropped, "the incident behind it" dropped |
| `plugins/agent-ks/skills/agent-ks-docs/references/writing.md` | **New** universal rule — link the source file, why (true on disk, filesystem tools), a `/` link is a URL that leaves maintenance silently, a 404 is a renderer defect to file. Asset-embedding paragraph strengthened to say the two asset kinds are two *routes*, not two styles |
| `plugins/agent-ks/skills/agent-ks-issues/SKILL.md` | Reason paragraph added under the backticked-path/site-absolute block; exception narrowed from "outside the site" to "not a document", with the skill files named as the counter-example |
| `plugins/agent-ks/skills/agent-ks-issues/references/10_writing/10_writing.md` | Reason added ahead of the three silent costs; `move` skipping `/` explained as correct rather than as a gap; same exception correction as the issues `SKILL.md`, at length |
| `plugins/agent-ks/skills/agent-ks-issues/references/40_operations/43_moving-restructuring.md` | One clause: relative because a tracker is a folder of markdown that filesystem tools operate on; `/todo/…` is a URL, `move` skips it, it never follows a file again |
| `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs` | Comment on `isIgnorableTarget`: declares itself the single place the classification lives, and explains that a `/` target is skipped because it is not a path at all — a smarter `move` would have to guess a URL prefix. Code unchanged |
| `plugins/agent-ks/skills/agent-ks-docs/scripts/check-link-form.mjs` | Header now opens with what the documents are, then derives the `move` behaviour from it; adds that the fix is always to make the link relative, never to loosen the rule. Code unchanged |
| `plugins/agent-ks/skills/agent-ks-docs/scripts/check-content-links.mjs` | The "never convert to site-absolute" note now gives the principle before the tool: converting makes correct content wrong on disk to make one consumer go green. Code unchanged |
| `plugins/agent-ks/skills/agent-ks-docs/scripts/docs/move.mjs` | Runtime warning text: the skipped links are now explained as *not true on disk*, so no filesystem tool can follow them — not just "`move` can't". Logic unchanged |
| `default-docs/data/user-guide/15_writing-content/02_markdown-basics.md` | **New** prose under *Links*: source path not URL, the filesystem-first reason in plain words, why a `/` link is the dangerous failure (renders perfectly), an IMPORTANT callout that a 404 on a disk-correct link is a renderer defect, and the `/assets/` exception |
| `default-docs/data/user-guide/19_issues/03_folder-structure.md` | **New** paragraph after the link-vs-number rule: the link is relative, for the same reason one level down; a `/todo/…` link hides its own failure; a 404 is a renderer defect, never a reason to rewrite content |
| `default-docs/data/dev-docs/05_architecture/04_parser/06_post-processing.md` | The existing warning now states the *direction of the contract* — the transform exists to serve the authoring form, not the reverse — so a relative link that 404s is a bug in that file and the fix belongs there |

**One link was added**, in `02_markdown-basics.md`:
`[Asset embedding](./03_asset-embedding.md)`, relative. No existing link anywhere
was changed, in content or in the skills.

# Found and deliberately not changed

**`astro-doc-code/src/layouts/issues/default/guide.ts` — item 7's other half is
real and is still open.** The bundled guide states the exception as *"a file with
nothing to link to, such as source code outside the site"* — one clause narrower
than the skill, and narrower in exactly the direction the boundary leak runs. It
also gives only the `move` reason, so it is now the one surface that states the
rule without the architectural why.

It was not changed because the run brief forbids editing `astro-doc-code/src/**`
outright. The repo's `CLAUDE.md` separately requires `guide.ts` and the issues
skill to be kept in sync, so **the two instructions point opposite ways here** and
this is a decision the brief did not settle. It is a self-contained edit: two
sentences, no code.

**`check link-form` rejects a form `writing.md` requires.** The gate skips images
(`![…](/assets/…)`) but not links, so `[Download the spec](/assets/spec.pdf)` —
the exact form the skill documents as correct — would fail it. It is green today
only because no such link exists in the content outside the tracker (measured:
three `](/assets/…)` non-image occurrences in `data/`, all of them inside tracker
files quoting the problem). Item 2 makes this contradiction explicit rather than
creating it. **Already owned by
[`090` tools must say what they skip](../../../subtasks/100_link-integrity/090_tools-must-say-what-they-skip.md)**
— left there, not fixed here, since changing a gate's verdict is a behaviour
decision and this run is documentation only.

**`move`'s unmaintainable warning has the same conflation.** A dry run reports
`/assets/…` links among the "left UNMAINTAINED" set. That is correct as far as
maintenance goes — `move` genuinely will not rewrite them — but it reads as an
accusation against links that are correctly written. Same owner, same reason for
leaving it.

**`10_writing.md` on ordering prefixes was already right.** The reopened list
flagged it as claiming prefixes are stripped from tracker URLs; the file now
states the opposite (*"A tracker URL keeps its ordering prefixes"*), so there was
nothing to fix.

**The 341 incident is still narrated in the script comments** under
`scripts/**`, and was left there on purpose. The history-free rule governs the
skill and published docs; a comment explaining why a gate exists is design
rationale for a maintainer, not documentation for a reader, and the number is
what makes that rationale land.

# Verification

Every gate run with `agent-ks-dev` (banner confirmed `[repo source tree]`), before
and after:

| Gate | Before | After |
|---|---|---|
| `check skill-links` | ✅ pass — 44 files | ✅ pass — 44 files |
| `check link-form` | ✅ pass — 568 links / 161 files | ✅ pass — 569 links / 161 files |
| `check issues` | ✅ pass — 51 folders, 1 warning | ✅ pass — 51 folders, same 1 warning |

The +1 link is the one added cross-reference. The pre-existing `issues` warning
(`2026-04-10-issues-layout/agent-log/exploration/` has no numeric prefix) is
unrelated and untouched.

The four edited `.mjs` files were syntax-checked (`node --check`, all clean), and
`agent-ks-dev move --dry-run` was run to exercise the changed warning path — it
resolved and rewrote links normally and printed the new text. Nothing was moved.

No git command was run. Everything is in the working tree.
