---
title: "Distribution, plugin, tooling and documentation surface"
agent: "claude (opus 5, 1M)"
---

# Surface 7 — distribution, the plugin, tooling, and the documentation debt

Scope audited: `plugins/agent-ks/` (the shipped Claude Code plugin and its CLI), the repo-root
`start` / `start.cmd` / `start.ps1` wrappers, `migration/`, `releases/` + `CHANGELOG.md`,
`mise.toml`, `.mcp.json`, `bin/agent-ks-dev`, `scripts/check-links.mjs`, `.github/workflows/`,
and the 159 documentation pages under `default-docs/data/dev-docs/` and
`default-docs/data/user-guide/`.

Every number below carries a confidence label: **measured** (a command was run),
**read** (the code or file was opened), **assumed** (inference, stated as such).

---

## Headline

The plugin's CLI has **37 commands, not the 11 the migration notes plan for**, and it is
already almost entirely decoupled from Astro — so absorbing it into a Go binary is a large,
mostly-unnecessary rewrite. Meanwhile the two numbers the distribution case rests on are both
wrong in the direction that matters: `node_modules/` is **419 MB, not ~250 MB** (worse than
claimed), and the embedded frontend payload is **24 MB raw / 6.1 MB gzipped, not the ~1–2 MB
budgeted** (much worse than claimed).

---

## 1. The `agent-ks` CLI

### 1.1 What it is

| Property | Value | Confidence |
|---|---|---|
| Language | JavaScript, ESM (`.mjs`), **no build step** | read |
| Required runtime | **bun only** — node is explicitly refused, not fallen back to | read |
| Entry point | `plugins/agent-ks/bin/agent-ks` (27 lines bash) + `agent-ks.cmd` (20 lines cmd) | measured |
| Dispatcher | `skills/agent-ks-docs/scripts/cli.mjs`, 109 lines | measured |
| Command registry | `skills/agent-ks-docs/scripts/_manifest.mjs`, 457 lines | measured |
| Commands | **37** | measured (`agent-ks help --json`) |
| Declared flags | **180** hand-written + an implicit `--help` on 36 of them (216 in the JSON dump) | measured |
| Commands offering `--json` | **32 of 37** | measured |
| Executable CLI code | **8,630 lines** of `.mjs` (9,024 under `scripts/` minus 394 lines of fixtures) | measured |
| Plugin prose (skills + references + commands + agent) | **7,977 lines** of markdown | measured |
| Plugin total, all tracked file types | **17,507 lines**, **1.4 MB** on disk | measured |
| npm dependencies at runtime | **zero** | measured (no bare-module import outside three fixture files) |

The shim is deliberately hard-failing rather than degrading. From `plugins/agent-ks/bin/agent-ks`:

> `BUN IS REQUIRED, and this refuses rather than falling back to node. […] frontmatter parsing
> goes through `Bun.YAML`, which node has no equivalent of, so node dies at the first command
> that reads a file. A fallback that always fails is worse than none.`

That is the *entire* bun coupling: `Bun.YAML` in `_frontmatter.mjs` (one call site, line 46).
Everything else in the CLI is `node:fs`, `node:path`, `node:url`, `node:child_process`.

### 1.2 The 37 commands, by group

Lead line: measured from the live manifest dump; the plugin-upgrade note's mapping table covers
11 of these.

| Group | Count | Commands |
|---|---|---|
| `issue` | 13 | `list` `show` `subtasks` `agent-logs` `set-state` `add-comment` `add-agent-log` `new-agent-log` `new-iteration` `new-plan` `new-stage` `new-subtask` `review-queue` |
| `check` | 8 | `blog` `config` `section` `issues` `legacy-tags` `skill-links` `link-form` `links` |
| `git` | 4 | `updated` `changed` `log` `commit` |
| `doc` | 3 | `list` `show` `search` |
| `blog` | 3 | `list` `show` `search` |
| `theme` | 1 | `tokens` |
| (top-level) | 5 | `help` `resolve-context` `find` `move` `img` |

The heaviest single command is `issues/check.mjs` at **954 lines**; the heaviest shared library is
`issues/_lib.mjs` at **616 lines**. `docs/move.mjs` (485 lines) and `_links.mjs` (455 lines)
together implement link-aware move/rename — a markdown-link parser, a resolver, and a rewriter.

### 1.3 What it reads from the framework

This is the load-bearing answer for the migration, and it is **almost nothing**.

| What | Which commands | Framework coupling | Confidence |
|---|---|---|---|
| `.env` → `CONFIG_DIR` → content root | all 37, via `_env.mjs` `resolveProjectContext()` | reads a `KEY=value` file. Nothing Astro-specific. | read |
| `default-docs/config/site.yaml` | `check config`, `theme tokens`, `check links` | plain YAML | read |
| `astro-doc-code/src/styles/` (built-in default theme CSS) | **`theme tokens` only** | hardcoded path `path.join(ctx.envDir, 'astro-doc-code', 'src', 'styles')` in `theme/tokens.mjs:48` | read |
| `astro-doc-code/dist/` (a completed build) | **`check links` only** | probes 3 candidate `dist/` locations, `check-content-links.mjs:126-133` | read |
| Git (`execFileSync git …`) | `git *`, `issue list` (derived dates) | portable | read |
| ImageMagick CLI (`magick`/`convert`) | `img` | external system binary, deliberately chosen over `sharp` to stay dependency-free | read |

**No script opens a socket, calls `fetch`, or imports `node:http`** — measured. 35 of 37 commands
need only files on disk. Two do not: `theme tokens` needs the framework *source tree*, and
`check links` needs a *build output*.

