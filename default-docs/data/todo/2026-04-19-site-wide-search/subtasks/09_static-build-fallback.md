---
title: "Static-build fallback — Pagefind when there's no server"
status: open
---

Orama lives in the Node process. If someone builds this template to static HTML (CDN-deployed, no Node runtime), there's no `/api/search` to hit. They still need search.

## Chosen fallback: Pagefind

- Runs as a **build-time** indexer over the final `dist/` HTML.
- Ships a ~10 KB WASM loader + sharded index files.
- Loads index shards lazily from the CDN as the user types — even large corpora stay snappy.
- Supports filters, fuzzy, highlighting — feature parity with Orama for basic queries.

## Integration

- Add a post-build step in `astro.config` / `package.json`:
  ```
  bun run build && pagefind --site dist
  ```
- Gate it via an env var or `site.yaml` flag: `search: { mode: "auto" | "server" | "static" }`.
  - `auto` (default): server mode in dev / SSR prod, static mode in static builds.
  - `server`: always use Orama + `/api/search`.
  - `static`: always use Pagefind, even in dev (lets you preview prod behavior).

## Unified client

The search UI (subtask 08) should NOT care which backend is active. Two adapters:

```ts
// src/search/client/adapter-server.ts
export async function search(params): Promise<SearchResponse> {
  return fetch(`/api/search?${qs(params)}`).then(r => r.json())
}

// src/search/client/adapter-pagefind.ts
export async function search(params): Promise<SearchResponse> {
  const pf = await import('/pagefind/pagefind.js')
  const res = await pf.search(params.q, { filters: toPagefindFilters(params) })
  return normalize(res)
}
```

Pick the adapter at runtime based on whether `/api/search` exists (HEAD probe on first query, cached).

## Limitations of the static fallback

- **No live updates** — static build is frozen until the next deploy.
- **No regex mode** — Pagefind doesn't do it. UI should gray the toggle out in static mode.
- **Synonyms** — supported via Pagefind metadata, but reconfigured differently than Orama's; may need a build-time transform.
- **AI skill** — the `/api/search` endpoint won't exist in static mode. Document this. Agents should fall back to grep over files.

## Out of scope
- Hybrid static+dynamic (use Pagefind for docs/blog, Orama for issues). Keep it simple.
- Alternative static engines (Lunr, Stork) — Pagefind is the consensus pick.
