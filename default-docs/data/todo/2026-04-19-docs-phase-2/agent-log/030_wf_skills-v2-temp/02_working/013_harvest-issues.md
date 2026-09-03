---
title: "Harvest issues"
status: done
agent: claude
---

# Goal

Builder report: harvest-issues

# Inputs

- [the skills-v2 spec](../../notes/skills-v2-spec.md)

# Expected Outcome

The change, and what it touched.

# Outcome

The issues builder wrote `SKILL.md` and ten reference files under `plugins/agent-ks-temp/skills/agent-ks-issues/`. Every rule in the 22 old files has a row in the harvest table below. The eight status names and the five run statuses were checked against `astro-doc-code/src/loaders/issue-status.ts` (`STATUSES` and `RUN_STATUSES`). They match the spec and the new files.

## Files

| File | Lines | Words (`wc -w`) | Limit |
|---|---|---|---|
| `SKILL.md` | 82 | 696 (544 without table pipes) | 600 words |
| `references/01_anatomy.md` | 134 | 1310 | 150 lines, 1500 words |
| `references/02_lifecycle.md` | 68 | 856 | same |
| `references/03_writing.md` | 78 | 911 | same |
| `references/04_issue-comments-glossary.md` | 98 | 641 | same |
| `references/05_brainstorm-notes-memory.md` | 110 | 1066 | same |
| `references/06_subtasks.md` | 85 | 904 | same |
| `references/07_plans.md` | 129 | 1177 | same |
| `references/08_agent-logs.md` | 129 | 1399 | same |
| `references/09_operations.md` | 140 | 1336 | same |
| `references/10_examples.md` | 110 | 738 | same |

`SKILL.md` holds five mandated tables (duties, boundaries, status, never, triage). `wc -w` counts each `|` as a word. There are 152 pipes. The prose count is 544. See open question 1.

## Harvest table

Old paths are relative to `plugins/agent-ks/skills/agent-ks-issues/references/`. `SKILL.md` alone means the old skill file. New homes are relative to `plugins/agent-ks-temp/skills/agent-ks-issues/references/`; `SKILL.md` alone means the new skill file.

