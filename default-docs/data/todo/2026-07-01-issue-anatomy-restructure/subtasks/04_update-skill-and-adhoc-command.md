---
title: Update the skill + add an adhoc-issue capture command
status: done
---

Bring the plugin's skills in line with the new structure, and add tooling for the
issues dump (subtask 02). Three phases: decide the skill partition, implement it,
then refresh the content inside the skills + CLI.

## 1 — Discussion on the skill structure

- [x] **Decide the partition.** Discussed sidhantha ↔ claude 2026-07-02. Options
      weighed: keep the monolith; split per-domain into 4–6 skills (docs / issues /
      blogs / writing / settings — the original idea below); or extract just the
      issues domain. **Decided: two skills.**
      - **`doc-issues`** (new) — the whole tracker domain: anatomy, operating
        rules, per-subdoc references, agent-log usage, CLI. Absorbs **`doc-agent`**
        (its execution-verb trigger surface — audit / refactor / loop / discuss —
        moves into the `doc-issues` description), so `doc-agent` is retired.
      - **`documentation-guide`** (kept) — everything else: structure, settings,
        docs, blogs, writing, images.
      - Rationale: issues is the highest-frequency, most nuanced, most
        self-contained domain — a complete structure in itself; docs / blogs /
        writing compose constantly and share the universal conventions, so
        splitting them would duplicate the preamble across skills and bloat the
        always-in-context description budget.
      - **Self-contained writing guidance in each** — `doc-issues` carries its own
        "how to write issues" nuances instead of deferring to `documentation-guide`;
        some duplicated mechanics are accepted (skills load one at a time), guarded
        by sync notes in both.
      - **Mutual references** — each skill points at the other for out-of-domain
        work (documentation-guide → doc-issues for tracker tasks; doc-issues →
        documentation-guide for blogs / docs / settings).
      - ~~Split the monolith into 4 (docs / issues / blogs + hub)~~ — superseded by
        the above; kept here for provenance.

## 2 — Implementing the skill structure

Done 2026-07-02 — see `agent-log/010_rf_skill-split/` for the execution record.

- [x] **Create `doc-issues`** under `plugins/documentation-guide/skills/doc-issues/`
      — SKILL.md router (operating model, lifecycle + AI rules, creation rules,
      agent-log quick guide, triage table) with a noun + verb trigger description
      (issue / subtask / tracker / dump nouns AND audit / refactor / loop / discuss
      verbs).
- [x] **Move `references/layouts/issues/`** (16 files) from `documentation-guide`
      into `doc-issues/references/` (git mv; cross-skill prose pointers rewritten).
- [x] **Absorb `doc-agent`** — its agent-log quick guide merged into the
      `doc-issues` SKILL.md; `skills/doc-agent/` deleted.
- [x] **Issue-specific writing guide** — `doc-issues/references/10_writing.md`
      (per-subdoc frontmatter, tags, diagrams, linking, assets, tracker prefix
      conventions), with a sync note against `documentation-guide`'s `writing.md`
      (and vice versa).
- [x] **Trim `documentation-guide`** — issues triage row → doc-issues pointer,
      doc-agent note replaced with a sibling-skill note, description drops tracker
      triggers, writing.md issue sections redirected.
- [x] **Propagate** — plugin version 0.3.3 → 0.4.0, mirrored to the installed
      cache (rsync, diff-verified identical), repo `CLAUDE.md` skills +
      tracker-mental-model sections updated, skill catalogue page updated
      (including the "why two skills" rationale), plugin README refreshed.

## 3 — Updating the skills with the new commands and documentation

Content-level refresh inside the new shape — especially `doc-issues` (coordinate
with subtask 07, which tracks the operating-rules propagation):

- [x] Rewrite the agent-log reference for `NNN_<code>_<name>/` activity folders
      (kind code in the folder name; category wrappers dropped) — landed as
      `doc-issues/references/24_agent-logs.md` full rewrite + `63_agent-loops.md`
      example update, grounded in `notes/01_issue-anatomy/07_agent-log.md`
- [x] Document Brainstorm, Notes-as-product, flat Comments, Agent-memory in the
      `doc-issues` references — new `25_brainstorm.md`, `26_agent-memory.md`,
      `27_guide-and-glossary.md`; `21_comments.md` / `22_notes.md` /
      `00_overview.md` / `01_folder-layout.md` / `02_settings.md` (agentLogKinds +
      assignee policy-reversal note) refreshed against `notes/01_issue-anatomy/`
- [x] **How to write a subtask** — authoring guidance added to
      `doc-issues/references/23_subtasks.md` (cold-pickup intro, bolded-lead
      checkboxes, `##` groups, spelled-out pointers, decision markers, plus the
      running-checklist pattern)
- [x] **New slash command `/docs-quick-idea-note`** to quickly note down an adhoc
      idea/issue into the dump without hand-building a folder (pairs with subtask
      02's "issues dump" — writes a subtask entry into the right dump issue).
      A **command** in `plugins/documentation-guide/commands/` (peer of
      `/docs-init`, `/docs-add-section`) — NOT a `docs-guide` CLI tool: the model
      routes the idea to the right dump issue and writes the subtask entry itself.
      Shipped 2026-07-02: route-first flow (existing-issue check → litmus check →
      dump), creates the first dump issue on demand, no-bare-dump entry template,
      speed-first guardrails.
- [x] Update the `docs-guide` CLI for any new sections + teach both skills the
      latest CLI surface — the CLI already understands the new anatomy (its
      `check issues` validates activity-folder naming and JSONC vocabulary; landed
      with subtask 03's implementation); the `doc-issues` SKILL.md carries the
      issue-group command surface inline, `documentation-guide` keeps the full
      `references/cli-toolkit.md`, and `docs-guide help` remains the discovery
      path. Stale flat `docs-*` names in `/docs-add-section` fixed to
      `docs-guide check …` forms.

**Complete 2026-07-02** — all three phases done; execution record in
`agent-log/010_rf_skill-split/`. Marked review for human sign-off.
