---
title: Brief — audit one skill against the skill-creator guide
---

# Brief for every reviewer

You audit one skill of the `agent-ks` plugin. You do not audit the others.

## Why we do this

The plugin ships ten skills. An AI agent reads them every session to work in this project. We want every skill to trigger at the right moment, load only what the task needs, and explain the reason behind each rule. We just re-cut the skills by domain, so this is the moment to find what is weak before it hardens. Your report is the input for the fix round.

## Where things are

| What | Path |
|---|---|
| The skill you audit | `plugins/agent-ks/skills/<skill-name>/` |
| The guide you audit against | `~/.claude/plugins/cache/claude-plugins-official/skill-creator/0120fb83da5d/skills/skill-creator/SKILL.md` |
| The house rules for skills | this file, section "House rules" |
| The engine, for checking claims | `astro-doc-code/src/` |
| The CLI, for checking commands | `agent-ks-dev help <group> <verb>` |
| The user guide, the source of truth | `default-docs/data/user-guide/` |
| The sibling skills, for overlap only | `plugins/agent-ks/skills/*/SKILL.md` |

Run `agent-ks-dev`, never bare `agent-ks`. The first reads the repo source. The second reads the installed plugin, which is frozen.

## What to check

Read the skill-creator guide first, in full. Then check the skill on these points. Each point gives the reason, so you can judge the cases the list does not name.

1. **The description is the trigger.** It is the only part always in context. It must say what the skill does and when to use it, with the words a user would say. Claude tends to under-trigger, so the description may be a little pushy. Check: would this skill fire on the prompts it should? Would it fire on prompts that belong to a sibling skill? Write three realistic user prompts that should trigger it and one that should not. Say which the description catches.
2. **Progressive disclosure.** Metadata, then SKILL.md, then references. SKILL.md holds what every trigger needs. Each reference holds one topic, and SKILL.md says when to read it. Check: is anything in SKILL.md only needed sometimes? Is anything in a reference needed every time? Does every reference link say when to open it?
3. **The reason, not the rule.** The guide asks for the why behind each instruction, so the model can handle the case the rule did not name. A capital MUST or NEVER with no reason is a flag. A "Never" table with a "Do instead" column is fine when the reason is clear from the pair. Check each rule: could a smart agent apply it to a new case?
4. **Imperative form and examples.** Instructions in the imperative. Examples where the output has a shape. Check: is any output format described in prose where an example would be shorter?
5. **Lean.** Every line must pull its weight. Check for: repeated facts, facts that live in a sibling skill too, history ("used to", "old", "legacy", "renamed from"), and lines the agent will never act on.
6. **Bundled resources.** Scripts for work that is deterministic or repeated. References for docs. Assets for templates. Check: does the skill ask the agent to do by hand what a script should do? Does it carry a script the agent would never call?
7. **Truth.** Every command, flag, path, field name and file name the skill states must exist. Check each one against the CLI help, the engine source, or the disk. Report each false claim with the true value.
8. **Run it, do not only read it.** Take one realistic user prompt for this skill. Follow the skill as if you were doing that task. Read what it tells you to read, in the order it tells you. Do not edit any content or tracker file. Report where you were lost, where you had to guess, where you read a file you did not need, and where a needed fact was missing.

## House rules

These are ours. They add to the guide. Where they collide with the guide, the guide's reason wins and you say so in the report.

- SKILL.md stays under 600 words. A single-file skill with no references may go longer. Measure and report the count.
- A reference stays under 150 lines. Measure and report.
- One home per fact. A fact lives in one skill, and the others link to it.
- History-free. A skill describes the current system only.
- Simple technical English. Short sentences. One instruction per sentence. Active voice.
- Links are relative. A link that starts with `/` is wrong.
- The user guide wins over the skill. When they disagree, the skill is wrong.
- The CLI is the tool for the tracker. A skill that tells the agent to grep or hand-edit tracker structure where a verb exists is wrong.

## Rules for you

- Read only. Do not edit the skill, the docs, the tracker or any file outside your report.
- Never run a git write command. `git status`, `git log`, `git diff` are fine.
- Never use `/tmp`. Everything you need to keep goes in your report.
- Do not wait on any process with a sleep loop.
- Do not guess a command. Run `agent-ks-dev help` to check it.

## Your report

Write it to the file named in your prompt. Use this shape exactly.

```markdown
---
title: <skill-name> — Opus review
---

# <skill-name>

**Verdict:** one line. `ready`, `needs fixes` or `not ready`. Not ready means the approach is wrong, not that it is incomplete.

**Measured:** SKILL.md <N> words · references: <name> <N> lines, …

## Findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | blocker / major / minor | `file:line` | one sentence | one sentence | one sentence, concrete |

## Trigger test

| Prompt | Should fire | Fires |
|---|---|---|
| "…" | yes / no | yes / no / unsure |

## Proposed description

The description rewritten, if you would change it. Otherwise "keep".

## The dry run

The prompt you used. Then what happened, in order: what you read, where you were lost, what you did not need, what was missing. Ten lines or fewer.

## Cut and add

- Cut: lines or sections that do not pull their weight, with the file and line.
- Add: facts or examples the skill needs and does not have.
```

Severity: a blocker makes the agent do the wrong thing or fail to trigger. A major wastes the agent's context or leaves it guessing. A minor is style.

Report only what you verified. When you are unsure, say `unsure` and say what would settle it.