### 1.4 Against the three-stage doctrine

`CLAUDE.md` states the test plainly: *"Something that needs only the files on disk is usage-stage
and belongs in the plugin. Something that needs a build, a running server, or the framework source
is development-stage."*

Two commands fail that test today, and they are the two named above:

- 🔴 **`agent-ks check links`** is shipped in the plugin but its own manifest summary reads
  *"run `./start build` first"*. It needs a build. By the doctrine it is development-stage.
  There is already a development-stage twin — `scripts/check-links.mjs`, 403 lines, at the repo
  root, which fetches real URLs over HTTP against a running server and whose header says
  *"DEVELOPMENT-STAGE TOOL. It belongs to this repo and never ships to a consumer."* So the repo
  carries **two renderer-link checkers, one in each tree**, and the plugin's one is on the wrong
  side of its own line.
- ⚠️ **`agent-ks theme tokens`** hardcodes `astro-doc-code/src/styles`. It happens to work because
  a consumer clones the whole framework — but the moment distribution changes to a binary, that
  path does not exist and the command breaks. It is the single place the CLI knows the engine's
  folder name.

Neither is a migration blocker. Both are pre-existing debt the migration would *force* a decision on.

### 1.5 Two deliberate mirrors of framework TypeScript

Three plugin files state in their own headers that they duplicate engine logic and must be kept
in sync (read):

| Plugin file | Mirrors | Lines |
|---|---|---|
| `scripts/_jsonc.mjs` | `astro-doc-code/src/loaders/settings-file.ts` | 69 |
| `scripts/_order-prefix.mjs` | `astro-doc-code/src/parsers/core/order-prefix.ts` | 67 |
| `scripts/issues/_lib.mjs` (status vocabulary) | `astro-doc-code/src/loaders/issue-status.ts` | 616 (partially) |

This is the strongest *pro-absorption* argument on this surface: a Go binary that is both engine
and CLI collapses those mirrors into one implementation. It is also the only one — see §1.7.

### 1.6 The performance claim, measured

The plugin-upgrade note (`notes/claude-plugin-upgrade/02_subcommand-migration.md`) claims
*"Most of the speedup is bun startup tax (~150 ms per invocation)"* and projects 30–50× wins.

Lead line: wall-clock, this machine, warm cache, N repetitions divided out. **Measured.**

| Operation | Note's claimed baseline | Measured baseline | N | Note's projection | Realistic ceiling |
|---|---|---|---|---|---|
| bare `bun -e ''` (startup tax) | ~150 ms | **1 ms** | 20 | — | — |
| `agent-ks issue list` (26 issues) | ~250 ms | **31 ms** | 20 | ~5 ms (50×) | ~6× |
| `agent-ks check issues` (full tracker) | — | **99 ms** | 5 | — | — |
| `agent-ks check section` (95 pages) | ~1,500 ms | **30 ms** | 5 | ~40 ms (35×) | ~6× |
| `agent-ks check link-form` (whole tree) | — | **98 ms** | 1 | — | — |

The claimed bun startup tax is **overstated by roughly 150×**. Every baseline in that table is
overstated by 8–50×. The note's closing arithmetic — *"For Claude calling these 50× in a session,
the cumulative time saved is ~10 s"* — recomputes on measured numbers to **~1.3 s per 50 calls**.

Note that `check section` at 30 ms is *already faster* than the note's projected Go time of 40 ms.
🔴 **The performance case for absorbing the CLI does not survive measurement.**

### 1.7 Would a Go binary absorb this CLI, and what does that cost?

**Cost.** 8,630 lines of working, tested, zero-dependency JavaScript rewritten in Go, plus a
byte-for-byte JSON-output parity obligation across **32 commands** (the note names this as a hard
contract and it is right to — agent loops parse that schema). The three fixture files
(`fixtures/*.test.mjs`, 394 lines) are the only existing parity harness, and they test frontmatter
parsing, code-span handling and link coverage — not command output. So the snapshot corpus the
note proposes does not exist yet and is itself work.

**Buys.**

| Gain | Real? | Note |
|---|---|---|
| Collapses the 3 engine/plugin logic mirrors | ✅ yes | the only unambiguous structural win |
| Removes the bun requirement | ✅ yes | but the requirement is *one* API call, `Bun.YAML` — a 20-line YAML shim removes it today without Go |
| 30–50× faster commands | ❌ no | measured ceiling is ~6× on 30 ms operations (§1.6) |
| "Works in CI without bun" | 🟡 partly | true, but the plugin only runs where Claude Code runs today, and Claude Code environments have bun |
| Compile-time schema types | ✅ yes | genuine, modest |

**Against.** A Go CLI must ship as a **second distribution channel**. Claude Code puts a plugin's
`bin/` on `$PATH` automatically (documented at `default-docs/data/dev-docs/25_plugins/05_creating-plugins/04_bin-wrappers.md`,
170 lines). A Go binary is not in the plugin cache — the plugin would have to either bundle
per-platform binaries (5 platforms × ~30 MB = ~150 MB of plugin payload, against 1.4 MB today) or
require a separate install step before any command works. The note's §"When the binary isn't
installed" fallback section acknowledges this and does not solve it.

---

## 2. The `start` wrappers

Lead line: line counts measured; behaviour read.

| File | Lines | Role |
|---|---|---|
| `start` | 251 | bash entrypoint, POSIX platforms |
| `start.ps1` | 232 | full PowerShell port — same preflight, same skip conditions |
| `start.cmd` | 5 | cmd launcher that bypasses PowerShell execution policy |
| **Total** | **488** | |

### What the preflight actually does, step by step

