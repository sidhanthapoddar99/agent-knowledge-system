# Anatomy — the tracker on disk

A tracker is a folder of issues. The default tracker is `data/todo/`. A project may hold several trackers. Every tracker has the same shape. This file holds the names that every other reference uses.

## Glossary

| Term | Meaning |
|---|---|
| tracker | a folder with a root `settings.json` and one folder per issue |
| issue | one folder, `YYYY-MM-DD-<slug>/`, that holds one unit of thinking and execution |
| section | a top-level folder inside an issue: `brainstorm/`, `notes/`, `plans/`, `subtasks/`, `agent-log/`, `agent-memory/`, `comments/` |
| subtask | one work item: one markdown file under `subtasks/` with its own status |
| group | a folder under `subtasks/` that labels an area of work. It has no body file |
| index leaf | a subtask file with the `00_` prefix that summarises its group |
| plan | one folder under `plans/` that holds a schedule: `settings.json`, `overview.md` and stage files |
| stage | one file in a plan. Its prefix is its order and its id |
| agent log | one folder under `agent-log/` that records one run |
| run | one goal, one start, one outcome, recorded in one agent log |
| round | one file in an agent log that records one pass of work |
| report | one file in an agent log that holds one agent's output inside a round |
| log index | `00_index.md`, the entry file of an agent log: the goal, the list of files, the handover |
| note | one file under `notes/` that holds a settled conclusion |
| brainstorm | one file or one folder under `brainstorm/` that holds deliberation |
| comment | one file under `comments/` that records an event |
| agent memory | `agent-memory/`, the agent's working state for the issue |
| dump issue | an issue with component `issue-dump`. Each subtask in it is an unhomed idea |
| kind code | the two-letter code in an agent log folder name: `lp`, `au`, `rf`, `re`, `it`, `wf`, or a custom code |
| ordering prefix | the leading digits of a file or folder name. It sets the sort position. 2 to 5 digits, sorted by numeric value, so `01_` and `010_` coexist and `5_` does not parse. `_` is canonical; the loader tolerates `-` |
| template | the one body shape every work file uses. See [writing](03_writing.md) |
| Closed | the status category that holds `done`, `dropped` and `superseded` |

## The tree

```
<tracker>/
├── settings.jsonc                     vocabulary: priority, component, labels, authors, views
└── YYYY-MM-DD-<slug>/                 one issue
    ├── settings.json                  metadata, optional agentLogKinds
    ├── issue.md                       goal and context
    ├── glossary.md                    optional: colour legend and terms
    ├── comments/NNN_<slug>.md         flat; the CLI numbers them
    ├── brainstorm/NN_<kind>_<slug>.md a file, or NN_<slug>/ for a multi-file thread
    ├── notes/<slug>.md                prefix optional; folders allowed
    ├── plans/NN_<name>/
    │   ├── settings.json              title and status
    │   ├── overview.md                reserved name, never a stage
    │   └── NN_<stage>.md              gap-spaced by ten
    ├── subtasks/
    │   ├── NN_<slug>.md               a root-level leaf
    │   └── NN_<group>/                optional settings.json { "title": "..." }
    │       └── NN_<slug>.md
    ├── agent-log/NNN_<kind>_<name>/
    │   ├── settings.json              { "status": "in-progress" }
    │   ├── 00_index.md                   the entry file: goal, files, handover
    │   ├── <file>.md                  free names; a loop uses 10_<round>.md, 11_<report>.md
    │   └── NNN_<kind>_<name>/        a child log for work done inside the run
    └── agent-memory/
        ├── memory.md                  the index; read it first
        ├── knowledge/<topic>.md       optional: what is true
        └── history/<subject>.md       optional: how we got here
```

An issue folder name matches `^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$`. The only root files are `issue.md`, `settings.json` and `glossary.md`. The validator warns on any other root `.md` file. It does not check other file types, so a stray `.txt` or `.json` at the root passes in silence. Report a stray file to the user.

## Folder rules

| Folder | Prefix | Nesting | Rule |
|---|---|---|---|
| `comments/` | `NNN_`, set by the CLI | none | append only |
| `brainstorm/` | optional | 5 levels is the cap; 3 is the convention | a folder is one thread |
| `notes/` | optional | 5 levels is the cap; 3 is the convention | number only when reading order matters |
| `plans/` | `NN_` per plan and per stage | plan folders only | no loose files; `overview.md` is reserved |
| `subtasks/` | `NN_` or `NNN_`, gap-spaced | 1 level is the convention, because a group is an area and not a phase ([subtasks](06_subtasks.md)); 5 is the cap | a group is a label with no body file |
| `agent-log/` | `NNN_` per log; files inside are free. Child-log numbering: [agent-ks-issue-logs](../../agent-ks-issue-logs/SKILL.md) | two levels is the shape to aim for | `00_index.md` is the entry file. Guidance, not checked |
| `agent-memory/` | none | `knowledge/` and `history/` | name files by topic |

