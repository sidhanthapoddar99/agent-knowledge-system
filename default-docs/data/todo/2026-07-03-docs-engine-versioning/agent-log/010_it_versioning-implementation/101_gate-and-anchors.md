---
title: "Version gate live in the engine"
iteration: 1
agent: claude-fable-5
status: success
date: 2026-07-03
---

# Version gate live in the engine

## Goal

Subtask 20 — the engine refuses content outside its supported range.

## Approach

- New `src/loaders/engine-version.ts`: `ENGINE_VERSION`/`MIN_CONTENT_VERSION`
  (both `0.7.0` — the project's own lifecycle version; `package.json`'s `1.0.0`
  is a placeholder), major.minor-only comparator, gate with AI-actionable
  messages in both directions.
- Gate wired into `loadSiteConfig()` (`config.ts`) before any resolution work —
  the same hard-throw path as the theme-required rule; also runs from the dev
  toolbar integration's setup hook, i.e. before the server binds a port.
- `engine_version: "0.7.0"` declared in dogfood `site.yaml` + the `/docs-init`
  template's `site.yaml`.

## Result

- Build green with declaration (701 pages at that point).
- Too-old (`0.5.0`) and too-new (`0.9.0`) both produce the designed hard-stop
  messages, verified against real builds.
- **Does-not-start proof** (user asked explicitly): with `engine_version`
  removed, `bun run dev` exited code 1 naming `0.0.0` — zero `localhost` lines
  in the log; the server never began listening.

## Next

Root-owned migrations (#2).
