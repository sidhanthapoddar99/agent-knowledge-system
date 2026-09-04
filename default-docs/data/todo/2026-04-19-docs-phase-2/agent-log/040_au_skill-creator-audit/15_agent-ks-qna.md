---
title: agent-ks-qna — Opus review
---

# agent-ks-qna

**Verdict:** `needs fixes` — the approach holds and survived the dry run; the gaps are at the seams (no read-first step, one CLI verb named where three are needed, one ambiguous sort rule).

**Measured:** SKILL.md 557 words body, 641 words including frontmatter (description 80 words) · references: question-bank.md 108 lines, writing-rules.md 37 lines. All three inside the house limits, taking the 600-word rule as the body.

## Findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | major | `SKILL.md:32` | The link to `question-bank.md` does not say when to open it, and its "Story mode: extraction cues" table is needed on every story-mode run. | The guide asks each reference link to say when to read it; without that the agent sorts a dictated brief by feel and skips the cue table. | Change to: "Read it before you sort a story, and to pick the questions a round asks: `[question-bank.md](./references/question-bank.md)`." |
| 2 | major | `references/question-bank.md:68-69`, `:91`, `:101-103` | The cue table sends "says 'don't'" to home 4 and "says 'not X because'" to home 5; the worked example's own sentence matches both, and the example silently writes it into both — "Use the shared link walker in `_links.mjs`" as a guardrail and "reuse the shared walker" as decision `01`. | The commonest sentence shape a user dictates is "don't do X because Y". The example is what the agent copies, so it teaches a two-home write that `writing-rules.md:12` and the house rule "one home per fact" forbid. | Add one line under the cue table: "A sentence that is both a limit and a ruling: the limit goes to `## Guardrails`, the reason to `# 04`. Never the limit twice." Then trim the example to match. |
| 3 | major | `SKILL.md:36` | "Then write the file with `agent-ks issue new-subtask`" overstates the command. Verified against `agent-ks-dev help issue new-subtask`: its flags are `--name`, `--title`, `--group`, `--overview`, `--index`. It scaffolds the template only. | Six of the seven answers (Guardrails, Questions, Done when, To Do, Decisions, and any long why) cannot be passed to it. The skill never says to fill them by editing, so the agent must guess whether hand-editing tracker structure is allowed. | "Scaffold with `agent-ks issue new-subtask --name <slug> --overview '<the why>'`, then fill the remaining sections by editing the file. The template has no verb for the section bodies." |
| 4 | major | `SKILL.md:28`, `:30` | Interview mode says "Never ask what the issue, its notes, its memory or an earlier round already answered", but no mode tells the agent to read them first, and no command is named. Story mode does not mention them at all. | The rule is unenforceable as written. The agent either re-asks what the issue already says, or invents a way to look. | Add one line above "Two ways in": "Read the issue, its `notes/` and its `agent-memory/` first — `agent-ks issue show <id>`. Ask only what they leave open." |
| 5 | major | `SKILL.md` (whole) | The skill names one CLI verb. Two more belong to its own workflow and exist: `agent-ks issue set-state <issue> input-needed --subtask <n>` for the status the skill mandates at `:22`, and `agent-ks check issues --template`, which warns on a missing template heading and on a `## Questions` entry while the status is not `input-needed`. | Those are the two failures this skill can produce, and the CLI already catches both. House rule: the CLI is the tool for the tracker. The skill ships no verification of its own output. | Name `set-state` where `input-needed` is first stated, and end "Play back before you write" with "After writing, run `agent-ks check issues --template`." |
| 6 | minor | `SKILL.md:21` | Row 6's home is compressed to "`## Guardrails` for the limits; `# 04` for the freedom". Which half "what must it bring back" belongs to is left to the reader. | The reader must reverse-engineer the mapping, and the worked example shows only the freedom half (`question-bank.md:104-105`). | Spell it out: "what it must bring back → `## Guardrails`; what it may decide alone → `# 04`, as a decision with its reason." |
| 7 | minor | `SKILL.md:34-36` and `references/writing-rules.md:18-20` | The playback rule is written twice, near-verbatim: show in template order, mark `(inferred)`, keep the marks out of the file. | One home per fact. Two copies drift, and the reference costs a load for something already in context. | Keep it in SKILL.md. Delete `## The playback` from `writing-rules.md`. |
| 8 | minor | `SKILL.md:3` | The description carries no "not this" redirect, unlike its siblings (`agent-ks-issues` and `agent-ks-docs` both end with one). | The near-miss is real: a one-line idea belongs to `agent-ks-quick-idea-note`, and a question about the subtask file's shape belongs to `agent-ks-issues`. Both share this skill's vocabulary. | Append the two redirects. Draft in "Proposed description" below. |
| 9 | minor | `SKILL.md:34-36` | The playback is the only output this skill produces, and its shape is described in prose. The one example sits at the end of `question-bank.md`. | The guide asks for an example where the output has a shape. The reader must open a reference to learn what to type back. | Acceptable once finding 1 makes the reference an explicit read. Otherwise inline a six-line skeleton of the playback. |
| 10 | minor | `SKILL.md:49` | The "Never" row "Store the answers in a log, a comment or memory" gives no reason, and none is stated nearby. | `agent-memory/` is always-on working state in this project, so storing scope there is a plausible mistake rather than an obvious one. The pair-with-"Do instead" form only works when the reason is implied. | Add the reason: "a log holds the path, the subtask holds the order; memory is dropped when the run ends." |
| 11 | minor | `default-docs/data/user-guide/05_getting-started/05_claude-skills.md:121` | The plugin file listing reads `agent-ks-qna/  SKILL.md · references/question-bank` and omits `writing-rules`. | The user guide wins over the skill, so its listing should name both reference files. Outside the skill folder; fix belongs to whoever owns the user guide. | Change to `SKILL.md · references/question-bank, writing-rules`. |

