---
title: "Goal — 6-agent benchmark of the rebranded toolkit (models × skills)"
---

## Goal

Before closing the rebrand issue, measure whether the renamed system
(agent-ks plugin, skills, CLI, conventions) actually helps agents work in
this project — and how model tier changes that. Sidhantha's ask: ~8 serial
tasks, run across sonnet / opus / fable, each with and without the
agent-ks skills — 6 agents total, in the background; capture token usage,
time, and accuracy.

## Design

Each agent gets an **isolated git worktree** (no write collisions) and the
same 8 serial tasks:

1. **Doc finding** — locate the storage & disk-footprint page; name the
   section explaining bun's hardlink dedup.
2. **Doc editing** — append a small FAQ section to that page (valid
   frontmatter/conventions preserved).
3. **First-class artifact** — create a small HTML artifact page summarizing
   the rebrand, placed and sidecarred per the project's artifact
   conventions.
4. **Issue finding** — locate the rebrand issue; report status, component,
   done-subtask count.
5. **Issue creation** — file a new issue (benchmark-harness topic) with
   valid settings.json, issue.md, one subtask, correct slug + vocabulary.
6. **Search & write** — find every page mentioning "shallow clone"; write a
   coverage note into the new issue's notes/.
7. **Comment** — append a comment to the rebrand issue per comment
   conventions.
8. **Self-validation** — run whatever validation the project provides and
   report the result.

**Arms:** with-skills agents may use the agent-ks skills/CLI freely;
no-skills agents are instructed not to invoke skills or read the plugin —
they get only the repo itself (CLAUDE.md included, which is realistic).

**Metrics:** tokens + wall-time from the harness per agent; accuracy graded
after completion against a fixed rubric (one point per task, partial credit
noted) by inspecting each worktree.

## Output

Milestones: 101 (run + raw metrics), 01_summary.md (scores, comparison,
verdict on whether the skills earn their tokens).
