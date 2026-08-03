---
title: Drafts
description: Mark content as work-in-progress — visible in dev, hidden in production
sidebar_position: 5
---

# Drafts

Any content file in any content type can be marked as a draft. Drafts are visible while you're developing and automatically hidden from production builds, so you can commit unfinished pages without worrying about them appearing on the live site.

## Basic usage

Add `draft: true` to a page's frontmatter:

```yaml
---
title: Upcoming Feature
draft: true
---

# Upcoming Feature

Still writing this...
```

That's it. The system handles the rest.

## Behaviour

| Environment | Drafts visible |
|-------------|----------------|
| `./start dev` (development) | ✅ Yes — visible in the sidebar, reachable by URL |
| `./start build` / `./start preview` (production) | ❌ No — filtered out of every loader and every route |

The gate is a single check: `!import.meta.env.PROD`. No config flag, no per-page override.

## Supported across every content type

| Content type | Field | Notes |
|--------------|-------|-------|
| **Docs** (`data/<doc-name>/`) | `draft: true` in the page's frontmatter | Single pages only |
| **Blogs** (`data/<blog-name>/`) | `draft: true` in the post's frontmatter | Draft posts disappear from the index **and** their direct URL |
| **Issues** (`data/<issues-name>/`) | `"draft": true` in the issue's `settings.json` | Per-issue — draft issues disappear from the index and their detail URL |
| **Issues tracker-wide** | `"draft": true` in the tracker's root `settings.json` | **Entire tracker** disappears in production. Useful for staging a new tracker before going live. |

## Dev-toolbar surface

When a draft page is loaded in dev, the error-logger dev-toolbar app records a **warning** (not an error):

```
type: draft
message: Document is marked as draft
suggestion: Remove draft: true when ready to publish
```

You can scan the error-logger for outstanding drafts any time. They don't block builds — they're just a visible reminder.

## Relationship to dev-only content

Drafts are **per-file** — you set `draft: true` on the one page you want to hide. For hiding an **entire doc section**, a **navbar item**, or a **whole tracker** from production in one place, see [Dev Mode](../10_configuration/06_dev-mode.md). The two features are designed to work together:

| Granularity | Use |
|-------------|-----|
| Single page | `draft: true` in the file's frontmatter (this page) |
| Whole doc / blog / issues tracker | `hideInProd: true` in `site.yaml` *(planned — see issue `2025-06-25-dev-only-content`)* |
| Navbar item (link or dropdown) | `hideInProd: true` in `navbar.yaml` *(planned — same issue)* |
| Whole issues tracker | `"draft": true` in the tracker's root `settings.json` (already works) |

Pick whichever matches the granularity of what you want to hide — marking every file in a 30-page section as `draft` works, but `hideInProd` on the section entry is one line.

**The intent is different, too.** `draft` means *work in progress, going to publish eventually* — the content exists on a path toward going live. `hideInProd` means *never intended for production* — internal roadmaps, debug surfaces, staging trackers, editing-only scratchpads. Both hide in prod, but the authoring signal differs: drafts come out of draft, dev-only content stays dev-only.

## Gotchas

- **Links to drafts from non-draft pages.** If a published page links to a draft page, that link becomes broken in production. There's no automatic check for this yet — it's tracked as part of the phase-3 knowledge-graph work.
- **Frontmatter is required.** Writing `draft: true` as plain text outside the `---` block does nothing.
- **Draft ≠ hidden.** If you want a page permanently hidden from production but visible to authors locally, draft is fine. If you want a page hidden *always* (even in dev), just don't add the file.

## See also

- [Dev Mode](../10_configuration/06_dev-mode.md) — the broader picture of what changes between dev and prod, plus how to hide whole sections or navbar items.
- Per-content-type frontmatter references: [Docs](../17_docs/04_frontmatter.md), [Blogs](../18_blogs/04_frontmatter.md), [Issues](../19_issues/01_overview.md).
