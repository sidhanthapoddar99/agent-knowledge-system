---
title: "Skill consistency — the Opus half"
status: done
agent: claude-opus
date: 2026-08-03
---

# Scope

*Does the agent-ks skill still describe the system that actually exists, and does it
agree with itself?* Three questions: skill vs code · skill vs itself · the three-way
split (skill / `guide.ts` legend / user-guide).

Everything below was executed on branch `2026-08-02/responsibility-split`. Harnesses,
the scratch tracker and every mutant live under `verification/skill-consistency/`;
nothing is in `/tmp`.

## What was executed

| Command | Purpose |
|---|---|
| `bun plugins/agent-ks/skills/agent-ks-docs/scripts/issues/check.mjs --tracker default-docs/data/todo` | baseline — 51 folders, 0 errors, 1 warning (matches the brief) |
| `bun verification/skill-consistency/battery.mjs` | 21-mutant battery against the validator, each on its own copy |
| `bun verification/skill-consistency/legacy-mask-probe.mjs` | targeted mutants + blast radius of the retired-shape detector |
| `cd astro-doc-code && bun ../verification/skill-consistency/plan-prefix-probe.ts` | the real `activePlan()` against 1-digit and unprefixed plan folders |
| `cd astro-doc-code && bun ../verification/skill-consistency/ref-index-probe.ts` | the real `loadIssue()` + `resolvePlanStage()` against a stage ref the validator accepts |
| `bun .../new-agent-log.mjs \| new-iteration.mjs \| new-plan.mjs \| new-stage.mjs` | every scaffolder run against a scratch tracker, in both the skill's documented arg form and the implemented one |
| `bun .../check-skill-links.mjs <skill>` × 3 | link resolution across all three skills |
| `python3` over `astro-doc-code/dist/**/*.html` | sidebar row order, plan-table headers, `is-current` marking, broken-ref block coverage |

**Severity count: 2 high · 4 medium · 9 low/info.**

> **The tree changed under this audit.** It was clean at start (only the untracked audit
> brief). By the end, ten files were modified and `PlanStagePage.astro` was staged for
> deletion — plan-stage routing was reworked by parallel work, and
> `verification/executor-followability/` and `verification/plan-stage-alias/` appeared.
> I touched nothing outside this report and `verification/skill-consistency/`.
>
> Every finding below was **re-verified against the tree as it stands now**: the H1 probe
> was re-run and still reproduces, and the shifted line references
> (`helpers.ts`, `SubdocTree.astro`, `detail.css`) were re-derived rather than left as
> read. Nothing here is stated against a version that no longer exists — but the diff I
> audited is not the diff at the end of the run, and the plan-stage routing rework
> arrived too late for me to cover it.

---

# Findings

## H1 — the plans validator's one ERROR has a hole on exactly the path the `agent-logs:` retirement pushes people down

**Severity: high. Reproduced.**

`plugins/agent-ks/skills/agent-ks-docs/scripts/issues/check.mjs:217` builds the
reference index by walking **two** folders:

```js
for (const sub of ['subtasks', 'agent-log']) {
```

but line 391 now validates **one** field:

```js
for (const [field, raw] of [['subtasks', fm.subtasks]]) {
```

The renderer resolves against subtasks alone —
`astro-doc-code/src/layouts/issues/default/server/helpers.ts:338`:

```ts
const subtaskByPath = new Map(issue.subtasks.map((s) => [subtaskRefPath(s), s]));
```

So a stage whose `subtasks:` entry points at an agent-log file **passes the gate and
renders as a broken reference in red.** The two-folder index is a leftover from when
`agent-logs:` was a second frontmatter ref list resolved by the same helper; retiring
that list left the index wider than the field it now guards.

**The failure scenario is the migration this week's change prescribes.** The skill, the
in-app guide and the user-guide all tell an author to move a stage's run link off
`agent-logs:`. An author who moves the entry into `subtasks:` — the only other
structured list on the stage — gets a green `agent-ks check issues` and a plan page
carrying *"1 reference in this plan resolves to nothing."* That is precisely the
condition the error exists to prevent: `28_plans.md:116-118` says a resolving-to-nothing
ref "would otherwise vanish", and check.mjs:388-390 calls it "the one error that
matters".

