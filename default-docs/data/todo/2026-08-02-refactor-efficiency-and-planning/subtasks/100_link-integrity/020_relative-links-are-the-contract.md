---
title: "The skill offers absolute links as an equal option, and move cannot see them"
status: in-progress
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

# Reopened — what the audits found in the rule itself

**Back to `in-progress` 2026-08-03.** Both reviews landed on the wording, not
just the code. Full record in
[the review round](../../agent-log/040_wf_fix-the-tools-then-the-links/02_working/050_independent-reviews.md).

- 🟢 ~~**The rule is wrong for the tracker.** It says "always relative, no second
  option", and relative links 404 in the tracker today.~~ **Retracted
  2026-08-03 — this was my error, not the rule's.** Fifteen links clicked in
  [`110`](./110_live-check.md): every within-tracker shape resolved correctly.
  The rule stands as written. What actually fails is a tracker link that
  **leaves** the tracker, because the target section's slug transform is never
  applied — see [`120`](./120_dev-and-build-disagree-on-the-base.md). Note this
  finding was carried by *both* independent reviews; neither opened a URL.
- 🔴 **The rule conflates a page link with an asset reference.** Sid's
  correction: there are two asset kinds and they are different *routes*, not two
  styles — `/assets/…` is the **site** assets folder (favicon, logos, one global
  place), while `./assets/…` is **colocated per-doc**, sidebar-ignored, rewritten
  at build to `/content-assets/…`. Ten such folders are in use. The rule must
  state both, and must stop implying that a leading `/` is always wrong.
- 🟡 **The reason in the skill is the shallow one.** `docs-layout.md:216` gives
  only the `move` argument — *"a site-absolute link has silently opted out of
  link maintenance forever"*. True, and it makes the rule sound like a tooling
  constraint that a better tool would remove. **The real reason is that a
  relative path is what is TRUE on disk**, and the app renders the filesystem
  rather than the other way round (project `CLAUDE.md`, *the filesystem is the
  document*). Two or three lines, above the `move` argument rather than instead
  of it — an author who understands why does not need the rule enforced.
- 🟡 **One line in the same block is now stale.** `docs-layout.md:220` says the
  renderer *"adjusts the URL depth for you"*. That is the depth shift
  [`120`](./120_dev-and-build-disagree-on-the-base.md) supersedes; it is correct
  for the built site and wrong in dev. Reword to promise only what survives —
  prefixes and `.md` stripped, and now both URL spellings accepted.
- 🟡 **Cross-root portability was never tested.** The "no exception" proof ran
  inside one content root. The six links now crossing `user-guide` ↔ `dev-docs`
  resolve only because every data folder here is named like its `base_url`;
  Codex tested a hypothetical `/internals` base and got a 404.
- 🟡 `10_writing.md:135` claims ordering prefixes are stripped from URL slugs.
  **False for the tracker** — `issues.ts:1275` keeps the prefix.
- 🟡 The 341-link incident is narrated **inside the skill**, which this repo's
  `CLAUDE.md` forbids: skills are history-free, and the tracker already holds it.
- 🟡 One mechanical fact (`move` skips `/` targets) is now asserted in **eleven
  places**. `_links.mjs:28` is the single line that decides it.
- 🟢 `guide.ts` states the exception one clause narrower than the skill.
- **Boundary leak:** "a file with nothing to link to" literally covers skill
  `.md` files, which are outside the site but must use relative links.

## Todo — the reopened round

Checked against the files 2026-08-04. Items 1–4 are all one block:
`plugins/agent-ks/skills/agent-ks-docs/references/layouts/docs-layout.md`,
under *Cross-linking between docs pages*.

- [x] **1. Say WHY, and say the real why — agent-first, filesystem-first.**
      Sid, 2026-08-04: the documents are built in a **filesystem-first format so
      that filesystem tools work on them** — `move`, `grep`, an editor, an agent
      walking the tree. A relative link is the only form that is true on disk, so
      it is the only form all of those can follow. **The UI is an addition that
      enhances the documents; it is not the thing being built.** The skill today
      gives only the `move` argument, which reads as a tooling constraint a
      better tool would remove — and that framing is what made converting 341
      links look reasonable. Two or three lines, **above** the `move` argument
      rather than instead of it.

      The principle is stated in full in this repo's `CLAUDE.md` (*the filesystem
      is the document; the app renders it*). **Write a short version, do not copy
      the section** — a copy cannot know it was replaced.

- [x] **2. Stop saying a leading `/` is always wrong.** The rule table reads
      `/x` → *"nothing internal"*, which contradicts `writing.md:81`, where
      `/assets/logo.png` is correct and required. Two asset kinds, two routes:
      **`/assets/…`** is the site-wide folder (favicon, logos), **`./assets/…`**
      is colocated per-doc and rewritten at build to `/content-assets/…`.
      Colocated is the default; the site folder is the exception.

- [x] **3. Drop the stale depth claim.** The block says the renderer *"adjusts
      the URL depth for you"*. That is the interim one-level shift, correct only
      on the built site, and it is being deleted by
      [`2026-06-09` `03`](../../../2026-06-09-issue-link-resolution/subtasks/03_comprehensive-panel-subdoc-links.md).
      Promise only what survives: `NN_` prefixes and `.md` stripped, and **both
      URL spellings accepted** (shipped in 0.2.2).

- [x] **4. Keep the warning, delete the story.** The 341-link incident is
      narrated inside the skill, which this repo's `CLAUDE.md` forbids — skills
      are history-free and the tracker already holds it. Keep the *rule* ("a
      relative link that 404s is a renderer bug — do not convert it to `/`"),
      drop the incident and the number.

- [x] **5. Cross-root portability — moved out, 2026-08-04.** It is not a wording
      defect: `base_url` and the data folder are two independent `site.yaml`
      values that only match here by naming convention, so a cross-section link
      resolves by luck. It needs reproducing and probably a config-load refusal,
      neither of which belongs in a documentation rewrite. Now
      [`160`](./160_base-url-and-folder-name-are-not-tied.md).

- [x] **6. Repeat the fact deliberately — do NOT deduplicate it.** Sid, 2026-08-04:
      **the fact belongs in three or four places in the skill, and five or six
      more across docs, the tracker and the code is fine.** The audit's
      "asserted in eleven places" was framed as duplication to cut; that is the
      wrong read. A rule an author meets once, in a file they may never open, is
      a rule that gets missed — which is how 341 links were converted by someone
      who had read both skill files.

      **The condition is weight, not count.** Every restatement carries the
      *reason* with it, not just the instruction — a bare "links must be
      relative" repeated eleven times is eleven chances to read past it. What
      must stay single is the **mechanism**: `_links.mjs:28` is the one line that
      decides it, and no restatement may re-implement or contradict it.

      Audit each occurrence for *reason and weight*, strengthen the thin ones,
      and add the fact where an author would look and not find it.

- [ ] **7. Check the two smallest findings** — `guide.ts` states the exception one
      clause narrower than the skill, and "a file with nothing to link to"
      literally covers skill `.md` files, which sit outside the site and must
      still use relative links.

- [ ] **8. Reconcile this file with itself.** The Todo list near the top has every
      box unticked while *Outcomes* below declares the work done on 2026-08-03
      with measurements. One of the two is wrong; **Sid decides which**, so
      neither was changed.
