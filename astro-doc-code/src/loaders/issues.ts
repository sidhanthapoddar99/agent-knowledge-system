/**
 * Issues Loader
 *
 * Folder-per-issue content loader. Each issue lives at
 *   <dataPath>/YYYY-MM-DD-<slug>/
 *     settings.json                            (metadata, required)
 *     issue.md                                 (body, required)
 *     comments/NNN_*.md                        (thread, optional)
 *     subtasks/<group>/…/*.md                  (checklist items, optional — nested tree)
 *     notes/<group>/…/*.md                      (supporting documents, optional — nested tree)
 *     agent-log/<group>/…/*.md                  (iterative AI agent notes, optional — nested tree)
 *     plans/NN_<name>/                          (schedules, optional — one folder per plan)
 *
 * `plans/` is the one section that is NOT a free-form nested tree: it holds plan
 * FOLDERS and nothing else, each exactly one level deep — `settings.json`, a
 * reserved `overview.md`, and `NN_<stage>.md` stage files. A plan stores no
 * status of its own about the work: its stages *reference* subtasks and the
 * renderer pulls their live status, so the plan cannot drift from reality.
 *
 * Subtasks, notes, and agent-log all support subfoldering up to
 * `MAX_SUBFOLDER_DEPTH` (5) levels deep — a hard cap. The recommended
 * convention is up to 3 levels; keep trees shallow where you can. For subtasks the
 * folder is a *grouping label only* — no folder body file; every leaf `.md` is
 * a first-class subtask with its own state, URL, and count. A folder may ship an
 * optional `settings.json` with at minimum a `title` field overriding the
 * slug-derived label. For notes and agent-log, folder + file names are freeform
 * (no `NNN_` prefix required; when present on agent-log files, the leading
 * number is still parsed as `sequence`). Anything nested deeper than the cap is
 * warned and ignored.
 *
 * The root <dataPath>/settings.json defines the tag vocabulary (status, priority,
 * component, labels, authors) — returned as `vocabulary`.
 *
 * Issue `updated` is derived from git history (most recent commit touching any
 * file under the issue folder) via `loaders/issue-dates.ts`. Falls back to
 * `created` when no git history is available. `created` is parsed from the
 * folder slug `YYYY-MM-DD-<slug>`.
 *
 * Draft handling matches loadContent(): per-issue `"draft": true` or root-level
 * `"draft": true` both filter out in production (via import.meta.env.PROD).
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createIssuesParser } from '../parsers/content-types/issues';
import { getIssueDate } from './issue-dates';
import { parseOrderPrefixLoose, MAX_SUBFOLDER_DEPTH } from '../parsers/core/order-prefix';
import { readSettings, statSettingsMtime, resolveSettingsPath } from './settings-file';
import { diagramContainerHtml, DIAGRAM_EXTENSIONS } from './diagram-pages';
import { artifactContainerHtml } from './artifact-pages';
import { SECTION_FOLDERS, sectionById } from './issue-sections';
import {
  type IssueStatus,
  type CategoryId,
  categoryOf,
  normalizeStatus,
  unknownStatusMessage,
  statusFieldForbiddenMessage,
  statusColorsForbiddenMessage,
  STATUS_CSS_VARS,
  STATUSES as STATUS_LIST,
} from './issue-status';

// Re-export the lifecycle vocabulary so layouts / server helpers can import it
// from the loader barrel as before.
export {
  STATUSES,
  RUN_STATUSES,
  CATEGORIES,
  STATUS_CSS_VARS,
  statusVar,
  STATUS_LABELS,
  STATUS_DESCRIPTIONS,
  CATEGORY_DESCRIPTIONS,
  TERMINAL_STATUSES,
  REVIEW_STATUSES,
  categoryOf,
  isValidStatus,
  isTerminalStatus,
  type IssueStatus,
  type CategoryId,
  type RunStatus,
} from './issue-status';

/** Re-exported from the shared `order-prefix` module — the single system-wide
 *  max nesting depth (issue folders + docs sidebar draw depth). Kept exported
 *  here so existing `@loaders/issues` importers (route-match, layouts) are
 *  unaffected. See its definition for the full contract. */
export { MAX_SUBFOLDER_DEPTH };

// The section registry is re-exported through the loader barrel so layouts and
// route code import sections from the same place they import everything else
// about an issue.
export {
  ISSUE_SECTIONS,
  SECTION_FOLDERS,
  SUBDOC_SECTIONS,
  FREEFORM_SECTIONS,
  sectionById,
  sectionForPanelKey,
  sectionPanelKey,
  type IssueSection,
} from './issue-sections';

export interface IssueMetadata {
  title: string;
  description?: string;
  /** Canonical lifecycle status (shared 7-value vocabulary with subtasks). */
  status: IssueStatus;
  priority: string;
  /** Multi-select. Stored as `string[]` in memory; settings.json may write
   *  either `"component": "x"` (legacy single) or `"component": ["x", "y"]`
   *  — the loader normalises both shapes. */
  component: string[];
  labels: string[];
  author: string;
  assignees: string[];
  draft?: boolean;
}

export interface IssueComment {
  /** e.g. "001_2026-04-17_sid" */
  name: string;
  /** e.g. 1 */
  sequence: number;
  /** e.g. "2026-04-17" */
  date: string | null;
  /** e.g. "sid" */
  author: string | null;
  /** rendered HTML */
  html: string;
  filePath: string;
}

export interface IssueNote {
  /** e.g. "design" (filename without extension) */
  name: string;
  filePath: string;
  relativePath: string;
  /** Folder segments below `notes/` — 0/1/2 entries.
   *  `[]` for top-level, `["design"]` for `notes/design/foo.md`,
   *  `["design", "phase-1"]` for `notes/design/phase-1/foo.md`. */
  groupPath: string[];
  /** Optional CSS color (named, hex, etc.) from frontmatter. Tints only
   *  the sidebar icon for this entry. User-defined semantics. */
  color: string | null;
  /** Which kind of source file backs this entry — drives the sidebar type
   *  marker and how the body renders. `markdown` renders parsed markdown;
   *  `diagram` and `artifact` render a by-reference embed container that the
   *  BaseLayout client scripts turn into a live render / iframe. `artifact`
   *  (a first-class `.html` file) is accepted in `notes/` and `brainstorm/`
   *  only. */
  docType: 'markdown' | 'diagram' | 'artifact';
  /** Rendered HTML */
  html: string;
}

