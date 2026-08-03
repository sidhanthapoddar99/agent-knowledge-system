---
title: "A file reference is a link, not a backticked path — and the skill currently allows both"
status: open
---

# Overview

**Referring to a file by writing its path in backticks is not a lighter form of
linking. It is a reference that no tool can see and no reader can follow.**

The issues skill permits it explicitly:

> *"**Cross-issue / cross-file links**: standard markdown relative links
> (`../2026-05-08-runtime-stack-migration/issue.md`) **or backticked repo paths in
> prose**. `agent-ks move` rewrites real markdown links when files move — prefer
> them…"*
>
> — `plugins/agent-ks/skills/agent-ks-issues/references/10_writing/10_writing.md:117`

"Prefer them" is the same construction that caused this entire group: **a rule
required for correctness, written as a preference.** The sentence even states the
consequence — `move` rewrites real links — and then offers the unmaintainable
form as an alternative in the same breath.

Three things a backticked path costs, all of them silent:

| Cost | Who pays |
|---|---|
| `agent-ks move` cannot rewrite it, so it rots on the next file move | everyone, later |
| A reader cannot click it — and gets no title, no context, nothing but a path | the human |
| An agent must run a find-and-search to resolve it | every agent, every time |

**Done when** every file reference in the skills, the bundled guide and the docs
is a markdown link, the skills state it as the rule with the three reasons
attached, and the alternative is removed rather than deprecated.

# References

- The line that permits both forms:
  `plugins/agent-ks/skills/agent-ks-issues/references/10_writing/10_writing.md:117`
- The same defect shape in the *other* half of link form:
  [`020`](./020_relative-links-are-the-contract.md) — a required rule offered as
  an option, which returns a plausible result when skipped
- What consumes real links:
  `plugins/agent-ks/skills/agent-ks-docs/scripts/docs/move.mjs`
- The tool that should report the gap:
  [`090`](./090_tools-must-say-what-they-skip.md)

# Todo list

- [ ] Rewrite `10_writing.md:117` — a markdown link is **the** form. Delete *"or
      backticked repo paths in prose"* rather than discouraging it
- [ ] Attach all three reasons, not just the `move` one. The reader-facing and
      agent-facing costs are what make this a rule about writing rather than a
      tooling detail
- [ ] Name the one legitimate use of a backticked path: **a file that is not
      linkable from where you are standing** — outside the site root, or a path
      being discussed as a string rather than pointed at. State it as the
      exception so it does not read as a loophole
- [ ] Do the same sweep as [`020`](./020_relative-links-are-the-contract.md)
      across the docs skill, `guide.ts`, and any reference showing examples
- [ ] **Measure before converting.** Indicative count 2026-08-03: 29 backticked
      paths in `user-guide/`, 15 in `dev-docs/` that contain a `/` and end in
      `.md`. That undercounts — most doc references drop the extension — so
      establish the real number first
- [ ] Convert what should be links, and leave what genuinely should not.
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
