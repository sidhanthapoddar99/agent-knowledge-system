---
title: "Create the three NeuraLabsHQ repositories: first commit, README, licence, settings"
status: open
---

The three repositories were created on GitHub on 2026-09-30 as private, empty repositories with `origin` set in their local folders. Nothing is committed yet. This leaf gives each one a first commit that says what the repository is, a licence, a protected default branch and sensible settings, so the skeleton leaves ([20](./20_main-repo-skeleton.md), [70](./70_library-repo-skeleton.md), [80](./80_marketplace-repo-skeleton.md)) start from a real history.

# 01 To Do
- [ ] **First commit in each repository, on `main`.**
    - [ ] `README.md`: one paragraph on what the repository is, a line saying it is under active development as the successor of `sidhanthapoddar99/agent-knowledge-system`, and where the docs will live (agentks.neuralabs.org, not yet live).
    - [ ] `LICENSE`: MIT, copyright "2026 NeuraLabs" — the same licence as today's repository ([LICENSE](../../../../../../LICENSE)). The library and marketplace take MIT too.
    - [ ] `.gitignore` for the repository's ecosystems (the main one: Rust `target/`, `node_modules/`, `dist/`, `data/**` except its `.gitignore`, `logs/**` likewise, `.env`).
    - [ ] Push: `git push -u origin main`.
- [ ] **Repository settings, through `gh`.**
    - [ ] Default branch `main`; description and topics (`documentation`, `knowledge-management`, `ai-agents`, `rust`).
    - [ ] Merge settings: squash and rebase allowed, merge commits off, delete branch on merge.
    - [ ] Keep all three **private** until the launch plan's hosting and archival stages ([200/00 launch](../200_launch/00_overview.md)) flip them public.
    - [ ] Branch protection on `main` of the main repository once CI exists ([50](./50_ci-workflows.md)): require the gate check. Private repositories on a free plan may not support protection rules; if `gh api` refuses, record that in `AGENTS.md` and rely on the gate in CI.
- [ ] **Deprecation pointers are not added here.** The notice in today's repository and its archival belong to [200/00 launch](../200_launch/00_overview.md); this leaf only makes the new repositories exist.

## Guardrails
- Claude may commit, push and change settings in these three repositories ([permissions](../../agent-memory/permissions-and-repositories.md)).
- Do not change visibility to public. That is a launch step.
- Do not touch today's repository (`sidhanthapoddar99/agent-knowledge-system`) or the personal marketplace.

## Done when
- `gh repo view NeuraLabsHQ/<name> --json defaultBranchRef,visibility,description` shows `main`, `PRIVATE` and the description, for all three.
- `git -C <local folder> log --oneline origin/main` shows the first commit in all three.
- Each repository has `README.md` and `LICENSE` on `main`.

# 02 Status and Result
Open. The repositories exist since 2026-09-30 (private, empty, `origin` set, local branch `main`, no commits).

## Result
None yet.

## Agent log
none

# 03 References
- **Where:** `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`, `/home/sid/projects/06_02_NeuraLabs/neuralabs-plugin-marketplace`.
- **Read first:** [permissions and repositories](../../agent-memory/permissions-and-repositories.md); [05/01 Repositories and layout](../../notes/05_delivery/01_repositories-and-layout.md) sections 01 and 06; [05/07 Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md) for when visibility changes.
- **Unblocks:** [20](./20_main-repo-skeleton.md), [70](./70_library-repo-skeleton.md), [80](./80_marketplace-repo-skeleton.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the three repositories are private in NeuraLabsHQ, and Claude owns them until the migration completes.
- Decided (claude, 2026-09-30): the marketplace repository is named `neuralabs-plugin-marketplace`, after its local folder and the org's `neuralabs-*` names.
- Decided (claude, 2026-09-30): MIT for all three, matching today's repository.

# 05 Notes & Analysis
## Watch out
- `gh` is signed in as `sidhanthapoddar99` with `repo` and `read:org` scopes; git pushes over SSH.
- The binary will build in these repositories' addresses ([05/01](../../notes/05_delivery/01_repositories-and-layout.md) section 06). Never rename them after the first release.