export interface IssueAgentLog {
  /** Filename without extension, e.g. "001_initial-triage" or "triage" */
  name: string;
  /** Numeric prefix if filename starts with "NNN_", else the sort order.
   *  Sequence resets per subgroup folder (001, 002, … per leaf folder). */
  sequence: number;
  /** Frontmatter `agent` — which agent wrote this log */
  agent: string | null;
  /** Frontmatter `status` — free-form (in-progress / success / failed / …) */
  status: string | null;
  /** Frontmatter `date` */
  date: string | null;
  /** Folder segments below `agent-log/` — 0…MAX_SUBFOLDER_DEPTH entries. Same
   *  shape as IssueNote.groupPath. Anything deeper than the cap is warned + ignored. */
  groupPath: string[];
  filePath: string;
  /** Path relative to dataPath — includes the group folders when nested. */
  relativePath: string;
  /** Optional CSS color (named, hex, etc.) from frontmatter. Tints only
   *  the sidebar icon for this entry. User-defined semantics. */
  color: string | null;
  /** Rendered HTML of the body */
  html: string;
}

/**
 * One stage inside a plan — `plans/<plan>/NN_<name>.md`.
 *
 * The numeric prefix is BOTH the order and the id ("stage 20"), so it is never
 * repeated in frontmatter. Everything the stage says about the work it schedules
 * is a *reference*: `subtaskRefs` are issue-relative paths the renderer resolves
 * against the live subtask list, which is why a plan can never hold a stale
 * count.
 */
export interface IssuePlanStage {
  /** Filename without extension, e.g. "20_journal-compat". */
  name: string;
  /** Numeric prefix — the stage id AND its order. */
  sequence: number | null;
  /** Display title (frontmatter `title`, else slug-derived). */
  title: string;
  /** One-line `outcome:` — what "done" means for this stage. */
  outcome: string | null;
  /** `who:` — who the stage waits on. */
  who: string | null;
  status: IssueStatus;
  category: CategoryId;
  /** `subtasks:` entries resolved to ISSUE-relative posix paths
   *  (`subtasks/16_slide-type/80_mandatory-catalog.md`). Entries that point
   *  outside the issue, or carry no parsable target, land in
   *  {@link unresolvedRefs} instead — never silently dropped, because a
   *  dropped ref would under-count the stage and read as a real number. */
  subtaskRefs: string[];
  /** `agent-logs:` entries, same resolution. */
  agentLogRefs: string[];
  /** Raw entries whose target could not be parsed or fell outside the issue.
   *  Rendered visibly and errored by `agent-ks check issues`. */
  unresolvedRefs: string[];
  /** Heading anchor — slugified from the TITLE, never the prefix, so that
   *  renumbering a stage (a `move`, which rewrites paths but not anchors)
   *  cannot silently break inbound links. */
  anchor: string;
  filePath: string;
  relativePath: string;
  html: string;
}

/**
 * One plan — a folder under `plans/`. A plan is a *schedule*: order, blocking,
 * current focus, and the scope of this round of work. Which plan is ACTIVE is
 * derived at render (highest-numbered, not `done`/`dropped`), never stored.
 */
export interface IssuePlan {
  /** Folder name, e.g. "01_decoder-and-retention" — the plan's id. */
  name: string;
  sequence: number | null;
  /** Display title (folder `settings.json` `title`, else slug-derived). */
  title: string;
  status: IssueStatus;
  category: CategoryId;
  /** Rendered `overview.md` — the plan's intro. Null when the file is absent. */
  overviewHtml: string | null;
  /** Stages in prefix order. */
  stages: IssuePlanStage[];
  folderPath: string;
  /** Path relative to dataPath. */
  relativePath: string;
}

/** @deprecated Use `IssueStatus`. Retained as an alias while call-sites migrate. */
export type SubtaskState = IssueStatus;

export interface IssueSubtask {
  /** Filename without extension, used as stable id within the issue */
  slug: string;
  /** Numeric prefix parsed from slug (e.g. "01_foo" → 1). null when absent. */
  sequence: number | null;
  /** Display title (from frontmatter `title`, or derived from slug) */
  title: string;
  /** Canonical lifecycle status (shared 7-value vocabulary with issues).
   *  Read from frontmatter `status:` (legacy `state:` still tolerated with a
   *  warning). Defaults to `open` when absent. */
  status: IssueStatus;
  /** Category the status rolls up to (derived, never stored on disk). */
  category: CategoryId;
  /** Folder segments below `subtasks/` — 0/1/2 entries.
   *  `[]` for top-level, `["02_impl"]` for `subtasks/02_impl/01_foo.md`,
   *  `["02_impl", "03_polish"]` for `subtasks/02_impl/03_polish/01_foo.md`. */
  groupPath: string[];
  /** Absolute path — used by the toggle endpoint */
  filePath: string;
  /** Relative path from dataPath — safer wire format */
  relativePath: string;
  /** Rendered HTML of the body (markdown below the frontmatter) */
  html: string;
}

/**
 * One folder under `agent-log/` — an agent log, a child agent log, a reserved
 * `working/` / `debrief/` folder, or a plain grouping label.
 *
 * Folder-level metadata lives here rather than on {@link IssueAgentLog}, which
 * is per FILE. Mirrors {@link SubtaskGroupMeta}, the existing pattern for
 * "things a folder knows about itself".
 */
export interface AgentLogGroupMeta {
  /** Folder segments below `agent-log/` — 1…MAX_SUBFOLDER_DEPTH entries. */
  groupPath: string[];
  /**
   * Status from the folder's optional `settings.json`.
   *
   * **`null` when the file is absent, and that must stay representable.** An
   * agent log with no status renders a *defined* grey, which is deliberately
   * distinct from `open` — defaulting to `open` at read time would assert
   * something the folder never said.
   */
  status: IssueStatus | null;
  /** True for the reserved `working/` and `debrief/` names, which are parts of
   *  an agent log rather than agent logs of their own. */
  reserved: boolean;
}

/**
 * One folder under `subtasks/` (or a nested folder) — the metadata needed to
 * render a labelled section in the sidebar. Group has no body file; only
 * leaf `.md` files are subtasks.
 */
export interface SubtaskGroupMeta {
  /** Folder segments from `subtasks/` to this group — 1 or 2 entries. */
  groupPath: string[];
  /** Numeric prefix parsed from the deepest folder name, e.g. "02_impl" → 2. */
  sequence: number | null;
  /** Display label (folder `settings.json` `title` overrides; else slug-derived). */
  title: string;
}

/** An agent-log kind: a display name plus an icon-name from the symbol palette
 *  (see `layouts/issues/default/server/agent-log-icons.ts`). `desc` feeds the
 *  generated kinds table on the Guide panel. */
export interface AgentLogKind {
  name: string;
  icon: string;
  desc?: string;
}

/** Framework-default agent-log kinds (code → {name, icon, desc}). An issue's
 *  `settings.json` `agentLogKinds` merges on top (adds / overrides). */
