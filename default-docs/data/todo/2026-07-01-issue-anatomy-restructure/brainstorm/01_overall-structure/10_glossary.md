# Glossary (framework view)

**Scope:** the optional per-issue `glossary.md`, rendered **as-is** on the Glossary panel —
**pure markdown, no generation, ever**. Issue-focused prose: the keywords that matter for
understanding *this* issue, its structure if useful, and any colour / naming schemes the
author wants to define.

## Decided

- **Pure author markdown.** If nobody wrote a `glossary.md`, the panel shows a themed
  blank-state prompting the author to add one — it never fabricates content. "Why create
  distinction and confusion?" — generated reference material is the **Guide's** job
  (see `09_guide`); the Glossary is the author's voice.
- **Panel, not a route** — sits in the "This issue" group right after Guide;
  hash-addressable, no new routing.
- **The colour legend lives here.** Sidebar `color:` frontmatter has no framework-defined
  meaning; an issue that uses colours documents what they mean in its glossary.
- **Custom agent-log kinds do NOT belong here** — the code → name/icon mapping is
  `settings.json` data surfaced by the Guide, not a glossary concern. (The glossary *may*
  still explain a kind's semantics in prose if the author wants — e.g. what counts as an
  "experiment" in this issue.)
