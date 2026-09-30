---
title: "Archive the old repository"
status: open
---

The last launch step. Once users have somewhere to go and the notice is in place, `sidhanthapoddar99/agent-knowledge-system` is archived on GitHub: read-only, with every release, tag and page still reachable. sidhantha does the archive itself, because it is their repository; Claude prepares the pre-archive checklist and verifies the result.

# 01 To Do
- [ ] **Claude: pre-archive checklist**, each line checked and recorded in Result:
    - [ ] The switch-over is done ([20](./20_switch-over.md)) and the deprecation notice is live ([30](./30_old-repo-deprecation-notice.md)).
    - [ ] The final 0.x release is published and marked Latest in the old repository, so the old updater and installer find the notice.
    - [ ] Every 0.x release and tag is still present; nothing is deleted.
    - [ ] Open pull requests in the old repository are closed with a comment pointing to the new one; open GitHub issues (if any) are closed or moved.
    - [ ] The tracker's active issues have moved ([10](./10_tracker-move.md)); every moved issue here has its pointer comment committed.
    - [ ] The `agent-ks` plugin no longer comes from the personal marketplace, or points at the new marketplace.
    - [ ] Scheduled workflows in the old repository are disabled, so they do not fail forever.
- [ ] **sidhantha: archive** with `gh repo archive sidhanthapoddar99/agent-knowledge-system` or the repository's settings page.
- [ ] **Claude: verify** after the archive:
    - [ ] `curl -fsSL https://github.com/sidhanthapoddar99/agent-knowledge-system/releases/latest/download/install.sh` still downloads.
    - [ ] A 0.x binary's `agent-ks update --check --json` still answers, and shows the notice.
    - [ ] A mise pin to a 0.x version still installs.
    - [ ] Record the results in Result.

## Guardrails
- The archive is sidhantha's action. Claude never archives, deletes or transfers this repository.
- Never delete releases, tags or branches before archiving.

## Done when
- The old repository shows as archived on GitHub, with the banner first on its page.
- The three post-archive checks pass.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `sidhanthapoddar99/agent-knowledge-system` (local `/home/sid/projects/02_OpenSource/04_knowledge_management/agent-knowledge-system`).
- **Read first:** [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md), section 05 (retiring this repository); [launch overview](./00_overview.md), note 01.
- **Depends on:** [200/20 switch-over](./20_switch-over.md), [200/30 deprecation notice](./30_old-repo-deprecation-notice.md), [200/10 tracker move](./10_tracker-move.md).
- **Unblocks:** closing this migration issue (sidhantha's call).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): this repository is archived after the new release is final; existing users get an option to update ([docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md)).
- Decided (sidhantha, 2026-09-30): sidhantha archives the old repository, since it is theirs.
- Decided (claude, 2026-09-30): the old repository is archived in place, not transferred, because `NeuraLabsHQ/agent-knowledge-system` already exists as the new repository ([launch overview](./00_overview.md)).

# 05 Notes & Analysis

## Watch out
- Archiving makes the repository read-only for everyone, including sidhantha. Anything that must still change (the README banner, the last release) must land before the archive; unarchiving is possible but noisy.
