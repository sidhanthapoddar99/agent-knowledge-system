---
title: "The skills disagree with the code, with each other, and with themselves"
status: review
---

# Overview

**Two independent audits of the two shipped skills, and Sid's rulings on every
question they raised.** This subtask holds exactly two things: **what the audits
found** (validated only — one headline finding did not survive re-checking and is
recorded as a correction rather than as work), and **what Sid decided to do about
it**.

The scoping ruling, which governs everything below:

> *"The code remains pristine, only skill changes."*

Code defects are written down and left alone.

**Two lenses, chosen so neither could reach the other's findings.** One read the
skills against themselves and against the framework (`guide.ts`, the validator,
the loaders). One ran things: enumerated the CLI manifest, diffed it against
every mention in both skills, measured duplicate prose, checked every repo path
named in prose.

**The biggest finding is a gap rather than an error.** How a plan turns into agent
logs is not stated anywhere — three sources imply three different mappings and no
rule adjudicates. Sid supplied the answer; it is the largest single addition this
subtask makes.

**Done when** the skills no longer instruct an agent to do something the code
rejects, the plan-to-agent-log mapping is written down, and every decision below
sits in the file that owns it.

# References

- The run that commissioned both audits:
  [`070_rf_tracker-ergonomics-three-fixes`](../../agent-log/070_rf_tracker-ergonomics-three-fixes/01_summary.md)
- The agent whose own bug this audit caught:
  [`055`](./055_an-index-is-checked-by-a-cheap-agent.md)
- The two decisions taken earlier the same day that set this one's scope:
  [`025`](./025_an-index-is-checked-not-generated.md) and the parser revert in
  [`080_cut-it-back`](../../agent-log/070_rf_tracker-ergonomics-three-fixes/02_working/080_cut-it-back.md)

# Todo list

- [x] **D3** — the plan-to-agent-log mapping into `24_agent-logs.md`, before the
      worked examples, with the audit carve-out (**D4**)
- [x] **D6** — the status-colour line in `SKILL.md`: it tells an agent to write a
      key the validator hard-errors on
- [x] **F2** — the `/assets/` carve-out in `agent-ks-docs/SKILL.md`
- [x] **F3** — the depth cap: state **5**, state that overflow is silent content
      loss, derive the two-child-log ceiling from it
- [x] **D2** — prefixes mandatory for `comments/`, `plans/`, `agent-log/`,
      `subtasks/`
- [x] **D9** — numbering: `NNN_` convention, `NN`–`NNNNN` allowed, gap-spaced
      `010 020 … 090 100 110 120`; the `≥ 100` band applies only inside a log
- [x] **D7** — demote link formatting from `SKILL.md` to `10_writing.md`, leaving
      the three-line summary
- [x] **D8** — state that the round index is optional-but-conventional, and that
      index-ness is not positional
- [x] **F5 · F10 · F11** — the migration script name, `check links`,
      `/agent-ks-quick-idea-note`, and the slash-command counts
- [x] **F12** — the index-checker agent's hardcoded `00_overview.md`
- [ ] **F17** — `agent-ks help` omits ~20 flags the tools really have. **Not done: it
      is a code change, and D1 says code stays pristine.** The skill now warns that
      `help` abbreviates, so nobody concludes a working flag is missing

# Outcomes and Next Steps

**Done and at `review`, 2026-08-04.** Every ruling landed in the file that owns it;
plugin bumped to **0.8.1**.

**Three things are deliberately not done**, all for the same reason — **D1**, code stays
pristine: **F17** (`help` under-reports its own flags), **F18** (the loader still
implements a `statusColors` override the validator rejects) and **F19** (two layouts read
that forbidden key, so every issue *detail* page renders its legend and status chips
colourless while the index page renders them fine). F19 is user-visible and worth its own
subtask when code is back in scope.

**What changed, by surface:**

