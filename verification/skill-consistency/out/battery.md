# mutation battery — agent-ks check issues

seed: verification/skill-consistency/scratch-tracker
mutants: 21  (each on its own copy under verification/skill-consistency/out/mutants/)

| # | mutant | verdict | findings | rule |
|---|---|---|---|---|
| M00-control-untouched | | **CONTROL-OK** | 0 | CONTROL: an unmutated copy must be clean. Proves the seed is a valid baseline. |
| M01-no-summary | | **KILLED** | 1 | skill: `01_summary.md` is REQUIRED |
| M02-unnumbered-working | | **KILLED** | 1 | skill: the slots are NUMBERED; a bare `working/` is the retired shape |
| M03-audit-folder | | **KILLED** | 1 | skill 24_agent-logs.md: "There is no separate `audit/` folder" |
| M04-agent-logs-frontmatter | | **KILLED** | 2 | skill + guide + user-guide: `agent-logs:` is RETIRED and errors |
| M05-broken-subtask-ref | | **KILLED** | 1 | skill: a broken `subtasks:` ref is a validator ERROR |
| M06-iteration-frontmatter | | **KILLED** | 1 | skill: `iteration:` is retired; the filename owns the number |
| M07-dropped-no-callout | | **KILLED** | 1 | skill: a dropped round carries TWO signals — status AND a callout |
| M08-producer-without-iteration-file | | **SURVIVED** | 0 | skill: producer files hang off an iteration file (`NN0_`) |
| M09-stage-h1 | | **KILLED** | 1 | skill: a stage has NO `# H1` — the heading is generated |
| M10-ordering-label-drift | | **KILLED** | 1 | skill: `agent-ks check issues` WARNS on a drifted ordering label |
| M11-plan-folder-one-digit-prefix | | **SURVIVED** | 0 | grammar is 2-5 digits; the validator prefix regex is `\d{1,5}` |
| M12-stage-one-digit-prefix | | **SURVIVED** | 0 | grammar is 2-5 digits; a 1-digit stage prefix does not parse in the loader |
| M13-legacy-milestone-file-masks-everything | | **SURVIVED** | 0 | a root file matching `[1-9]\d{2,4}_*.md` classifies the whole log as HISTORY and skips every new-shape rule |
| M14-legacy-slot-name-masks-everything | | **SURVIVED** | 0 | a folder named `03_working` (a RETIRED slot name) classifies the log as history and skips every rule |
| M15-summary-sections-gutted | | **SURVIVED — nothing enforces it** | 0 | skill: `01_summary.md` is FIVE `#` sections in order. Nothing else |
| M16-todo-bare-number | | **SURVIVED — nothing enforces it** | 0 | skill (repo-wide): every reference is a LINK, never a bare backticked number |
| M17-iteration-head-missing | | **SURVIVED — nothing enforces it** | 0 | skill: an iteration file opens with # Goal / # Inputs / # Expected Outcome / # Outcome |
| M18-child-log-below-100 | | **KILLED** | 1 | skill: a child agent log is prefix >= 100 |
| M19-stage-outcome-multiline | | **SURVIVED — nothing enforces it** | 0 | skill: `outcome:`/`notes:` are ONE-LINERS rendered as inline markdown |
| M20-two-open-plans | | **KILLED** | 1 | skill: one plan open at a time is CONVENTION; the validator hints |

## per-mutant detail

### M00-control-untouched — CONTROL-OK
rule: CONTROL: an unmutated copy must be clean. Proves the seed is a valid baseline.
  - (no findings at all)

### M01-no-summary — KILLED
rule: skill: `01_summary.md` is REQUIRED
  - 2026-08-03-scratch-probe/agent-log/010_wf_ship-the-decoder/: no `01_summary.md` — it is the one conclusive file for the run (State / Goal / Todo / Out of Scope / Outcome), and it IS the brief agents are pointed at

### M02-unnumbered-working — KILLED
rule: skill: the slots are NUMBERED; a bare `working/` is the retired shape
  - 2026-08-03-scratch-probe/agent-log/010_wf_ship-the-decoder/working: unnumbered slot — rename to `02_working/`. The prefix is what puts the run's own slots ahead of its child activities (which start at 100); without it this sorts lexically among them

### M03-audit-folder — KILLED
rule: skill 24_agent-logs.md: "There is no separate `audit/` folder"
  - 2026-08-03-scratch-probe/agent-log/010_wf_ship-the-decoder/audit/: prefix is below 100, so this reads as one of the run's own slots rather than a child activity — the slots are `02_working/` and `03_debrief/`. A child activity is `NXX_<code>_<name>/` with a prefix of 100 or more