| Rule (one line) | Old file | New home | Status |
|---|---|---|---|
| Default tracker is `data/todo/`; several trackers share one shape | `SKILL.md:8-10` | `SKILL.md#intro` | kept |
| The user-guide under `@root/default-docs/...` is the canonical source; it wins over the skill | `SKILL.md:12-14`, `00_anatomy/00_overview.md:8-10,161-166` | — | dropped: the path is framework-repo-internal and absent in a consumer project; the spec makes the skill the one home |
| Sibling skills own mechanics, images, the CLI reference and artifacts; hand off when work leaves the tracker | `SKILL.md:16-24` | `SKILL.md#links`, `03_writing.md#intro` | kept |
| The tracker is memory of thought-work; an issue is one unit of thinking plus execution | `SKILL.md:28-30` | `01_anatomy.md#glossary` | merged |
| The one rule: no file stores a fact another file owns | `SKILL.md:34-37` | `SKILL.md#the-one-rule` | kept |
| Section table: what each section is for | `SKILL.md:39-49` | `SKILL.md#sections-and-duties` | merged with spec section 7 |
| Routing test: one purpose per sentence; two means split | `SKILL.md:51-52` | `SKILL.md#the-one-rule` | merged |
| Each section page opens with a Holds / Does not hold table | `SKILL.md:54-55` | `04`–`08`, first table of each | kept |
| The four boundaries | `SKILL.md:57-64` | `SKILL.md#the-four-boundaries` | kept |
| Superseded wording is deleted, never kept; delete historical asides when found | `SKILL.md:66-72` | `SKILL.md#never` row 5 | merged |
| Litmus test: name the component and the first subtask | `SKILL.md:78-79`, `40_operations/42_updating.md:12` | `09_operations.md#the-creation-threshold` | kept |
| Routes for a thought that fails the test: subtask, brainstorm entry, dump entry | `SKILL.md:81-87` | `09_operations.md#the-creation-threshold` | kept |
| No record for small work; group small changes | `SKILL.md:88-89` | `09_operations.md#the-creation-threshold` | kept |
| A subtask is a self-sufficient work order; fresh-session test | `SKILL.md:91-94` | `06_subtasks.md#write-a-work-order` | kept |
| Subtasks are filed by category, never by order | `SKILL.md:96-97` | `06_subtasks.md#category-not-order` | kept |
| Comment tripwire: two lines and a pointer | `SKILL.md:99-100` | `04_issue-comments-glossary.md#comments` | kept |
| Graduation marker; shipped issue stays; pure deliberation folds and is deleted | `SKILL.md:102-105` | `05_brainstorm-notes-memory.md#graduation`, `09_operations.md#the-creation-threshold` | kept |
| Eight statuses in four categories, fixed in code, colours included | `SKILL.md:109-118` | `SKILL.md#status`, `02_lifecycle.md#the-eight-statuses` | kept |
| Runs use five statuses | `SKILL.md:120-121` | `02_lifecycle.md#runs-use-five-statuses` | kept |
| Your ceiling on an issue or subtask is review, input-needed, or superseded with its arrow | `SKILL.md:123-127` | `SKILL.md#never` row 3, `02_lifecycle.md#closing-authority` | kept |
| Plan shape; stage references subtasks and never restates; active plan is derived | `SKILL.md:131-135` | `07_plans.md#shape`, `07_plans.md#the-active-plan` | kept |
| A log exists so a finding can be withdrawn | `SKILL.md:137-139` | `08_agent-logs.md#intro` | kept |
| TRIGGER, FLOOR, ask once, never file count or time, append to an open run | `SKILL.md:141-149` | `08_agent-logs.md#when-to-open-a-log`, `SKILL.md#never` row 10 | merged: the work-type table replaces trigger and floor (spec section 10) |
| Read the agent log and `memory.md` before starting | `SKILL.md:155` | `08_agent-logs.md#intro` | kept |
| `01_summary.md` is the brief; never a separate brief file | `SKILL.md:156-157` | `08_agent-logs.md#the-summary` | kept |
| Own goal → child log; no own goal → iteration file; nesting stops at two | `SKILL.md:158-159` | `08_agent-logs.md#the-shape` | merged: spec section 8 removes child logs; a workflow gets a sibling log |
| Write durable output when produced; routing table by scope | `SKILL.md:161-171` | `08_agent-logs.md#where-output-goes` | merged: the debrief row maps to the summary's 05 |
| Agent memory is always on; index stores nothing; no plan or decisions | `SKILL.md:173-176` | `05_brainstorm-notes-memory.md#agent-memory` | kept |
| Discussion is explicit-save-only; offer when decision-bearing | `SKILL.md:178-179` | `05_brainstorm-notes-memory.md#naming`, `SKILL.md#never` row 9 | kept |
| Triage table | `SKILL.md:181-202` | `SKILL.md#triage` | kept, rewritten for ten files |
| CLI groups: read, write, scaffold; check issues, find, move; discover with help | `SKILL.md:204-216` | `09_operations.md#intro` | merged: the command table is a link to `cli-toolkit.md` (spec section 10) |
| An unrecognised flag is ignored in silence | `SKILL.md:216-217` | `09_operations.md#intro` | kept |
| Search with `issue list` or `find`, never Grep; default scope hides Closed | `SKILL.md:219-223` | `09_operations.md#search`, `SKILL.md#never` row 6 | kept |
| Inside a git worktree the `.env` search stops at the worktree root | `SKILL.md:225-226` | `09_operations.md#intro` | kept |
| Two slash commands and one agent belong to the tracker | `SKILL.md:228-234` | `09_operations.md#the-dump`, `08_agent-logs.md#the-summary` | merged: links to the command skills |
| Ordering prefix grammar; mandatory in four sections; prefix owns the number | `SKILL.md:238-241` | `03_writing.md#ordering-prefixes`, `03_writing.md#frontmatter-rules` | kept |
| Reference by link, never by number or path; no leading slash; ordering label | `SKILL.md:242-244` | `03_writing.md#links--the-tracker-deltas`, `SKILL.md#never` row 8 | kept |
| `title` on every markdown file; missing ships the slug | `SKILL.md:245-246` | `03_writing.md#frontmatter-rules` | kept |
| `settings.json` may be `.jsonc`; prefer it for the root | `SKILL.md:247-248` | `01_anatomy.md#tracker-vocabulary` | kept |
| Edit, do not rewrite; append-only comments and logs; preserve `color`; check the glossary | `SKILL.md:249-251` | `04#comments`, `08#boundaries`, `03#frontmatter-rules` | kept |
| One component per issue | `00_anatomy/00_overview.md:13-14` | `02_lifecycle.md#best-practice-rules` | kept |
| AI-handoff issues declare at least one subtask | `00_overview.md:15` | `02_lifecycle.md#best-practice-rules` | kept |
| Ordering priority desc then updated desc; dates derived; execution state by status | `00_overview.md:16-18` | `02_lifecycle.md#best-practice-rules`, `01_anatomy.md#per-issue-settings` | kept |
| Status fixed in code; colours are CSS variables; `fields.status` and `statusColors` are errors | `00_overview.md:24-27` | `01_anatomy.md#tracker-vocabulary`, `02_lifecycle.md#intro` | kept |
| Status table with meanings | `00_overview.md:29-34` | `02_lifecycle.md#the-eight-statuses` | kept |
| Transitions unenforced; category filters, status is the badge | `00_overview.md:36-37` | `02_lifecycle.md#the-eight-statuses` | kept |
| `superseded` semantics; arrow line; validator warns; both arrows; issue.md or comment | `00_overview.md:39-58` | `02_lifecycle.md#superseded-names-where-the-scope-went` | kept |
| Runs use five, and why | `00_overview.md:60-66` | `02_lifecycle.md#runs-use-five-statuses` | kept |
| Closing authority table; superseded exception; never self-certify via the log | `00_overview.md:68-88` | `02_lifecycle.md#closing-authority` | kept |
| A log's status answers "did the agent finish"; dropped needs no comment | `00_overview.md:90-94` | `02_lifecycle.md#closing-authority`, `08_agent-logs.md#run-status` | kept |
| AI rules 1 to 6 | `00_overview.md:96-123` | `02_lifecycle.md#ai-rules` | kept |
| Reference index | `00_overview.md:127-159` | `SKILL.md#triage` | merged |
| The tree | `00_anatomy/01_folder-layout.md:5-49` | `01_anatomy.md#the-tree` | kept, rewritten for the flat log shape |
| Memory buckets are lifecycle; grow into them | `01_folder-layout.md:51-53` | `05_brainstorm-notes-memory.md#shape` | kept |
| Prefix below 100 is a slot; 100 and above is a child log | `01_folder-layout.md:55-59`, `20_sections/24_agent-logs.md:222-237` | — | dropped: spec section 8 removes slots and child logs |
| Issue folder naming regex | `01_folder-layout.md:61` | `01_anatomy.md#the-tree` | kept |
| Stray root-level markdown is a warning; report it | `01_folder-layout.md:63` | `01_anatomy.md#the-tree` | kept |
| Five levels of nesting; deeper is warned and skipped; three is the convention | `01_folder-layout.md:67` | `01_anatomy.md#folder-rules` | kept |
| Files and folders mix at every level except the deepest | `01_folder-layout.md:68` | `01_anatomy.md#folder-rules` | kept |
| `comments/` stays flat | `01_folder-layout.md:69` | `01_anatomy.md#folder-rules`, `04#comments` | kept |
| Sidebar counts: done/total for subtask groups; descendant count elsewhere | `01_folder-layout.md:70-71` | `01_anatomy.md#folder-rules` | kept |
| URL shapes table; stage redirects to the plan anchor | `01_folder-layout.md:75-81` | `01_anatomy.md#url-shapes` | kept |
| The ordering prefix is stripped from tracker URLs | `01_folder-layout.md:83` | — | dropped: wrong. `issues.ts` builds the slug with only `.md` removed; `internal-links.ts` strips prefixes for docs only. `03_writing.md#links` states the opposite, which the code confirms |
| Per-issue `settings.json` example and field table | `00_anatomy/02_per-issue-settings.md:5-29` | `01_anatomy.md#per-issue-settings` | kept |
| Dates are derived; never write `updated` | `02_per-issue-settings.md:33` | `01_anatomy.md#per-issue-settings` | kept |
| Missing `labels`/`assignees` read as empty; missing `component` is a finding | `02_per-issue-settings.md:35` | `01_anatomy.md#per-issue-settings` | kept |
| `assignees` is who holds the work, not a status; two-tier filter | `02_per-issue-settings.md:37-45` | `01_anatomy.md#per-issue-settings` | kept |
| Filters compose AND across fields, OR within a field | `02_per-issue-settings.md:47` | — | dropped: UI filter composition, not an authoring rule; the CLI reference owns flag semantics |
| Root settings shape: label, fields, authors, views | `00_anatomy/03_overall-issue-tracker-vocabulary.md:5-21` | `01_anatomy.md#tracker-vocabulary` | kept |
| Every enum value comes from the vocabulary; add the value and its description first | `03_overall-issue-tracker-vocabulary.md:23` | `01_anatomy.md#tracker-vocabulary` | kept |
| Status is not configurable; unknown status is a hard error | `03_overall-issue-tracker-vocabulary.md:25-31` | `01_anatomy.md#tracker-vocabulary` | kept |
| Restyle statuses with one CSS variable each; light and dark may differ; eight tokens | `03_overall-issue-tracker-vocabulary.md:33-42` | `01_anatomy.md#tracker-vocabulary` | merged: token names derive from the status names |
| `statusColors` or `fields.status` fails the build; the migration chain removes them | `03_overall-issue-tracker-vocabulary.md:44` | `01_anatomy.md#tracker-vocabulary` | kept |
| `.jsonc` allowed anywhere; both readers accept it; `.jsonc` wins | `03_overall-issue-tracker-vocabulary.md:48` | `01_anatomy.md#tracker-vocabulary` | kept |
| Descriptions required per component and label; hard error; render in the Guide modal; component is a stack layer, one per issue | `03_overall-issue-tracker-vocabulary.md:50-73` | `01_anatomy.md#tracker-vocabulary` | kept |
| Keep descriptions accurate; backfill with the migration chain | `03_overall-issue-tracker-vocabulary.md:75` | `01_anatomy.md#tracker-vocabulary` | kept |
| Four vocabulary layers | `03_overall-issue-tracker-vocabulary.md:77-84` | `02_lifecycle.md#intro` | merged |
| Add no scheduling, release-bucket or single-type fields | `03_overall-issue-tracker-vocabulary.md:86-90` | `01_anatomy.md#tracker-vocabulary` | kept |
| Execution state is a status; order is a plan | `03_overall-issue-tracker-vocabulary.md:92-94` | `02_lifecycle.md#best-practice-rules` | kept |
| Mechanics and the link rule live in the docs skill; this page adds deltas | `10_writing/10_writing.md:3-7` | `03_writing.md#intro` | kept |
| `title` required by convention; nothing enforces it | `10_writing.md:11-13` | `03_writing.md#frontmatter-rules` | kept |
| Frontmatter per sub-doc type | `10_writing.md:15-23` | `03_writing.md#the-one-body-template` | merged with spec section 6 |
| `draft: true` hides a file | `10_writing.md:25` | `03_writing.md#the-one-body-template` | kept |
| Preserve `color`; check the glossary | `10_writing.md:26-27` | `03_writing.md#frontmatter-rules` | kept |
| No MDX | `10_writing.md:28` | `03_writing.md#frontmatter-rules` | kept |
| Write for cold pickup: bold lead, `##` groups, link pointers | `10_writing.md:32-37` | `03_writing.md#write-for-cold-pickup` | kept |
| Iteration file four-section head | `10_writing.md:38-40` | `03_writing.md#the-one-body-template` | merged: a round uses the five-section template (spec section 6) |
| Comments: two lines plus a pointer | `10_writing.md:41-42` | `04_issue-comments-glossary.md#comments` | kept |
| Decision markers and graduation markers | `10_writing.md:43-45` | `03_writing.md#links--the-tracker-deltas` | kept |
| Reference by link, never by number; example | `10_writing.md:49-65` | `03_writing.md#links--the-tracker-deltas` | kept |
| A tracker URL keeps its prefixes; links leaving the tracker need care | `10_writing.md:69-72` | `03_writing.md#links--the-tracker-deltas` | kept |
| `Related:` lines for soft references | `10_writing.md:73-74` | `03_writing.md#links--the-tracker-deltas` | kept |
| A non-markdown sub-doc gets a type glyph; never hand-label the type | `10_writing.md:75-77` | `03_writing.md#diagrams-and-artifacts-as-sub-docs` | kept |
| Diagram fences render; embed from `assets/`; any subfolder may hold `assets/` | `10_writing.md:81-85` | `03_writing.md#diagrams-and-artifacts-as-sub-docs`, `01_anatomy.md#folder-rules` | kept |
| A diagram file is a first-class doc in four sections; subtasks stay markdown | `10_writing.md:87-92` | `03_writing.md#diagrams-and-artifacts-as-sub-docs` | kept |
| An `.html` artifact lives in notes or brainstorm; built by the artifacts skill; promote when settled | `10_writing.md:94-98` | `03_writing.md#diagrams-and-artifacts-as-sub-docs`, `05#artifacts-and-diagrams` | kept |
| Live demo of embeds at a tracker path | `10_writing.md:100` | — | dropped: a path in the framework's own tracker, absent in a consumer project |
| Ordering prefix conventions per section | `10_writing.md:104-115` | `03_writing.md#ordering-prefixes` | kept, rewritten for flat logs |
| Read `issue.md` first | `20_sections/20_issue-md.md:3` | `04_issue-comments-glossary.md#issuemd` | kept |
| `issue.md` holds the why; 50 to 300 lines | `20_issue-md.md:5` | `04_issue-comments-glossary.md#issuemd` | kept |
| Shape: Goal, Context, Done when, Scope decisions; display title from settings | `20_issue-md.md:7-27` | `04_issue-comments-glossary.md#issuemd` | kept |
| `issue.md` versus a note | `20_issue-md.md:29-32` | `04_issue-comments-glossary.md#issuemd` | kept |
| Past 300 lines, move deep-dives to notes with a pointer | `20_issue-md.md:34` | `04_issue-comments-glossary.md#issuemd` | kept |
| Comments Holds / Does not hold | `20_sections/21_comments.md:5-9` | `04_issue-comments-glossary.md#comments` | kept |
| Append-only; flat; `NNN_` is the id | `21_comments.md:11-13` | `04_issue-comments-glossary.md#comments` | kept |
| The tripwire | `21_comments.md:15-18` | `04_issue-comments-glossary.md#comments` | kept |
| Shape: `author` and `date` | `21_comments.md:22-31` | `04_issue-comments-glossary.md#comments` | kept |
| Naming: slug or date-author; match the issue; CLI numbers | `21_comments.md:33` | `04_issue-comments-glossary.md#comments` | kept |
| `add-comment`; direct write steps | `21_comments.md:35-49` | `04_issue-comments-glossary.md#comments` | kept |
| A dropped issue needs a comment first | `21_comments.md:51` | `04#comments`, `02_lifecycle.md#ai-rules` | kept |
| Comments versus working dialogue; six-weeks test | `21_comments.md:53-60` | `04_issue-comments-glossary.md#comments` | kept |
| Do not rewrite; do not change another author's fields | `21_comments.md:62-65` | `04#comments`, `09_operations.md#do-not-edit` | kept |
| Notes Holds / Does not hold | `20_sections/22_notes.md:7-12` | `05_brainstorm-notes-memory.md#notes` | kept |
| The note test | `22_notes.md:14-15` | `05_brainstorm-notes-memory.md#notes` | kept |
| A note that reads like a work order is a subtask | `22_notes.md:17-19` | `05#notes`, `SKILL.md#the-four-boundaries` | kept |
| Content arrives by graduation, fully formed, or from a run | `22_notes.md:21-24` | `05_brainstorm-notes-memory.md#notes` | kept |
| A note is stable; demote one that keeps changing | `22_notes.md:26-27` | `05_brainstorm-notes-memory.md#notes` | kept |
| Shape: `title`, optional `color`; preserve it | `22_notes.md:29-42` | `05_brainstorm-notes-memory.md#notes` | merged with the template (sections 03, 04, 05) |
| Artifacts render embedded: iframe, open-full-page, expand, theme; diagrams too | `22_notes.md:46` | `05_brainstorm-notes-memory.md#artifacts-and-diagrams` | kept |
| Title from a `.meta.json` sidecar; nothing injected | `22_notes.md:48` | `05_brainstorm-notes-memory.md#artifacts-and-diagrams` | kept |
| Scope: notes and brainstorm only | `22_notes.md:49` | `05_brainstorm-notes-memory.md#artifacts-and-diagrams` | kept |
| No prefix required; joins updated derivation and caching | `22_notes.md:50` | `05_brainstorm-notes-memory.md#artifacts-and-diagrams` | kept |
| Self-contained; unsandboxed; never untrusted HTML | `22_notes.md:51` | `05_brainstorm-notes-memory.md#artifacts-and-diagrams` | kept |
| Numbering optional; gap-number when order matters | `22_notes.md:53-58` | `05_brainstorm-notes-memory.md#notes` | kept |
| Subfolders; five cap; three convention; split past three | `22_notes.md:60-62` | `05#notes`, `01_anatomy.md#folder-rules` | kept |
| Add a note: placement, name, frontmatter | `22_notes.md:64-71` | `05_brainstorm-notes-memory.md#notes` | merged into the placement table |
| Move notes link-aware | `22_notes.md:73` | `09_operations.md#move-and-restructure` | kept |
| Subtask is the atomic unit and handoff anchor; groups are labels | `20_sections/23_subtasks.md:3-5` | `06_subtasks.md#intro` | kept |
| Subtask Holds / Does not hold | `23_subtasks.md:7-12` | `06_subtasks.md#intro` | kept |
| Subtask defines, log carries out; single-subtask-log exception | `23_subtasks.md:14-18` | `06_subtasks.md#intro` | kept |
| Category, not order; number is id and sort key | `23_subtasks.md:20-33` | `06_subtasks.md#category-not-order` | kept |
| Grouping test: area, one level, three leaves, noun without phase or step | `23_subtasks.md:36-38` | `06_subtasks.md#category-not-order` | kept |
| The failure this prevents: reading order as execution order, dated path example | `23_subtasks.md:40-44` | — | dropped: argument paragraph (spec principle 4); the grouping test holds the rule |
| Shape: `title` and `status`; canonical eight | `23_subtasks.md:48-60` | `06_subtasks.md#shape` | kept |
| A group folder has no body file | `23_subtasks.md:62-63` | `06_subtasks.md#shape` | kept |
| Five-level cap with a console warning; one level convention | `23_subtasks.md:65-71` | `06#shape`, `01_anatomy.md#folder-rules` | kept |
| Folders sort interleaved; done/total; review dot | `23_subtasks.md:73-77` | `06_subtasks.md#shape` | kept |
| Optional folder `settings.json` title | `23_subtasks.md:79-80` | `06_subtasks.md#shape` | kept |
| Index leaf: `00_` prefix, six or more leaves, `--index`, four sections, derived status, validator warns | `23_subtasks.md:82-102` | `06_subtasks.md#the-index-leaf` | kept; the four sections map onto the template |
| Numbering widths; gap 10 or 5; separator | `23_subtasks.md:104-119` | `06_subtasks.md#numbering` | kept |
| The work-order test | `23_subtasks.md:123-125` | `06_subtasks.md#write-a-work-order` | kept |
| Five-section template Overview / References / Todo / Outcomes / Details | `23_subtasks.md:127-146` | `06_subtasks.md#write-a-work-order` | merged: each old section maps to a spec section 6 section |
| References: a spec in a conversation is unscoped | `23_subtasks.md:148-149` | `06_subtasks.md#write-a-work-order` | kept |
| Todo: concrete deliverables; fold in Done when | `23_subtasks.md:150-152` | `06_subtasks.md#write-a-work-order` | kept |
| Outcomes filled before review; template lint flags the placeholder | `23_subtasks.md:153-155` | `06_subtasks.md#write-a-work-order` | kept (`--template`) |
| Details: the spec inline; shared material in notes | `23_subtasks.md:156-158` | `06_subtasks.md#write-a-work-order` | kept |
| Formatting: bold lead, `##` groups, spelled-out pointers, decision markers | `23_subtasks.md:160-168` | `03_writing.md#write-for-cold-pickup`, `03#links` | kept |
| Create a subtask steps | `23_subtasks.md:170-179` | `06_subtasks.md#create-a-subtask` | kept; the CLI scaffolds the file |
| Update status commands | `23_subtasks.md:183-186` | `06_subtasks.md#update-a-status` | kept |
| AI rule on a subtask: in-progress, review, input-needed, superseded with arrow | `23_subtasks.md:188-193` | `06_subtasks.md#update-a-status` | kept |
| Rapid mechanical changes: one running checklist or one `it` log | `23_subtasks.md:195-200` | `06_subtasks.md#rapid-mechanical-changes` | kept |
| One purpose in two halves; the log is your workspace | `20_sections/24_agent-logs.md:4-6` | `08_agent-logs.md#intro` | merged |
| Read the log before starting | `24_agent-logs.md:8-9` | `08_agent-logs.md#intro` | kept |
| Log Holds / Does not hold | `24_agent-logs.md:11-19` | `08_agent-logs.md#intro` | kept |
| The log carries execution, not scope | `24_agent-logs.md:21-22` | `SKILL.md#the-four-boundaries` | kept |
| A log exists so a finding can be withdrawn | `24_agent-logs.md:26-28` | `08_agent-logs.md#intro` | kept |
| TRIGGER 1–3, FLOOR 1–2, floor beats 1–2, neither fires → ask once | `24_agent-logs.md:30-51` | `08_agent-logs.md#when-to-open-a-log` | merged: replaced by the work-type table (spec section 10) |
| Executing a plan earns a log; open before the first stage | `24_agent-logs.md:53-57` | `08_agent-logs.md#when-to-open-a-log` | kept |
| Delete an unearned log before commit | `24_agent-logs.md:59-63` | `08_agent-logs.md#when-to-open-a-log` | kept |
| Where the record goes: append, subtask outcomes, open one now | `24_agent-logs.md:65-74` | `SKILL.md#never` row 10, work-type table last row | merged |
| Limits: stages ≥ 2, discarded ≥ 1, delegation, user asked, never file count, never time | `24_agent-logs.md:76-89` | `08_agent-logs.md#when-to-open-a-log` | merged: the two prohibitions kept; counts replaced by the work-type table |
| Where scale counts | `24_agent-logs.md:91-95` | — | dropped: argument that reconciles two rules; the table decides |
| A verify is not a stage; an audit is | `24_agent-logs.md:97-105` | `08_agent-logs.md#when-to-open-a-log` | kept |
| Fourteen worked cases | `24_agent-logs.md:107-128` | `08_agent-logs.md#when-to-open-a-log` | merged: replaced by the work-type table (spec section 10) |
| Weight up anything that changes a rule or skill | `24_agent-logs.md:130-133` | `08_agent-logs.md#when-to-open-a-log` | kept |
| When unsure, ask once per session; three situations | `24_agent-logs.md:135-141` | — | dropped: the table decides by work type; no judgement call remains |
| Never make the log decision a validator error | `24_agent-logs.md:143-145` | — | dropped: no judgement rule remains to gate |
| Reach for an audit when you cannot predict the answer | `24_agent-logs.md:147-149` | `08_agent-logs.md#when-to-open-a-log` | merged |
| A plan maps to logs by milestone; main log plus child logs; work outside the plan gets its own log | `24_agent-logs.md:151-180` | `08_agent-logs.md#when-to-open-a-log` | merged: "one log per one to three stages"; no child logs |
| Where an audit goes, by size | `24_agent-logs.md:182-191` | `08_agent-logs.md#when-to-open-a-log` | merged: "Audit or review: one log" |
| Vocabulary table | `24_agent-logs.md:193-203` | `01_anatomy.md#glossary` | merged: child log, milestone, slot, iteration file and producer file dropped; round and report added |
| The shape with `02_working/`, `00_index.md`, `03_debrief/`, child logs | `24_agent-logs.md:205-220` | `08_agent-logs.md#the-shape` | merged: the flat shape from spec section 8 |
| Kind codes; custom via `agentLogKinds` | `24_agent-logs.md:239-240` | `08_agent-logs.md#the-shape` | kept |
| Iteration file or child log: own goal | `24_agent-logs.md:242-249` | `08_agent-logs.md#the-shape` | merged: a workflow with its own goal gets a sibling log |
| A plan stage is not a run; the stage survives as a label | `24_agent-logs.md:251-255` | `07_plans.md#intro`, `10_examples.md#a-loop-issue` | merged |
| Nesting mirrors a structure, never invents one | `24_agent-logs.md:257-258` | — | dropped: no nesting in the new shape |
| Depth budget; a third child log is an error; go beside | `24_agent-logs.md:260-278` | — | dropped: no child logs; the five-level loader cap stays in `01_anatomy.md#folder-rules` |
| Summary: five sections State / Goal / Todo / Out of Scope / Outcome | `24_agent-logs.md:282-313` | `08_agent-logs.md#the-summary` | merged: rewritten onto the spec section 6 template |
| State first, as a callout; the callout type carries meaning | `24_agent-logs.md:315-318` | `08_agent-logs.md#the-summary`, `08#run-status` | merged: `02` is the live section; the callout stays for a dropped round |
| Todo items are links with a line of what they did; `[~]` for reopened | `24_agent-logs.md:320-335` | `08_agent-logs.md#the-summary` | kept |
| The summary is the brief; standing rules from memory; never a separate brief | `24_agent-logs.md:337-339` | `08_agent-logs.md#the-summary` | kept |
| No `# Notes` section in the summary | `24_agent-logs.md:341-342` | — | dropped: spec section 6 gives every summary `05 Notes & Analysis` |
| Outcome is detailed; point at detail rather than copying | `24_agent-logs.md:344-346` | `08_agent-logs.md#the-summary` | merged |
| The todo list is run-local and disposable | `24_agent-logs.md:348-349` | `08_agent-logs.md#the-summary` | kept |
| `00_index.md` written by hand; one entry per round with what it found; no bare number | `24_agent-logs.md:355-377` | `08_agent-logs.md#the-shape`, `08#the-summary` | merged: the summary's `03` lists every round with one line (spec section 8) |
| Keeping an index honest: the index-check command, two directions, four labels, by-hand table | `24_agent-logs.md:379-439` | `../agent-ks-index-check/SKILL.md` (root builder), linked from `08#the-summary` | merged: moved per spec section 10 (root) |
| One iteration one file; producer files; file count follows what was produced | `24_agent-logs.md:441-455` | `08_agent-logs.md#rounds-and-reports` | kept as round and report |
| `NNN_` numbering: iteration then file digit | `24_agent-logs.md:457-472` | `08_agent-logs.md#the-shape` | merged: rounds by ten, reports `N1`–`N9` (spec section 8) |
| `02_working/` is flat; a folder only for one producer with several artifacts | `24_agent-logs.md:474-481` | — | dropped: the spec shape is flat files only; a report is one file |
| Iteration head: Goal / Inputs / Expected Outcome / Outcome; orchestrator writes the head | `24_agent-logs.md:483-516` | `08_agent-logs.md#rounds-and-reports` | merged: template sections; orchestrator writes the opening and `01`, the agent writes `02`, `03` names inputs |
| Round status means "did the agent finish" | `24_agent-logs.md:518-530` | `08_agent-logs.md#run-status` | kept |
| The status tints the prefix number; untinted means "said nothing" | `24_agent-logs.md:532-536` | — | dropped: renderer behaviour, not an authoring rule |
| A dropped round carries two signals; validator warns | `24_agent-logs.md:538-565` | `08_agent-logs.md#run-status` | kept |
| Expected outcome per work unit | `24_agent-logs.md:567-581` | `08_agent-logs.md#when-to-open-a-log` | merged: audit, research and benchmark shapes sit in the work-type and case tables |
| Body thin but complete; findings one line plus a pointer | `24_agent-logs.md:583-592` | `08_agent-logs.md#size-limits`, `03#write-for-cold-pickup` | kept |
| Debrief contents; written during the run; exists only when something leaves | `24_agent-logs.md:596-621` | `08_agent-logs.md#the-shape`, `08#where-output-goes` | merged: handover and lessons go in the summary's `02` and `05` |
| The summary should always be there; validator warns | `24_agent-logs.md:623-626` | `08_agent-logs.md#the-shape` | merged: the shape lists it; the scaffolder writes it |
| Anything actionable leaves the log as a subtask or dump entry | `24_agent-logs.md:628-629` | `08_agent-logs.md#the-shape`, `08#where-output-goes` | kept |
| Debrief versus notes: audience | `24_agent-logs.md:631-636` | `08_agent-logs.md#where-output-goes` | kept |
| An audit report is a file beside the round | `24_agent-logs.md:642-645` | `08_agent-logs.md#rounds-and-reports` | kept |
| A pair is two files; union, not a vote | `24_agent-logs.md:647-650` | `08_agent-logs.md#rounds-and-reports` | kept |
| An external tool gets a named owner; `agent:` names the tool | `24_agent-logs.md:652-657` | `08_agent-logs.md#rounds-and-reports` | kept |
| Benchmarks split by weight | `24_agent-logs.md:659-661` | `08_agent-logs.md#rounds-and-reports` | kept |
| Where research, analysis and diagrams live; renderable extensions | `24_agent-logs.md:663-678` | `08_agent-logs.md#where-output-goes` | kept |
| `settings.json` status as data; five values; not inherited; status only; two carriers | `24_agent-logs.md:682-697` | `08_agent-logs.md#run-status` | kept; "not inherited" dropped with child logs |
| Who may set `done` on a log | `24_agent-logs.md:699-702` | `08_agent-logs.md#run-status` | kept |
| Small worked example | `24_agent-logs.md:710-750` | `10_examples.md#an-implementation-issue` | merged |
| Large worked example; five teachings | `24_agent-logs.md:752-827` | `10_examples.md#a-loop-issue` | merged: rewritten with sibling logs |
| Recipes: `new-agent-log`, `new-iteration --producer`, `add-agent-log`, rapid ad-hoc changes | `24_agent-logs.md:831-866` | `08_agent-logs.md#commands`, `06#rapid-mechanical-changes` | kept as `new-round` and `--report` |
| Boundaries: append-only, State rewritten in place, memory apart, task list is not the subtask list | `24_agent-logs.md:868-879` | `08_agent-logs.md#boundaries` | kept |
| Brainstorm Holds / Does not hold; unbounded | `20_sections/25_brainstorm.md:7-14` | `05_brainstorm-notes-memory.md#brainstorm` | kept |
| Naming convention only; no codes, registration or icons | `25_brainstorm.md:16-20` | `05_brainstorm-notes-memory.md#naming` | kept |
| Tree shape; folder is one thread | `25_brainstorm.md:22-30` | `05_brainstorm-notes-memory.md#naming` | kept |
| Kind is a full word from an open vocabulary; seed table | `25_brainstorm.md:32-41` | `05_brainstorm-notes-memory.md#naming` | kept |
| Folder equals one thread; both first-class | `25_brainstorm.md:42-43` | `05_brainstorm-notes-memory.md#naming` | kept |
| Intra-issue only; cross-issue via `Related:` | `25_brainstorm.md:44-45` | `05_brainstorm-notes-memory.md#naming` | kept |
| Artifacts and diagrams render here too | `25_brainstorm.md:46-50` | `05_brainstorm-notes-memory.md#naming` | kept |
| Graduation marker; not deleted or moved; targets; timing; do-nothing | `25_brainstorm.md:52-64` | `05_brainstorm-notes-memory.md#graduation` | kept |
| What belongs: deliberation never a standalone issue; fold; debate too big for a comment; dialogue on request | `25_brainstorm.md:66-75` | `05#naming`, `04#comments` | kept |
| Add a brainstorm steps | `25_brainstorm.md:77-83` | `05_brainstorm-notes-memory.md#naming` | merged |
| Memory purpose; maintain continuously; log versus memory | `20_sections/26_agent-memory.md:3-6` | `05_brainstorm-notes-memory.md#agent-memory` | kept |
| Memory Holds / Does not hold | `26_agent-memory.md:8-13` | `05_brainstorm-notes-memory.md#agent-memory` | kept |
| Shape: index plus two buckets | `26_agent-memory.md:15-24` | `05_brainstorm-notes-memory.md#shape` | kept |
| Bucketed by lifecycle; staleness table | `26_agent-memory.md:26-34` | `05_brainstorm-notes-memory.md#shape` | kept |
| Precedence knowledge over history; correct the loser | `26_agent-memory.md:36-37` | `05_brainstorm-notes-memory.md#shape` | kept |
| No live bucket; the plan owns what is left | `26_agent-memory.md:39-42` | `05_brainstorm-notes-memory.md#shape` | kept |
| Grow into it: three tiers | `26_agent-memory.md:44-50` | `05_brainstorm-notes-memory.md#shape` | kept |
| Index: one line per topic; content never in the index; superseded section deleted; extra bucket declares lifecycle | `26_agent-memory.md:52-62` | `05#shape`, `05#rules` | kept |
| `knowledge/` named by topic without prefix; `history/` write-once | `26_agent-memory.md:64-71` | `05_brainstorm-notes-memory.md#shape` | kept |
| Rules: autonomous, mutable in place, no mirrors, issue-scoped, versus notes | `26_agent-memory.md:73-83` | `05_brainstorm-notes-memory.md#rules` | kept |
| Recipe; validator lints the shape | `26_agent-memory.md:85-90` | `05_brainstorm-notes-memory.md#rules` | kept |
| Guide is generated; Glossary is authored | `20_sections/27_guide-and-glossary.md:3-4` | `04_issue-comments-glossary.md#the-guide-panel` | kept |
| Guide built from `guide.ts`; kinds island; keep in sync | `27_guide-and-glossary.md:6-17` | `04_issue-comments-glossary.md#the-guide-panel` | kept; the panel ordering dropped as UI detail |
| `glossary.md` optional, rendered as-is | `27_guide-and-glossary.md:19-23` | `04_issue-comments-glossary.md#glossarymd` | kept |
| Glossary skeleton | `27_guide-and-glossary.md:25-43` | `04_issue-comments-glossary.md#glossarymd` | kept |
| Colour legend rules; Example column; `###` scoping; theme tokens | `27_guide-and-glossary.md:45-49` | `04_issue-comments-glossary.md#glossarymd` | kept |
| Kind mappings do not live in the glossary | `27_guide-and-glossary.md:50-52` | `04_issue-comments-glossary.md#glossarymd` | kept |
| Check the glossary first | `27_guide-and-glossary.md:53-54` | `04#glossarymd`, `03#frontmatter-rules` | kept |
| A plan is a schedule; Holds / Does not hold | `20_sections/28_plans.md:4-12` | `07_plans.md#intro` | kept |
| A plan stores no status of the work; no sync rule | `28_plans.md:14-16` | `07_plans.md#intro` | kept |
| A plan is not a second copy of the subtask list | `28_plans.md:18-20` | `07_plans.md#intro` | kept |
| No other file states order; a log listing rounds re-derives the plan | `28_plans.md:22-23` | `07_plans.md#intro` | kept |
| Shape; `plans/` holds plan folders only; `overview.md` reserved | `28_plans.md:25-40` | `07_plans.md#shape` | kept |
| Say stage, not section | `28_plans.md:42` | `07_plans.md#shape` | kept |
| Numbering: spread into the gap; "stage 20"; renumber is a move; nine stages | `28_plans.md:44-60` | `07_plans.md#numbering` | kept |
| Stage file frontmatter; `## Todo` and `## Questions`; no H1 | `28_plans.md:62-85` | `07_plans.md#the-stage-file` | merged: rewritten onto the template; the H1 rule dropped because spec section 6 gives a stage five `#` sections |
| The path is truth; link text is a reading aid | `28_plans.md:88-89` | `07_plans.md#the-subtasks-list` | kept |
| Not every todo links to a subtask | `28_plans.md:91-92` | `07_plans.md#the-stage-file` | kept |
| Body is free-form; what it may carry; short but not thin | `28_plans.md:94-111` | `07_plans.md#the-stage-file` | kept |
| Only the `subtasks:` list is rendered; unlinked todos are todos | `28_plans.md:114` | `07_plans.md#the-stage-file` | merged |
| A broken `subtasks:` reference is a validator error, listed in red | `28_plans.md:116-118` | `07_plans.md#the-subtasks-list` | kept |
| `agent-logs:` is an error; link a run from the body with an ordering label | `28_plans.md:120-141` | `07_plans.md#the-subtasks-list` | kept; the two reasons condensed to one sentence |
| `outcome` and `notes` are inline markdown; point with a link | `28_plans.md:143-156` | `07_plans.md#outcome-and-notes` | kept |
| Stage status table | `28_plans.md:158-176` | `07_plans.md#stage-status` | kept |
| Who closes a stage; a stage does not wait for its subtasks | `28_plans.md:178-186` | `07_plans.md#stage-status` | kept |
| The plan table columns; no subtask count | `28_plans.md:188-195` | `07_plans.md#the-plan-page` | kept |
| One plan, one page; heading form; link a stage file | `28_plans.md:197-205` | `07_plans.md#the-plan-page` | kept |
| Active plan derived; bold, not hoisted | `28_plans.md:209-219` | `07_plans.md#the-active-plan` | kept |
| Closing a plan: `## Closed` record; never deleted; superseded arrow | `28_plans.md:221-236` | `07_plans.md#close-a-plan` | merged: the record goes in the overview's `02` |
| Ownership table; a plan absorbs discovery | `28_plans.md:238-248` | `07_plans.md#ownership` | kept |
| Standing questions: stage or notes | `28_plans.md:250-255` | `07_plans.md#ownership` | kept |
| Recipes; `--after` takes the midpoint | `28_plans.md:257-267` | `07_plans.md#commands`, `07#numbering` | kept |
| Default search scope is not Closed | `40_operations/41_searching.md:3-5` | `09_operations.md#search`, `02#ai-rules` | kept |
| The scope hides Closed; the tip; `--status all`; `find` hides nothing; `--quiet-tips` | `41_searching.md:7-16` | `09_operations.md#search` | kept |
| No Grep or find on the tracker | `41_searching.md:18-20` | `09_operations.md#search`, `SKILL.md#never` row 6 | kept |
| Trigger phrasings for a search | `41_searching.md:22` | — | dropped: a synonym list, not a rule; the no-Grep rule covers every phrasing |
| `cli-toolkit.md` is the reference; `--help`, `--json`, `--tracker`; bun required; positional id | `41_searching.md:24` | `09_operations.md#intro` | kept |
| Common usage block | `41_searching.md:26-67` | `09_operations.md#search` | kept, condensed |
| Scope flags `--path`, `--meta`, `--count` | `41_searching.md:69-75` | `09_operations.md#scope-flags` | kept |
| `agent-ks find` across all content; `--type` | `41_searching.md:77-79` | `09_operations.md#search` | kept |
| Pattern A | `41_searching.md:85-91` | `09_operations.md#delegate-bulk-reads` | kept |
| Pattern B | `41_searching.md:93-100` | `09_operations.md#delegate-bulk-reads` | kept |
| Pattern C | `41_searching.md:102-114` | `09_operations.md#delegate-bulk-reads` | kept; the benchmark percentages dropped as measurement, not rule |
| Default to C; breakeven; staged paths must exist | `41_searching.md:116` | `09_operations.md#delegate-bulk-reads` | kept |
| The creation threshold and routes | `40_operations/42_updating.md:8-21` | `09_operations.md#the-creation-threshold` | kept |
| The existing issue that holds the work wins over a new one | `42_updating.md:23-24` | `09_operations.md#the-creation-threshold` | kept |
| Supersession corollary | `42_updating.md:26-30` | `09_operations.md#the-creation-threshold` | kept |
| The dump: component, one per kind, entry is a subtask, promote and delete, unhomed only, no empty dumps | `42_updating.md:32-46` | `09_operations.md#the-dump` | kept |
| Duplicate check when context is thin | `42_updating.md:48-50` | `09_operations.md#the-duplicate-check` | kept |
| Three check modes | `42_updating.md:52-66` | `09_operations.md#the-duplicate-check` | kept |
| Decision tree after the search | `42_updating.md:68-73` | `09_operations.md#the-duplicate-check` | kept |
| Run the check via Pattern C; verdict shape | `42_updating.md:75-95` | `09_operations.md#the-duplicate-check` | kept |
| Create a new issue steps | `42_updating.md:97-104` | `09_operations.md#a-new-issue` | kept |
| Validate; not `check section`; flags | `42_updating.md:106-124` | `09_operations.md#validate` | kept; `--subtask-template` is `--template` (spec section 10) |
| When not to edit | `42_updating.md:126-131` | `09_operations.md#do-not-edit` | kept |
| Per-type recipe table | `42_updating.md:133-144` | `SKILL.md#triage` | merged |
| `mv` breaks links in silence; use `agent-ks move` | `40_operations/43_moving-restructuring.md:5-9` | `09_operations.md#move-and-restructure` | kept |
| Move behaviours: file or folder, inbound, outbound, `--dry-run`, `--no-git` | `43_moving-restructuring.md:11-30` | `09_operations.md#move-and-restructure` | kept; the success message dropped as output detail |
| Renumber with `move` when no gap exists | `43_moving-restructuring.md:32` | `09_operations.md#move-and-restructure` | kept |
| Promote a subtask to an issue | `43_moving-restructuring.md:36-42` | `09_operations.md#move-and-restructure` | kept |
| Split an issue | `43_moving-restructuring.md:44-46` | `09_operations.md#move-and-restructure` | kept |
| Merge issues | `43_moving-restructuring.md:48-50` | `09_operations.md#move-and-restructure` | kept |
| Regroup subtasks | `43_moving-restructuring.md:52-54` | `09_operations.md#move-and-restructure` | kept |
| Do not rewrite history; the State exception | `43_moving-restructuring.md:56` | `08#boundaries`, `09#do-not-edit` | kept: `02` is the live section |
| Implementation example: layout, workflow, key points | `60_examples/61_multiple-subtasks.md:1-70` | `10_examples.md#an-implementation-issue` | kept, rewritten |
| Research example: layout and differences | `60_examples/62_research-focused.md:1-36` | `10_examples.md#a-research-issue` | kept, rewritten |
| Loop example: layout, round by round, three lines, when overkill | `60_examples/63_agent-loops.md:1-89` | `10_examples.md#a-loop-issue` | kept, rewritten with sibling logs |
| Phase example: layout, differences, numbers do not line up | `60_examples/64_phase-index.md:1-44` | `10_examples.md#a-phase-issue` | kept, rewritten |

