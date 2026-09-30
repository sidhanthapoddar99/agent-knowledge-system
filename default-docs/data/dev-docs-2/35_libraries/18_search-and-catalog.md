---
title: "Search and the catalog"
description: "The one ranking behind library find and library search, and how the engine reads library.json, the catalog of libraries and templates agentks offers."
---

This page covers the two ways the engine helps someone find a library or an element: search over the libraries a project already uses, and the catalog of libraries agentks offers for quick install. The code is in `apps/agentks-engine/crates/library/src/search.rs` and `catalog.rs`.

## One ranking

`library find` searches elements and `library search` searches the catalog. Both use one function, `search::score`, so the two rankings cannot drift.

- The search is case-insensitive, and every word must match somewhere: in the name, a tag or the description.
- A word in the name scores 3, in a tag 2, in the description 1. An item's score is the sum over its words.
- Results sort by score, best first.

For `library find`, the name is the element's name, and the hits are `FoundElement` values carrying the `alias:element` reference, the description, the tags and the score. For `library search`, the name is the catalog id, and the hits are `CatalogHit` values that also say whether each is a library or a template.

A library without a manifest has no descriptions or tags, so search can match only its element names. Adding a manifest is how a team makes its own elements findable.

## The catalog

`library.json` sits at the root of the library repository:

```json
{
  "libraries": {
    "agentks-default": {
      "description": "The default agentks library: curated icons for technical docs, the full Lucide icon set, device views and small data widgets",
      "git": "https://github.com/NeuraLabsHQ/agent-knowledge-system-library.git",
      "path": ".",
      "latest": "0.1.0",
      "tags": ["icons", "lucide", "widgets", "device-views"]
    }
  },
  "templates": {}
}
```

| Field | Meaning |
|---|---|
| the key | The id. `agentks library add <id>` and `agentks init --template <id>` use it |
| `description` | What the library or template is. Search reads it |
| `git` | Where it lives |
| `path` | Its folder inside the repository. `.` is the root |
| `tags` | Words search reads |
| `latest` | The newest version, for display only |

The repository's address is the constant `LIBRARY_REPOSITORY` in `agentks-core`, and the catalog is read from its `main` branch (`CATALOG_BRANCH`). It lists the libraries `agentks library` offers for quick install and the templates `agentks init` can use.

- **Read, never trusted for content.** Adding a catalog library writes an ordinary `dep.yaml` entry. From then on the entry resolves from git like any other, and the catalog plays no part. Its `latest` field is for display only.
- **Unknown keys are ignored.** The catalog never moves, so older binaries must keep reading it after it gains a field.
- **Fetched once per process.** `fetch_catalog` caches the result. `fetch_catalog_from` takes the address and branch as parameters, so tests can point it at a fixture.

## Related

- [Manifests and element lookup](./15_manifests-and-lookup.md): the descriptions and tags that search reads.
- [dep.yaml and dep.lock](./05_dep-files.md): the entry that adding a catalog library writes.
