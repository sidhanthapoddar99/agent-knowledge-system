---
title: "Elements: the default icon set"
status: review
---

Agents building artifacts and video scenes keep drawing the same icons (a server, a database, a browser, a user, a cloud) from scratch, which costs thousands of tokens and never looks the same twice. This leaf adds a first icon set to the default library, each icon an element with a description and tags so `agentks library find` surfaces it. When it is done, an agent asking for "server" gets `icons:server` in one command, and every icon renders cleanly in light and dark themes.

# 01 To Do
- [x] **Pick the set.** About 60 icons covering what technical docs draw most. Start from this list and extend where the docs in this repository show a need:
    - [x] Infrastructure: server, database, cache, queue, load-balancer, cloud, container, cluster, cdn, storage, network, firewall.
    - [x] Clients: browser, phone, laptop, desktop, terminal, api, webhook.
    - [x] People and roles: user, team, admin, agent (an AI agent), robot.
    - [x] Files and content: file, folder, document, markdown, code, image, video, archive, config.
    - [x] Flow and state: check, cross, warning, info, lock, unlock, key, clock, refresh, sync, arrow-right, branch, merge.
    - [x] Tools (all but `github`, see Decisions): git, github, search, settings, bug, test, deploy, build, package.
- [x] **Source.** Draw them, or take them from an icon set whose licence allows redistribution and modification (for example Lucide, ISC licence). Record the source and licence in the library's `README.md` and a `LICENSES/` file when third-party.
- [x] **Format.** SVG, 24×24 viewBox, stroke-based, `stroke="currentColor"` and `fill="none"` (or `currentColor` for fills), so the icon takes the text colour of wherever it is shown and works in both theme modes. No embedded fonts, no scripts, no external references. Optimise with SVGO; keep each file small.
- [x] **Manifest entries.** One element per icon: name in the element-name rule (`load-balancer`), `file: icons/<name>.svg`, a one-sentence `description` that says what it depicts and when to use it, `tags` with synonyms (`["icon", "infrastructure", "backend", "host"]`). Synonyms are what make `find` work.
- [ ] **Check.** (Partly done: `scripts/check.py` passes and `preview/index.html` shows every icon in both modes; `agentks check libraries` waits for the binary.) `agentks check libraries` passes; a small test artifact in the library's test project shows every icon in a grid, in light and dark mode.
- [ ] **Bump the library version** (minor) and tag, following [120/60](./60_default-library-scaffold.md). Folded into the first tag, `v1.0.0` (see Decisions).

## Guardrails
- Consistent visual style across the set: one stroke width, one corner style.
- No brand logos whose trademark terms forbid redistribution. Framework logos (for the video issue's "framework logos") need a licence check each; skip any that is unclear.
- Icons are elements, not markdown syntax: they are used from artifacts (`<img src="/_lib/icons/server">`) and video cues only.

## Done when
- `agentks library find database --json` in a project using the default library returns `icons:database` first.
- The icon grid artifact looks right in both theme modes (screenshot attached to the result).
- `agentks check libraries` exits 0.

# 02 Status and Result
Review. The icon set is in the library and passes the library check; `agentks check libraries`, `library find` and the tag wait for the binary and [120/60](./60_default-library-scaffold.md).

## Result
- **74 icons** in `icons/` of the library repository, each an element in `manifest.json` with a one-sentence description and synonym tags (every icon also carries the tag `icon`).
    - Infrastructure (15): server, database, cache, queue, load-balancer, cloud, container, cluster, cdn, storage, network, firewall, cpu, memory, function.
    - Clients (8): browser, phone, laptop, desktop, terminal, api, webhook, web.
    - People and roles (5): user, team, admin, agent, robot.
    - Files and content (11): file, folder, document, markdown, code, json, image, video, archive, config, log.
    - Flow and state (15): check, cross, warning, info, lock, unlock, key, clock, refresh, sync, arrow-right, branch, merge, event, workflow.
    - Tools (20): git, pull-request, search, settings, bug, test, deploy, build, package, plugin, dashboard, chart, metrics, mail, chat, notification, link, tag, book, idea.
- **Format:** one line of SVG each, 24×24 viewBox, `stroke="currentColor"`, `fill="none"`, stroke width 2, round caps and joins. No text, scripts or references. 230 to 760 bytes each, 26 KB for the set; the check caps an icon at 2 KB.
- **Source:** 73 icons adapted from Lucide 1.49.0 (ISC, some derived from Feather, MIT); the licence is in `LICENSES/lucide.txt` and credited in `README.md`. The `markdown` icon is drawn on the same grid.
- **Check:** `python3 scripts/check.py` enforces the icon format (viewBox, fill, stroke, width, no scripts or references, size).
- **Visual check:** `preview/index.html` draws every icon inline in light and dark mode. Screenshots were taken with headless Chromium (`/tmp/lib-light.png`, `/tmp/lib-dark.png`, not kept in the repository); every icon renders and follows the text colour in both modes.
- **README** shows the two ways to get a theme-coloured icon in an artifact: a CSS `mask` with `background: currentColor`, or fetch and insert the SVG inline.
- **Left:** `agentks check libraries` and `agentks library find database --json` once the binary and a test project exist; the tag with [120/60](./60_default-library-scaffold.md).

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
- Decided (claude, 2026-09-30): the icons come from Lucide (ISC), because it is one coherent stroke set on the 24 grid with `currentColor`, and its licence allows redistribution and changes. The source lines are copied as they are, with the class attributes and comments removed.
- Decided (claude, 2026-09-30): no `github` icon, because Lucide 1.x dropped brand icons and GitHub's logo terms forbid changing the mark. `git` uses the commit symbol instead of the Git logo, for the same reason and to keep one style.
- Decided (claude, 2026-09-30): status icons (check, cross, warning, info) are the circled forms, so the four read as one family.
- Decided (claude, 2026-09-30): `refresh` is one arrow turning and `sync` is two arrows chasing, so the two names never share a shape.
- Decided (claude, 2026-09-30): 74 icons, not about 60, because the extra ones (cpu, memory, function, web, json, log, event, workflow, pull-request, plugin, dashboard, chart, metrics, mail, chat, notification, link, tag, book, idea) are common in technical docs and cost under 1 KB each.
- Decided (claude, 2026-09-30): no version bump for this leaf. Nothing is tagged yet, so the icons land in `0.1.0` and ship in the first tag, `v1.0.0` ([120/60](./60_default-library-scaffold.md)).

# 05 Notes & Analysis
## Watch out
- `currentColor` inside an SVG loaded through `<img>` does not inherit the page's colour; it falls back to black. For theme-aware icons inside artifacts, inline the SVG (fetch and insert) or use CSS `mask-image: url(/_lib/icons/server)` with `background-color: currentColor`. Document both in [120/90](./90_library-authoring-guide.md) and the artifacts skill.
