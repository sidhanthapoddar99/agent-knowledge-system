---
title: "Skills integration — teach documentation-guide, doc-issues, and guide.ts about artifacts"
status: open
---

## Goal

The new first-class type and its reserved-URL limitation must be known to the two
existing skills and the framework-bundled issue guide — otherwise an agent
working docs or the tracker won't know artifacts exist, won't warn about the
reserved base URL, and won't hand off to the new authoring skill. This subtask is
the connective tissue between [`40_authoring-skill.md`](./40_authoring-skill.md)
(which *creates* the artifact-authoring skill) and the shipped feature. It
follows the plugin **parity rule** (MEMORY.md): every edit lands in **both** the
repo-local plugin source and the installed cache.

## What to touch (verified locations)

- **`documentation-guide` skill** — repo-local
  `plugins/documentation-guide/skills/documentation-guide/` (`SKILL.md` +
  `references/`: `writing.md`, `settings-layout.md`, `images.md`, `layouts/`,
  `cli-toolkit.md`, `doc-migration.md`). This skill triages non-tracker docs
  work; it must learn that an `NN_.html` file is a first-class page type and route
  authors to the new skill.
- **`doc-issues` skill** — repo-local
  `plugins/documentation-guide/skills/doc-issues/` (`SKILL.md` + numbered
  `references/`: `00_anatomy/`, `10_writing/`, `20_sections/`, `40_operations/`,
  `60_examples/`). Artifacts can live inside a tracker `brainstorm/`/`notes/`
  folder (design systems authored in an issue), so this skill must mention them.
- **Bundled issue guide** —
  `astro-doc-code/src/layouts/issues/default/guide.ts` (the plugin-independent
  thin "issue anatomy" legend rendered on every issue's **Guide** panel). Update
  only if artifacts change what a tracker folder can contain (a light mention that
  supporting files can be `.html` artifacts).
- **Installed cache mirror** —
  `/home/sid/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/<version>/skills/…`
  (current shipped version `0.5.4`). Every skill edit must be mirrored here, and
  the manifest/marketplace version bumped in lockstep with the new skill from
  `40`.

## Tasks

- [ ] **Teach `documentation-guide` the new first-class type.** In its `SKILL.md`
      triage (and the relevant reference — likely `references/layouts/` alongside
      the docs-page material, or `writing.md`), add: `.html` files with an `NN_`
      prefix render as first-class docs pages, embedded in the content area with
      sidebar/TOC chrome intact; they take an optional same-name
      `.meta.json`/`.meta.jsonc` metadata sidecar; they open full-page at
      `/artifacts/<path>`. Keep it a
      thin pointer — the *how-to-build* detail lives in the new skill. Done when
      the skill mentions the type and its sidecar without duplicating the
      authoring manual.

- [ ] **Add the reserved-URL limitation to `documentation-guide`.** Wherever the
      skill covers section `settings.json` / `base_url` (the settings reference),
      state that `artifacts` (and the other route-reserved words: `assets`,
      `content-assets`, `api`, `editor`) may not be a section base URL and that
      config load hard-fails otherwise (matching the guard in
      [`30_reserved-url-guard.md`](./30_reserved-url-guard.md)). Done when the
      reserved-word list here matches the code constant exactly.

- [ ] **Add the handoff to the new authoring skill.** In `documentation-guide`'s
      triage table, add a row: *building/designing an artifact, dashboard, report
      page, brand/design system → hand off to `artifact-authoring`*. This is the
      routing seam that keeps `documentation-guide` about *writing docs* and the
      new skill about *building artifacts*. Done when a docs-writing agent is
      pointed at the right skill for artifact construction.

- [ ] **Teach `doc-issues` about artifacts in the tracker.** In its anatomy /
      writing references, note that a `brainstorm/`, `notes/`, or `subtasks/`
      folder may hold `NN_.html` artifacts (with sidecars) — e.g. a design system
      drafted inside an issue — and that building them is the
      `artifact-authoring` skill's job. Keep the tracker skill's focus on *where
      they live and how they're referenced*, not how to design them. Done when the
      tracker skill acknowledges artifacts as valid supporting content and hands
      off construction.

- [ ] **Update `guide.ts` if warranted.** If artifacts change what a tracker
      folder legitimately contains, add a one-line mention to the relevant section
      of `astro-doc-code/src/layouts/issues/default/guide.ts` (keeping it the thin
      legend it is — the full manual stays in the skill). If nothing about the
      folder anatomy changes, record explicitly that no `guide.ts` edit was
      needed. Done when the bundled guide and the `doc-issues` skill agree.

- [ ] **Honor the parity + history-free rules.** Mirror every edit into the
      installed cache and bump the plugin/marketplace version together with `40`.
      Per CLAUDE.md, skills describe the *current* system only — write the
      artifact type as it now exists; do **not** narrate "previously artifacts
      weren't supported" or reference the old reference-only skill stance. Done
      when repo-local and cache are byte-identical and no historical asides were
      added.

- [ ] **Verification.** Run `docs-guide check skill-links`
      (`check-skill-links.mjs`) over both edited skills — every relative reference
      resolves. Grep both skills for the reserved-word list and confirm it matches
      the `30` code constant. Do a cold trigger check: a "help me author an
      artifact" prompt reaches `artifact-authoring`; a "add a docs page" prompt
      still reaches `documentation-guide`; a tracker prompt still reaches
      `doc-issues`. Diff repo-local vs installed cache to confirm parity.
