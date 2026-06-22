---
title: "Autoconvert shorthand → URLs; autorewrite on rename"
state: open
---

Two directions of automation wired through the same registry.

## 3.1 — Authoring shorthand → canonical URLs (render time)

At preprocess time, rewrite every shorthand reference to its registry URL before the markdown hits the renderer.

- [ ] `[[target]]` → `<a href="<url>">…</a>` after resolving `target` against the registry (slug / filename / title / fuzzy).
- [ ] `[[[target]]]` → embed. Dispatch on MIME type:
  - `text/markdown` → inline the rendered HTML of the target page
  - `image/*` → `<img src="<url>" alt="…">`
  - `text/*` inside a fenced code block → inline the file's contents (current asset-embed behaviour)
  - Other → warning (unsupported embed kind)
- [ ] Relative `.md` / `.mdx` links in markdown (`[text](./foo.md)`, `../other-issue/issue.md`) → resolve to target URL via the registry; drop the `contentType === 'docs'` gate so it works for every content type.
- [ ] Relative asset paths (`![alt](./assets/foo.png)`, legacy `[[./assets/foo.py]]`) → resolve to registered asset URLs.
- [ ] Escape syntax: `\[[…]]` and `\[[[…]]]` render literal.
- [ ] Ambiguous wiki-link → pick closest match, emit warning (surfaces in error-logger).
- [ ] Unresolved → render as broken-link style + emit warning.

## 3.2 — Autorewrite on file change (dev-server watch)

When the dev server is running, a rename or move triggers automatic rewriting of every inbound reference so nothing silently breaks.

- [ ] Hook the existing file watcher (already wired for mtime cache invalidation).
- [ ] On file `rename` / `move`:
  1. Query the graph for inbound references (`backlinks(old_url)`).
  2. For each referring source file, rewrite the matching `[[…]]` / `[[[…]]]` / `[text](./…)` to the new URL or slug.
  3. Update the registry entry (old URL → new URL, alias list refreshed).
  4. Emit a dev-toolbar notification: "Rewrote N references to `<old>` → `<new>`."
- [ ] Debounce bursts of rename events (500 ms default, configurable).
- [ ] **Coordinate with the Yjs editor**: if the referring file is currently open in the editor, queue the rewrite to flow through the Yjs document (don't race the write).
- [ ] Errors (permission, I/O) surface as dev-toolbar warnings with the affected file paths.

## 3.3 — Headless (build-time) behaviour

- [ ] On `bun run build`, the registry rebuilds from scratch; any shorthand whose target isn't in the registry becomes a broken-link warning surfaced in the build log.
- [ ] No auto-rewrite in headless mode — renames must be resolved during development.

## Verify

- Rename an issue's folder in the editor → other issues / docs / blog posts referencing it update on next save.
- `[[Theme tokens]]` from anywhere resolves to the themes page.
- `[[[diagram.png]]]` from an issue renders inline as an image.
- `[[does-not-exist]]` renders as broken-link + shows up in error-logger.
