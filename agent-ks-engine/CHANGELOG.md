# Changelog

**Index only.** Each release's full note lives at `release-notes/<version>.md` and
supplies the [GitHub release](https://github.com/sidhanthapoddar99/agent-knowledge-system/releases)
title and body when its tag is pushed. The workflow strips the duplicate H1 and
appends immutable source metadata. Nothing is restated here — a fact with two
homes drifts, and the note is the home.

The version tracked below is the **engine / content-format version**
(`ENGINE_VERSION`). Rows describe what shipped with each engine release at the
time; the plugin and Rust CLI now have independent release streams.

| Version | Date | What it is | Forces action? |
|---|---|---|---|
| **[0.3.10](./release-notes/0.3.10.md)** | 2026-09-04 | A top-level agent log's `settings.json` status is read again (the slot rule applied at the root and skipped it). Plugin `agent-ks` 0.11.1: every skill revised after a ten-reviewer audit — truer commands and paths, reasons on rules, leaner SKILL.md files, pushier descriptions, then a plain-language pass over every sentence; `agent-ks check links` removed; `new-round --json` reports `indexUpdated`. | No. Set `engine_version: "0.3.10"`. `agent-ks check links` is gone; use `check link-form`. |
| **[0.3.9](./release-notes/0.3.9.md)** | 2026-09-04 | Plugin `agent-ks` 0.10.1: skills re-cut by domain — `agent-ks-config` (setup, site config, themes, layouts) replaces init and add-section, `agent-ks-blog` split out, `agent-ks-logs` renamed `agent-ks-issue-logs`, `agent-ks-qna` added for scoping by Q&A. No engine change beyond the version. | No. Set `engine_version: "0.3.9"`. Old command names `/agent-ks-init`, `/agent-ks-add-section` are gone. |
| **[0.3.8](./release-notes/0.3.8.md)** | 2026-09-04 | `re` (research) joins the default agent-log kinds; the issue Guide panel is rewritten as a plain cheat sheet; plugin `agent-ks` 0.9.1 rebuilds the skills: nine skills, agent logs get their own skill and an `00_index.md` shape, subtasks get standard sub-heads, Codex install | **No migration** — floor stays `0.2.0`. Old agent logs render as they are. The plugin drops `agent-ks issue add-agent-log` |
| **[0.3.7](./release-notes/0.3.7.md)** | 2026-08-22 | The "On this page" rail indents by heading level from `#` down, instead of treating `#` and `##` as one level, and stops listing `####` and deeper — on docs pages and on issue sub-doc pages | **No migration** — floor stays `0.2.0`. Layout + CSS only; deep headings keep their anchor IDs |
| **[0.3.6](./release-notes/0.3.6.md)** | 2026-08-13 | `superseded` — a third terminal status for work that closed because its scope moved elsewhere, valid on both issues and subtasks; agents may set it, and `agent-ks check issues` warns when the required `→ where it went` line is missing | **No migration** — floor stays `0.2.0`. Additive. `replace`-mode themes owe one more variable, `--status-superseded` |
| **[0.3.5](./release-notes/0.3.5.md)** | 2026-08-12 | Tables under the bundled **Full Width** theme stop stretching to the viewport — they cap at the default theme's content width (`--max-width-table`, 1336px) and centre | **No migration** — floor stays `0.2.0`. CSS only, one theme; set `--max-width-table: none` to restore the old behaviour |
| **[0.3.4](./release-notes/0.3.4.md)** | 2026-08-10 | Embedded draw.io diagrams centre in the content column — the viewer writes a fixed pixel width onto its block host div, which `text-align: center` cannot move; the host now gets auto side margins | **No migration** — floor stays `0.2.0`. CSS only; one rule |
| **[0.3.3](./release-notes/0.3.3.md)** | 2026-08-10 | `./start update` — check upstream on demand, ignoring the 6 h throttle and `START_SKIP_UPDATE_CHECK`, and naming the reason (no upstream, dirty tree, diverged, offline) instead of returning silently | **No migration** — floor stays `0.2.0`. Pure addition; the automatic check and its throttle are unchanged |
| **[0.3.2](./release-notes/0.3.2.md)** | 2026-08-10 | Embedded diagrams (excalidraw, mermaid, graphviz) and standalone images centre instead of hugging the left edge — the reset's `svg { display: block }` was defeating the container's `text-align: center` | **No migration** — floor stays `0.2.0`. CSS only; a hand-rolled `<div align="center">` wrapper can be deleted |
| **[0.3.1](./release-notes/0.3.1.md)** | 2026-08-08 | `./start` stops building on every dev start (2.4 s / 0.4 MB, was ~9.5 s / ~100 MB) — the build moves to `./start doctor`; a version precheck runs before any command starts, including `preview`, which never checked at all; the footer's four dead template links are fixed | **No migration** — floor stays `0.2.0`. `start.ps1` is gone: use `.\start.cmd`. Run `./start doctor` before publishing, and check your own `footer.yaml` |
| **[0.3.0](./release-notes/0.3.0.md)** | 2026-08-08 | Astro 5.17.1 → 7.2.0 (Vite 8, **Node 22.12 floor**); the tracker index stops rendering 861 bodies to list titles; the live editor and 426 chunks stop shipping in `dist/` | **No migration** — floor stays `0.2.0`. **Check `node --version` first.** A user theme directory named `default` now throws, and `replace`-mode themes owe 12 more variables |
| **[0.2.4](./release-notes/0.2.4.md)** | 2026-08-04 | `agent-ks issue reindex` withdrawn with the generated round table it maintained; all four link gates parse markdown instead of approximating it; `check issues` stops skipping runs inside a `--group` folder | **No migration** — floor stays `0.2.0`. **Breaking for scripts**: delete any `issue reindex` call. Expect new (always-true) warnings if you use `--group` |
| **[0.2.3](./release-notes/0.2.3.md)** | 2026-08-04 | `check link-form` requires a link's target to exist on disk, and stops skipping the tracker; `move` no longer edits links inside code spans and now maintains titled ones | **Migration ships, floor stays `0.2.0`.** Unmigrated content renders identically — run `agent-ks-engine/migration/0.2.3_slug-form-links.py` to keep links maintainable |
| **[0.2.2](./release-notes/0.2.2.md)** | 2026-08-03 | A URL written against the file tree resolves: docs and blog accept both spellings, any file under a plan resolves to the plan, a missing page answers `404` instead of `200`, `agent-ks --version` | **No migration** — floor stays `0.2.0`. Every change adds a working URL; none removes one |
| **[0.2.1](./release-notes/0.2.1.md)** | 2026-08-03 | Three gates that passed what they should have refused: a missing page `data` path, the skill-links checker reading the installed plugin, two agent-log numbering cases | **No migration** — floor stays `0.2.0`. A `site.yaml` page pointing at a missing folder now fails the build |
| **[0.2.0](./release-notes/0.2.0.md)** | 2026-08-03 | Plans section · one status vocabulary across every file kind · status colours in theme CSS · numbered agent-log slots | **Yes** — floor raised to `0.2.0`; three migrations |
| **[0.1.2](./release-notes/0.1.2.md)** | 2026-07-03 | The version contract itself: `engine_version` in `site.yaml`, the startup gate, root-owned `migration/` | **Yes** — a tree with no declaration is refused |
| **[0.1.1](./release-notes/0.1.1.md)** | 2026-07-02 | One lifecycle vocabulary: seven statuses, four categories, `state:` → `status:` | **Yes**, quietly — old values are mapped on read, so the disk drifts instead of failing |
| **[0.1.0](./release-notes/0.1.0.md)** | 2026-06-22 | `done:` retired from subtask frontmatter; the `migration/` script convention | **Yes** — subtasks marked done with `done:` alone come back open |

`0.1.0` and `0.1.1` are **retroactive labels**: `ENGINE_VERSION` did not exist
when they shipped, and their notes were reconstructed from git history on
2026-08-03. Each says so on its face. The constant has only ever held `0.7.0`
(for thirty minutes on 2026-07-03, never published) and `0.1.2` before `0.2.0`.

**`0.2.1` is the first release where `MIN_CONTENT_VERSION` (`0.2.0`) is behind
`ENGINE_VERSION`.** That gap is the floor doing its job: it means *oldest content
that still loads*, not *newest release available*. Every earlier release moved
both together, which made them look like one number.

## Upgrading across several versions

Run **every** script in `(your-version, target]` in version order — a zero-hit
detect is a passed check, not a script you were allowed to skip — and set
`engine_version` in `site.yaml` **last**. Each note carries its own copy-pasteable
chain; [`agent-ks-engine/migration/README.md`](./migration/README.md) has the convention.

## Adding a release

See [`release-notes/README.md`](./release-notes/README.md). Two artefacts, both required:
the tag `agent-ks-engine-v<version>` and the note. Pushing the tag runs
[the workflow](../.github/workflows/agent-ks-engine-release.yml), which validates both
artefacts and advances `engine-latest`. It fails when the note is missing, so the rule is
enforced rather than remembered. Add the row here in the same change.
