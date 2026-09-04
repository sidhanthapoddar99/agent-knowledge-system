---
title: agent-ks-qna — re-audit
---

# agent-ks-qna

**Verdict:** `needs fixes` — every first-round finding landed, but the fix round put three unverified command lines and a 70-word overrun into SKILL.md, and the two commands it now names do not do what it says they do.

**Measured:** SKILL.md 670 body words (frontmatter excluded, `awk 'NR>4' | wc -w`, the method that reproduces the first reviewer's 557) · references: question-bank.md 110 lines, writing-rules.md 33 lines. References inside the 150-line cap. SKILL.md is **70 words over** decision I's 600-word cap; it was 557 before the fix round.

## Closure

| First-round # | State | Note |
|---|---|---|
| 1 | closed | `SKILL.md:36` now says when to open it: "before you sort a story, and to pick the questions a round asks". |
| 2 | closed | The tie-break line is at `question-bank.md:73` with its reason, and the worked example was trimmed: the limit sits once in `## Guardrails`, decision `01` carries only the reason and points back. |
| 3 | partly | The "writes the template only, fill the rest by hand" half is closed. The command line itself is now wrong — it drops the required `<issue-id>` positional. See N1. |
| 4 | partly | A read-first step exists at `SKILL.md:28`. The command it names does not surface `notes/` or `agent-memory/`. See N2. |
| 5 | closed | `set-state` is named on row 7 in the correct argument order; `check issues --template` closes "Play back, then write". Both verbs and both behaviours verified in `check.mjs:730-734` and `set-state.mjs:20-38`. |
| 6 | closed | Row 6 now reads "bring back → `## Guardrails`; decide alone → `# 04`, as a decision with its reason". |
| 7 | closed | `## The playback` is gone from `writing-rules.md`. |
| 8 | closed | The two redirects are in the description, and the "this will run unattended" phrase was added. The proposed description was taken verbatim. |
| 9 | closed | A six-line playback skeleton is inline at `SKILL.md:42-56`. |
| 10 | closed | The Never row carries its reason: "a log holds only the run's path, and memory is dropped when the run ends". |
| 11 | closed | `05_claude-skills.md:121` now reads `SKILL.md · references/question-bank, writing-rules`. |
| add (target issue) | closed | The step exists at `SKILL.md:28` and links `agent-ks-issues` for the no-issue case. Its search form is wrong — see N3. |

No first-round fix broke a link (`agent-ks-dev check skill-links` passes, `[repo source tree]`, 61 files), lost a fact, or introduced history language. Every link is relative.

## New findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| N1 | major | `SKILL.md:58` | `agent-ks issue new-subtask --name <slug> --overview '<the why>'` omits the required `<issue-id>` positional (`new-subtask.mjs:20`, `args._[0]`). Run verbatim it prints usage and writes nothing. | This is the skill's only write command, at the end of the run, so the agent hits it with the whole scope in hand and has to recover. The sibling that owns the fact has it right: `agent-ks-issues/references/06_subtasks.md` step 3. | Write `agent-ks issue new-subtask <id> --name <slug> --overview '<the why>'`. |
| N2 | major | `SKILL.md:28` | "Read it, its `notes/` and its `agent-memory/` with `agent-ks issue show <id>`" is false. `show.mjs` contains no reference to either folder, and a run against `2026-04-19-docs-phase-2` (which has `notes/`) prints metadata, body, subtasks, comments and agent logs only. | The agent runs `show`, sees no notes, concludes there are none, and re-asks what the notes already answered — the exact failure finding 4 was meant to close. It also restates the pickup block `agent-ks-issues` owns. | Replace with a link: "Pick the issue up first — the four-step read in `[agent-ks-issues](../agent-ks-issues/SKILL.md)`. Ask only what it leaves open." That closes the false claim and the duplication in one line. |
| N3 | major | `SKILL.md:28` | `--search '<words the user used>'` is a free-text **regex**, so a dictated phrase must match contiguously. Verified: `--search 'sidebar collapse subtasks'` → 0 issues; `--search 'collapse'` → 5 active issues. | The next sentence says "When none fits, the thought needs an issue first". A zero-result phrase search therefore sends the agent to create a duplicate issue for work that is already tracked. | "Find the issue with `agent-ks issue list --search '<one distinctive word>'`, or an alternation: `--search 'sidebar\|collapse'`." |
| N4 | major | `SKILL.md` (whole) | Body is 670 words against decision I's 600-word cap. The skill has references, so the single-file exemption does not apply. | The cap exists because SKILL.md loads on every trigger. The fix round added 113 words and nobody re-measured. | Cut ~70. Three candidates, in order: fold `## Before you ask` (40 w) into the one-line link of N2; merge the two "Read \<reference\>" sentences at `:36` into one; trim the two mode paragraphs at `:32-34`, which restate the extraction rule `question-bank.md:59-73` owns. |
| N5 | major | `SKILL.md:58` | "Finish with `agent-ks check issues --template`" is unscoped. On this tracker it emits **424** warning lines; without `--template` it emits 1. The verb has no scope flag — only `--tracker`. | The check the skill mandates as its closing gate cannot tell the agent whether the file it just wrote passed, without reading 424 lines of other issues' pre-existing debt. | Add the scoping sentence: "The tracker carries unrelated warnings; read only the lines naming the file you wrote." A `--scope` flag on `check issues`, matching `issue list --scope`, is the durable fix and belongs to the CLI. |
| N6 | minor | `SKILL.md:22`, `references/writing-rules.md:18-29` | Row 7 gives only `set-state <id> input-needed --subtask <n>`. `resolveSubtaskSelector` (`_lib.mjs:224-240`) reads `subtasks/` only, so `--subtask` cannot address a plan stage — yet the description and `writing-rules.md` both cover a stage. | Half the skill's declared surface has no working status command. `set-state` refuses to fall through, so nothing wrong gets written, but the agent is left guessing. | Add the path form beside it: `agent-ks issue set-state <id>/plans/<plan>/NN_<stage>.md input-needed`. Verified: the `target.includes('/')` branch handles it. |
| N7 | minor | `SKILL.md:55` | Inside an otherwise all-placeholder skeleton (`<the why>`, `<the work>`, `<the limit>`), the decision line is concrete: `Decided (sid, 2026-09-04)`. | The skeleton is what the agent copies. A copied `sid` attributes a ruling to the wrong author; a copied date is wrong from tomorrow. The templates themselves use `YYYY-MM-DD`. | `- Decided (<author>, <today>): <what>, because <why>.` The concrete date stays right in the worked example, which is not a skeleton. |
| N8 | minor | `references/question-bank.md:79-100` | The worked example dictates moving the link checker into the plugin as pending work. It shipped: `agent-ks check link-form` exists, and the example's target path `scripts/check-link-form.mjs` is not where it lives (`skills/agent-ks-cli/scripts/check-link-form.mjs`). | It reads as a live job that is already done, which is the shape the history-free house rule exists to keep out, and an agent may take the path as real. | Keep the sentence shapes; change the subject to a job this repo has not done, or drop the path from the to-do line. |

`unsure` on nothing. What would settle N5 differently: a `--scope` flag landing on `check issues`, at which point the skill names it instead.

## The dry run, second time

Same dictated brief: the sidebar-collapse subtask, guardrails on the issues index page and the existing component, a "not sure" on expand-state persistence, CSS the agent's call.

**Better, in order.** (1) The seven-homes table now answers row 6 outright — "bring back → Guardrails, decide alone → 04" — so "all the CSS is your call" landed in one move. (2) `SKILL.md:36` told me to open `question-bank.md` before sorting, so I opened it on instruction rather than on need. (3) The tie-break at `:73` resolved "use the existing component, don't fork it — we had two sidebars once": limit to Guardrails, reason to `04`, written once. Last time I duplicated it. This is the clearest win. (4) The inline skeleton meant I never reopened a reference to learn the playback shape. (5) Row 7 handed me `set-state`, so the `input-needed` status the run needed was one command, not a guess.

**Still wrong.** (6) Step one failed: `issue list --search` on the user's phrase returned nothing, and the skill's next clause told me to open a new issue — the target issue exists (N3). (7) `issue show` gave me no `notes/` and no `agent-memory/`, so the read-first rule ran but read nothing (N2). (8) "collapsed by default with the done/total count on the row, click expands" is one sentence carrying both the work and the acceptance test. The cue table sends "I want to see" to 2 and "names a component" to 3, and the new tie-break covers only limit-versus-ruling — so the commonest sentence in a dictated UI brief still has no rule. Fold this into the N-list as a one-line sibling of `:73`: *a sentence that is both the work and its test splits — the change goes to `01`, the observable to `Done when`.* (9) The write command failed on the missing issue id (N1). (10) The closing check returned 424 warnings and I could not see my own file in them (N5).
