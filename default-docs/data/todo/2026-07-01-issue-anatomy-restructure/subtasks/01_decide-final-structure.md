---
title: Decide the final structure
state: closed
---

Lock the section model and folder layout. The final design lives in
**`notes/01_issue-anatomy/`** (one file per section — all ten settled), graduated from
`brainstorm/01_overall-structure/`.

- [x] Confirm the six sections + Issue: Brainstorm · Notes · Subtasks · Agent Logs ·
      Agent Memory · Comments — plus the framework views (Guide · Glossary ·
      Comprehensive). See `01_overall`.
- [x] Confirm sidebar order — Overview · Comments · Comprehensive · Guide · Glossary,
      then Brainstorm · Notes · Subtasks · Agent log · Agent memory. Ascending ordering
      everywhere (newest-first feed considered and rejected).
- [x] Brainstorm vs Notes boundary wording — **process vs product**, final. Graduation
      marker `**Resolved →** <target>` on resolved brainstorms. See `04_brainstorm` /
      `05_notes`.
- [x] Agent-memory shape — **index + topic files** (`memory.md` pinned first), folders
      allowed (same 2-level walk). See `08_agent-memory`.
- [x] Where the rendered guide is hosted — **framework bundle** (`guide.ts`), now
      generated per issue via `buildIssueGuide(kindMap)`. See `09_guide`.
- [x] `NNN_<name>/` folder-with-files pattern confirmed for notes / subtasks /
      brainstorm (not just agent-log) — loader walks 2 levels everywhere.
- [x] **Graduated** — the ten files moved as-is to `notes/01_issue-anatomy/` (they were
      written as specs, so a rewrite would only create a mirror to rot). Green
      progress-tints stripped (settled is the default in notes); a resolved stub with
      `**Resolved →**` stays in `brainstorm/`; glossary legend retired.
