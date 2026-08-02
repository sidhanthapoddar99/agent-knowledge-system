---
title: "30 — How the skills are written (and the density rules)"
---

# How the skills are written

**Decided (sidhantha, 2026-08-02).** The companion to
[the agent-log structure](./20_agent-log-structure.md): that note says *where
things live*, this one says *how the instruction telling agents so is written*.

## The mandate

**You are not limited to deleting the parts of an instruction that are no longer
relevant. Removing and rephrasing anything is in scope.** If a rule reads better
inverted, split, merged into a template, or deleted outright, do that — do not
preserve wording out of deference to it.

**Skills are forward-looking: exactly what to do.** Not the reasoning behind the
decision, not the history of how it got here, not a catalogue of what *not* to
do. Same rule already applied to `CLAUDE.md`.

**Spend tokens on examples and structure, not prose.** A worked example conveys a
shape in fewer tokens than the paragraph describing it, and it cannot be
misread.

## The skill currently has the disease it causes

Measured 2026-08-02:

| | Lines |
|---|---:|
| `agent-ks-issues` skill, total | **2,412** |
| `SKILL.md` | 273 |
| `references/20_sections/24_agent-logs.md` | 341 |
| — of which **prose** | **205** |
| — of which fenced example | 68 |
| — of which table | 15 |

**Sixty percent prose in the file that teaches agents how to write logs.** That
is the same ratio the logs themselves came out at, from the same cause: an
instruction written as explanation rather than as a shape.

## The three instructions, and what each becomes

### 1. *"Agent-log files are detailed, line-rich records… a few vague bullets is a malformed milestone"*
`SKILL.md:192–194`

**Delete.** It is a quality adjective with no referent — an agent cannot
calibrate "detailed", so it errs toward more, every time.

**Replaced by a worked example pair** (see *Examples bracket* below). The example
is the instruction; nothing describes it.

### 2. *"Every file … is structured, context-setting prose, never a bare dump. Even a single-line thought gets a couple of explanatory sentences"*
`SKILL.md:201`

**Delete.** It dissolves into the templates: `01_summary.md`'s five headings *are*
the structure, and an iteration file's template *is* its shape. A rule that
restates what a template already enforces is a second copy of a fact the template
owns.

### 3. *"This is an inclusive rule — whenever in doubt, persist"*
`SKILL.md:181`, `24_agent-logs.md:247`

**Keep the persistence, change what doubt resolves to.** The opposite failure — a
run dying with its reasoning — is worse than verbosity and has happened.

| | |
|---|---|
| **Now** | doubt resolves toward **volume**: write it, here, in full |
| **Becomes** | doubt resolves toward **location**: persist it in its canonical home, as one line plus a pointer |

This is the whole move. The rule stops asking *how much* and starts asking
*where*, which is the only question that has a right answer.

## Examples bracket a range; they do not anchor a point

**One example sets a floor as much as a ceiling.** A 40-line sample iteration
file produces 40-line iteration files for three-line findings.

**Ship two, and label them:**

- the **smallest legitimate** file — an agent that found nothing, ~5 lines
- a **full** one — a multi-finding audit, ~30 lines

Two points teach the range. One point teaches a target.

## The strongest form: the template lives in the scaffolder

`agent-ks issue new-agent-log` already emits files. If what it emits carries the
right headings and **one hint line per heading**, an agent never reads an
instruction about file shape at all — it opens a file already shaped.

- Zero instruction tokens at read time.
- Structurally enforced rather than remembered.
- The skill then **points at the scaffolder** instead of restating the template.

That is [the agent-log spec](./20_agent-log-structure.md)'s own rule — *no file
stores a fact another file owns* — applied to the skill itself. Prefer this over
a documented template wherever the scaffolder can carry it.

## How to write a rule, concretely

| Do | Instead of |
|---|---|
| A template, or an example | A paragraph describing the shape |
| A table of cases → homes | Prose enumerating the same cases |
| The imperative form: *"Findings go in `notes/`"* | *"We decided findings should go in `notes/` because…"* |
| Deleting a rule the template now enforces | Keeping it "for clarity" |
| One clause of why, on a counter-intuitive rule | A rationale section |

**Anti-patterns are not documented.** A rule stating what to do implies what not
to do. A catalogue of failure modes doubles the length and dates fastest.

## The one caveat I would not drop — recommendation, cheap to reverse

**Rationale-free has a real cost here, and it is bigger than for `CLAUDE.md`.**

`CLAUDE.md` sits beside the tracker that holds its reasoning. **A skill does
not** — it ships versioned inside a plugin, and a consumer installs it without
ever cloning this repo. So reasoning removed from a skill is not relocated for
consumers; it is **gone**.

A rule that reads as arbitrary gets routed around when it is inconvenient, or
applied where it does not fit.

**Recommendation: one clause, never a section.** *"Findings go in `notes/` — the
log is per-run and they outlive it."* Eleven words, and the rule stops being
arbitrary. Paragraphs of rationale remain out.

Overrule in one word if you want it strictly zero.

## Would this actually solve the density problem?

Honestly: **partially on its own, fully in combination.**

| | Effect |
|---|---|
| Examples instead of adjectives | **Fixes ambiguity.** An agent can finally calibrate. This is the large win. |
| One example only | **Would replace a vague target with a fixed one.** Not a fix — the bracketing pair is required, not optional. |
| Template in the scaffolder | **Fixes it structurally.** The only part that cannot be forgotten mid-run. |
| Delete + rephrase mandate | **Fixes the skill's own 2,412 lines**, which is a direct token cost on every session that loads it. |

What none of them fixes: **an agent writing a genuinely long file because the run
genuinely was long.** That is correct behaviour and should stay. The target was
never shorter files — it was fewer copies, and that is
[the structure note's](./20_agent-log-structure.md) job.

**Acceptance:** re-derive the audited run against the new skill and scaffolder.
If a five-line production change still produces more than one agent log note and
one findings list, the rules have not bitten. Measure it the same way — the
commands are in
[the audit](./10_efficiency-audit-2026-08-02.md).
