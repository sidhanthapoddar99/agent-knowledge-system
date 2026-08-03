---
title: "Proposed ~/.claude/references/writing-claude-md.md — the doctrine and its history"
---

# What this is

**The proposed text for `~/.claude/references/writing-claude-md.md`.** It does not
load in a normal session, by design. It loads when an agent is about to **edit an
instruction or memory file** — the global `CLAUDE.md`, a project's `CLAUDE.md`, or
an issue's `agent-memory/`.

Sid's reason, in his words: *"as different agents start working and start editing
main CLAUDE.md."* The main file will be edited by agents that never saw the
failures that produced it. Without the history, each one re-derives the rules from
scratch, or worse, re-derives them **the same wrong way** — because the wrong way
is the intuitive one.

Three lines go into `CLAUDE.md` itself to point here; they are in
[`01`](./01_proposed-claude-md.md)'s applying instructions.

---

# The proposed file

```markdown
# Writing instruction and memory files

Read this before editing any of:

- `~/.claude/CLAUDE.md` — the global operating file
- a project's own `CLAUDE.md`
- an issue's `agent-memory/`, or a project memory file

It is not loaded in normal sessions. It loads when the thing being edited is the
instructions themselves.

# The hard rules

- **Never edit `~/.claude/CLAUDE.md` without my confirmation.** Propose the diff;
  I apply it.
- **A change is not final until independently reviewed**, by more than one agent,
  none of which wrote it.
- **Test the rules by running them, not by reading them.** Give each reviewer the
  same concrete situations and have it write the reply it would actually send
  under the proposed rules. A rule that reads well and behaves badly is the
  normal failure, not the rare one.
- **Merge reviews as a union, not a vote.** One reviewer finding a problem is a
  problem.

# What a good rule looks like

1. **It has a trigger.** It says when it stops applying. A rule with no trigger
   cannot be over-applied by mistake — only correctly, which is worse, because
   the behaviour looks like obedience.
2. **Its reason is attached, in one line.** A rule I understand, I can apply to a
   case nobody foresaw. A rule I do not, I follow literally and wrongly at the
   edges.
3. **It states the positive form**, not only the ban. "Never do X" leaves no
   target shape; "do Y, not X" does.
4. **It is not a copy.** If a skill, a tool's help, or a project file already owns
   it, point at that. A copy cannot know it was replaced, so it goes stale
   silently.
5. **It is written in the voice it wants back.** Dense, hedged, aphoristic prose
   teaches the reader to produce dense, hedged, aphoristic output — regardless of
   what the words say. The register instructs louder than the content.

# The one law behind all of it

**Every rule written in response to a failure must also say when it does NOT
apply — and the exception gets written in the same sitting.**

A rule written just after a failure is written while the failure still stings, so
it comes out absolute. Nobody comes back later to add the boundary, because by
then the rule looks obviously correct. That single omission produced every case
below.

# The history — five failures and what each one cost

Kept in full rather than summarised. A corrected record teaches; a silently
fixed one repeats the lesson.

## 1. Too little doubt — the link rewrite

**What happened.** 4,295 broken links measured across a built site. The
conclusion drawn: the content authors wrote the links wrongly. 341 content links
were rewritten from relative to site-absolute form, committed, and pushed.

**What was actually wrong.** An 81-line renderer emitted the `./` prefix
unchanged while every page built one directory deeper than its source file. Three
lines. The renderer was opened for the first time *after* the rewrite was pushed.

**The evidence that was read backwards.** The record argued, as grounds for the
rewrite: *"not one of 101 links got it right."* A tool that 101 independent
authors use wrongly 101 times is a broken tool.

**What it cost.** A day, plus 341 reverted edits — and the replacement form was
invisible to the tool that maintains those links, so every converted link had
silently left maintenance and would have rotted on the next file move.

**Caught by:** Sid, reading the diff. No gate, no test, no reviewer.

**The rule that came out of it:** *when every user of a thing uses it wrongly,
suspect the thing.* And the measurement rule that makes it affordable — **the
check that would have caught this cost one HTTP request; the edit it guarded cost
a day.**

## 2. Too much explanation — a one-line answer delivered as a report

**What happened.** Asked whether one file was out of date. The true answer was one
sentence. What was delivered was a multi-section report with tables, a gates
section, and the answer on page two.

**The rules that caused it.** *"Length is whatever comprehension costs. No target,
no budget — and do not invent one… Erring long is cheap"*, together with
*"Explain in plain terms — always, not only when I must decide. Unconditional on
purpose."*

**Why they were written that way.** Both were correct responses to an earlier
failure: replies that were too terse, and that used jargon because jargon is the
shortest thing you can write. The fix was made unconditional deliberately, to
stop the register slipping back.

**Why it went wrong.** *"Lead with the answer"* was in the same file, but as one
bullet among forty. When two rules conflict and nothing ranks them, **the more
elaborated rule wins** — and length of elaboration tracks what the author was
last burned by, not what matters most.

**The fix:** answer first in one or two lines, then a break, then as much
explanation as the thing deserves. The anti-brevity rule is preserved exactly —
it just applies *below* the answer instead of on top of it.

## 3. Too much verification — a reading question answered with a test suite

**What happened.** Asked "were there any assumptions in this file?" — a question
answerable by reading. What ran instead: a full site build, five control tests, a
fixture tracker, and a from-scratch reproduction of a validator's behaviour.

**The rules that caused it.** *"Measure, don't argue"*, *"control-test both
directions"*, *"a clean first result is the one to distrust"*, *"break the code to
test the tests"*. All correct. None carries a condition, so all of them read as
always-on.

**The deeper error.** The link failure came from too little doubt at one specific
point. The response was to apply maximum doubt everywhere — replacing a judgement
with a policy. Universal doubt is not rigour. It spends the budget on the 95% that
was fine and leaves nothing for the 5% that mattered, and it degrades judgement,
because an agent that verifies everything never has to decide what is worth
verifying.

**The fix:** doubt is a budget, spent by blast radius. Check before expensive or
irreversible actions. Before reversible ones, read it and label it — `measured`,
`read`, `assumed` — and let me call for the check.

## 4. The file broke its own rule

**What happened.** `CLAUDE.md` states: *"The skills own the detail — never copy
their content into a repo. They ship versioned with the plugin, so a local copy
goes stale silently."* Two paragraphs later it copies, near sentence-for-sentence,
the tracker lifecycle rules and the `agent-memory/` split from
`agent-ks-issues/SKILL.md`.

**Why that is not a small thing.** `CLAUDE.md` is not versioned with the plugin.
When the skill's wording moves, the copy goes stale silently — precisely the
failure the rule was written to prevent.

**The fix:** pointers only. If a skill owns it, name the skill.

## 5. Tool-call waste

Three concrete patterns, all measured in one session:

- **A `cd` inside a compound command persisted** into every later call, so
  relative paths silently meant something else. Four calls were spent chasing a
  phantom "the tracker is not in git" before the cause was spotted. **Use absolute
  paths.**
- **Files were edited with `python` heredocs** when a dedicated edit tool existed.
  Two such calls were refused outright by the permission layer. **A refused call
  is pure waste.**
- **Long compound commands fail as a unit and get rewritten as a unit** — two
  calls where one would have done. **One command, one question**; and if you
  cannot name the question a command answers, do not run it.

# What the five have in common

Four of the five are the same mistake in different costumes: **a rule written
without its boundary.** The fifth (tool waste) is the same mistake applied to
process rather than prose — running ten cheap checks instead of one right one is
what "verify everything" looks like at the tool-call layer.

So when you add a rule here, the test is not *is this true*. It is: **can I
construct a realistic situation where obeying this is clearly wrong?** If you can,
the rule needs its condition before it ships. If you cannot, you have a genuine
absolute — and those are rare enough to list.

# Absolutes, and why examples cannot teach them

A contrastive example teaches where a boundary falls. A ban has no other side, and
an example invites pattern-matching — *"that specific case was banned"* — where
the ban is total. These stay as flat imperatives, stated exhaustively:

- `done` and `dropped` are mine; the agent ceiling is `review`.
- Agents never run git write commands.
- Never rewrite pushed history; no squash merges.
- Never change the ground under a live agent.
- Nothing irreversible and outward-facing without asking.

The same argument applies to the safety floor on autonomous runs: a safety rule
must be stated exhaustively, because **the dangerous case is precisely the one
that does not resemble the example.**

# Applies to more than the global file

**A project's `CLAUDE.md`** — same rules, plus: it links to the global file and
never copies it, and it says explicitly where it overrides.

**An issue's `agent-memory/`** — `knowledge/` is what is binding, `history/` is
how it got here. When they disagree, `knowledge/` wins. Same discipline: a memory
entry with no trigger will be applied to situations it was never about.

**A project memory file** — do not record what the repo already records. Code
structure, past fixes, git history and `CLAUDE.md` are all recoverable; what is
worth saving is the thing that was *non-obvious*, and why.
```

# Why this file is worth its own artefact

Sid's framing was that the reference is useful *"when adding memory information to
either issues or even to individual projects"* — that it gives *"a good history of
what to do and what not to do, based on experimentation and personal
experience."*

That is a stronger claim than it looks. The rules in `CLAUDE.md` are conclusions.
Conclusions are re-derivable only if you still have the evidence, and the evidence
is exactly what gets thrown away when a file is compacted. **This file is where
the evidence goes**, so the next agent to edit the instructions inherits the
reasons and not only the verdicts — and does not have to rediscover them by
repeating the failure.

The history section is therefore the point of the file, not an appendix to it. It
should grow by one case every time a rule is added or changed, and cases are never
deleted — the same rule the tracker already follows for corrected records.

# Open question for Sid

**Should the history cases link into the tracker** — the issue and agent-log that
produced each one — or stay self-contained prose?

Links give the full evidence trail. But this file is gitignored and machine-local,
while the tracker paths are repo-relative, so the links break on any machine
without that repo checked out. **Recommendation: keep the prose self-contained as
written, and add tracker links only as a trailing "full record:" line per case**,
so a broken link costs context rather than meaning.