## Self-check (spec section 12)

| Check | Result |
|---|---|
| 1. STE re-read | Two passes. A script split every sentence, table cells included, and flagged anything over 20 words. Nine sentences were split. Zero remain. No idioms kept; "centre of gravity", "in one breath", "hit a wall" were replaced with plain words |
| 2. Links | 65 relative links. Every link into my folder resolves on disk, anchors included. Every link into another builder's folder matches spec section 3. `check skill-links` reports only `../../agent-ks-cli/references/cli-toolkit.md` as missing, which the cli builder has not written yet. Example links inside code spans and fences are ignored by that checker |
| 3. Sizes | Every reference is under 150 lines and 1,500 words. `SKILL.md` is 696 by `wc -w` and 544 in prose. See open question 1 |
| 4. History words | `grep` for `used to`, `earlier`, `retired`, `no longer`, `now `, and `know ` returns nothing |
| 5. Harvest rows | 298 rows. Every row has a home or a reason |
| 6. Headings and lists | No heading deeper than `###`. No list longer than seven items |
| Status names | The eight names and the five run statuses match `STATUSES` and `RUN_STATUSES` in `astro-doc-code/src/loaders/issue-status.ts` |

## Dropped rules

| Rule | Reason |
|---|---|
| The user-guide is the canonical source; it wins over the skill | The path is framework-repo-internal. A consumer project does not have it. The spec makes the skill the one home |
| Prefix bands: below 100 a slot, 100 and above a child log | Spec section 8 removes slots and child logs |
| The ordering prefix is stripped from tracker URLs | Wrong. The loader keeps it. The opposite rule is kept |
| Filters compose AND across fields, OR within a field | UI behaviour, not an authoring rule |
| Live demo path for embeds | A path inside the framework's own tracker |
| The failure a group-by-area rule prevents (dated-path example) | Argument paragraph; the grouping test carries the rule |
| Where scale counts | Argument that reconciles two old rules; the work-type table decides |
| When unsure, ask once per session | No judgement call remains; the table decides by work type |
| Never make the log decision a validator error | No judgement rule remains to gate |
| Nesting mirrors a structure, never invents one | No nesting in the new shape |
| Depth budget for child logs | No child logs; the loader cap stays in anatomy |
| No `# Notes` section in the summary | Spec section 6 gives every summary `05 Notes & Analysis` |
| A `02_working/` folder for one producer with several artifacts | The spec shape is flat files only |
| Status tints the prefix number; untinted means "said nothing" | Renderer behaviour, not an authoring rule |
| Trigger phrasings for a search | A synonym list; the no-Grep rule covers every phrasing |

