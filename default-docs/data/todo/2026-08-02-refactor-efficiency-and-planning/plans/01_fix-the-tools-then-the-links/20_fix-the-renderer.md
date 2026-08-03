---
title: "Fix the renderer"
outcome: "A relative link written against the file's own directory resolves in the built site, proven over HTTP"
who: claude
status: open
subtasks:
  - "[The renderer drops a URL level](../../subtasks/100_link-integrity/010_renderer-drops-a-url-level.md)"
---

## Todo

- [ ] Land the fix in
      `astro-doc-code/src/parsers/postprocessors/internal-links.ts`, with index
      pages exempted — `generateSlug` collapses a trailing `/index`, so they are
      already at the right depth
- [ ] **Control-test both directions over real HTTP**: the link resolves with the
      fix, and reverting the fix makes it 404 again. Against a served `dist/`,
      not by reasoning about paths
- [ ] **Zero content files changed in this stage.** If a content edit looks
      necessary, the diagnosis is wrong again — stop and say so

**The whole group descends from this and it is three lines.** The renderer emits
the `./` prefix unchanged while each page builds one directory deeper than its
source file, so the link resolves inside the page rather than beside it.

**The last-resort check that would have prevented everything:** trace one link
end to end — source, transform, built file, HTTP response. It costs one request.
Do it before and after, and put both in the record.
