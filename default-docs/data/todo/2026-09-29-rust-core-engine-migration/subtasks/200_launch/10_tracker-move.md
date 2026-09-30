---
title: "Move the active tracker into the new repository's docs/"
status: open
---

The tracker lives in this repository today (`default-docs/data/todo/`) and depends on today's engine to be viewed. Once the new engine and client render it correctly, its active issues move into the new repository's `docs/data/todo/`, and the copies become the only live tracker. After the move, tracker work (including this migration issue) happens in `NeuraLabsHQ/agent-knowledge-system`, where Claude commits freely. Closed issues stay behind in this repository as history.

# 01 To Do
- [ ] **Check the gate for moving.** The parity run ([170/20](../170_testing/20_route-and-content-parity.md)) shows no unexplained difference on tracker pages: the issues index, every issue's detail page, sub-docs, plans, agent logs. sidhantha has used the new engine on the tracker for at least a few days.
- [ ] **Close absorbed issues first** ([50](./50_close-absorbed-issues.md)), so they stay behind as closed history instead of moving.
- [ ] **List what moves.** Active issues (every status outside the Closed category), with `agent-ks issue list --json` in this repository. Record the list in Result.
- [ ] **Copy** each active issue folder, with the tracker's root `settings.json` (vocabulary), into `docs/data/todo/` of the new repository, keeping folder names so links between moved issues still resolve. Register the section in `docs/config/site.yaml`.
- [ ] **Fix links that leave the tracker.** A moved issue's links to closed issues, to this repository's code (`agent-ks-engine/…`, `scripts/…`), and to today's docs no longer resolve in the new repository:
    - [ ] Rewrite each to an external GitHub permalink on `sidhanthapoddar99/agent-knowledge-system` at a pinned commit (the last commit before the move), with a script that uses the link checker's findings. Keep the link text.
    - [ ] Links between moved issues stay relative and untouched.
- [ ] **Run the checks in the new repository**: `agentks check issues` and `agentks check link-form` report no errors on `docs/data/todo/`.
- [ ] **Leave a pointer behind.** In this repository, add a comment to each moved issue saying it moved and linking to its new home on GitHub, and a note at the top of the tracker's section index. Claude writes these files; **sidhantha commits them**.
- [ ] **Update agent memory** of this issue in its new home: the tracker is now in the new repository; the old copy is read-only.
- [ ] **Commit and push** in the new repository (Claude).

## Guardrails
- Claude does not commit in this repository. The pointer comments are edits for sidhantha to commit.
- Never move a closed issue; history stays where it was written.
- Folder names do not change in the move.
- After the move, nobody edits the old copy of a moved issue. The pointer comment says so.

## Done when
- `docs/data/todo/` in the new repository holds every active issue, renders with the new engine, and passes `agentks check issues` and `agentks check link-form`.
- Every moved issue in this repository carries a pointer comment (committed by sidhantha).
- This migration issue is being worked from its new home.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repositories:** from this repository's `default-docs/data/todo/` to `NeuraLabsHQ/agent-knowledge-system`'s `docs/data/todo/` (local `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`).
- **Read first:**
  - [Repositories and layout](../../notes/05_delivery/01_repositories-and-layout.md), section 05 — when, what and after.
  - [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md), section 02.
  - The tracker skill for folder anatomy and the `agentks move` behaviour.
- **Depends on:** [170/20 route and content parity](../170_testing/20_route-and-content-parity.md) (tracker pages), [100/25 issues layouts](../100_layouts/25_issues-layouts.md), [070/20 content commands port](../070_cli/20_content-commands-port.md), [200/50 close absorbed issues](./50_close-absorbed-issues.md).
- **Unblocks:** all later tracker work in the new repository.

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the tracker moves into `docs/` of the new repository once the Rust engine and the client work ([docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md)).
- Decided (claude, 2026-09-30): links from moved issues to things that stay behind become GitHub permalinks at a pinned commit, so they keep pointing at the exact text they cited.

# 05 Notes & Analysis

## Watch out
- Git-derived `updated` dates come from each repository's history. In the new repository every moved issue starts with the move commit's date until it is edited. Say so in the move's commit message; do not fake history.
- The `agent-log/` folders of active issues can be large. Move them whole; a log split across two repositories cannot be followed.
