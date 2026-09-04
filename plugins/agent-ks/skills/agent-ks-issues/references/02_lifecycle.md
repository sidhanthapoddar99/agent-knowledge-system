# Lifecycle — statuses, closing authority, AI rules

There is one status field. It has one vocabulary of eight values in four categories. It applies to issues, subtasks, plans, stages, agent logs and rounds. The values are fixed in framework code, in `issue-status.ts`. A tracker overrides nothing here. A value outside the eight is a hard error. The loader throws, and the build stops. Such a value is never a new status.

## The eight statuses

| Category | Status | Meaning |
|---|---|---|
| Not Started | `open` | no work started |
| Not Started | `blocked` | waits on another issue or subtask. The reason is in prose |
| In Progress | `in-progress` | work is running. Set it when you start |
| Review | `input-needed` | stuck on a question. The question is written inline in the item |
| Review | `review` | work is done and waits for sign-off |
| Closed | `done` | shipped |
| Closed | `dropped` | abandoned. Needs a comment that says why |
| Closed | `superseded` | closed because the scope moved. Needs a `→` line that says where |

Nothing enforces an order of transitions. Any jump between statuses is legal. The site filters by category and shows the status as the badge.

## `superseded` names where the scope went

`done` says the work shipped. `dropped` says the idea was abandoned. `superseded` says the scope moved: absorbed into another design, folded into a later phase, or reshaped into another item. Write one line in the file's own body that opens with an arrow:

```
→ absorbed into phase-3 notes/10, decision D2
```

`agent-ks check issues` warns when the line is missing. Both `→` and `->` count. The line may be a list item or a blockquote. For an issue the line may sit in `issue.md` or in a comment. After `done` a reader opens the artefact. After `dropped` a reader reads why. After `superseded` a reader follows the arrow.

## Runs use five statuses

An agent log and a round carry `open`, `in-progress`, `input-needed`, `done` and `dropped`. `blocked`, `review` and `superseded` describe a work item, not a run. A run does not wait on another run. A run is never signed off. Its subtask is. A run whose scope moved did not finish, so its status is `dropped`. The list is `RUN_STATUSES` in `issue-status.ts`. Plans and stages carry all eight.

## Closing authority

This section is the one home of the rule. Every other file links here.

`superseded` is the exception at every level. You may set it. Write the `→` line in the same edit. `done` and `dropped` follow the table.

| The status sits on | Who may close it | Why |
|---|---|---|
| an issue or a subtask | the user only. Your ceiling is `review`, `input-needed` with the question inline, or `superseded` with its `→` line | closing signs off the work. The user inspects the artefact and sets the status |
| an agent log or a round | you | it records what you did. Nobody else can say whether the run finished |
| a plan or a stage | you | closing ends a schedule, not a piece of work |

Never certify a subtask by closing the agent log that worked on it. The log's `done` is not evidence for the subtask's `done`.

A run's status answers the question "did the agent finish". It never answers "was the result good". An audit that ran to the end and found five defects is `done`. The defects go in its files. `dropped` means the run did not deliver: it crashed, was refused, or was superseded. A `dropped` run needs no comment. Its `00_index.md` handover says what happened.

## AI rules

| Rule | Detail |
|---|---|
| 1. Manage `in-progress` yourself. Hand off at Review | Set `in-progress` when you start. Hand off with a verifiable artefact: PR, diff, screenshot, test output |
| 2. When stuck, set `input-needed`, not `blocked` | Write the question inline in the item body. Reserve `blocked` for a dependency on another issue or subtask, named in prose |
| 3. Default search scope is everything not Closed | Skip `done`, `dropped` and `superseded` unless the prompt asks for closed history |
| 4. A subtask in Review lifts its issue into the Review tab | An active issue with any subtask in `review` or `input-needed` appears on the Review tab with a `review` badge. The stored status does not change. A `blocked` subtask never lifts its issue |
| 5. Mark an issue `review` only when | implementation is done, every subtask is `review` or `done`, an artefact exists, and the record says what was tried |
| 6. `dropped` needs a comment first | Write `comments/NNN_….md` that says why. The status change itself is the user's |
