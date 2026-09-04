---
title: agent-ks-quick-idea-note — Opus review
---

# agent-ks-quick-idea-note

**Verdict:** needs fixes — the shape and the length are right, but the routing search misses the case the skill exists to catch, and the first-dump-issue branch breaks the tracker.

**Measured:** SKILL.md 586 words total, 525 words of body (79 lines) · references: none (single-file skill, no `references/`, `scripts/` or `assets/`)

## Findings

| # | Severity | Where | What | Why it matters | Fix |
|---|---|---|---|---|---|
| 1 | blocker | `SKILL.md:44` | Adding `issue-dump` to the vocabulary "with a comment" omits the `descriptions` entry that `fields.component` requires | The loader throws and the site refuses to build; `check issues` errors too (`astro-doc-code/src/loaders/issues.ts:737-747`, `agent-ks-cli/scripts/issues/check.mjs:543-545`). A JSONC `//` comment is not a description | Say: add the value to `fields.component.values` **and** a matching `fields.component.descriptions` entry, because a value with no description is a hard startup error. Keep the `//` comment as the extra note about the axis exception |
| 2 | major | `SKILL.md:23` | The routing search runs in excerpt mode, in the default not-Closed scope, with `--quiet-tips` | Verified on a real idea: it returned 12 excerpt lines over 5 issues (~1.2k tokens) and missed both directly relevant issues, `2026-05-07-sidebar-state-persistence` and `2026-06-10-sidebar-cache-v2`, because they are `done` and matched by path not prose. `--quiet-tips` also suppresses the "hidden closed matches" tip. The skill's one job is "does this already have a home", and it answers no when the answer is yes | Make step 2 two cheap calls: `agent-ks issue list --search "<roots>" --count --quiet-tips` for breadth, then `agent-ks issue list --path "<slug root>" --status all --quiet-tips` when the idea names a surface that plausibly exists. Say why: an already-shipped feature is the strongest "do not dump" |
| 3 | major | `SKILL.md:55` | "Write one item under `# 01 To Do`. Leave the other sections as the template writes them" never says to remove the template's `- [ ] item` / `- [ ] sub-item` placeholder | `renderTemplate` seeds only the lead paragraph (`_templates.mjs:121-135`), so the placeholder ships verbatim next to the real item, and Guardrails / Questions / Done when / 02–05 ship as instructional prose. The skill's own "a reader three months later must understand the entry" test fails | Say "replace the placeholder items under `# 01 To Do`; delete the `##` sub-heads a dump entry has nothing to say about — the issues skill's rule is drop what you do not need". Add a six-line example of the finished file |
| 4 | major | `SKILL.md:28` | The "it has a home, add it there instead" branch runs `agent-ks issue new-subtask` on a **real** issue with no pointer to the work-order standard | A subtask on a live issue is an AI handoff anchor and must pass the "a competent person with none of your context can build it" test (`agent-ks-issues/references/06_subtasks.md:59-61`). Written at dump quality it becomes a stub someone has to redo | Add the link in that row: "…as a subtask, to the `[work-order standard](../agent-ks-issues/references/06_subtasks.md)`" |
| 5 | major | `SKILL.md:32-59` | The skill assumes a dump issue whose subtasks are one-idea leaves; the tracker's only dump issue groups them as category buckets with bullet lists (`2025-06-25-future-feature-ideas/subtasks/01_content-enhancements.md` … `07_`) | Following the skill scaffolds `17_<slug>.md` — a five-section template file — beside seven bullet-list category files. The agent must guess: append a bullet, or create a leaf. The user guide backs the skill's model (`19_issues/08_workflows/01_create-an-issue.md:36-39`, "each entry a subtask"), so the disk is the outlier, but the skill still leaves the agent guessing today | Add one line to step 3: "When the dump issue's subtasks are category buckets, append under the matching `##` heading instead of scaffolding a leaf." Separately, raise the tracker's dump shape for a decision |
| 6 | minor | `SKILL.md:3` | The description competes with `agent-ks-issues`, whose description also claims "the issue dump" and "backlog", and it carries none of the phrases a user actually says | Two skills claiming one noun makes the pick a coin flip; the pushy-description advice in the guide is there exactly for this | Rewrite as below: name the spoken phrases, and hand structural tracker work to `agent-ks-issues` explicitly |
| 7 | minor | `SKILL.md:10` vs `23`, `35` | "Speed matters: one search, one file, one confirmation line" — the skill then prescribes two `issue list` calls | An agent that takes "one search" literally may skip step 3's lookup and guess the dump issue | Say "two lookups, one file, one confirmation line", or drop the count |
| 8 | minor | `SKILL.md:10` vs `44`, `58`, `78` | The dump contract is said to live in `09_operations.md`, then restated four times here (capture/promote/delete at 44, again as the To Do line at 58, again in the Never table at 78) | Breaks one-home-per-fact and pads a file whose whole selling point is speed | Keep 58 (it is literal output text) and the Never row; cut the contract restatement from 44 down to "a short `issue.md` that states the contract from the operations reference" |
| 9 | minor | `SKILL.md:10` | The reference link carries no "open it when" | The guide asks every reference link to say when to read it. The happy path never needs the file: the threshold and the graduation rule are both already inline | Reword: "Open `[the operations reference](...)` only when the user pushes back on the routing call in step 2" |
| 10 | minor | `SKILL.md:48` | Calls `--overview` "the problem statement"; the CLI help and the template both call it the lead paragraph | One name per thing — an agent matching the skill's wording against `--help` finds neither term | Use "the lead paragraph: why this exists" |