| # | Step | Lines (bash) | Survives a single binary? |
|---|---|---|---|
| 0 | **Update check** — fetch upstream, offer `Y/n` fast-forward pull. Bails on: no TTY, no git, no upstream, dirty tree, diverged, offline, `START_SKIP_UPDATE_CHECK=1` | ~50 | 🟡 **transformed** — becomes `doc-engine upgrade` / self-update against a release endpoint. Comparable work, different mechanism |
| 0b | **Shallow-clone check** — detect consumer-mode full-history clone, offer in-place shrink, remember a decline via `.git/.start-shallow-declined` | ~60 | 🟢 **gone** — a binary has no clone |
| — | `clean` — wipe `.astro/`, `dist/`, `node_modules/.vite/` | ~10 | 🟢 **gone** |
| 1 | **Runner detection** — prefer bun, fall back to npm, hard-fail if neither | ~14 | 🟢 **gone** |
| 2 | **Install-if-stale** — hash `package.json` + lockfile into `node_modules/.start-deps-stamp`; reinstall on mismatch. Plus a red npm disk warning with an interactive confirm | ~55 | 🟢 **gone** |
| 3 | **Build sanity check** — run a full production build before launching dev; abort on failure | ~7 | 🟡 **transformed** — a Go server has no build-before-dev step, but *content* validation before serving is still wanted |
| 4 | **Launch dev** | ~3 | 🟡 becomes `doc-engine dev` |

**Roughly 140 of 251 bash lines (56%) become unnecessary**; the rest is replaced by different
mechanisms of similar size. Measured line attribution, so treat the 56% as ±10%.

The honest read: the wrappers are not a big cost centre either way. 488 lines across three files,
of which the Windows port is a genuine maintenance tax (§7).

---

## 3. Distribution today

### How a consumer installs and runs it now

Read from `README.md` and `default-docs/data/user-guide/05_getting-started/02_installation.md`:

```
1. /plugin marketplace add sidhanthapoddar99/sids-plugin-marketplace     ← in Claude Code
2. /plugin install agent-ks@sids-plugin-marketplace
3. /reload-plugins
4. /agent-ks-init                                                        ← scaffolds config/ + data/
5. git clone --depth 1 https://github.com/…/agent-knowledge-system.git   ← the framework, as a subfolder
6. cd agent-knowledge-system/ && ./start                                 ← installs deps, builds, serves
```

Prerequisites stated on the install page: **Node 18+ or Bun 1.0+, Git, an editor.** The plugin
additionally requires **bun specifically** (the shim refuses node). `agent-ks img` additionally
requires **ImageMagick**. So the real prerequisite list is longer than the page says: bun + git +
ImageMagick.

The plugin ships via a **`git-subdir` marketplace source** pointing at this repo — so plugin and
engine are versioned in one repo but installed through two entirely different channels
(marketplace vs `git clone`). Any migration inherits that split.

### Measured disk cost

Lead line: `du -sh`, this machine, after a full build. **Measured.**

| Item | Measured | Note's claim | Verdict |
|---|---|---|---|
| `astro-doc-code/node_modules/` | **419 MB** (463 top-level packages) | "~250 MB" / "~150 MB" | ❌ **understated by 1.7–2.8×** |
| `astro-doc-code/dist/` | **166 MB** | not stated | — of which **116 MB is `dist/todo/`**, the pre-rendered issue tracker |
| `astro-doc-code/dist/_astro/` (the client bundle) | **24 MB** raw / **6.1 MB** gzipped, 548 files | "~1–2 MB compressed" | ❌ **understated by 3–6×** |
| `.git/` | 31 MB (full history; framework-dev clone) | "~6 MB packed" per the user-guide | user-guide figure is for a fresh clone; unverified |
| whole repo, post-build | **648 MB** | — | — |
| `plugins/agent-ks/` | **1.4 MB** | — | — |

The repo's own user-guide page (`05_getting-started/07_storage-and-footprint.md`) already states
**~420 MB** for `node_modules` and **~115 MB** for `dist` — so the *documentation* is accurate and
the *architecture note* is the one that is off. The architecture note's 250 MB appears to be a
guess, not a measurement.

⚠️ **The `node_modules` number is not the whole truth in either direction.** The storage page
explains, correctly, that bun hardlinks from a global content-addressed cache, so ten projects
showing "419 MB each" can genuinely occupy ~419 MB total. The 419 MB is *apparent* size for the
first project and near-zero marginal for each subsequent one. On npm it is real per project — and
`./start` prints a red warning with a confirm before any npm install for exactly that reason.

**What I could not verify:** the ~25 MB Go binary figure. There is no Go code in this repo (`find`
returned no `.go` files, no `go.mod`). That number is a projection, and §4 argues it is low.

---

## 4. The embedded payload — the number the binary budget gets wrong

The distribution note budgets `**Embedded dist/** (compressed) ~1–2 MB` and `**CodeMirror bundle**
~180 KB compressed`. Measured, the built client bundle at `astro-doc-code/dist/_astro/` is:

| Chunk | Size (raw) | What it is |
|---|---|---|
| `viewer-static.min.*.js` | **4,005 KB** | the vendored draw.io viewer (`astro-doc-code/src/vendor/drawio/`, 4.0 MB on disk) |
| `subset-shared.chunk.*.js` | 1,781 KB | Excalidraw font subset |
| `percentages-*.js` | 1,119 KB | mermaid diagram chunk |
| `index.C8vOQZ3E.js` | 780 KB | app entry |
| `emacs-lisp` / `cpp` / `wasm` / `wolfram` / `typescript` / `jsx` / `tsx` / … | 103–762 KB each | **238 files, ~7 MB total**, TextMate grammars for the live editor's client-side highlighting |
| `mermaid.core.*.js` | 480 KB | mermaid core |
| `cytoscape.esm.*.js` | 432 KB | mermaid's graph engine |
| `codemirror-setup.*.js` | 299 KB | CodeMirror — vs the note's 180 KB *compressed* figure |
| `katex.*.js` | 259 KB | math |
| **Whole folder** | **24 MB raw / 6.1 MB gzipped** | 548 files |

