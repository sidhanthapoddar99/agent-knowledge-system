---
title: Update the documentation guide, UI, and tooling
state: closed
---

Implement the anatomy decided in subtask 01 (spec: `notes/01_issue-anatomy/`) across the
three surfaces that have to agree on it: the **framework** (loader + issue layout), the
**bundled guide** (what a reader sees on every issue's Guide panel), and the **plugin
tooling** (validators that catch drift).

## Done — framework

- [x] **Loader knows the new sections.** `src/loaders/issues.ts` reads `brainstorm/` and
      `agent-memory/` as issue sub-folders (same free-form walk as `notes/`); `comments/`
      stays a flat list of `NNN_*.md` files.
- [x] **UI renders them.** Sidebar sections, routes, and panels for Brainstorm and
      Agent-memory wired through the issue detail layout (`DetailSidebar`, `SubdocTree`,
      route matching, static paths, `panels.ts`).
- [x] **Agent-log kind badges.** An activity folder is `NNN_<code>_<name>/` — the 2-letter
      `<code>` says what sort of run it was (loop, audit, …). The code→label map is
      `agentLogKinds` in the issue's `settings.json`, merged over framework defaults
      (`lp` loop · `au` audit · `rf` refactor · `it` iteration · `wf` workflow). Sidebar
      shows the label as a tag; unknown codes degrade gracefully; `0NN_` meta files get no
      badge; milestones show their `#<iteration>` chip.

## Done — guide

- [x] **Guide panel on every issue.** `src/layouts/issues/default/guide.ts` renders a
      built-in anatomy legend, so the map is available even without the plugin installed
      (CLAUDE.md documents it as the skill-guide's thin twin).
- [x] **Guide is generated per issue.** `buildIssueGuide(kindMap)` injects the issue's
      effective `agentLogKinds` into the kinds table (icon · code · name · use-for) and
      id-stamps the `h2`s, giving the right-rail "On this page" TOC and `#guide-<slug>`
      deep links. Section order is complexity-first. Design: `notes/01_issue-anatomy/09_guide.md`.

## Done — tooling

- [x] **Validators updated for the new anatomy.** `docs-guide check issues`
      (`scripts/issues/check.mjs`) now validates, per issue folder — all as *warnings*
      (the loader tolerates every one of these; brainstorm deliberately gets no grammar):
      - `brainstorm/` + `agent-memory/` walked as known sub-folders (frontmatter drift,
        2-level depth cap); unknown root sub-folders flagged; root `glossary.md`
        whitelisted alongside `issue.md`;
      - agent-log grammar: `NNN_<code>_<name>/` activity folders (flat root files and
        code-less/unknown-code folders hinted, with the issue's *effective* kind set in
        the message); `0NN_` meta files must not carry `iteration`, milestones should;
        milestone `status` checked against the badge-colour vocabulary;
      - `agentLogKinds` in `settings.json`: 2-letter lowercase codes, string or
        `{name, icon, desc}` shape, icon vetted against the symbol palette;
      - agent-memory: `memory.md` index expected when the folder exists;
      - subtasks: `title` + `state` frontmatter (pre-existing, unchanged).
