---
title: Repo scripts and the ./start command
description: What each ./start command does, what it costs, what it checks, and the three modes Astro can serve this site in
sidebar_label: Repo Scripts & start
sidebar_position: 2
---

# Repo scripts and `./start`

> This page uses Simplified Technical English (ASD-STE100). Sentences are short. Each
> sentence gives one idea.

`./start` is the entry point of this repository. It runs the site. It also controls the
server and the caches.

`./start` is a small script. It runs `scripts/start.mjs`. One file does the work on all
platforms. On Windows, use `.\start.cmd`. It runs the same file.

## The commands

| Command | What it does |
|---|---|
| `./start` | Runs the dev server. This is the default. |
| `./start dev` | The same as `./start`. |
| `./start build` | Makes the production site in `dist/`. |
| `./start preview` | Serves the site that is already in `dist/`. |
| `./start doctor` | Runs a full build. Use it as a check before you publish. |
| `./start stop` | Stops a server. |
| `./start status` | Tells you if a server runs, and where. |
| `./start logs` | Shows the output of a server. Add `--follow` to read it live. |
| `./start clean` | Removes the build caches. |
| `./start <script>` | Runs any other script from `package.json`. |

Add `dev` or `preview` to `stop`, `status` and `logs` to select one server.

**Options.** `--detach` puts the server in the background. Without it, `Ctrl-C` stops the
server. `--no-clean` keeps the caches during `build`. `-h` shows the help text.

## What each command costs, and what it removes

These are measured numbers. Do not use them as estimates.

| Command | Time | Data written | What it removes |
|---|---|---|---|
| `./start` (dev) | 2.4 s to ready, 3.5 s to the first page | **0.4 MB** | Nothing |
| `preview` | 2.1 s to the first page | **0.3 MB** | Nothing |
| `doctor` | 7.1 s | **100 MB** | Nothing |
| `build --no-clean` | 6.4 s | **99 MB** | Nothing. It writes over `dist/`. |
| `build` | 7.0 s | **100 MB** | The 4 cache folders below |
| `clean` | — | — | The same 4 folders. Then it stops. |
| `stop`, `status`, `logs` | — | — | Nothing |
| The old `./start` | about 9.5 s | about **100 MB** | Nothing |

The old `./start` made a full build, and then started the dev server. Dev never reads
`dist/`. So that build wrote 100 MB that nobody read. Twenty starts each day cost **2 GB**
then, and **8 MB** now. The time is the larger gain: about 2 minutes each day.

**The four cache folders** are `.astro/`, `dist/`, `node_modules/.vite/` and
`node_modules/.astro/`. Two of those names look the same and are not the same folder:
`astro-doc-code/.astro/` holds the **lock files** of the servers;
`astro-doc-code/node_modules/.astro/` holds Astro's **build cache**.

`build` and `clean` stop a running server first. The lock file is inside `.astro/`. If you
remove that folder below a live server, the server continues to run, and no command can
find it.

**How we measured this.** For a server, read `wchar` in `/proc/<pid>/io`, and stop at the
first page served. For a build, read `File system outputs` from `/usr/bin/time -v`, and
multiply by 512 bytes. Read the folder sizes with `du -sm` before and after. The machine
is WSL2. The site has about 1300 pages.

## What each command checks

| Command | Update | Install | Version |
|---|---|---|---|
| `dev`, `preview`, `build`, `doctor`, `<script>` | Yes, once in 6 hours | Yes | Yes |
| `clean <command>` | Yes | Yes | Yes |
| `clean` alone | No | No | No |
| `stop`, `status`, `logs`, `--help` | No | No | No |

`stop`, `status` and `logs` ask you no questions. You use them when something is already
wrong. A question at that moment is not useful.

- **Update.** Looks at the git remote, and offers to pull. It runs one time in 6 hours,
  because you run `./start` about 20 times each day. Control it with
  `START_SKIP_UPDATE_CHECK=1`, `START_UPDATE_INTERVAL_HOURS=N` (`0` means every time) and
  `START_NONINTERACTIVE=1`.
- **Install.** Makes a hash of `package.json` and the lock file. A different hash installs
  the dependencies again.
- **Version.** Compares `site.yaml → engine_version` with the range the engine supports.

### The version precheck

```
[start] content 0.3.0 · engine 0.3.0 (floor 0.2.0)
```

If the content is outside the range, the command stops. It names the migration scripts to
run, in order:

```
[start] error: this content cannot run on this engine.
[start] content targets engine 0.1.2; engine 0.3.0 needs 0.2.0 or newer.
[start] Migrate the content. Run these 4 script(s), in this order:
[start]     migration/0.2.0_agent-log-slot-numbering.py
[start]     ...
```

Set `START_SKIP_VERSION_CHECK=1` to start anyway. The engine then refuses the content
itself.

> [!IMPORTANT]
> The engine has the same rule. This precheck does not replace it. It corrects **when** the
> rule applies. `build` and `doctor` check during the build, which is correct. `dev` checks
> at the **first request** — the server reports "ready" first, and then every page fails.
> `preview` **never** checks, because it serves files that are already built. Before the
> precheck, `preview` could serve a `dist/` folder made from old content, and no message
> told you.

