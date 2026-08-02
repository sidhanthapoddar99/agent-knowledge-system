/**
 * guide.ts — the framework-bundled "issue anatomy" guide.
 *
 * Rendered on every issue's **Guide** panel (see DetailBody.astro). This is the
 * plugin-independent twin of the `agent-ks-issues` skill's guide: a THIN
 * legend (the map of what each section is), not the full operating manual.
 * The manual lives in the skill; keep this in sync with it at release time.
 *
 * Mostly a static template, with **generated islands** — content that varies
 * per issue (the effective agent-log kind set from `settings.json`). Sections
 * are ordered by complexity (most machinery first), not workflow order: the
 * Guide is a reference you open when confused, and confusion concentrates
 * where the machinery is.
 *
 * It's a TS module (not a data file) on purpose: the guide ships *with the
 * framework*, so it's present at every build/deploy regardless of whether the
 * Claude Code plugin is installed.
 */
import { renderMarkdown } from '@parsers/renderers';
import {
  CATEGORIES, STATUSES, RUN_STATUSES, STATUS_LABELS, STATUS_DESCRIPTIONS,
  type AgentLogKind, type IssueStatus, type RunStatus,
} from '@loaders/issues';
import { agentLogIcon } from './server/agent-log-icons';
import { stateIconSvg } from './server/state-icon';
import { fileTypeIcon } from '../../file-type-icons';

export interface GuideHeading {
  /** Element id in the rendered HTML (`guide-<slug>`). */
  slug: string;
  text: string;
}

export interface IssueGuide {
  html: string;
  /** One entry per `##` section — feeds the right-rail "On this page" TOC. */
  headings: GuideHeading[];
}

/** Inline SVG for a kind symbol, sized for a table cell. */
function kindSvg(icon: string): string {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px">${agentLogIcon(icon)}</svg>`;
}

/** Generated island: the effective kind set for this issue (defaults merged
 *  with the issue's `agentLogKinds`). */
function kindsTable(kinds: Record<string, AgentLogKind>): string {
  const rows = Object.entries(kinds)
    .map(([code, k]) => `| ${kindSvg(k.icon)} | \`${code}\` | ${k.name} | ${k.desc ?? '—'} |`)
    .join('\n');
  return `| | Code | Kind | Use for |\n|---|---|---|---|\n${rows}`;
}

/** Generated island: the fixed lifecycle line, built from the code constant so
 *  this guide can never drift from `issue-status.ts`. */
function lifecycleLine(): string {
  return CATEGORIES.map(
    (c) => `*${c.label}* ${c.statuses.map((s) => `\`${s}\``).join('·')}`,
  ).join(' · ');
}

/**
 * Generated island: the status-icon legend, built from `stateIconSvg` plus the
 * **resolved** colour map, so symbol, colour and gloss cannot drift from the UI.
 *
 * This used to hand-write a parallel `STATUS_TINTS` map of CSS variables, under
 * a docblock claiming the legend could never drift. It drifted: it tinted
 * `dropped` with `--color-error` and `blocked` with `--color-text-muted`, while
 * the palette said `#c678dd` and `#d1854f`. The guide that teaches *no file
 * stores a fact another file owns* was keeping a second copy of the palette.
 *
 * `statusColors` is the tracker's *effective* map — framework defaults with any
 * root `statusColors` override merged on — so an override restyles this legend
 * and the sidebar together. A local map could not do that, which is why the
 * duplicate had to go rather than just be corrected.
 */
function statusTable(statusColors: Record<IssueStatus, string>): string {
  const rows = STATUSES.map((s) => {
    const icon = `<span style="color:${statusColors[s]};display:inline-flex;vertical-align:-2px">${stateIconSvg(s)}</span>`;
    return `| ${icon} | \`${s}\` | ${STATUS_LABELS[s]} | ${STATUS_DESCRIPTIONS[s]} |`;
  }).join('\n');
  return `| | Status | Label | Meaning |\n|---|---|---|---|\n${rows}`;
}

