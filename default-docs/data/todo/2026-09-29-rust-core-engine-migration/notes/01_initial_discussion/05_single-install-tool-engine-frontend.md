---
title: "One install: tool + engine + published frontend"
---

`agentks` grows from a CLI tool into **tool + engine + published Vite build**, installed once per machine. Projects stop carrying their own framework folder and `node_modules`. Ready-made artifacts, icons and other reusable elements come as **libraries**: git repositories a project lists in `config/dep.yaml`, cached once per machine, not packaged in the binary ([libraries](../02_future-stages/09_libraries-and-dependencies.md)). Both costs are paid once per machine, not once per project.

# 03 References

- [Versioning and forced migrations](./12_versioning-and-forced-migrations.md) — how projects on different versions coexist.
- [Performance and size](./13_performance-and-size.md)

# 04 Decisions

- Decided (sidhantha, 2026-09-29): one global install serves every project on the machine.
- Decided (sidhantha, 2026-09-29): the frontend bundle ships embedded in the binary.
- Decided (sidhantha, 2026-09-29): libraries of ready-made artifacts are downloaded and cached, never packaged in the binary.

# 05 Notes & Analysis

## 01 The trade the user described

- The space one install takes will grow, because the binary now carries the engine and the frontend.
- A user with ten agent-ks projects has one engine instead of ten copies, so the total is far smaller.
- A larger engine becomes affordable, with more built-in layouts. Ready-to-use artifacts come from libraries, cached once per machine and shared by every project.

## 02 What the binary carries

- The CLI commands.
- The Rust core and server.
- The prebuilt Vite frontend (the single-page app).
- The static renderer `agentks build` runs for publishing ([Phase 3](../02_future-stages/07_phase-3-publishing.md)).

The release is one compressed installer holding all of it; it is the only thing agentks publishes ([the repositories](../02_future-stages/12_repositories-and-three-states.md)).

Not in the binary: libraries and the narration voice model, which agentks downloads into `~/.agentks/` ([libraries](../02_future-stages/09_libraries-and-dependencies.md)); the docs, which are hosted at agentks.neuralabs.org/docs ([the docs command](../02_future-stages/08_agentks-docs-command.md)); and the migration scripts, which `agentks migrate` fetches from git when needed ([versioning](./12_versioning-and-forced-migrations.md)).

## 03 The frontend is embedded

The prebuilt frontend bundle is embedded in the binary, so one file carries one version of everything and works offline.
