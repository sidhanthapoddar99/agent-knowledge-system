---
title: "A file reference is a link, not a backticked path"
status: done
---

# Overview

**Referring to a file by writing its path in backticks is not a lighter form of
linking. It is a reference that no tool can see and no reader can follow.**

**Opened because the issues skill permitted both forms**, offering backticked
repo paths as an alternative and saying only "prefer" real links — the same
construction that caused this entire group: *a rule required for correctness,
written as a preference*. The sentence even named the consequence (`move` rewrites
real links) and offered the unmaintainable form in the same breath.

**That wording is gone**, replaced during
[the relative-links sweep](./020_relative-links-are-the-contract.md). See the
closing section for what the skills say now.

Three things a backticked path costs, all of them silent:

| Cost | Who pays |
|---|---|
| `agent-ks move` cannot rewrite it, so it rots on the next file move | everyone, later |
| A reader cannot click it — and gets no title, no context, nothing but a path | the human |
| An agent must run a find-and-search to resolve it | every agent, every time |

**Done when** the skills state this as the rule with its three reasons attached
and the alternative removed rather than deprecated — **achieved**. Converting the
references already written into the content was considered and deliberately
dropped; see the closing section.

# References

- Where the rule now lives: the writing references of both skills, plus their
  `SKILL.md` files and the agent-log and docs-layout references — six files
- The same defect shape in the *other* half of link form:
  [`020`](./020_relative-links-are-the-contract.md) — a required rule offered as
  an option, which returns a plausible result when skipped
- What consumes real links:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/docs/move.mjs`
- The tool that should report the gap:
  [`090`](./090_tools-must-say-what-they-skip.md)

# Todo list

- [x] Rewrite the permissive line — a markdown link is **the** form. Delete *"or
      backticked repo paths in prose"* rather than discouraging it
- [x] Attach all three reasons, not just the `move` one. The reader-facing and
      agent-facing costs are what make this a rule about writing rather than a
      tooling detail
- [x] Name the one legitimate use of a backticked path: **a file that is not
      linkable from where you are standing** — outside the site root, or a path
      being discussed as a string rather than pointed at. State it as the
      exception so it does not read as a loophole
- [x] Do the same sweep as [`020`](./020_relative-links-are-the-contract.md)
      across the docs skill, `guide.ts`, and any reference showing examples
- [x] **Measure before converting.** Done — the real figure is **95**, not the estimate below. Indicative count 2026-08-03: 29 backticked
      paths in `user-guide/`, 15 in `dev-docs/` that contain a `/` and end in
      `.md`. That undercounts — most doc references drop the extension — so
      establish the real number first
- ⬜ **Dropped.** Convert what should be links, and leave what genuinely should not.
      **This is a content edit at scale and it is the exact operation that went
      wrong last time** — see the warning below

# Outcomes and Next Steps

> [!NOTE]
> **PLACEHOLDER** — raised by Sid 2026-08-03 while reviewing this group. Not
> started.

# Details

## The warning that has to travel with this subtask

**The last mass link edit in this repo touched 341 files and was wrong.** This
subtask proposes another one. The difference must be earned, not asserted:

- The 341 were converted on an **unverified diagnosis** — the renderer was never
  opened. Here the defect is not a diagnosis at all: `move.mjs` demonstrably
  rewrites markdown links and demonstrably cannot rewrite a backticked string.
  There is no hypothesis to be wrong about.
- Even so: **convert in reviewable batches, one directory at a time**, and run
  the link gate after each. Not one scripted sweep.
- **A backticked path is not automatically wrong.** Unlike the absolute-link case,
  this one has real exceptions — paths outside the site, paths being discussed as
  values. A blanket rewrite would create a different kind of damage.

## Why this belongs in the link-integrity group

It looks like a writing-style item and it is not. It is the third instance of one
mechanism, and the group exists to remove that mechanism rather than its symptoms:

```
required for correctness  →  written as an option  →  skipping it looks fine
                                                       and fails silently later

  absolute vs relative link   →  "or the resolved URL — also works"
  link vs backticked path     →  "or backticked repo paths in prose"
  page data dir must exist    →  (090/020) the build just rendered an empty section
