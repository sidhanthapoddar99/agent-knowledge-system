---
title: "Fix the renderer"
outcome: "A relative link written against the file's own directory resolves in the built site, proven over HTTP"
who: claude
status: done
subtasks:
  - "[The renderer drops a URL level](../../subtasks/100_link-integrity/010_renderer-drops-a-url-level.md)"
---

## Todo

- [x] Land the fix in
      `astro-doc-code/src/parsers/postprocessors/internal-links.ts`, with index
      pages exempted
- [x] **Control-test both directions over real HTTP** — 418 broken with the shift
      disabled, 55 with it enabled, same tree and same 15,589 links. The page
      itself `301`s to a trailing slash, which is the mechanism made visible
- [x] **Zero content files changed** — confirmed by `git status` over
      `user-guide/` and `blog/`
- [x] The 55 survivors filed as
      [their own subtask](../../subtasks/100_link-integrity/100_links-whose-target-does-not-exist.md)
      — real content defects, hidden until now inside the larger one. Scheduled
      in stage 30, where content edits get the batch-and-check discipline

**The whole group descends from this and it is three lines.** The renderer emits
the `./` prefix unchanged while each page builds one directory deeper than its
source file, so the link resolves inside the page rather than beside it.

**The last-resort check that would have prevented everything:** trace one link
end to end — source, transform, built file, HTTP response. It costs one request.
Do it before and after, and put both in the record.
