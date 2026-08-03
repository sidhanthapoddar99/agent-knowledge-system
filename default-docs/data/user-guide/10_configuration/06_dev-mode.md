---
title: Dev Mode
description: How the framework behaves differently in development vs production — and how to gate content to dev-only
sidebar_position: 6
---

# Dev Mode

The framework behaves differently depending on how it's invoked. This page covers:

- The two runtime modes and how to run each
- Every difference between them
- How to mark content as dev-only (per-file drafts today, whole sections and navbar items planned)

## The two modes

| Command | Mode | What it's for |
|---------|------|---------------|
| `./start dev` | **Development** | Live editing, hot reload, full dev-tools surface |
| `./start build` | **Production build** | Output static `dist/` for deployment |
| `./start preview` | **Production preview** | Serves the production build locally for smoke-testing |

Run from the repo root. If you've already `cd`'d into `astro-doc-code/`, the equivalent `bun run dev` / `bun run build` / `bun run preview` work as well.

The active mode is exposed as `import.meta.env.PROD` — `true` for build / preview, `false` for dev.

## What's different

| Feature | Dev | Prod |
|---------|-----|------|
| Draft content (`draft: true`) | ✅ Visible | ❌ Hidden |
| Tracker-wide draft (issues root `settings.json`) | ✅ Visible | ❌ Hidden |
| Live editor (`/editor`) | ✅ Available | ❌ Not mounted |
| Dev toolbar (layout selector, error logger, system metrics, cache inspector) | ✅ Available | ❌ Not mounted |
| Error-logger warnings surfaced in UI | ✅ Yes | ❌ No (still logged during build) |
| Yjs WebSocket + SSE presence channels | ✅ Running | ❌ Not mounted |
| Theme HMR | ✅ Yes | ❌ Static |
| `/api/graph/*` endpoints (once phase-3 lands) | ✅ Available | ❌ Dev-only |

## Why the split

Production builds are static — they're just files on disk. There's no server to answer API requests, no way to write files from a dev-toolbar app, and no point keeping a WebSocket server running. The editor, toolbars, and error UI are authoring tools — they belong to the dev loop, not the published site.

Content-wise, drafts and tracker-wide drafts are filtered **at load time**, before routes are even generated. A draft page in production simply doesn't exist — its URL returns 404, and it never appears in any sidebar, index, or list.

## Gating content to dev-only

There are three granularities for marking content dev-only. Pick the one that matches what you want to hide.

### Per-file — implemented

Set `draft: true` in a single page's frontmatter:

```yaml
---
title: Upcoming Feature
draft: true
---
```

Visible in dev, hidden in prod. Full details in [Drafts](../15_writing-content/05_drafts.md) — including the tracker-wide `"draft": true` in an issues root `settings.json`, which hides a whole issues tracker from prod.

### Whole section (pages + navbar items) — planned

> **Not implemented yet.** Tracked in issue `2025-06-25-dev-only-content` ("Dev Mode: gate content visibility for prod builds"). The shape below is the intended configuration surface.

**Hide a whole doc / blog / issues tracker via `site.yaml`:**

```yaml
# site.yaml
pages:
  todo:
    base_url: "/todo"
    type: docs
    layout: "@docs/default"
    data: "@data/docs/todo"
    hideInProd: true          # ← whole section disappears in prod
```

Use this for internal-only doc trees (roadmaps, staging trackers, debug sections) that you want to keep in the repo and edit locally, but never expose.

**Hide a navbar item (independent of page hiding) via `navbar.yaml`:**

```yaml
# navbar.yaml
items:
  - label: "Todo"
    href: "/todo"
    hideInProd: true

  - label: "Debug"
    hideInProd: true           # ← whole dropdown + its items hidden
    items:
      - label: "Cache Stats"
        href: "/debug/cache"
      - label: "Registry Dump"
        href: "/debug/registry"
```

Navbar and page-level hiding are independent by design — you can hide a navbar entry while keeping the target page reachable by direct URL, or leave a navbar placeholder visible while the target is hidden.

**`devOnly: true` frontmatter** is also scoped in the issue as an alternative name for per-file hiding. Final naming will be settled before the feature ships.

### Summary table

| Granularity | How | Status |
|-------------|-----|--------|
| Single page | `draft: true` frontmatter | ✅ Implemented |
| Whole doc / blog / issues tracker | `hideInProd: true` on the `site.yaml` page entry | ❌ Planned |
| Navbar item (link or dropdown) | `hideInProd: true` in `navbar.yaml` | ❌ Planned |
| Whole issues tracker | `"draft": true` in the tracker's root `settings.json` | ✅ Implemented |
| Alternate per-file flag | `devOnly: true` frontmatter | ❌ Planned (naming TBD) |

## Why not just use `draft` everywhere?

You can — and for individual pages it's already the right tool. But marking every file in a 30-page doc section as draft is a chore, and it leaves the section's URL space and navbar entry still reachable (pages 404 but the nav entry may linger). Section-level and navbar-level flags collapse the whole thing in one line.

**The intent is different, too.** `draft` means *work in progress, going to publish eventually* — the content is on a path toward going live. `hideInProd` means *never intended for production* — internal roadmaps, debug surfaces, staging trackers, editing-only scratchpads. Both hide in prod, but the authoring signal differs: drafts come out of draft, dev-only content stays dev-only.

## Visual indicators (planned)

Part of the same feature ship: dev-mode visual indicators — badges or icons on hidden pages in the sidebar and hidden navbar items — so authors can see at a glance what's dev-only without opening files.

## See also

- [Drafts](../15_writing-content/05_drafts.md) — the per-file flag, detailed usage
- [Page Configuration](./03_site/08_page.md) — where page entries are declared in `site.yaml`
- [Navbar Configuration](./04_navbar.md) — where navbar items are declared
- Issue `2025-06-25-dev-only-content` — tracks the planned `hideInProd` work
