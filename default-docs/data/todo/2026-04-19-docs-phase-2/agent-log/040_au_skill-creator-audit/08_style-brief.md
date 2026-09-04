---
title: Brief, the plain-language pass
---

# Brief: rewrite the wording of the ten agent-ks skills in plain technical English

Rewrite the wording only. Every fact stays as it is. Done means: every sentence in your group follows the rules below, the four gates pass, and your report file is written.

Why. Sid read the skills after the audit and said the prose reads like jargon. Two fix rounds by Opus agents wrote most of it. The skills ship to every consumer, so that prose flows into every project's docs and tracker. A tired reader, human or agent, must be able to act on each sentence without decoding it.

## Groups

Edit only the files in your group. Three agents run at once, and a file edited by two agents loses one agent's work.

| Group | Skill folders under `plugins/agent-ks/skills/` | Report file |
|---|---|---|
| tracker | `agent-ks-issues`, `agent-ks-qna`, `agent-ks-issue-logs`, `agent-ks-quick-idea-note` | `40_style-tracker.md` |
| config-cli-blog | `agent-ks-config`, `agent-ks-cli`, `agent-ks-blog` | `41_style-config-cli-blog.md` |
| artifacts-docs-index | `agent-ks-artifacts`, `agent-ks-docs`, `agent-ks-index-check` | `42_style-artifacts-docs-index.md` |

In scope: every `.md` file in the folder, including `references/` and the files under `agent-ks-config/assets/`. Those asset files are the starter content a consumer reads first.

Out of scope, do not open for editing:

- The `description` field in any SKILL.md frontmatter. It is the trigger text. The audit tuned it, and a bare `: ` inside it breaks the YAML parser.
- `agent-ks-cli/templates/`. Those are file templates. The self-test reads them.
- `agent-ks-cli/scripts/` and `agent-ks-artifacts/scripts/`. Code.
- `agent-ks-artifacts/references/PROVENANCE.md`. A record, not an instruction.

## The rules

**1. Facts are frozen.** Change no command, flag, path, file name, number, field name, status value, link target, code block, table column, heading, or section order. If a fact looks wrong, leave it and write it under "Facts I doubted" in your report. A wording pass that also fixes facts cannot be reviewed as a wording pass.

**2. Sid's language rules.** They are the standard for every document. Quoted from `~/.claude/CLAUDE.md`:

> Write every document in simple technical English, the ASD-STE100 standard: short sentences, one instruction each, active voice, one meaning per word, one name per thing, and a technical term defined where it first appears. Structure follows the Minto Pyramid: lead with the answer, and make every line sum up the group below it.
>
> To shorten text, split sentences. Never delete words. Deleting takes out the glue between ideas, and the text gets denser.

**3. The instruction-writing rules.** Rule 1 and rule 4 of the `instruction-writing` skill apply to every sentence. Its path: `/home/sid/projects/02_OpenSource/06_ai/sids-plugin-marketplace/plugins/instruction-writing/skills/instruction-writing/SKILL.md`. Read it once before you start. Rule 1: put the reason beside the rule, as a clause, and make the reason name the concrete failure. Rule 4: one instruction per sentence, active voice, one meaning per word, one name per thing, define a term at first use, do not shorten by dropping words.

**4. What to hunt.** Read every sentence and ask: would a tired reader with no context act on this without a second read? Change these forms when you find them:

| Form | Change it to | Example |
|---|---|---|
| A metaphor or idiom | The literal statement | "nothing is merged away by accident" becomes "no finding is lost in the merge" |
| A reason written as an aphorism | A reason that names the failure | "a finding that lives only in a job record dies with the run" becomes "a job record is deleted when the run ends, so a finding written only there is lost" |
| A sentence over 20 words | Two or three sentences | Split at "and", "so", "because", a semicolon, or a comma that joins two clauses |
| Two instructions in one sentence | Two sentences | |
| Passive voice where the actor matters | Active voice, with the actor named | "the label is recomputed" becomes "`agent-ks move` recomputes the label" |
| A fragment or a one-word sentence standing as a sentence | A full sentence | "Rare." becomes "This kind is rare." |
| A sentence that opens with its condition or its reason | Subject, verb, object first, then the condition | "Only on the user's ask, because a loop commits days" becomes "Open a loop only when the user asks, because a loop commits days of work" |
| A term used before it is defined | The same term, with a short definition at first use | "a slot" gets "A slot is a suggested file name" on first use |
| Two names for one thing in one file | One name, used every time | "run" and "log" for the same folder |
| A big word with a plain twin | The plain word | "utilise" to "use", "leverage" to "use", "prerogative" to "job", "canonical" to "the one", "cadence" to "how often", "surface" (verb) to "show", "funnel" to "put", "salvage" to "keep" |
| A clever verb applied to a thing | A plain verb | "a file claims a reviewer" becomes "a file names a reviewer"; "a skill owns X" may stay, it is defined house usage |
| An em-dash joining two clauses | Two sentences, or a comma | Keep an em-dash only inside a table cell or a heading where it is a label separator |

