---
description: Check whether an index still agrees with the files it points at — a plan, an agent log's round index or summary, a subtask group overview, or a whole issue folder. Reports only; never edits.
argument-hint: "[path to an index file, an issue folder, a plan folder, or an agent-log folder]"
allowed-tools: Agent, Task, Read, Glob
---

You are running the `/agent-ks-fast-index-check` slash command from the `agent-ks`
plugin.

# Goal

Hand a path to the `agent-ks-index-checker` subagent and relay what it found. The
subagent reads the index, reads what the index points at, and reports where the
two disagree. **Nothing is edited by this command or by the agent it dispatches.**

# Step 1 — Settle the path

`$ARGUMENTS` is the path. If it is empty, ask:

> Which index should I check? A file, an issue folder, a plan folder, or an
> agent-log folder — all four work.

If the path is relative, resolve it against the current working directory before
forwarding, so the subagent starts from something unambiguous.

**Do not read the index yourself first.** Reading it here spends the context this
command exists to save, and it primes the report with whatever you happened to
notice. One `Glob` or `Read` to confirm the path exists is the ceiling.

# Step 2 — Dispatch

Invoke the subagent through the `Agent` tool (the `Task` tool in harnesses that
name it that), with:

- `subagent_type: "agent-ks:agent-ks-index-checker"` — fall back to the bare
  `agent-ks-index-checker` if the namespaced form does not resolve
- `run_in_background: false` — you need the result before you can reply

The prompt is the path plus anything the user said about scope. The agent's own
instructions carry the procedure; do not restate it in the prompt.

# Step 3 — Relay

The subagent's report is not shown to the user, so **relay it** — the findings,
their paths, and the closing note of what was read and what was skipped.

**Keep the two directions apart, and keep `MISSING` at the top.** The agent checks
index → files (*is this claim still true?*) and files → index (*is everything here
listed?*), and only the second can find an entry that exists on disk and is named
nowhere. Relay its four labels rather than flattening them:

| Label | Means |
|---|---|
| `MISSING` | on disk, absent from the index — the one a reader cannot find by clicking through |
| `ORPHAN` | the index links a file that does not exist |
| `STALE` | index and target state different facts — objective |
| `INFERENCE` | every fact correct, the conclusion looks stale — a judgement call |

**Relay the `MISSING` count even when it is zero**, with the numbers behind it
("11 entries on disk, all 11 named"). A silent Direction B and a Direction B that
never ran look identical, and the difference is the whole value of the check.

If the report is clean, say so plainly along with what was checked. A clean
result is an answer.

# Guardrails

- **Report only.** Do not fix anything you are told about, and do not offer to
  unless the user asks. An index carries judgement; rewriting it replaces that
  judgement with a restatement of the frontmatter.
- **Never set a status** as a result of a finding. `done` and `dropped` are the
  user's, and a stale-looking plan stage is exactly the case where the tracker's
  own rule says the stage may legitimately be ahead of its subtasks.
- **This command is manual.** It is not called by a hook, a gate or a CI job, and
  it should not become one.