**Reproduced with:**

```bash
# fixture: verification/skill-consistency/out/mutants/M21-agentlog-ref-in-subtasks
bun plugins/agent-ks/skills/agent-ks-docs/scripts/issues/check.mjs \
    --tracker verification/skill-consistency/out/mutants/M21-agentlog-ref-in-subtasks
#   → ✓ all checks passed   (0 errors)

cd astro-doc-code && bun ../verification/skill-consistency/ref-index-probe.ts
#   → 01_decoder-and-retention/10_decoder-swap:
#       refs=["agent-log/010_wf_ship-the-decoder/01_summary.md"]
#       resolved=0  MISSING=["agent-log/010_wf_ship-the-decoder/01_summary.md"]
```

The probe uses the framework's own `loadIssue()` and `resolvePlanStage()`, not a
re-implementation.

**Refutation attempted.** (a) Maybe the loader also accepts agent-log targets, making the
two agree — no: `resolvePlanStage` reports it in `missing`, and `PlanPage.astro:131-142`
renders the red warning block off `missingTotal`. (b) Maybe an agent-log path fails
`planRefTarget` and is caught as unparsable — no: it resolves to an issue-relative path
and `index.has(target)` is true, so neither branch of the check fires. (c) Is there a
control proving the check can fail at all — yes: the same fixture with
`999_does-not-exist.md` errors (battery `M05-broken-subtask-ref`, KILLED).

## H2 — one stray filename silences every agent-log rule on a current-shape run, and silence is the clean result

**Severity: high. Reproduced.**

`check.mjs:718-719` classifies an agent log as retired-shape history:

```js
const LEGACY_SLOT = /^(00_goal|02_task_list|03_working|04_benchmark|05_notes)$/;
const LEGACY_MILESTONE = /^[1-9]\d{2,4}_.+\.md$/;
```

and line 752 is a bare `return` — the folder is then checked by **nothing** and reports
**nothing**. The docblock above it (lines 703-718) is explicit that this direction is the
dangerous one and that only names *unique to the retired shape* may appear in the set.
Two of the five are no longer unique in practice:

| Marker | Why it now occurs in a current-shape run |
|---|---|
| `LEGACY_MILESTONE` — any root `.md` with a 3–5 digit prefix starting 1-9 | A loose file at the run root is supposed to be **warned about** (check.mjs:823-826). If its prefix happens to be ≥ 100 — `140_audit-brief.md`, `100_notes.md` — the whole folder is reclassified instead, and the warning that exists for it never runs |
| `03_working` | Under the new numbering `02_` is working and `03_` is debrief. `03_working/` is the off-by-one a migration or a typo produces, and it is indistinguishable from history |

`05_notes` is the same shape of hazard: the numbering was introduced so a fourth slot
would cost `04_` and nothing else, which invites `05_notes/` as a fifth.

**Reproduced with** `bun verification/skill-consistency/legacy-mask-probe.mjs`. Each case
starts from a valid current-shape log and breaks **three** rules the validator normally
catches (an unnumbered `debrief/`, a retired `iteration:` key, a child log numbered
`05_wf_…` into the slot band), then adds one marker:

| case | findings on that log | verdict |
|---|---|---|
| `P0-control-no-marker` | 3 | CONTROL-OK — the three breakages are caught |
| `P1-root-milestone-file` (+ `140_audit-brief.md`) | 0 | **MASKED — validator silent** |
| `P2-03-working-typo` (+ `03_working/`) | 0 | **MASKED — validator silent** |
| `P3-05-notes-folder` (+ `05_notes/`) | 0 | **MASKED — validator silent** |

The control is computed in the same pass as the masked cases, so it proves the battery
can fail rather than certifying a dead run.

**Blast radius, measured on the real tracker:** 36 activity folders scanned, **31**
currently classified as retired-shape (checks skipped) — expected, history is not
migrated — of which 23 also carry `01_summary.md`. That last number is *not* by itself
evidence of misclassification (the retired shape had `01_summary.md` too); it is a
measure of how little discriminating power the detector has left. The live evidence is
P1–P3.

