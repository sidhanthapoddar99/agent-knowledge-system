---
title: Docs collapsible standardization
done: true
state: closed
---

Document a house default for sidebar collapse behaviour in docs folders, so new sections
get a consistent, tidy sidebar without per-folder guesswork.

**Done:**

- Added the `collapsible` field to the per-folder `settings.json` table in
  `references/layouts/docs-layout.md` (it was code-backed via `useSidebar.ts` —
  `settings.collapsible ?? true` / `settings.collapsed ?? false` — but undocumented).
- Documented the **depth-based default** (apply unless the user asks otherwise):

  | Folder depth | `collapsible` | `collapsed` | Effect |
  |---|---|---|---|
  | Level 1 (top-level groups) | `false` | `false` | Always-open section headers, no toggle |
  | Level 2+ (nested) | `true` | `true` | Collapsible and start collapsed |

- Noted that the framework's built-in fallback differs (`collapsible: true` /
  `collapsed: false` everywhere), so both fields should be set explicitly per folder; and
  that this is a sensible default, not a hard rule.
- Updated the minimal `settings.json` example to model a level-1 group.

Docs-only change (`references/layouts/docs-layout.md`); field names verified against
`astro-doc-code/src/hooks/useSidebar.ts`.
