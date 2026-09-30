---
title: "Deprecation notice on the old repository"
status: open
---

Anyone who lands on `sidhanthapoddar99/agent-knowledge-system` after the switch-over (from a search, an old link or a 0.x install) must see at once that the project has moved and where to. This leaf prepares that notice: a banner at the top of the README, the repository's description and website field, and the pinned notice. Claude writes the README change; sidhantha commits it and runs the metadata commands, because the repository is theirs.

# 01 To Do
- [ ] **Claude: README banner.** Insert at the very top of this repository's [README](../../../../../../README.md), above the badges:

    ```markdown
    > [!IMPORTANT]
    > **This repository is archived. agentks now lives at
    > [NeuraLabsHQ/agent-knowledge-system](https://github.com/NeuraLabsHQ/agent-knowledge-system).**
    > Install the new version from [agentks.neuralabs.org](https://agentks.neuralabs.org) and
    > move your projects with [the migration guide](https://agentks.neuralabs.org/docs/user-guide/upgrading/).
    > The 0.x releases below stay available for projects pinned to them.
    ```

    - [ ] Use the migration guide's real hosted URL, checked live.
    - [ ] Leave the rest of the README as it is: it documents 0.x for pinned users.
- [ ] **Claude: prepare the metadata commands** for sidhantha, in this leaf's Result:

    ```sh
    gh repo edit sidhanthapoddar99/agent-knowledge-system \
      --description "Archived — agentks moved to NeuraLabsHQ/agent-knowledge-system (https://agentks.neuralabs.org)" \
      --homepage https://agentks.neuralabs.org
    ```

- [ ] **sidhantha: commit and push** the README change, then run the metadata command.
- [ ] **sidhantha: pin a GitHub issue or discussion** in the old repository titled "agentks has moved", with the same text, if issues or discussions are enabled.
- [ ] **Link the notice from the final 0.x release** notes and from the updater notice ([160/30](../160_distribution/30_final-0x-updater-notice.md)), so every path leads to the same page.

## Guardrails
- Claude edits the README but never commits or pushes in this repository.
- The notice points only at live URLs; check each with `curl -I` before handing over.
- Do not remove 0.x documentation from the README; pinned users still need it.

## Done when
- The README on GitHub shows the banner first, and every link in it answers 200.
- The repository's description and website field name the new home.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
- **Repository:** `sidhanthapoddar99/agent-knowledge-system` (local `/home/sid/projects/02_OpenSource/04_knowledge_management/agent-knowledge-system`), file `README.md`.
- **Read first:** [Docs rewrite and launch](../../notes/05_delivery/07_docs-rewrite-and-launch.md), section 05; [distribution and install](../../notes/05_delivery/04_distribution-and-install.md), section 05; [launch overview](./00_overview.md), note 01 (archived in place, not transferred).
- **Depends on:** [200/20 switch-over](./20_switch-over.md), [195/00 hosting](../195_hosting/00_overview.md) (the URLs must be live), [180/90 migration guide](../180_documentation/90_migration-guide-0x-to-1.md).
- **Unblocks:** [200/40 archive the old repository](./40_archive-old-repo.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the old repository gets a note that the project is archived and deprecated in favour of the NeuraLabsHQ one.
- Decided (sidhantha, 2026-09-30): Claude does not commit in this repository; sidhantha commits ([permissions and repositories](../../agent-memory/permissions-and-repositories.md)).

# 05 Notes & Analysis

## Watch out
- The notes planned a transfer to neuralabshq for GitHub's redirects. The new repository already takes that name, so there is no redirect: the banner and the description are the only signposts. Make them impossible to miss.
