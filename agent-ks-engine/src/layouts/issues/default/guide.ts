/**
 * guide.ts — the framework-bundled "issue anatomy" guide.
 *
 * Rendered on every issue's **Guide** panel (see DetailBody.astro). This is the
 * plugin-independent twin of the `agent-ks-issues` skill's guide: a THIN
 * legend (the map of what each section is), not the full operating manual.
 * The manual lives in the skill; keep this in sync with it at release time.
 *
 * Mostly a static template, with **generated islands** — content that varies
 * per issue (the effective agent-log kind set from `settings.json`) or is read
 * from code (the status vocabulary and colours). Written as a cheat sheet for
 * the human reader: short lines, plain words, sections in workflow order.
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
 * surface where the tint IS the signal had no legend. The full eight-status
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
  done: '**The agent finished its assignment.** What it *concluded* is prose in the file — an audit that completed and found five defects is `done`, not `dropped`.',
  dropped: 'The agent did **not** finish: it crashed, refused, or was called off. A run whose scope moved elsewhere is `dropped` too — `superseded` describes a work item, not a run.',
};

function guideMarkdown(
  kinds: Record<string, AgentLogKind>,
  statusColors: Record<IssueStatus, string>,
): string {
  return `# Issue anatomy

An issue is one folder. It holds one piece of work: the thinking and the doing.

**One rule holds it together: each fact has one home. Everything else links to it.**

| Section | Holds | In a word |
|---|---|---|
| **Issue** | the problem, and its metadata | the what |
| **Brainstorm** | scratch: options, research, dead ends | thinking |
| **Notes** | what is settled | conclusions |
| **Plans** | which stage runs when, what blocks what | order |
| **Subtasks** | one job each: what to do, done when, what came out, decisions | the job |
| **Agent log** | the working folder of a long run: reports, findings, handover | the path |
| **Agent memory** | what an agent must remember about this issue | memory |
| **Comments** | that something happened, and when | events |

Use the sections you need. There is no required order.

Before you write a line, ask: which section owns it? One answer: write it there.
Two answers: you are about to write it twice. Link instead.

The four lines people cross most:

- **The subtask holds the outcome. The log holds the path.**
- **The plan owns order. The subtask owns what the work is.**
- **A note states the conclusion. The subtask says what to do about it.**
- **Deliberation stays in Brainstorm. Only the conclusion moves to Notes.**

\`\`\`
YYYY-MM-DD-<slug>/
├── issue.md                      the problem
├── settings.json                 title, status, priority, component, labels
├── glossary.md                   optional: colour legend, terms
├── comments/001_opened.md        the CLI numbers them
├── brainstorm/01_options.md      a file, or a folder for a long thread
├── notes/01_decided-shape.md
├── plans/01_ship-it/
│   ├── settings.json             title, status
│   ├── overview.md               the goal and the stage order
│   └── 10_first-stage.md         a stage; the number is its order
├── subtasks/
│   ├── 010_setup.md
│   └── 020_build/030_api.md      a group folder is an area, not a phase
├── agent-log/
│   └── 010_lp_ship-it/           one run: NNN_<kind>_<name>
│       ├── settings.json         { "status": "in-progress" }
│       ├── 00_index.md           read this first: goal, files, handover
│       ├── 10_findings.md
│       └── 120_au_api/           a run inside the run
└── agent-memory/
    └── memory.md                 read this first
\`\`\`

**Links.** Always a markdown link, relative to the file: \`[the version bump](../050_version-bump.md)\`.
Never a bare number, never a backticked path, never a leading \`/\`. Links survive a move; text does not.
To keep the number visible, start the link text with it: \`[040/100 the migration](…)\`.

**When does a thought earn an issue?** When you can name its component and its first
subtask in one breath. Otherwise it is a subtask on an existing issue, a brainstorm
entry there, or a line in the dump issue. A one-line change earns no record at all.

## Issue

- \`issue.md\` is the body: goal, context, what done looks like, what is in and out.
- \`settings.json\` is the metadata. Every value comes from the tracker's vocabulary.
- \`created\` comes from the folder name. \`updated\` comes from git. Neither is a field.
- A file may carry \`color:\` to tint its label. It means nothing to the framework. Say what it means in the Glossary.

## Brainstorm

- Scratch paper. Messy is fine. Options, research, dead ends.
- Name files \`NN_<kind>_<slug>.md\`. The kind is a plain word: \`research\`, \`idea\`, \`discuss\`. Optional.
- A folder is one long thread. An \`.html\` or diagram file renders here too.
- When it is settled, mark the top \`> **Resolved →** <target>\` and move the conclusion to Notes.

## Notes

- What is settled. A note states the conclusion and one clause of why.
- Stable. A note that keeps changing is a brainstorm. A note that reads like a work order is a subtask.
- An \`.html\` report or a diagram file lives here as a page of its own.

## Plans

- One folder per plan. \`overview.md\` is the goal and the stage order. \`NN_<stage>.md\` is a stage. The number is its order and its name: "stage 20". Gaps of ten, so a stage can go in between.
- A stage lists the subtasks it schedules in \`subtasks:\`, one link each. The page shows their live status. **A plan stores no status of the work.**
- A stage's body is the five-section template. Say why it sits here and what it waits on.
- The active plan is the highest-numbered one that is not closed. The sidebar shows it in bold.
- Closing a plan ends a schedule. Write what shipped and what was dropped in \`overview.md\` under \`02 Status and Result\`.

## Subtasks

- One job per \`NN_<slug>.md\`. Group folders are areas, not phases. Numbers are ids, not an order.
- Every subtask body has the same five sections:
  \`01 To Do\` (the list, then \`Guardrails\`, \`Questions\`, \`Done when\`) ·
  \`02 Status and Result\` (\`Result\`, and \`Agent log\`: \`none\` or one link) ·
  \`03 References\` · \`04 Decisions\` (one per point) ·
  \`05 Notes & Analysis\` (\`Issues hit\`, \`Watch out\`, other points).
- \`Guardrails\` are yours: the limits for this job. The agent reads them first and never edits them.
- \`Questions\` holds only what is still unanswered, and then the status is \`input-needed\`.
  An answer becomes a decision that says what was asked. The question is deleted. No open
  question, no section.
- ${STATUSES.length} statuses in ${CATEGORIES.length} groups: ${lifecycleLine()}.
- An agent sets \`in-progress\` when it starts and hands off at \`review\`, or \`input-needed\` with the question written in. \`done\` and \`dropped\` are yours.

${statusTable(statusColors)}

## Agent log

The working folder of one long run. It has two jobs, and only two.

1. **A human reads it later.** So it stays simple. \`00_index.md\` says in one screen what the run was for, what it made, and where it stands.
2. **It stores what is too big for anywhere else.** An audit with two hundred findings. A research pass over fifteen products. Things that would fall out of an agent's memory by the next session.

**Most work needs no log.** One agent, one session, one subtask: the result goes in the subtask. Open a log only when the work runs over days or across several agents, when a run makes files worth keeping, or when you ask for one.

**What never goes in a log.** The result, the decisions, the caveats: those go in the subtask. Order: the plan. A conclusion: Notes. A step-by-step story of the edits: nowhere, git has them. **A log never holds the only copy of a result.**

**Who opens one.** Loops and iterations: only when you ask. Audits, refactors, research: the agent opens one when the files are worth keeping, and tells you. Workflows: only inside a loop.

One folder per run: \`NNN_<kind>_<name>/\`. The kinds in this issue:

${kindsTable(kinds)}

Add your own in \`settings.json\`: \`"agentLogKinds": { "ex": { "name": "experiment", "icon": "flask" } }\`.

**What each kind holds.**

- \`lp\` loop: days of work on a plan. \`05_guidelines\`, \`10_findings\`, \`20_debrief\`, then the runs done inside it. The stages themselves are not files here.
- \`rf\` refactor: what moved where, what to watch out for.
- \`au\` audit: one file per reviewer, so no finding gets lost. The index holds the merged verdict.
- \`re\` research: one folder or file per segment. The summary goes to Notes. The bulk stays here.
- \`it\` iteration: the odds-and-ends folder. Pointers from a back-and-forth, benchmarks, scratch.
- \`wf\` workflow: rare. One file per stage, the data it hands to the next.

**The shape.** Every log has \`settings.json\` and \`00_index.md\`. The index lists every file below it and ends with the handover. A run done inside a run is a folder numbered \`120\` and up. Two levels deep is right. Three is the most. Keep files short: the index under 60 lines, anything else under 40. Nothing checks this. It is guidance.

**Status.** \`settings.json\` holds it. It says whether the agent finished, not whether the news was good.

${runStatusTable(statusColors)}

## Agent memory

- \`memory.md\` is the index. One line per topic file. Read it first.
- Holds what is true about this issue and easy to lose: quirks, dead ends, hard-won pointers.
- Does not hold the plan, decisions, or anything the repo or notes already say.
- Grow into \`knowledge/\` (what is true, corrected in place) and \`history/\` (how we got here, write once) only when the root gets crowded.
- A stale section is deleted, not marked stale.

## Comments

- One file per comment, \`NNN_<slug>.md\`. The number is the id.
- Two lines and a link: that something changed, and where to read about it. Never the debate.
- Append only. Never edit another author's comment.

> **Corrected text is replaced, not kept.** No struck-through lines, no "this used to say".
>
> The full manual: the **agent-ks-issues** skill. Agent logs: the **agent-ks-issue-logs** skill.
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