**Refutation attempted.** (a) Maybe `verification/agent-log-slot-numbering/legacy-detector-control.mjs`
already covers this — it does not refute it, it *codifies* it: its case list asserts
`['01_summary.md', '03_working'] → legacy=true` and `['101_first.md','102_second.md'] → legacy=true`.
The control passes on purpose; the behaviour it locks in is the finding. (b) Maybe the
loader also stops rendering, making it visible — no: the loader has no legacy concept at
all, so the content renders normally and only the validator goes quiet. (c) Maybe a
masked folder still produces its *other* warnings from the outer loop — no: the outer
loop only checks the folder's own name (check.mjs:872-880); everything inside is behind
the `return`.

## M3 — the four new scaffolders are documented with a flag they do not accept

**Severity: medium. Reproduced.**

Every recipe for the four scaffolders added this week passes the issue id as
`--issue <id>`; all four read it as a **positional**:

| Documented | Implemented |
|---|---|
| `SKILL.md:209-210` | `new-plan.mjs:30`, `new-stage.mjs:25` — `const id = args._[0]` |
| `references/20_sections/24_agent-logs.md:566, 576, 577` | `new-agent-log.mjs:43`, `new-iteration.mjs:46` — same |
| `references/20_sections/28_plans.md:227-229` | |
| `references/60_examples/63_agent-loops.md:50, 54` | |

`parseArgs` (`scripts/_cli.mjs:41`) consumes the value after `--issue` as that flag's
value, so `args._` stays empty and the script prints usage and exits 1.

```bash
bun .../new-agent-log.mjs --issue 2026-08-03-scratch-probe --kind wf --name x --tracker <scratch>
#   → Usage: agent-ks issue new-agent-log <issue-id> …   ; exit=1
bun .../new-agent-log.mjs      2026-08-03-scratch-probe --kind wf --name x --tracker <scratch>
#   → Created …/agent-log/010_wf_ship-the-decoder/ — settings.json 01_summary.md
```

The user-guide gets this right (`05_sub-docs/09_plans.md:302-304` uses the positional),
and so does the skill's own `new-subtask` recipe (`23_subtasks.md:78, 117`) — so this is
drift confined to the four commands added this week.

Not silent (it fails loudly with usage), which is why it is medium rather than high. It
costs a round every time an agent follows the skill literally.

**Refutation attempted.** Maybe the `agent-ks` dispatcher rewrites `--issue` into a
positional before handing off — no: `cli.mjs` / `_manifest.mjs` dispatch by name and pass
`argv` through, and running the scripts directly reproduces exactly what the dispatcher
would.

## M4 — `agent-logs:` is still taught as a live stage field in two places, and the validator hard-errors on it

**Severity: medium. Reproduced.**

| File:line | What it says |
|---|---|
| `plugins/agent-ks/skills/agent-ks-issues/references/10_writing/10_writing.md:23` | `plans/**/NN_<stage>.md` → `title` + `status`, plus `outcome`, `who`, `subtasks:`, **`agent-logs:`** |
| `default-docs/data/user-guide/19_issues/05_sub-docs/09_plans.md:117` | table row: `` `agent-logs:` `` — "Links to the runs carrying it out" |

Both are frontmatter **field tables**, the surface an author scans before writing a
stage. `09_plans.md` retires the field 32 lines later (`:149-160`), and `10_writing.md`
never mentions the retirement at all. Both tables also omit `notes:`, which shipped this
week and is a real column.

`check.mjs:377-379` errors on the field, so following either table breaks the gate:

```bash
# battery M04-agent-logs-frontmatter → KILLED, 2 findings
#   ✗ …/10_decoder-swap.md: `agent-logs:` is retired — the frontmatter ref list is for SUBTASKS only…
```

**Aggravated by a precedence rule.** `SKILL.md:40-42` names the user-guide the canonical
source of truth *"when this skill is unclear or stale"* — so an agent resolving the
contradiction by the documented rule lands on the stale table.

**Refutation attempted.** Maybe `10_writing.md:23` describes the historic schema on
purpose — no: every other row in that table is the current schema, and there is no
retired-fields section anywhere in the file.