export const DEFAULT_AGENT_LOG_KINDS: Record<string, AgentLogKind> = {
  lp: { name: 'loop', icon: 'repeat', desc: 'Autonomous multi-iteration runs toward one goal.' },
  au: { name: 'audit', icon: 'search', desc: 'Systematic review / inspection sweeps.' },
  rf: { name: 'refactor', icon: 'wrench', desc: 'Structural rework with no behaviour change.' },
  it: { name: 'iteration', icon: 'refresh-cw', desc: 'Rapid ad-hoc change bursts.' },
  wf: { name: 'workflow', icon: 'git-branch', desc: 'Multi-stage orchestrated pipelines.' },
};

export interface Issue {
  /** Folder name, e.g. "2026-04-17-editor-performance" — the canonical id */
  id: string;
  /** Creation date from folder prefix (YYYY-MM-DD) */
  created: string;
  /** Most recent git commit date touching any file in the issue folder.
   *  ISO 8601 (author date). Falls back to `created` when no git history. */
  updated: string;
  /** Slug portion of folder name */
  slug: string;
  /** Absolute path to the issue folder */
  folderPath: string;
  /** Metadata from settings.json */
  meta: IssueMetadata;
  /** Rendered HTML of issue.md */
  html: string;
  /** Rendered HTML of the optional per-issue `glossary.md`, or null when the
   *  file is absent. Powers the Glossary panel (semantics / key terms / any
   *  colour conventions this issue uses). */
  glossaryHtml: string | null;
  /** Sorted comments (by filename) */
  comments: IssueComment[];
  /** Subtasks (sorted by filename, recursive — leaves at all depths) */
  subtasks: IssueSubtask[];
  /** Group folders under `subtasks/`. Used to label nested sections in the UI. */
  subtaskGroups: SubtaskGroupMeta[];
  /** Notes — finalized supporting markdown docs under notes/ */
  notes: IssueNote[];
  /** Brainstorm — active deliberation / research / exploration under brainstorm/.
   *  Same free-form, nested shape as notes (up to MAX_SUBFOLDER_DEPTH). */
  brainstorm: IssueNote[];
  /** Agent memory — AI-mutable working state under agent-memory/.
   *  Same free-form, nested shape as notes (up to MAX_SUBFOLDER_DEPTH). */
  agentMemory: IssueNote[];
  /** Plans — schedules under plans/, one folder each, in prefix order. */
  plans: IssuePlan[];
  /** Agent logs — iterative AI execution notes under agent-log/ */
  agentLogs: IssueAgentLog[];
  /** Folders under `agent-log/`, with each one's optional status. */
  agentLogGroups: AgentLogGroupMeta[];
  /** Effective agent-log kind map (code → {name, icon}): framework defaults
   *  merged with the issue's settings.json `agentLogKinds`. */
  agentLogKinds: Record<string, AgentLogKind>;
}

export interface IssuesVocabularyField {
  values: string[];
  colors?: Record<string, string>;
  /** Per-value human meaning, keyed by value. Rendered in the tracker Guide
   *  modal. Required for `component` and `labels` (a value without a meaning is
   *  a hole in the guide); optional for `priority`. Kept as a parallel map so
   *  `values` stays a plain `string[]` for filters/ordering. */
  descriptions?: Record<string, string>;
}

export interface IssuesPresetView {
  name: string;
  filters?: Record<string, string[]>;
  state?: string;
  group?: string;
  search?: string;
  sort?: string;
  dir?: 'asc' | 'desc';
}

export interface IssuesVocabulary {
  label?: string;
  draft?: boolean;
  fields: Record<string, IssuesVocabularyField>;
  authors?: string[];
  /** Preset views defined in root settings.json — subtask 13 */
  views?: IssuesPresetView[];
  /** Per-tracker status-colour overrides (colours-only — the statuses
   *  themselves are fixed in code). Keys must be a subset of the seven
   *  statuses; a key outside the vocabulary is a hard error. */
  statusColors?: Record<string, string>;
}

export interface LoadedIssues {
  vocabulary: IssuesVocabulary;
  /** Root-level draft flag — if true, the whole tracker is dev-only */
  rootDraft: boolean;
  /** Resolved seven-status colour map: framework defaults merged with the
   *  tracker's `statusColors` overrides. The single place any surface (badges,
   *  the Guide modal) should read status colours from. */
  statusColors: Record<IssueStatus, string>;
  issues: Issue[];
}

const FOLDER_PATTERN = /^(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9-]*)$/;
const COMMENT_PATTERN = /^(\d+)_(\d{4}-\d{2}-\d{2})_([a-z0-9-]+)\.md$/i;

// ============================================================================
// In-memory cache (dev-server process lifetime)
// Invalidated when the signature — a summed mtime over every tracked file —
// changes. Scan is O(N_files) stat calls; ~sub-ms for ~100 issues and cheap
// enough to run per request.
// ============================================================================

interface CacheEntry {
  signature: number;
  data: LoadedIssues;
}
const cache = new Map<string, CacheEntry>();

function statMtime(p: string): number {
  try {
    return fs.statSync(p).mtimeMs;
  } catch {
    return 0;
  }
}

/** Files whose mtime feeds the issues cache signature — markdown, first-class
 *  diagram files, and first-class `.html` artifacts plus their optional
 *  `.meta.json` / `.meta.jsonc` sidecars (so a sidecar-only title edit still
 *  busts the cache). notes/brainstorm accept all of these. */
function isTrackedDocFile(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.endsWith('.md') ||
    lower.endsWith('.html') ||
    lower.endsWith('.meta.json') ||
    lower.endsWith('.meta.jsonc') ||
    DIAGRAM_EXTENSIONS.some((ext) => lower.endsWith(ext))
  );
}

function computeSignature(dataPath: string): number {
  let sig = statSettingsMtime(dataPath);
  sig += statMtime(dataPath); // folder listing changes

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dataPath, { withFileTypes: true });
  } catch {
    return sig;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || !FOLDER_PATTERN.test(entry.name)) continue;
    const folder = path.join(dataPath, entry.name);
    sig += statMtime(folder);
    sig += statSettingsMtime(folder);
    sig += statMtime(path.join(folder, 'issue.md'));
    sig += statMtime(path.join(folder, 'glossary.md'));

    for (const sub of SECTION_FOLDERS) {
      const subDir = path.join(folder, sub);
      sig += statMtime(subDir);
      // Nesting is a per-section fact declared in the registry — `comments` is
      // flat, `plans` has its own fixed two-level shape. Walk what the section
      // actually supports so a deep edit still busts the cache.
      const allowsNesting = sectionById(sub)?.nested ?? true;
      const walkSig = (absDir: string, depth: number): void => {
        let items: fs.Dirent[];
        try { items = fs.readdirSync(absDir, { withFileTypes: true }); }
        catch { return; /* dir absent / empty */ }
        for (const item of items) {
          const abs = path.join(absDir, item.name);
          if (item.isFile() && isTrackedDocFile(item.name)) {
            sig += statMtime(abs);
          } else if (item.isDirectory() && allowsNesting && depth < MAX_SUBFOLDER_DEPTH) {
            sig += statMtime(abs);
            // Folder-level settings.json (grouping folders may carry one).
            sig += statSettingsMtime(abs);
            walkSig(abs, depth + 1);
          }
        }
      };
      walkSig(subDir, 0);
    }
  }

  return sig;
}

