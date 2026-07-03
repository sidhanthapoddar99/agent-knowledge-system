---
title: "Native-markdown-only — remove custom-tags references everywhere"
---

# Goal

Make the platform's authoring story **native markdown only** — remove every
reference to custom tags from the plugin skills and the published docs, document the
native system in their place, and retire the dormant transformer code. The skills
and user-guide should not mention custom tags even as an absent feature.

Decision and rationale: [brainstorm/01_discuss_native-markdown-only.md](brainstorm/01_discuss_native-markdown-only.md)
— in short, the project has evolved from a documentation engine into an AI platform,
AI authors write native markdown reliably and custom tag syntaxes are where they
mass-produce errors.

## Context / background

Opened 2026-07-03 after a consumer-project incident: both skills' writing references
documented a `:::callout{…}` / `:::collapsible` / `:::tabs` directive syntax, 24
migration agents followed it in good faith across **45 files** — and the framework
has no `:::` parser at all. The real transformers (`astro-doc-code/src/custom-tags/`,
HTML-tag form) exist but were never wired into any parser pipeline, a gap the
framework's own user-guide had already caught in April
([docs-phase-2 comment 004](../2026-04-19-docs-phase-2/comments/004_custom-tags-removed.md))
without the fix ever reaching the plugin skills.

Full audit trail (root cause + sweep for sibling staleness):
`agent-log/010_au_stale-syntax-audit/`. The audit also verified: Mermaid/Graphviz
claims in the skills are accurate (wired via `src/scripts/diagrams.ts`), the
`[[path]]` embed preprocessor is wired into all three content types, and the
repo-local plugin source is byte-identical to the installed cache `0.5.1`.

The issue initially scoped only the snippet fix; the session's deliberation
("wire or remove?") escalated it into the native-markdown-only policy above.

**Related:**

- [2026-04-20-custom-tags](../2026-04-20-custom-tags/issue.md) — its wire-up/showcase
  premise was **reversed** by this decision and the issue dropped (comment 002
  there); code retirement is tracked here in `subtasks/10`.
- [2026-06-22-updating-skills-and-documentation](../2026-06-22-updating-skills-and-documentation/issue.md)
  (closed) — the previous general skill-maintenance batch; this staleness postdates it.

## Done when…

- Neither skill mentions custom tags, `:::` directives, or `<callout>`-style syntax
  anywhere; the native toolkit (blockquote callouts, `<details>`, fenced diagrams,
  `[[path]]` embeds) is what the writing references teach. Edits land in **both**
  the repo plugin source and the installed cache.
- The user-guide carries a native-markdown writing reference and no custom-tags
  mentions; dev-docs pipeline descriptions no longer list tag transformation.
- `src/custom-tags/` is deleted and the build passes.
- GFM alerts (`> [!NOTE]` et al. — settled "yes" 2026-07-03) render in all three
  content types with theme CSS, shipped before the docs describe them.

## Scope decisions

- **In:** skill references (repo + cache), user-guide/dev-docs sweep, transformer
  code retirement, GFM-alerts renderer + theme support.
- **Out:** consumer-project cleanup of the 45 `:::callout` files; any new embed
  types (Excalidraw etc. extend `[[path]]` later — see
  [2026-04-10-editor-diagrams](../2026-04-10-editor-diagrams/issue.md)'s embeds
  subtasks); closing 2026-04-20-custom-tags (human-only).
