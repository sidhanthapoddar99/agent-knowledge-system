---
title: "Resolve internal links to absolute at render time (browser-independent) — fixes the Comprehensive-panel embed + the whole class"
state: open
---

**Decision (2026-06-09):** stop depending on the browser to resolve relative
links. Resolve **all** internal `.md` / relative links to **root-absolute** URLs
at render time, so a link is correct no matter which page — or embed — it's
displayed on. This supersedes the interim issues-only `issue-body-links`
postprocessor (subtask 02) and also hardens docs/blog.

## The bug this fixes — worked example (the Comprehensive panel)

The same subtask content is shown on **two screens at different URL depths**:

- **Screen 1 — the subtask's own page.** Sidebar → click the subtask → navigates
  to `/todo/<issue>/subtasks/03_…`. **Deep** URL.
- **Screen 2 — the Comprehensive tab.** On the issue's detail page, sidebar →
  click **Comprehensive** → it stacks every subtask's full body inline, and the
  **URL stays `/todo/<issue>`** (it's a client-side tab swap via `panels.ts`, not a
  navigation — the address never deepens). **Shallow** URL.

Both screens render the *same* baked subtask HTML, including a link authored as
`../../2026-05-07-cache-isolation-cross-project/issue` (frozen at build time). The
browser resolves `../../` against the **current address**:

```
Screen 1  (/todo/<issue>/subtasks/03_…)      Screen 2 — Comprehensive  (/todo/<issue>)
 current: /todo/<issue>/subtasks/             current: /todo/
 ../   →  /todo/<issue>/                       ../   →  /
 ../.. →  /todo/                               ../.. →  /        (clamped at root)
 + tgt →  /todo/cache-isolation/issue  ✅      + tgt →  /cache-isolation/issue  ❌ (no /todo → 404)
```

So: **reading subtasks via the Comprehensive tab and clicking a relative link
inside one → 404**, while the *same* link on the subtask's own page works fine
(verified live on :3088). Root cause (general): a relative link encodes "N steps up
from *here*," but "here" is the displaying page's URL — and the same content is
shown at two depths. A relative link can only ever be right for one of them. (Same
root cause as the `issue.md` bug in subtask 02, just mirrored.)

## The fix — render-time absolute resolution for ALL internal links

Resolve every internal link to a **root-absolute** URL
(`/todo/2026-05-07-cache-isolation-cross-project`) during postprocessing, so the
browser never does relative math. Absolute URLs are correct regardless of which
page or embed they appear on, and they remove the latent trailing-slash fragility
everywhere (docs + blog included).

Needs, at render time, per file:

- the page **`base_url`** (e.g. `/todo`, `/user-guide`) — from the page's
  `site.yaml` config;
- the file's **url-path / slug** — so `../` resolves from the right starting point.

Both must be threaded into `ProcessContext` (today it carries only
`filePath` / `basePath` / `contentType`). The loaders that drive the render
(`loadIssues` / `loadContent`) have `base_url` available at their call sites —
`route-match` and `static-paths` already hold `pageConfig.base_url` — so thread it
down. Then a single shared resolver maps
`(base_url, file-url-path, relative-href) → absolute URL`, reusing the existing
`.md` / `XX_` stripping.

- [ ] Add `baseUrl` (+ the file's url-path) to `ProcessContext`; thread from the loaders.
- [ ] Write the shared absolute-link resolver; emit absolute URLs instead of relative.
- [ ] Remove the interim `issue-body-links` postprocessor (subtask 02) once the general pass covers `issue.md`.
- [ ] Verify all four: subtask's own page · the Comprehensive embed · docs cross-links · blog — plus a trailing-slash URL still resolving.

## Architectural note

This is the "**don't depend on browser relative resolution — resolve links to
absolute at render time**" principle. Recorded as a rule for the Go rewrite in
`2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md`
(per-structure URL rules own the file-path → URL mapping; the renderer emits
absolute links).
