---
title: "Why migrate, and what the prior audit said"
---

The case for this migration is **distribution and one shared core**, not raw speed. The prior audit of the Go version found Astro already fast in dev, and its advice not to rewrite was carried out: the Astro 7 upgrade fixed the stated trigger and all ten defects the audit found. What still argues for a move is footprint (a framework folder and `node_modules` in every project) and the rules duplicated between the TypeScript engine and the Rust CLI. This migration must win on those, and must answer the audit's estimate of 6–12 months.

# 03 References

- [Feasibility audit summary](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/01_summary.md) — the Go rewrite, eleven agents, verdict "technically sound and currently unjustified".
- [Audit handover](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/03_debrief/01_handover.md) — the ten defects it found, all since fixed.
- [2026-08-07-astro-7-and-load-time-refactor](../../../2026-08-07-astro-7-and-load-time-refactor/issue.md) — where the audit's advice was carried out: the Astro 7 upgrade, the trigger fix and the ten defects.
- [The structure / layout / theme / shell model](../../../2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md) — proposed there as the backbone for a rewrite.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): explore the migration in Rust rather than Go, because the CLI is already Rust and the core can then be shared.

# 05 Notes & Analysis

## 01 The user's reasons

- The codebase keeps growing, and its size has to be accounted for.
- One engine install for many projects. A user with ten agent-ks projects should have one engine, not ten.
- The engine can grow larger, and ship many preconfigured artifacts, because it is installed once.
- A better file watcher.
- Room for heavier features, like narration audio for video pages.

## 02 Reasons added in discussion

- **One core instead of two copies.** The Rust CLI already re-implements engine rules: frontmatter, links, issue parsing and validation. Two implementations drift apart. A Rust engine that the CLI and the server both use removes the second copy, and the frontend receives results rather than rules, so no third copy appears in the browser. This is the strongest argument, stronger than speed.
- The old issue's own framework ranking put Rust + Vite second, "only if Rust also owns the editor backend (shared crates)". That condition is exactly this shared-core argument.

## 03 What the prior audit found, and what changed since

| Finding (on the pre-Astro-7 engine) | Now |
|---|---|
| Performance case does not survive measurement. Dev first byte 6–9 ms, re-render ~1.4 ms per file | Still true. Do not sell this migration on speed |
| Footprint: 419 MB `node_modules`, 874 MB RSS after 24 minutes, 6.1 MB gzipped `dist/` | Astro 7 added about 106 MB of disk; serving theme CSS once cut `dist/` by 62.8 MB. The 874 MB memory figure was never re-measured on Astro 7, so treat it as unverified. Re-measure before quoting any of these |
| Cost 6–12 months for one person | Must be answered by phasing, not ignored. See [phasing](./15_phasing.md) |
| No feature lost outright. Six things get harder: Shiki fidelity, the dev-toolbar host, external layouts, scoped CSS, the server-side CRDT, ~11,000 lines of docs | External layouts are now dropped by decision ([layouts](./11_layouts.md)). The CRDT risk now favours Rust: the audit rejected the Rust `y-crdt` library only because Go would need cgo to call it, while in Rust `yrs` is native. Shiki, the toolbar, scoped CSS and the docs stay open |
| JIT rendering works: 1.83 ms p50 uncached | Input to [open questions](./16_open-questions.md) 06 and 07 |
| A B-tree cache is the wrong tool; persist only the git-derived dates | Input to [the build cache](./07_agentks-home-and-build-cache.md) |
| The stated trigger (a Vite SSR stale-cache bug) had a one-day fix | Fixed in the Astro 7 issue. Not a reason any more |
| Ten defects in the live code | All ten fixed in the Astro 7 issue. One gap outside the ten remains: there is no typecheck script (27 TypeScript errors today) |

## 04 Losses the audit named that this issue must carry

From the audit's [case against](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/024_question_case-against.md), sections 4–5:

- **The `.html` MIME boundary.** Which files the server serves as HTML is a security decision. Today it is expressed by what is absent from a map.
- **Editor save echo suppression.** The editor must not reload a file it just saved.
- **`issue-status` in two languages.** A Rust core plus a TypeScript frontend brings the second copy back. See [open questions](./16_open-questions.md) 10.
- **Preview versus published fidelity.** The dev view and the built site must render the same.
- **Every 0.x format.** Restarting at 1.0.0 leaves every existing project below the version floor. Forced migrations answer this only if `agentks migrate` covers every 0.x format ([versioning](./12_versioning-and-forced-migrations.md)).

## 05 Carried over from the Go issue

Still valid and worth reading when the relevant phase starts:

| File | Why |
|---|---|
| [JIT rendering](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/021_question_jit-rendering.md) | A hybrid design: a structural index built at start-up, page bodies rendered on request, and a static export through the same handler checked by a golden diff |
| [The B-tree cache question](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/022_question_btree-cache.md) | Persist only the git dates. Also the WSL mtime and write-then-rename hazards a `notify` watcher must handle |
| [Theme and CSS parity](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/023_question_theme-css-parity.md) | The plan for rewriting scoped CSS |
| The per-surface inventories, [010](../../../2026-05-08-runtime-stack-migration/agent-log/010_au_migration-feasibility-rescope/02_working/010_surface-inventory.md) to 017 in the same folder | Porting checklists. Language-neutral apart from the Go library picks |
| [The structure model](../../../2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md) and [known pipeline issues](../../../2026-05-08-runtime-stack-migration/notes/architecture-update/02_known-issues-content-pipeline.md) | One pipeline and one URL registry. Its external-layout option is now contradicted |
| [Docker design](../../../2026-05-08-runtime-stack-migration/notes/deployment-methods/02_docker-design.md) | Docker set-ups, `base_url`, static build behind nginx |
| [Backend-side cache isolation](../../../2026-05-08-runtime-stack-migration/brainstorm/05_idea_backend-side-cache-isolation.md) | Maps onto the per-project cache in `~/.agentks/` |
| [Tauri + Rust core](../../../2026-05-08-runtime-stack-migration/brainstorm/02_idea_editor-as-standalone-product/02_explore_tauri-rust-core.md) | The "one core, three surfaces" idea with `yrs` |
| [Auth and access control](../../../2026-05-08-runtime-stack-migration/brainstorm/02_idea_editor-as-standalone-product/03_discuss_auth-and-access-control.md) | Input for the later auth phase |

The rest of the Go issue is Go-specific, contradicted by this issue's decisions (user layout overlays, `doc-engine.toml`, a compatibility window instead of forced migrations), or history.
