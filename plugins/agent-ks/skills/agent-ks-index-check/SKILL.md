---
name: agent-ks-index-check
description: Check whether an index in an agent-knowledge-system tracker has gone stale — whether a plan, an agent log, a subtask group, issue.md or a whole issue folder still says what is true on disk. Use it whenever someone asks if a plan is out of date, whether an issue folder can still be trusted, what a folder claims against what is there, or asks for an index sweep before a wrap-up or at the start of a session that inherited someone else's work. Reports only, never edits, so it is safe to run on anything. Invoke it with the path as the argument.
argument-hint: "[path to an index file, an issue folder, a plan folder, or an agent-log folder]"
allowed-tools: Agent, Task, Read, Grep, Glob, Bash
---

# agent-ks-index-check

An index is a claim about files that live somewhere else. It goes stale with no error. This skill finds where the claim and the files disagree. It reports. It never edits.

## Run the CLI first

Two verbs answer the mechanical half of the check. Run them first, because a script resolves every link in a second and never miscounts.

| Command | Answers |
|---|---|
| `agent-ks check link-form <path>` | every `ORPHAN` under the path, with file and line |
| `agent-ks check issues` | a subtask group leaf whose `status` says open while every member is closed. It reads the whole tracker. Quote only the lines under your path |

Use the agent for `MISSING`, `STALE` and `INFERENCE` only. No script can follow a link and compare the target's state with the claim.

## Run it

| Situation | Do |
|---|---|
| `$ARGUMENTS` is empty | Ask which index: a file, an issue folder, a plan folder, or an agent-log folder |
| The path is relative | Resolve it to an absolute path. A subagent may run in a different working directory |
| You have the `Agent` tool (`Task` in some harnesses) | Dispatch `agent-ks:agent-ks-index-checker` (bare `agent-ks-index-checker` as the fallback). Give the prompt four things: the absolute path, the user's scope, the CLI findings, and the absolute path of this file. Do not restate the procedure. Wait for the report before you reply. Then relay it |
| You have no `Agent` tool (Codex) | Run the procedure yourself |

Do not read the index before you dispatch. Reading it spends the context the dispatch saves, and it shapes how you read the report. Use at most one `Glob` or `Read`, to confirm the path exists.

## The two directions

The filesystem is the truth. The index is the claim under test. Run the check twice. Report each direction on its own.

| Direction | Question | Finds |
|---|---|---|
| A: index to files | Is this claim still true? | `STALE`, `ORPHAN` |
| B: files to index | Is everything here listed? | `MISSING` |

Only direction B finds a file the index never names, because no link leads to such a file. So list the directory before you read the index. A run that did not list has not run direction B, and must say so.

## The four labels

| Label | Direction | Means |
|---|---|---|
| `MISSING` | B | on disk, absent from the index |
| `ORPHAN` | A | the index links a path that is not on disk |
| `STALE` | A | the index and the target state different facts. Objective |
| `INFERENCE` | A | every fact is correct, and the conclusion looks stale. A judgement for a human |

## The procedure

[The procedure reference](./references/procedure.md) holds the steps, the index kinds, the five plan checks and the report format. Follow it in full, dispatched or by hand.

## Relay

Relay the four labels. Do not merge them into one list. Put `MISSING` first, with its numbers, even at zero: "11 entries on disk, all 11 named". A clean result is an answer. Say so, and say what was checked.

## Never

| Never | Do instead |
|---|---|
| Fix a finding, or offer to | Report it. The caller decides |
| Set a status because of a finding | Leave it. `done` and `dropped` are the user's |
| Run this skill from a hook, a gate or a CI job | Run it by hand. `INFERENCE` is a human judgement, so a gate has no pass or fail to read |
