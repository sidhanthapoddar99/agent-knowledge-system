---
title: "Skills integration — teach documentation-guide, doc-issues, and guide.ts about artifacts"
status: review
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

- [x] **Teach `documentation-guide` the new first-class type.** In its `SKILL.md`
      triage (and the relevant reference — likely `references/layouts/` alongside
      the docs-page material, or `writing.md`), add: `.html` files with an `NN_`
      prefix render as first-class docs pages, embedded in the content area with
      sidebar/TOC chrome intact; they take an optional same-name
      `.meta.json`/`.meta.jsonc` metadata sidecar; they open full-page at
      `/artifacts/<path>`. Keep it a
      thin pointer — the *how-to-build* detail lives in the new skill. Done when
      the skill mentions the type and its sidecar without duplicating the
      authoring manual.

- [x] **Add the reserved-URL limitation to `documentation-guide`.** Wherever the
      skill covers section `settings.json` / `base_url` (the settings reference),
      state that `artifacts` (and the other route-reserved words: `assets`,
      `content-assets`, `api`, `editor`) may not be a section base URL and that
      config load hard-fails otherwise (matching the guard in
      [`30_reserved-url-guard.md`](./30_reserved-url-guard.md)). Done when the
      reserved-word list here matches the code constant exactly.

- [x] **Add the handoff to the new authoring skill.** In `documentation-guide`'s
      triage table, add a row: *building/designing an artifact, dashboard, report
      page, brand/design system → hand off to `artifact-authoring`*. This is the
      routing seam that keeps `documentation-guide` about *writing docs* and the
      new skill about *building artifacts*. Done when a docs-writing agent is
      pointed at the right skill for artifact construction.

- [x] **Teach `doc-issues` about artifacts in the tracker.** In its anatomy /
      writing references, note that a `brainstorm/`, `notes/`, or `subtasks/`
      folder may hold `NN_.html` artifacts (with sidecars) — e.g. a design system
      drafted inside an issue — and that building them is the
      `artifact-authoring` skill's job. Keep the tracker skill's focus on *where
      they live and how they're referenced*, not how to design them. Done when the
      tracker skill acknowledges artifacts as valid supporting content and hands
      off construction.

- [x] **Update `guide.ts` if warranted.** If artifacts change what a tracker
      folder legitimately contains, add a one-line mention to the relevant section
      of `astro-doc-code/src/layouts/issues/default/guide.ts` (keeping it the thin
      legend it is — the full manual stays in the skill). If nothing about the
      folder anatomy changes, record explicitly that no `guide.ts` edit was
      needed. Done when the bundled guide and the `doc-issues` skill agree.

- [x] **Honor the parity + history-free rules.** Mirror every edit into the
      installed cache and bump the plugin/marketplace version together with `40`.
      Per CLAUDE.md, skills describe the *current* system only — write the
      artifact type as it now exists; do **not** narrate "previously artifacts
      weren't supported" or reference the old reference-only skill stance. Done
      when repo-local and cache are byte-identical and no historical asides were
      added.

- [x] **Verification.** Run `docs-guide check skill-links`
      (`check-skill-links.mjs`) over both edited skills — every relative reference
      resolves. Grep both skills for the reserved-word list and confirm it matches
      the `30` code constant. Do a cold trigger check: a "help me author an
      artifact" prompt reaches `artifact-authoring`; a "add a docs page" prompt
      still reaches `documentation-guide`; a tracker prompt still reaches
      `doc-issues`. Diff repo-local vs installed cache to confirm parity.

## Landed (2026-07-07)

**Files edited (repo, each mirrored byte-identically into the installed cache
`~/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.5.4/`):**

- `plugins/documentation-guide/skills/documentation-guide/SKILL.md` — triage row
  *(building/designing an HTML artifact → hand off to `artifact-authoring`)* + a
  thin "Artifact pages" pointer (first-class `.html` type, embed, `/artifacts`
  full-page URL, `.meta.json`/`.meta.jsonc` sidecar, reserved base URL).
- `.../documentation-guide/references/layouts/docs-layout.md` — new "Artifact
  pages" section (mirrors the "Diagram pages" one) + `allow_artifact_pages`
  settings-field row. Cross-refs the shipped user-guide `08_artifact-pages.md`.
- `.../documentation-guide/references/settings-layout.md` — reserved-base-URL
  IMPORTANT callout in §4 (`artifacts, assets, content-assets, api, editor`;
  hard-fail at config load).
