---
title: "The ./start wrapper against Astro 7's changed CLI"
status: open
---

# Overview

`./start` is the documented way to run this project, and Astro 7 changed the CLI
underneath it. **Nothing has been checked.** This is the highest-probability
breakage left from the upgrade, because the wrapper reads dev-server output.

Done when `./start`, `./start dev`, `./start build` and `./start clean dev` all
work on Astro 7, and `start.ps1` has had the same treatment or is explicitly
deferred.

# References

- [stage 40](../../plans/01_implementation/40_the-upgrade.md) — the CLI changes,
  as observed
- `start`, `start.cmd`, `start.ps1` at the repo root
- The project `CLAUDE.md` "Build Commands" section, which documents the wrapper's
  behaviour and will need updating if that behaviour changes

# Todo list

- [ ] Run every form: `./start`, `./start dev`, `./start build`, `./start preview`,
      `./start clean dev`
- [ ] Decide what the wrapper should do about background mode — see Details
- [ ] Fix anything that parses the old ready line
- [ ] Port the same fixes to `start.ps1`, or say plainly that Windows is deferred
- [ ] Update the "Build Commands" section of `CLAUDE.md` if behaviour changes

# Outcomes and Next Steps

> [!IMPORTANT]
> **PLACEHOLDER** — filled at completion / hand-off.

# Details

## Three changes, and the third is the awkward one

**The ready line is JSON now.** It was:

```
astro  v5.17.1 ready in 428 ms
```

It is now a JSON object with a `message` field. Anything grepping for the old text
does not fail — it **hangs**, waiting for a line that never comes. This cost two
bogus measurements during the upgrade before it was noticed, so treat any
"waiting for server" loop in the wrapper as suspect.

**There is a per-project lock.** A second `astro dev` refuses to start and reports
the first one's port instead of choosing a free one. `--ignore-lock` exists but is
rejected in background mode.

**`astro dev` backgrounds itself when it detects an AI-agent environment.** Then
`$!` is the launcher, not the server, and killing it leaves the daemon running.
During this issue that leaked eleven dev servers and roughly 5 GB before anyone
noticed.

## The decision this needs

Astro now ships `astro dev stop | status | logs`. The wrapper can either:

- **Stay foreground** and fight the auto-backgrounding, keeping today's
  `Ctrl-C` behaviour; or
- **Adopt background mode** and grow `./start stop` / `./start status`, which is
  closer to how Astro now wants to be driven.

The second is probably right, but it changes what a person's terminal does, so it
is a deliberate choice and not a fix to slip in.

## Watch for the same trap in scripts/

Anything under repo-root `scripts/` that starts a dev server to test against has
the same exposure. Sweep for it rather than fixing `./start` alone.
