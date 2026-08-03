---
title: "Fix the renderer"
status: done
agent: claude
---

# Goal

Make a relative link written against the file's own directory resolve in the
built site — the defect the whole link-integrity group descends from, and the one
that was misdiagnosed as an authoring problem.

# Inputs

- [`010` — the renderer drops a URL level](../../../subtasks/100_link-integrity/010_renderer-drops-a-url-level.md)
- `astro-doc-code/src/parsers/postprocessors/internal-links.ts`

# Expected Outcome

Relative links resolve, proven over real HTTP, with a control that fails when the
fix is reverted — and **zero content files changed**. A content edit here would
mean the diagnosis is wrong again.

# Outcome

**Done. Three lines of logic.**

## Traced end to end before touching anything

The check that would have prevented the original mistake, run properly this time,
against a served `dist/`:

| | Request | Result |
|---|---|---|
| the page | `/user-guide/getting-started/installation` | **`301` → `…/installation/`** |
| where `./claude-skills` went | `…/installation/claude-skills` | `404` |
| where it meant to go | `/user-guide/getting-started/claude-skills` | exists |

**That redirect is the whole mechanism.** The page is served with a trailing
slash, so the file's own *name* has become a directory segment and the browser's
base is one level deeper than the source directory. The transform stripped the
prefix and the extension and emitted the `./` unchanged.

## The control, both directions, on one tree

Run by editing one line to `const addLevel = false`, rebuilding, re-measuring,
then restoring and rebuilding again:

| Build | Broken in-body links | Pages | Links checked |
|---|---:|---:|---:|
| shift **disabled** (the shipped behaviour) | **418** | 173 | 15,589 |
| shift **enabled** | **55** | 173 | 15,589 |

Same content, same checker, same links. **A fix that only produces a good number
after it is applied proves nothing about whether it could have failed.**

## Index pages, the only special case

`generateSlug` collapses a trailing `/index`, so `a/index.md` publishes at `a`
and its URL base already *is* its source directory — shifting those would break
them in the opposite direction. `isIndexPage()` mirrors that one line
**including the leading slash**: a content-root-level `index.md` has no parent
segment, is not collapsed, and is not exempt.

## Zero content files changed

Confirmed by `git status` over `user-guide/` and `blog/`. The only edits are the
transform, its dev-docs page, and the record. That separation is the evidence the
diagnosis is right this time, and it is why the 55 survivors were filed as
[their own subtask](../../../subtasks/100_link-integrity/100_links-whose-target-does-not-exist.md)
rather than folded in here.