The precheck reads the two version numbers from the TypeScript source. It keeps no copy of
them. A copy is how two numbers become different from each other. If it cannot read a
value, it writes a warning and continues. The engine stays the authority.

## The three modes of Astro

Astro can serve this site in three ways. The mode is the `output` value in
`astro.config.mjs`. The commands above use two of them. The third is possible, and this
repository does not set it up.

| | **Dev** | **Static, behind nginx** | **SSR, with a node adapter** |
|---|---|---|---|
| Command | `./start` | `./start build` | Not set up here |
| `output` | `server`, plus Vite | `static` | `server`, plus `@astrojs/node` |
| How a page is made | Astro makes it for each request. Vite changes the source code at the same time. | The build makes every page one time. nginx then sends the file. | The build makes the assets only. A node process makes each page for each request. |
| Use it for | Writing content and layouts. About 98% of the work. | Publishing. A CDN or a static host also works. | A live server that must follow the files on the disk. |

| | **Dev** | **Static** | **SSR** |
|---|---|---|---|
| Start time | **Fast.** 2.4 s to ready. | **Slow to build, then instant.** 6.4 s for 1291 pages. | **Fast** (estimate). There is no page build. |
| Page speed | Medium. Vite changes the code for each request. | **Fastest.** nginx sends a file. Nothing renders. | Fast (estimate). Slower than a file, much faster than dev. |
| Shows new content | **Yes, immediately.** HMR sends the change to the browser. | **No.** The pages are frozen until you build again. | Yes, when you reload. There is no HMR. |
| Small assets | No | **Yes** | **Yes** |
| Disk cost | **0.4 MB** | About **100 MB** for each build | Low (estimate). There is no 1291-page `dist/`. |
| Needs a running process | Yes | **No** | Yes |

> [!WARNING]
> The dev and static numbers are measured. **Every SSR number is an estimate.** That mode
> needs `@astrojs/node` and a change to `output`, and neither is in this repository.

SSR has one more effect, and it is large: **the 1291-page build stops existing.** The build
time, the 100 MB `dist/`, and every incremental-build problem go with it. The cost is one
node process, and a page render for each request. The size of that render cost is not
known. Measure it before you choose SSR. Measure the heaviest page — the issue index, with
more than 1000 rows.

## Rules to remember

- **Dev does not build, and does not read `dist/`.** We removed `dist/` and served every
  page, to prove this. Run `./start doctor` before you publish.
- **Dev and the build ask different questions.** Dev resolves one request through
  `matchServerRoute()`. The build lists every address through `getStaticPaths()`. A page
  address that exists two times stops the build, and dev cannot see it.
- **Do not search the start message of the server.** In Astro 7 that message is a JSON
  object. A search for the old Astro 5 text does not fail. It waits for all time. Read the
  port, or run `./start status`.
- **`pgrep` does not find these servers.** A background server runs
  `node_modules/astro/bin/astro.mjs`, not `node_modules/.bin/astro`. Use `./start status`.
- **A server can live longer than its terminal.** Astro starts it as a separate process,
  even without `--detach`. Use `./start status` and `./start stop`. Do not use `kill`.
- **`./start dev` attaches to a server that already runs.** It does not open a second port.
  `Ctrl-C` then leaves the server, and says so. You stop only what you started.

## The files

```
scripts/
├── start.mjs             # The CLI. All commands are here.
├── lib/
│   ├── util.mjs          # Paths, messages, questions, the .env reader
│   ├── runner.mjs        # Selects bun or npm. Installs the dependencies.
│   ├── server.mjs        # Starts, stops and reads a server through its lock file.
│   ├── update.mjs        # The git update check and the shallow-clone offer.
│   └── version.mjs       # The content/engine version precheck.
├── bin/
│   ├── start             # The bare name `start`, for Unix. mise puts it on PATH.
│   └── agent-ks-dev      # The plugin source in this repo, not the installed plugin.
└── checks/
    ├── check-links.mjs                  # Do the rendered links resolve?
    ├── check-route-parity.mjs           # Do dev and the build agree on a URL?
    ├── check-theme-contract.mjs         # Does every CSS variable resolve?
    ├── check-incremental-staleness.mjs  # Did the incremental build serve old HTML?
    └── _astro-server.mjs                # Shared. Reads the lock file of the server.
```

`checks/` is a different kind of file from the rest. You **run the project** with
`start.mjs` and `lib/`. You **ask the project questions** with `checks/`.

`mise.toml` puts `scripts/bin/` on PATH. This works inside this repository only. So you can
type `start` and `agent-ks-dev` from any folder here, and nowhere else.

## Read next

- [The repo check scripts](../20_development/08_repo-check-scripts.md) — what each check in
  `scripts/checks/` asks, and why none of them ship to a consumer.
- [The version gate](../30_versioning/02_version-gate.md) — the engine side of the version
  precheck.
- [Code structure](./01_code-structure.md) — the source tree that `./start` builds.