/** Invalidate the in-memory issues cache for a given dataPath (or all paths if omitted). */
export function invalidateIssuesCache(dataPath?: string): void {
  if (dataPath) cache.delete(dataPath);
  else cache.clear();
}

function normalizeComponent(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((v): v is string => typeof v === 'string' && v.length > 0);
  if (typeof raw === 'string' && raw.length > 0) return [raw];
  return [];
}

/**
 * Resolve a raw lifecycle value (issue `status` or subtask `status`/`state`)
 * to a canonical status. Legacy values (`closed`/`cancelled`) are mapped with a
 * one-line warning nudging migration; a value that is neither canonical nor
 * legacy throws the hard, copy-pasteable "unknown status" error — statuses are
 * fixed by the framework and cannot be invented per-tracker.
 */
function resolveStatus(raw: unknown, fileHint: string): IssueStatus {
  const resolved = normalizeStatus(raw);
  if (!resolved) {
    throw new Error(unknownStatusMessage(String(raw), fileHint));
  }
  if (resolved.legacy) {
    console.warn(
      `[issues] "${fileHint}" uses legacy status "${String(raw)}" → mapped to "${resolved.status}". Run the state→status migration to update it in place.`,
    );
  }
  return resolved.status;
}

/** Read a settings file, preferring a sibling `.jsonc` (comments/trailing commas). */
function readJson<T>(filePath: string): T | null {
  return readSettings<T>(filePath);
}

/** Normalize a frontmatter `date` value to a YYYY-MM-DD string. YAML parses an
 *  unquoted `date: 2026-07-03` into a JS Date (UTC midnight), so format via
 *  toISOString — local-time formatting would shift the day in UTC-negative zones. */
function fmDateString(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) return value;
  if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return null;
}

/** Hard-error message when a `component`/`labels` value lacks a description.
 *  Descriptions are human-authored meaning surfaced in the tracker Guide, so a
 *  missing one is a hole we refuse to render silently. */
function missingDescriptionsMessage(
  field: string,
  missing: string[],
  fileHint: string,
): string {
  return [
    `[issues] "${fileHint}" — every \`${field}\` value must declare a description`,
    `(these are rendered in the tracker Guide). Missing for: ${missing.join(', ')}.`,
    `Fix: add a \`descriptions\` map alongside \`values\` under \`fields.${field}\`, e.g.`,
    `  "${field}": { "values": [...], "descriptions": { "${missing[0]}": "what it means" } }`,
    `See the migration script`,
    `(migration/0.1.2_root-settings-schema.py).`,
  ].join('\n');
}

/**
 * Validate the tracker-root vocabulary and resolve its derived data. Run once
 * per load, before any issue is read, so a malformed root settings file fails
 * loudly and early:
 *  - a per-tracker `fields.status` block is rejected (statuses are code-fixed;
 *    only colours are overridable, under a top-level `statusColors` map);
 *  - `statusColors` is validated against the fixed vocabulary and merged onto
 *    the framework defaults;
 *  - every `component` and `labels` value must carry a description;
 *  - an in-memory `fields.status` (fixed values + resolved colours) is
 *    synthesised so existing badge layouts keep reading `fields.status.colors`
 *    unchanged — this is never written back to disk.
 * Mutates `vocabulary.fields` in place; returns the resolved colour map.
 */
function resolveVocabulary(
  vocabulary: IssuesVocabulary,
  fileHint: string,
): Record<IssueStatus, string> {
  const fields = vocabulary.fields ?? (vocabulary.fields = {});

  if (fields.status) {
    throw new Error(statusFieldForbiddenMessage(fileHint));
  }

  // Colours are theme CSS variables, not settings. A leftover `statusColors`
  // block is rejected rather than ignored: an override that silently stops
  // applying shows up weeks later as "the colours look wrong somehow", with
  // nothing pointing at the cause.
  if (vocabulary.statusColors) {
    throw new Error(statusColorsForbiddenMessage(fileHint));
  }

  const statusColors = STATUS_CSS_VARS;

  for (const field of ['component', 'labels'] as const) {
    const def = fields[field];
    if (!def || !Array.isArray(def.values) || def.values.length === 0) continue;
    const descriptions = def.descriptions ?? {};
    const missing = def.values.filter(
      (v) => typeof descriptions[v] !== 'string' || descriptions[v].trim() === '',
    );
    if (missing.length > 0) {
      throw new Error(missingDescriptionsMessage(field, missing, fileHint));
    }
  }

  // Synthesised from the code constant — layouts read this; disk never carries it.
  fields.status = { values: [...STATUS_LIST], colors: statusColors };

  return statusColors;
}

// Single shared parser — initialized lazily
let parser: ReturnType<typeof createIssuesParser> | null = null;
function getParser() {
  if (!parser) parser = createIssuesParser();
  return parser;
}

async function renderMarkdown(filePath: string, basePath: string): Promise<string> {
  const parsed = await getParser().parse(filePath, basePath);
  return parsed?.content ?? '';
}

function readComments(commentsDir: string): IssueComment[] {
  if (!fs.existsSync(commentsDir)) return [];
  const entries = fs.readdirSync(commentsDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => e.name)
    .sort();
  return files.map((name) => {
    const abs = path.join(commentsDir, name);
    const strict = name.match(COMMENT_PATTERN);
    let sequence = strict ? parseInt(strict[1], 10) : 0;
    let date: string | null = strict ? strict[2] : null;
    let author: string | null = strict ? strict[3] : null;

    // Comments often use the looser `NNN_<slug>.md` shape (especially when
    // authored by an agent — slugs read better than dates+authors). When
    // the strict NNN_YYYY-MM-DD_AUTHOR pattern doesn't apply, recover the
    // sequence from the leading prefix and fall back to frontmatter for
    // author + date so avatars and dates render regardless of filename style.
    if (!strict) {
      const seq = name.match(/^(\d+)/);
      if (seq) sequence = parseInt(seq[1], 10);
    }
    if (!author || !date) {
      try {
        const fm = matter(fs.readFileSync(abs, 'utf-8')).data as { author?: string; date?: unknown };
        if (!author && typeof fm.author === 'string') author = fm.author;
        if (!date) date = fmDateString(fm.date);
      } catch {
        /* malformed frontmatter — keep nulls */
      }
    }

    return {
      name: name.replace(/\.md$/, ''),
      sequence,
      date,
      author,
      html: '',
      filePath: abs,
    };
  });
}

