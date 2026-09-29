---
title: "One install: tool + engine + published frontend"
---

`agentks` grows from a CLI tool into **tool + engine + published Vite build**, installed once per machine. Projects stop carrying their own framework folder and `node_modules`. The engine can then grow bigger and ship many preconfigured artifacts, because the cost is paid once per machine, not once per project.

# 03 References

- [Versioning and forced migrations](./12_versioning-and-forced-migrations.md) — how projects on different versions coexist.
- [Performance and size](./13_performance-and-size.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): one global install serves every project on the machine.
- Decided (sidhantha, 2026-09-29): the frontend bundle ships embedded in the binary.

# 05 Notes & Analysis

## 01 The trade the user described

- The space one install takes will grow, because the binary now carries the engine and the frontend.
- A user with ten agent-ks projects has one engine instead of ten copies, so the total is far smaller.
- A larger engine becomes affordable. It can ship ready-to-use artifacts and layouts.

## 02 What the binary carries

- The CLI commands.
- The Rust core and server.
- The prebuilt Vite frontend (the single-page app).
- Optionally, extra downloads such as the narration voice model ([video](./14_video-and-narration-audio.md)).

## 03 The frontend is embedded

The prebuilt frontend bundle is embedded in the binary, so one file carries one version of everything and works offline.
