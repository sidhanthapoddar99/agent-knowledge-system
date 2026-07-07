---
title: "Task list — ultracode implementation run"
---

Orchestration plan for workflow run `wf_be69aeec-bac` (4 phases; all
implementation agents are Opus at xhigh reasoning). Issue status set to
`in-progress`; subtask statuses are managed by the implementing agents
(`in-progress` → `review`).

- [x] Set issue `in-progress`; scaffold this activity
- [x] **Build** — three parallel streams:
      code chain (subtask 30 guard + 20 route, then 10 component on top);
      subtask 40 artifact-authoring skill (rewrite-not-paste, cache parity);
      subtask 70 provenance manifest (sha256 per tmp_skills file)
- [x] **Integrate** — subtask 50 sibling-skills integration ∥ subtask 60
      user-guide + dev-docs pages (incl. demo artifact showcase)
- [x] **Verify** — e2e verifier (build, dev server, both-theme screenshots,
      route, guard trip + revert, diagram regression) + consistency critic
      (subtask truthfulness, skills parity, no-verbatim-prose check, CLAUDE.md
      compliance, manifest coverage)
- [x] **Fix** — apply confirmed findings with re-verification
- [x] Main-session review; tracker validator; milestones + summary; hand off
      with subtasks at `review` for human sign-off
