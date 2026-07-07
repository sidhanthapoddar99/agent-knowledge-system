---
title: "Summary — extensions run (complete)"
---

## What ran

Workflow `wf_814bc80a-d39` (2026-07-08): 4 Opus agents, ~820k tokens, ~67 min.
Plus two direct main-session changes alongside: the initial-load theme desync
fix in `scripts/artifacts.ts` (attribute-only `currentTheme()`, OS fallback
removed) and the full-width artifact view in `SubDocLayout.astro` +
`detail.css` (TOC rail hidden for artifact docs, embed claims the column).

## Subtask 80 — tracker rendering (at review)

Loader-only: `issues.ts readFreeformDocs` gates `.html` to `notes/` and
`brainstorm/`, emits the shared `artifactContainerHtml()`; new
`IssueNote.docType` drives an embed-glyph marker in `SubdocTree`; `NotePage`
shows real filenames (also fixed the pre-existing diagram mislabel);
`isTrackedDocFile` counts `.html` + sidecars for the cache signature. Theme
handshake, open-full-page, and expand ride the global artifact renderer —
zero new issues-layout JS. doc-issues skill + guide.ts + both docs sides
updated, cache parity kept.

## Subtask 90 — site-theme mode (at review)

`artifact.theme: "site" | "self"` (default self) read by the route;
`site` mode injects `getThemeCSS(getTheme())` + an attribute-only dark-init
at the START of `<head>` (robust against a literal `</head>` in code samples
— a bug that actually fired in testing; theme-first so artifact rules win the
cascade); site-variant ETag is a content hash (theme swaps bust caches
despite unchanged mtimes); `self` stays byte-identical (verified by diff).
New `docs-guide theme tokens [name] [--json]` verb resolves the full
inheritance chain, passes the 98-test plugin self-test. Skill carries the
mode-choice doctrine + inline variable contract; CLAUDE.md carries the
coupling note; live site-mode demo `11_site-theme-demo.html` on the showcase.

## Verification

E2e verifier: 1 minor finding (same-basename supporting docs could silently
shadow each other's route in the tracker) — fixed with an additive
`console.warn` collision guard in `readFreeformDocs`. Both features
screenshot-verified in both themes, including the initial-load-in-light-mode
check specifically.

## State

Subtasks 10–90 all at `review`. Next: subtask 95 — independent Fable review
of the skills layer.
