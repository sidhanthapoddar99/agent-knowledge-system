---
title: "Elements: frames and HTML widgets"
status: review
---

Artifacts and videos often show content inside a device, a window or a container: a phone, a laptop, a browser window, a terminal, a code editor, a card, a callout. Today each artifact builds its own. This leaf adds reusable **frames** and a few small **widgets** to the default library. A frame is an SVG with one screen slot, the one source of its look: a video names it (`frame: ks:phone-frame`) and its slot becomes a layout area. For artifacts, each device frame is also an HTML widget, `<device>-view`, whose chrome is copied from the SVG, so an artifact can wrap its content in a consistent frame by loading one element. When it is done, an agent can put a screenshot or a sub-artifact in a phone frame with one `iframe` or `img` and no hand-drawn chrome.

# 01 To Do
- [x] **Frames (self-contained `.html`).** Each takes its content through URL query parameters or `postMessage` and draws only the chrome:
    - [x] `phone-frame` — a generic phone body with a screen area; `?src=` for an image or a same-library URL, or a slot filled by `postMessage`.
    - [x] `browser-frame` — window chrome with a title and URL bar text (`?title=&url=`).
    - [x] `laptop-frame`, `tablet-frame`.
    - [x] `terminal-frame` — a terminal window that shows lines passed in, with an optional typing animation.
    - [x] `code-frame` — an editor window with a file name tab.
- [ ] **Frames as SVG, the one source.** Redraw the six frames' chrome once as SVG with one screen slot in `components/frames/<name>-frame.svg`. The HTML frames above become widgets, `components/widgets/<name>-view.html` (for example `phone-view`), whose chrome the `--sync-shared` step copies from the SVG, so the two never drift. Frames also cover containers: `card-frame`, `callout-frame`, `bubble-frame`, `note-frame`, `panel-frame`, `window-frame`. The video issue's [T4b video component set](../../../2026-09-29-narrated-video-pages/subtasks/050_video-component-set.md) builds these.
- [x] **Widgets (self-contained `.html`).** Small, generic, data-driven:
    - [x] `callout-card` — a titled card for a highlight.
    - [x] `step-list` — numbered steps that reveal one by one.
    - [x] `kv-table` — a key/value table from JSON in the query or a message.
