---
title: "Gotchas"
---

# Gotchas

A **root-level topic file** — tier 1, which is where most issues stop. These move
into `knowledge/` only when there are enough that the listing stops being
readable.

- **The build output is `astro-doc-code/dist/`, not `dist/`.** Looking at the
  root reports "no such directory" over a successful build, which reads as a
  failure.
- **`astro check` is not installed.** `./start build` is the gate; adding the
  checker is a dependency decision, not a convenience.
- **The sidebar's depth constant is not the loader's.** They agree today. Nothing
  makes them agree tomorrow.
