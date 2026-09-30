---
title: "Elements: frames and HTML widgets"
status: open
---

Artifacts and video scenes often show content inside a device or window: a phone, a laptop, a browser window, a terminal, a code editor. Today each artifact builds its own. This leaf adds reusable, self-contained HTML **frames** and a few small **widgets** to the default library, so an artifact can wrap its content in a consistent frame by loading one element. When it is done, an agent can put a screenshot or a sub-artifact in a phone frame with one `iframe` or `img` and no hand-drawn chrome.

# 01 To Do
- [ ] **Frames (self-contained `.html`).** Each takes its content through URL query parameters or `postMessage` and draws only the chrome:
    - [ ] `phone-frame` — a generic phone body with a screen area; `?src=` for an image or a same-library URL, or a slot filled by `postMessage`.
    - [ ] `browser-frame` — window chrome with a title and URL bar text (`?title=&url=`).
    - [ ] `laptop-frame`, `tablet-frame`.
    - [ ] `terminal-frame` — a terminal window that shows lines passed in, with an optional typing animation.
    - [ ] `code-frame` — an editor window with a file name tab.
- [ ] **Widgets (self-contained `.html`).** Small, generic, data-driven:
    - [ ] `callout-card` — a titled card for a highlight.
    - [ ] `step-list` — numbered steps that reveal one by one.
    - [ ] `kv-table` — a key/value table from JSON in the query or a message.
- [ ] **The element contract.** Document it at the top of each file and in [120/90](./90_library-authoring-guide.md):
    - [ ] Inputs: query parameters, and an optional `postMessage({ type: "agentks:element:data", data })` from the parent.
    - [ ] Theme: read `?theme=light|dark` (the parent passes its mode) and use the theme variable names from the site contract with sensible built-in values, because a sandboxed element cannot read the parent's CSS.
    - [ ] Size: fill the iframe; no fixed pixel size on the outer element.
    - [ ] No network requests, no storage (the sandbox blocks them anyway).
- [ ] **Manifest entries** with descriptions that say what goes in and how (`"A phone frame. Pass ?src= with an image URL, or post data…"`) and tags (`frame`, `mobile`, `device`).
- [ ] **Test artifact** in the library's test project showing each frame and widget, both theme modes.
- [ ] **Bump the library version** (minor) and tag.

## Guardrails
- Every element is one file with inline CSS and JS. No sibling files, no CDN scripts.
- Library HTML runs sandboxed with an opaque origin ([120/50](./50_lib-route-and-sandbox.md)); design for that, never for access to the parent.
- Keep each file small (target under 15 KB).

## Done when
- A test artifact embeds `<iframe src="/_lib/kit/phone-frame?src=…">` and the image shows inside the frame, locally and in a `--base /docs` build.
- `postMessage` data renders in `kv-table`.
- `agentks check libraries` exits 0; screenshots of both theme modes in the result.

# 02 Status and Result
Open. Not started.

## Result
None yet.

## Agent log
none

# 03 References
**Where:** the library repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`, folders `frames/` and `widgets/`.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md), sections 06, 13 and 14.
- [Theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) — the theme variable names.
- The artifacts skill: [agent-ks-artifacts](../../../../../../plugins/agent-ks/skills/agent-ks-artifacts/SKILL.md) and its theme-mode reference.
- [The video engine](../../../2026-09-29-narrated-video-pages/notes/01_initial_discussion/04_video-engine.md) — the built-in widgets (browser frame, phone frame) that live in the player, not the library. Keep the library frames visually close to them.

**Depends on:** [120/60](./60_default-library-scaffold.md), [120/50 /_lib/ route](./50_lib-route-and-sandbox.md).
**Unblocks:** [120/80 video cue kit](./80_elements-video-cue-kit.md), [130/10 plugin port](../130_ai-plugins/10_agentks-plugin-port.md).

# 04 Decisions
- Decided (claude, 2026-09-30): elements are self-contained single files ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (claude, 2026-09-30): library HTML is sandboxed (same note).

# 05 Notes & Analysis
## Watch out
- The video player has its own built-in browser and phone frames ([video pages](../../notes/04_ecosystem/05_video-pages.md)). These library frames are for artifacts. Do not make the player depend on them.
- `postMessage` into a sandboxed iframe must target `"*"` because its origin is opaque; the element must validate the message shape and ignore anything else.
