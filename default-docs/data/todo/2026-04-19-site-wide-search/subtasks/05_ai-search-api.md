---
title: "AI/agent-facing search API + Claude skill"
status: open
---

Claude Code (and any other agent) should be able to query the search index without reading raw files one by one. Faster, lower-context, respects scoping.

## HTTP endpoint

`GET /api/search` (already introduced in subtask 02). Same endpoint serves human UI and agents — no special bot channel.

Request:
```
GET /api/search?q=foo&section=docs&type=subtask&filter=status:open&limit=20&fuzzy=true
GET /api/search?q=indexer&type=subtask&filter=state:review        # subtasks have their own `state:` field — filter on that, not the parent issue's `status:`
```

Response:
```json
{
  "hits": [
    {
      "id": "docs:user-guide/10_configuration/05_site-yaml",
      "url": "/user-guide/configuration/site-yaml",
      "title": "site.yaml reference",
      "excerpt": "The top-level site config…",
      "matches": [{ "field": "content", "position": 42, "length": 3 }],
      "score": 7.21
    }
  ],
  "total": 4,
  "took_ms": 3
}
```

## Claude skill

New skill file: `.claude/skills/docs-search.md` (or plugin-scoped).

Trigger wording: when the user asks "find", "search", "where is X mentioned", "which docs talk about Y".

Skill body tells Claude:
- Prefer `/api/search?q=...` over raw grep for full-text questions across docs/blog/issues.
- Use `section=` to scope when the user names a content area.
- Use `filter=` to scope by issue status/priority/type.
- Follow up with `Read` on the top hits' `url` → file paths when deeper context is needed.

## Discovery

- Advertise the endpoint in `dev-docs/` so AI agents reading the docs know it exists.
- Include a short machine-readable `/api/search/meta` endpoint returning schema + available filters (lets agents self-configure).

## Out of scope
- Authentication / rate-limiting for the endpoint (assume trusted dev environment for now; add in a later phase if prod has anonymous users).
- Vector / semantic mode (lives in subtask 06 if we decide to include it).
