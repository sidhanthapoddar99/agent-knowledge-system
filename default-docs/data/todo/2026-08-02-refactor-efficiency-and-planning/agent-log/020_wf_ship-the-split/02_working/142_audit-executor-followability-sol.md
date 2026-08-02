---
title: "Executor followability — the sol half"
status: done
agent: gpt-5.6-sol (owned by a Sonnet subagent)
date: 2026-08-03
---

# Scope

*Follow the conventions exactly as a brand-new executor would, end to end, and
confirm they are followable.* Distinct from the Opus half's scope (skill vs. code,
skill vs. itself, the three-way skill/legend/user-guide split) — this half actually
ran every documented command rather than reading and reasoning about them.

Job: `gpt-5.6-sol`, effort `xhigh`, `--write` scoped to
`verification/executor-followability/`. Launched from and executed against
`/home/sid/projects/02_OpenSource/04_knowledge_management/agent-knowledge-system`
on branch `2026-08-02/responsibility-split`. Terminal status: **completed**
(`task-msce8hdu-vjn13s`, 14m19s elapsed, exit 0).

## Verdict (sol's own wording)

> **FAIL.** The first break occurs before scaffolding: the `agent-ks` on `PATH` is
> a stale cached `0.6.7` entrypoint. It does not expose the new commands and
> scaffolds the retired six-file agent-log shape.
>
> Even when using the checkout's current bin, the skill's literal recipes fail
> because they pass `--issue <id>` while the CLI requires `<issue-id>`
> positionally.

Note on finding 1's applicability: this is a stale **globally-cached** `agent-ks`
plugin binary resolving ahead of the checkout's own `plugins/agent-ks/bin/agent-ks`
on sol's `$PATH` — an environment/install-freshness issue, not a defect in this
branch's tree. It is still a real followability failure for exactly the reader the
brief cares about: anyone who already has the plugin installed and trusts `PATH`
resolution, which is what the skill tells them to do. Findings 2, 4, 5 are defects
in the checked-out tree itself, independent of PATH state.

# Findings

| # | Severity | File:line | Reproduced |
|---|---|---|---|
| 1 | HIGH | `plugins/agent-ks/skills/agent-ks-issues/SKILL.md:333`, `references/20_sections/24_agent-logs.md:569` | Yes |
| 2 | HIGH | `references/20_sections/24_agent-logs.md:566,576`, `references/20_sections/28_plans.md:227`, `skills/agent-ks-docs/scripts/issues/new-agent-log.mjs:43` | Yes |
| 3 | MEDIUM | `references/40_operations/41_searching.md:36`, `plugins/agent-ks/bin/agent-ks:7`, `skills/agent-ks-docs/scripts/issues/_lib.mjs:8` | Yes |
| 4 | MEDIUM | `default-docs/data/user-guide/19_issues/05_sub-docs/09_plans.md:117` (contradicted by line 149) | Yes |
| 5 | HIGH | `migration/0.1.4_agent-log-slot-numbering.py:214,383` | Yes |
| 6 | LOW | `migration/0.1.4_agent-log-slot-numbering.py:81` | Yes |

## 1 — HIGH — first failure: PATH entrypoint is stale

- **File:** `plugins/agent-ks/skills/agent-ks-issues/SKILL.md:333`,
  `plugins/agent-ks/skills/agent-ks-issues/references/20_sections/24_agent-logs.md:569`
- **Scenario:** `command -v agent-ks` resolves to the plugin cache's `0.6.7`.
  `agent-ks help` on that resolved binary lacks `new-iteration`, `new-plan`, and
  `new-stage`. Its `new-agent-log` creates `00_goal.md` through `05_notes.md` — the
  retired six-file shape — not `settings.json` plus `01_summary.md`.
- **Reproduced with:** `agent-ks help`; then
  `agent-ks issue new-agent-log 2026-08-03-executor-fixture ...`, which created the
  retired six-file fixture.
- **Also visible:** the default (stale) `agent-ks check issues` reported **73
  warnings**, not the brief's 1.
- **Refutation attempted:** prepending `plugins/agent-ks/bin` to `PATH` exposes the
  current commands and the expected scaffolders — confirming the checkout's own
  bin is correct and the defect is resolution order, not the checkout.

## 2 — HIGH — skill recipes use a nonexistent `--issue` flag

- **File:** `references/20_sections/24_agent-logs.md:566`, `:576`,
  `references/20_sections/28_plans.md:227`,
  `skills/agent-ks-docs/scripts/issues/new-agent-log.mjs:43`
- **Scenario:** a reader copies the skill's literal command; the CLI finds no
  positional issue ID and exits 1 with a usage message.
- **Reproduced with:** the exact `new-agent-log`, `new-iteration`, `new-plan`, and
  `new-stage` recipes as written (using `--issue <id>`), run against the checkout's
  own bin — all four exited 1.
