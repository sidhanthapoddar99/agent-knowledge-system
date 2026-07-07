---
title: "Site-theme mode — host-theme injection for artifacts + theme-tokens CLI"
status: review
---

Scope extension accepted by sidhantha (2026-07-07). Full deliberation and the
accepted decision package:
[../brainstorm/03_discuss_site-theme-mode.md](../brainstorm/03_discuss_site-theme-mode.md).
In short: artifacts that represent data should be able to *inherit the host
site's theme* instead of inventing their own, keyed by the sidecar; artifacts
that deliberately own their world (theme guides, foreign brands) opt out and
are served untouched.

## Tasks

- [x] **Sidecar contract** — `artifact.theme` accepts `"site" | "self"`
      (default `"self"`; the fixture's legacy `"self-world"` value reads as
      `"self"`). Document the field where the sidecar schema lives in code.
      *Done:* `loaders/artifact-pages.ts` — `ArtifactThemeMode`,
      `normalizeArtifactThemeMode()`, `readArtifactThemeMode()` (route-facing
      reader of `artifact.theme` inside the opaque `artifact:` block), documented
      on the `ArtifactMeta.artifact` field + the header.
- [x] **Route injection** — the `/artifacts/[...path]` route, when the
      artifact's sidecar declares `theme: "site"`, rewrites the served HTML to
      include the ACTIVE resolved theme CSS (`getThemeCSS(getTheme())`), so both
      the embed and the full-page view inherit it; `theme: "self"` (or no
      sidecar) serves byte-untouched HTML as today. **Note:** the injection point
      is the *start of `<head>`* rather than before `</head>` — robust against a
      literal `</head>` inside the artifact's own content (a code sample) and
      theme-first so the artifact's own rules still win the cascade. **The
      subtask-20 e2e contract (served body byte-identical to disk) now applies to
      `self` mode only** — `site` mode is a deliberate rewrite. Cache: the
      site-mode variant ETag is a sha1 content-hash of the injected body, so it
      varies with the file, the active theme (mtime unchanged on a theme swap),
      and a `self`↔`site` sidecar flip; paired with the `?v=` handshake this busts
      embed + full-page copies. *Verified live:* theme swap in `site.yaml` busts
      the ETag and re-injects the new theme's CSS; revert restores the original.
- [x] **Light/dark** — injected artifacts follow the existing `data-theme`
      propagation in the embed; the full-page view honors `prefers-color-scheme`
      and the propagated attribute via an injected attribute-only init script
      mirroring `BaseLayout` (localStorage → prefers-color-scheme → stamp
      `data-theme="dark"` only for dark), consistent with the docs chrome.
- [x] **`docs-guide theme tokens` CLI verb** — new `theme` group verb in the
      plugin toolkit: resolves the active theme (site.yaml name →
      `theme_paths` scan → `extends` inheritance → CSS merge) and prints the
      variable→value map for light and dark; `--json` for agents; uniform
      contract (`--help`, exit codes). Wire into `docs-guide help` discovery.
      *Done:* `scripts/theme/tokens.mjs` + manifest entry + selftest wiring;
      resolves `var()` chains; `docs-guide theme tokens [name] [--json]`; passes
      the self-test (98/98) and lists under a THEME group in `help`.
- [x] **Authoring skill** — `artifact-authoring` (repo source + installed
      cache, byte-identical): a section teaching the two modes with the
      **mode-choice doctrine** (brainstorm 03): data representation /
      explaining the docs → `site`; UI/UX deliberation (theme, design system,
      interface design) → **always `self` with the theme written inside the
      HTML — even when the target application's theme is similar or identical
      to the engine's current theme** (the artifact's theme IS the content
      under discussion; it must stay portable and independent). In `site` mode
      consume the token contract and define nothing; carry the minimal neutral
      fallback layer for out-of-engine opens (and why that doesn't violate the
      layouts no-fallback rule); use `docs-guide theme tokens --json` for real
      values (e.g. palette validation against actual surfaces).
- [x] **Inline variable contract in the skill** — the skill enumerates the
      engine's theme variable vocabulary in its own text (the
      `required_variables` names: color/font/spacing/radius/shadow/transition
      + semantic tokens), so agents can consume them in `site` mode, override
      injected CSS from `self` mode when needed, and — decisively — still have
      the vocabulary if the plugin is ever distributed standalone with no
      theme CSS on disk to read. The CLI verb supplies live values; the inline
      list supplies the names unconditionally.
- [x] **CLAUDE.md coupling note** — add to this repo's CLAUDE.md (theming
      section): the artifact-authoring skill carries an inline copy of the
      theme variable contract; any change to `theme.yaml → required_variables`
      (add/rename/remove) must update that skill section (repo + cache) in the
      same change. *Done:* coupling paragraph under the theme-variable-contract
      cheat-sheet.
- [x] **Documentation** — user-guide artifact pages: the `theme` sidecar
      field, both modes + the mode-choice doctrine, a live `site`-mode example
      if feasible; dev-docs: the injection mechanism, cache interplay, the CLI
      verb, and the skill↔theme coupling. Current system only, history-free.
      *Done:* user-guide `08_artifact-pages.md` (two-mode "Theme" section),
      `09_artifact-showcase.md` (two-mode showcase), new live `site` example
      `11_site-theme-demo.html` + sidecar; dev-docs `05_architecture/02_routing.md`
      (injection + cache) and `15_scripts/12_artifacts.md` (route-side injection,
      attribute-only handshake fix, CLI verb + coupling).
- [x] **Verify** — a `site`-mode test artifact renders with the host theme in
      embed AND full-page views, in both modes, and re-themes when
      `site.yaml`'s theme changes (cache busted); a `self`-mode artifact is
      byte-identical to disk when served; CLI verb outputs sane JSON for the
      default and one user theme. *Verified live* (dev server, headless CDP
      screenshots): `site` demo inherits the theme in embed + full-page, light
      + dark; ETag busts on a `full-width`→`minimal` swap and reverts;
      design-system (`self`) served byte-identical; `theme tokens --json` sane
      for default + minimal. Production build deferred to the issue verifier (a
      sibling agent shares the tree).