Verified true, no finding: every command, section heading, status value and path the skill states exists — `agent-ks issue new-subtask`, `# 01 To Do`, `## Guardrails`, `## Questions`, `## Done when`, `# 03 References`, `# 04 Decisions`, `# 05 Notes & Analysis`, status `input-needed`, the stage's `outcome` frontmatter line, and the `_links.mjs` / `check-link-form.mjs` paths used in the worked example. `agent-ks-dev check skill-links` passes; every link is relative; no history language anywhere in the three files. The plan-stage mapping in `writing-rules.md:26-31` matches `07_plans.md`. The skill carries no scripts, and correctly so — the work is judgement, not a deterministic transform.

## Trigger test

| Prompt | Should fire | Fires |
|---|---|---|
| "before you start on the sidebar collapse thing let me explain what i actually want — this is going to run unattended overnight so i want it written down properly" | yes | yes — "before you start" and "let me explain" are both named in the description |
| "ok so the link checker situation. right now it lives in the engine which is wrong, a consumer has no build so they can never run it, so move it into the plugin, files only, no server. don't touch the route parity check that stays. anything about how you structure the script is your call" | yes | yes — no trigger phrase, but "dictates a long story about a job" catches it |
| "subtask 040 in docs-phase-2 has a to-do list and nothing else. no why, no done-when. i want to hand it to a long run tomorrow" | yes | yes — the "when a subtask lacks a why … a done-when" clause catches it exactly |
| "capture a quick idea for me: the subtask sidebar should collapse groups once you're past fifteen" | no (belongs to `agent-ks-quick-idea-note`) | unsure — "starts defining a subtask" could pull it in; the description has no redirect to stop it. This is finding 8 |
| "what's the difference between `05 Notes & Analysis` and `notes/`?" | no (belongs to `agent-ks-issues`) | no — the description is about scoping a run, not about tracker anatomy |

## Proposed description

