---
title: "Update user-guide + migration note"
status: open
---

The authoring surface changes — single syntax across all content types, plus a migration path for anyone who wrote against the old per-parser rules.

## Pages to update

- [ ] `15_writing-content/01_overview.md` — swap the "per-content-type rules" framing for "one registry, one `[[]]`/`[[[]]]` syntax for everything."
- [ ] `15_writing-content/03_asset-embedding.md` — rewrite entirely:
  - Old: three different path-resolution rules for docs / blogs / issues
  - New: `[[[target]]]` for embeds, `[[target]]` for references; relative paths still work as authoring shorthand and resolve to registry URLs
- [ ] **New page:** `15_writing-content/06_wiki-links.md` — `[[]]` syntax, resolution order (slug / filename / title / fuzzy), namespace shortcuts, escape syntax, broken-link behaviour.
- [ ] **New page:** `15_writing-content/07_cross-references.md` — cross-content-type links (issue → docs, blog → issue, etc.), how the registry makes this "just work."

## Migration note

- [ ] New page: `15_writing-content/99_migration-notes.md` (or add to `01_overview.md` as a collapsible section).
- [ ] Cover: old `[[./assets/foo.png]]` still works (autoconvert); old docs-only relative link resolution now works for every type; no breaking changes for existing content.
- [ ] Explicit table of "old syntax → new syntax" equivalents so authors don't have to guess.

## Cross-section touch-ups

- [ ] `05_getting-started/05_claude-skills.md` — add a row for any new graph-query skill (tracked under subtask 06).
- [ ] `17_docs/` / `18_blogs/` / `19_issues/` authoring guides — drop any content-type-specific path-resolution prose (moved to the unified section).

## Verify

- A new contributor reads `15_writing-content/` top to bottom and understands: one syntax, everything is a URL, authoring shorthand is just a convenience.
- Migration note is discoverable from the overview.
