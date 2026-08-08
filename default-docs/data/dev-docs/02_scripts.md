---
title: Repo scripts and the ./start command
description: What each ./start command does, what it costs in time and disk space, what it removes, and what it checks before it runs
sidebar_label: Repo Scripts & start
sidebar_position: 2
---

# Repo scripts and `./start`

> This page uses Simplified Technical English (ASD-STE100). Sentences are short. Each
> sentence gives one idea. The words have one meaning each.

## What `./start` is

`./start` is the entry point of this repository. It runs the documentation site. It also
controls the server. It also removes the build caches.

`./start` is a small script. It runs `scripts/start.mjs`. One file does the work on all
platforms. On Windows, use `.\start.cmd`. It runs the same file.

There is no second version of this program. Before, there was a Bash script and a
PowerShell script. The two scripts became different from each other. Now there is one.

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

Add `[dev\|preview]` to `stop`, `status` and `logs` to select one server.

### The options

| Option | What it does |
|---|---|
| `--detach` | Puts the server in the background. Without it, `Ctrl-C` stops the server. |
| `--no-clean` | For `build` only. Keeps the caches. |
| `-h`, `--help` | Shows the help text. |

## Time and disk cost

These are measured numbers. Do not use them as estimates.

| Command | Time | Data written | Effect on the folders |
|---|---|---|---|
| `./start` (dev) | 2.4 s to ready, 3.5 s to the first page | **0.4 MB** | No change. `dist/` stays at 105 MB. |
| `preview` | 2.1 s to the first page | **0.3 MB** | No change. |
| `build --no-clean` | 6.4 s | **99 MB** | Writes `dist/` again. |
| `build` | 7.0 s | **100 MB** | Removes 4 folders. Writes `dist/` again. |
| `doctor` | 7.1 s | **100 MB** | Writes `dist/` again. |
| The old `./start` | about 9.5 s | about **100 MB** | Writes `dist/` again. |

The old `./start` made a full build, and then started the dev server. Dev never reads
`dist/`. So that build wrote 100 MB that nobody read.

### What this means for a work day

Twenty starts in one day cost this much:

```
  old:  20 × 100 MB  =    2 GB per day   =  730 GB per year
  new:  20 × 0.4 MB  =    8 MB per day   =  2.9 GB per year
```

Dev now writes 250 times less data. It is also 7 seconds faster each time. That is about
2 minutes each day.

Both numbers are safe for an SSD. The time is the larger cost.

### How we measured this

- For a server, read `wchar` in `/proc/<pid>/io`. Stop at the first page served.
- For a build, read `File system outputs` from `/usr/bin/time -v`. Multiply by 512 bytes.
- Measure the folder sizes with `du -sm` before the command and after it.
- The machine is WSL2. The site has about 1300 pages.

## What each command removes

| Command | What it removes |
|---|---|
| `dev` | **Nothing.** |
| `preview` | **Nothing.** |
| `doctor` | **Nothing.** |
| `build --no-clean` | Nothing. It writes over `dist/`. |
| `build` | `.astro/`, `dist/`, `node_modules/.vite/`, `node_modules/.astro/` |
| `clean` | The same four folders. Then it stops. |
| `stop`, `status`, `logs` | **Nothing.** |

`build` and `clean` stop a running server first. The lock file of the server is inside
`.astro/`. If you remove that folder below a live server, the server continues to run,
and no command can find it.

Two folders have names that look the same. They are not the same folder:

| Folder | What is in it |
|---|---|
| `astro-doc-code/.astro/` | The lock files of the dev server and the preview server. |
| `astro-doc-code/node_modules/.astro/` | The build cache of Astro. |

## What each command checks

| Command | Update check | Install check | Version precheck |
|---|---|---|---|
| `dev`, `preview`, `build`, `doctor`, `<script>` | Yes. Not more than once in 6 hours. | Yes | Yes |
| `clean <command>` | Yes | Yes | Yes |
| `clean` alone | No | No | No |
| `stop`, `status`, `logs` | No | No | No |
| `--help` | No | No | No |

`stop`, `status` and `logs` ask you no questions. You use these commands when something
is already wrong. A question at that moment is not useful.

### The update check

The update check looks at the git remote. It offers to pull the new commits.

It runs one time in 6 hours. Before, it ran every time. That was correct when `./start`
was a rare command. It is not correct now, because you run `./start` about 20 times each
day. A network read can also stop for a long time on a bad connection.

Control these with environment variables:

| Variable | Effect |
|---|---|
| `START_SKIP_UPDATE_CHECK=1` | Never look at git. |
| `START_UPDATE_INTERVAL_HOURS=N` | Change the interval. `0` means every time. |
| `START_NONINTERACTIVE=1` | Never ask a question. Use the safe answer. |

### The install check

The check makes a hash of `package.json` and the lock file. It compares the hash with the
last install. If the two are different, it installs the dependencies again.

### The version precheck

`site.yaml` declares `engine_version`. This is the engine version that the content
targets. The engine supports a range of versions. The range is `MIN_CONTENT_VERSION` to
`ENGINE_VERSION`, in `src/loaders/engine-version.ts`.

