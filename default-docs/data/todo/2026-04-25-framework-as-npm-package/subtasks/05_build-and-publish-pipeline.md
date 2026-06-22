---
title: "Build + publish pipeline — npm publishing, dist shape, semver policy"
state: open
---

Wire up the publishing infrastructure once subtasks 01-04 have settled the package shape.

## Build setup

The package needs a build step. Today the source runs directly under bun/node. As a published package:

- TypeScript → JavaScript (or ship `.ts` and rely on consumer's TS — risky for multi-runtime support)
- Astro components (`.astro` files) — these ship as-is; Astro recognises them
- CSS files — ship as-is, Astro's bundler handles them in the consumer
- Shell scripts under `.claude/skills/` — N/A (those go via the agent-skill plugin, not this package)

Recommended toolchain: **`tsc` for `.ts` → `.js`** (lean, no bundler needed); leave `.astro` and `.css` alone.

`dist/` shape mirrors `src/`:

```
dist/
├── integration.js         ← the entry point (compiled from src/integration.ts)
├── loaders/
├── parsers/
├── layouts/               ← .astro files copied as-is
├── styles/                ← .css + theme.yaml copied as-is
├── custom-tags/
└── pages/
    └── [...slug].astro
```

## `package.json` essentials

```json
{
  "name": "<decided in subtask 01>",
  "version": "0.1.0",
  "type": "module",
  "files": ["dist/", "README.md", "LICENSE"],
  "exports": {
    "./integration": "./dist/integration.js",
    "./layouts/*": "./dist/layouts/*",
    "./loaders": "./dist/loaders/index.js",
    "./parsers": "./dist/parsers/index.js"
  },
  "peerDependencies": {
    "astro": "^X.Y.Z"
  },
  "dependencies": {
    "yjs": "...",
    "gray-matter": "...",
    "...": "..."
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json && cp -r src/layouts src/styles src/pages dist/",
    "prepublishOnly": "bun run build"
  }
}
```

## Semver policy

With ~30 consumers, breaking changes hurt — but we're at v0, so carve out room:

- **0.x** — breaking changes allowed, document in CHANGELOG; bump minor for breakage
- **1.0.0** — first stable; from there, semver strictly: major for breakage, minor for additions, patch for fixes
- Don't ship 1.0.0 until at least 3 consumers have upgraded through a real release cycle

## Publish flow

- npm account / scope decided (subtask 01)
- `bun publish` (or `npm publish` — bun's publish has caveats; npm is the safer default for first publish)
- CHANGELOG.md — keep it terse, one line per change, link to the issue/PR
- Tag releases in git (`v0.1.0`)
- Consider a GitHub Action for "on tag push, build + publish" — nice-to-have, not blocking

## Acceptance

- `bun run build` produces a working `dist/` that another project can `bun add file:../documentation-template` and use
- `package.json` `exports` resolve correctly when the package is in `node_modules`
- A dry-run `npm publish --dry-run` lists exactly the files we want shipped (no source `.ts`, no `__test_fixtures__`, no docs source)
- CHANGELOG seeded for v0.1.0
- Publish credentials documented (in `.env.example` or a README "Publishing" section)

## Out of scope

- Automated CI/CD beyond `prepublishOnly` — manual publish is fine for v0.1
- npm-side analytics (download counts, etc.) — observe later
