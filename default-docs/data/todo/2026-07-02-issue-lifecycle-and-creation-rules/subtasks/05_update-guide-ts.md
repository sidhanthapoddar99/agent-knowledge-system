---
title: Update the bundled guide.ts issue-anatomy panel
status: done
---

`astro-doc-code/src/layouts/issues/default/guide.ts` is the plugin-independent
legend rendered on every issue's Guide panel — it must describe the same lifecycle
as the docs and skill, per `notes/01_lifecycle-vocabulary.md`.

- [x] Lifecycle section: the 4 categories with their 7 statuses (one line each —
      it's a legend, not a manual), the agent ceiling (Review category;
      `done`/`dropped` human-only), and the `input-needed` vs `review` distinction.
- [x] Mention that filters/tabs are category-level and the badge shows the status.
- [x] Remove any assignees-as-in-progress phrasing and any 4-state /
      `closed`/`cancelled` remnants.
- [x] Keep it a thin map — depth stays in the user-guide / skill. Ideally import
      the status/category constant from the loader rather than restating values
      (same file tree — check feasibility; if messy, a comment pointing at the
      constant is enough).
- [x] Build-check after the change.
