---
title: "One resolver for docs, blog and the tracker — three behaviours become one"
status: open
---

# Overview

**The same question has three different answers today, depending on which content
type asked it.** That is why "does a link work here" has never had one answer in
this project, and why a fix to one has repeatedly left the others alone.

| Content type | What happens to an internal link today |
|---|---|
| **docs** | Full treatment in `internal-links.ts` — extension stripped, `NN_` prefixes stripped, `/index` collapsed |
| **blog** | The early-return branch: `.md` stripped, **nothing else**. The date prefix survives, so a sibling post lands underneath the current one |
| **issues** | Neither. A separate `issue-body-links.ts` pass fires **only on a root `issue.md`**, re-rooting it because that body is served one segment shallower than its file position |

**Done when** all three go through [the shared resolver](./020_the-shared-resolver.md)
and `issue-body-links.ts` is deleted.

# Why this is not just tidiness

Three implementations means three sets of edge cases, and a fact learned in one
does not reach the others. Concretely, this has already cost:

- **The depth shift was docs-only**, so nobody could tell from the tracker whether
  it was right — and the tracker's own conclusion about the trailing slash was
  recorded from a dev server and is dev-only.
- **The blog's date prefix is still in its rendered URLs**, a defect that has
  simply never been in scope for whichever fix was running.
- `issue-body-links.ts` exists solely because the tracker's root `issue.md` is
  served at the collapsed detail URL. **That is exactly the "content displayed at
  a different depth than its file" case** the map handles generally — a special
  case of the general problem, patched separately because there was no general
  mechanism.

# Done when

- [ ] Blog links resolve absolutely, with the date prefix stripped from the URL as
      routing already does — check a sibling-post link end to end
- [ ] Tracker links resolve absolutely from **every** body: root `issue.md`,
      subtasks, notes, comments, agent-log files
- [ ] `issue-body-links.ts` is **deleted**, not disabled, and its re-rooting is
      shown to be redundant rather than assumed to be
- [ ] `scripts/check-links.mjs` run with the tracker in scope, against dev **and**
      a static host, before and after
- [ ] The [Comprehensive panel check](./030_comprehensive-panel-subdoc-links.md)
      still passes afterwards

# References

- The design: [the path map](../../notes/30_the-path-map.md)
- The prerequisite: [the shared resolver](./020_the-shared-resolver.md)
- The code: `astro-doc-code/src/parsers/postprocessors/internal-links.ts`
  (the `contentType !== 'docs'` early return) and `issue-body-links.ts`
- The measurement that showed the tracker's answer was dev-only:
  [dev and build disagree on the base](../../../2026-08-02-refactor-efficiency-and-planning/subtasks/100_link-integrity/120_dev-and-build-disagree-on-the-base.md)

# Details

## The blog is under active development

Blog findings were explicitly out of scope during the link-integrity round
(Sid, 2026-08-04) because the blog is still being built. That holds for *chasing*
blog defects; it does not hold for this subtask, whose point is that the blog
should not need a fourth implementation later. Route it through the same resolver
and its links become correct as a consequence rather than as a project.