/**
 * Generated island: the statuses that mean something for a RUN, each shown in
 * the colour it actually renders as on the agent-log folder's symbol.
 *
 * The Agent log section used to describe this subset in prose — "colours the
 * kind symbol… absent renders grey" — and show no colour anywhere, so the one
 * surface where the tint IS the signal had no legend. The full seven-status
 * legend lives under Subtasks, which is the wrong place to look when you are
 * reading about runs.
 */
function runStatusTable(statusColors: Record<IssueStatus, string>): string {
  const rows = RUN_STATUSES.map((s) => {
    const dot = `<span style="color:${statusColors[s]};display:inline-flex;vertical-align:-2px">${stateIconSvg(s)}</span>`;
    return `| ${dot} | \`${s}\` | ${RUN_STATUS_MEANING[s]} |`;
  }).join('\n');
  return `| | Status | On a run it means |\n|---|---|---|\n${rows}`;
}

/** What each run status asserts. Deliberately about whether the agent
 *  FINISHED, never about whether the news was good. */
const RUN_STATUS_MEANING: Record<RunStatus, string> = {
  open: 'Scaffolded, not started.',
  'in-progress': 'Running now.',
  'input-needed': 'Stopped on a question — asked inline, where a fresh session will see it.',
  done: '**The agent finished its assignment.** What it *concluded* is prose in `# Outcome` — an audit that completed and found five defects is `done`, not `dropped`.',
  dropped: 'The agent did **not** finish: crashed, refused, or was superseded.',
};

/** Inline type glyph (diagram / artifact) for legend prose. */
function typeGlyph(type: string): string {
  const icon = fileTypeIcon(type);
  return icon ? `<span style="display:inline-flex;vertical-align:-1px">${icon.svg}</span>` : '';
}

