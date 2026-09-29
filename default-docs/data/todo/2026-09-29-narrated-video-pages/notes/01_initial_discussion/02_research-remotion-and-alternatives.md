---
title: "Research: Remotion and alternatives"
---

**Remotion can make these videos but is the wrong dependency for agentks.** Its licence would put a cost on every company of four or more people using the feature, its compositions are React code that needs a bundler, and rendering needs Node, headless Chrome and FFmpeg. Rendered MP4s would also bloat git. The design chosen instead keeps the source as text and plays it live in the browser.

# 03 References

- [Remotion licence](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)
- [Remotion encoding guide](https://www.remotion.dev/docs/encoding) and [player](https://www.remotion.dev/docs/player)
- [HyperFrames](https://github.com/heygen-com/hyperframes) (HeyGen, Apache 2.0)
- [Remotion vs Motion Canvas vs Revideo](https://www.pkgpulse.com/guides/remotion-vs-motion-canvas-vs-revideo-programmatic-video-2026)
- [2026-04-10-issues-layout design note](../../../2026-04-10-issues-layout/notes/01_issues-restructure-design.md) — heavy binaries such as videos stay out of git.

# 04 Decisions

- Decided (sidhantha, 2026-09-29): no rendered video files; the source is played in the frontend.
- Decided (sidhantha, 2026-09-29): do not add Remotion as a dependency.

# 05 Notes & Analysis

## 01 Remotion

- **Licence:** source-available, not open source. Free for individuals, companies of up to 3 employees, and non-profits. Everyone else needs a paid company licence. agentks is MIT, so bundling Remotion would pass a hidden licence cost to users.
- **How it works:** scenes are React components; frames are captured in headless Chrome and encoded with FFmpeg. `@remotion/player` can also play a composition live in a React page.
- **Captions and timings:** packages for whisper.cpp, OpenAI Whisper and ElevenLabs produce word-level captions.

## 02 File sizes, if rendered (estimates, not measured)

| Setting | Per minute | 5-minute video |
|---|---|---|
| H.264, Remotion default (CRF 18) | ~10–25 MB | ~50–125 MB |
| H.264, web quality (CRF 23–28) | ~2–8 MB | ~10–40 MB |
| VP9 / AV1 | about half of H.264 | |
| Narration only (Opus, 48 kbps) | ~0.35 MB | ~1.8 MB |

Git keeps every version of a binary, so each re-render adds a full copy.

## 03 Alternatives

| Tool | Licence | Notes |
|---|---|---|
| HyperFrames | Apache 2.0 | Plain HTML with `data-start` / `data-duration`, GSAP and similar for motion, built for agents with its own skills. Renders MP4 through headless Chrome and FFmpeg |
| Motion Canvas | MIT | Code-driven animation with generator functions and a real-time editor. No embeddable player |
| Revideo | MIT | A Motion Canvas fork with a rendering API for automated pipelines |

## 04 Why a custom player won

The user asked for no MP4, plain narration, and the fewest possible tokens per video. A player built into the engine, reading ordinary markdown, needs no renderer, no licence and no media files, and each video costs only its script.