| File | Change |
|---|---|
| `agent-ks-issues/SKILL.md` | status colours (**F1/D6**) · depth cap stated as 5 with its cause (**F3**) · prefixes mandatory (**D2**) · numbering + the `≥100`-is-inside-only clause (**D9/F8**) · plan mapping summary (**D3**) · index optional and not positional (**D8**) · link rule cut from ~65 lines to a 3-row table (**D7/F16**) · `memory.md` added to read-before-work (**F14**) · slash-command + agent table (**F11**) · `help` abbreviates warning (**F17**) |
| `24_agent-logs.md` | new **How a plan becomes agent logs** section with the diagram, five rules and the audit-by-size table (**D3/D4/F6**) |
| `agent-ks-docs/SKILL.md` | the `/assets/` carve-out deleted (**F2**) · four commands, not two (**F11**) |
| `cli-toolkit.md` | `check links` documented (**F10**) |
| `03_overall-issue-tracker-vocabulary.md` | migration script name (**F5**) |
| `images.md` | `--report` removed (**F17** residue) |
| `agent-ks-index-checker.md` | any `00_*.md` leaf, and the index leaf's status rather than a group's (**F12**) |
| `10_writing.md` · `01_folder-layout.md` · `63_agent-loops.md` | `0NN_`/`0N0_` → `NNN_` (**F8**) |

# Details

## 1 · What the audits found

Validated findings only. Severity order.

### 1.1 The skill instructs an agent to do things that fail

| # | Where | Says | What actually happens |
|---|---|---|---|
| **F1** | `agent-ks-issues/SKILL.md` | *"a tracker overrides only colors"* | `statusColors` in a tracker root is a **hard validator error**. The skill's own reference file already says the opposite |
| **F2** | `agent-ks-docs/SKILL.md` | *"the one leading-`/` exception is `/assets/…`"* | Reversed in this repo. The tracker skill, `guide.ts`, `CLAUDE.md` and the gate all disagree — `check-link-form.mjs` has no assets branch at all. **Third surviving instance** |
| **F3** | `SKILL.md` | nesting is *"recursive"*, and *"that is the only nesting rule"* | Capped at **5**; past it the loader drops the content — no page, no error, one `console.warn` in a build of hundreds of lines |
| **F4** | `SKILL.md` | the prefix is *"optional for issue subdocs"* | Required in four sections, and the validator warns on it |
| **F5** | `03_overall-issue-tracker-vocabulary.md` | run `migration/0.1.3_status-colors-to-css.py` | The file is `0.2.0_status-colors-to-css.py`. No `0.1.3_` script exists |

**F3 is the one that loses work rather than erroring.** The cap is
`MAX_SUBFOLDER_DEPTH = 5`, in `order-prefix.ts` and mirrored in the validator:

```
agent-log/                      1
  010_wf_run/                   2
    100_wf_child/               3   ← child log
      02_working/               4
        011_producer/           5   ← the cap
```

Two levels of child log is **derived** from the 5, not a separate number: the
validator errors at `depth + 2 >= 5` so a child log always keeps room for its own
`02_working/` and a producer folder.

### 1.2 Gaps and contradictions in the skill itself

| # | Finding |
|---|---|
| **F6** | **The plan-to-agent-log mapping is absent.** `SKILL.md` says *"open the log before the first stage"* (reads as one plan = one log); a worked example opens one log over stages 3–5 of 8; `63_agent-loops.md` opens two logs against a two-stage plan. **Stage → iteration is never defined at all** — the only statement is the negative *"the mapping is never one-for-one"* |
| **F7** | `02_working/00_index.md` has three answers: the rule calls `02_working/` not required, the scaffolder creates it and its index **unconditionally**, and all four worked trees omit it |
| **F8** | Three notations for the run prefix — `0NN_`, `NNN_`, `0N0_`. `0NN_` caps a tracker at nine runs; the tenth is `100_`, which readers have just been taught means *child log* |
| **F9** | The open-a-log rule exists in three copies, and `SKILL.md` drops four things from it: the delegation limit (*"never triggers alone"*), the delete-it-if-unearned rule, the escalation for anything changing a rule or a skill, and any pointer to the worked examples |
| **F13** | Rules the skill calls **required** are only warnings: a missing `01_summary.md`, a missing `agent-memory/memory.md`, a plan with no `settings.json` or `overview.md`. A subtask with no `status` silently defaults to `open` |
| **F14** | `guide.ts` carries an operating instruction the manual dropped — *"`memory.md` is the pinned index — read it first"* — plus a UI "Surfaces" list and the non-markdown file glyph, neither in the skill |
| **F15** | **No duplicated passage still agrees word-for-word.** Zero exact repeated two-sentence blocks; five near-duplicates, all drifted — in a skill whose first principle is *no file stores a fact another file owns* |
| **F16** | `SKILL.md` spends ~65 of 467 lines on the link convention, fully covered in three other places — **14% of the always-read surface** on a formatting rule, while the depth cap and the delegation limit get a link or nothing |

