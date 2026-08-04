---
title: "`move` orphans a file's .meta.json sidecar — silently, under the old name"
status: review
---

# Overview

**`agent-ks move` moves a first-class `.html` artifact or diagram and leaves its
`.meta.json` sidecar behind, under the old name, with no warning.** The sidecar
is a *coupled* file — same basename, same folder, meaningless apart from its
partner — so moving one without the other produces two broken things at once: an
artifact whose declared title, sidebar label, `embed_height` and theme mode have
vanished, and a stray sidecar the loader will flag as an orphan.

Reproduced 2026-08-04 moving
`notes/90_the-trailing-slash-matrix.html` between issues: the `.html` moved and
was renamed to `10_…`, and `90_the-trailing-slash-matrix.meta.json` stayed
exactly where it was. `move` reported `moved 1 file(s)` and said nothing about
the second file it had just orphaned.

**`check.mjs` already knows sidecars exist** — it has a dedicated predicate so it
does not warn about them as stray files. **`move.mjs` has zero mentions of them**
(`grep -c 'meta\.json' docs/move.mjs` → 0). The concept was taught to one tool
and not the other.

**Done when** moving a file carries its sidecar, and a dry run says so.

# Why it belongs in this group

This is the group's exact shape: **a tool that skips something without saying
so.** A loud failure would have cost one line to fix. Silence means the artifact
renders with a filename-derived title and a defaulted theme mode, which *looks*
fine — the same "looks maintained, isn't" failure as a site-absolute link that
`move` skips, and as the rendering gate that reported `0 broken` while four
anchors were broken.

# Deliverables

1. **`move` carries the sidecar.** When moving `X.html` (or any first-class page
   file) to `Y.html`, also move `X.meta.json` → `Y.meta.json`, and the same for
   `.meta.jsonc`. Use the same mechanism as the primary file, so `git mv` stays
   `git mv` and the fallback stays the fallback.
2. **The dry run reports it.** `--dry-run` lists the sidecar move as its own
   line. A silent success is what this subtask is about.
3. **The rename case is covered**, not just the folder change — the sidecar's
   basename must follow the file's new basename, including a changed `NN_`
   prefix. That is the case that broke: the file became `10_…` and the sidecar
   would have been left as `90_…` even in the same folder.

# Done when

- [x] Moving an `.html` artifact between folders carries `.meta.json` with it
- [x] Moving with a **rename** renames the sidecar to match the new basename
- [x] `.meta.jsonc` is handled identically to `.meta.json`
- [x] `--dry-run` prints the sidecar move as its own line
- [x] A file with **no** sidecar still moves cleanly and reports nothing extra
- [x] Control it both directions: move an artifact **with** a sidecar and confirm
      both land; move one **without** and confirm no spurious line and no error
- [x] `agent-ks check issues` and `agent-ks check section` clean afterwards — no
      orphaned-sidecar warnings anywhere
- [x] Diagram sidecars behave the same way, since they share the contract

# References

- The tool: `plugins/agent-ks/skills/agent-ks-docs/scripts/docs/move.mjs` — the
  move itself is around the `git mv` / `fsMoveRecursive` branch
- The tool that already understands sidecars, and the predicate to reuse rather
  than re-derive: `plugins/agent-ks/skills/agent-ks-docs/scripts/docs/check.mjs`
- The sidecar contract: the `agent-ks-artifacts` skill,
  `references/publishing.md` → *The metadata sidecar contract*
- The sibling defect in the same group — a checker taught the wrong tree:
  [`030`](./030_skill-links-checks-the-wrong-tree.md)
- Where it was found: moving the trailing-slash artifact into
  [the absolute-link-resolution issue](../../../2026-08-04-absolute-link-resolution/issue.md)

# Details

## Why "just also move the sidecar" is the whole fix

The sidecar has no links in it that need rewriting and no inbound links of its
own — nothing references it by path, because it is found by *name convention*
from its partner. So this needs none of `move`'s link machinery. It is a second
`rename` in the same branch, plus a line of output.

**The one judgement call:** if a sidecar exists at the destination already, do
not overwrite it. Fail with the path named. Overwriting a file the user did not
mention is the kind of thing this tool must never do quietly.

## The generalisable point

**A coupled file is part of the thing being moved, not a neighbour of it.**
Anything that operates on a first-class page — move, delete, rename, validate —
has to know the set of files that constitute that page, and there is currently no
single place that says what that set is. Two tools have each answered it
separately, and one of them answered it wrong by omission. Worth a shared
helper rather than a second special case.

# Outcomes — fixed 2026-08-04, and verified by moving real files

**`move.mjs` now carries the sidecar.** One file changed, +80/−17, delegated to a
subagent against this subtask as its brief.

## What the fix does

- **`sidecarMoves()`** returns `{from, to}` pairs by swapping the *from* basename
  for the *to* basename, so a changed `NN_` prefix follows. Empty for a directory
  move (the sidecar rides inside) and for a page type that has none.
- **A pre-move guard** refuses when a destination sidecar already exists, naming
  the path and exiting **before anything moves** — so a refusal leaves the tree
  exactly as it was.
- **`performMove(src, dst)`** was extracted from the inline git-mv/fs branch and
  is called for the page and then each sidecar, so `git mv` stays `git mv` and
  the fallback stays the fallback.
- **The dry run and the summary each print the sidecar move** on its own line.
  That was the point: the defect was silence, not the missing move.

## Verified by executing

Real fixtures, created and deleted; every bullet of the *Done when* list above
was run rather than reasoned about:

| Case | Result |
|---|---|
| Move between folders | sidecar carried ✅ |
| Move **with a rename** (`90_` → `10_`) | sidecar renamed to match ✅ |
| Same-folder prefix rename | sidecar renamed ✅ |
| `.meta.jsonc` | identical handling, comments intact ✅ |
| `--dry-run` | prints its own sidecar lines ✅ |
| A file with **no** sidecar | clean, no extra output, exit 0 ✅ |
| A **diagram** (`.mmd`) sidecar | carried ✅ |
| Destination sidecar already exists | refused, path named, exit 1, tree unchanged ✅ |
| Whole-directory move | 6 files, sidecars rode inside, no sidecar lines ✅ |
| A plain `.md` move | no sidecar output ✅ |
| **`git mv` path, tracked file** | page **and** sidecar both report `[git mv]`; git recorded the rename ✅ |

**The checker was controlled too**, so "no orphans" means something: an orphan
`.meta.json` planted with no partner **was** flagged by `check section`; after
every real move above that warning was absent.

**The `git mv` row was the gap in the delegated run** — its fixtures were
untracked, so every move fell back to `fs`. It reported that rather than glossing
it. Closed afterwards with a tracked fixture, which needed a `git add` an agent
is not permitted to run.

# Follow-up — the duplication this exposed

🟡 **`move.mjs` now carries its own copy of two definitions `check.mjs` already
owns** — the first-class page extensions and the sidecar suffixes. They are
duplicated rather than shared because `check.mjs` is a command script: it parses
argv and exits at import, so nothing can import from it. The copy carries a
comment naming its twin.

That is the *Details* section's prediction coming true in the same change, and it
is the weaker half of the fix: **two definitions of "what files constitute a
page", kept in step by hand.** Anything else that operates on a first-class page
— delete, rename, a future validator — will need the same answer and has nowhere
to get it.

- [ ] Extract the coupled-file definitions into a shared module beside
      `_links.mjs`, and have both `move.mjs` and `check.mjs` import them. Small,
      and it makes the invariant structural instead of documented