async function loadIssueFolder(folderPath: string, dataPath: string): Promise<Issue | null> {
  const id = path.basename(folderPath);
  const match = id.match(FOLDER_PATTERN);
  if (!match) return null;

  // Resolve to the real on-disk file (.jsonc wins) so error hints name it correctly.
  const settingsPath = resolveSettingsPath(folderPath);
  const meta = readJson<IssueMetadata>(settingsPath);
  if (!meta) {
    console.warn(`[issues] Skipping "${id}" — missing or invalid settings.json`);
    return null;
  }

  const issuePath = path.join(folderPath, 'issue.md');
  const html = fs.existsSync(issuePath) ? await renderMarkdown(issuePath, dataPath) : '';

  // Optional per-issue glossary — a single root-level glossary.md. Null when
  // absent (the panel then shows an empty state prompting the author to add one).
  const glossaryPath = path.join(folderPath, 'glossary.md');
  const glossaryHtml = fs.existsSync(glossaryPath)
    ? await renderMarkdown(glossaryPath, dataPath)
    : null;

  // Comments
  const commentsDir = path.join(folderPath, 'comments');
  const comments = readComments(commentsDir);
  for (const c of comments) {
    c.html = await renderMarkdown(c.filePath, dataPath);
  }

  // Subtasks: frontmatter-driven files under subtasks/ (body optional).
  // Nested grouping folders up to MAX_SUBFOLDER_DEPTH; folder = label only, no body file.
  const { subtasks, subtaskGroups } = await readSubtasks(
    path.join(folderPath, 'subtasks'), dataPath, id,
  );

  // Notes: rendered markdown under notes/, nested up to MAX_SUBFOLDER_DEPTH
  const notes = await readFreeformDocs(path.join(folderPath, 'notes'), dataPath, id, 'notes');

  // Brainstorm: same free-form nested shape as notes
  const brainstorm = await readFreeformDocs(path.join(folderPath, 'brainstorm'), dataPath, id, 'brainstorm');

  // Agent memory: AI-mutable working state; same free-form nested shape as notes
  const agentMemory = await readFreeformDocs(path.join(folderPath, 'agent-memory'), dataPath, id, 'agent-memory');

  // Plans: one folder per plan, exactly one level deep (not a free-form tree)
  const plans = await readPlans(path.join(folderPath, 'plans'), folderPath, dataPath);

  // Agent logs: same nested shape as notes; sequence resets per leaf folder
  const agentLogs = await readAgentLogs(path.join(folderPath, 'agent-log'), dataPath, id);
  const agentLogGroups = readAgentLogGroups(path.join(folderPath, 'agent-log'), dataPath);

  // Effective agent-log kind map: framework defaults + this issue's overrides.
  // Each override is `"code": "name"` (shorthand) or `"code": { name, icon }`.
  // Only 2-letter codes with a non-empty name are accepted; icon falls back to
  // any existing default icon for that code, else the palette's generic icon.
  const agentLogKinds: Record<string, AgentLogKind> = { ...DEFAULT_AGENT_LOG_KINDS };
  const rawKinds = (meta as { agentLogKinds?: unknown }).agentLogKinds;
  if (rawKinds && typeof rawKinds === 'object') {
    for (const [code, val] of Object.entries(rawKinds as Record<string, unknown>)) {
      if (!/^[a-z]{2}$/.test(code)) continue;
      const existing = agentLogKinds[code];
      if (typeof val === 'string' && val.length > 0) {
        agentLogKinds[code] = { name: val, icon: existing?.icon ?? 'tag' };
      } else if (val && typeof val === 'object') {
        const v = val as { name?: unknown; icon?: unknown; desc?: unknown };
        const name = typeof v.name === 'string' && v.name.length > 0 ? v.name : existing?.name;
        const icon = typeof v.icon === 'string' && v.icon.length > 0 ? v.icon : existing?.icon ?? 'tag';
        const desc = typeof v.desc === 'string' && v.desc.length > 0 ? v.desc : existing?.desc;
        if (name) agentLogKinds[code] = { name, icon, ...(desc ? { desc } : {}) };
      }
    }
  }

  // Warn on stray root-level *.md (users upgrading from the old layout)
  const stray = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'issue.md' && e.name !== 'glossary.md')
    .map((e) => e.name);
  if (stray.length) {
    console.warn(
      `[issues] "${id}" has loose .md files at the folder root — move them into notes/: ${stray.join(', ')}`,
    );
  }

  const created = match[1];
  const updated = getIssueDate(dataPath, id) ?? created;

  return {
    id,
    created,
    updated,
    slug: match[2],
    folderPath,
    meta: {
      ...meta,
      status: resolveStatus(meta.status, path.relative(dataPath, settingsPath)),
      labels: Array.isArray(meta.labels) ? meta.labels : [],
      assignees: Array.isArray(meta.assignees) ? meta.assignees : [],
      component: normalizeComponent((meta as { component?: unknown }).component),
    },
    html,
    glossaryHtml,
    comments,
    subtasks,
    subtaskGroups,
    notes,
    brainstorm,
    agentMemory,
    plans,
    agentLogs,
    agentLogGroups,
    agentLogKinds,
  };
}

/**
 * Walk a nested tree of `*.md` files under `rootDir`, up to
 * `MAX_SUBFOLDER_DEPTH` folder levels. Yields entries in stable
 * folder-then-name order; sequence counter (assigned by the caller via
 * `onFile`) resets at each leaf folder. Anything deeper than the cap is
 * logged as a warning and skipped.
 */
async function walkSubfolderTree<T>(
  rootDir: string,
  issueId: string,
  subName: string,
  onFile: (abs: string, groupPath: string[], fallbackSeq: number) => Promise<T>,
  extensions: string[] = ['.md'],
): Promise<T[]> {
  if (!fs.existsSync(rootDir)) return [];
  const out: T[] = [];

  async function emitFolder(absDir: string, groupPath: string[]): Promise<void> {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
    catch { return; }

    const files = entries
      .filter((e) => e.isFile() && extensions.some((ext) => e.name.toLowerCase().endsWith(ext)))
      .map((e) => e.name)
      .sort();
    let i = 0;
    for (const name of files) {
      out.push(await onFile(path.join(absDir, name), groupPath, ++i));
    }

    const subFolders = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    for (const folder of subFolders) {
      if (groupPath.length >= MAX_SUBFOLDER_DEPTH) {
        console.warn(
          `[issues] "${issueId}": ${subName}/${[...groupPath, folder].join('/')}/ exceeds the ${MAX_SUBFOLDER_DEPTH}-level depth cap — ignored`,
        );
        continue;
      }
      await emitFolder(path.join(absDir, folder), [...groupPath, folder]);
    }
  }

  await emitFolder(rootDir, []);
  return out;
}

/** Optional sidecar for a tracker `.html` artifact — the same contract the docs
 *  artifact loader honours. `readJson` prefers a `.meta.jsonc` sibling. */
interface ArtifactSidecar {
  title?: string;
  description?: string;
  embed_height?: number | string;
  artifact?: Record<string, unknown>;
}

