---
title: "Elements: the default icon set"
status: open
---

Agents building artifacts and video scenes keep drawing the same icons (a server, a database, a browser, a user, a cloud) from scratch, which costs thousands of tokens and never looks the same twice. This leaf adds a first icon set to the default library, each icon an element with a description and tags so `agentks library find` surfaces it. When it is done, an agent asking for "server" gets `icons:server` in one command, and every icon renders cleanly in light and dark themes.

# 01 To Do
- [ ] **Pick the set.** About 60 icons covering what technical docs draw most. Start from this list and extend where the docs in this repository show a need:
    - [ ] Infrastructure: server, database, cache, queue, load-balancer, cloud, container, cluster, cdn, storage, network, firewall.
    - [ ] Clients: browser, phone, laptop, desktop, terminal, api, webhook.
    - [ ] People and roles: user, team, admin, agent (an AI agent), robot.
    - [ ] Files and content: file, folder, document, markdown, code, image, video, archive, config.
    - [ ] Flow and state: check, cross, warning, info, lock, unlock, key, clock, refresh, sync, arrow-right, branch, merge.
    - [ ] Tools: git, github, search, settings, bug, test, deploy, build, package.
- [ ] **Source.** Draw them, or take them from an icon set whose licence allows redistribution and modification (for example Lucide, ISC licence). Record the source and licence in the library's `README.md` and a `LICENSES/` file when third-party.
- [ ] **Format.** SVG, 24×24 viewBox, stroke-based, `stroke="currentColor"` and `fill="none"` (or `currentColor` for fills), so the icon takes the text colour of wherever it is shown and works in both theme modes. No embedded fonts, no scripts, no external references. Optimise with SVGO; keep each file small.
- [ ] **Manifest entries.** One element per icon: name in the element-name rule (`load-balancer`), `file: icons/<name>.svg`, a one-sentence `description` that says what it depicts and when to use it, `tags` with synonyms (`["icon", "infrastructure", "backend", "host"]`). Synonyms are what make `find` work.
- [ ] **Check.** `agentks check libraries` passes; a small test artifact in the library's test project shows every icon in a grid, in light and dark mode.
- [ ] **Bump the library version** (minor) and tag, following [120/60](./60_default-library-scaffold.md).

## Guardrails
- Consistent visual style across the set: one stroke width, one corner style.
- No brand logos whose trademark terms forbid redistribution. Framework logos (for the video issue's "framework logos") need a licence check each; skip any that is unclear.
- Icons are elements, not markdown syntax: they are used from artifacts (`<img src="/_lib/icons/server">`) and video cues only.

## Done when
- `agentks library find database --json` in a project using the default library returns `icons:database` first.
- The icon grid artifact looks right in both theme modes (screenshot attached to the result).
- `agentks check libraries` exits 0.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the library repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`, folder `icons/`.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md), sections 06 (manifest) and 14 (trust: SVG is sandboxed).
- [Libraries and reusable elements in the video issue](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/07_libraries-and-reusable-elements.md) — the icons videos need.
- The artifacts skill in this repository, [agent-ks-artifacts](../../../../../../plugins/agent-ks/skills/agent-ks-artifacts/SKILL.md) — how artifacts use theme colours.

**Depends on:** [120/60 default library scaffold](./60_default-library-scaffold.md).
**Unblocks:** [130/10 plugin port](../130_ai-plugins/10_agentks-plugin-port.md) (the artifacts skill's `library find` step), [170/30 end to end](../170_testing/30_end-to-end.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-30): the CLI and skills read installed manifests so agents reuse elements ([library system](../../notes/04_ecosystem/01_library-system.md)).

# 05 Notes & Analysis
## Watch out
- `currentColor` inside an SVG loaded through `<img>` does not inherit the page's colour; it falls back to black. For theme-aware icons inside artifacts, inline the SVG (fetch and insert) or use CSS `mask-image: url(/_lib/icons/server)` with `background-color: currentColor`. Document both in [120/90](./90_library-authoring-guide.md) and the artifacts skill.
