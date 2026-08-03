---
title: "Independent reviews"
status: in-progress
agent: claude
---

# Goal

Get the run reviewed by agents that did not write it — **required, not optional**,
because the run edited standing instructions: both `SKILL.md` files, two skill
reference files, the bundled `guide.ts`, and the project `CLAUDE.md`.

The rule (`~/.claude/references/writing-claude-md.md`) is that a change to
standing instructions is not final until independently reviewed by more than one
agent, none of which wrote it, and that reviews merge as a **union, not a vote**.
**It did not fire during the run.** Sid asked for it afterwards.

# Inputs

- The run under review: commits `e969982..bf0099c`
- Two reviewers, on deliberately different lenses:
  - **Opus**, in-harness — do the instruction surfaces agree with each other and
    with the code
  - **Codex `gpt-5.6-sol`**, external, `xhigh`, read-only — link correctness and
    whether the 129 conversions preserved meaning. Chosen because it **executes**
    rather than reads, and reading does not catch off-by-one bugs

# Expected Outcome

Every finding recorded as the reviewer stated it, before any of it is argued
with or fixed. Merge as a union: one reviewer finding something is a finding.

# Outcome

**Opus: complete, and nothing was clean — all three concerns produced findings.**
**Codex: still running at the time of writing.**

Recorded below as reported. **Nothing has been fixed and nothing has been
disputed yet** — Sid asked to have both audits in hand before discussing them.

## The finding that matters most

### 🔴 The new tracker rule mandates a link form that 404s in the tracker today

`guide.ts:152` · `agent-ks-issues/SKILL.md:377-383` ·
`10_writing.md:117-124`

All three now state that every reference to a tracker page is a relative
markdown link, never a leading `/`, with no second option. **The issues pipeline
has the same off-by-one that was just fixed for docs, unfixed.**
`internal-links.ts` applies the depth shift only when `contentType === 'docs'`,
and `IssuesParser` constructs with `super('blog')`, so sub-doc pages get no
shift. Reproduced against the built site:

```
page  dist/todo/…/subtasks/100_link-integrity/010_renderer-drops-a-url-level/index.html
href  ./030_user-guide-relative-links-404
→     /todo/…/010_renderer-drops-a-url-level/030_user-guide-relative-links-404   ← no such directory
```

`issue-body-links.ts:12-14` carries a comment asserting the opposite — that
sub-doc relative links *"already resolve correctly"* — and it is false for the
same reason.

**And the gate written in the same run contradicts the rule outright.**
`check-link-form.mjs:25-30` says converting a tracker link to relative *"before
that is settled could swap a working link for a broken one."* The skills say
always; the tool says do not. An author following the skill produces a broken
link that no default gate reports, because both gates exclude `todo/`.

> This is the run's own named defect, committed inside the change that was
> supposed to remove it: **a rule that returns a plausible result when obeyed.**

### 🔴 The rule forbids the only correct form for shared-asset links

`docs-layout.md:207-211` (the form table: `/x` → "nothing internal") ·
`agent-ks-docs/SKILL.md:75`

`references/writing.md:82-85` — the same skill — **requires** the absolute form
for the shared `assets/` folder, and `_links.mjs:28` agrees in code
(`// site-absolute (incl. /assets/)`). Three things written this run do not:

| Where | What it does |
|---|---|
| `check-link-form.mjs:81` | skips images but **not** `[Download the spec](/assets/…)` — fails an author who followed `writing.md` |
| `move.mjs:246-253` | no `bang` filter, so `![Logo](/assets/logo.png)` is reported as unmaintained with **advice that breaks the link** |
| `docs-layout.md` table | says the absolute form is for "nothing internal", which is not true |

Latent today — **measured: 0 such links in `default-docs/data`**, which is why
both gates are green. It fires on the first consumer who follows `writing.md`.

## The rest, as reported

| | Finding | Where |
|---|---|---|
| 🟡 | A published page still recommends the forbidden form — *"cross-links are usually maintained at the URL level (`/todo/<id>#goal`)"*. Untouched by the run while 16 sibling pages were edited | `user-guide/19_issues/05_sub-docs/01_issue-md.md:70` |
| 🟡 | *"No cross-section exception"* was proven **within one content root** and generalised to cross-root. The 7 cross-root links created this run resolve only because every data folder here happens to be named like its `base_url`; a consumer with `base_url: "/internals"` gets a 404, and the rule forbids the fix. `move` handles them correctly — the claim is right about maintenance and unverified about rendering | `docs-layout.md:215`, `subtasks/…/020` |
| 🟡 | *"Ordering prefixes are stripped from URL slugs"* is **false for the tracker** — `issues.ts:1275` keeps the prefix, verified in `dist/`. Pre-existing, but it sits in the bullet list that was rewritten | `10_writing.md:135-136` |
| 🟡 | **Overclaim:** the plan says the backticked-path rule is "live on every surface". It is on the three *tracker* surfaces only. And the docs skill does not follow it — 12 backticked `references/…` paths against 1 markdown link | `plans/…/overview.md`, `agent-ks-docs/SKILL.md` |
| 🟡 | The 341-link incident is narrated **inside a skill**, which this project's `CLAUDE.md` forbids: *"skills are lean and history-free… delete the historical aside"*. The tracker already holds it in more detail | `docs-layout.md:220-222`, `:263-265` |
| 🟡 | One mechanical fact — `move` skips `/` targets — is now asserted in 11 places. `_links.mjs:28` is the one line that decides it; the prose copies cannot know when it changes | across the surfaces |
| 🟢 | `guide.ts` states the exception one clause narrower than the skill (omits "a path discussed as a value"). Otherwise the twins agree | `guide.ts:152-157` |

**Minor, and mine:** `subtasks/100_link-integrity/020_…` reads `status: review`
with an Outcomes section saying "Done", while **every box in its Todo list is
unticked**. Every sibling record ticked theirs.

**One boundary leak worth keeping:** the stated exception — *a file with nothing
to link to* — literally covers skill `.md` files, which are outside the site.
They must be relative links, which is what `agent-ks check skill-links` exists to
protect. Applying the exception literally there would be sanctioned and wrong.

## What the review confirmed rather than found

Stated because *nothing reported and nothing run means not reviewed* — and
because a review that only finds faults is not a measurement.

- **Every count independently reproduced.** 134 site-absolute occurrences removed
  across `data/`, 1 remaining outside the tracker (the fenced example), 2 real
  ones inside it — matching the record's 115→1 / 19→0 / 3→2 table and the
  129 + 5 + 2 + 1 = 137 accounting.
- **Both gates re-run and green** by the reviewer, not just by me: content-links
  173 pages / 15,585 links; link-form 568 links / 161 files.
- **The four "NOT DONE" items were read as honest** rather than smoothed over.
  Exactly one overclaim was found in the whole record.

# Next

- [ ] Codex `gpt-5.6-sol` result — watcher armed, task `task-msddtjs2-s9v7gb`
- [ ] Record it here beside Opus, as reported
- [ ] **Then** discuss with Sid. The tracker-renderer question is his: fix the
      issues pipeline the same way the docs one was fixed, or caveat the rule
      and leave the renderer alone
