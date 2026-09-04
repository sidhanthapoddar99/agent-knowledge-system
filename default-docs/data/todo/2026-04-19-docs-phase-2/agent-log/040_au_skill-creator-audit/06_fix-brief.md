---
title: Brief — apply the fixes to one skill
---

# Brief for every fix agent

You fix one skill of the `agent-ks` plugin. A reviewer audited it and the orchestrator ruled on every finding. You apply the rulings. You do not re-audit, and you do not re-decide.

## Read, in this order

1. [20_fixes.md](./20_fixes.md) — the cross-cutting decisions A to I, the deferred list, and the verdict on every finding of your skill. A finding marked `defer`, `reject` or `engine` gets no edit from you.
2. Your skill's report, `1N_<skill>.md` in this folder. It holds the findings with file and line, the proposed fix, the proposed description, and the "Cut and add" list. Apply every item the verdict marks `fix`.
3. The skill itself, every file.
4. [05_brief.md](./05_brief.md), section "House rules" only. Your edits must satisfy them.

## How to edit

- Use Read and Edit for a file. Use Write only for a new file or a full rewrite you have already read.
- Keep the shape the skill already has: the frontmatter, the section order, the tables. Change what the finding names. Do not reflow the rest.
- Simple technical English. Short sentences. One instruction per sentence. Active voice. To shorten, split sentences; never delete the words that hold a sentence together.
- Every rule you add carries its reason, in the same cell or the next sentence.
- Links stay relative. A link that starts with `/` is wrong.
- One home per fact. When a fact belongs to a sibling skill, link the sibling; do not restate.
- No history. Never write "used to", "old", "legacy", "renamed from", "previously".
- A framework file is written `@root/<path>`. Decision B.
- When a finding is marked "fix, in <other skill>", another agent does it. Skip it.
- When a finding says "fix, doc side", change the skill's text to state the true behaviour. Do not change the script.
- Check every command and flag you write with `agent-ks-dev help <group> <verb>`. Never bare `agent-ks`; it reads the frozen installed plugin.

## Before you return

Run these from the repo root and paste the results in your reply:

```bash
agent-ks-dev check skill-links
wc -w plugins/agent-ks/skills/<skill>/SKILL.md
wc -l plugins/agent-ks/skills/<skill>/references/*.md
```

For the SKILL.md word count, also report the body count with the frontmatter removed. Decision I: the body stays under 600 words unless the skill is single-file with no references. A reference stays under 150 lines. If you cannot get under the cap without cutting a fact, stop at the cap, keep the fact, and say what is over and by how much.

If your skill's report has a "Trigger test" row marked `unsure` or wrong, re-read the new description and say in your reply whether it now catches the prompt.

## Rules for you

- Edit only inside `plugins/agent-ks/skills/<your skill>/`, plus the files the verdict names explicitly for your skill (for example the CLI manifest for the cli agent, the agent file for the index-check agent).
- Never run a git write command. `git status`, `git diff` are fine.
- Never use `/tmp`.
- Do not wait on any process with a sleep loop.
- Do not edit the reports, the verdict file or this brief.

## Your reply

Ten lines or fewer: the findings you closed by number, the ones you could not close and why, the gate outputs, the word and line counts, and the trigger re-check.