## Open questions

1. `SKILL.md` word count. The spec caps a `SKILL.md` at 600 words. The file holds five mandated tables with 152 pipe characters. `wc -w` gives 696; the prose count is 544. The tables use the spec wording, so cutting further means cutting a mandated row. Orchestrator to decide whether pipes count.
2. The cli builder's `templates/log-round.md` has `title` and `status` only. Spec section 6 lists `agent` too. `templates/plan-stage.md` has `title` and `status` only; the spec lists `outcome`, `notes`, `who` and `subtasks:`. `08_agent-logs.md` and `07_plans.md` document the spec. The cli builder owns the fix, or the scaffolder adds the fields from flags.
3. At the time of writing, `bun plugins/agent-ks-temp/skills/agent-ks-cli/scripts/cli.mjs help --json` lists `new-iteration` with `--producer`, `new-agent-log` with `--parent`, and `check issues --subtask-template`. My files document `new-round`, `--report` and `--template` per spec section 10. The cli builder's round lands them.
4. Old `check issues` warns on a `# H1` in a stage file and the renderer generates the stage heading from `title`. Spec section 6 gives a stage five `#` sections. The renderer follow-up is out of scope (spec section 14). The validator change is the cli builder's.
5. The old `24_agent-logs.md` index-check procedure (two directions, four labels, by-hand fallback) is assigned to the root builder's `agent-ks-index-check/SKILL.md` by spec section 10. My `08_agent-logs.md` links there. The reviewer should confirm that file carries the whole procedure.