- **Refutation attempted:** replacing `--issue <id>` with a positional `<id>` made
  all four operations succeed, including with `--after` and `--subtask`.

## 3 — MEDIUM — Node is documented/implemented as a fallback but cannot run the scripts

- **File:** `references/40_operations/41_searching.md:36`,
  `plugins/agent-ks/bin/agent-ks:7`, `skills/agent-ks-docs/scripts/issues/_lib.mjs:8`
- **Scenario:** without Bun, the dispatcher falls back to Node, which cannot
  resolve `gray-matter`.
- **Reproduced with:** `bun .../issues/list.mjs --help` exited 0;
  `node .../issues/list.mjs --help` exited 1 with
  `ERR_MODULE_NOT_FOUND: gray-matter`. Confirmed no root `package.json` and no
  plugin `node_modules` exist.
- **Refutation attempted:** the updating-related reference does show Bun for one
  direct validator invocation, but neither the general skill text nor the fallback
  claim states that Bun is mandatory everywhere.

## 4 — MEDIUM — plans guide still lists the retired `agent-logs:` field

- **File:** `default-docs/data/user-guide/19_issues/05_sub-docs/09_plans.md:117`;
  contradicted two paragraphs later at `:149`
- **Scenario:** a reader follows the field table, adds `agent-logs:` to a stage,
  and the validator rejects it.
- **Reproduced with:** a deliberate scratch stage plus
  `agent-ks check issues --tracker ...`; the validator error explicitly instructed
  moving the run link into the stage body with an ordering label instead.
- **Refutation attempted:** the later paragraph in the same doc, and the skill
  reference itself, are both correct — scaffolders do not emit the retired field.
  This is a stale table row inside one user-guide doc, contradicted by its own
  later prose.

## 5 — HIGH — migration `relink` breaks unmigrated activities in a mixed tree

- **File:** `migration/0.1.4_agent-log-slot-numbering.py:214`, `:383`
- **Scenario:** one activity in a tracker already uses numbered slots
  (`01_summary.md` / `02_working/` / `03_debrief/`); a sibling activity still has
  the old shape (`summary.md`, `working/`, `debrief/`). Running `relink` rewrites
  links for **both**, without renaming any files. Links pointing into the
  unmigrated activity end up pointing at nonexistent `01_/02_/03_` targets.
- **Reproduced with:** `relink --dry-run` proposed the bad edits;
  `relink` (no dry-run) then rewrote five files and exited 0; explicit
  existence checks afterward found all three rewritten pending-activity link
  targets missing on disk.
- **Refutation attempted:** links into the already-migrated activity became valid
  after the same run. A normal `migrate` (not `relink`) on an equivalent
  mixed-state fixture correctly renamed the pending activity, repaired all links,
  verified clean, and was idempotent on a second run. So the defect is specific to
  `relink` used standalone against a half-converted tree — exactly the scenario the
  brief asked to check.

## 6 — LOW — migration docstring omits `relink`

- **File:** `migration/0.1.4_agent-log-slot-numbering.py:81`
- **Scenario:** the documented usage at the top of the file lists only `detect`,
  `migrate`, and `verify`; it does not mention or explain `relink` at all, and
  describes `--dry-run` as migrate-only even though `relink --dry-run` also works.
- **Reproduced with:** `python3 .../0.1.4_agent-log-slot-numbering.py --help`
  exposes only the mode name via argparse choices; no prose explains what it does.
- **Refutation attempted:** argparse choices at least reveal that a `relink` mode
  exists, so it is discoverable, just undocumented — kept at LOW rather than
  MEDIUM/HIGH for that reason.

# Validator baseline

Using the checkout's own current bin (not the stale PATH one):

```json
{"ok":true,"errorCount":0,"warningCount":1}
```

Scanned 51 issue folders — matches the brief. The tree is error-clean but **not
literally zero-warning clean**. The one warning:

> `2026-04-10-issues-layout/agent-log/exploration/: no numeric order prefix —
> sorts last; convention is NNN_<code>_<name>/`

It is minimally actionable: names the target, states the consequence, and states
the required naming pattern — but does not hand back the exact `agent-ks move`
command to fix it.

# Areas checked and found clean

- The corrected (positional-flag) scaffold flow completes end to end:
  agent-log → round → plan → stage → subtask reference, no failures.
- Agent-log, iteration, plan, and stage structural diffs (docs vs. what the
  scaffolders actually write) all exited 0 — no shape mismatch found once the
  correct flag form and the correct bin are used.
- A generated stage's subtask reference resolves correctly.
- `--after 10` produced `20_follow-up.md` as expected.
- A freshly generated fixture validated at 0 errors / 0 warnings, before the
  deliberate `agent-logs:` mutant used for finding 4.
