# Guide panel & `glossary.md`

Two "This issue" panels that explain an issue to its readers. **Guide = generated,
mechanical; Glossary = authored, this-issue voice.** Don't blur them.

## The Guide panel (framework view — you don't write it)

Every issue renders a **Guide** panel: a static anatomy legend with generated islands,
built from `astro-doc-code/src/layouts/issues/default/guide.ts`. It is the
framework-bundled twin of this skill — present even when the plugin isn't installed.
Sections are ordered most-complex-first (Agent log → Subtasks → Agent memory →
Brainstorm → Notes → Comments → Issue); the one generated island is the **agent-log
kinds table** (the issue's effective `agentLogKinds` — defaults + custom).

Agent-relevant bits: the Guide shows the *effective* kind set for the issue you're in,
and its Overview holds the one canonical full-issue tree. **Keep `guide.ts` in sync
with this skill** when conventions change — skill = full manual, Guide = map.

## `glossary.md` (optional, author-owned — you may write it)

An optional per-issue `glossary.md` at the folder root, rendered **as-is** on the
Glossary panel — pure markdown, never generated. It holds the keywords, semantics, and
conventions that matter for understanding *this* issue. Blank-state prompt when absent.

Suggested skeleton (convention, not schema) — sections + tables over paragraphs:

```markdown
# Glossary

## Colour legend            ← near-mandatory IF the issue uses color: frontmatter
### Brainstorm              ← scope per anatomy section when a colour's meaning differs
| Colour | Meaning | Example |
|---|---|---|
| blue   | option still in play | brainstorm/… |

## Key terms
| Term | Meaning |
|---|---|

## Conventions              ← naming schemes, custom-kind semantics in prose
| Pattern | Meaning |
|---|---|
```

- **Colour legend** — `color:` frontmatter has no framework meaning; the legend is
  what makes it legible. Keep an `Example` column pointing at a real file. Scope with
  `###` per section when the same colour means different things in Brainstorm vs
  Agent log; flat table when issue-wide. Prefer theme tokens (`var(--color-success)`)
  so tints survive dark/light mode.
- **Custom agent-log kind *mappings* do NOT belong here** — that's `settings.json`
  data surfaced by the Guide. The glossary may explain what a kind *means here* in
  prose.
- Before interpreting any tinted label or unfamiliar term in an issue, **check its
  glossary first**.