## M5 — a 1-digit prefix passes the validator and silently makes the wrong plan active

**Severity: medium. Reproduced.**

The system-wide ordering grammar is **2–5 digits**
(`astro-doc-code/src/parsers/core/order-prefix.ts:25-26`, mirrored in
`scripts/_order-prefix.mjs:15-16`). The plans validator uses a wider one:

- `check.mjs:320` — `const prefix = e.name.match(/^(\d{1,5})[_-]/);` (plan folder)
- `check.mjs:359` — `const stagePrefix = f.name.match(/^(\d{1,5})[_-]/);` (stage file)

So `plans/1_decoder/` matches, the *"no numeric prefix"* warning does not fire, and the
loader's `parseOrderPrefixLoose` returns `position: null`. Unprefixed sorts **last**
(`issues.ts:1089-1094`), and `activePlan` walks from the end (`helpers.ts:259-264`) — so
the malformed folder becomes the active plan.

**Reproduced against the real `activePlan()`:**

```bash
cd astro-doc-code && bun ../verification/skill-consistency/plan-prefix-probe.ts
#  ["01_first","02_second","03_third"] → ACTIVE PLAN: 03_third        (correct)
#  ["1_first","02_second","03_third"]  → ACTIVE PLAN: 1_first         (wrong)
#  ["01_first","02_second","unprefixed-plan"] → ACTIVE PLAN: unprefixed-plan
```

