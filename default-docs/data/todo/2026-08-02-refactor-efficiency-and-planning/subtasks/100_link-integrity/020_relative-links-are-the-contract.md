---
title: "The skill offers absolute links as an equal option, and move cannot see them"
status: open
---

# Overview

**Relative links are not a style preference here — they are what `agent-ks move`
needs in order to work.** `move` turns every link into a real file path before
rewriting it, and skips anything starting with `/`. So a link written as
`/user-guide/themes/colors` renders perfectly and is invisible to the one tool
whose job is keeping links alive when files move.

**The docs skill does not say this. It offers the absolute form as an equal
option.** That is the permission under which 341 content links were converted to
a form `move` cannot maintain (reverted in `ee404bb`).

**Done when** both skills state relative links as the rule *with the reason
attached*, the one real exception is named, and the docs skill stops presenting
the absolute form as an equivalent alternative.

# References

- The line that blessed the wrong form:
  `plugins/agent-ks/skills/agent-ks-docs/references/layouts/docs-layout.md:203`
- The consequence, stated 44 lines later and never joined to it: same file, `:247`
- The rule stated correctly but with only half the reason:
  `plugins/agent-ks/skills/agent-ks-issues/references/10_writing/10_writing.md:117`
- The code that makes it binding:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/_links.mjs` → `isIgnorableTarget`, line 28
- What consumes relative targets:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/docs/move.mjs`
- The rendering defect that made the wrong form attractive:
  [`010`](./010_renderer-drops-a-url-level.md)

# Todo list

- [ ] Rewrite `docs-layout.md:203` — relative is **the rule**, not one of two
      options. Drop the *"— also works"* framing from the absolute example
- [ ] Put the **reason in the same place as the rule**: `agent-ks move` rewrites
      relative targets and skips absolute ones, so an absolute link opts itself
      out of link maintenance permanently
- [ ] Name the one exception — leaving the section — **and verify it against
      `move.mjs` first.** If a cross-section relative link would in fact be
      rewritten correctly, there may be no exception needed, and the simpler rule
      wins
- [ ] Strengthen `10_writing.md:117` the same way: it states the rule but frames
      the reason against bare prose paths, not against absolute links
- [ ] Check every other reference that shows link examples, so the rule is not
      stated in one place and contradicted in another
- [ ] Decide whether `agent-ks check` should warn on a **new** absolute link
      inside a section. Record the decision either way — a rule that lives only
      in prose is exactly the shape that failed here

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — diagnosed, not written. Blocked on Sid's approval to start
> work. The mechanical-guard question needs a decision before this can close.

# Details

## What the skills say today

| Where | Text | Effect |
|---|---|---|
| `docs-layout.md:203` | "Use relative paths **or the resolved URL**", showing `[installation](/user-guide/getting-started/installation)` and adding **"— also works."** | Presents the absolute form as sanctioned |
| `docs-layout.md:247` | "site-absolute links (leading `/`) … are left untouched" | States the consequence, in another section, with no link back |
| `10_writing.md:117` | "standard markdown relative links … `agent-ks move` rewrites real markdown links when files move — prefer them over bare prose paths" | Right rule; the reason is aimed at prose paths, not absolute links |

Both halves of the important fact are written down. They sit 44 lines apart and
nothing joins them.

## Why this is the shape to fear

This is exactly the pattern the project's own rules say to hunt first — **a
required rule written as an optional setting**:

1. A rule that must hold for correctness — links must be relative or `move`
   cannot maintain them.
2. Written so the caller may skip it — *"or the resolved URL … also works."*
3. When skipped, **the system returns a plausible result anyway**. The page
   renders, the link works in a browser, and it fails only later, on a file move,
   with nothing reporting it.

An option that failed loudly would have been fine. An option that quietly
produces something correct-looking and unmaintainable is the defect.

## The evidence, in code

`_links.mjs` — the function `move` consults before deciding a link is its
business:

```js
if (url.startsWith('/')) return true;              // site-absolute (incl. /assets/)
```

`move.mjs` then rebuilds each surviving link with
`path.relative(fileDir, targetAbs)`. An absolute link is not a path relative to
the file, so it is never resolved and never rewritten — correctly, because `move`
cannot know what URL prefix a section publishes under.

This was demonstrated live while regrouping these very subtasks: one `move`
rewrote **6 relative links across 4 files** without being asked. Every one of
those would have been skipped had they been absolute.

## The exception — to verify, not assume

`default-docs/data/user-guide` holds **115 absolute links**, all cross-section
(`19_issues/` → `/user-guide/configuration/…`), and they predate this work
(introduced in `0937abe`). So the convention *appears* to be:

- **within a section** → relative
- **across sections** → absolute

That reads coherently, but it is an inference from counting links — **nobody
wrote it down as a rule**. Confirm against `move.mjs` whether a cross-section
relative link would be rewritten correctly before enshrining the exception.