- [ ] **The element contract.** Document it at the top of each file and in [120/90](./90_library-authoring-guide.md): (Done in each file, the library's `AGENTS.md` and `README.md`; [120/90](./90_library-authoring-guide.md) still has to carry it.)
    - [x] Inputs: query parameters, and an optional `postMessage({ type: "agentks:element:data", data })` from the parent.
    - [x] Theme: read `?theme=light|dark` (the parent passes its mode) and use the theme variable names from the site contract with sensible built-in values, because a sandboxed element cannot read the parent's CSS.
    - [x] Size: fill the iframe; no fixed pixel size on the outer element.
    - [x] No network requests and no storage; `scripts/check.py` rejects both. The one exception is a screen frame's `src`, which the parent passes: an image, or with `kind=page` a page in a nested sandboxed iframe ([library system](../../notes/04_ecosystem/01_library-system.md), section 14).
- [x] **Manifest entries** with descriptions that say what goes in and how (`"A phone frame. Pass ?src= with an image URL, or post data…"`) and tags (`frame`, `mobile`, `device`).
- [ ] **Test artifact** (Partly done: `preview/index.html` shows every frame and widget in both modes, sandboxed, with sample inputs and a `postMessage` to `kv-table`; the agentks test project waits for the binary and the `/_lib/` route.) in the library's test project showing each frame and widget, both theme modes.
- [ ] **Bump the library version** (minor) and tag. Folded into the first tag, `v1.0.0` ([120/60](./60_default-library-scaffold.md)).

## Guardrails
- Every element is one file with inline CSS and JS. No sibling files, no CDN scripts.
- Library HTML runs sandboxed with an opaque origin ([120/50](./50_lib-route-and-sandbox.md)); design for that, never for access to the parent.
- Keep each file small (target under 15 KB).

## Done when
- A test artifact embeds `<iframe src="/_lib/kit/phone-frame?src=…">` and the image shows inside the frame, locally and in a `--base /docs` build.
- `postMessage` data renders in `kv-table`.
- `agentks check libraries` exits 0; screenshots of both theme modes in the result.

# 02 Status and Result
Review. Six frames and three widgets are in the library and pass the library check; the `/_lib/` and `--base` runs, `agentks check libraries` and the tag wait for the binary, [120/50](./50_lib-route-and-sandbox.md) and [120/60](./60_default-library-scaffold.md).

## Result
- **Frames** in `frames/`: `phone-frame`, `tablet-frame`, `laptop-frame`, `browser-frame`, `terminal-frame`, `code-frame`. **Widgets** in `widgets/`: `callout-card`, `step-list`, `kv-table`. Each is one `.html` file of 8 to 11 KB, with its inputs documented in a comment at the top and an entry in `manifest.json` whose description says what goes in.
- **Contract, as built:** inputs through query parameters; `postMessage({ type: "agentks:element:data", data })` from the parent; `?theme=light|dark`, else the system setting; `{ type: "agentks:element:theme", mode, tokens }` switches the mode and can pass the site's variable values; each element posts `{ type: "agentks:element:ready" }` so the parent knows when to send; bad input shows a visible error. Messages are shape-checked. Styles use only theme variable names. The screen frames show an image by default, or a page in a nested sandboxed iframe with `kind=page`, and accept only http(s) and `data:image` URLs.
- **Shared code:** the theme values and the contract runtime live once in `scripts/shared/element.css` and `scripts/shared/element.js`. Each element carries a marked copy, because an element cannot load a sibling file. `python3 scripts/check.py --sync-shared` rewrites the copies; the check fails when a copy drifts.
- **Check:** `scripts/check.py` rejects an `.html` element that loads another file, makes a network request, uses storage, lacks the header comment, lacks or changes a shared block, or passes 15 KB.
- **Visual check:** `preview/index.html` loads every frame and widget in a sandboxed iframe with sample inputs. In headless Chromium every element drew in light and dark mode, the mode switched through the theme message, and `kv-table` drew rows sent by `postMessage` (`/tmp/lib-light.png`, `/tmp/lib-dark.png`, not kept).
- **Left:** the test artifact through `/_lib/default/phone-frame` locally and in a `--base /docs` build; `agentks check libraries`; the tag. The contract text for [120/90](./90_library-authoring-guide.md).

## Agent log
none

# 03 References
**Where:** the library repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`, folders `components/frames/` and `components/widgets/`.

**Read first**
- [Library system](../../notes/04_ecosystem/01_library-system.md), sections 06, 13 and 14.
- [Theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) — the theme variable names.
- The artifacts skill: [agent-ks-artifacts](../../../../../../plugins/agent-ks/skills/agent-ks-artifacts/SKILL.md) and its theme-mode reference.
- [Library components](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/08_library-components.md) — the frames category, its contract (SVG with one slot) and the day-one set of twelve frames.

**Depends on:** [120/60](./60_default-library-scaffold.md), [120/50 /_lib/ route](./50_lib-route-and-sandbox.md).
**Unblocks:** [120/80 video component set](./80_elements-video-cue-kit.md), [130/10 plugin port](../130_ai-plugins/10_agentks-plugin-port.md).

# 04 Decisions
- Decided (claude, 2026-10-01): frames become SVG with a screen slot in `components/frames/`, the one source, and the HTML frames become `<device>-view` widgets whose chrome is copied from it, because one design with two uses cannot drift. Frames also cover containers, because a card or a callout has the same shape: an SVG with one slot.
- Decided (claude, 2026-09-30): elements are self-contained single files ([library system](../../notes/04_ecosystem/01_library-system.md)).
- Decided (claude, 2026-09-30): library HTML is sandboxed (same note).
- Decided (claude, 2026-09-30): the theme message is its own type, `agentks:element:theme` with `mode` and `tokens`, not part of the data message, so element data never collides with reserved keys. `tokens` lets a parent pass its real theme values (from `agentks theme tokens`), because a sandboxed element cannot read the parent's CSS.
- Decided (claude, 2026-09-30): each element posts `agentks:element:ready` to its parent, because a parent that posts before the frame listens loses the message.
- Decided (claude, 2026-09-30): a URL input resolves against the element's own address, so parents pass full URLs. The README shows `new URL(path, location.href)`. Screen frames default to showing an image; `kind=page` opts into a nested sandboxed iframe, because guessing from the extension fails on extension-less `/_lib/` URLs.
- Decided (claude, 2026-09-30): the shared CSS and JavaScript live once in `scripts/shared/` and are copied into each element between markers, with a sync command and a drift check, because the self-contained rule forbids a shared file at run time but one source keeps the copies from drifting.
- Decided (claude, 2026-09-30): bad input shows a visible error in the element, never a blank or stale frame.
- Decided (claude, 2026-09-30): `tablet-frame` added `?orientation=`; `step-list` has `reveal=auto|all|manual` and `{ active: n }` so a video or artifact can drive it; `code-frame` shows plain text with line numbers and `mark`, no syntax colouring, to stay small and self-contained.

# 05 Notes & Analysis
## Watch out
- The video player uses the library's frames: a video names one in its `frame:` field, and the SVG's screen slot becomes a layout area ([video artifacts](../../notes/04_ecosystem/05_video-pages.md)). The player has no frames of its own, so the SVG is the one source for videos and, through the `-view` widgets, for artifacts.
- `postMessage` into a sandboxed iframe must target `"*"` because its origin is opaque; the element must validate the message shape and ignore anything else.
