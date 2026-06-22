---
iteration: 11
agent: claude-opus-4-8
status: success
date: 2026-06-23
---

Goal: Subtask 10 — bring list/show/search to docs and blog (the Category-2 gap). Approach: built _content.mjs shared core (listDocsPages, listBlogPosts, frontmatter parse, searchInFiles, and generic cmdList/cmdShow/cmdSearch honoring --json/--count/--case-sensitive); six thin 3-line scripts (docs/list|show|search, blog/list|show|search). Named the docs-content group 'doc' (singular, parallel to issue/blog) to avoid the 'docs docs list' stutter. Added 6 manifest entries + 6 flat shim pairs, AND created the model-B 'docs' dispatcher shim (forwards args verbatim, no basename prepend) so 'docs <group> <verb>' works from the shell. Result, verified: 'doc list' → 142 pages; 'docs-blog-list' & 'docs blog list' (via the docs shim) → posts newest-first; 'doc search theme' finds matches; --json valid. Harness 67/67 → 93/93 (22 commands). FINDING: a 'docs' binary already exists on this PATH (CUDA) → bare 'docs' can collide; flat docs-* aliases are collision-safe. Recorded as a close-out caveat (notes/subtask 16). Next: subtask 11 (unified find).