/** Read an artifact's `<name>.meta.json` / `.meta.jsonc` sidecar (absent → {}). */
function readArtifactMeta(file: string): ArtifactSidecar {
  const base = path.basename(file, path.extname(file));
  const metaPath = path.join(path.dirname(file), `${base}.meta.json`);
  return readJson<ArtifactSidecar>(metaPath) ?? {};
}

async function readFreeformDocs(
  dir: string,
  dataPath: string,
  issueId: string,
  subName: string,
): Promise<IssueNote[]> {
  // First-class `.html` artifacts are supporting docs in the tracker's
  // design-thinking folders only; agent-memory stays markdown + diagrams. Which
  // ones those are is declared once, in the section registry.
  const allowArtifacts = sectionById(subName)?.allowArtifacts ?? false;
  const extensions = allowArtifacts
    ? ['.md', '.html', ...DIAGRAM_EXTENSIONS]
    : ['.md', ...DIAGRAM_EXTENSIONS];

  const docs = await walkSubfolderTree(dir, issueId, subName, async (abs, groupPath) => {
    // First-class artifact (.html): the body is the same by-reference `.artifact`
    // container the docs layout emits — the BaseLayout client script turns it
    // into an <iframe> onto the /artifacts/<path> route with the open-full-page
    // + expand affordances and the theme handshake. Title comes from an optional
    // `.meta.json`/`.meta.jsonc` sidecar, else the (prefix-stripped) filename.
    if (allowArtifacts && path.extname(abs).toLowerCase() === '.html') {
      const meta = readArtifactMeta(abs);
      const embedHeight = meta.embed_height ?? (meta.artifact?.embed_height as number | string | undefined);
      return {
        name: path.basename(abs, path.extname(abs)),
        filePath: abs,
        relativePath: path.relative(dataPath, abs),
        groupPath,
        color: null,
        docType: 'artifact' as const,
        html: artifactContainerHtml(abs, meta.title, embedHeight),
      };
    }

    // Diagram files (.mmd/.dot/.excalidraw/…) are first-class docs too: the
    // body is the same `.diagram` container embeds emit, rendered
    // client-side — mirrors first-class diagram pages in docs sections.
    const diagram = diagramContainerHtml(abs);
    if (diagram !== null) {
      return {
        name: path.basename(abs, path.extname(abs)),
        filePath: abs,
        relativePath: path.relative(dataPath, abs),
        groupPath,
        color: null,
        docType: 'diagram' as const,
        html: diagram,
      };
    }

    let fm: { color?: string } = {};
    try { fm = matter(fs.readFileSync(abs, 'utf-8')).data as typeof fm; } catch {}
    return {
      name: path.basename(abs).replace(/\.md$/, ''),
      filePath: abs,
      relativePath: path.relative(dataPath, abs),
      groupPath,
      color: typeof fm.color === 'string' && fm.color.length > 0 ? fm.color : null,
      docType: 'markdown' as const,
      html: await renderMarkdown(abs, dataPath),
    };
  }, extensions);

  // Same-basename collision guard — parity with the docs-side first-class-page
  // slug-collision pass (loaders/first-class-page.ts resolveSlugCollisions).
  // Two supporting docs in one folder whose names differ only by extension
  // (03_plan.html + 03_plan.md, or 03_plan.md + 03_plan.mmd) all reduce to the
  // same extension-less route (helpers.ts noteUrl → note.name), so one silently
  // shadows the other in the sidebar and detail view. The docs loader renders an
  // explicit collision page there; the tracker treats it as a contrived
  // authoring slip and surfaces it loudly rather than picking a silent winner.
  const byRoute = new Map<string, IssueNote[]>();
  for (const doc of docs) {
    const key = [...doc.groupPath, doc.name].join('/');
    const list = byRoute.get(key) ?? [];
    list.push(doc);
    byRoute.set(key, list);
  }
  for (const [key, colliding] of byRoute) {
    if (colliding.length < 2) continue;
    const names = colliding.map((d) => path.basename(d.filePath)).join(', ');
    console.warn(
      `[issues] "${issueId}": ${subName}/${key} is claimed by ${colliding.length} files (${names}) — ` +
        `they resolve to the same URL; rename all but one so it doesn't silently shadow the others.`,
    );
  }

  return docs;
}

async function readAgentLogs(
  logsDir: string,
  dataPath: string,
  issueId: string,
): Promise<IssueAgentLog[]> {
  return walkSubfolderTree(logsDir, issueId, 'agent-log', async (abs, groupPath, fallbackSeq) => {
    // Diagram files are first-class log entries too (same rule as notes/
    // brainstorm); they carry no frontmatter, so meta fields stay null.
    const diagram = diagramContainerHtml(abs);
    if (diagram !== null) {
      const base = path.basename(abs, path.extname(abs));
      return {
        name: base,
        sequence: parseOrderPrefixLoose(base).position ?? fallbackSeq,
        agent: null,
        status: null,
        date: null,
        groupPath,
        filePath: abs,
        relativePath: path.relative(dataPath, abs),
        color: null,
        html: diagram,
      };
    }

    const base = path.basename(abs).replace(/\.md$/, '');
    const sequence = parseOrderPrefixLoose(base).position ?? fallbackSeq;
    let fm: { agent?: string; status?: string; date?: unknown; color?: string } = {};
    try { fm = matter(fs.readFileSync(abs, 'utf-8')).data as typeof fm; } catch {}
    return {
      name: base,
      sequence,
      agent: fm.agent || null,
      status: fm.status || null,
      date: fmDateString(fm.date),
      groupPath,
      filePath: abs,
      relativePath: path.relative(dataPath, abs),
      color: typeof fm.color === 'string' && fm.color.length > 0 ? fm.color : null,
      html: await renderMarkdown(abs, dataPath),
    };
  }, ['.md', ...DIAGRAM_EXTENSIONS]);
}

// ============================================================================
// plans/ — the schedule section
// ============================================================================

/** Reserved filename inside a plan folder: the plan's intro, never a stage. */
const PLAN_OVERVIEW = 'overview.md';

/**
 * Slugify a stage title into its heading anchor.
 *
 * Deliberately built from the TITLE and never from the numeric prefix:
 * `agent-ks move` rewrites paths on a renumber but does not rewrite anchors, so
 * `#20-journal-compatibility` would break silently the first time a stage is
 * inserted above it. `#journal-compatibility` survives.
 */
