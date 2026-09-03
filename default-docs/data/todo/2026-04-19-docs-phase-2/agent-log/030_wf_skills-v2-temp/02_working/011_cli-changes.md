---
title: "Cli changes"
status: done
agent: claude
---

# Goal

Builder report: cli-changes

# Inputs

- [the skills-v2 spec](../../notes/skills-v2-spec.md)

# Expected Outcome

The change, and what it touched.

# Outcome

Every cli item in spec section 10 is in place, and every one was run. A first session built the code; this session finished the prose, fixed four defects, and ran the proof. The scratch tracker is back in its clean state.

## Change list

| Spec item | State | Change in this session |
|---|---|---|
| 1 `contract.md` | kept | Split three sentences over 20 words. No reference to `scripts/CONTRACT.md` remains |
| 2 templates | kept | `plan-stage.md` frontmatter shows `outcome`, `notes`, `who` and `subtasks`. `log-round.md` shows `agent`. Both follow the section 6 table |
| 3 `new-subtask` | proven | none |
| 4 `new-plan`, `new-stage` | proven | none |
| 5 `new-agent-log` | proven | none |
| 6 `new-round`, `new-iteration` | proven | none |
| 7 `check issues` | proven | none |
| 8 `agent-logs`, `show` | proven | none |
| 9 self-test, `skill-links`, `help --json` | proven | none |
| 10 `SKILL.md` | rewritten | 658 words, limit 600. Cut to 598. The template table became one sentence; the toolkit names each template |
| 10 `cli-toolkit.md` | rewritten | 1,656 words, limit 1,500. Cut to 1,496. Every command and flag stays |
| brief (a) `new-stage --subtask` | proven | none |
| brief (b) `new-iteration` alias | proven | none |
| manifest | fixed | `check links --section` and `--dist` were declared as switches. The script reads a value. Both now declare one, so help prints `<name>` and `<path>` |

Decisions taken alone:

- `cli-toolkit.md` states `--json` and `--tracker` once at the top, not in every row. The exception list for `--json` matches the manifest: `move`, `img`, `set-state`, `add-comment`, `add-agent-log`.
- `cli-toolkit.md` drops three duplicates: the `find`-versus-`list` line, the exit-code line, and the maintainer section. `SKILL.md` and `contract.md` hold them.
- The `subtasks:` placeholder in `plan-stage.md` is `"..."`, not a link. A placeholder link fails `check skill-links`.

## Commands run

`CLI=plugins/agent-ks-temp/skills/agent-ks-cli/scripts/cli.mjs`, `T=plugins/agent-ks-temp/.scratch/todo`, `I=2026-09-03-fixture-reorder`. Every command ran from the repo root.

