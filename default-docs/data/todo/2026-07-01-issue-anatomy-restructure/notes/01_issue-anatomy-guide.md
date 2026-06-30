# Issue Anatomy — how a tracked issue is structured

> **Draft / working doc.** This is the artifact we iterate on to finalize the issue
> structure. Once it stabilizes it becomes (a) the static guide rendered on every
> issue, (b) the spec for the `documentation-guide` / `doc-agent` skill rewrite, and
> (c) the spec for the framework/loader changes. Edit freely — structure decisions
> live here first.

An **issue** is a folder capturing one coherent unit of *thinking + execution*. It's
built from the sections below — use whichever fit what you're doing. There's a natural
tendency (deliberate before you write things down, plan before you execute) but **no
required order**; the sections are organized by *what they hold*, not a fixed sequence.

## The ideal tree

```
2026-06-30-cost-manager-rate-limiting/      ← issue folder (YYYY-MM-DD-<slug>/)
├── issue.md                                ← the problem body
├── settings.json                           ← metadata (status, priority, component, labels)
│
├── brainstorm/                             ← ACTIVE deliberation — ideation, options, iterations
│   ├── 01_options/                         ←   (NOT conclusions; this is the *process* of deciding)
│   │   ├── 01_gateway-vs-cost-manager.md
│   │   └── 02_tradeoffs.md
│   └── 02_open-questions.md
│
├── notes/                                  ← FINALIZED output + research/references (permanent)
│   ├── 01_decided-architecture.md          ←   the structure you build on top of
│   ├── 02_rate-limit-algorithm.md
│   └── 03_reference-links.md               ←   research/links brainstorm can draw on
│
├── subtasks/                               ← the plan — to-dos to complete
│   ├── 01_define-limits.md
│   └── 02_wire-gateway.md
│
├── agent-log/                              ← execution record — autonomous loops & workflows
│   ├── 010_loop-implement-limiter/         ←   one folder per activity (NNN_<name>/)
│   │   ├── settings.json                    ←   { "kind": "loop" } → sidebar badge
│   │   ├── loop-goal.md                      ←   kind-seeded goal file
│   │   ├── task-list.md
│   │   ├── 101_token-bucket.md              ←   milestone
│   │   ├── 102_redis-backing.md             ←   milestone
│   │   └── summary.md
│   ├── 020_audit-edge-cases/
│   │   ├── settings.json                     ←   { "kind": "audit" }
│   │   └── 101_findings.md
│   └── 101_quick-fix.md                      ← trivial one-off: flat file, no activity folder
│
├── agent-memory/                           ← AI-mutable working state for this issue
│   ├── gotchas.md
│   └── decisions.md
│
└── comments/                               ← lean evolution log (FLAT — no threading, no substructure)
    ├── 001_opened.md
    ├── 002_scope-narrowed.md
    └── 003_handoff-to-claude.md
```

**Folder-with-files works everywhere.** `notes/`, `subtasks/`, and `brainstorm/` may
all use the same `NNN_<name>/` folder-containing-files pattern as `agent-log/` — the
loader walks up to two levels for each. A flat file (`02_open-questions.md`) and a
folder (`01_options/…`) can coexist as siblings; ordering is the numeric prefix
either way.

## The sections at a glance

| Section | Owner | Lifecycle | Purpose |
|---|---|---|---|
| **Issue** | human | curated | The problem, context, and metadata. |
| **Brainstorm** | human + AI | in-flux | Ideation, options, deliberation — the **process** of deciding *what to do*. |
| **Notes** | human + AI | finalized | The decided **output** + research/references — the **product** you build on. |
| **Subtasks** | both | plan / checklist | The plan — to-dos to complete. |
| **Agent Logs** | AI | append-only | The execution record — autonomous loops & workflows. |
| **Agent Memory** | AI | mutable | AI working state for this issue — facts worth not rediscovering. |
| **Comments** | both | append (flat) | Lean evolution log of the issue — what changed, status, hand-offs. |

The boundaries that keep these from blurring:

- **Brainstorm (process, in-flux) ≠ Notes (product, finalized).** Brainstorm is *"what should we do?"*; Notes is *"here's what we decided, plus the references."* When brainstorm resolves, the conclusion **graduates into Notes**.
- **Subtasks (the plan, *what*) ≠ Agent Logs (the execution, *how*).**
- **Notes (curated output) ≠ Agent Memory (AI scratchpad).** Same free-form feel, different owner and durability.
- **Comments are an evolution log, not a forum.** Brainstorming happens in `brainstorm/`; comments only *record that a decision happened*, not the debate that produced it.
- **Agent Memory is issue-scoped** — it complements, never replaces, global agent memory.

---

## Brainstorm (`brainstorm/`) — the deliberation

The **active** workspace: ideation, exploration, iterating over an idea, weighing
options — *"what should we do, exactly?"* This is the *process*, not the conclusion.
Absorbs the old "discussion" concept entirely.

- Free-form, **notes-shaped**: up to two levels of foldering, no enforced internal
  structure.
- Holds **non-final** thinking. The moment something is decided, the conclusion
  graduates into `notes/`; the brainstorm trail stays as the record of *how* you got
  there.
- **Example (this very doc):** deciding whether brainstorm and notes should be
  separate sections — that deliberation is *brainstorm*. The resulting structure is
  *notes*.
