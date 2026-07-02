# Example — the phase / index issue

A meta / epic issue that represents a whole phase or cycle. It is **an issue with subtasks that is itself a complete unit** — its subtasks are *lightweight pointers* (little individual context), and **each is promoted to its own issue when work begins**. The phase issue stays the index + roadmap + overall "what is to be done."

Modeled on the real `2026-04-29-00-phase-one-ideation-and-planning` pattern used in the parent project: it parks every step as an ordered subtask, then promotes each to its own issue as work starts.

## Layout

```
2026-04-29-00-phase-one-ideation-and-planning/
├── settings.json                  status: open (stays open for the whole phase)
├── issue.md                       the phase overview / roadmap — the durable context
├── notes/
│   ├── 010_design-pass.md         the Phase-0 design work
│   └── later-phases.md            ideas parked for future phases
└── subtasks/                      ORDERED pointers — one per step of the phase
    ├── 00_ideation.md             done (early)
    ├── 01_foundation.md           → promoted to 2026-04-30-01-foundations
    ├── 02_admin-users-and-workspaces.md  → promoted to 2026-06-17-02-admin-…
    ├── 03_teamspaces.md           open (not started — still just a pointer)
    ├── …
    └── 16_public-publishing.md    open
```

## What makes it different

- **The issue *is* the index.** `issue.md` is the roadmap — the ordered list of steps, the phase goal, the overall framing. It's the thing you read to understand the whole cycle. (This is the `00_overview.md`-style entry for a phase.)
- **Subtasks are pointers, not full work items.** Each subtask is a *thin* placeholder: a title + a sentence or two of intent. It carries little context on purpose — the real context arrives when it's promoted.
- **Promotion is the lifecycle.** When work on a step begins, it **graduates to its own issue** (`docs-guide move` any relevant notes across; see [43_moving-restructuring.md](43_moving-restructuring.md)). The original subtask stays in the index as the pointer ("→ promoted to `<new-issue-id>`") and flips to `review`/`done`; the new issue carries the actual planning + execution.
- **It stays `open` for a long time.** Unlike a normal issue that ships to `review` in days, a phase issue is open across the whole phase — it closes only when every step has been promoted and resolved.
- **Numbering encodes sequence.** The subtask prefixes (`00_`, `01_`, … `16_`) are a real ordering — the order the phase intends to tackle steps — not just sort sugar. The promoted issues echo the number in their slug (`-01-foundations`, `-02-admin-…`) so the lineage is visible.

## When to reach for this shape

Whenever you're planning a multi-step initiative that's too big for one issue but coherent as a unit: a release phase, a migration broken into stages, an epic. Park the steps as ordered subtask pointers, keep the index issue as the roadmap, and promote each step to its own issue as it comes up — so the index never balloons and each real work-unit gets a clean folder.