> Scope a subtask or a plan stage by question and answer before an agent runs it alone. Use it whenever the user starts defining a subtask or a plan, says "let me explain", "scope this", "before you start" or "this will run unattended", dictates a long story about a job, or when a subtask lacks a why, guardrails, a done-when or decisions with reasons. It writes the answers into the subtask's own sections, reason included, so an autonomous loop never stops to ask. For the shape of a subtask file use agent-ks-issues. For a one-line idea with no run behind it use agent-ks-quick-idea-note.

Two changes only: one more trigger phrase ("this will run unattended"), and the two redirects that stop the near-miss in the trigger table.

## The dry run

Prompt, dictated: *"ok before you start — subtask for the sidebar. every issue folder shows its subtasks flat and past about fifteen it's unreadable, you can't tell a group from a leaf. i want group folders collapsed by default with the done/total count on the row, click expands. don't touch the issues index page, separate work, i've got a plan open on it. keep `agent-ks check issues` green. use the existing sidebar component, don't fork it — we had two sidebars once and it was a nightmare. the count should be the one the group already computes, don't recompute. whether the expand state survives a page load, not sure, ask me. all the CSS is your call."*

1. Description fired on "before you start" plus the length. SKILL.md loaded; the seven-homes table told me what I was collecting inside one read. Good.
2. Story mode said "sort every sentence into the seven homes" but not how, so I opened `question-bank.md` for the cue table. The link gave no reason to open it — I went on need, not instruction (finding 1).
3. "collapsed by default with the count on the row, click expands" is one sentence carrying both the work (home 3) and the acceptance test (home 2). No tie-break; I split it by hand.
4. "use the existing component, don't fork it — two sidebars once" matches the "don't" cue and the "not X because" cue. The worked example resolves the identical shape by writing both homes, so I copied that and duplicated the limit (finding 2).
5. I had no target issue and no way to pick one. The skill never says how to find the issue, or what to do when none exists; I had to reach for `agent-ks issue list` unprompted.
6. Gaps to ask: no `Done when` I could run, and no paths. Question bank 2 and 3 gave me both questions with their reasons — this part worked exactly as intended.
7. Playback: shape taken from the worked example, `(inferred)` marks applied. Clean.
8. Writing: ran `agent-ks issue new-subtask`, got an empty template. The skill implies the command writes the answers; it does not, and never says to edit (finding 3). Status stayed `open` with a question live — the failure the skill exists to prevent — and no verb was named to fix it (finding 5).
9. Did not need: `writing-rules.md:23-37` (plan stage, note, brainstorm) — correctly a reference. Its `## The playback` was a re-read of SKILL.md (finding 7).
10. Both references were needed on this single run, so neither is optional. That is fine at 108 and 37 lines, but SKILL.md should say so rather than leave them as footnotes.

## Cut and add

**Cut**

- `references/writing-rules.md:18-20` — the whole `## The playback` section. It restates `SKILL.md:34-36`.
- `references/question-bank.md:91` **or** `:101-103` — one of the two copies of the shared-link-walker instruction, once the tie-break rule from finding 2 is written. Keep the limit in Guardrails and the reason in `04`.

**Add**

- A read-first line above "Two ways in": read the issue, `notes/` and `agent-memory/` with `agent-ks issue show <id>` before asking anything.
- A tie-break line under the extraction cues: a sentence that is both a limit and a ruling splits — limit to `## Guardrails`, reason to `# 04`, never the limit twice.
- The two missing verbs: `agent-ks issue set-state … input-needed --subtask <n>`, and `agent-ks check issues --template` as the closing check.
- One sentence saying what `agent-ks issue new-subtask` does and does not write, and that the section bodies are filled by editing the file.
- "When to open" on the `question-bank.md` link, matching the "Read it before the playback" that `writing-rules.md` already has.
- The target-issue step: how to find the issue the subtask belongs to, and a link to `agent-ks-issues` for the case where none exists yet.
