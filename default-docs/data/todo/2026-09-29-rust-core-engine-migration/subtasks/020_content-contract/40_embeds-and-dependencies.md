---
title: "Embeds and dependencies — [[path]] inlining, and an embedded file is part of the page"
status: open
---

`[[./path]]` inserts another file's text into a page before markdown rendering. Today's engine did not record that dependency, so editing an embedded diagram left the page stale until a restart ([2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md), fixed for 0.x and in review). The lesson carries into the Rust engine as a rule: **a page's render hash includes the hash of every file it embeds.** This leaf implements the embed pass with today's exact syntax and makes the embedded-file list a first-class output of rendering.

# 01 To Do
- [ ] **The embed pass**, a pre-processing stage in `agentks-render` ([030/50](../030_rust-engine/50_markdown-pipeline.md)), with today's rules ([asset-embed.ts](../../../../../../agent-ks-engine/src/parsers/preprocessors/asset-embed.ts)):
    - [ ] `[[path]]` outside code: the path is relative to the containing file; the file's raw text replaces the token.
    - [ ] Inline code spans are protected: no embedding inside backticks.
    - [ ] Inside fenced blocks: only `./` and `../` paths embed; a path containing a space or a comma is left alone, so documentation examples survive. This is the common case for diagram source (`` ```mermaid `` holding `[[../assets/flow.mmd]]`).
    - [ ] `\[[path]]` renders as a literal `[[path]]`.
    - [ ] One level only: embed syntax inside an embedded file is not expanded.
    - [ ] A missing file, or a path escaping the project root, is a content error with file and line; the token stays visible with a broken marker.
    - [ ] Line numbers of later errors stay correct: keep a line map from output lines back to (source file, line), so an error inside embedded text names the embedded file.
- [ ] **The dependency record.** Rendering returns, beside the HTML, the list of embedded files with each one's content hash. The page's render hash = hash(page bytes, each embedded file's hash in order, the config fingerprint that shapes rendering, the engine version). ([040/10](../040_caching/10_cache-keys-and-dependencies.md) owns the key's exact form; this leaf produces its inputs.)
- [ ] **The reverse edge.** The site index keeps "which pages embed this file" ([030/40](../030_rust-engine/40_site-index.md)), so a change to an embedded file invalidates exactly those pages and the server pushes their new hashes ([050/30](../050_server/30_watcher-and-push.md)). A newly added `[[...]]` edits the page file itself, so it needs no special case.
- [ ] **Source spans for links.** Record which output span came from which embedded file, so [30](./30_links-and-urls.md) resolves links inside embedded markdown against the embedded file.
- [ ] **Tests:** the spec fixtures for every rule above; and the regression that found the 0.x bug — render a page embedding `[[../assets/x.mmd]]`, change `x.mmd`, and assert the page's render hash changes and the new content appears, with no restart. Include a non-diagram file (a JSON) to prove the fix is extension-agnostic.

## Guardrails
- No second file-watching mechanism and no special case for diagram extensions. The dependency is a fact the render discovers, reported by the one stage that knows it.
- Do not walk `assets/` folders to guess dependencies; that fixes one content type and costs a stat of every file on every request (the "what not to do" of [2026-08-07](../../../2026-08-07-content-embed-cache-dependencies/subtasks/010_embedded-files-as-cache-dependencies.md)).
- Library elements are never embedded in markdown. `[[...]]` takes a relative path only ([02/01](../../notes/02_engine/01_content-format.md)).

## Done when
- Every embed spec fixture renders as `expected.json` says.
- Editing an embedded file changes the render hash of every page that embeds it and of no other page (checked on a fixture with two embedding pages and one unrelated page).
- On the corpus, pages with embeds match the golden snapshot's text.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** the embed stage in `agentks-render`; the reverse edge in `agentks-index`.
- **Read first:** [2026-08-07-content-embed-cache-dependencies](../../../2026-08-07-content-embed-cache-dependencies/issue.md) and its [subtask 010](../../../2026-08-07-content-embed-cache-dependencies/subtasks/010_embedded-files-as-cache-dependencies.md); [02/01 Content format](../../notes/02_engine/01_content-format.md) section 07; [02/03 The Rust engine](../../notes/02_engine/03_rust-engine.md) sections 03 and 06; today's [asset-embed.ts](../../../../../../agent-ks-engine/src/parsers/preprocessors/asset-embed.ts) and [code-protect.ts](../../../../../../agent-ks-engine/src/parsers/preprocessors/code-protect.ts).
- **Depends on:** [10](./10_golden-fixtures.md), [030/50](../030_rust-engine/50_markdown-pipeline.md).
- **Unblocks:** [040/10 cache keys and dependencies](../040_caching/10_cache-keys-and-dependencies.md), [050/30 watcher and push](../050_server/30_watcher-and-push.md), [30](./30_links-and-urls.md) (source spans).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): `[[...]]` stays the embed syntax, relative to the file; no wiki links ([open question 13](../../brainstorm/01_initial-discussion/16_open-questions.md)).
- Decided (claude, 2026-09-30, from the 2026-08-07 lesson): a page's render hash includes its embedded files' hashes ([02/03](../../notes/02_engine/03_rust-engine.md)).

# 05 Notes & Analysis
## Watch out
- [2026-08-07](../../../2026-08-07-content-embed-cache-dependencies/issue.md) is in `review` for 0.x. It is not superseded by this leaf until sidhantha signs off its 0.x fix; this leaf carries the lesson, not that review.