```

Each one produces something that renders correctly, reads correctly, and is
already broken.

## What this fixes for the human reader, which the tooling argument misses

`agent-ks move` is the reason usually given, and it is the weakest of the three
because it only matters on the day someone moves a file.

The everyday cost is that a backticked path **carries no information the reader
did not already have.** `subtasks/040_execution/00_overview.md` tells you a file
exists somewhere. A link tells you the same thing, takes you there, and — because
markdown link text is free — lets the sentence say what the file *is*:

> `subtasks/040_execution/00_overview.md`

versus

> [the execution group's overview](../040_execution/00_overview.md)

Same reference. One of them is readable in a sentence and one interrupts it.

# Closed 2026-08-04 — the rule shipped, the sweep was tried and abandoned

**Closed on Sid's decision: the rule belongs in the skills, the conversion does
not belong in a project.** The 95 existing backticked paths are left in place and
get converted as files are touched.

## What this subtask's Overview claimed, and what was actually true

**The permissive line it was opened against no longer existed.** It quoted the
issues skill offering "or backticked repo paths in prose"; that was replaced
during [the relative-links sweep](./020_relative-links-are-the-contract.md).
`grep` for the permissive phrasing returns nothing in the repo source **or** the
installed plugin cache, and the rule with its three costs and its exception is
now stated across six skill files.

So three of the six Todo items above were already done when this was reopened —
worth recording, because the subtask was read as current for a day and it was
describing a world that had already changed.

## What was added now

One rule, in the two skills that teach link writing: **if you encounter a
backticked document path while editing a file, convert it there** — link text
from the target's own `title`, so the sentence gains a name instead of a path.
It states explicitly that there is **no tracked sweep**, and if one is ever
requested it runs as *detect → check → convert*, where "check" means the path
**resolves to a real document on disk**.

## The sweep was run, and reverted — the warning above was right

Recorded because the failure is the useful part, not the outcome.

**Measurement first, since every count in this group has needed one.** The
estimate in the Todo list (29 + 15) was low, and a naive scan was wildly high:

| Method | Count | What it really measured |
|---|---:|---|
| Todo-list estimate | ~44 | paths containing `/` and ending `.md` |
| Naive backtick scan | 3,230 | mostly section *names* — `` `notes/` ``, `` `issue.md` `` — being discussed, not references |
| **Resolves to a real file on disk** | **95** | the honest figure, and the definition now written into the skills |

A script then converted 89 of the 95, taking link text from each target's
`title`. Reading the diff found two defect classes, and it was reverted whole:

1. **Nested markdown.** A backticked path inside an existing link's text became
   `[[text](path)](path)`.
2. **It destroyed a teaching example.** [Markdown Basics](../../../../user-guide/15_writing-content/02_markdown-basics.md)
   explains how to write links and *shows a path* to do it. The script turned the
   demonstration into a link, so the page teaching the syntax stopped showing the
   syntax. That is this subtask's own stated exception — **a path being discussed
   as a value rather than pointed at** — and it is not detectable from the path.

**Resolvability proves a path *could* be a link. It cannot distinguish a
reference from an example.** Only someone reading the sentence can, which is
exactly why the rule now fires at the moment of editing rather than as a batch.

Nothing was committed; no sweep script exists.

## Why leaving the 95 is defensible, and where the real fix is

**A backticked path is honest about being text.** It does not pretend to be
maintained — unlike a site-absolute link, which renders as a working link while
`move` silently skips it. That difference is why this never warranted the
urgency of [the relative-link rule](./020_relative-links-are-the-contract.md).

The remaining cost is that the rot is **silent**: when a file moves, `move`
reports nothing about the backticked references it just invalidated. That is not
fixed by converting 95 files today — it is fixed by making the tools say so, and
it is already scoped as
[tools must say what they skip](./090_tools-must-say-what-they-skip.md), whose
Todo list carries *"`check` flags a backticked path that resolves to a real
file"*. **That is the higher-value work**, because it surfaces every future
instance instead of clearing today's.