export function planStageAnchor(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Resolve one `subtasks:` / `agent-logs:` frontmatter entry to an
 * issue-relative posix path.
 *
 * Entries are markdown links — `[Byte stability](../../subtasks/13/86_x.md)` —
 * because **the path is the truth and the link text is a reading aid**: the
 * renderer pulls the referenced item's live title and status, so stale link
 * text costs nothing. A bare path is accepted too.
 *
 * Returns null when there is no parsable target or the target escapes the issue
 * folder. The caller keeps those in `unresolvedRefs` rather than dropping them —
 * a dropped reference would quietly shrink a stage's subtask count, and a wrong
 * count is indistinguishable from a right one.
 */
function planRefTarget(entry: unknown, stageDir: string, issueDir: string): string | null {
  if (typeof entry !== 'string') return null;
  const link = entry.match(/\]\(([^)]+)\)/);
  const raw = (link ? link[1] : entry).trim().split('#')[0].trim();
  if (!raw) return null;
  const rel = path.relative(issueDir, path.resolve(stageDir, raw));
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join('/');
}

/** Split a frontmatter ref list into resolved targets + the entries that did not
 *  resolve. A non-array value (a single string, or a typo) is treated as a
 *  one-entry list rather than ignored. */
function readPlanRefs(
  raw: unknown,
  stageDir: string,
  issueDir: string,
): { refs: string[]; unresolved: string[] } {
  const entries = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
  const refs: string[] = [];
  const unresolved: string[] = [];
  for (const entry of entries) {
    const target = planRefTarget(entry, stageDir, issueDir);
    if (target) refs.push(target);
    else unresolved.push(typeof entry === 'string' ? entry : JSON.stringify(entry));
  }
  return { refs, unresolved };
}

/** Order plan folders and stage files by prefix VALUE (so `100_` sorts after
 *  `20_`, not before it). Unprefixed sorts last, then lexicographically. */
function byPrefixValue(a: string, b: string): number {
  const av = parseOrderPrefixLoose(a).position ?? Number.POSITIVE_INFINITY;
  const bv = parseOrderPrefixLoose(b).position ?? Number.POSITIVE_INFINITY;
  if (av !== bv) return av - bv;
  return a.localeCompare(b);
}

/**
 * Read `plans/` — plan folders and nothing else, each exactly one level deep.
 *
 * Loose files at `plans/` root and folders nested inside a plan are skipped
 * here and reported by `agent-ks check issues`: the loader's job is to render
 * what is well-formed, the validator's is to name what is not.
 */
async function readPlans(
  plansDir: string,
  issueDir: string,
  dataPath: string,
): Promise<IssuePlan[]> {
  if (!fs.existsSync(plansDir)) return [];
  let entries: fs.Dirent[];
  try { entries = fs.readdirSync(plansDir, { withFileTypes: true }); }
  catch { return []; }

  const plans: IssuePlan[] = [];
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name).sort(byPrefixValue);

  for (const folder of folders) {
    const abs = path.join(plansDir, folder);
    const settingsPath = resolveSettingsPath(abs);
    const settings = readJson<{ title?: string; status?: string }>(settingsPath);
    const status = resolveStatus(settings?.status, path.relative(dataPath, settingsPath));

    const overviewAbs = path.join(abs, PLAN_OVERVIEW);
    const overviewHtml = fs.existsSync(overviewAbs)
      ? await renderMarkdown(overviewAbs, dataPath)
      : null;

    let stageNames: string[] = [];
    try {
      stageNames = fs.readdirSync(abs, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== PLAN_OVERVIEW)
        .map((e) => e.name)
        .sort(byPrefixValue);
    } catch { /* unreadable plan folder — renders with no stages */ }

    const stages: IssuePlanStage[] = [];
    for (const file of stageNames) {
      const stageAbs = path.join(abs, file);
      const name = file.replace(/\.md$/, '');
      let fm: {
        title?: string; outcome?: string; who?: string; status?: string;
        subtasks?: unknown; 'agent-logs'?: unknown;
      } = {};
      try { fm = matter(fs.readFileSync(stageAbs, 'utf-8')).data as typeof fm; } catch {}

      const title = typeof fm.title === 'string' && fm.title.length > 0
        ? fm.title
        : slugToLabel(name);
      const stageStatus = resolveStatus(fm.status, path.relative(dataPath, stageAbs));
      const subtasks = readPlanRefs(fm.subtasks, abs, issueDir);
      const logs = readPlanRefs(fm['agent-logs'], abs, issueDir);

      stages.push({
        name,
        sequence: parseOrderPrefixLoose(name).position,
        title,
        outcome: typeof fm.outcome === 'string' && fm.outcome.length > 0 ? fm.outcome : null,
        who: typeof fm.who === 'string' && fm.who.length > 0 ? fm.who : null,
        status: stageStatus,
        category: categoryOf(stageStatus),
        subtaskRefs: subtasks.refs,
        agentLogRefs: logs.refs,
        unresolvedRefs: [...subtasks.unresolved, ...logs.unresolved],
        anchor: planStageAnchor(title),
        filePath: stageAbs,
        relativePath: path.relative(dataPath, stageAbs),
        html: await renderMarkdown(stageAbs, dataPath),
      });
    }

    plans.push({
      name: folder,
      sequence: parseOrderPrefixLoose(folder).position,
      title: settings?.title && settings.title.length > 0 ? settings.title : slugToLabel(folder),
      status,
      category: categoryOf(status),
      overviewHtml,
      stages,
      folderPath: abs,
      relativePath: path.relative(dataPath, abs),
    });
  }

  return plans;
}

/** Reserved folder names inside an agent log. Anything else nested there is a
 *  CHILD agent log, so there is no ambiguity at read time. */
export const AGENT_LOG_RESERVED_FOLDERS = new Set(['working', 'debrief']);

/**
 * Walk `agent-log/` for folders and read each one's optional `settings.json`.
 *
 * A **new read path**, not a new field: `readAgentLogs` reads markdown files
 * only, and folder-level settings were previously read for subtask groups
 * alone. Absence is fine everywhere — the file is optional by design, and a
 * folder without one is representable (`status: null`) rather than defaulted.
 */
function readAgentLogGroups(logsDir: string, dataPath: string): AgentLogGroupMeta[] {
  if (!fs.existsSync(logsDir)) return [];
  const out: AgentLogGroupMeta[] = [];

  const walk = (absDir: string, groupPath: string[]): void => {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
    catch { return; }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (groupPath.length >= MAX_SUBFOLDER_DEPTH) continue;   // loader cap; warned by readAgentLogs
      const childAbs = path.join(absDir, entry.name);
      const childPath = [...groupPath, entry.name];
      const reserved = AGENT_LOG_RESERVED_FOLDERS.has(entry.name);

      let status: IssueStatus | null = null;
      if (!reserved) {
        const settingsPath = resolveSettingsPath(childAbs);
        const settings = readJson<{ status?: string }>(settingsPath);
        if (settings && settings.status != null && settings.status !== '') {
          status = resolveStatus(settings.status, path.relative(dataPath, settingsPath));
        }
      }

      out.push({ groupPath: childPath, status, reserved });
      walk(childAbs, childPath);
    }
  };

  walk(logsDir, []);
  return out;
}

