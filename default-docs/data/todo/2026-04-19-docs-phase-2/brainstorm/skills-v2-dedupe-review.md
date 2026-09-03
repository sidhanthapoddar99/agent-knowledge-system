---
title: "Dedupe review of the issues skill (Codex, 2026-09-03)"
---

Read-only review of `plugins/agent-ks/skills/agent-ks-issues/` for facts stated in more than one place. Run by Codex (gpt-5.6-sol, xhigh) on 2026-09-03 after the subtask template rework in [the skills-v2 subtask](../subtasks/029_skills-v2-temp-plugin.md). Opus was overloaded three times and never answered. The brief: find every rule, definition, list or file shape stated twice inside the skill, or restated from the docs skill's `writing.md` or the cli-toolkit. Ignore link-only pointers, the triage table, and the eight status names.

Paths are relative to `plugins/agent-ks/skills/agent-ks-issues/` unless shown repo-relative. Line numbers are as of the run.

## Findings, most costly first

1. **Body and frontmatter shapes are catalogued in `03_writing.md` and reproduced in each file-kind reference.** `SKILL.md:27,58`; `01_anatomy.md:29`; `03_writing.md:5-21`; `04_issue-comments-glossary.md:7-23,50-57`; `05_brainstorm-notes-memory.md:13,54`; `06_subtasks.md:28-30,59-110`; `07_plans.md:26,39-75`; `08_agent-logs.md:20-21,86-103`. Suggested home: `03_writing.md`.
2. **Filesystem trees redrawn per reference and in examples.** `01_anatomy.md:32-61` (canonical); `05:87-101`; `06:28-37`; `07:14-26`; `08:15-34`; `10_examples.md:9-19,36-52,60-74,90-102`. Suggested home: anatomy.
3. **CLI signatures and flags repeated outside cli-toolkit.** `SKILL.md:64`; `04:61-65`; `06:51,112,118,123-126`; `07:34,37,125-133`; `08:127-136`; `09_operations.md:3-8,101-116,124-133`. Home: `agent-ks-cli/references/cli-toolkit.md`. Also: `09_operations.md:7` wrongly says every command takes `--json` and `--tracker`.
4. **Prefix and numbering conventions listed in anatomy, writing and every section reference.** `01:14,27-28,47,55-56,65-77`; `03:36-47`; `05:15-17,56-61,101`; `06:39-53`; `07:28-37`; `08:17-23,32-34,103-105`. Home: `01_anatomy.md:65-77`.
5. **Plans own order; subtask numbers are not a schedule.** `SKILL.md:25-27,37`; `01:12-16`; `06:7,17-26`; `07:3-12`; `08:9`; `10:13,21,63,84,110`. Home: `07_plans.md:3-12`.
6. **Brainstorm deliberates, notes conclude, subtasks act.** `SKILL.md:23-24,38-39`; `01:22-23`; `03:27`; `04:34-46`; `05:5-12,31-54`; `06:7-11,108`; `10:34-54`. Home: `05:5-54`.
7. **Subtask holds outcome, log holds path.** `SKILL.md:27-28,36,61`; `06:3-15`; `08:3-12,99,142`; `10:28,84`. Home: `06:3-15`.
8. **Memory holds what is still true; the log records what happened.** `SKILL.md:28-29`; `01:17-18,25`; `05:76-85,95-101`; `08:114-125,141`; `10:64,81`. Home: `05:76-101`.
9. **Closing authority and the superseded `→` line.** `SKILL.md:60`; `02_lifecycle.md:20-28,34-48`; `06:121-128`; `07:98-102,112-121`; `10:27-30,54`. Home: `02:20-48`.
10. **`issue.md` owns goal, context, scope.** `SKILL.md:22`; `01:39`; `03:17`; `04:3-30`; `10:12,39,92,106`. Home: `04:3-30`.
11. **Comments: flat, append-only, CLI-numbered, two lines and a pointer.** `SKILL.md:30`; `01:24,41,69`; `03:18,43`; `04:32-59`. Home: `04:32-59`.
12. **Markdown mechanics restated from the docs skill.** `01:77`; `03:21,31,34,59-60` versus `agent-ks-docs/references/writing.md`. Home: the docs writing file.
13. **Default list scope excludes Closed; `--status all`, `--include-closed`.** `02:56`; `09:17,31-41`; cli-toolkit `33,54-68`. Home: cli-toolkit.
14. **Links are named relative markdown links, never backticked paths or numbers.** `SKILL.md:65`; `03:49-51`; `07:37,77`; docs `writing.md:27-67`. Home: docs writing.
15. **Statuses fixed in code; colours are theme variables; runs use five.** `SKILL.md:52`; `01:118-119`; `02:3,30-32`; `08:72-84`. Home: `02`.
16. **Meaning of `02 Status and Result` per level.** `03:23-27`; `06:77-84`; `07:60-61`; `08:90-97`; `10:28`. Home: `03:23-27`.
17. **File outputs when produced; HTML artifacts live in notes or brainstorm.** `03:63`; `05:52,63-74`; `08:122,125`. Home: `05`.
18. **`subtasks:` entry is one plain link.** `SKILL.md:59`; `07:81-85`. Home: `07`.
19. **Dump issue, one component, git-derived dates.** `01:26,87,94,122`; `02:65,67`; `09:69-71`. Home: `01`. Also a second one-component statement inside anatomy itself at `01:122`.
20. **`color:` meaning lives in `glossary.md`; preserve on edit.** `03:21,32`; `04:88-94`; `05:54`. Home: `04:88-94`.
21. **An AI-handoff issue declares at least one subtask.** `02:66`; `06:3`; `09:98`. Home: `09:92-99`.
22. **Search with the CLI, never Grep.** `SKILL.md:63`; `09:13-15`. Home: `09`.
23. **Brainstorm mechanics: save only on request; `Resolved →` marker.** `SKILL.md:66`; `03:54`; `04:46`; `05:27-39`. Home: `05`.
24. **Tracker URLs keep prefixes.** `01:124-134`; `03:52`. Home: `01`.
25. **Two SKILL.md Never rows restated in references.** `SKILL.md:62,67`; `05:106`; `08:140`. Home: SKILL.md.