### 1.3 Coverage gaps

| # | Finding |
|---|---|
| **F10** | `check links` is documented in neither skill — the only CLI verb of 37 with no mention anywhere |
| **F11** | `/agent-ks-quick-idea-note`, a shipped slash command, appears in neither skill. The counts are wrong twice: `agent-ks-docs/SKILL.md` says two, `CLAUDE.md` says three; there are four |
| **F12** | The index-checker agent built the same day hardcodes `00_overview.md`. The rule is *any* `00_` leaf, and `check.mjs` agrees — a group indexed as `00_index.md` would be reported as having no index |
| **F17** | **`agent-ks help` under-reports its own flags** by roughly twenty, hiding working options from anyone discovering commands the documented way |

### 1.4 The code defects, recorded and not touched

Per **D1**, these are written down and left alone.

| # | Defect |
|---|---|
| **F18** | `loaders/issues.ts` still **implements** a per-tracker `statusColors` override and merges it, while `issue-status.ts` and `check.mjs` reject the key. The framework contradicts itself |
| **F19** | `DetailBody.astro` and `SubDocLayout.astro` read `vocabulary.fields?.status?.colors` — the forbidden key — so they always receive `{}`, while `IndexBody.astro` correctly uses the loader's resolved map. **Effect: the issue index legend is coloured; every detail page's legend and status chips are not** |

### 1.5 The correction — a finding that did not survive re-checking

One audit reported **22 phantom flags**, with `images.md` called documentation
for a tool that no longer exists.

**Wrong, and re-checking took one command.** Every one of those flags is in the
source — `--scale`, `--width`, `--height`, `--trim`, `--lossless`, `--colors`,
`--depth`, `--dither`, `--recursive`, `--include-closed`, `--quiet-tips`,
`--created-after`, `--has-review-subtasks`, `--no-warnings`, `--verbose`.
Exactly **one** is genuinely gone: `img --report`. Nothing was removed from the
image tool.

**The auditor used `agent-ks help <cmd>` as its oracle for "what flags exist."**
The help output is abbreviated, so the docs were measured against a summary of
the thing rather than the thing. The valid residue is **F17**, which is the
opposite fix from the one reported.

*Recorded rather than quietly dropped: this is the session's own recurring
failure — a check scoped to the wrong oracle — appearing inside the check written
to catch it.*

## 2 · What Sid decided

### 2.1 The rulings on this audit

| # | Decision |
|---|---|
| **D1** | **Code stays pristine.** Skill edits only; code defects are recorded and left (**F18**, **F19**) |
| **D2** | **Prefixes are mandatory going forward** for `comments/`, `plans/`, `agent-log/`, `subtasks/`. The code keeps accepting unprefixed folders for legacy content; the skill stops presenting it as a choice |
| **D3** | The plan-to-agent-log mapping — eight rules, below |
| **D4** | **Where an audit goes, decided by size rather than location** — below |
| **D5** | **The skill does not teach delegation.** *"This is something which is decided by the master agent that is you during execution, or by me, or it's the plan."* Not the skill's subject |
| **D6** | **No status-colour override anywhere.** *"No per tracker based override or per issue based override. It's consistent for the whole tracker."* Only theme CSS, or defining the variable in the theme |
| **D7** | **Demote the link-formatting bulk** from `SKILL.md` to `10_writing.md`, keeping a short yes/no summary |
| **D8** | **The round index is optional but conventionally there.** And index-ness is *not* positional — the checker takes a path or an instruction, so a file is an index because you point at it, not because it is called `00_overview.md` or sits at position `00` |
| **D9** | **Numbering: `NNN_` by convention, `NN`–`NNNNN` allowed**, gap-spaced `010 020 … 090 100 110 120`. The `≥ 100 = child` band applies **only inside a log** — directly under `agent-log/`, `100` is simply the tenth run |

### D3 · The plan-to-agent-log mapping

