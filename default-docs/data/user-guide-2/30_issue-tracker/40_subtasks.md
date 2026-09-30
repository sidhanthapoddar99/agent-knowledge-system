---
title: "Subtasks"
description: "Work items: one file each, grouped by area, written from one template."
---

A subtask is one work item: one markdown file under `subtasks/` with its own status. It is the file an agent picks up when it takes over the work, so it says everything the job needs: what to do, the limits, when it is done, and what came out.

## What a subtask holds

| Holds | Never holds |
|---|---|
| The work item, and the detail needed to do it | When it runs. Order belongs to a [plan](./45_plans-and-stages.md) |
| Links to the notes that scope it | The deliberation behind those notes |
| The result, with evidence | How the result was reached, step by step. That is the agent log's |
| The decisions taken, with reasons | The options tried before a decision. Those go in the log |

In short, **the subtask holds the outcome, the log holds the path.** A log may serve several subtasks, so each subtask writes its own result and links to the log for the rest.

## Groups are areas, not phases

Subtasks may sit in group folders. A group is an **area of work**, a noun such as `validator`, `migration` or `ui`. It is never a phase or a step. If a group name needs the word "phase", you are writing a plan.

```
subtasks/
├── 010_loader-refactor.md       a work item at the root
├── 020_sidebar-tree.md
├── 030_validator/               a group: one area of work
│   ├── settings.json            optional: { "title": "Validator" }
│   ├── 00_overview.md           optional index leaf
│   ├── 010_link-form.md
│   ├── 020_template-check.md
│   └── 030_agent-log-line.md
└── 040_docs/
    ├── 010_user-guide.md
    └── 020_release-note.md
```

| Rule | Detail |
|---|---|
| A group has no body file | An optional `settings.json` with a `title` sets its label on the issue page |
| One level is the convention | Open a group when an area has three or more subtasks |
| Folders and files share one numbering | They sort together by number |
| The number is an id, not an order | `020` does not run after `010`. Use a plan for order |
| Leave gaps | Number in steps of 10, or 5 for a dense set, so a new subtask fits between two others |

agentks counts each group's subtasks: the total, how many are closed, and how many wait for review. A closed subtask counts as done.

### The index leaf

A group with six or more subtasks may open with an **index leaf**: a subtask file whose number is `00_`. It summarises the group. Its To Do holds a status table of the group, and its References hold the rulings that apply to every subtask in it.

agentks works out the index leaf's status from its siblings: `open` while every sibling is `open`, `done` once every sibling is closed, and `in-progress` in between. `agentks check issues` warns when the status written in the file disagrees.

## The template

Every subtask uses the same body. The problem comes first, with no heading. Five numbered sections follow.

````markdown
---
title: "Add the link-form check"
status: open
---

Why this exists, and what triggered it. Two or three lines.

# 01 To Do
- [ ] **A concrete item.** What to do, with the paths it touches.
    - [ ] A sub-item.

## Guardrails
- A limit for this job: what not to touch, what must stay true.

## Questions
Only questions still unanswered. Delete the section when there are none.

## Done when
- A plain test that says the job is complete.

# 02 Status and Result
One line: where it stands now.

## Result
What came out, with evidence.

## Agent log
none

# 03 References
- Links to the notes that scope it.

# 04 Decisions
- Decided (sid, 2026-10-01): what, and why.

# 05 Notes & Analysis
## Issues hit
## Watch out
````

`## Agent log` holds a link to the log that did the work, or `none`. An answered question leaves `## Questions` and becomes a decision under `04 Decisions`, with who, when and why.

The five `#` sections are fixed. The `##` sub-headings are the standard set: drop one you do not need, but never add a `#` section. The frontmatter holds `title` and `status`, and nothing else.

A good subtask passes one test: a capable person with none of your context can build the right thing from the file alone.

## Checking the template

`agentks check issues --template` also checks the template, and warns when:

- a `#` section is missing;
- a subtask in `review`, `done` or `superseded` still has the placeholder under `02 Status and Result`;
- `## Agent log` is not `none` and not exactly one link to a file that exists;
- `## Questions` has an entry while the status is not `input-needed`.

To run these checks on every `check issues`, set `"template": true` in the tracker's root settings ([Tracker settings and vocabulary](./25_tracker-vocabulary.md)).

## Create a subtask

```bash
agentks issue new-subtask 2026-10-01-search-index --name link-form \
  --group 030_validator --title "Add the link-form check" \
  --overview "Links written as site paths break when the files are read outside the site."
```

The command takes the next free number, leaving a gap, and writes the template. `--overview` becomes the opening lines. `--group` creates the group folder if it is missing. `--index` writes the group's index leaf instead.

## Update its status

```bash
agentks issue set-state 2026-10-01-search-index in-progress --subtask 010
agentks issue set-state 2026-10-01-search-index review --subtask link-form
```

`--subtask` takes a number, a name or a path.

Set `in-progress` when you start. When the work is done, fill in the result, then set `review`. When you are stuck on a question, write it under `## Questions` and set `input-needed`. [Statuses, categories and review](./15_statuses-and-review.md) says who may set `done` and `dropped`.