Composition, measured: 29 files above 100 KB account for 14 MB; the 519-file tail accounts for
9.3 MB.

**What this means for the binary size budget.** Go's `embed.FS` stores files *uncompressed*; to
ship 6 MB instead of 24 MB you must pre-compress at build time and serve `Content-Encoding: gzip`
(routine, but it is work and it complicates range requests and the editor's blob loading).

Reconstructing the budget with measured numbers, **assumed** for the Go-side rows:

| Component | Note's estimate | Measured / re-estimated |
|---|---|---|
| Go runtime + stdlib | ~5 MB | ~2–5 MB (assumed) |
| goldmark + **chroma** | ~3 MB | chroma embeds ~250 lexers; ~8–10 MB is typical (assumed) |
| chi + slog + fsnotify + git lib + parsers | ~4 MB | ~4 MB (assumed) |
| Cobra + subcommands + misc | ~4–6 MB | ~4–6 MB (assumed) |
| **Embedded `dist/`** | **~1–2 MB** | **6.1 MB pre-compressed, 24 MB raw** (measured) |
| **Total stripped** | **~25–35 MB** | **~25 MB if the shiki grammars go server-side and everything is pre-compressed; ~45 MB otherwise; ~65 MB if embedded raw** (assumed) |

The 7 MB of TextMate grammars is the swing factor. They exist because the live editor's preview
highlights code **in the browser**. Moving highlighting server-side to chroma deletes them —
but that changes the editor from local-preview to round-trip, which is a product decision, not a
packaging one. **Nobody has made it.**

⚠️ Draw.io alone (4 MB) is a vendored third-party viewer that cannot be replaced by a Go library.
It ships in the binary or it ships beside it. Either way, "~25 MB, like Hugo" is not the shape of
this artefact — Hugo embeds no editor, no diagram viewers and no whiteboard.

---

## 5. Documentation debt

This is the cost nobody has budgeted, and it is the largest single number on this surface.

Lead line: page counts and line counts measured by `find` + `wc`; classification by grep over
newline-flattened text.

| Corpus | Pages | Lines |
|---|---|---|
| `default-docs/data/dev-docs/` | **64** | — |
| `default-docs/data/user-guide/` | **95** | — |
| **Total** | **159** | **29,050** |

### Two measurements, two severities

| Band | Test | Pages | Lines | Meaning |
|---|---|---|---|---|
| **Hard debt** | names a `.astro` file, `Astro.props`, `import.meta.glob`, `astro.config`, `define:vars`, `data-astro-*`, `astro:*`, or `@astrojs/*` | **44** (27.7% of 159) | **11,068** | describes machinery that ceases to exist — rewrite, not find-and-replace |
| **Soft debt** | mentions `astro`, `vite`, `node_modules`, `bun`, `npm run` or `package.json` anywhere | **72** (45.3%) | — | includes the 44 above; the other 28 need targeted edits |

### Hard debt by section

| Section | Pages hit | Pages total | What is invalidated |
|---|---|---|---|
| `dev-docs/10_layouts/` | **12** | 13 | *Every page but one.* Docs/blog/custom layout overviews, data interfaces, component inventories, conventions — all describe `.astro` component files |
| `dev-docs/05_architecture/` | **10** | 20 | `02_routing.md` (`[...slug].astro`), `03_data-loading.md`, the whole `05_layout-internals/` subtree (6 of 8 pages), `06_optimizations/03_optimization-details.md` |
| `dev-docs/15_scripts/` | 4 | 7 | `05_overview.md`, `50_creating-scripts.md`, `12_artifacts.md`, `18_tooltip.md` — client-script authoring, framed around Astro's script bundling |
| `dev-docs/20_development/` | 3 | 7 | `02_layout-switcher.md` (dev-toolbar app), `03_server-vs-static-mode.md` (Astro output modes), `04_troubleshooting.md` |
| `dev-docs/01_overview/` | 1 | 1 | `02_code-structure.md` — the `src/` tree map |
| `user-guide/25_themes/` | 3 | 22 | `01_overview.md`, `03_theme-structure.md`, `05_component-styles/03_navbar-styles.md` |
| `user-guide/10_configuration/` | 3 | 15 | `02_env.md`, `04_navbar.md`, `05_footer.md` |
| `user-guide/05_getting-started/` | 3 | 7 | `02_installation.md`, `03_aliases.md`, `06_init-and-template.md` |
| `user-guide/16_layout-system/` | 2 | 3 | `01_overview.md`, `03_custom-layout-styles.md` |
| `user-guide/20_custom-pages/` | 1 | 3 | `03_creating-custom-layouts.md` |
| `user-guide/19_issues/` | 1 | 22 | `03_folder-structure.md` |
| `user-guide/15_writing-content/` | 1 | 11 | `10_naming-and-sidebar/01_overview.md` |

Densest pages by Astro-mention count (measured): `dev-docs/05_architecture/05_layout-internals/04_components.md`
(65 mentions), `.../01_overview.md` (37), `user-guide/16_layout-system/03_custom-layout-styles.md`
(34), `dev-docs/10_layouts/04_custom-layout/03_components.md` (34).

### What survives untouched

| Survives | Pages | Why |
|---|---|---|
| `user-guide/19_issues/` | 21 of 22 | tracker schema, vocabulary, folder anatomy — filesystem facts |
| `user-guide/25_themes/` | 19 of 22 | the theme *contract* is CSS variables, runtime-agnostic |
| `user-guide/15_writing-content/` | 10 of 11 | markdown authoring rules |
| `dev-docs/25_plugins/` | 9 of 11 | Claude Code plugin authoring — orthogonal to the engine |
| `dev-docs/30_versioning/` | 3 of 5 | the version *contract*; two pages name `engine-version.ts` |
| `user-guide/17_docs/`, `18_blogs/` | 10 of 10 | content format |

### The plugin's own prose is a second corpus

Separate from the 159 pages, and separate again from the note's estimate of "5 reference files":

| Plugin doc | Lines |
|---|---|
| `skills/agent-ks-issues/` SKILL + 20 references | 459 + 3,091 |
| `skills/agent-ks-artifacts/` SKILL + 12 references | 269 + 1,498 |
| `skills/agent-ks-docs/` SKILL + 7 references | 122 + 1,260 |
| 4 slash commands + 1 agent + README + CONTRACT | ~1,100 |
| **Total plugin prose** | **7,977 lines** |

14 of those files mention astro / `./start` / `node_modules` / bun (measured). Most are one-line
command examples; `skills/agent-ks-docs/references/cli-toolkit.md` (105 lines) is the command
surface itself.

> The `notes/claude-plugin-upgrade/` notes plan against **3 skills, 5 reference files,
> 2 slash commands, 11 wrappers**. Actual, measured: **3 skills, 39 reference files,
> 4 slash commands, 1 agent, 37 commands.** The Phase-C "what survives" tree in
> `02_subcommand-migration.md` shows only `agent-ks-docs` — it silently drops
> `agent-ks-issues` and `agent-ks-artifacts`, which are together 5,318 lines of prose.

### Documentation debt, totalled

**~11,000 lines of documentation require rewriting, not editing; a further ~18,000 lines require
a review pass to confirm they don't.** At a rate of 300–500 reviewed-and-corrected lines per
working day for technical documentation that must be *verified* against new code (assumed), that
is **4–8 person-weeks**, and it cannot start until the Go code it describes exists.

---

## 6. `migration/` and the engine-version discipline

### What exists

| Item | Count | Lines |
|---|---|---|
| Migration scripts (`migration/<to-version>_<statement>.py`) | 8 | **2,577** |
| Release notes (`releases/<version>.md`) | 8 + README | **1,190** |
| `CHANGELOG.md` | 1 | index only, one row per release |
| Release automation (`.github/workflows/release.yml`) | 1 | 84 |

Scripts, in version order: `0.1.0_done-to-state.py` (262), `0.1.1_state-to-status.py` (282),
`0.1.2_legacy-custom-tags.py` (223), `0.1.2_root-settings-schema.py` (328),
`0.2.0_agent-log-slot-numbering.py` (456), `0.2.0_agent-log-status-vocabulary.py` (458),
`0.2.0_status-colors-to-css.py` (247), `0.2.3_slug-form-links.py` (321).

Contract (read from `migration/README.md`): **Python, stdlib only**, self-documenting docstring,
detect + migrate in one file, `--dry-run`, idempotent. Explicitly *"not part of the live CLI path"*.

### How this interacts with a runtime swap

🟢 **The migration scripts are the single most portable thing on this surface.** They are stdlib
Python operating on markdown, JSON and YAML files. They do not import the engine, do not run a
build, and do not know Astro exists. A Go runtime inherits all 8 unchanged. The `runtime: 'py'`
field already in `_manifest.mjs` (with a working interpreter probe in `_runtime.mjs`, 57 lines)
shows the polyglot door is already open.

🔴 **The version *series* is where the migration has an unresolved problem, and the notes do not
address it at all.** The current contract (`astro-doc-code/src/loaders/engine-version.ts`,
read) is:

```
ENGINE_VERSION      = '0.2.4'   ← what this engine is
MIN_CONTENT_VERSION = '0.2.0'   ← oldest content it still parses
                                  site.yaml → engine_version must sit in [floor, engine]
```

The gate is a **hard startup error**. `site.yaml` carries `engine_version`, and the file's own
comment (`X.Y.Z` — X is *"reserved: beta (0) vs production"*) reserves the first place for the
beta/production transition, not for a runtime change.

Three unanswered questions, and each has a different consumer consequence:

| Option | What a consumer sees | Cost |
|---|---|---|
| **Continue the series** (Go engine ships as `0.3.0`) | their existing `engine_version: "0.2.4"` passes the floor and loads. Silent, correct-looking, and **wrong if any content format shifted** | requires the Go engine to accept every 0.2.x format byte-for-byte, forever |
| **Fork the series** (Go engine is `go-1.0.0`, Astro engine frozen at `0.2.x`) | two version namespaces, two `MIN_CONTENT_VERSION` floors, and `compareFormatVersions()`'s `/^\d+\.\d+\.\d+$/` regex rejects the new form | the gate itself needs rewriting; the 8 existing migration scripts' `(X, Y]` ordering rule breaks across the fork |
| **Restart at `1.0.0`** | every existing tree declares `0.2.4` and is now *below* a floor of `1.0.0` → **every consumer's site hard-stops on startup** with a message pointing at migration scripts that don't apply | needs a bridging migration whose only job is to rewrite one YAML line, plus a carve-out in the gate |

The release discipline (`releases/README.md`, `.github/workflows/release.yml`) is enforced
mechanically — **pushing a tag with no `releases/<version>.md` fails the tag.** That machinery
carries over unchanged. What does not carry over is the *shape* of the note: every existing note
is written to a reader whose *build stopped with a version error*. A runtime-swap release has a
reader whose **binary doesn't exist yet**. That is a genuinely new document type and there is no
template for it.

---

## 7. Windows

### What exists today

| File | Lines | Notes |
|---|---|---|
| `start.ps1` | 232 | full port of `start` — update check, shallow check, clean, runner detection, install-if-stale, npm disk warning, build check, dev launch. Same skip conditions. |
| `start.cmd` | 5 | launches `start.ps1` with `-NoProfile -ExecutionPolicy Bypass` |
| `plugins/agent-ks/bin/agent-ks.cmd` | 20 | cmd twin of the bash shim; same bun-required hard-fail |

So Windows is supported through **three hand-maintained parallel files totalling 257 lines**, of
which `start.ps1` must be kept behaviourally identical to a 251-line bash script. Read: the
PowerShell file's comments repeatedly say *"Mirrors ./start (bash)"* — the sync is enforced by
convention only, with no test.

### What changes with a cross-compiled binary

| Today | After | Verdict |
|---|---|---|
| `start.ps1` + `start.cmd` (237 lines) maintained in lockstep with `start` (251 lines) | one binary, `GOOS=windows GOARCH=amd64` | 🟢 **real win** — 488 lines of triplicated shell logic become zero |
| `agent-ks.cmd` (20 lines) mirroring `agent-ks` (27 lines) | gone if the CLI is absorbed | 🟢 win |
| Windows users need bun or node installed | need nothing | 🟢 win |
| `agent-ks img` needs ImageMagick (`winget install ImageMagick.ImageMagick`) | still needs it, unless image work moves into Go | 🟡 unchanged |
| Path handling (`node:path` normalises separators) | Go's `filepath` does the same | 🟢 neutral |
| Interactive prompts (`Read-Host` vs `read -r -p`) | one Go implementation | 🟢 win |
| Not tested on Windows in CI — there is exactly one workflow (`release.yml`) and it runs `ubuntu-latest` | a cross-compiled binary is *built* for Windows but still not *tested* on it | ⚠️ **unchanged risk, now with more surface**: today a Windows failure is in 232 lines of PowerShell; after, it is anywhere in the runtime |

⚠️ Windows support is the **strongest single argument** on this surface for the migration. It is
also the one where "cross-compiles cleanly" is being mistaken for "works" — nothing in this repo
tests Windows today, and a Go binary does not change that.

---

## 8. Claims from the architecture notes, checked against code

Lead line: each claim as written in the notes, checked against the repo.

| Claim | Where | Verdict | Evidence |
|---|---|---|---|
| "The 11 plugin commands (renamed to subcommands)" — listed under **What stays unchanged** | `notes/architecture/01_overview.md` | ❌ **false** | 37 commands, 180 declared flags, 32 with `--json`. Measured via `agent-ks help --json`. The mapping table in `notes/claude-plugin-upgrade/02_subcommand-migration.md` covers 11 and omits 26 — including all 6 scaffolding verbs (`new-agent-log`, `new-iteration`, `new-plan`, `new-stage`, `new-subtask`), all 4 `git` verbs, all 3 `doc` verbs, all 3 `blog` verbs, `theme tokens`, `find`, `move`, `img`, `resolve-context`, and 5 of the 8 `check` verbs |
| "~25 MB binary instead of ~250 MB `node_modules/`" | `issue.md` "Why" | ❌ **both numbers wrong** | `node_modules` measured at **419 MB** (`du -sh`). Binary side unverifiable (no Go code exists), but §4 shows the embedded payload alone is 6.1 MB gzipped / 24 MB raw against a budgeted 1–2 MB |
| "node_modules/ for the runtime (~150 MB)" — what we delete | `notes/architecture/01_overview.md` | ❌ **false** | 419 MB measured, 463 top-level packages |
| "**Embedded `dist/`** (compressed) ~1–2 MB" | `notes/architecture/04_distribution-single-binary.md` | ❌ **understated 3–6×** | `dist/_astro` = 24 MB raw, 6.1 MB gzipped, 548 files. Measured |
| "**CodeMirror bundle** (in dist/) ~180 KB compressed" | same | ❌ **understated** | `codemirror-setup.*.js` alone is 299 KB *raw*; the editor additionally pulls ~7 MB of TextMate grammars across 238 files |
| "Most of the speedup is bun startup tax (~150 ms per invocation)" | `notes/claude-plugin-upgrade/02_subcommand-migration.md` | ❌ **false, by ~150×** | `bun -e ''` measured at **1 ms** (20 iterations, 0.020 s total) |
| "`agent-ks check section` (large) ~1.5 s → Go ~40 ms (35×)" | same | ❌ **false** | measured at **30 ms** over the 95-page user-guide (5 iterations, 0.150 s). Already faster than the projected Go time |
| "`agent-ks issue list` (12 issues) ~250 ms" | same | ❌ **false** | **31 ms** over **26** issues (20 iterations, 0.620 s) |
| "3 skills… 5 reference files… 2 slash commands" | `notes/claude-plugin-upgrade/01_overview.md` and `03_skill-and-references.md` | 🟡 **partly holds** | 3 skills ✅. **39** reference files across the three skills, not 5 (the note counts only `agent-ks-docs`, and even there lists a non-existent `issue-layout.md` while omitting `cli-toolkit.md`, `doc-migration.md`, `images.md`). **4** slash commands, not 2 — `agent-ks-fast-index-check` and `agent-ks-quick-idea-note` are missing, as is the `agent-ks-index-checker` agent (328 lines) |
| "`bun` required on PATH for plugin → just `doc-engine`" | `notes/claude-plugin-upgrade/01_overview.md` | ✅ **holds**, but understates the alternative | bun coupling is exactly one call, `Bun.YAML.parse` at `_frontmatter.mjs:46`. A stdlib YAML shim removes it without any Go |
| "Reference files — **Unchanged** in content; minor command renames inline" | same | 🟡 **partly holds** | true for writing rules; false for `cli-toolkit.md` (105 lines, the command surface) and for `settings-layout.md` (442 lines) and `layouts/docs-layout.md` (306 lines), which describe layout and settings schemas the architecture-update note itself proposes to reshape |
| "Two-mode operation (consumer / dogfood) stays unchanged, simplified" | `notes/architecture/01_overview.md` | 🟡 **partly holds** | the *content* side is portable, but `_env.mjs` resolves the mode by walking for `.env` → `CONFIG_DIR`, with a downward probe at four hardcoded convention paths and a git-worktree boundary rule (146 lines of resolution logic). A binary invoked from an arbitrary cwd needs all of it reimplemented, and `theme tokens` additionally hardcodes `astro-doc-code/src/styles` |
| "Tracker schema (settings.json, frontmatter, agent-log/comments) stays unchanged" | same | ✅ **holds** | nothing in the tracker format is Astro-coupled. The 8 migration scripts confirm it: all are stdlib-Python file rewriters |
| "`doc-engine docs check section …` — validation rules port verbatim from the existing `.mjs` scripts" | `notes/claude-plugin-upgrade/02_subcommand-migration.md` | 🟡 **plausible but underscoped** | the rules do port; the volume does not match the framing. `issues/check.mjs` alone is 954 lines, `_lib.mjs` 616, `_links.mjs` 455, `docs/move.mjs` 485 |
| "In Go, [validators] read the same Go modules directly — no schema duplication" | same | ✅ **holds, and it is the real win** | three plugin files declare themselves mirrors of engine TS (`_jsonc.mjs`, `_order-prefix.mjs`, `issues/_lib.mjs`) |
| "Hugo: ~25 MB (similar reference point — Hugo is the precedent)" | `notes/architecture/04_distribution-single-binary.md` | ⚠️ **misleading comparison** | Hugo embeds no live editor, no draw.io viewer (4 MB here), no Excalidraw, no mermaid, no CodeMirror, and no CRDT sync layer |

---

## 9. What is lost or degraded

| Item | Severity | Why | Mitigation |
|---|---|---|---|
| **8,630 lines of working, zero-dependency CLI** must be rewritten in Go to keep 37 commands and 32 JSON schemas | **major** | it is the largest single body of *finished, shipped* code on this surface, and the measured performance gain that justifies rewriting it is ~6× on 30 ms operations | keep the `.mjs` CLI. Nothing forces absorption: the CLI reads files, the binary serves files, and they can coexist on one machine. The `runtime` field in `_manifest.mjs` already anticipates polyglot commands |
| **~11,000 lines of documentation invalidated** across 44 pages; ~18,000 more need a verification pass | **major** | it is unbudgeted in every note, cannot begin before the Go code exists, and stale developer docs are worse than none — they teach a machine that no longer exists | phase it by section: `dev-docs/10_layouts/` (12 pages) and `dev-docs/05_architecture/05_layout-internals/` (6 pages) are the concentrated cost and can be deleted-and-rewritten rather than edited |
| **Plugin distribution channel breaks** — Claude Code auto-PATHs a plugin's `bin/`, but cannot ship a 30 MB × 5-platform binary set | **major** | today `/plugin install` is the entire install for the CLI. After, the CLI needs a second, separate install step before any command works | keep the `.mjs` CLI in the plugin as the *always-available* surface and let the binary be the server. This is what the three-stage doctrine already says |
| **Binary size budget is wrong by 2–3×** | **major** | the "25 MB vs 250 MB" line is the headline consumer benefit, and the true comparison is nearer 45 MB vs 419 MB — still a win, but not the stated one, and the *disk* comparison is further softened by bun's cross-project hardlinking | pre-compress the embedded `dist/`; decide whether the editor's 7 MB of TextMate grammars can move server-side to chroma |
| **`agent-ks theme tokens`** breaks — it hardcodes `astro-doc-code/src/styles` | **minor** | one path constant, one command | the Go binary serves the resolved token map from its own theme loader; the CLI verb becomes an HTTP call or is absorbed |
| **`agent-ks check links`** loses its `dist/` | **minor** | it probes three `astro-doc-code/dist` locations | it should not have been in the plugin (§1.4). Fold it into `scripts/check-links.mjs`, the dev-stage twin that already exists and already does it better |
| **Engine version series has no defined continuation** | **major** | all three options (continue / fork / restart) break something: silent format mismatch, a gate regex rewrite, or every consumer hard-stopping at startup | decide *before* writing Go, not after. A bridging migration whose only job is rewriting `engine_version` is cheap if planned and impossible to retrofit |
| **488 lines of triplicated shell** (`start` + `start.ps1` + `start.cmd`) | **none — this is a gain** | the binary deletes runner detection, install-if-stale, cache-clean and build-check outright | — |
| **Windows parity maintained by convention, not by test** | **minor, and pre-existing** | one CI workflow, `ubuntu-latest` only. Cross-compiling does not add a test | add a Windows CI job — it is worth doing today, independent of any migration |
| **`migration/` scripts** | **none** | 2,577 lines of stdlib Python operating on files; the runtime is invisible to them | — |
| **Release machinery** (`release.yml`, `releases/`, `CHANGELOG.md`) | **none** | tag-triggered, note-enforced, runtime-agnostic | goreleaser would sit alongside it, not replace it |
| **`mise.toml` / `bin/agent-ks-dev`** (the two-tree discipline: repo source vs installed plugin) | **minor** | the shim exists because scripts resolve their target from where *they* live. A binary resolves from cwd, so the "which tree did I just run" problem changes shape rather than disappearing — and the version line `agent-ks --version` prints (version + tree path) is a real diagnostic that a single global binary loses | `doc-engine version` should print the binary path and the resolved content root, same as today |

---

## 10. Port cost for this surface

Lead line: this surface only — not the engine, not the layouts, not the editor.

| Component | Lines today | Rewrite verdict | Effort (assumed) |
|---|---|---|---|
| CLI (37 commands, 8,630 lines `.mjs`) | 8,630 | straight port, but large; JSON parity across 32 commands is the gate | **4–6 weeks** |
| JSON output parity harness (does not exist) | 0 | net-new | **1 week** |
| `start` / `start.ps1` / `start.cmd` | 488 | ~56% deleted, rest becomes Cobra subcommands | **3 days** |
| Distribution (goreleaser, install.sh, install.ps1, Homebrew tap, Docker, self-update) | 0 | net-new, well-trodden | **1–2 weeks** |
| Plugin restructure (shims, skill command sweeps, 39 reference files) | 7,977 prose | mechanical + judgement | **1 week** |
| `migration/` scripts | 2,577 | **no change** | 0 |
| Release machinery | 1,274 | **no change**, plus one new note type | **2 days** |
| Version-series decision + bridging migration | — | design decision, then ~300 lines Python | **3 days** |
| Documentation rewrite (44 hard pages / 11,068 lines) | 11,068 | rewrite | **4–8 weeks** |
| Documentation verification pass (remaining 115 pages / ~18,000 lines) | ~18,000 | review | **2 weeks** |
| **Total, this surface** | **~40,000 lines touched** | | **13–21 weeks solo** |

Confidence: **measured** for every line count and every timing; **assumed** for every effort
estimate. The documentation figure is the one most likely to be under-estimated — it is the only
row that cannot be parallelised with the engine work, because it documents code that does not
exist yet.

---

## 11. Open questions

1. **Does the CLI get absorbed at all?** The measured performance case is ~6×, not 30–50×. The
   only unambiguous structural gain is collapsing three engine/plugin logic mirrors. Against that:
   8,630 lines rewritten, 32 JSON schemas to hold byte-stable, and the plugin loses its
   auto-PATH install path. Coexistence is a real option nobody has costed.
2. **Does the engine version series continue, fork, or restart?** All three break something
   (§6). Nothing in `notes/` addresses it, and it cannot be retrofitted after the first Go release.
3. **Do the 238 TextMate grammars (7 MB) move server-side?** This is the single largest lever on
   binary size, and it is a product decision about the live editor's preview, not a packaging one.
4. **How does the plugin ship a binary?** Claude Code's plugin cache auto-PATHs `bin/`. Five
   platform binaries at ~30 MB is ~150 MB of plugin payload against 1.4 MB today. If the answer is
   "the user installs it separately", the plugin's install story goes from three slash commands to
   three slash commands plus a shell installer.
5. **Who owns `agent-ks img`?** It shells out to ImageMagick. In Go that is either the same shell-out
   (unchanged), a CGo binding (bad), or a pure-Go re-implementation that loses webp/avif quality
   parity. Nothing in the notes mentions it.
6. **Does Windows get a CI job?** The migration's strongest argument on this surface is Windows,
   and the repo has never tested Windows. Cross-compiling produces an artefact, not a passing test.
7. **What replaces `agent-ks --version` printing its own tree path?** That line exists because two
   commands can report the same version over different trees. A single global binary re-creates
   exactly that ambiguity between the binary's version and the content tree it is standing in.

---

## Reference index — files read for this audit

Plugin: `plugins/agent-ks/.claude-plugin/plugin.json` · `bin/agent-ks` · `bin/agent-ks.cmd` ·
`skills/agent-ks-docs/scripts/{cli,_manifest,_env,_runtime,_frontmatter,theme/tokens,check-content-links,images/_lib}.mjs` ·
all 59 `.mjs` and 53 `.md` files enumerated by `find`.

Repo root: `start` · `start.cmd` · `start.ps1` · `bin/agent-ks-dev` · `mise.toml` · `.mcp.json` ·
`CHANGELOG.md` · `README.md` · `scripts/check-links.mjs` · `.github/workflows/release.yml` ·
`migration/README.md` + 8 scripts · `releases/README.md` + 8 notes ·
`astro-doc-code/package.json` · `astro-doc-code/src/loaders/engine-version.ts`.

Content: all 159 pages under `default-docs/data/dev-docs/` and `default-docs/data/user-guide/`
(classified by grep; 12 read in full).

Proposal notes: [issue.md](../../../issue.md) ·
[architecture/01_overview.md](../../../notes/architecture/01_overview.md) ·
[architecture/04_distribution-single-binary.md](../../../notes/architecture/04_distribution-single-binary.md) ·
[claude-plugin-upgrade/01_overview.md](../../../notes/claude-plugin-upgrade/01_overview.md) ·
[claude-plugin-upgrade/02_subcommand-migration.md](../../../notes/claude-plugin-upgrade/02_subcommand-migration.md) ·
[claude-plugin-upgrade/03_skill-and-references.md](../../../notes/claude-plugin-upgrade/03_skill-and-references.md).
