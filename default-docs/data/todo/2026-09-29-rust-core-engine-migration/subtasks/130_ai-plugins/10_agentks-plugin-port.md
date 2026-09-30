---
title: "Port the agentks usage plugin: rename and rewrite the ten skills"
status: review
---

Today's `agent-ks` plugin teaches agents to operate an agent-knowledge-system project through ten skills. After the migration the tool is `agentks`, a project is just a folder with `config/`, custom layouts are gone, libraries exist, and the binary can print its own CSS contract and command catalog. This leaf builds `plugins/agentks/` in the new main repository: every skill renamed to `agentks-…` and rewritten for 1.0.0, pointing at commands instead of copying facts. It also keeps the engine's bundled issue guide in step with the issues skill.

# 01 To Do
- [x] **Create the plugin folder** `plugins/agentks/` with `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` (name `agentks`, version `1.0.0`, the new homepage and repository `https://github.com/NeuraLabsHQ/agent-knowledge-system`), `README.md`, `LICENSE`.
- [x] **Port each skill** (read today's skill in full, then write the new one; never copy unchanged):
    - [x] `agentks-config` — no framework folder and no `CONFIG_DIR`; a project is a folder with `config/`; new projects through `agentks init --template`; `dep.yaml` and `dep.lock` join the config files; branding is CSS starting from `agentks theme css`; migrations through `agentks migrate`. Drop the custom-layout references and the starter template copy (templates now live in the library repository).
    - [x] `agentks-docs` — markdown stays plain: `[text](path)` links and `[[path]]` embeds, both relative; no library names in markdown.
    - [x] `agentks-blog` — the rename, plus any blog layout change from [100/20](../100_layouts/20_blog-layouts.md).
    - [x] `agentks-issues`, `agentks-issue-logs`, `agentks-qna`, `agentks-quick-idea-note`, `agentks-index-check` — the rename and the new CLI name in every example. The tracker anatomy does not change.
    - [x] `agentks-artifacts` — run `agentks library find <words> --json` and `agentks library show <alias>` before building an icon, frame or artifact from scratch; load elements through `/_lib/<alias>/<element>`; library HTML is sandboxed; a library script runs with the artifact's rights; the path-prefix rule from [120/50](../120_libraries/50_lib-route-and-sandbox.md). **Delete the inline copy of the theme variables**; point at `agentks theme tokens --json` and `agentks theme css`.
        - [x] Explain how to get a theme-coloured library icon: a CSS mask or an inline SVG, because an icon loaded through `<img>` draws black. Explain the `agentks:element:theme` message, which passes the mode and the theme values to a library frame ([library system](../../notes/04_ecosystem/01_library-system.md), section 13). The default library's README already shows both.
    - [x] `agentks-cli` — the new command surface: `library`, `install`, `cache`, `init --template`, `build`, `migrate`, `docs`, `shell-init`, `share`. Point at `agentks help <command> --json` for flags.
- [ ] **Point at the hosted docs** (agentks.neuralabs.org/docs, one link per page) instead of the bundled user guide, since no framework checkout exists on the machine any more. Until the site is live (launch step 5), link to the docs' source files in the main repository and replace the links at step 5.
- [ ] **The issue guide twin.** The engine's short issue-anatomy guide (today [guide.ts](../../../../../../agent-ks-engine/src/layouts/issues/default/guide.ts)) and `agentks-issues` must stay in step. Add a check in the main repository's gate that fails when the guide's section list and the skill's section table disagree.
- [x] **Commands folder parity.** Keep every slash command a skill folder, so Codex reads it too.
- [x] **Skill checks.** Port `check skill-links` as a development script in the main repository (it leaves the binary, per the [Rust CLI note](../../notes/02_engine/05_rust-cli.md) section 06) and run it in the gate.
- [ ] **Evaluate.** Run each rewritten skill on a real task in a test project (write a doc, add an issue, build an artifact with a library icon, configure a theme) with the new binary; fix what the agent got wrong. Record the runs in the result.

## Guardrails
- A skill never holds a fact the binary prints; it names the command.
- No history in skills. No "in 0.x this was…".
- Do not touch this repository's `plugins/agent-ks/` — it stays in use until the switch-over.

## Done when
- `plugins/agentks/` holds ten skills named `agentks-…`, each with a rewritten `SKILL.md` and references.
- `grep -r "agent-ks" plugins/agentks` finds nothing except deliberate mentions in migration notes (there should be none).
- The skill-link check and the guide-parity check pass in the gate.
- The evaluation runs in a test project succeed with the new binary.

# 02 Status and Result
Review. All ten skills are written, a trim pass applied every reviewer finding, and the plugin is at 40% of today's size. Still open: the guide-parity check waits for the issues layout, the hosted docs links wait for launch step 5, and the evaluation waits for a binary whose content commands are built.

## Result
Written on 2026-10-01 in the worktree `/home/sid/projects/06_02_NeuraLabs/.agentks-worktrees/plugins` (branch `wave3/plugins`). The first pass is merged into main. The trim pass is not committed yet.

**Plugin root.** `plugins/agentks/` holds `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json` (name `agentks`, version `1.0.0`, homepage and repository `https://github.com/NeuraLabsHQ/agent-knowledge-system`, license MIT), `README.md` and `LICENSE` (the main repository's MIT text). The README gives the install steps; each skill's own description says what it covers. Every slash command (`/agentks-config`, `/agentks-quick-idea-note`, `/agentks-index-check`) is a skill folder, and the plugin has no `commands/` folder.

**Templates.** The 13 files in `skills/agentks-cli/templates/` are byte-identical to today's. None held an old name or anything false for 1.0.0, so the tracker validators see the same structure.

**Skill-link check.** `scripts/gate/skill-links.ts` (bun, in the style of `crate-layers.ts`) walks `plugins/**/*.md`. It skips fenced code, inline code and external links. It fails on a missing target, on a link that leaves its plugin folder, on a `/` link, and on a tree with no links at all. `scripts/config/check.sh` runs it as the `skill links` step, so `ctl check` and `ctl gate check` both run it. After the trim pass `./ctl check` is green: 55 files and 81 relative links. A separate script confirmed that every `#anchor` in a link names a heading in its target.

**Commands and flags.** Every command and flag the skills name exists in the clap tree (`apps/agentks-engine/crates/cli/src/args/*.rs`, read in the main repository, because the worktree's cli crate has no `args/` folder). The exceptions are not agentks flags: the installer's `--install-dir` and `--no-shell-setup` (the installer is not built yet), the palette validator script's own flags, and Claude Code's `--plugin-dir`.

**Reviewer findings applied.**
- `agentks-artifacts` has a Never row for pasting HTML from a source you do not trust.
- The `agentks-issues` description has the trigger "whenever you must remember something for the next session on an issue", and `SKILL.md` states the always-on agent-memory rule.
- `issue list` examples use `--include-closed`; `--status all` is gone.
- `agentks-docs` names `agentks doc show <page>` for one page's metadata.
- The "What you decide" table in `agentks-issues` is folded into the Status paragraph and the Never list.
- The first dump issue in `agentks-quick-idea-note` is one line that points at `agentks-issues`.
- Every `SKILL.md` is 484 to 500 words, frontmatter included.

**Corrections found on the way.** `publishing.md` no longer names `allow_artifact_pages`, which the content crate's `settings.json` does not have. `cli-toolkit.md` no longer says `check section` is the only check that errors on a missing `title` (`check blog` does too). `01_new-project.md` no longer offers `owner/repo` for `init --template`, which takes a catalog id or a git URL. The agent-log frontmatter row in `anatomy.md` names `agent`, which every round carries.

**Word counts, today → now** (`wc -w`; `SKILL.md` counts include frontmatter):

| Skill | Today | Now |
|---|---|---|
| `agentks-issues` | 10,380 | 3,769 (`SKILL.md` 499) |
| `agentks-artifacts` | 9,910 | 4,007 (492) |
| `agentks-config`, with the template assets today | 9,757 | 3,631 (494) |
| `agentks-docs` | 4,363 | 2,049 (496) |
| `agentks-cli`, without templates | 4,176 | 1,149 (499) |
| `agentks-index-check` | 2,953 | 1,358 (499) |
| `agentks-qna` | 2,670 | 1,201 (496) |
| `agentks-issue-logs` | 2,078 | 1,167 (500) |
| `agentks-quick-idea-note` | 1,354 | 499 |
| `agentks-blog` | 1,212 | 484 |
| Tracker templates | 917 | 917 |
| `README.md`, and today's release notes | 1,318 | 196 |
| **Plugin markdown** | **51,088** | **20,427 (40.0%)** |

References over about 800 words: `dataviz.md` (908), a set of lookup tables an agent reads in part, and `procedure.md` (859), the index check a subagent follows in full. Every other reference is under 800.

## Agent log
none

# 03 References
**Where:** the main repository, `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system`, `plugins/agentks/`.

**Read first**
- [AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md), sections 02–04 and 06.
- Today's skills, all ten: [plugins/agent-ks/skills](../../../../../../plugins/agent-ks/skills); manifests: [Claude Code](../../../../../../plugins/agent-ks/.claude-plugin/plugin.json), [Codex](../../../../../../plugins/agent-ks/.codex-plugin/plugin.json).
- [Rust CLI](../../notes/02_engine/05_rust-cli.md) — the command surface the skills describe.
- [Theming and layouts](../../notes/03_frontend/04_theming-and-layouts.md) — `theme css`, `theme tokens`, `theme eject`.
- [This repository's AGENTS.md](../../../../../../AGENTS.md) — the coupling between the theme contract and the artifacts skill that this leaf removes.

**Depends on:** [070/00 CLI](../070_cli/00_overview.md) (commands must exist to be described), [120/40 library commands](../120_libraries/40_library-commands-and-tui.md), [120/70 icons](../120_libraries/70_elements-icons.md).
**Unblocks:** [130/30 marketplace listing](./30_marketplace-listing.md), [180/95 skills update](../180_documentation/95_skills-update.md).

# 04 Decisions
- Decided (sidhantha, 2026-09-29): a skill teaches how to override CSS and points to the CLI command that prints the compiled CSS ([AI plugins and skills](../../notes/04_ecosystem/02_ai-plugins-and-skills.md)).
- Decided (sidhantha, 2026-09-30): the skills for the new version are ready before the switch; this repository's skills stay in use until then.
- Decided (claude, 2026-09-30): skills never copy facts the binary can print (same note).
- Decided (claude, 2026-10-01): reference files that other skills link to keep their names: `agentks-cli/references/cli-toolkit.md` and `installation.md`, `agentks-docs/references/writing.md`, `docs-layout.md` and `images.md`, and `agentks-config/references/03_site-config.md` and `08_migrations.md`. The config references keep their old numbers with gaps. Old 04 (navbar and footer) and 06 (layouts) merged into 03, and the new `04_libraries.md` took slot 04. The reason: the other ports rename `agent-ks-` to `agentks-` in their links, so those links resolve without coordination. `cli-toolkit.md` now holds only the behaviour that `agentks help` does not print.
- Decided (claude, 2026-10-01): where the design notes and the cli branch's code differ on a name, the skills follow the code. Docs `settings.json` uses `isCollapsible` and has no `allow_artifact_pages`. The inline diagram fence is `dot`. The port override is `AGENTKS_PORT`, and `site.yaml` gains `base_path`.
- Decided (claude, 2026-10-01): a skill routes to another skill by its name in backticks, such as the `agentks-issues` skill, and links only to files. The reason: an agent loads a skill by name, and a path into another agent's skill breaks when that skill is reshaped.
- Decided (claude, 2026-10-01): the skill-link check also fails a link that leaves its plugin folder, and a `/` link. The reason: a plugin installs alone, so such a link cannot resolve on a user's machine.
- Decided (claude, 2026-10-01): `/agentks-config new` runs `agentks init` and then appends a five-line Documentation block to the repository's `AGENTS.md`, or to `CLAUDE.md` when the repository uses that. The block is written in the reference itself, so the old `claude-md.template.md` asset and the starter-template copy are deleted. The reason: templates now live in the library repository.
- Decided (claude, 2026-10-01): the blog skill tells authors to give `image` an `https://` URL, because whether 1.0.0 resolves a relative cover path is not settled. The footer example omits `social:`, because the Rust config model has no such field.
- Decided (claude, 2026-10-01): today's `contract.md`, the contributor guide for adding a command, is not carried over. The binary's crate README in the main repository is that contract.
- Decided (claude, 2026-10-01): each `SKILL.md` is at most 500 words by `wc -w`, frontmatter included, and a reference holds one task in about 800 words at most. The two exceptions are `dataviz.md` (908), a set of lookup tables an agent reads in part, and `procedure.md` (859), where each remaining line is a step a subagent follows. The reason: the user's size bar, and cutting further would drop rules.
- Decided (claude, 2026-10-01): the full section list moves from `agentks-issues/SKILL.md` into `anatomy.md` as `## Sections`, a list of paths with their naming rules, and `SKILL.md` keeps a short "Where each fact goes" list. The guide-parity check compares against `anatomy.md`. The reason: the table cost the skill about 180 words, and the reviewer asked for the move.
- Decided (claude, 2026-10-01): the "What you decide" table in `agentks-issues` is folded into the Status paragraph (record each design choice with its reason) and the Never list (edit a Closed issue, or save a discussion, unasked), because it restated both.
- Decided (claude, 2026-10-01): only a person closes an issue, a subtask or a stage, and the agent closes its own logs, rounds and plans in their files. The reason: `agentks issue set-state` refuses `done` and `dropped` without a person typing the word at a terminal, for any target it takes (`with_status` in `crates/content/src/tracker/write.rs`), and it cannot reach a log's or a plan's `settings.json`.
- Decided (claude, 2026-10-01): the closing sentence appears once in each skill that talks about closing: `agentks-issues` (Status), `agentks-issue-logs` (a closed log never closes its subtask) and `agentks-index-check` (Never). `agentks-cli` names `set-state` without discussing closing, so it has none.
- Decided (claude, 2026-10-01): references drop text that `agentks help` prints: the tracker-writer table in `cli-toolkit.md`, the install table in `04_libraries.md`, image flag notes and flag meanings in `kinds.md`. The reason: the binary's help fits the installed version, and a copy drifts.
- Decided (claude, 2026-10-01): the skills do not teach `sidebar_position`, although the content crate accepts it in docs frontmatter and sidecars, because the `NN_` prefix is the one way pages are ordered.
- Decided (claude, 2026-10-01): the worked example in `question-bank.md` is cut, and its one teaching point (a sentence that is both a limit and a ruling) stays as a one-line example in the sorting rules.

# 05 Notes & Analysis
## Watch out
- The artifacts skill today has an inline variable contract that `AGENTS.md` says must be mirrored "byte-identically" into the installed cache. That coupling ends here; make sure nothing in the new repository recreates it.
- The guide-parity check waits for the issues layout in `agentks-ui`. Add it beside `scripts/gate/skill-links.ts` then, and compare the guide's section list with the `## Sections` list in `agentks-issues/references/anatomy.md`.
- The skills link no hosted docs page, because the site is not live. At launch step 5, decide per skill whether a page earns an `agentks docs <page>` pointer.
- Confirm against the engine when 020/20 (config) and the content commands land: the footer's column-link key (`links` in the skill) and `social:`; whether a relative blog `image` path resolves; and whether a config change reloads without a restart. Correct the skills in the same change.
- The video skill, `agentks-video`, joins the plugin when video artifacts ship; it is owned by the video issue, not this leaf ([the authoring skill](../../../2026-09-29-narrated-video-pages/brainstorm/01_video-artifact-engine/10_authoring-skill.md), [T8](../../../2026-09-29-narrated-video-pages/subtasks/100_authoring-skill.md)).
