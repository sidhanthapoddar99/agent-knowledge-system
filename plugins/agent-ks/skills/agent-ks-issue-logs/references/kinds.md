# The six kinds — the tree and the slots

Open the section for the kind you are about to create, and only that one. Each
section gives the tree, who opens the log, and the slots. A slot is a suggested
file name; `new-agent-log` writes the kind's slots into `00_index.md` for you.
Add a file when the slots do not fit. Do not add one to record what already
lives in the subtask. Every tree below also carries `settings.json`, which holds
the run's status; `new-agent-log` writes that file too.

## Scaffolding

```bash
agent-ks issue new-agent-log <id> --kind lp --name ship-search --for 010,020
agent-ks issue new-agent-log <id> --kind au --name loader --group 010_lp_ship-search
agent-ks issue new-round <id> --log 010_lp_ship-search/120_au_loader --name codex --agent codex
```

`<id>` is the issue folder name. `--for` links the subtasks the run serves.
`--group <log folder>` opens a child log inside a run.

`new-round` adds the next numbered file and lists it in the index. A round
file's prefix ends in `0`: `10_`, `20_`, `30_`. A second file in the same round
is a report; `--report` takes the next free digit, `11_` to `19_` in round 1. A
file the numbering cannot reach — a plain name, or a prefix below `10` — is
written by hand; add its line to `## Files` yourself.

Keep files short: an index under 60 lines, any other under 40, one finding per
line with a link. A file that outgrows the hint is two files.

Every flag: [cli-toolkit.md](../../agent-ks-cli/references/cli-toolkit.md). List
an issue's logs with `agent-ks issue agent-logs <id>`. Search them with
`agent-ks issue list --search 'loader|loaders' --search-fields agent-log`, or
with `agent-ks find`. Never `Grep`: the verbs know the tracker's shape and scope
by status, while a grep returns lines with no issue, run or status attached.

## `lp` — a loop

A long-horizon run: days of work, tied to a plan or several subtasks, tracked
across sessions. The loop is the parent of everything done inside it. Its stages
are not files here; their results live in the subtasks and the plan. What the
loop keeps is what had no home: findings, guidelines, and the child logs. Only
on the user's ask, because a loop commits days that the user scopes.

```
agent-log/010_lp_ship-search/
├── settings.json
├── 00_index.md          goal, Serves:, every file and child below, handover
├── 05_guidelines.md     rules every agent in this loop follows
├── 10_findings.md       things found on the way that need a home later
├── 20_debrief.md        written once, at the end. May become 110_debrief/
├── 120_au_loader/       an audit done inside the loop
├── 130_re_search-backends/
└── 140_it_query-slice/  a slice that earned its own folder
```

`05_guidelines.md` sits below `10_`, so write it by hand — see § Scaffolding.

## `rf` — a refactor

One refactor with a stated goal, ad hoc or inside a loop. Small by design: the
outcome goes to the subtask. What stays here is the map a later reader needs
when names moved. The agent opens one when the map is worth keeping, and says
so in the reply.

```
agent-log/020_rf_loader-split/
├── 00_index.md          what is being refactored and why, links
├── 10_changes.md        what moved where
└── 20_watch-out.md      optional: quirks the next reader must know
```

## `au` — an audit

Several reviewers on one target: adversarial reviews, independent reviews,
models from different providers. One file per reviewer, so a hundred findings
have a place and nothing is merged away by accident. The index carries the
verdict after the merge: a union of the reviewers, not a vote. The agent opens
one when the reports are worth keeping, and says so in the reply.

```
agent-log/030_au_loader/
├── 00_index.md          what was audited, the verdict per finding, handover
├── 10_codex.md          the first reviewer, all its findings
├── 11_opus.md           the second reviewer, a report inside round 1
└── 20_fixes.md          optional: which finding each fix closed
```

One call per reviewer. The second is a report inside the same round:

```bash
agent-ks issue new-round <id> --log 030_au_loader --name codex --agent codex
agent-ks issue new-round <id> --log 030_au_loader --name opus --report --agent opus
```

Name the tool in `--agent` on every call: it defaults to `claude`, so a file
written without it claims a reviewer that did not write it. A finding belongs to
the tool that produced it, and one that lives only in a job record dies with the
run.

An audit that comes before any work sits at the root of `agent-log/`. One done
inside a loop nests in it.

## `re` — research

Many agents over many segments: products, approaches, standards. The bulk stays
here so that it can be read again. The summary and the crucial parts go to
`notes/` or `brainstorm/`; the index links to them. One level of folders inside
is enough. The agent opens one when the segments are worth keeping, and says so
in the reply.

```
agent-log/040_re_search-backends/
├── 00_index.md          the question, the method, the short answer, links to the notes
├── 10_hosted/           one folder or one file per segment
│   ├── 00_index.md
│   └── meilisearch.md
├── 20_self-hosted/
└── 30_comparison.md     optional: the side-by-side
```

## `it` — an iteration

A miscellaneous folder, on the user's ask. Two uses. The user asks for a
back-and-forth to be written down as pointers, with a goal and the subtask it
serves. Or, inside a loop, one slice of a stage turns out to deserve its own
place: benchmarks, scratch files, a record too big for the subtask. No child
logs.

```
agent-log/050_it_query-slice/
├── 00_index.md          goal, the subtask it serves, handover
├── 10_notes.md          the pointers from the back and forth
└── 20_benchmark.md      before and after numbers, with units
```

## `wf` — a workflow

Only for a very large run: many agents, several stages, each stage handing data
to the next. The folder is where that data changes hands, so an agent late in
the chain reads its input from a file and not from a prompt. Rare. A workflow
that does research is a `re`. No child logs. Only inside a loop, or on the
user's ask.

```
agent-log/060_wf_batch-migrate/
├── 00_index.md          the stages and what each hands to the next
├── 10_collect.md        what stage one produced for stage two
└── 20_merge.md
```
