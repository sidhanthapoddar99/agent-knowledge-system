---
title: "An inlined file is a dependency — [[path]] embeds go stale in dev"
---

# Overview

**`[[./assets/flow.mmd]]` inlines a file's bytes into a page, and nothing
records that the page now depends on that file.** So when the file changes,
neither loader has any reason to reparse the page — and the dev server goes on
serving HTML built from the old bytes.

The failure is worse than "no hot reload". A manual reload does not fix it
either: the content is stale until the dev server restarts, and **nothing on
the page says so.** You edit a diagram, refresh, see the old picture, and
conclude your edit was wrong.

Found while checking whether diagram files hot-reload. They do — all four
formats, embedded and as first-class pages. This is the one path that does not,
and it is not diagram-specific: it is every `[[path]]` embed, of any file type.

# What was measured

Dev server running, page open, edit the embedded file, then request the page
from the server (browser removed from the picture):

| Case | Result |
|---|---|
| `[[../assets/embed-test.mmd]]` in a tracker note | **stale** — marker absent from served HTML on two consecutive requests |
| `[[../assets/upstream-integrity-manifest.json]]` in a tracker note | **stale** — same |
| *Control:* first-class `05_mermaid-full-page.mmd` page | correct — marker present immediately |

The control is what makes this a diagnosis rather than a guess. The same class
of edit, in the same tree, on the same dev server, updates for a first-class
diagram page and does not for an inlined one. So the fault is in the embed
path, not in the watcher and not in diagram rendering.

**Production builds are not affected.** A build starts with a cold cache and
parses every page from source, so published output is correct. This is a
dev-loop defect only — which is precisely what makes it dangerous, because the
dev loop is where changes get verified.

# Why it happens

`src/parsers/preprocessors/asset-embed.ts` reads the referenced file and splices
its content into the markdown before rendering. That read is invisible to
everything downstream: the page's own mtime never changes, and no record ties
the two files together.

Both loaders then miss it, for different reasons:

| Loader | Cache mechanism | Why it misses |
|---|---|---|
| `src/loaders/data.ts` (docs, blog) | explicit dependency list handed to `cacheManager.setCache` | the list is the globbed markdown plus `dependencyFiles` from the diagram/artifact scanners — an inlined file is in neither |
| `src/loaders/issues.ts` (tracker) | summed-mtime signature over a walked file set | the walk covers the section folders and `isTrackedDocFile` extensions; **`assets/` is never walked at all** |

The contrast with diagram pages is the whole lesson: `loadDiagramPages()`
returns `dependencyFiles`, so the cache knows a page depends on a file that is
not the page. The embed preprocessor performs the same kind of read and reports
nothing.

# The shape of the fix

**One fact, produced once, consumed by both caches.** The preprocessor is the
only code that knows which files it inlined, so it has to say so:

1. `ProcessContext` gains a sink the preprocessor writes absolute paths into.
2. `base-parser.ts` creates it per parse and returns the collected paths on
   `LoadedContent`.
3. `data.ts` folds them into the dependency list it already passes to
   `setCache`.
4. `issues.ts` folds their mtimes into its signature. It has to remember the
   set from the previous parse, because the signature is computed *before*
   parsing — that is sound: the first load establishes the set, and any later
   edit to a member busts the cache. Adding a *new* `[[…]]` changes the
   markdown's own mtime, so that case is covered by the existing walk.

What this must not become: a second file-watching mechanism, or a special case
for diagram extensions. The defect is extension-agnostic and the fix should be
too.

# Subtasks

- [subtasks/010 thread inlined files into both caches](./subtasks/010_embedded-files-as-cache-dependencies.md)
