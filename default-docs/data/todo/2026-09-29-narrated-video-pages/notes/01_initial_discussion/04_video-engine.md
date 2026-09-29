---
title: "A proper video engine"
---

The user wants **5–10x richer visuals** than the spike, looking good, but still lightweight, rendered in the frontend, and cheap for an AI to write. Not motion graphics, but real explainers: several panels at once, a phone screen running a demo while the voice explains it, a file tree beside a flow, markdown visibly turning into HTML, packets moving from file to server to browser, charts. The design puts all the visual power into **engine code written once**, so each video stays a short markdown script.

# 03 References

- [The spike](./03_the-spike.md)
- [Libraries and reusable elements](./07_libraries-and-reusable-elements.md) — where widgets and templates come from.
- [Narration audio](./05_narration-audio.md) — word timings for precise cues.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): richer scenes are in: multi-panel grids, artifacts as panels (for example a phone screen), file trees, data-transform views, flows with server and browser icons, browser frames, request flows end to end, and charts — "the general PPT stuff".
- Decided (sidhantha, 2026-09-29): it should look good and stay lightweight, rendered in the frontend, with no stored video.
- Decided (sidhantha, 2026-09-29): not motion graphics.
- Decided (sidhantha, 2026-09-29): React components are acceptable where reusable, but not required.

# 05 Notes & Analysis

## 01 The user's examples

- A demo phone screen, as an artifact, playing an action while the narration explains it.
- A multi-grid layout: while a component in a flow is explained, the file tree shows beside it.
- Showing how markdown is split into frontmatter and content, processed, and what it looks like after each phase.
- A basic browser element showing the rendered result.
- A file read by the server, with icons (server, Astro), to show how the engine and its core work and how a request flows from start to end.
- Analytics charts with explanations.

## 02 The design (claude, proposed)

1. **Grid layouts.** A scene picks a layout: single, split, 2×2, main plus sidebar, or a device frame. Each panel holds one widget.
2. **A widget library**, built once and polished once: file tree, transform (markdown → frontmatter + body → HTML), flow with icons and moving packets, browser frame, phone frame, chart, code, terminal, diagram.
3. **Cues per paragraph.** Bold text keeps doing the simple focus. Actions use a short cue in an HTML comment, invisible in Obsidian and on GitHub but readable in the raw file: `<!-- flow: browser -> server -->`, `<!-- tree: open src/parsers -->`.
4. **Artifacts as panels.** A phone demo is an ordinary HTML artifact with named steps (`login`, `tap-settings`). The player tells it which step to play as the narration moves. One video can combine several artifacts.
5. **A motion style set once.** One set of timings, easing curves, staggers, icons and transitions used by every widget. This is what makes it look designed rather than basic.

A scene in the source might look like this:

````markdown
## How a request flows

```scene
layout: split
left:  tree src/
right: flow [file 01_intro.md, server Astro, browser /docs/intro]
```

The browser asks the **server** for a page. <!-- flow: browser -> server -->

Astro finds the file in the parsers folder. <!-- tree: open src/parsers -->
````

## 03 Making motion cheap (claude, proposed)

Full motion design is expensive because the author writes coordinates, keyframes and timings. It becomes cheap when the author writes only the states and the engine animates between them:

- **Morph between states.** Two diagrams in a row that share node IDs morph instead of cutting: boxes slide, new ones grow, removed ones fade. About 50–150 tokens a scene instead of 1,000–3,000.
- **The engine lays out.** mermaid, graphviz or ELK place everything; the author never writes an x or a y.
- **A small motion vocabulary.** enter, flow, emphasise, group, split, zoom — each choreographed once.
- **Timing from the narration.** Changes fire at the paragraph, or at the spoken word once generated audio gives word timings. Rewording the script never breaks sync.
- **A growing library.** A new widget costs 2,000–5,000 tokens once; every later use costs about 50.

## 04 Cost

| | Spike | With this engine |
|---|---|---|
| Tokens per 5-minute video | ~1,600 | ~3,000–5,000 |
| A phone-demo artifact | — | ~3,000–8,000, once, reusable |
| Page weight | Player plus mermaid | Player plus only the widgets a video uses, each loaded on demand |
| Stored files | One markdown file | Still one markdown file, plus any artifacts |

## 05 Risks

- Visual polish takes several rounds of the user watching and giving feedback.
- An author naming a widget or cue target that does not exist must get a clear error, not a silent miss. A check that reads only the files can live in the CLI.
- Scope creep towards rebuilding PowerPoint: keep the widget set small and closed, with artifacts and [reusable elements](./07_libraries-and-reusable-elements.md) as the escape hatch.

## 06 Next step (claude, proposed)

A second spike: the grid, cues, the motion style and four widgets (file tree, transform, icon flow, browser frame), used to remake the tour's request-flow scene. It shows whether the result looks good enough before the full library is built.
