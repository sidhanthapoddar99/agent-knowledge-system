---
title: "40 — Framework spec: per-agent-log settings.json"
---

# Per-agent-log `settings.json` — framework spec

What an independent agent needs to build the status-as-data half of
[the agent-log structure](./20_agent-log-structure.md). Measured against the
codebase 2026-08-02; every claim below is a grep result, not an assumption.

## What exists today

| Fact | Where |
|---|---|
| Folder-level `settings.json` **is** read — but **only for subtask groups**, and **only the `title` field** | `src/loaders/issues.ts:874–877` |
| `agent-log` agent logs read **no** folder-level settings | `src/loaders/issues.ts:603` — `readAgentLogs(...)` |
| An agent log's **kind is the two-letter code in its folder name** — `NNN_<code>_<name>/` — and that is the only thing that assigns it | validator: `check.mjs:646–648` |
| The issue's `settings.json` `agentLogKinds` defines the kind **vocabulary** only (which codes exist, their name / icon / desc), merged onto framework defaults. It assigns nothing. | `src/loaders/issues.ts:605–622` |
| `statusColors` is resolved once at tracker root and **validated against the fixed `STATUS_LIST`** | `src/loaders/issues.ts:462–498` |
| Icon/colour rendering surfaces | `layouts/issues/default/server/agent-log-icons.ts`, `state-icon.ts` |

**So this is a new read path, not a new field.** That is the load-bearing
correction: the one-line todo previously in
[`010`](../subtasks/040_execution/010_code-the-plans-section.md) understated it.

## What to build

**1. Read.** Extend `readAgentLogs` to pick up an optional `settings.json` per
agent-log folder **and per child agent log folder**. Copy the shape of the
subtask-group reader at `issues.ts:874` — same optionality, same
"absent is fine" behaviour.

**2. Schema.**

```jsonc
{
  "status": "in-progress"   // optional — see vocabulary below
}
```

**Status only.** The kind already comes from the folder-name code and is never
repeated here; `settings.json` exists to give the agent log a **status, and
therefore a colour** on its existing kind symbol. Free metadata is permitted but
nothing else is read.

**3. Type.** `IssueAgentLog` gains an optional status field. Optional in the
type, not just in the file — absent must be representable, never defaulted at
read time.

**4. Vocabulary.** Agent log statuses are a **subset** of the fixed issue
vocabulary: `open`, `in-progress`, `input-needed`, `done`, `dropped` —
`blocked` and `review` are excluded because they mean nothing for a run.

> [!WARNING]
> `resolveStatusColors` validates against the **full** `STATUS_LIST`. Decide
> explicitly: reuse that map and simply never emit the two excluded statuses, or
> introduce a separate agent-log-status list. **Reuse is preferred** — one colour
> source, and a tracker that overrides `statusColors` then styles both surfaces
> consistently for free.

**5. Absent renders grey.** Grey is a *defined value*, not the absence of a
colour — a missing status must be visually distinct from `open`, or the signal is
lost. Add it as an explicit token rather than falling through to a default.

**6. Not inherited.** A parent agent log's status is read from its own file only.
Do **not** compute it from children.

**7. Render.** Surface the status on the agent log in `DetailSidebar.astro` and
`SubdocTree.astro`, alongside the existing kind icon.

**8. The bundled Guide — `guide.ts`.** Not optional and easy to miss: it is the
plugin-independent anatomy legend rendered on **every** issue's Guide panel,
present whether or not the plugin is installed. A change that leaves it stale
ships a visible contradiction to every consumer site.

## `guide.ts` already has a status-colour system — reuse it

**Discovered 2026-08-02, and it changes item 4.** `guide.ts:~166` states:

> *"The `#N` badge is tinted by `status`: grey not-started · blue in-progress ·
> green success · red failed."*

So a **status → colour mechanism already exists** in the rendering layer — it is
simply attached to *milestone frontmatter* rather than to an agent-log folder.
With milestones gone, that tinting is exactly what has to move onto the agent log.

That gives item 4 a third option better than either originally listed: **reuse
the existing badge palette** rather than `statusColors` or a new list. Trace it
from `guide.ts` into `server/state-icon.ts` before choosing.

## RESOLVED — one vocabulary, everywhere (Sid, 2026-08-02)

**There is no second status vocabulary.** Issues, subtasks, plan stages, agent
logs and iteration files all use the canonical seven from
`src/loaders/issue-status.ts`.

An earlier draft had iteration files on `not-started · in-progress · success ·
failed`, inherited from milestone frontmatter. Dropped — it conflated two
different questions:

| Question | Answered by |
|---|---|
| Did the agent **finish its assignment**? | `status` — `done`, or `dropped` if it did not |
| What did the run **find**? | the iteration file's required `# Outcome` section |

Separate those and a run-outcome vocabulary has nothing left to express. It also
removes a real collision: **`not-started` is already a CATEGORY id** in
`issue-status.ts`, so the old draft reused one word for two kinds of thing.

**This settles item 4 by construction.** Reuse `statusColors` — it is literally
the same value set, so there was never a second palette to weigh. A tracker
overriding `fields.status.colors` then restyles issues, subtasks, plans, agent
logs and iteration files together.

## What must change in `guide.ts`

| Lines | What | Fate |
|---|---|---|
| ~133–140 | The anatomy tree showing `00_goal.md` / `03_working.md` / `05_notes.md` / `101_milestone.md` | → `summary.md` / `working/` / `notes/` + `settings.json` |
| ~157–161 | *"**Standard `0NN` slots first** (convention, kept present even when blank)"* + the six-slot list | **Delete.** This is a **fourth home** of the six-file floor, alongside the skill, the CLI scaffolder and NeuraSutra's `standing-rules.md` |
| ~162–167 | The whole **Milestones** block — `MNN_<name>.md`, ~3–6 per agent log, per-kind rhythm, keep failed ones | **Delete** — milestones no longer exist |
| ~166 | The `#N` badge tinting sentence | → agent log status colouring (above) |
| ~168–175 | The milestone frontmatter table (`iteration` / `status` / `agent` / `date`) | → the iteration-file frontmatter table (`status` / `agent`; **no** `iteration` — the `011_` filename owns the number) |

## Iteration-file status is NOT this

Iteration files inside `working/` carry status in **frontmatter**, not
`settings.json`:

```yaml
---
title: "Scope A — the byte surface"
status: done          # the agent finished; what it found is in `# Outcome`
agent: sol
---
```

**Two carriers, no overlap:** `settings.json` is per **folder**; frontmatter is
per **file**. Neither duplicates the other, and neither repeats what the filename
already says (the `011_` prefix is the iteration number — never restate it in
frontmatter).

## Acceptance

- The demo fixture `2026-07-01-demo-issue-anatomy-showcase` gains agent logs with
  and **without** `settings.json`, and both render correctly — the absent case is
  the one that regresses silently.
- A child agent log with a status different from its parent's renders its own, not
  the parent's.
- `agent-ks check issues` accepts an agent log with no `settings.json` and rejects
  a status outside the five-value subset.
- `./start build` clean.

## Scope boundary

This is **independent of the plans section** and can ship on its own. It shares
no code with the plans work beyond both touching `issues.ts`. Executed by
[`015_code-agent log-settings`](../subtasks/040_execution/015_code-agent-log-settings.md).
