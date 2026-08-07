---
title: "The measurement method, and the two times it lied"
---

Every number this run reports came from one harness. It is worth a file of its
own because **it produced three confident, completely wrong numbers before it
was trustworthy**, and each of them looked exactly like a real finding.

# The protocol is the load-bearing part

```
  protocol A   /todo is the FIRST request to a fresh server
               → pays for compiling the shared module graph AND its own work

  protocol B   /user-guide and /dev-docs first, THEN /todo
               → pays only the issues-specific cost

  protocol C   a detail page first, before the index has ever been built
```

**Comparing an A number against a B number invents a win or a regression that is
not there.** The gap between them is ~1 s of Vite compilation that every route
pays once and that no change in this issue touches. The stage-20 headline
(1.206 s → 0.155 s) is protocol B on both sides; the protocol-A pair
(2.570 s → 1.039 s) is the same fix measured with that constant included.

Protocol A must be started with a **TCP connect**, never an HTTP request. Polling
the port with `curl /` compiles the shared graph and quietly turns protocol A
into protocol B.

# Failure 1 — a leaked `cd`, and a server that never started

A `cd` in an earlier command persisted into later ones, so `bun run dev` ran from
the repo root, where `package.json` has no `dev` script. The harness waited for a
log line that never came, then timed requests against a dead port.

It reported **133 s** and **135 s**. Both were read as real for long enough to
start theorising about Vite dependency re-optimisation.

What gave it away: cold and warm were within 0.2 s of each other. Compute does
not behave like that; timeouts do.

**Fix:** absolute paths everywhere in the harness, and fail loudly when the
server does not come up instead of measuring anyway.

# Failure 2 — eleven orphaned dev servers

Astro 7 runs the dev server in the background when it detects an AI-agent
environment. So `$!` is the *launcher*, not the server, and `kill $!` leaves the
daemon running. Across a dozen harness invocations, eleven dev servers
accumulated — roughly 5 GB of resident memory, all competing.

The harness then reported a **72-second first request** on Astro 7, reproducibly,
across three separate runs. Reproducible, and completely false. It looked like a
catastrophic upgrade regression and would have been reported as one.

What gave it away: running the same request by hand returned in 0.61 s.

**Fix:** `astro dev stop` plus an explicit sweep for anything still holding the
port, and a check that nothing survives.

# What this cost, and the rule it earns

Three wrong numbers, two of which were reproducible, and one of which would have
been written into a stage file as an Astro 7 defect.

> **A reproducible number is not a verified one.** Both failures reproduced
> perfectly, because both had a stable cause — it just was not the cause being
> measured. What caught them was a cheap cross-check by a different route: run
> the thing by hand, and see whether the shape of the result makes sense.

The specific tell to keep: **when cold and warm come out the same, stop.** That is
not a performance profile, it is a timeout or a dead port.

# Process notes worth carrying

- `ps -eo pid,args` filtered on the explicit `--port` flag is what made the
  orphan cleanup safe. Two other dev servers were running that were **not**
  mine — one belonging to a different project entirely — and neither carries a
  `--port`, so they were distinguishable rather than guessed at.
- Stashing the fix to measure the before-state works, but invalidates Vite's
  dependency cache, so the first run afterwards is not representative. Run one
  throwaway server before recording anything.
