---
title: "The ./start wrapper against Astro 7's changed CLI"
status: done
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

- [x] Run every form: `./start`, `./start dev`, `./start build`, `./start preview`,
      `./start clean dev`
- [x] Decide what the wrapper should do about background mode — see Details
- [x] Fix anything that parses the old ready line
- [x] Port the same fixes to `start.ps1`, or say plainly that Windows is deferred
- [x] Update the "Build Commands" section of `CLAUDE.md` if behaviour changes

# Outcomes and Next Steps

## The decision: keep the human contract, replace the mechanism

Neither of the two options as written. `./start dev` still occupies the terminal
and `Ctrl-C` still stops the server — a person learns nothing new. What changed
is **how that is enforced**, and the wrapper also grew the three verbs the
scripted and agent case needs.

The wrapper now **asks for background mode explicitly** (`--background`) rather
than letting Astro decide. That is the load-bearing choice: Astro daemonises the
server only when it sniffs an AI-agent environment, so leaving it to Astro means
the wrapper behaves differently depending on who typed the command — one path
that has been exercised and one that has not. Asking for the daemon always gives
**one code path in every environment**. The terminal is then held by
`astro <cmd> logs --follow`, and `INT`/`TERM`/`HUP` are trapped to call
`astro <cmd> stop`, which resolves the server through Astro's **lock file**
rather than through the process tree. The process tree is precisely what stopped
being true — `$!` is the launcher, not the server.

Three consequences, each deliberate:

- **You stop what you started.** `./start dev` against an already-running server
  attaches read-only; `Ctrl-C` detaches and says so, leaving the server up. A
  Ctrl-C in the wrong window no longer takes down someone else's server.
- **`./start clean` stops running servers before wiping `.astro/`.** The lock
  file lives there. Wiping it under a live server orphans that server outright —
  `astro dev stop` can no longer find it. This was a live bug, not a
  hypothetical: `clean` has always done `rm -rf .astro`.
- **`preview` gets the same treatment as `dev`.** `astro preview` auto-detects
  agents and daemonises identically, with its own lock (`.astro/preview.json`).
  Leaving it out would have left half the leak in place, and it is the same
  function with a second caller rather than a copy.

## What was found that the subtask did not know about

**A race that reintroduced the exact bug, and it was reproduced before it was
fixed.** `Ctrl-C` during the ~2s startup window killed the launcher, but the
daemon it had already spawned was detached in a process group of its own, never
received the signal, finished booting a second later and registered itself — a
live server on 3088 that the wrapper had just told the user it stopped.
Reproduced at 0.8s and 1.5s delays. `stop_server()` now waits for the late
arrival (bounded at 35s, breaking as soon as it appears) instead of declaring
victory over an empty lock file. Re-tested at both delays: exits in 1.8s / 3.1s,
port refused, nothing running.

**`pgrep` on the astro binary path cannot see these servers.** A background
daemon runs `node_modules/astro/bin/astro.mjs`, not `node_modules/.bin/astro`,
so the pattern normally used to hunt strays matched the foreground orphan of
another project and missed this project's daemon entirely. Verified side by side
against a live daemon. `./start status` is the answer; the pattern is not.

**Nothing in `start`, `start.ps1` or `scripts/` ever parsed the ready line.**
Grepped for `ready in` / `astro  v` / any wait-for-server loop across the repo
(excluding the tracker and the worktree): zero hits. The trap was real for the
upgrade's measurements but it had never reached the wrapper. Recorded because
"we checked and it was clean" is a result.

**Both server-backed gates in `scripts/` defaulted to port 4321** — Astro's
default, not this project's (`PORT=3088`). Neither hangs against a dead port,
but `check-route-parity.mjs` reports *every* URL as divergent and
`check-links.mjs` reports "no HTML pages reachable"; both read as a site defect.
They now resolve the server from Astro's lock file through a shared reader,
`scripts/checks/_astro-server.mjs` — one implementation, two callers — and print the
port and pid they found.

## Verified, with what evidence

Every form was run end to end. Ctrl-C was simulated faithfully — new process
group, default signal dispositions, `killpg(SIGINT)` — because a job launched
with `&` from a non-interactive shell inherits SIGINT as *ignored*, which
`trap` cannot override; the first attempt produced a false "the trap never
fired".

| Form | Result |
|---|---|
| `./start` | build 1285 pages → dev up, page served in 9s, Ctrl-C → exit 0, port refused |
| `./start dev` | daemon on 3088 in 2s, logs streaming, Ctrl-C → exit 0 in 0.5s, port refused |
| `./start dev` ×2 | second attaches read-only; its Ctrl-C leaves the server up, the owner's stops it |
| `./start dev` + Ctrl-C mid-launch | 0.8s and 1.5s delays, both exit 0, nothing left running |
| `./start build` | 1284 pages in 7.6s |
| `./start preview` | daemon on 3088 in 2s, `status` reports it, Ctrl-C → port refused |
| `./start clean dev` | stopped the running server *before* the wipe, old pid confirmed dead, new server up |
| `./start status` | 0.6s, no pull/install/build prompt, reports dev + preview |
| `./start logs` | 21 lines of the running server's output |
| `./start stop` | stops dev + preview, honest when neither is running |
| `check-route-parity.mjs` | auto-found dev on 3088: 1290 URLs, 1278 agree, 12 explained, **0 diverge** |
| `check-links.mjs` | auto-found dev on 3088: 40 pages, 250 links, all passed (capped run) |
| both gates, no server | fail loudly with "start one, then re-run", not a crawl of a dead port |

`bash -n` clean on `start`.

## Windows: ported, and honestly only parse-verified

`start.ps1` carries the same structure — the three verbs before preflight, the
`--background` launch, `logs --follow` to hold the terminal, `Stop-Server` with
the same mid-launch wait, and `clean` stopping servers before the wipe. The
interrupt path uses `try`/`finally` rather than a trap, which is PowerShell's
equivalent and runs on Ctrl-C.

**It parses clean under real PowerShell 7** (`Parser::ParseFile`, 0 errors) and
that is the whole of the verification. No Windows host was available: the repo
lives on the WSL filesystem with a Linux-installed `node_modules`, so nothing
past parsing could be exercised. PSScriptAnalyzer is not installed either.

What a Windows run still has to confirm, in this order:

1. `Ctrl-C` on `.\start.cmd dev` actually reaches the `finally` block and the
   server is gone afterwards (the one behaviour with no Linux equivalent).
2. `.\start.cmd status` / `stop` / `logs` against a running server.
3. `.\start.cmd clean dev` with a server running — does it stop it before the
   wipe.

## Left undone, deliberately

- **`./start dev --ignore-lock` errors**, because the wrapper always asks for
  background mode and Astro rejects that combination. Astro's own message
  explains it clearly, so the wrapper does not intercept it. Anyone who genuinely
  needs two servers can run `astro dev --ignore-lock` from `astro-doc-code/`.
- **Log output loses colour.** A daemon writes to a file, not a TTY, so
  `logs --follow` replays plain text (JSON lines under an agent, since Astro
  forces `--json` there). Accepted as the price of one code path.

## Next

- A Windows pass on `start.ps1` — the three checks above.
- [060/030 the dev-server memory test](./030_dev-server-memory-controlled-test.md)
  now has a clean way to start and stop servers, which is what it needs to
  measure one without leaking others.

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
