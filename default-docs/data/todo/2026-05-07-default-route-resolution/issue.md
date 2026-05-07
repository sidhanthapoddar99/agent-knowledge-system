## Symptom

Visiting a section root URL without a slug — e.g. `/user-guide` — should resolve to the section's natural first doc (the lowest `XX_` prefix at the lowest depth, e.g. `/user-guide/05_getting-started/01_overview`).

Instead, it resolves to a deeply-nested stub: `/user-guide/55_plugins/01_to_be_written` (or similar). The default-route resolver appears to pick the wrong page.

## Repro

1. Run `./start dev`.
2. Open `http://localhost:<PORT>/user-guide` (no slug).
3. Observe the URL it lands on.

Expected: `/user-guide/05_getting-started/01_overview` (or the equivalent first leaf under the lowest-prefixed top-level folder).

Actual: lands on a `to_be_written` stub page deep in the tree.

## Suspected cause

The default-route resolver isn't sorting by `XX_` prefix correctly across all depths, or it's preferring a deeper match when a shallower one exists, or it's matching alphabetically rather than by numeric prefix. Worth checking:

- `astro-doc-code/src/loaders/data.ts` — how it orders entries.
- `astro-doc-code/src/pages/[...slug].astro` — how it picks the default redirect target for a section root.
- `astro-doc-code/src/pages/lib/route-match.ts` and `static-paths.ts`.

## Why this matters

A section's first doc is its front door. Sending users to a stub on first visit is a bad first impression and an obvious correctness bug.

## Out of scope (for now)

- Adding a `default_page` override field to section `settings.json`. That's a feature; this issue is the bug fix. Pin both behaviours in the spec, decide separately.