```
plans/01_the-plan/                    10 stages
   ├── 010_stage  ┐
   ├── 020_stage  │ milestone A  ──► agent-log/010_wf_plan/100_wf_milestone-a/
   ├── 030_stage  ┘                     └── 02_working/  010_… 020_…
   ├── 040_stage  ┐
   ├── 050_stage  ┘ milestone B  ──►                     /110_wf_milestone-b/
   ├── 060_stage    milestone C  ──►                     /120_wf_milestone-c/
   ├── 070…100     milestone D  ──►                      /130_wf_milestone-d/

agent-log/020_au_the-audit/           ← outside the plan → its own top-level log
```

1. **The plan gets one main agent log.** Milestones get child logs under it.
2. **A milestone is subjective** — set by whoever is running the work. Nothing in
   code knows the word, and nothing should.
3. **A child log covers a group of stages**, typically two or three.
4. **A stage becomes working files.** Bundle several stages into one file, or
   split one stage across two — the working file is bounded by *the round that
   produced something*, never by the stage boundary.
5. **A stage holds multiple subtasks.** Unchanged.
6. **Work outside the plan but essential gets its own top-level log** — not a
   child of the plan's log.
7. **The index file is optional but conventionally there** (**D8**).
8. **Numbering per D9**, and the `≥ 100` clause exists because of a real
   collision: `SKILL.md` writes the run prefix as `0NN_`, which caps a tracker at
   nine runs.

### D4 · Where an audit goes

The first statement of rule 6 conflicted with the agent-log floor, which says a
single self-contained pass with nothing discarded does not earn a log. Sid's
refinement resolves it **by size**:

| Audit | Where it goes |
|---|---|
| Outside the plan | its own top-level agent log |
| Inside a plan, **large** — many things checked, issues being hunted | its own agent log |
| Inside a plan, **small** — *"three agents independently checking it"* | **one or two working files** in the log already open |

So the floor still governs; "outside the plan" becomes an explicit trigger, and
size decides everything else.

### D7 · What survives the demotion

`SKILL.md` keeps exactly this, and `10_writing.md` keeps the reasoning:

| Form | Verdict |
|---|---|
| `[040/100 the migration script](../040_execution/100_migration.md)` | **yes** — the ordering label makes it navigable |
| `[the migration script](../040_execution/100_migration.md)` | **yes** — fine; the label just helps when numbers exist |
| `` `subtasks/040_execution/100_migration.md` `` | **big no** — a path in backticks is text, and `agent-ks move` cannot maintain it |

### 2.2 The decisions taken earlier the same day

Recorded here because they set the scope this audit ran inside, and because two
of them reversed work that had already shipped. The detail is in the linked
records; only the ruling is restated.

| # | Decision | Recorded in |
|---|---|---|
| **E1** | **One home for a rule, everything else links to it** — no duplication | [`020`](./020_when-a-run-earns-an-agent-log.md) |
| **E2** | **No generated index.** Hand-write it; delete the generator, the CLI verb and the staleness gate | [`025`](./025_an-index-is-checked-not-generated.md) |
| **E3** | **Only `[](…)` and `[[…]]` are links.** Anything in backticks is text; no check for backticked paths. The bulk conversion belongs to `migration/`, ran once, and is not re-run | [`080_cut-it-back`](../../agent-log/070_rf_tracker-ergonomics-three-fixes/02_working/080_cut-it-back.md) |
| **E4** | **Revert the markdown parser**, keep the simplest code that works | same |
| **E5** | **Keep the differential test** — it states the limits rather than removing them | same |
| **E6** | **Build the index-check agent and its slash command** — and the *"memory burden"* objection was about the CLI's eight `check` verbs, not about the agent | [`055`](./055_an-index-is-checked-by-a-cheap-agent.md) |
| **E7** | **The index check must run in both directions** — listing the folder, not only following the index's own links, because an index that stops at ten can never lead you to entries eleven to fifteen | same |

## 3 · What is deliberately not done

**Delegation stays out of the skill** (**D5**). `24_agent-logs.md` keeps
describing orchestrators and producers without explaining how to launch one —
that is the orchestrator's business, or the plan's.

**No code is touched** (**D1**), including the two framework defects at **F18**
and **F19**.
