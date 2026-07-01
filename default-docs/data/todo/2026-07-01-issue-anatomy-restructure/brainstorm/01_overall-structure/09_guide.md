# Guide (framework view)

**Scope:** the **auto-generated** reference block rendered on every issue's Guide panel —
mechanical, not authored markdown. The framework-bundled twin of the skill's manual:
present at every build/deploy even when the plugin isn't installed.

## What it shows

The issue's anatomy and the **options currently available**:

- What each section is (subtasks / agent-log / agent-memory / notes / brainstorm) — the
  thin legend, organized by *what each holds* (no required lifecycle order).
- The effective **agent-log kind set**: the 5 framework defaults **plus** this issue's
  `settings.json` additions, each with its **symbol → meaning**.
- How to set colours, how to add & interpret comments, how to add more agent-log kinds.

Same on every issue **unless** the issue customized its vocabulary — that's the part that
varies, and why it must be generated rather than static.

## Guide vs Glossary (settled)

- **Guide = auto-generated**, mechanical, reflects the issue's effective options.
- **Glossary = pure `glossary.md`**, author markdown, never generated (see `10_glossary`).

## Implementation (subtask 03)

- Today the Guide is a static blob (`layouts/issues/default/guide.ts`). It must become
  **generated**: the "agent-log kinds" list built from the effective `agentLogKinds`
  mapping (defaults + issue additions), symbols included. Most of the legend stays
  constant; the options list varies per issue.
- Keep it in sync with the `documentation-guide` skill: the skill carries the full
  manual, the Guide carries the map.
