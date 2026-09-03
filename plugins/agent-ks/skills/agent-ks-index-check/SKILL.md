---
name: agent-ks-index-check
description: Check whether an index in an agent-knowledge-system tracker still agrees with the files it points at. Works on a plan, an agent log, a subtask group, one index file, or a whole issue folder. Reports only. Never edits. Invoke it with the path as the argument.
argument-hint: "[path to an index file, an issue folder, a plan folder, or an agent-log folder]"
allowed-tools: Agent, Task, Read, Grep, Glob
---

# agent-ks-index-check

An index is a claim about files that live somewhere else. It goes stale with no error. This skill finds where the claim and the files disagree. It reports. It never edits.

## Run it

| Situation | Do |
|---|---|
| `$ARGUMENTS` is empty | Ask which index: a file, an issue folder, a plan folder, or an agent-log folder |
| The path is relative | Resolve it against the current directory |
| You have the `Agent` tool (`Task` in some harnesses) | Dispatch `agent-ks:agent-ks-index-checker` (bare name `agent-ks-index-checker` as the fallback), in the foreground. The prompt: the path, the user's scope, the absolute path of this file. Do not restate the procedure. Relay the report |
| You have no `Agent` tool (Codex) | Run the procedure yourself |

Do not read the index before a dispatch; that spends the context the dispatch saves, and primes the report. Use at most one `Glob` or `Read`, to confirm the path exists.

## The two directions

The filesystem is the truth. The index is the claim under test. Run the check twice. Report each direction on its own.

| Direction | Question | Finds |
|---|---|---|
| A: index to files | Is this claim still true? | `STALE`, `ORPHAN` |
| B: files to index | Is everything here listed? | `MISSING` |

Only direction B finds a file the index never names; links cannot lead there. So list the directory before you read the index. A run that did not list has not run direction B, and must say so.

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

Relay the four labels; do not flatten them. Put `MISSING` first, with its numbers, even at zero: "11 entries on disk, all 11 named". A clean result is an answer: say so, and say what was checked.

## Never

| Never | Do instead |
|---|---|
| Fix a finding, or offer to | Report it. The caller decides |
| Set a status because of a finding | Leave it. `done` and `dropped` are the user's |
| Run this skill from a hook, a gate or a CI job | Run it by hand |
