---
title: "Refactor implementation"
status: done
---

## Tasks

- [x] Declared `required_variables` contract in `src/styles/theme.yaml`
- [x] Built the primitive scale (font sizes, colours, spacing, radii, shadows, transitions) in `src/styles/`
- [x] Introduced semantic UI tokens (`--ui-text-micro / body / title`)
- [x] Introduced semantic content tokens (`--content-body / h1 / h2 / h3 / h4 / h5 / h6 / code`)
- [x] Introduced display tokens (`--display-sm / md / lg`) scoped to marketing surfaces
- [x] Migrated all layouts (docs, blog, issues, custom, navbar, footer) to consume semantic tokens — no more raw `--font-size-*` references in layouts
- [x] Removed inline fallback values (`var(--x, #abc)`) — themes must declare every required variable
- [x] Theme inheritance via `extends: "@theme/default"` resolved at theme load time
- [x] `resolveThemeName()` scans `theme_paths` from `site.yaml` at config load
- [x] Fixed theme HMR cache invalidation bug (theme CSS files in user theme dirs were classified as `asset` instead of `theme`)
