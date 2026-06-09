---
iteration: 1
agent: claude
status: success
date: 2026-06-09
---

Goal: Fix relative-link under-resolution in issue.md bodies + canonicalize the /issue path.

Approach: (1) /issue redirect — added a redirectTo prop to RouteProps, set in route-match.ts (issues branch, parts[1]==='issue') and static-paths.ts (per-issue redirect path); [...slug].astro redirects early before layout resolution. Mirrors the existing docs-index redirect; base-agnostic via pageConfig.base_url. (2) issue-body-links postprocessor — new file parsers/postprocessors/issue-body-links.ts, wired ONLY into IssuesParser (content-types/issues.ts) so docs/blog are untouched. Gated to the root issue.md (relative path = <issueId>/issue.md); reRoot() strips .md, posix-normalizes the link against <issueId>/, emits tracker-base-relative. Cross-issue body links land on /<tracker>/<id>/issue and ride the redirect.

Result: ./start build clean, 469 pages. Verified in built HTML — issue.md body links re-rooted both directions (sidebar-state <-> cache-isolation), sub-doc pages left untouched (subtask 03 page still ../../, correct for its depth), 41 /issue redirect pages generated. Subtasks 01 & 02 -> review.

Next: subtask 03 (open) — sub-doc bodies embedded in the Comprehensive panel under-resolve at the detail URL depth (same bug class, separate fix; wants base_url threaded for root-absolute resolution). Issue stays open (review-gated) until 01/02 are human-verified and 03 is done. Broader fix: the structure self-registration model in 2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md.