- **Intra-issue only.** Deliberation that spans *multiple* issues (e.g. several
  cancelled directions converging on one decision) stays as separate issues linked
  via `Related:` — brainstorm is the within-an-issue version of the same activity.

---

## Notes (`notes/`) — the finalized output + references

**Permanent** material: the decided structure/approach you build on top of, plus the
research links and references that brainstorm draws on. Where brainstorm is in-flux,
notes is settled.

- The **conclusion** of brainstorm lands here as a clean artifact (a guide, the
  agreed architecture, the spec).
- Also holds durable **research / reference** material — links, external docs, design
  sketches worth keeping.
- Free-form, human + AI curated, up to two levels.

---

## Subtasks (`subtasks/`) — the plan

A checklist of what's to be done, each with a state
(`open` / `review` / `closed` / `cancelled`). Created **after** notes settle the
approach; updated as loops close them out. This is the *what*. Unchanged from today.

---

## Agent Logs (`agent-log/`) — the execution record

How the work was actually run — the **autonomous loops and workflows** the agent uses
to complete a task. Kept so the next agent (or you tomorrow) can resume without
repeating dead ends. **One folder per activity:**

- **`NNN_<name>/` per activity.** Leading number orders; name describes. Ordering is
  purely the numeric prefix (2–5 digits, sort by value).
- **Internal structure is *not* loader-enforced — it's skill-guided.** Put whatever
  the activity needs inside; the framework just renders the files.
- **Kind is metadata, not a folder.** loop / workflow / audit / refactor /
  fast-iteration all share one shape. Declare it in the folder's `settings.json`
  (`"kind": "loop"`) → renders as a sidebar badge. Each kind seeds a goal file
  (`loop-goal.md`, `audit-goal.md`…).
- **Milestones, not steps.** One file per substantial completed chunk (`101_…`,
  `102_…`), ~3–6 per activity, *not* synced to subtask count. Keep failed milestones —
  they're signal.
- **Trivial one-off:** skip the folder, drop a flat `101_fix.md` in `agent-log/`.

A milestone file:

```markdown
---
iteration: 1
agent: claude-opus-4-8
status: success        # in-progress | success | failed
date: 2026-06-30
---

# <short milestone title>

## Goal
What this chunk set out to do.

## Approach
- Key decisions / steps.

## Result
- What landed, with evidence: commits, test counts, file paths.

## Next
What's next — or `—` if closed.
```

### Fast-iteration logging — subtask running-log vs agent-log activity

For rapid, ad-hoc changes landed in a burst (small structural / UI tweaks), pick the
logging home by how much **nuance** each change carries — it's the same *what vs how*
boundary, applied to a fast loop:

- **Low-nuance / mechanical** → one **subtask** used as a running checklist: create it
  once, make the changes, append one or two lines per change, check them off. (This
  issue's `06_issues-layout-restructuring` subtask is the worked example.)
- **Carries reasoning / decisions** → an **agent-log** activity of kind
  `fast-iteration`: when each change has a *why*, a weighed alternative, or a gotcha,
  the milestone shape preserves it where a checklist line would lose it.

**When it's ambiguous, ask the user which mode they want** before logging — don't
default silently. The user can also just call it ("log this in the subtask" /
"make it a fast-iteration agent-log").

---

## Agent Memory (`agent-memory/`) — AI working state

Durable facts the AI learns while working **this** issue — a gotcha, a decision, why
an approach is dead. **Fully AI-mutable**: rewritten in place, not append-only. Its
own sibling folder because its lifecycle differs from the append-only log.

- Free-form. Flat files by topic (`gotchas.md`, `decisions.md`) or one `memory.md`.
- Always-on: maintained continuously, not only during a named activity.
- Issue-scoped: complements global agent memory, never replaces it.

---

## Comments (`comments/`) — the evolution log

A **lean, flat** running record of how the issue evolved — what changed, status
shifts, hand-offs. Like a changelog for the issue, **not** a discussion forum.

- **Flat. No threading, no sub-comments, no substructure.** A comment is a single
  file (`002_scope-narrowed.md`).
- Records *that* a decision happened and the hand-off context — **not** the debate
  that produced it (that's `brainstorm/`).
- `author:` + `date:` frontmatter for attribution.

---

## Build cost (for when we implement)

| Change | Cost | Why |
|---|---|---|
| Agent Logs → flat `NNN_<name>/`, kind in `settings.json` | **Free** | Loader already walks this shape; just drop the old category wrappers. |
| **Brainstorm** → new sibling section | **Small** | Add to the loader's sub-folder list + reader + sidebar section + routing. |
| **Agent Memory** → new sibling section | **Small** | Same as brainstorm. |
| **Comments stay flat** | **Zero** | No threading work — the expensive change is *removed* from scope. |

---

## Settled decisions

- Brainstorm and Notes are **separate** — process vs product.
- Comments are **flat** — no threading. (Removes the costliest framework change.)
- "Discussion" as a concept is **gone** — folded into Brainstorm.
- The cancelled migration-direction issues are **not merged** — they stay separate,
  linked via `Related:`.
- Agent-log activity **kind** lives in a per-folder `settings.json` field.

## Open questions

1. **Where the rendered guide is hosted** — bundled in the framework
   (`astro-doc-code/`), present at every build/deploy, vs generated at scaffold time.
2. **Sidebar order** — confirm: Issue · Brainstorm · Notes · Subtasks · Agent Logs ·
   Agent Memory · Comments.
3. **Agent-memory shape** — flat files only, or allow one level of foldering?