/** Convert a folder slug ("02_impl-and-polish") into a human label ("impl and polish"). */
function slugToLabel(slug: string): string {
  return parseOrderPrefixLoose(slug).cleanName.replace(/[-_]/g, ' ').trim() || slug;
}

/** Read an optional folder-level `settings.json` for a subtask group. Only `title`
 *  is interpreted today; absent file → fall back to slug-derived label. */
function readGroupTitle(folderAbs: string, folderName: string): string {
  const settings = readJson<{ title?: string }>(path.join(folderAbs, 'settings.json'));
  if (settings && typeof settings.title === 'string' && settings.title.length > 0) {
    return settings.title;
  }
  return slugToLabel(folderName);
}

async function readSubtaskFile(
  abs: string,
  groupPath: string[],
  dataPath: string,
): Promise<IssueSubtask> {
  const name = path.basename(abs);
  const slug = name.replace(/\.md$/, '');
  const sequence = parseOrderPrefixLoose(slug).position;
  let title = slugToLabel(slug);
  let status: IssueStatus = 'open';
  try {
    const parsed = matter(fs.readFileSync(abs, 'utf-8'));
    const fm = parsed.data as { title?: string; status?: string; state?: string };
    if (fm.title) title = fm.title;
    // Canonical field is `status:`; `state:` is the legacy name still tolerated
    // (with a warning) until the state→status migration has swept every tracker.
    const raw = fm.status ?? fm.state;
    if (fm.status == null && fm.state != null) {
      console.warn(
        `[issues] "${path.relative(dataPath, abs)}" uses the legacy \`state:\` field — run the state→status migration to rename it to \`status:\`.`,
      );
    }
    status = resolveStatus(raw, path.relative(dataPath, abs));
  } catch {
    // malformed frontmatter — fall back to defaults
  }
  const html = await renderMarkdown(abs, dataPath);
  return {
    slug,
    sequence,
    title,
    status,
    category: categoryOf(status),
    groupPath,
    filePath: abs,
    relativePath: path.relative(dataPath, abs),
    html,
  };
}

async function readSubtasks(
  subtasksDir: string,
  dataPath: string,
  issueId: string,
): Promise<{ subtasks: IssueSubtask[]; subtaskGroups: SubtaskGroupMeta[] }> {
  const subtasks: IssueSubtask[] = [];
  const subtaskGroups: SubtaskGroupMeta[] = [];
  if (!fs.existsSync(subtasksDir)) return { subtasks, subtaskGroups };

  async function emitFolder(absDir: string, groupPath: string[]): Promise<void> {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
    catch { return; }

    const files = entries
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => e.name)
      .sort();
    for (const name of files) {
      subtasks.push(await readSubtaskFile(path.join(absDir, name), groupPath, dataPath));
    }

    const subFolders = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort();
    for (const folder of subFolders) {
      if (groupPath.length >= MAX_SUBFOLDER_DEPTH) {
        console.warn(
          `[issues] "${issueId}": subtasks/${[...groupPath, folder].join('/')}/ exceeds the ${MAX_SUBFOLDER_DEPTH}-level depth cap — ignored`,
        );
        continue;
      }
      const childAbs = path.join(absDir, folder);
      const childPath = [...groupPath, folder];
      subtaskGroups.push({
        groupPath: childPath,
        sequence: parseOrderPrefixLoose(folder).position,
        title: readGroupTitle(childAbs, folder),
      });
      await emitFolder(childAbs, childPath);
    }
  }

  await emitFolder(subtasksDir, []);
  return { subtasks, subtaskGroups };
}

/**
 * Load all issues from a directory. Filters drafts in production unless
 * `includeDrafts` is true. If the root settings.json has `"draft": true`
 * and we're in production, returns an empty issues list.
 */
export async function loadIssues(
  dataPath: string,
  options: { includeDrafts?: boolean } = {},
): Promise<LoadedIssues> {
  if (!path.isAbsolute(dataPath)) {
    throw new Error(`Expected absolute data path for issues, got "${dataPath}".`);
  }

  const { includeDrafts = !import.meta.env.PROD } = options;

  // Cache lookup — key includes includeDrafts so dev and prod can coexist
  const cacheKey = `${dataPath}::${includeDrafts ? 'd' : ''}`;
  const signature = computeSignature(dataPath);
  const cached = cache.get(cacheKey);
  if (cached && cached.signature === signature) {
    return cached.data;
  }

  const vocabulary = readJson<IssuesVocabulary>(path.join(dataPath, 'settings.json')) ?? {
    fields: {},
  };
  const rootDraft = !!vocabulary.draft;
  // Validate the root vocabulary and resolve status colours before reading any
  // issue — a malformed root settings file should fail loudly and early. The
  // hint names the real file on disk (`.jsonc` when that's what's authored).
  const statusColors = resolveVocabulary(vocabulary, resolveSettingsPath(dataPath));

  if (!fs.existsSync(dataPath)) {
    const empty: LoadedIssues = { vocabulary, rootDraft, statusColors, issues: [] };
    cache.set(cacheKey, { signature, data: empty });
    return empty;
  }

  if (rootDraft && !includeDrafts) {
    const empty: LoadedIssues = { vocabulary, rootDraft, statusColors, issues: [] };
    cache.set(cacheKey, { signature, data: empty });
    return empty;
  }

  const entries = fs.readdirSync(dataPath, { withFileTypes: true });
  const folders = entries
    .filter((e) => e.isDirectory() && FOLDER_PATTERN.test(e.name))
    .map((e) => path.join(dataPath, e.name));

  const issues: Issue[] = [];
  for (const folder of folders) {
    const issue = await loadIssueFolder(folder, dataPath);
    if (!issue) continue;
    if (!includeDrafts && issue.meta.draft) continue;
    issues.push(issue);
  }

  // Default sort: most-recently-touched first. Layouts override on the
  // client when the user clicks a sortable column header.
  issues.sort((a, b) => b.updated.localeCompare(a.updated));

  const result: LoadedIssues = { vocabulary, rootDraft, statusColors, issues };
  cache.set(cacheKey, { signature, data: result });
  return result;
}

/**
 * Load a single issue by folder name. Served from the shared cache whenever
 * possible so repeated detail-page visits are instant.
 */
export async function loadIssue(dataPath: string, id: string): Promise<Issue | null> {
  if (!path.isAbsolute(dataPath)) {
    throw new Error(`Expected absolute data path for issues, got "${dataPath}".`);
  }
  if (!FOLDER_PATTERN.test(id)) return null;

  const { issues } = await loadIssues(dataPath);
  const hit = issues.find((i) => i.id === id);
  if (hit) return hit;

  // Not in the filtered set (e.g. draft excluded); fall back to direct read
  const folderPath = path.join(dataPath, id);
  if (!fs.existsSync(folderPath)) return null;
  return loadIssueFolder(folderPath, dataPath);
}
