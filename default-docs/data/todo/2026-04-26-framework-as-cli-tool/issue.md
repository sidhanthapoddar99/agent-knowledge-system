## Goal

Ship the framework as a **standalone tool**, not as an npm package. End-state: a small Rust CLI installed by `curl … | sh`, a `docs.conf` per-project config (replacing the `.env` convention), and three symmetric ways to use it — CLI (the ideal), manual clone, Docker container.

This issue is the **umbrella**. The brainstorm that produced this direction lives in `brainstorm/01_discuss_distribution.md` — read that first; it captures the 3-method architecture, the convergence pattern that makes them symmetric, the Node/Bun reality the Rust CLI has to deal with, and the open design decisions.

## Relationship to existing issues

- **`2026-04-25-framework-as-npm-package`** — same problem (distribution), different solution (npm). The architectural refactors that issue documents (engine externalising paths/config, integration boundary, project-root-as-input) are still needed regardless. Cherry-pick those subtasks into here as they firm up; close out the npm-specific framing on that issue once the migration is complete.
- **`2025-06-25-deployment`** — about deploying *built sites* (HTML to Vercel/Netlify/GH Pages, Dockerfile for prod build, CI templates). Tangentially related to Method 3 (Docker) but distinct scope; that issue stays as-is and is consulted when the Docker method's base-image story gets designed.
- **`2026-04-26-editor-as-standalone-product`** — if the editor extraction also goes Rust, the CLI here and the editor's Rust core could share base crates. Decision deferred; both issues note the option.

## Subtasks

None yet — to be filed as design decisions in the agent-log get resolved. Likely shape:

- Decide `docs.conf` format (TOML vs YAML)
- Decide CLI language (Rust vs Go) — depends on shared-core question with the editor
- Decide Bun handling (require / bootstrap / bundle)
- Externalise `paths.ts` / `config.ts` so framework takes project root as input (cherry-pick from npm-package issue)
- Build minimum-viable Method 2 (manual mode) with `docs.conf` end-to-end
- Build minimum-viable Method 1 (CLI) on top of Method 2's foundation
- Build minimum-viable Method 3 (Docker) — base image + skill-generated Dockerfile

Order: discussion → Method 2 → Method 1 → Method 3.