Verified as true, for the record: `issue list --search/--component/--quiet-tips/--count/--path/--status`, `issue new-subtask --name/--title/--overview`, `check issues`, the gap-spaced-by-ten prefix, the `# 01 To Do` heading, `component: ["issue-dump"]` as an array, `priority: low`, `settings.jsonc` support, and the one relative link (`agent-ks check skill-links` passes). No history, no site-absolute link, no `Grep` where a verb exists.

## Trigger test

| Prompt | Should fire | Fires |
|---|---|---|
| "quick thought before I forget — the sidebar could remember which section you had expanded. dump it somewhere, i don't want a whole issue for it" | yes | yes — "dump", "don't want a whole issue" hit "issue dump" and "Creates no issue folder" |
| "park this for later: we should let people pin an issue to the top of the tracker list. no clue which component it belongs to yet" | yes | unsure — "tracker", "issue", "component" are all trigger words in `agent-ks-issues`, and "park for later" is in neither description |
| "/agent-ks-quick-idea-note add a dark-mode toggle to the countdown layout" | yes | yes — explicit invocation |
| "add a subtask to 2026-04-19-docs-phase-2 for the release note" | no | no — "Writes one subtask" over-attracts, but "into the right dump issue" and the named issue id route it to `agent-ks-issues` |

## Proposed description

> Park a half-formed idea in an agent-knowledge-system tracker's issue dump: one subtask, no issue folder. Use it whenever the user wants a thought captured rather than worked on — "park this", "note this down for later", "add it to the backlog", "before I forget", "we should probably do X someday" — or when an idea has no home and no component named yet. For structural tracker work (creating an issue, plans, agent logs, editing an existing subtask) use agent-ks-issues instead. Invoke it with the idea as the argument.

## The dry run

Prompt: *"quick thought before I forget — the sidebar should remember which section you had expanded when you come back. no idea where that belongs, just park it."*

1. Step 1: `$ARGUMENTS` present, no question needed. Clean.
2. Step 2: ran `issue list --search "sidebar.*(expand|collaps|persist)" --quiet-tips` as written. Got 12 excerpt lines over 6 issues — a wall of incidental mentions, no clean verdict. **Lost here:** the table's "strong match" has no test.
3. Re-ran with `--count`: 5 issues, one line each. That is the shape step 2 needed.
4. Ran `--path "sidebar" --status all` out of suspicion: `2026-05-07-sidebar-state-persistence` (done) and `2026-06-10-sidebar-cache-v2` (done). **The idea is already shipped.** The skill as written would have dumped it.
5. Step 3: `--component issue-dump` → one issue. Clean, fast, exactly right.
6. Step 4: the target's seven siblings are category buckets of bullets, not template leaves. **Guessed** — the skill says scaffold, the folder says append.
7. Step 4 again: after scaffolding, `# 01 To Do` holds `- [ ] item` / `- [ ] sub-item`. **Guessed** whether to replace or append below.
8. **Did not need:** `09_operations.md`. Everything the run required was already inline.
9. **Missing:** what "strong match" means; how to handle a category-grouped dump; whether to strip the template placeholders; a worked example of the finished entry.
10. Step 5: the confirm line matched reality — the file would be `…/subtasks/17_<slug>.md`.

## Cut and add

**Cut**

- `SKILL.md:44`, the clause "The contract: capture here; promote and delete on graduation." — line 10 already sends the contract to `09_operations.md` and line 58 writes the graduation rule into the file. Third copy.
- `SKILL.md:10`, "one search" in "one search, one file, one confirmation line" — the skill prescribes two, and the count adds nothing the next four words do not.
- `SKILL.md:3`, the trailing "in a phrase or a sentence" — `argument-hint` on line 4 already carries it, and description space is the scarcest space in the skill.

**Add**

- A worked example of the finished dump entry, five or six lines, showing the lead paragraph, the single real To Do item and the deleted sub-heads. It is the one output with a shape and the skill describes it only in prose.
- A test for "strong match" in step 2, one sentence: an issue whose *title or slug* names the same surface, not an issue whose prose happens to mention it.
- The closed-scope caveat: an idea that names an existing surface gets a `--path … --status all` check first, because a shipped feature is the strongest reason not to dump.
- In step 3's create branch, a link to the settings field table (`../agent-ks-issues/references/01_anatomy.md`). The skill names only `component` and `priority`; `title` and `status` are hard errors when missing, and `labels`, `author`, `assignees` are required too.
