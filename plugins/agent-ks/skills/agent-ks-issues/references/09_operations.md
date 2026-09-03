# Operations — search, create, validate, move

The CLI is `agent-ks <group> <verb>`. Tracker work uses the `issue` group plus `agent-ks check issues`, `agent-ks find` and `agent-ks move`. Every command and flag: [cli-toolkit.md](../../agent-ks-cli/references/cli-toolkit.md). Discover with `agent-ks help`.

| Fact | Detail |
|---|---|
| every `issue` command takes `--tracker <path>` | the tracker is a flag, never a positional argument. Which commands take `--json`: the cli-toolkit |
| scaffolders take the issue id first | `agent-ks issue new-plan <issue-id> --name <slug>` |
| an unrecognised flag is ignored in silence | check spelling with `agent-ks help <command>` when a filter does nothing |
| every wrapper needs `bun` | the dispatcher refuses with an install hint otherwise |
| inside a git worktree the `.env` search stops at the worktree root | write a worktree-local `.env`, or pass `--tracker` before any write |

## Search

Search the tracker with `agent-ks issue list`, never with `Grep` or `find`. The CLI reads the schema. It combines structural filters with a regex in one call. It returns paths, line numbers and excerpts. Use `Grep` only outside the tracker.

The default scope hides the Closed category. A query can return nothing while a match sits in `done`, `dropped` or `superseded`. "Not found" is not "does not exist". When hidden matches exist, the CLI prints a tip to stderr with the count. Re-run with `--status all` or `--include-closed` when the answer depends on whether an issue exists at all. `agent-ks find` ignores status and hides nothing. `--quiet-tips` suppresses the tip.

```bash
agent-ks issue list --priority high,urgent
agent-ks issue list --search "yjs|crdt" --search-fields body,subtasks
agent-ks issue list --assignee unassigned --priority high,urgent
agent-ks issue list --search "TODO" --paths-only
agent-ks issue subtasks --all --status review
agent-ks issue show <issue-id>
agent-ks issue agent-logs <issue-id> --last 5
agent-ks issue review-queue
agent-ks find "<regex>" --type docs,blog,issues,config
```

### Pick the scope

`--path` is the fast way to find an issue by slug; pair it with `--status all`. `--meta` matches a field value, not prose. `--count` gauges breadth before you drill in. `--paths-only` feeds a pipe. Every flag: [the `list` flags](../../agent-ks-cli/references/cli-toolkit.md).

### Delegate bulk reads

Push bulk reading onto a cheap subagent. It keeps the main context lean.

| Pattern | When | Brief |
|---|---|---|
| A: bulk classification | the task reads more than 10 issue files | "Read every open issue under `data/todo/`. Per issue return id, title, priority, top blocker. Table, under 300 words" |
| B: search, then synthesise | a search returns more than 10 matches | "Run `agent-ks issue list --search <x> --paths-only --quiet-tips`. Read each path. Group by issue. Answer <question> in 300 words" |
| C: pre-staged commands | you can write the exact commands up front | "Do not load any skill. Run these commands. Read the files named. Synthesise. Read-only." One section per task with the exact command |

Default to pattern C when the user wants a synthesised answer. Breakeven: more than 3 reads or more than 10 hits. Every path you stage must exist. Open-ended exploration and one-off lookups stay in the main context.

## Create

### The creation threshold

Test: you can name the component and the first subtask at once. Both named: it may be an issue. Otherwise route it.

| Thought | Home |
|---|---|
| belongs to an existing issue | a subtask on that issue. A one-prompt fix always lands here |
| informs a decision in an existing issue | a brainstorm entry there |
| has no home yet | a dump entry |

The existing issue that holds most of the work wins over a new issue. No record for small work: a one-line change earns neither a subtask nor a log. An issue that shipped work stays an issue. An issue that is pure deliberation folds into the winner's `brainstorm/` and is deleted ([brainstorm](05_brainstorm-notes-memory.md)).

### The dump

A dump issue has component `issue-dump`. Each entry is a subtask. A tracker keeps a few dump issues, one per kind. Create a kind only when entries exist. A dump entry that passes the threshold is promoted to an issue and deleted from the dump. A one-liner with an obvious home skips the dump. Capture one with [agent-ks-quick-idea-note](../../agent-ks-quick-idea-note/SKILL.md).

### The duplicate check

Skip it when your context on the area is warm. Run it when the conversation is fresh, the component is unfamiliar, or the topic was plausibly touched before. When unsure, run it.

```bash
agent-ks issue list --search "index|indexer|indexing" --quiet-tips
agent-ks issue list --component live-editor --priority high,urgent --quiet-tips
agent-ks issue subtasks <issue-id> --quiet-tips
```

| Result | Action |
|---|---|
| no hit | create |
| strong match: same scope, open or review | do not create. Offer: extend with a subtask, add a comment, or create anyway. Wait |
| partial match | create, and link the related items in a `Related:` line |
| Closed match only | create. Mention the prior issue when it matters |

Hand the commands to a pattern C subagent. Ask for a verdict in three parts: `STATUS`, `RELATED` (file, line, a quoted snippet) and `NOTES`.

### A new issue

1. Apply the threshold. Run the duplicate check when context is thin.
2. Create `<tracker>/<YYYY-MM-DD>-<slug>/` with today's date.
3. Write `settings.json` with every required field from [anatomy](01_anatomy.md). Every enum value comes from the vocabulary.
4. Write `issue.md`: goal, context, done when, scope decisions ([issue body](04_issue-comments-glossary.md)).
5. Declare at least one subtask when an agent will pick it up.
6. Validate.

## Validate

```bash
agent-ks check issues                      # the default tracker
agent-ks check issues --tracker <path>     # another tracker
```

Run it after any non-trivial write. Not `agent-ks check section`: that validates a docs section and passes a broken tracker. Use `--strict` in CI and after a migration. Every flag: [cli-toolkit.md](../../agent-ks-cli/references/cli-toolkit.md).

## Do not edit

- A Closed issue, without an explicit prompt from the user.
- A prior comment, or another author's `author` and `date`.
- A closed round. Append the next one.
- `done` or `dropped` on an issue or subtask ([closing authority](02_lifecycle.md)).

## Move and restructure

A plain `mv` breaks every relative link in silence. Use `agent-ks move`. It repoints inbound links. It recomputes outbound links from the new directory. It keeps `#anchor` fragments. It uses `git mv`, so history follows the file.

```bash
agent-ks move <issue>/subtasks/05_styles.md <issue>/subtasks/020_polish/010_styles.md
```

`<from>` is one `.md` file or a folder. Run `--dry-run` first when you reorganise. When a gap exists, take the in-between number and move nothing. When no gap exists, renumber with `agent-ks move`.

| Pattern | Steps |
|---|---|
| promote a subtask to an issue | create the issue. Carry the subtask's framing into `issue.md`. Leave the subtask as the pointer: "Promoted to <id>", status `review`. Move any travelling notes with `agent-ks move` |
| split an issue | create the second issue. Move the relevant `notes/` and `subtasks/`. Add a comment in each that points at the other. Delete nothing |
| merge two issues | pick the canonical one. Move the other's `notes/` and `subtasks/` into it. Comment the merge in both. The empty one gets a comment; the user sets `dropped` |
| regroup subtasks | move each leaf into or out of the `NN_<group>/` folder. Add a folder `settings.json` title when the slug does not read as a label |
