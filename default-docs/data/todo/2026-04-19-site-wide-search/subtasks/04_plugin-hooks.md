---
title: "Plugin hooks — let integrations index their own content"
status: open
---

Search shouldn't be hard-coded to the built-in content types. Any future plugin / custom loader should be able to register records with the index.

## Hook surface

`src/search/index.ts` exposes:

```ts
export function registerSearchSource(source: SearchSource): void

interface SearchSource {
  id: string                              // unique, used for unregister + diagnostics
  type: string                            // custom type name for the `type` field
  enumerate(): Promise<SearchDoc[]>       // called on bulk reindex
  subscribe?(cb: (event: IndexEvent) => void): () => void  // optional live-update stream
}
```

## Built-in sources implemented as plugins

Migrate the built-in loaders (`docs`, `blog`, `issues`) to call `registerSearchSource()` themselves. This enforces the hook surface by dogfooding — if the built-ins can't express themselves through it, the hook is wrong.

## Unregister
- Reloading a source (e.g. when user edits `site.yaml` and a content dir is removed) should `unregisterSearchSource(id)` and drop all its records.

## Ordering & conflicts
- Each source owns its `type` namespace; `id` fields MUST be globally unique (prefix with `type:` internally).
- Two sources registering the same `id` → last-write-wins with a console warning.

## Out of scope
- A full plugin system / manifest — this hooks into whatever the future plugin system looks like (issue #28 area). For now the API is just a module export.
