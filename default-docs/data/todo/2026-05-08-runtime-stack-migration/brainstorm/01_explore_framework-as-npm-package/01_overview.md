---
title: "Explore — framework as a published npm/bun package"
---

> **Resolved →** superseded — the distribute-as-npm-package branch lost; deliberation converged on this issue's Go single-binary runtime (see `notes/architecture/` and `notes/deployment-methods/`).

# Framework as a published npm/bun package

This thread migrates the cancelled issue **`2026-04-25-framework-as-npm-package`** into the
runtime-stack-migration deliberation, where it belongs: it was one *branch* of the larger
"how should we distribute and run the framework?" question, and it lost. It's preserved here
as the record of *why* — the option was weighed seriously, made real progress (one comment's
worth of foundational restructuring), and was then out-competed.

## What was proposed

Distribute the Astro framework as an **installable npm/bun package** rather than a
full-clone-per-project. Each of the ~20-30 consumer docs sites would shrink to a thin shell:

```
my-docs/
├── package.json          ← one dep: "agent-knowledge-system": "^1.0.0"
├── astro.config.mjs      ← 5 lines: import the integration, add to integrations
├── .env                  ← per-project secrets
└── dynamic_data/         ← content + config (the only genuinely unique part)
```

Framework updates would become `bun update agent-knowledge-system` per project instead of
"pull the new template into every repo, resolve conflicts, reinstall." 30 clones → one engine
source of truth. This is the end-state every comparable framework lands on — Starlight,
Docusaurus, VuePress, Nextra all ship the engine as a package.

## When

Original issue dated **2026-04-25**, `priority: medium`, components `infra / loaders /
integrations`. Six subtasks filed (boundary, path/config externalization, Astro integration,
dev-tools split, publish pipeline, migration playbook). One comment (2026-04-26) landed real
foundational work before the direction flipped.

## Why it was attractive

- **Scaling pain was real and present** — full-clone-per-project updates were already the pain
  point across 30 instances, not a hypothetical.
- **Well-trodden path** — every peer framework ships as a package; the boundary-design
  questions had known-good reference answers.
- **Incremental** — the very first restructuring step (splitting framework code from user
  content into `astro-doc-code/`) was independently valuable and shipped immediately. See
  comment `001_framework-extraction-step1` on the source issue: `./start` wrapper +
  `frameworkRoot` / `projectRoot` split in `paths.ts`, build green at 326 pages. That split
  survived the direction change and is still in the tree today.

## Why it lost / was superseded

The npm-package *distribution mechanism* was rejected on 2026-04-26 (source comment
`002_superseded-by-cli-tool`) in favour of distributing the framework as a **standalone CLI
tool** — first as a Go binary wrapping Astro+Bun (`2026-04-26-framework-as-cli-tool`), and
then, in *this* issue, the binary stopped *wrapping* the framework and **became** it: a Go
HTTP server embedding a Vite-built bundle, shipped as one cross-compiled ~25-35 MB binary.

The deciding argument: npm-package distribution still leaves every consumer carrying Node +
`node_modules/` (~250 MB) and inherits Vite's dev/prod divergence — including the SSR
module-isolation bug class that directly triggered this migration
(`brainstorm/04_discuss_stack-and-migration/05_issue.md`). A single self-contained binary makes the whole "did the
install run cleanly / which Node version" failure surface disappear:

| Dimension | npm-package branch | Go single-binary (what won) |
|---|---|---|
| Consumer runtime deps | Node + `node_modules/` (~250 MB) | none — one ~25-35 MB binary |
| Update mechanism | `bun update` per project | `doc-engine upgrade` (self-update) |
| Dev/prod parity | inherits Vite SSR divergence | what you build is what you ship |
| The triggering bug | still possible | impossible (single module graph) |
| Cross-platform ship | per-runtime, npm-mediated | `goreleaser` 5-target cross-compile |

## What carried forward vs dropped

The mechanism died; several *architectural* questions did not. The source comment 002 flagged
exactly which subtasks transfer — that trail is distilled across the sibling files here and,
where it graduated into committed design, into `notes/architecture/` and
`notes/deployment-methods/`:

- **Fully transferable** — framework/content boundary (already shipped as the
  `astro-doc-code/` split), path/config externalization, dev-tools split decision. See
  `02_package-boundary.md` and `03_path-config-and-integration.md`.
- **Reframed** — package-boundary and integration thinking became "what's in the binary /
  embedded `dist/` vs the user's `default-docs/` folder."
- **Dropped** — npm publish pipeline (`tsc` → `dist/`, `exports` map, semver-for-30-consumers)
  replaced by Go binary distribution + `curl | sh` installer + git-tag release manifest. See
  `04_publish-pipeline-and-migration.md` for why the whole publish design was obsoleted.

## Related

- Source issue: `2026-04-25-framework-as-npm-package` (cancelled; kept intact as audit trail).
- `2026-04-26-framework-as-cli-tool` — the intermediate direction that beat npm-package.
- This issue's `notes/architecture/04_distribution-single-binary.md` — where the winning
  distribution mechanics live.
