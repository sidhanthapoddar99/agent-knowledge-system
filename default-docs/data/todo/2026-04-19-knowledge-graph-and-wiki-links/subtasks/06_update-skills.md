---
title: "Update Claude skills — authoring + graph queries"
status: open
---

Teach both authoring skills and graph-query skills, so humans and AI agents both benefit from the new reference layer.

## `agent-ks-docs` skill — authoring

- [ ] Document `[[target]]` (wiki link) vs `[[[target]]]` (embed) as the canonical reference syntax.
- [ ] Teach the resolution order (slug / filename / title / fuzzy).
- [ ] Teach the namespace shortcut (`[[user-guide:themes/tokens]]`).
- [ ] Explicitly note: writing `[text](./foo.md)` still works — the preprocessor rewrites it to the registry URL.
- [ ] Update any examples in the skill that currently teach per-content-type `[[path]]` rules.

## `docs-settings` skill

- [ ] Probably a small touch — if the URL registry surfaces any new site-level config (e.g. default asset namespace, fuzzy-match threshold), document it here.

## New skill — `docs-graph` (name TBD)

Agent-oriented skill for querying the knowledge graph:

- [ ] Purpose: help an agent answer questions like "what references `theme-tokens` before I rename it?", "find orphaned pages", "list broken links."
- [ ] Trigger: questions about cross-references, renames, orphans, unused docs, or graph-shaped queries over the corpus.
- [ ] Reference the `/api/graph/*` endpoints from subtask 01.
- [ ] Include a "before rename" checklist: query backlinks → present to user → proceed only if user confirms autorewrite will catch them.

## Skill catalogue maintenance

- [ ] Add the new skill (if any) to `05_getting-started/05_claude-skills.md` in the user-guide.
- [ ] Update `.claude/skills/` index if one exists.

## Verify

- An agent writing new content uses `[[]]` / `[[[]]]` instinctively.
- An agent planning a rename queries backlinks first.
- The skill catalogue accurately lists every current skill and what triggers it.