- `plugins/documentation-guide/skills/doc-issues/SKILL.md` — `artifact-authoring`
  sibling-skill pointer (build handoff; tracker keeps *where they live / how
  referenced*).
- `.../doc-issues/references/10_writing/10_writing.md` — new "Artifacts" section
  (URL-reference model, companion sidecar, the design-system Home-A→Home-B
  promotion).
- `plugins/documentation-guide/.claude-plugin/plugin.json` — `version` 0.5.4 →
  **0.5.5** (patch; matches how the analogous first-class-diagram feature was
  versioned, 0.5.3→0.5.4). *(The "Ships 3 skills" description + README were
  already updated by `40`.)*

**Cache directory-name vs manifest-version — expected, recorded.** The active
installed cache is edited **in place** at
`~/.claude/plugins/cache/sids-plugin-marketplace/documentation-guide/0.5.4/`, so its
directory is still named `0.5.4/` while the `plugin.json` inside it now reads
`0.5.5` (repo↔cache stay byte-identical, `.in_use` aside). The folder name is fixed
at install time, not by the manifest, so a name/version mismatch is the normal
consequence of the in-place parity edit — **not** a parity break. A future
reader/verifier should key off the `plugin.json` `version` (0.5.5), not the folder
name. To make the two agree, reinstall the plugin to mint a `0.5.5/` directory
(optional; not done here to avoid disturbing the in-use cache).

**`guide.ts` — no edit needed (recorded).** The bundled guide is a *thin map of
what each section is* (Brainstorm = deliberation, Notes = finalized output …); it
does not enumerate file types and does not even mention first-class **diagram**
files — an existing tracker capability. Artifacts have a *lesser* tracker
presence than diagrams (referenced by `/artifacts/` URL, not embedded as sidebar
entries), so adding them to `guide.ts` would over-specify beyond the map's role
and diverge from how diagrams are (not) treated there. The file-type detail lives
in the `doc-issues` skill's writing reference; map and skill agree. No change.

**Accuracy note / handoff to `10_component` review.** The tracker loader
(`astro-doc-code/src/loaders/issues.ts`) wires `diagramContainerHtml` for
first-class **diagram** files in `notes/`/`brainstorm/`/`agent-log/` but has **no
`.html`/artifact handling** — `issues.ts` is unmodified in the working tree.
Artifacts render as first-class *embedded* pages only in **docs sections**
(`data.ts` → `loadArtifactPages`). The `/artifacts/<path>` route *does* serve any
`.html` under any content dir (the tracker included — proven by the fixture
`notes/03_planning-overview.html` building to
`dist/artifacts/todo/.../03_planning-overview.html`). So the doc-issues skill was
written to the **shipped reality** — in-issue artifacts are linked full-page
documents, not embedded tracker entries — matching the canonical user-guide
(`08_artifact-pages.md`, docs-section framed) and the settled decisions (which
never specify tracker embedding). Making artifacts first-class *embedded* tracker
entries (parity with diagram files) is deferred scope now owned by
[`80_tracker-artifact-rendering.md`](./80_tracker-artifact-rendering.md) (the
`issues.ts` loader + issues detail-layout change, `notes/`/`brainstorm/` only, per
sidhantha) — when that lands, the doc-issues "Artifacts" note is upgraded to claim
embedded rendering. Flagged, not fabricated.

**Verification run:**
- `docs-guide check skill-links` → ✓ all checks passed (exit 0) on **both**
  skills, in **both** the repo copy and the installed cache.
- Reserved-word list in the skills equals the code constant
  `RESERVED_BASE_URLS = ['artifacts','assets','content-assets','api','editor']`
  (`config.ts`) exactly.
- Parity: `diff -rq` of both skill trees + `plugin.json` = byte-identical
  repo↔cache (only the runtime `.in_use` marker differs).
- `plugin.json` valid JSON, `version` 0.5.5, description still asserts "Ships 3
  skills"; `docs-guide help` still loads from the edited cache (exit 0).
- Neither sibling skill's `description:` frontmatter was touched — triggering is
  unchanged; artifact-build triggering is owned by `artifact-authoring`'s own
  description (from `40`). A live cold-prompt eval was not run in this headless
  subagent; assessed by description scoping (same posture as `40`).
- History-free: no "newly added / previously unsupported" phrasing; all edits
  describe the current system.
- No Astro build was run — these are plugin skill-markdown + `plugin.json` edits,
  outside the `astro-doc-code/` / `default-docs/` build surface; the skill-links
  validator is the relevant check.
