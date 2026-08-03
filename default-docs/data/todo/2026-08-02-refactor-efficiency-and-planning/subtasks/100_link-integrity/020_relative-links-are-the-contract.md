---
title: "The skill offers absolute links as an equal option, and move cannot see them"
status: review
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

**Done when** every surface that states or demonstrates link form says the same
thing, the one real exception is named, and no surface presents the absolute form
as an equivalent alternative.

> [!IMPORTANT]
> **Zero ambiguity is the bar, and it is Sid's, set 2026-08-03.** Not *"prefer
> relative"* — one rule, stated identically everywhere, with the notation spelled
> out so nobody has to infer it:
>
> | Form | Means | Use for |
> |---|---|---|
> | `./x` · `../x` | **relative** to this file's directory | every reference to a file inside this project |
> | `/x` | **site-absolute** — from the site root | nothing internal. This is the form `move` cannot maintain |
> | `https://…` | external | services and pages outside this project |
>
> Spelling out that `./` is relative and a leading `/` is absolute reads as
> obvious. It was not obvious enough to stop 341 links being converted, and the
> conversion was performed by someone who had read both skill files.

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
- [ ] **Sweep every surface that states or demonstrates link form**, so the rule
      is not stated in one place and contradicted in another. The full list, none
      of which the original scoping covered:
      - both skills' reference files — anywhere a link example appears, not only
        the two lines named above
      - `astro-doc-code/src/layouts/issues/default/guide.ts`, the bundled
        plugin-independent twin of the issues skill
      - `default-docs/data/user-guide/` — the pages that teach authors to write links
      - `default-docs/data/dev-docs/` — same, from the implementation side
      - this repo's `CLAUDE.md`, **only if it already says something about links.**
        If it is silent, leave it silent — a rule the skills own does not get
        copied into a file that cannot know when the skill changed
- [ ] **Account for the 137 site-absolute links that exist today** (measured
      2026-08-03, see Details). The user-guide's 115 are the known cross-section
      set; the other 22 have never been looked at
- [ ] Mechanical guard — moved to [`090`](./090_tools-must-say-what-they-skip.md).
      Sid decided 2026-08-03 that the checking should exist, so it is work rather
      than an open question

# Outcomes and Next Steps

**Done 2026-08-03. The exception this subtask was told to verify does not
exist**, which made the rule simpler rather than more complicated.

### The verification that collapsed the exception

A dry-run `agent-ks move` of `05_getting-started/03_aliases.md` rewrote
`[Path Aliases](../../05_getting-started/03_aliases.md)` from inside
`10_configuration/03_site/` correctly. **Cross-section relative links are
maintained.** So the user-guide's 115 "cross-section absolute" links were never a
convention — they were 115 links that had opted out of maintenance. The idea that
they represented a rule was an inference from counting links, which is exactly
what this subtask warned against: *nobody wrote it down as a rule.*

**One rule, no exception, five surfaces:** both skills' reference files, both
`SKILL.md` front pages, and `guide.ts` — the plugin-independent twin that ships
whether or not the plugin is installed. This repo's `CLAUDE.md` was left silent on
link form, per the instruction not to copy a rule the skills own.

### The content, converted

| Directory | Absolute before | Absolute after |
|---|---:|---:|
| `user-guide/` | 115 | **1** |
| `dev-docs/` | 19 | **0** |
| `todo/` | 3 | **2** |

129 links converted, applied one directory at a time with a build and the link
gate after each batch. **Broken in-body links stayed level across both batches** —
the conversion fixed nothing and broke nothing, which is the right outcome: it
moved links back into maintenance without changing what they point at.

Left deliberately: 5 whose target does not exist, which belong to
[`100`](./100_links-whose-target-does-not-exist.md), and the 2 cross-issue tracker
links parked on [`060`](./060_does-the-tracker-share-it.md).

The rule is now enforced by [`check link-form`](./090_tools-must-say-what-they-skip.md)
rather than by prose.

# Details

## What the skills say today

| Where | Text | Effect |
|---|---|---|
| `docs-layout.md:203` | "Use relative paths **or the resolved URL**", showing `[installation](/user-guide/…)` and adding **"— also works."** | Presents the absolute form as sanctioned |
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

## Where the absolute links actually are — measured 2026-08-03

Counted across `default-docs/data/**/*.md`, on the working tree after the revert:

| Directory | site-absolute `](/…)` | relative `](./…` · `](../…` | external `http` |
|---|---:|---:|---:|
| `user-guide/` | **115** | 372 | 3 |
| `dev-docs/` | **19** | 70 | 6 |
| `todo/` (the tracker) | **3** | 838 | 8 |
| `blog/` · `pages/` | 0 | 0 | 0 |

**137 site-absolute links, and the scoping so far has only explained 115 of
them.** The `dev-docs` 19 and the tracker's 3 were never examined — they may be
the same cross-section convention, or they may be leftovers. Each one is a link
`agent-ks move` will silently decline to maintain, so "probably fine" is not an
answer this group is allowed to give.

## The exception — to verify, not assume

`default-docs/data/user-guide` holds **115 absolute links**, all cross-section
(`19_issues/` → `/user-guide/configuration/…`), and they predate this work
(introduced in `0937abe`). So the convention *appears* to be:

- **within a section** → relative
- **across sections** → absolute

That reads coherently, but it is an inference from counting links — **nobody
wrote it down as a rule**. Confirm against `move.mjs` whether a cross-section
relative link would be rewritten correctly before enshrining the exception.
