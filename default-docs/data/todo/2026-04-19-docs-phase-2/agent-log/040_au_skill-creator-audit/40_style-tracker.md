---
title: "Style tracker"
status: done
agent: claude
---

The plain-language pass over the tracker group: `agent-ks-issues`, `agent-ks-qna`, `agent-ks-issue-logs`, `agent-ks-quick-idea-note`. Brief: [08_style-brief.md](./08_style-brief.md). Wording only. No fact, command, flag, path, number, link target, heading or code block changed.

## Result

Files edited: 16. Files read and left unchanged: none in the group. Descriptions, `agent-ks-cli/templates/` and the code blocks were not touched.

| File | Sentences before / after | Avg words before / after | Over 20 before / after |
|---|---|---|---|
| agent-ks-issues/SKILL.md | 20 / 21 | 8.2 / 8.4 | 1 / 1 |
| agent-ks-issues/references/01_anatomy.md | 40 / 40 | 8.0 / 8.4 | 0 / 0 |
| agent-ks-issues/references/02_lifecycle.md | 41 / 45 | 8.8 / 8.4 | 0 / 0 |
| agent-ks-issues/references/03_writing.md | 55 / 60 | 9.5 / 9.3 | 1 / 0 |
| agent-ks-issues/references/04_issue-comments-glossary.md | 22 / 24 | 9.1 / 9.3 | 0 / 0 |
| agent-ks-issues/references/05_brainstorm-notes-memory.md | 69 / 74 | 8.0 / 8.4 | 0 / 1 |
| agent-ks-issues/references/06_subtasks.md | 61 / 77 | 11.8 / 10.2 | 6 / 3 |
| agent-ks-issues/references/07_plans.md | 66 / 71 | 9.4 / 9.4 | 1 / 1 |
| agent-ks-issues/references/09_operations.md | 74 / 80 | 8.2 / 8.3 | 1 / 0 |
| agent-ks-issues/references/10_examples.md | 17 / 17 | 8.4 / 9.1 | 0 / 0 |
| agent-ks-qna/SKILL.md | 23 / 31 | 11.5 / 9.8 | 1 / 1 |
| agent-ks-qna/references/question-bank.md | 34 / 40 | 13.8 / 12.2 | 6 / 3 |
| agent-ks-qna/references/writing-rules.md | 10 / 15 | 14.4 / 10.9 | 1 / 0 |
| agent-ks-issue-logs/SKILL.md | 38 / 58 | 13.9 / 10.6 | 7 / 2 |
| agent-ks-issue-logs/references/kinds.md | 55 / 75 | 12.7 / 10.5 | 7 / 4 |
| agent-ks-quick-idea-note/SKILL.md | 52 / 64 | 11.1 / 10.1 | 5 / 0 |
| Group total | 677 / 792 | 10.2 / 9.6 | 37 / 16 |

Sentences over 30 words: 6 before, 1 after. The one left is the enumeration in `06_subtasks.md:3`, listed below.

SKILL.md body words before / after: agent-ks-issues 599 / 623, agent-ks-qna 597 / 641, agent-ks-issue-logs 743 / 834, agent-ks-quick-idea-note 1161 / 1244. Reference lines: `kinds.md` 149 / 154, `06_subtasks.md` 146 / 151, `01_anatomy.md` 138 / 138. Two bodies and two references crossed the audit's caps by the words the splits added. The brief allows it. The orchestrator decides.

The main changes, by kind: metaphors and idioms replaced ("nothing is merged away by accident", "dies with the run", "in silence", "holding pen", "a wrong map is a broken map", "review debt promotes", "AI handoff anchor", "winner", "canonical", "gauges breadth", "drill in", "warm context", "backfill", "deep-dives", "unsandboxed"); one-word and fragment sentences made whole ("Rare.", "Only on the user's ask.", "Never both.", "Test:", "Shape:", "Skeleton:", "Every flag:"); condition-first sentences turned around; passives given their actor (`agent-ks check issues`, `agent-ks move`, the engine, the parent page); the arrow chain in `03_writing.md` written as sentences; the 56-word `--template` warning sentence in `06_subtasks.md` made a four-item list.