Leave as they are: table cells that are labels, headings, code blocks, link targets, and the house terms the skills define. House terms include issue, subtask, agent log, run, round, report, slot, kind, tracker, dump, plan, stage, artifact, section, alias, theme, layout.

**5. Never delete words to make a sentence shorter.** Split it. A SKILL.md body is under a 600-word cap from the audit. The words a split adds may push a body over the cap. That is allowed in this pass. Record the before and after word count in your report, and I decide.

**6. No history.** Do not add "now", "no longer", "used to", or a comparison with the old text. The file describes the current system only.

**7. Link text stays a name of the target.** You may reword link text. It must still name the target file or the thing at the target.

**8. Re-read cold after each file.** Read the whole file once more as a reader who has never seen the project. Fix what you stumble on.

## Hard limits

- Run no git command that writes. No `add`, `commit`, `stash`, `checkout`, `reset`. Only Sid's main session commits, and only when Sid asks.
- Edit no file outside your group's folders and your report file.
- Write nothing to `/tmp`. Scratch goes in `scratch/` at the repo root. It is gitignored.
- Do not edit inside `~/.claude`.
- Run any command longer than a minute in the foreground with a timeout. Never wait on a process with a sleep-and-poll loop. Never promise to check a job later.

## What you decide alone

- Decide and keep going: word choice, where to split, the order of clauses, which definition to give a term.
- Decide and record in your report: every fact you doubted and left as it was; every sentence you left over 20 words and why a split would change its meaning; every term you defined; every house term you were unsure about.
- Stop and ask: nothing in this run. If a sentence needs a fact you do not have, leave the sentence and record it.

## Method

1. Read the `instruction-writing` SKILL.md, rules 1 and 4.
2. Measure before. Run from the repo root: `bun scratch/sentence-stats.mjs plugins/agent-ks/skills/<skill>` for each skill in your group. Keep the output.
3. For each file: read it whole, rewrite under the rules, re-read cold.
4. Measure after, with the same command.
5. Run the gates from the repo root. Errors exit 1. Read the output, not only the exit code.

```bash
agent-ks-dev check skill-links
agent-ks-dev check link-form plugins/agent-ks/skills
bun plugins/agent-ks/skills/agent-ks-cli/scripts/_selftest.mjs
for s in plugins/agent-ks/skills/*/; do printf '%-45s body words %s\n' "$s" "$(awk 'BEGIN{f=0} /^---$/{f++; next} f>=2' "$s/SKILL.md" | wc -w)"; done
```

6. Write your report into your report file under `## Result`, in the shape below. Keep `## Caveats` for what the reader of the diff must know. Set the file's `status:` to `done` when you finish.

## Report shape

```markdown
## Result

Files edited: <count>. Files read and left unchanged: <list>.

| File | Sentences before / after | Avg words before / after | Over 20 before / after |
|---|---|---|---|
| agent-ks-issues/SKILL.md | 20 / 26 | 8.2 / 7.1 | 1 / 0 |

SKILL.md body words before / after: <skill> 599 / 612, ...

### Facts I doubted, left as they were
- `<file>:<line>`: "<quoted sentence>". <why it looks wrong, one sentence>.

### Terms I defined
- `<file>`: <term>, "<the definition sentence>".

### Sentences left over 20 words
- `<file>:<line>`: "<quoted sentence>". <why a split changes the meaning>.

### Gates
<one line per gate, the last line of its output>

## Caveats
<what the reader of the diff must know>
```

## Return

Reply with: the report file path, the before and after totals for your group, the count of facts doubted, and the gate lines. Nothing else. The report file holds the detail.
