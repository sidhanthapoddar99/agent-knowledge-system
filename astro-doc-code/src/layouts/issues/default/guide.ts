/**
 * guide.ts — the framework-bundled "issue anatomy" guide.
 *
 * Rendered on every issue's **Guide** panel (see DetailBody.astro). This is the
 * plugin-independent twin of the `documentation-guide` skill's guide: a THIN
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
import { CATEGORIES, STATUSES, type AgentLogKind } from '@loaders/issues';
import { agentLogIcon } from './server/agent-log-icons';

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

function guideMarkdown(kinds: Record<string, AgentLogKind>): string {
  return `# Issue anatomy

An issue is one folder — one coherent unit of *thinking + execution*.

- Use whichever sections fit the work — there's **no required order**.
- Sections below are explained **most-complex-first**, not in workflow order.
- **Overview** — \`issue.md\` + \`settings.json\`: the problem and its metadata.
- **Comments** — the flat evolution log: what changed, hand-offs.
- **Brainstorm** — active deliberation: the *process* of deciding.
- **Notes** — finalized output + references: the *product*.
- **Subtasks** — the plan: to-dos with statuses.
- **Agent log** — the execution record: loops & workflows.
- **Agent memory** — the AI's issue-scoped working state.
- Issue-specific terms + colour conventions → this issue's **Glossary** panel
  (author markdown; suggested sections: *Colour legend* · *Key terms* · *Conventions* —
  tables and pointers over paragraphs).

**When does a thought earn an issue?** Litmus test: you can name its component and
its first subtask in one breath. Otherwise it's a **subtask** on an existing issue
(one-prompt fixes always), a **brainstorm entry** in the issue it informs
(deliberation never opens its own issue), or a **dump entry** (an \`issue-dump\`
issue; graduated entries are promoted to real issues and *deleted*, never ticked).
Routing between sections: thinking in motion → Brainstorm · thinking settled →
Notes · the plan → Subtasks · how it actually went → Agent log.

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
├── subtasks/
│   ├── 01_setup.md                   ← title + status frontmatter
│   └── 02_build/…                    ← group folder — shows done/total
├── agent-log/
│   └── 010_lp_implement-x/           ← NNN_<code>_<name>/ — code = kind
│       ├── 00_goal.md                ← pinned meta files (open set)
│       └── 101_milestone.md          ← MNN_ + iteration frontmatter → "#1"
└── agent-memory/
    ├── memory.md                     ← pinned index — read this first
    └── gotchas.md                    ← topic files, edited in place
\`\`\`

## Agent log

The execution record — autonomous loops & workflows for **long-running work**.

- One **activity folder** per run: \`NNN_<code>_<name>/\`.
  - \`NNN\` orders (2–5 digits, by value) · \`<code>\` is the **kind** · \`<name>\` describes.
- Kinds available **in this issue** (symbol shows on the folder row):

${kindsTable(kinds)}

- Add custom kinds in \`settings.json\` — merged over the defaults above:
  \`"agentLogKinds": { "ex": { "name": "experiment", "icon": "flask", "desc": "…" } }\`
- Inside an activity folder:
  - **Meta files first** — \`00_goal.md\`, \`01_summary.md\`, \`02_task_list.md\`.
    A standard-but-**open** set: add more \`0NN_\` files, omit what's not needed.
  - **Milestones** — \`MNN_<name>.md\` (M ≥ 1), shown as **#\\<iteration\\>**.
    A milestone is a substantial completed chunk (~3–6 per activity), not a step.
  - Keep **failed** milestones — they're signal.
- The \`#N\` badge is tinted by \`status\`: grey not-started · blue in-progress ·
  green success · red failed.
- Milestone frontmatter:

| Field | Meaning |
|---|---|
| \`iteration\` | Drives the \`#N\` badge and ordering — independent of the filename prefix. |
| \`status\` | \`not-started\` / \`in-progress\` / \`success\` / \`failed\` — tints the badge. |
| \`agent\` | Which agent ran the chunk. |
| \`date\` | When it landed. |

- A flat \`NNN_<name>.md\` at the root still renders (compatibility), but activity
  folders are the norm.

## Subtasks

The plan — the *what* (agent-log records the *how*).

- One to-do per \`NN_<slug>.md\`.
- Group folders \`NN_<group>/\` = plan chapters — display title in their
  \`settings.json\`, sidebar shows a **done/total** count.
- Status is the shared lifecycle vocabulary (same as the issue) — **${STATUSES.length} statuses
  in ${CATEGORIES.length} categories**: ${lifecycleLine()}.
  Agents auto-set \`in-progress\`, hand off at \`review\` (or \`input-needed\` with the
  question inline); \`done\`/\`dropped\` are human-only. Terminal (done) = the Closed
  category. The UI filters by category; the badge shows the status.
- Surfaces: sidebar tree · **Comprehensive** panel (all subtasks, one page) ·
  right-rail index · the overview progress bar.
- Frontmatter:

| Field | Meaning |
|---|---|
| \`title\` | Display title. |
| \`status\` | One of the 7 fixed statuses above (shared with issues). |

## Agent memory

AI-mutable working state — durable facts worth not rediscovering.

- \`memory.md\` is the **pinned index** — one line per topic; read it first.
- Topic files hold the facts (\`gotchas.md\`, \`decisions.md\`) — **edited in
  place**, not appended; wrong memories get corrected or removed.
- Agent-managed and **always-on** — maintained during any work on the issue.
- **Belongs:** gotchas, dead ends ("this approach failed because…"),
  expensive-to-find pointers, decisions not to re-litigate.
- **Doesn't:** anything the repo, git history, or notes already record —
  memory complements, never mirrors.

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

Finalized output + durable references — what we *know*.

- Plain \`NN_<slug>.md\` — the numbering is the author's **curated reading
  order**, not a timeline.
- A **\`.html\` artifact** — or a diagram file (\`.excalidraw\`/\`.mmd\`/…) —
  dropped here renders **embedded** as a first-class sub-doc: the artifact
  shows in an iframe with an open-full-page link (the same treatment docs
  sections give it), and an optional \`<name>.meta.json\` sidecar sets its title.
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

> For the full operating manual — when to log a milestone, the explicit-save
> rules, worked examples — see the **documentation-guide** skill.
`;
}

/** Build the Guide panel for one issue: rendered HTML with id-stamped \`h2\`s,
 *  plus the heading list for the right-rail TOC. */
export function buildIssueGuide(kinds: Record<string, AgentLogKind>): IssueGuide {
  const headings: GuideHeading[] = [];
  const html = renderMarkdown(guideMarkdown(kinds)).replace(
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
