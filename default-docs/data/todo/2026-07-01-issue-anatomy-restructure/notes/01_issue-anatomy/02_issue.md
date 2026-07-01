# Issue

**Scope:** the issue's two root artifacts — `issue.md` (the body) and `settings.json`
(the metadata). Together they are the Overview page.

## Structure (current — kept as-is)

```
2026-06-30-cost-manager-rate-limiting/   ← issue folder: YYYY-MM-DD-<slug>/
├── issue.md                             ← the body — free-form markdown
├── settings.json                        ← metadata (below)
├── glossary.md                          ← optional (see 10_glossary)
└── <section folders>/                   ← comments / brainstorm / notes / subtasks / …
```

- **`created` comes from the folder slug** (the `YYYY-MM-DD` prefix); **`updated` is
  derived from git history** (most recent commit touching anything under the folder).
  Neither is a settings field — they can't drift.
- **`issue.md` is free-form** — no prescribed shape. The skill *suggests* a skeleton
  (problem / what changes / why / related), never enforces one.
- **`settings.json`** — the metadata record:

```jsonc
{
  "title": "…",                       // display title
  "description": "…",                 // index-card + list blurb
  "status": "open",                   // vocabulary from the tracker root settings.json
  "priority": "high",                 //   (status / priority / component / labels values
  "component": ["layout-issues"],     //    + colours are declared once, tracker-wide)
  "labels": ["feature"],
  "author": "sidhantha",
  "assignees": ["sidhantha", "claude"],
  "agentLogKinds": { "ex": { "name": "experiment", "icon": "flask" } }  // optional (see 07_agent-log)
}
```

- **Vocabulary lives in the tracker's root `settings.json`** — allowed values and badge
  colours for status / priority / component / labels, plus `authors` and saved `views`.
  Issue files only *pick* from it.

## Decided

- **Works as-is** — no changes to either artifact.
- `issue.md` is the overview page's only content — subtask summaries, comments, and
  section content live on their own panels.
- Body stays **free-form**; any skeleton is skill guidance, not a rule.
- Best-practice hints stand: one `component` per issue (multi allowed for genuinely
  cross-cutting work, hint-warned); AI-handoff-bound issues declare ≥1 subtask.
  **No scheduling / release-bucket / single-type fields** without an explicit policy
  reversal — they rot under continuous AI-driven shipping.
- Issue ordering in the index: `priority desc, updated desc`.
