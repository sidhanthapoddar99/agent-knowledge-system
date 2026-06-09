---
title: "Re-root relative links in the root issue.md (issues-only postprocessor)"
done: true
state: review
---

New `issue-body-links` postprocessor, wired **only** into `IssuesParser`'s pipeline so it can't affect docs/blog. Gated to the root `issue.md` (path `<issue-id>/issue.md`, two segments under the tracker root); re-roots each relative link at the issue folder and emits it relative to the tracker base, so it resolves correctly from the collapsed detail URL.

- [x] `parsers/postprocessors/issue-body-links.ts` — gating + `reRoot()` (strips `.md`, `path.posix` normalize against `<issueId>/`, leaves absolute/external/anchor links).
- [x] Wired in `parsers/content-types/issues.ts` after `internalLinks`.
- [x] Verified in built HTML: `issue.md` body link re-rooted both directions (sidebar↔cache-isolation); sub-doc pages left untouched; `./start build` clean (469 pages).

Cross-issue links land on `/<tracker>/<id>/issue` and ride the redirect from subtask 01.

Artefact: code diff + built HTML. Awaiting human verify → close.