| Command | Exit | Result |
|---|---|---|
| `bun plugins/agent-ks-temp/skills/agent-ks-cli/scripts/_selftest.mjs` | 0 | 122/122 checks, PASS |
| `bun $CLI help --json \| grep -c '"subcommand": "issue new-round"'` | 0 | prints `1` |
| `bun $CLI help new-iteration` | 0 | the alias entry, with the `new-round` flags |
| `bun $CLI check skill-links` | 0 | 8 skills, 43 files, all checks passed, `[repo source tree]` |
| `bun $CLI issue new-subtask $I --name cli-proof --title "CLI proof" --overview "…" --tracker $T` | 0 | `subtasks/040_cli-proof.md` from the template |
| `bun $CLI issue new-subtask $I --group 050_extra --index --tracker $T` | 0 | `subtasks/050_extra/00_overview.md` from the same template |
| `bun $CLI issue new-plan $I --name test-plan --title "Test plan" --overview "…" --tracker $T` | 0 | `plans/02_test-plan/` with `settings.json` and `overview.md` |
| `bun $CLI issue new-stage $I --plan 02_test-plan --name by-slug-and-path --outcome "Two links" --who claude --subtask 010_top-layer-tests,subtasks/020_recovery-rebuilt.md --tracker $T` | 0 | `10_by-slug-and-path.md`; two plain links, subtask titles as text |
| `bun $CLI issue new-stage $I --plan 02_test-plan --name by-number --subtask 30 --tracker $T` | 0 | `20_by-number.md`; `[Gate wiring](../../subtasks/030_gate-wiring.md)` |
| `bun $CLI issue new-stage $I --plan 02_test-plan --name bad --subtask 999 --tracker $T` | 1 | "no subtask … matches it"; nothing written |
| `bun $CLI issue new-agent-log $I --kind wf --name cli-proof --goal "…" --tracker $T` | 0 | `agent-log/010_wf_cli-proof/` with `settings.json` (`in-progress`) and `01_summary.md` |
| `bun $CLI issue new-round $I --log 010_wf_cli-proof --name build --goal "Round one." --tracker $T` | 0 | `10_build.md` |
| `bun $CLI issue new-round $I --log 010_wf_cli-proof --name fix --inputs ../../subtasks/010_top-layer-tests.md --tracker $T` | 0 | `20_fix.md`; `# 03 References` holds the link with the subtask title |
| `bun $CLI issue new-round $I --log 010_wf_cli-proof --name cli-report --report --tracker $T` | 0 | `21_cli-report.md`, round 2 report 1 |
| `bun $CLI issue new-iteration $I --log 010_wf_cli-proof --name verify --tracker $T` | 0 | `30_verify.md` through the alias |
| `bun $CLI issue new-round $I --log 010_wf_cli-proof --name dup --round 1 --tracker $T` | 1 | round 1 already has its round file |
| `bun $CLI issue add-comment $I --author claude --body "…" --tracker $T` | 0 | `comments/001_2026-09-02_claude.md` from `templates/comment.md` |
| `bun $CLI issue new-round $I --log 020_lp_old-shape --name nope --tracker $T` | 1 | fixture log with `02_working/`: "old agent-log shape; migrate" |
| `bun $CLI issue agent-logs $I --tracker $T` | 0 | rounds 1, 2, 2 report 1, 3 listed flat; the old-shape log marked |
| `bun $CLI issue show $I --tracker $T` | 0 | `3 rounds · 1 report`; the old-shape log marked |
| `bun $CLI check issues --tracker $T --template` | 0 | 0 errors, 7 warnings: five old-shape fixture files, two open plans, one old-shape log |
| `bun $CLI check issues --tracker default-docs/data/todo --template --json` | 0 | live tracker: 0 errors, 473 warnings (42 old shape, 424 template) |

## Negative test

Added `✅ 1 · [Top-layer tests](../../subtasks/010_top-layer-tests.md)` to the `subtasks:` list of `plans/01_ship/10_build.md`. `bun $CLI check issues --tracker $T --quiet` exited 1 with one error: "`subtasks` entry "✅ 1 · [Top-layer tests](../../subtasks/010_top-layer-tests.md)" is not exactly one markdown link `[title](path)` inside the issue". Removed the entry. The same command exited 0.

## Scratch tracker

Restored. The issue holds `subtasks/010_top-layer-tests.md`, `020_recovery-rebuilt.md`, `030_gate-wiring.md`, and `plans/01_ship/` with `overview.md`, `settings.json` and `10_build.md`. The stage lists three plain links, status open. `settings.jsonc` is untouched. Nothing else remains.

## Self-check (section 12)

| Check | Result |
|---|---|
| Section 5 rules | Re-read all three prose files. Three sentences over 20 words split. A sentence scanner finds none over 20 |
| Links resolve | `check skill-links` exit 0 |
| Sizes | `SKILL.md` 598 words. `cli-toolkit.md` 109 lines, 1,496 words. `contract.md` 81 lines, 813 words. Templates 7 to 28 lines |
| History words | none in `SKILL.md`, `references/`, `templates/` |
| Harvest table | not required; section 11 names the prose builders only |
| Manifest versus toolkit | a script checked both ways: every manifest flag and alias is in the toolkit, and no toolkit flag is absent from the manifest |

## Open questions

- `add-agent-log` writes a loose `NNN_<slug>.md` under `agent-log/` with `iteration` and a `success|failed` status. `check issues` warns on it. The spec keeps the command. Remove it in a follow-up?
- `bin/agent-ks` and `bin/agent-ks.cmd` carry history in code comments. Section 10 says change nothing else, so they stand. Trim them in a follow-up?
- `add-comment` dated the file `2026-09-02` on 2026-09-03; `todayISO()` uses UTC. Use local time?