### M04-agent-logs-frontmatter — KILLED
rule: skill + guide + user-guide: `agent-logs:` is RETIRED and errors
  - 2026-08-03-scratch-probe/plans/01_decoder-and-retention/10_decoder-swap.md: `agent-logs:` is retired — the frontmatter ref list is for SUBTASKS only. Link the run from the stage BODY like anything else, with an ordering label in the text: `[010/01 the section loop](../../agent-log/010_lp_implement-sections/01_summary.md)`
  - 2026-08-03-scratch-probe/plans/01_decoder-and-retention/10_decoder-swap.md: unknown key `agent-logs`

### M05-broken-subtask-ref — KILLED
rule: skill: a broken `subtasks:` ref is a validator ERROR
  - 2026-08-03-scratch-probe/plans/01_decoder-and-retention/15_journal-compat.md: `subtasks` references `subtasks/999_does-not-exist.md`, which does not exist — the stage's count in the plan table silently drops it

### M06-iteration-frontmatter — KILLED
rule: skill: `iteration:` is retired; the filename owns the number
  - 2026-08-03-scratch-probe/agent-log/010_wf_ship-the-decoder/02_working/010_audit-round.md: carries `iteration:` — retired. The `010_` filename owns the number, and a frontmatter copy is a second place to keep it right

### M07-dropped-no-callout — KILLED
rule: skill: a dropped round carries TWO signals — status AND a callout
  - 2026-08-03-scratch-probe/agent-log/010_wf_ship-the-decoder/02_working/010_audit-round.md: `status: dropped` with no callout — a round that did not land says why in a `> [!WARNING]` / `> [!IMPORTANT]` callout. The status makes it scannable; the callout is what a reader actually needs

### M08-producer-without-iteration-file — SURVIVED
rule: skill: producer files hang off an iteration file (`NN0_`)
  - (no findings at all)

### M09-stage-h1 — KILLED
rule: skill: a stage has NO `# H1` — the heading is generated
  - 2026-08-03-scratch-probe/plans/01_decoder-and-retention/20_retention.md: carries an `# H1` — the heading is GENERATED as "<prefix> <title>" on the plan page, so this duplicates a name the frontmatter owns

### M10-ordering-label-drift — KILLED
rule: skill: `agent-ks check issues` WARNS on a drifted ordering label
  - 2026-08-03-scratch-probe/plans/01_decoder-and-retention/20_retention.md:14: ordering label `999/999` does not match its target — `../../subtasks/010_a-subtask.md` sits at `010`. Fix the label, or reword the link text if the number was never an ordering label

### M11-plan-folder-one-digit-prefix — SURVIVED
rule: grammar is 2-5 digits; the validator prefix regex is `\d{1,5}`
  - (no findings at all)

### M12-stage-one-digit-prefix — SURVIVED
rule: grammar is 2-5 digits; a 1-digit stage prefix does not parse in the loader
  - (no findings at all)

### M13-legacy-milestone-file-masks-everything — SURVIVED
rule: a root file matching `[1-9]\d{2,4}_*.md` classifies the whole log as HISTORY and skips every new-shape rule
  - (no findings at all)

### M14-legacy-slot-name-masks-everything — SURVIVED
rule: a folder named `03_working` (a RETIRED slot name) classifies the log as history and skips every rule
  - (no findings at all)

### M15-summary-sections-gutted — SURVIVED — nothing enforces it
rule: skill: `01_summary.md` is FIVE `#` sections in order. Nothing else
  - (no findings at all)

### M16-todo-bare-number — SURVIVED — nothing enforces it
rule: skill (repo-wide): every reference is a LINK, never a bare backticked number
  - (no findings at all)

### M17-iteration-head-missing — SURVIVED — nothing enforces it
rule: skill: an iteration file opens with # Goal / # Inputs / # Expected Outcome / # Outcome
  - (no findings at all)

### M18-child-log-below-100 — KILLED
rule: skill: a child agent log is prefix >= 100
  - 2026-08-03-scratch-probe/agent-log/010_wf_ship-the-decoder/04_wf_sneaky/: prefix is below 100, so this reads as one of the run's own slots rather than a child activity — the slots are `02_working/` and `03_debrief/`. A child activity is `NXX_<code>_<name>/` with a prefix of 100 or more

### M19-stage-outcome-multiline — SURVIVED — nothing enforces it
rule: skill: `outcome:`/`notes:` are ONE-LINERS rendered as inline markdown
  - (no findings at all)

### M20-two-open-plans — KILLED
rule: skill: one plan open at a time is CONVENTION; the validator hints
  - 2026-08-03-scratch-probe/plans/: 2 plans are open (01_decoder-and-retention, 02_second-plan) — the active plan is derived as the highest-numbered non-closed one, so the lower ones read as forgotten. Close them, or say so in their overview.md