- The current CLI's own self-test: `113/113` passing, run under Bun.
- Normal `migrate` (as opposed to `relink`) on a mixed-state tree: detect,
  dry-run, migrate, link repair, verify, and a second idempotent run all passed
  cleanly.
- The migration correctly **skipped** a six-slot legacy activity it wasn't asked
  to touch, and correctly **reported without moving** a child activity numbered
  below 100 (the "child ≥ 100" rule).

# Files touched

35 untracked fixture files, all confined to
`verification/executor-followability/`, verified independently via
`git status --short --untracked-files=all`:

- `verification/executor-followability/cli-tracker/` — scaffold controls run
  against both the stale cached CLI and the checkout's current bin, plus the
  validator mutant for finding 4.
- `verification/executor-followability/migration-main/` — mixed-tree fixture for
  normal `migrate` (legacy-activity skip, low-numbered-child handling).
- `verification/executor-followability/migration-relink/` — isolated mixed-tree
  fixture reproducing the `relink` defect (finding 5) in isolation from the
  `migrate` run, so the two don't contaminate each other's evidence.

No file outside `verification/executor-followability/` was created, modified, or
deleted by this job — confirmed independently (see Git status below), not just
taken on sol's word.

# Commands sol reported executing

```bash
command -v agent-ks
agent-ks help
agent-ks issue new-agent-log --help
agent-ks issue new-iteration --help
agent-ks issue new-plan --help
agent-ks issue new-stage --help

PATH="$PWD/plugins/agent-ks/bin:$PATH" agent-ks help
PATH="$PWD/plugins/agent-ks/bin:$PATH" agent-ks issue new-agent-log ...
PATH="$PWD/plugins/agent-ks/bin:$PATH" agent-ks issue new-iteration ...
PATH="$PWD/plugins/agent-ks/bin:$PATH" agent-ks issue new-plan ...
PATH="$PWD/plugins/agent-ks/bin:$PATH" agent-ks issue new-stage ...
# Each documented --issue form, and each corrected positional form, was run.

agent-ks issue new-agent-log 2026-08-03-executor-fixture \
  --kind wf --name cached-entrypoint --tracker ... --json

bun plugins/agent-ks/skills/agent-ks-docs/scripts/issues/new-agent-log.mjs --help
node plugins/agent-ks/skills/agent-ks-docs/scripts/issues/new-agent-log.mjs --help
bun plugins/agent-ks/skills/agent-ks-docs/scripts/issues/list.mjs --help
node plugins/agent-ks/skills/agent-ks-docs/scripts/issues/list.mjs --help
bun plugins/agent-ks/skills/agent-ks-docs/scripts/_selftest.mjs

agent-ks check issues
PATH="$PWD/plugins/agent-ks/bin:$PATH" agent-ks check issues --json
PATH="$PWD/plugins/agent-ks/bin:$PATH" agent-ks check issues --tracker ... --json

python3 migration/0.1.4_agent-log-slot-numbering.py detect --root ...
python3 migration/0.1.4_agent-log-slot-numbering.py migrate --dry-run --root ...
python3 migration/0.1.4_agent-log-slot-numbering.py migrate --root ...
python3 migration/0.1.4_agent-log-slot-numbering.py verify --root ...
python3 migration/0.1.4_agent-log-slot-numbering.py relink --dry-run --root ...
python3 migration/0.1.4_agent-log-slot-numbering.py relink --root ...
python3 migration/0.1.4_agent-log-slot-numbering.py --help

diff -u <documented structural signatures> <generated signatures>
find verification/executor-followability ...
rg -n ...
test -f ...
git status --short --untracked-files=all -- verification/executor-followability
```

# Git status verification (done by the owning agent, not taken on sol's word)

Ran independently from the repo directory after the job completed:

```
git status --short --untracked-files=all
```

Result: 35 untracked entries under `verification/executor-followability/` —
matching sol's own count exactly — and **nothing else attributable to this job**.

A separate set of changes is present in the same working tree (10 modified/deleted
tracked files under `astro-doc-code/`, `default-docs/data/user-guide/`, and
`plugins/agent-ks/skills/agent-ks-issues/references/`, plus two more untracked
files: the audit brief itself and
`audit/skill-consistency-opus.md`). These are **not from this sol job** — sol's
own `touchedFiles` list contains only paths under
`verification/executor-followability/`, and the working tree had zero modified
tracked files before this job was launched (confirmed by a `git status` taken at
launch time). `audit/skill-consistency-opus.md` documents a concurrent, separate
audit half (status: done, harnesses under `verification/skill-consistency/` and
`verification/plan-stage-alias/`) running against the same checkout at the same
time — that is the far more likely source of those 10 tracked-file changes, not
this job. Flagging this for the orchestrator's own confirmation rather than
asserting it as fact, since it falls outside this job's scope to verify.
