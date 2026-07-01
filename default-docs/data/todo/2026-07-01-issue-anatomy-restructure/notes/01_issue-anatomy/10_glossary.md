# Glossary (framework view)

**Scope:** the optional per-issue `glossary.md`, rendered **as-is** on the Glossary panel —
**pure markdown, no generation, ever**. Issue-focused: the keywords, semantics, and
conventions that matter for understanding *this* issue.

## Recommended shape — sections + tables, case-to-case

Blank by default, but when written it should be **structured**: clear-cut sections,
tables and pointers over paragraphs. Use only the sections the issue needs; add custom
ones freely — this is a *suggested* skeleton, not a schema:

```markdown
# Glossary

## Colour legend            ← if the issue uses color: frontmatter
### Brainstorm              ← scope by anatomy section — the same colour can mean
| Colour | Meaning | Example |     different things in different sections
|---|---|---|
| blue   | option still in play | brainstorm/… |
### Agent log
| Colour | Meaning | Example |
|---|---|---|
| amber  | milestone to eyeball | agent-log/… |

## Key terms
| Term | Meaning |
|---|---|

## Conventions              ← naming schemes, custom-kind semantics, etc.
| Pattern | Meaning |
|---|---|
```

- **Colour legend** — the one section that's near-mandatory *if* the issue tints
  sidebar labels: colour has no framework meaning, so the legend is what makes it
  legible. An `Example` column pointing at a real file keeps it honest.
- **Scope tables per anatomy section** (`###` sub-headings: Brainstorm / Agent log /
  Notes / …) whenever a meaning differs by section — colour especially: blue on a
  brainstorm row and blue on a milestone are *different vocabularies*. An issue whose
  colours mean the same everywhere can keep a single flat table. The same scoping
  applies to any glossary section (key terms or conventions specific to one part).
- **Key terms** — issue-specific vocabulary a newcomer needs.
- **Conventions** — badge semantics, naming patterns, and the *prose meaning* of any
  custom agent-log kinds (the code → name/icon mapping itself stays in
  `settings.json` / Guide — the glossary explains what the kind *means here*).
- The suggested skeleton is surfaced in two places: the panel's **blank state** and
  the Guide's overview bullet.

## Decided

- **Pure author markdown, never generated.** Blank-state prompt when absent (now
  including the suggested sections). "Why create distinction and confusion?" —
  generated reference material is the **Guide's** job (see `09_guide`); the Glossary
  is the author's voice.
- **Structured-by-convention:** sections + tables + pointers, minimal paragraphs.
  Convention only — the framework renders whatever markdown is there.
- **Panel, not a route** — "This issue" group, right after Guide; hash-addressable.
- **The colour legend lives here**, as tables with an Example column — **scoped per
  anatomy section** (`###` sub-headings) when the same colour means different things
  in different sections; flat when issue-wide.
- **Custom agent-log kind *mappings* do NOT belong here** — `settings.json` data
  surfaced by the Guide; the glossary may explain a kind's semantics in prose.