The precheck compares the two, before anything starts:

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
[start]     migration/0.2.0_agent-log-status-vocabulary.py
[start]     migration/0.2.0_status-colors-to-css.py
[start]     migration/0.2.3_slug-form-links.py
```

To start anyway, set `START_SKIP_VERSION_CHECK=1`. The engine then refuses the content
itself.

> [!IMPORTANT]
> The engine has the same rule. This precheck does not replace it. It corrects **when**
> the rule applies.
>
> | Command | When the engine checks |
> |---|---|
> | `build`, `doctor` | During the build. This is correct. |
> | `dev` | At the **first request**. The server reports "ready" first. Then every page fails. |
> | `preview` | **Never.** Preview serves files that are already built. It never loads the config. |
>
> Before the precheck, `preview` could serve a `dist/` folder made from old content. No
> message told you.

The precheck reads the two version numbers from the TypeScript source. It does not keep a
copy of them. A copy is how two numbers become different from each other. If the precheck
cannot read a value, it writes a warning and continues. The engine stays the authority. A
precheck that guesses would become a new reason for a good project to fail.

## The three modes of Astro

Astro can serve this site in three ways. The commands above use two of them. The third
is possible, but this repository does not set it up today.

The mode is the `output` value in `astro.config.mjs`:

```js
output: isDev ? 'server' : 'static',
```

### Mode 1 — dev

`./start` uses this mode. Astro makes each page when the browser asks for it. Vite
changes the source code at the same time. This is what gives you hot reload.

| | |
|---|---|
| Start time | **Fast.** 2.4 s to ready. This is measured. |
| Page speed | **Medium.** Vite changes the code for each request. |
| New content | **Yes, immediately.** HMR sends the change to the browser. You do not reload the page. |
| Disk cost | **Very low.** 0.4 MB. This is measured. |
| Use it for | Writing content. Writing layouts. This is about 98% of the work. |

### Mode 2 — static, behind nginx

`./start build` uses this mode. The build makes every page one time and writes it to
`dist/`. A web server such as nginx then sends those files. Astro does no more work.

| | |
|---|---|
| Start time | **Slow to build, then instant.** 6.4 s for 1291 pages. This is measured. |
| Page speed | **Fastest.** nginx sends a file from the disk. Nothing renders a page. |
| New content | **No.** The pages are frozen. You must build again. |
| Disk cost | **High.** About 100 MB for each build. This is measured. |
| Use it for | Publishing the site. A CDN or a static host also works. |

### Mode 3 — SSR, with a node adapter

> [!WARNING]
> **This mode is not set up in this repository.** It needs `@astrojs/node` and a change
> to `output`. The numbers below are estimates, not measurements.

You build the site one time. The build makes the CSS and the JavaScript small, the same
as mode 2. It does **not** make the pages. Then a node process runs. The process makes
each page when the browser asks for it, from the markdown on the disk.

| | |
|---|---|
| Start time | **Fast** (estimate). There is no page build. |
| Page speed | **Fast** (estimate). Slower than a file. Much faster than dev, because Vite does not run. |
| New content | **Yes, when you reload the page.** There is no HMR. Nothing pushes the change. |
| Disk cost | **Low** (estimate). There is no 1291-page `dist/`. |
| Use it for | A live server that must follow the content on the disk. |

### Compare the three

| | dev | static + nginx | SSR + node |
|---|---|---|---|
| Optimized assets | No | **Yes** | **Yes** |
| Page speed | Medium | **Fastest** | Fast |
| Follows new content | **Yes, live** | No | Yes, on reload |
| Needs a build first | No | **Yes, every time** | Yes, one time |
| Needs a running process | Yes | **No** | Yes |
| Set up here today | **Yes** | **Yes** | No |

### How to choose

- **Write content or layouts?** Use dev. Nothing else gives you hot reload.
- **Publish to a CDN, GitHub Pages, or a plain nginx?** Use static. It is the fastest
  and the simplest. Nothing runs on the server.
- **Do you want the live site to follow the files on the disk?** Use SSR. You then run a
  node process, and nginx becomes a proxy.

SSR has one more effect, and it is large: **the 1291-page build stops existing.** So the
build time, the 100 MB `dist/`, and every incremental-build problem go away with it. The
cost is one node process, and a page render for each request.

The size of that render cost is not known. Measure it before you choose SSR. The page to
measure is the heaviest one — the issue index, with more than 1000 rows.

## Rules to remember

**Dev does not build.** Dev also does not read `dist/`. We removed `dist/` and served
every page, to prove this. Run `./start doctor` before you publish. A build error that dev
cannot show appears there.

**Dev and the build ask different questions.** Dev resolves one request through
`matchServerRoute()`. The build lists every address through `getStaticPaths()`. A page
address that exists two times stops the build. Dev cannot see it.

**Do not search the start message of the server.** In Astro 7 that message is a JSON
object. A search for the old Astro 5 text does not fail. It waits for all time. Read the
port, or run `./start status`.

**`pgrep` does not find these servers.** A background server runs
`node_modules/astro/bin/astro.mjs`. It does not run `node_modules/.bin/astro`. Use
`./start status`.

**A server can live longer than its terminal.** Astro starts the server as a separate
process. It does this even when you do not use `--detach`. Use `./start status` to find
it. Use `./start stop` to stop it. Do not use `kill`.

**`./start dev` attaches to a server that already runs.** It does not open a second port.
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

`scripts/` and `checks/` hold different kinds of file. You **run the project** with
`start.mjs` and `lib/`. You **ask the project questions** with `checks/`.

`mise.toml` puts `scripts/bin/` on PATH. This works inside this repository only. So you
can type `start` and `agent-ks-dev` from any folder here, and nowhere else.

## Read next

- [The repo check scripts](./20_development/08_repo-check-scripts.md) — what each check in
  `scripts/checks/` asks, and why none of them ship to a consumer.
- [The version gate](./30_versioning/02_version-gate.md) — the engine side of the version
  precheck.
- [Code structure](./01_overview/02_code-structure.md) — the source tree that `./start`
  builds.