### Facts I doubted, left as they were

- `agent-ks-issues/references/10_examples.md:25`: "the four pickup steps in SKILL.md". The pickup block in `agent-ks-issues/SKILL.md` has five steps since decision L. The number is frozen in this pass.
- `agent-ks-qna/SKILL.md:66`: "Memory is dropped when the run ends." `agent-memory/` is a folder and stays when the issue closes. The sentence probably means the harness's session memory. The word "memory" is ambiguous here, and I did not change the claim.
- `agent-ks-issues/references/01_anatomy.md:126`: "the tracker's Guide modal". The project CLAUDE.md and `04_issue-comments-glossary.md` call it the Guide panel. One name per thing would pick "panel". A name is frozen in this pass.

### Terms I defined

- `agent-ks-issue-logs/SKILL.md`: slot, "A slot is a suggested file name."
- `agent-ks-issue-logs/SKILL.md`: check, "A check is a typecheck, a build, or one curl." Replaces the word "verify" used as a noun.
- `agent-ks-quick-idea-note/SKILL.md`: ERE, "ERE is the extended regular-expression syntax that `grep -E` uses."
- `agent-ks-quick-idea-note/SKILL.md`: the `//` comment's meaning, "Every other component names a layer of the stack. This one does not." Replaces "the stack-layer axis".
- `agent-ks-issues/references/01_anatomy.md`: validator, "`agent-ks check issues`, the validator, warns…". The file then uses "the validator" as before.
- `agent-ks-issues/references/05_brainstorm-notes-memory.md`: sidecar, "The sidecar is the `<name>.meta.json` file beside the artifact."
- `agent-ks-issues/references/05_brainstorm-notes-memory.md`: graduate, "When a brainstorm resolves, it graduates." The heading `### Graduation` already existed.
- `agent-ks-quick-idea-note/SKILL.md`: "graduation" replaced by "promoting an entry to a real issue", the words the file's own template uses.
- `agent-ks-quick-idea-note/SKILL.md`: "surface" replaced by "feature" in all three places, one name per thing.

### Sentences left over 20 words

- `agent-ks-issues/references/06_subtasks.md:3`: "It says what to do, when the job is done, what came out, what went wrong, what to watch for, what was decided, and what was asked and answered." A list of seven items. A split would number them, and the file has no such numbering.
- `agent-ks-issues/references/06_subtasks.md:134`: the third list item of the `--template` warnings, 23 words. One condition with four alternatives. Splitting it would make four items out of one warning.
- `agent-ks-qna/references/question-bank.md:85`: three sentences inside the quoted user story. The story is dictated speech and the example depends on it being raw.
- `agent-ks-issues/SKILL.md:10`, `agent-ks-issue-logs/SKILL.md:59`, `agent-ks-issues/references/07_plans.md:79`, `agent-ks-qna/SKILL.md:36`: 22 to 23 words each, one idea each, a list of nouns inside. Left as they are.

### Gates

- `agent-ks-dev check skill-links`: ✓ all checks passed
- `agent-ks-dev check link-form plugins/agent-ks/skills`: ✓ all checks passed
- `bun plugins/agent-ks/skills/agent-ks-cli/scripts/_selftest.mjs`: PASS
- Diff check: every code span, flag and number appears the same number of times in removed and added lines, except the spans added as definitions or as a named actor (`agent-ks check issues`, `glossary.md`, `issue.md`, `bun`, `grep -E`, `(inferred)`, `<name>.meta.json`, `\|`).

## Caveats

- `06_subtasks.md` now has a four-item list where one sentence was. That is a structure change, not a fact change.
- Four caps are crossed by 24 to 91 words, or 5 lines. Restoring them means deleting words, which the language rules forbid, or moving facts, which this pass does not do.
- The three doubted facts above are real defects to fix in a facts pass, not here.

## Links

- [08_style-brief.md](./08_style-brief.md)
- Before and after measurements: `scratch/style-tracker-before.txt`, `scratch/style-tracker-after.txt` (gitignored, one-run)
