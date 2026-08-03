# Example — the phase / index issue

A meta / epic issue that represents a whole phase or cycle. It is **an issue with subtasks that is itself a complete unit** — its subtasks are *lightweight pointers* (little individual context), and **each is promoted to its own issue when work begins**. The phase issue stays the index + roadmap + overall "what is to be done."

Modeled on the real `2026-04-29-00-phase-one-ideation-and-planning` pattern used in the parent project: it parks every step as a subtask pointer, keeps the phase's intended sequence in a plan, and promotes each step to its own issue as work starts.

## Layout

```
2026-04-29-00-phase-one-ideation-and-planning/
├── settings.json                  status: open (stays open for the whole phase)
├── issue.md                       the phase overview / roadmap — the durable context
├── notes/
│   ├── 010_design-pass.md         the Phase-0 design work
│   └── later-phases.md            ideas parked for future phases
├── plans/                         ORDER — what runs when, and what blocks what
│   └── 01_phase-one/
│       ├── settings.json          title + status
│       ├── overview.md            the intended sequence, and the reasoning for it
│       ├── 10_foundations.md      a stage — points at the subtask it covers
│       ├── 20_admin-and-workspaces.md
│       └── 30_teamspaces.md
└── subtasks/                      the steps as POINTERS — stable ids, not a sequence
    ├── 010_ideation.md            done (early)
    ├── 020_foundation.md          → promoted to 2026-04-30-01-foundations
    ├── 030_admin-users-and-workspaces.md   → promoted to 2026-06-17-02-admin-…
    ├── 040_teamspaces.md          open (not started — still just a pointer)
    ├── …
    └── 160_public-publishing.md   open
```

## What makes it different

- **The issue *is* the index.** `issue.md` is the roadmap — the phase goal, the overall framing, the thing you read to understand the whole cycle.
- **Subtasks are pointers, not full work items.** Each subtask is a *thin* placeholder: a title + a sentence or two of intent. It carries little context on purpose — the real context arrives when it's promoted.
- **Promotion is the lifecycle.** When work on a step begins, it **graduates to its own issue** (`agent-ks move` any relevant notes across; see [43_moving-restructuring.md](../40_operations/43_moving-restructuring.md)). The original subtask stays in the index as the pointer ("→ promoted to `<new-issue-id>`") and flips to `review`; the new issue carries the actual planning + execution. Closing it is the user's ([00_overview.md](../00_anatomy/00_overview.md#closing-authority)).
- **It stays `open` for a long time.** Unlike a normal issue that ships to `review` in days, a phase issue is open across the whole phase — it closes only when every step has been promoted and resolved.
- **The order lives in the plan, not in the numbering.** A subtask's prefix is a stable id and a sort key — it does **not** imply sequence ([23_subtasks.md](../20_sections/23_subtasks.md)). A phase genuinely has an intended order, and that is exactly why it needs `plans/`: the sequence is a thing that changes, gets re-argued and gets closed, and a folder tree can do none of those. Gap-number the pointers (`010`, `020`, `030`) so a step discovered mid-phase slots in without renumbering sixteen files and every link into them.

> **The numbers in this example do not line up, and that is the point.** Subtask `020_foundation.md` promotes to `2026-04-30-01-foundations` — `020` against `-01-`. The slug's number is the phase's own historical labelling, kept so the lineage stays visible; the subtask's number is a sort key. Neither one means "runs second", and if you find yourself reconciling them you have started treating a label as a schedule.

## When to reach for this shape

Whenever you're planning a multi-step initiative that's too big for one issue but coherent as a unit: a release phase, a migration broken into stages, an epic. Park the steps as subtask pointers, put the sequence in a plan, keep the index issue as the roadmap, and promote each step to its own issue as it comes up — so the index never balloons and each real work-unit gets a clean folder.