The unprefixed case behaves identically **and is warned about** (check.mjs:322, whose
message even names the consequence: *"'which plan is active' is derived from the highest
number"*). The guard covers the obvious spelling of the bug and misses the adjacent one
that fails the same way. Battery `M11` / `M12`: SURVIVED, 0 findings.

Second-order: for a stage, `check.mjs` records `stagePositions` from its own 1-digit
parse while the loader stores `null`, so `5_a.md` + `05_b.md` is reported as a duplicate
stage id the loader does not have, and the `#` column renders `—`.

**Refutation attempted.** (a) Maybe the scaffolders can emit a 1-digit prefix — they
cannot: `new-stage.mjs:129` and `new-plan.mjs` both `padStart(2, '0')`. It is reachable
only by a hand-created or hand-renamed folder, which is the documented renumbering
workflow. (b) Maybe the sidebar number makes it obvious — no: `sequence: null` renders no
number at all, so the row looks like an ordinary unnumbered entry.

## M6 — a lone producer file with no iteration file is never reported

**Severity: medium. Reproduced.**

`check.mjs:816-820`:

```js
for (const [iteration, list] of byIteration) {
  if (list.length > 1 && !list.some((f) => f.digit === 0)) { … }
}
```

The `length > 1` threshold means a single `011_x.md` with no `010_` is silent. That is
the *likeliest* shape of the defect, not an edge case: one delegated agent wrote its
producer file and the orchestrator never wrote the round's own record — the exact thing
`24_agent-logs.md:186-200` says the iteration file exists for ("the orchestrator writes
the iteration file from what the round produced"; "the iteration file has exactly one
writer").

**Reproduced with** battery `M08-producer-without-iteration-file` — delete
`010_audit-round.md`, leaving `011_audit-bytes.md`: **SURVIVED, 0 findings.** The
two-producer version is caught, and the message is already written for it, so this is a
threshold rather than a missing rule.

**Refutation attempted.** Maybe a lone producer is legitimate — the skill does not allow
it: the last digit is `0` for the iteration file and `1`…`9` for "a producer's own file
sitting **beside it**", and `new-iteration.mjs --producer` derives its number from
`maxIteration || 1`, i.e. it assumes an iteration file exists.

## L7 — the user-guide teaches the retired agent-log sidebar row order

**Severity: low-medium. Reproduced in the built HTML.**

Change 6 of this week's set was *both sidebars lead with their symbol*. Plans was updated
everywhere; agent-log was not, in two places:

| File:line | Says | Code renders |
|---|---|---|
| `default-docs/data/user-guide/19_issues/05_sub-docs/05_agent-log.md:605-606` | `NN <symbol> <name> <count>` | symbol first |
| `default-docs/data/user-guide/19_issues/07_ui/02_detail-view.md:78` | `NN <symbol> <name> … <count>` | symbol first |
| same file, anatomy sketch (`10 ⟳ impl 5`) | number first | symbol first |

`SubdocTree.astro:280-287` carries a docblock stating *"Symbol before number ON
PURPOSE"*, and the built DOM confirms it:

```
python3 over astro-doc-code/dist/todo/2026-07-01-demo-issue-anatomy-showcase/index.html
  ['issue-sidebar__kind', 'issue-sidebar__num'] -> | 10 | implement sections | 15 |
  ['issue-sidebar__kind', 'issue-sidebar__num'] -> | 100 | codec migration | 4 |
```

The plans bullet in the same user-guide file is correct (`<status icon> NN <name>`), so
this is a half-applied edit rather than a whole page being stale. The skill and
`guide.ts` are both correct.

The stale screenshot `assets/demo-agent-log.png` is already tracked as needing Sid's
recapture; this is the *prose* beside it, which needs no screenshot to fix.

## L8 — "the active plan is pinned at the top" survives in two places, including the docblock of the code that removed it

**Severity: low-medium. Reproduced in the built HTML.**

| File:line | Text |
|---|---|
| `default-docs/data/user-guide/19_issues/05_sub-docs/07_agent-memory.md:50-51` | "one click away in the sidebar, with the active plan **pinned at the top of its group**" |
| `astro-doc-code/src/layouts/issues/default/parts/detail/DetailSidebar.astro:61` | "It is **pinned at the top of the Plans group** and marked" — contradicted four lines later at `:65` by "the active one is **MARKED rather than hoisted**" |

Built HTML: rows are in ascending prefix order (`01` then `02`) and the active one
(`02`) carries `is-current`, which `styles/detail.css:973` renders as
`font-weight: 600`. Nothing is hoisted.

The repo's own rule — *superseded wording is deleted, never kept* (`SKILL.md:92-99`) — is
broken inside the docblock documenting the supersession.

## L9 — this audit's own output location contradicts the skill, and trips the validator

**Severity: low. Reproduced.**

`references/20_sections/24_agent-logs.md:379-381` and
`user-guide/.../05_agent-log.md:445-448` both state: *"An audit report is an iteration
file … There is no separate `audit/` folder."* The audit brief
(`02_working/140_audit-brief.md`) directs both halves to `<activity>/audit/<scope>.md`.

That is a NeuraSutra-side orchestration convention meeting an agent-ks-side rule, and
here the agent-ks rule is the one with code behind it:

```bash
bun .../check.mjs --tracker default-docs/data/todo
#  baseline: 1 warning
#  after creating <activity>/audit/: 2 warnings
#  ⚠ …/020_wf_ship-the-split/audit/: prefix is below 100, so this reads as one of the
#    run's own slots rather than a child activity — the slots are `02_working/` and
#    `03_debrief/`…
```

An unprefixed folder is treated as a slot (`issues.ts:1204-1211`, `check.mjs:697-700`),
so `audit/` also sorts **after** every child activity in the sidebar rather than beside
the working files.

I wrote the report where instructed. Whether to keep or move the convention is the
orchestrator's call; it is recorded here so the warning is not read later as noise.

## L10 — six rules the skill states in prose that nothing checks

**Severity: low (informational). Reproduced — each is a battery survivor.**

Not defects; a map of where the manual is the only enforcement, so nobody assumes the
gate covers them.

| Rule | Where stated | Battery |
|---|---|---|
| `01_summary.md` is five `#` sections, in order, nothing else | `24_agent-logs.md:114-135` | `M15` SURVIVED |
| Every Todo item is a link, never a bare backticked number | `24_agent-logs.md:150-163`, `SKILL.md:358` | `M16` SURVIVED |
| An iteration file opens with `# Goal / # Inputs / # Expected Outcome / # Outcome` | `24_agent-logs.md:228-252` | `M17` SURVIVED |
| `outcome:` / `notes:` are one-liners | `28_plans.md:144-147` | `M19` SURVIVED |
| A single producer with no iteration file | `24_agent-logs.md:202-214` | `M08` — see M6 above |
| 1-digit ordering prefixes | `SKILL.md:354` | `M11` / `M12` — see M5 above |

The first three matter most: `01_summary.md` is the file every delegated agent is pointed
at as its brief, and its shape is checked only by whoever reads it.

## L11 — the detail-view anatomy sketch has no Plans section

`default-docs/data/user-guide/19_issues/07_ui/02_detail-view.md` — the ASCII sidebar
sketch runs Brainstorm → Notes → Subtasks → Agent log → Agent memory. The section
registry (`astro-doc-code/src/loaders/issue-sections.ts:64-106`) puts **plans** between
notes and subtasks, and the same page's bullet list documents Plans correctly. The
diagram was not updated when the section shipped.

## L12 — the broken-reference UI has no fixture anywhere in the built site

`PlanPage.astro:131-142` renders the *"N references in this plan resolve to nothing"*
block — the only surface for the plans validator's only error.

```bash
grep -rl "issue-plan__warning" astro-doc-code/dist   # → 0 files
```

The demo fixture still carries a file **named**
`plans/02_hardening-the-edges/30_broken-ref-demo.md`, but its `subtasks:` list resolves
cleanly and its title is "Insert with room to spare" — the demo it advertises was removed
and the filename was not. So the one affordance that makes a broken ref visible is
unexercised, and its filename says otherwise.

Directly relevant to H1: a fixture here would have rendered the red block on a green gate
and made the mismatch visible.

## L13 — the child-agent-log numbering example does not match what the CLI produces

`user-guide/.../05_agent-log.md:543-546` numbers five sibling child logs `100_`, `200_`,
`300_`, `400_`, `500_`. The skill's version of the same worked example
(`24_agent-logs.md:516-538`) uses `100_`, `110_`, `120_`, `130_`, `140_` and explains the
gap-of-ten ("a sixth workflow inserted between two others gets `115`").
`new-agent-log.mjs:135-154` gap-spaces by ten from a floor of 100, so the skill matches
the tool and the user-guide implies a convention nothing produces. Both are legal
(≥ 100); only one is what you get.

## L14 — `check-skill-links` defaults to a single skill

`check-skill-links.mjs:37-38` defaults `SKILL_ROOT` to the directory holding `scripts/`,
i.e. **agent-ks-docs only**. The brief records it as "clean across all three skills";
that is true, but takes three invocations. Run bare, it reports a clean run having read
one of the three.

```bash
for s in agent-ks-docs agent-ks-issues agent-ks-artifacts; do
  bun .../check-skill-links.mjs plugins/agent-ks/skills/$s; done   # all three clean
```

## L15 — the installed plugin and the repo share a version number and differ in content

`/home/sid/.claude/plugins/cache/sids-plugin-marketplace/agent-ks/0.6.7` and
`plugins/agent-ks` both declare `0.6.7`; `diff -rq` reports ~25 differing files, plus
`new-iteration.mjs`, `new-plan.mjs`, `new-stage.mjs` and `28_plans.md` present only in
the repo. So `agent-ks` **on `PATH` cannot run this week's scaffolders**, and a session
loading the installed skill reads the pre-plans manual. The version bump is already held
on Sid's word; this records the concrete consequence — every command in this audit was
therefore run against the repo scripts with `bun`, never via `agent-ks`.

---

# Checked and found CLEAN

Named because a named clean area is signal.

| Area | How it was checked | Result |
|---|---|---|
| **Plan table columns** | built HTML `<thead>` of the demo plan page | `# · Stage · Status · Who · Outcome · Notes` — matches `28_plans.md:168`, `guide.ts:302`, `09_plans.md:218-226`. No count column anywhere |
| **Plans sidebar row order + active marking** | built HTML of the demo issue | `<status icon> NN <name>`, ascending, `is-current` → `font-weight: 600`. Matches all three documents |
| **Agent-log slot grammar in code** | `issues.ts:1202-1211` vs `check.mjs:692-700` | `AGENT_LOG_CHILD_MIN_PREFIX = 100` on both sides; unprefixed treated as a slot on both. The skill, `guide.ts:246-252`, `03_folder-structure.md:129` and `05_agent-log.md:67-71` all agree, including the unprefixed row |
| **The pin-summary-first sort rule is gone** | `SubdocTree.astro:213-231` | Only the `memory.md` pin remains, scoped to `kind === 'memory'`. Prefix-value sort interleaves files and folders. Documented as deleted in all three places |
| **`agent-logs:` errors in the validator** | battery `M04` | KILLED, with the message naming the body-link replacement |
| **Broken `subtasks:` ref errors** | battery `M05` | KILLED — for a target that exists nowhere. (The agent-log-target hole is H1) |
| **Ordering-label drift warns** | battery `M10` | KILLED. `orderingPathFor` (`_links.mjs:116-125`) and `orderingPathOf` (`helpers.ts:296-310`) are separate implementations of the same four lines; both docblocks' examples agree, and `020/02/090` comes out right on both |
| **`iteration:` retired under `02_working/`** | battery `M06` | KILLED, scoped to the new-shape folder as documented |
| **`dropped` without a callout warns** | battery `M07` | KILLED. The reverse is deliberately unchecked, as `24_agent-logs.md:309-310` states |
| **Unnumbered `working/` / `debrief/` warns** | battery `M02` | KILLED, with the exact rename in the message |
| **`01_summary.md` required** | battery `M01` | KILLED |
| **Child log numbered into the slot band warns** | battery `M18` | KILLED |
| **Stage `# H1` warns** | battery `M09` | KILLED |
| **Two open plans hints** | battery `M20` | KILLED, phrased as the convention it is |
| **The scaffolders produce a validator-clean tree** | `new-agent-log` → `new-iteration` → `new-iteration --producer` → `new-agent-log --parent` → `new-plan` → `new-stage ×3` on a scratch tracker, then `check issues` | `✓ all checks passed`. `--parent` numbered the child `100_`; `--after 10` produced stage `15` (the midpoint), matching `28_plans.md:232-234` |
| **Depth budget** | `check.mjs:856-858` vs `issues.ts:861-866` | Validator errors one level before the loader would drop content — conservative in the safe direction. "Two levels of child agent log" holds |
| **Status vocabularies** | `issue-status.ts:19, 57` vs `_lib.mjs:76`, `check.mjs:111` | Seven canonical, five for runs; identical membership and order across framework and plugin |
| **Right-rail index on a plan page** | `helpers.ts:482-506` | Overview → Stages → each stage → its own headings, built by one function serving both the page and the rail |
| **Stage anchors** | `issues.ts:1040-1042` | Slugified from the title, never the prefix — as all three documents claim |
| **Skill link resolution** | `check-skill-links.mjs` × 3 | Clean on all three skills |
| **Tracker baseline** | `check issues` on `default-docs/data/todo` | 51 folders, 0 errors, 1 pre-existing warning — the brief's figures reproduce |
| **`63_agent-loops.md`, `01_folder-layout.md`, `00_overview.md`, `26_agent-memory.md`** | read against the code | Current shape throughout; no six-slot survivors, no `summary.md`-first claim, no subtask count |

# Harnesses

Everything under `verification/skill-consistency/`, none of it in `/tmp`:

| Path | What it is |
|---|---|
| `scratch-tracker/` | a minimal valid tracker, built entirely by the CLI scaffolders |
| `battery.mjs` | the 21-mutant battery; each mutant gets its own copy, so parallel runs cannot corrupt each other |
| `legacy-mask-probe.mjs` | the H2 mutants plus the real-tracker blast-radius count |
| `plan-prefix-probe.ts` | M5, against the framework's own `activePlan()` |
| `ref-index-probe.ts` | H1, against the framework's own `loadIssue()` + `resolvePlanStage()` |
| `out/battery.md`, `out/legacy-mask.md`, `out/check-baseline.txt`, `out/plan-prefix.txt` | recorded output |
| `out/mutants/`, `out/legacy-mask/` | every mutated tracker, kept so each finding stays reproducible |

The TypeScript probes must run from `astro-doc-code/` so Bun resolves the framework's own
modules:

```bash
cd astro-doc-code && bun ../verification/skill-consistency/ref-index-probe.ts
```