The loader reads 5 folder levels below a section. Deeper content gets one console warning and no page. Files and folders mix at every level except the deepest. Any folder may hold an `assets/` folder for embedded files. It never appears in the sidebar. In the sidebar a subtask group shows done/total. Other sections show the descendant count.

## Per-issue settings

| Field | Type | Level | Rule |
|---|---|---|---|
| `title` | string | error | the display label |
| `description` | string | optional | 1–3 sentences; detail goes in `issue.md` |
| `status` | enum | error | one of the eight statuses in [lifecycle](02_lifecycle.md) |
| `priority` | enum | convention | a value from `fields.priority.values` |
| `component` | string[] | warning | values from `fields.component.values`. Exactly one per issue: the layer that holds most of the work. The validator warns on an empty list and on more than one. A dump issue is no exception: `issue-dump` names a holding pen rather than a layer, and it still takes exactly one component |
| `labels` | string[] | convention | values from `fields.labels.values`; often `[]` |
| `author` | string | convention | a name from the root `authors` list |
| `assignees` | string[] | convention | names from `authors`; often `[]` |
| `agentLogKinds` | object | optional | custom kind codes: `{ "ex": { "name": "experiment", "icon": "flask" } }` or `"hf": "hotfix"` |
| `draft` | boolean | optional | `true` hides the issue from the site |

Level says what happens when the field is missing. `error`: the load or `agent-ks check issues` fails. `warning`: the check reports a finding. `convention`: nothing checks it, and every issue still carries it. `optional`: leave it out. Report the right level when you audit a tracker, so a convention does not read as a defect.

Dates are derived. `created` comes from the folder name. `updated` comes from the last git commit under the folder. Do not write `updated` into the file. The tracker orders issues by `priority` desc, then `updated` desc. A missing `labels` or `assignees` reads as `[]`. `assignees` says who holds the work. It is not a status. The filter has two tiers: `assigned` or `unassigned`, and names from `authors`.

## Tracker vocabulary

The root file is `settings.json` or `settings.jsonc`. Prefer `.jsonc` and comment each value. When both exist, `.jsonc` wins.

```jsonc
{
  "label": "Todo",
  "fields": {
    "priority":  { "values": ["low", "medium", "high", "urgent"] },
    "component": { "values": ["editor"], "descriptions": { "editor": "The live editor app." } },
    "labels":    { "values": ["bug"],    "descriptions": { "bug": "A defect." } }
  },
  "authors": ["sidhantha", "claude"],
  "views": []
}
```

| Rule | Detail |
|---|---|
| every enum value comes from this file | add the value here first. Then use it |
| `component` and `labels` need one `descriptions` entry per value | a missing entry is a startup error and fails `agent-ks check issues` |
| `priority` descriptions are optional | |
| `status` is not configurable | a `fields.status` block or a `statusColors` map is a hard error |
| status colours are theme CSS variables | override `--status-<name>` in the theme's `color.css`. Light and dark may differ |
| add no scheduling, release-bucket or single-type field | execution state is a status. Order is a plan |
| `"template": true` | runs the five-section lint on every `agent-ks check issues`, with no `--template` flag |
| `"draft": true` | hides the whole tracker from the production build |

Descriptions render in the tracker's Guide modal. Keep them accurate. To backfill descriptions or remove a status block, run the migration chain in the config skill's [08_migrations.md](../../agent-ks-config/references/08_migrations.md).

## URL shapes

| Content | URL |
|---|---|
| issue | `/<tracker>/<issue>` |
| subtask | `/<tracker>/<issue>/subtasks/[<group>/]<slug>` |
| note | `/<tracker>/<issue>/notes/[<group>/]<slug>` |
| plan | `/<tracker>/<issue>/plans/<plan>`, one page with every stage inline |
| stage | no page of its own. `…/plans/<plan>/<stage>` redirects to `…/plans/<plan>#<stage>` |

A tracker URL keeps the ordering prefix. `subtasks/020_impl/010_backend.md` is served at `…/subtasks/020_impl/010_backend`.