function guideMarkdown(
  kinds: Record<string, AgentLogKind>,
  statusColors: Record<IssueStatus, string>,
): string {
  return `# Issue anatomy

An issue is one folder — one coherent unit of *thinking + execution*.

**Every section has ONE purpose, and no file stores a fact another file owns.**

| Section | What it is for | In a word |
|---|---|---|
| **Overview** | \`issue.md\` + \`settings.json\` — the problem and its metadata | the issue |
| **Brainstorm** | Initial ideation, and the iterating that follows it | thinking |
| **Notes** | Finalization — what is settled and binding | conclusions |
| **Plans** | Grouping, structuring, and the order of execution | order |
| **Subtasks** | Actionable items, their detail, and links to the notes that scope them | scope |
| **Agent log** | Where a run is carried out, and where its outcome is recorded | execution + outcome |
| **Agent memory** | What is worth remembering across this issue | memory |
| **Comments** | That something happened, and when | events |

- Use whichever sections fit the work — there's **no required order**.
- Sections below are explained **most-complex-first**, not in workflow order.
- **The routing test for any sentence: which of those purposes is it?** One → that's
  its home. Two → you're about to write it twice.
- Issue-specific terms + colour conventions → this issue's **Glossary** panel
  (author markdown; suggested sections: *Colour legend* · *Key terms* · *Conventions* —
  tables and pointers over paragraphs).
- **Reference by LINK, never by number.** One file refers to another with a markdown
  link whose text says what the target *is* — \`[the version bump](../050_version-bump.md)\`,
  never \`\\\`050\\\`\`. Prefixes are gap-spaced so files can be inserted between them, and
  \`agent-ks move\` rewrites real links when a file moves; a backticked number is prose
  to every tool that exists, so it breaks silently and reports nothing.
- **To keep the number too, open the link text with the target's ORDERING PATH** —
  \`[040/100 the migration script](…/subtasks/040_execution/100_migration-script.md)\`.
  The sidebar lists entries by number, so the label is what lets you match a link
  against what is already on screen. Optional; \`agent-ks move\` recomputes it and the
  validator warns when one has drifted.

**When does a thought earn an issue?** Litmus test: you can name its component and
its first subtask in one breath. Otherwise it's a **subtask** on an existing issue
(one-prompt fixes always), a **brainstorm entry** in the issue it informs
(deliberation never opens its own issue), or a **dump entry** (an \`issue-dump\`
issue; graduated entries are promoted to real issues and *deleted*, never ticked).
**No record for small work** — a one-line change earns neither a subtask nor an agent
log; group it against the larger block it belongs to.

The four boundaries that get crossed most: **a subtask defines the work, the agent log
carries it out** · the plan owns **order**, the subtask owns **what the work is** · a
note states the **conclusion**, the subtask states **what to do about it** ·
deliberation stays in Brainstorm, only the conclusion graduates.

The ideal shape at a glance:

\`\`\`
YYYY-MM-DD-<slug>/                    ← the issue folder
├── issue.md                          ← the body (free-form)
├── settings.json                     ← metadata + vocabulary picks
├── glossary.md                       ← optional per-issue glossary
├── comments/
│   └── 001_opened.md                 ← NNN = the comment id · author/date frontmatter
├── brainstorm/
│   ├── 01_research_prior-art.md      ← NN_<kind>_<slug>.md — full-word kind, optional
│   └── 02_options/…                  ← folder = one multi-file brainstorm
├── notes/
│   └── 01_decided-architecture.md    ← plain NN_<slug>.md — curated order
├── plans/
│   └── 01_ship-the-decoder/          ← one plan — ORDER lives here, nowhere else
│       ├── settings.json             ← title + status
│       ├── overview.md               ← reserved — the intro, never a stage
│       └── 10_decoder-swap.md        ← a stage; the prefix is order AND id
├── subtasks/
│   ├── 01_setup.md                   ← title + status frontmatter
│   └── 02_build/…                    ← group folder — an AREA, not a phase
├── agent-log/
│   └── 010_lp_implement-x/           ← NNN_<code>_<name>/ — one run, one goal
│       ├── settings.json             ← optional {"status": "…"} — colours the symbol
│       ├── 01_summary.md             ← the one conclusive file, and the brief
│       ├── 02_working/010_round.md   ← first 2 digits = iteration, last = file in it
│       ├── 03_debrief/01_handover.md ← what leaves the run
│       └── 100_wf_sub-goal/          ← a child agent log — prefix ≥ 100, same shape
└── agent-memory/
    ├── memory.md                     ← pinned index — read this first
    └── gotchas.md                    ← topic files, edited in place
\`\`\`

## Agent log

Where a run is carried out, and where its outcome is recorded. **Execution, not scope.**

- **An agent log opens when work is delegated, or when it runs over multiple rounds.**
  Nothing else opens one.
- One folder per run: \`NNN_<code>_<name>/\` — \`NNN\` orders (2–5 digits, by value) ·
  \`<code>\` is the **kind** · \`<name>\` describes.
- Kinds available **in this issue** (symbol shows on the folder row):

${kindsTable(kinds)}

- Add custom kinds in \`settings.json\` — merged over the defaults above:
  \`"agentLogKinds": { "ex": { "name": "experiment", "icon": "flask", "desc": "…" } }\`
- **\`settings.json\`** — optional, per folder: \`{"status": "…"}\`, which **colours the
  kind symbol**. Same vocabulary as everything else, minus \`blocked\`/\`review\` —
  both describe a work item, not a run. Not inherited, so a child may be \`done\`
  inside a parent still \`in-progress\`. **Absent renders a defined grey**, which is
  deliberately distinct from \`open\`: never declared and declared-not-started are
  different facts.

${runStatusTable(statusColors)}
- **The three slots are numbered** — \`01_summary.md\`, \`02_working/\`,
  \`03_debrief/\` — because that is the order they are meant to be read in, and the
  filename is where every other section states its order.
- **\`01_summary.md\`** — required, and the one conclusive file. Five \`#\` sections, in
  order: **State** (live, and written as a callout — where the run is right now) ·
  **Goal** (purpose and trigger) · **Todo** (headed by its references; every item a
  markdown **link**, never a bare number, each carrying a line of what it did) ·
  **Out of Scope** (optional) · **Outcome** (a detail area — point at the iteration
  file rather than re-narrating it). It **is** the brief you point a delegated
  agent at.
- **\`02_working/\`** — one file per **iteration**, plus a file for each agent that
  produced something substantial. An iteration is a **group** — of subtasks, of
  executions, of agents — never one agent and never one subtask.
  - Numbering \`NNN_<name>.md\`: **first two digits = the iteration, last digit =
    which file within it** (\`0\` = the iteration file, \`1\`–\`9\` = producers).
  - **A file exists because something was produced, not because an agent ran.**
  - Flat. A folder only when one producer makes several artifacts.
- **\`03_debrief/\`** — what leaves the run: handover, questions, findings, lessons,
  caveats. Written when noticed, not only at the end. No slot is required to exist.
- **A child agent log** is any nested folder whose prefix is **≥ 100** —
  \`100_wf_<name>/\`, \`210_au_<name>/\` — same shape, recursively. The rule for
  *whether* to open one: **does it have its own goal?** Yes → child log. No → an
  iteration file.
- **Slot or child is arithmetic, not a name list.** Prefix under 100 → one of the
  run's own slots; 100 and up → a child activity. So a fourth slot is just \`04_\`,
  and nothing forbids a child being *called* \`working\` any more.
- Iteration-file frontmatter, and its four-section head:

| Field | Meaning |
|---|---|
| \`title\` | Display title. |
| \`status\` | The five that mean something for a run. **Tints this file's prefix number** — the round-level signal, where the folder's dot is the run-level one. \`done\` means the agent finished; what it *concluded* is prose in \`# Outcome\`. Absent = untinted, which is distinct from \`open\`. |
| \`agent\` | Who wrote it. For an external tool, name the **tool**. |
| \`date\` | Optional — when it landed. |

  The head is \`# Goal\` · \`# Inputs\` · \`# Expected Outcome\` · \`# Outcome\`. The
  first three are the work order, written when the file is created; the last is
  filled when the round lands.
- **A round that did NOT land carries two signals, and needs both.**
  \`status: dropped\` tints the number — scannable, but it says only that the run
  did not deliver. A \`> [!WARNING]\` callout in \`# Outcome\` says *what* failed and
  what it cost. A bare \`dropped\` compresses that into a word which reads as if it
  already told you. \`agent-ks check issues\` warns when one is missing.
- **Thin but complete** — issues found get one line each plus a pointer, never the
  write-up in place. A file is complete because of what it points at.

## Plans

**Order.** A plan is a schedule: what runs when, what blocks what, and the scope of
this round. Everything else about the work lives in the subtasks its stages reference.

- One plan per folder: \`plans/NN_<name>/\` with \`settings.json\` (title + status),
  a reserved \`overview.md\`, and \`NN_<stage>.md\` stage files.
- **The prefix is both the order and the id** — "stage 20". Gap-spaced by ten;
  inserting **spreads into the gap** rather than filling from one end.
- **A plan stores no status of its own about the work.** A stage *references* its
  subtasks; the renderer resolves them and pulls their live status, so a plan cannot
  show a state the work has moved on from — it stores none.
- **The active plan is derived, never stored:** the highest-numbered plan that is not
  \`done\`/\`dropped\`. The sidebar **marks it in bold rather than moving it** — rows read
  \`<status icon> NN <name>\` in plain ascending order.
- A stage file has no \`# H1\` — the heading is generated. Its frontmatter:

| Field | Meaning |
|---|---|
| \`title\` | Stage name; the heading renders as \`<prefix> <title>\`. |
| \`outcome\` | One line — what "done" means for this stage. |
| \`notes\` | One line — why it sits here, what it waits on, the caveat the other columns cannot say. |
| \`who\` | Who it waits on. |
| \`status\` | The canonical seven. A waiting stage is \`blocked\`, with what it waits on in one line of body. |
| \`subtasks:\` | Markdown links to the subtasks it schedules. **The only ref list** — rendered as a status-marked list under the stage. |

- \`outcome\` and \`notes\` render as **inline markdown**, so a link, \`code\` or an emoji
  in them works. A link is the right way to name another file from a note — a bare
  number or a path is not.
- The table columns are **# · Stage · Status · Who · Outcome · Notes**. There is no
  subtask *count*: the same subtasks are listed by name, with their live status, under
  the stage's own heading. A tally of things already shown one screen down is a second
  copy of one fact, and the copy is what goes stale.

- **The body is free-form prose.** \`## Todo\` and \`## Questions\` are conventional,
  not a schema: a stage may say why it sits where it does, what its status means in
  practice, what was tried, what it is really waiting on. Short, but as descriptive as
  the stage needs — the table row is a summary and the body is where the reasoning goes.
  Not every todo needs a subtask.
- **Link a run from the BODY, never frontmatter.** \`agent-logs:\` is retired
  (\`agent-ks check issues\` errors on it). Write
  \`[010/01 the section loop](../../agent-log/010_lp_implement-sections/01_summary.md)\` —
  the ordering label keeps the number, and \`agent-ks move\` rewrites it. Frontmatter
  answers one question, *which subtasks does this stage schedule?*; a second ref list
  made it read as the place for every link.
- **Closing a plan is yours** — it ends a *schedule*, not a sign-off on work. Write a
  \`## Closed\` section in \`overview.md\` (what shipped, **what was dropped and why**,
  the successor) and never edit it again. A closed plan is never deleted.

## Subtasks

**Scope** — the actionable item and the detail to execute it. A subtask defines the
work; the **agent log** carries it out; the **plan** says when it runs.

- One to-do per \`NN_<slug>.md\`.
- **Grouped by CATEGORY, never by order.** A group folder is an **area** of work — a
  noun. A number is a stable id and a sort key inside that area. **Neither implies
  sequence**, and the same subtask may be scheduled by several plans or by none.
- Group folders \`NN_<group>/\` — display title in their \`settings.json\`, sidebar
  shows a **done/total** count.
- Status is the shared lifecycle vocabulary (same as the issue) — **${STATUSES.length} statuses
  in ${CATEGORIES.length} categories**: ${lifecycleLine()}.
  Agents auto-set \`in-progress\`, hand off at \`review\` (or \`input-needed\` with the
  question inline); \`done\`/\`dropped\` are human-only. Terminal (done) = the Closed
  category. The UI filters by category; the badge shows the status.
- Status icons — shown on every subtask surface; hover any icon for its name:

${statusTable(statusColors)}

- Surfaces: sidebar tree · **Comprehensive** panel (all subtasks, one page) ·
  right-rail index · the overview progress bar.
- Frontmatter:

| Field | Meaning |
|---|---|
| \`title\` | Display title. |
| \`status\` | One of the 7 fixed statuses above (shared with issues). |

## Agent memory

**Memory** — what is worth remembering across this issue.

- \`memory.md\` is the **pinned index** — one line per topic; read it first. It
  **routes and stores nothing**; an index that grows a "current state" section
  competes with the plan and loses silently.
- Two lifecycle buckets you grow into: \`knowledge/\` (what is true and binding —
  corrected in place) and \`history/\` (how we got here — write-once). Most issues
  need only the index and a few topic files at its root.
- **Precedence when they disagree: \`knowledge/\` > \`history/\`**, and the loser gets
  corrected rather than left to contradict.
- Agent-managed and **always-on** — maintained during any work on the issue.
- **Belongs:** gotchas, environment quirks, dead ends ("this approach failed
  because…"), expensive-to-find pointers.
- **Doesn't:** the plan (that's Plans), decisions (those are Notes), or anything the
  repo, git history or notes already record — memory complements, never mirrors.
- **A superseded section is DELETED, not annotated as stale.** If it's worth keeping,
  it belongs in \`history/\`.

## Brainstorm

Active deliberation — the *process* of deciding what to do.

- Name files \`NN_<kind>_<slug>.md\` — the kind is a **full word**, and optional:
  \`research\` · \`explore\` · \`idea\` · \`discuss\` (open list — any word that fits).
- A folder = **one** multi-file brainstorm; a flat file = one thought.
- A **\`.html\` artifact** or diagram file dropped here renders **embedded** too
  (same first-class treatment as in **Notes**) — handy for a visual option-sketch.
- When resolved, mark it at the top — \`> **Resolved →** <target>\` — and distill
  the conclusion into **Notes**. The trail stays as the *why*.
- No machinery: no codes, no icons, no registration — just the naming convention.

## Notes

**Conclusions** — what is settled and binding, plus the reference material a decision
rests on. A note states the conclusion and the one clause of *why*; it does not carry
the deliberation that produced it (Brainstorm) or the steps that act on it (Subtasks).
**A note that reads like a work order is a subtask.**

- Plain \`NN_<slug>.md\` — the numbering is the author's **curated reading
  order**, not a timeline.
- A **\`.html\` artifact** — or a diagram file (\`.excalidraw\`/\`.mmd\`/…) —
  dropped here renders **embedded** as a first-class sub-doc: the artifact
  shows in an iframe with an open-full-page link (the same treatment docs
  sections give it), and an optional \`<name>.meta.json\` sidecar sets its title.
- Non-markdown sub-docs carry a trailing **type glyph** in the sidebar —
  ${typeGlyph('diagram')} diagram · ${typeGlyph('artifact')} artifact — hover
  names the type. Markdown is the default and stays unmarked.
- Content arrives by **graduation** from a resolved brainstorm, or fully formed
  (references, how-tos, link dumps).
- Should be **stable** — a note that keeps changing is a brainstorm wearing the
  wrong hat.

## Comments

The lean, **flat** evolution log — a changelog for the issue, not a forum.

- One file per comment: \`NNN_<slug>.md\` — the 3-digit sequence **is** the id.
- Records *that* something happened (status shifts, hand-offs) — never the
  debate that produced it (that's Brainstorm).
- Append-only in practice: comments record history, so no renumbering.
- Frontmatter:

| Field | Meaning |
|---|---|
| \`author\` | Who wrote it. |
| \`date\` | When. |

## Issue

The two root artifacts — together they are the Overview page.

- \`issue.md\` — the free-form body; the overview page's **only** content.
- \`settings.json\` — the metadata: \`title\`, \`description\`, \`status\`,
  \`priority\`, \`component\`, \`labels\`, \`author\`, \`assignees\` (values from
  the tracker's root vocabulary), plus the optional \`agentLogKinds\`.
- \`created\` comes from the folder slug; \`updated\` from git history —
  neither is a field, so neither can drift.
- Cross-cutting: any subdoc file may carry \`color:\` frontmatter that tints its
  sidebar label — no framework meaning, so document your colours in the
  **Glossary**.

> **Superseded wording is deleted, never kept.** Correct in place; no struck-through
> text, no "this previously said…". Where the history matters it belongs to the
> tracker — the issue that made the change — never to the file being corrected.
>
> For the full operating manual — the worked examples, the explicit-save rules, the
> CLI recipes — see the **agent-ks-issues** skill.
`;
}

/** Build the Guide panel for one issue: rendered HTML with id-stamped \`h2\`s,
 *  plus the heading list for the right-rail TOC.
 *
 *  `statusColors` is the tracker's resolved palette, passed in rather than
 *  imported so the legend shows what THIS tracker actually renders, overrides
 *  included. */
export function buildIssueGuide(
  kinds: Record<string, AgentLogKind>,
  statusColors: Record<IssueStatus, string>,
): IssueGuide {
  const headings: GuideHeading[] = [];
  const html = renderMarkdown(guideMarkdown(kinds, statusColors)).replace(
    /<h2>([\s\S]*?)<\/h2>/g,
    (_m, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').trim();
      const slug = `guide-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
      headings.push({ slug, text });
      return `<h2 id="${slug}">${inner}</h2>`;
    },
  );
  return { html, headings };
}
