/**
 * Issues Loader
 *
 * Folder-per-issue content loader. Each issue lives at
 *   <dataPath>/YYYY-MM-DD-<slug>/
 *     settings.json                            (metadata, required)
 *     issue.md                                 (body, required)
 *     comments/NNN_*.md                        (thread, optional)
 *     subtasks/[<group>/[<subgroup>/]]*.md     (checklist items, optional — 2-level tree)
 *     notes/[<group>/[<subgroup>/]]*.md        (supporting documents, optional — 2-level tree)
 *     agent-log/[<group>/[<subgroup>/]]*.md    (iterative AI agent notes, optional — 2-level tree)
 *
 * Subtasks, notes, and agent-log all support up to two levels of subfoldering.
 * For subtasks the folder is a *grouping label only* — no folder body file;
 * every leaf `.md` is a first-class subtask with its own state, URL, and
 * count. A folder may ship an optional `settings.json` with at minimum a
 * `title` field overriding the slug-derived label. For notes and agent-log,
 * folder + file names are freeform (no `NNN_` prefix required; when present
 * on agent-log files, the leading number is still parsed as `sequence`).
 * Anything nested deeper than two levels is warned and ignored.
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
import { parseOrderPrefixLoose } from '../parsers/core/order-prefix';

export interface IssueMetadata {
  title: string;
  description?: string;
  status: string;
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
  /** Rendered HTML */
  html: string;
}

export interface IssueAgentLog {
  /** Filename without extension, e.g. "001_initial-triage" or "triage" */
  name: string;
  /** Numeric prefix if filename starts with "NNN_", else the sort order.
   *  Sequence resets per subgroup folder (001, 002, … per leaf folder). */
  sequence: number;
  /** Frontmatter `iteration` field (falls back to sequence) */
  iteration: number | null;
  /** Frontmatter `agent` — which agent wrote this log */
  agent: string | null;
  /** Frontmatter `status` — free-form (in-progress / success / failed / …) */
  status: string | null;
  /** Frontmatter `date` */
  date: string | null;
  /** Folder segments below `agent-log/` — 0/1/2 entries. Same shape as
   *  IssueNote.groupPath. Anything deeper than 2 is warned + ignored. */
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

export type SubtaskState = 'open' | 'review' | 'closed' | 'cancelled';

export interface IssueSubtask {
  /** Filename without extension, used as stable id within the issue */
  slug: string;
  /** Numeric prefix parsed from slug (e.g. "01_foo" → 1). null when absent. */
  sequence: number | null;
  /** Display title (from frontmatter `title`, or derived from slug) */
  title: string;
  /** Canonical 4-state status. Defaults to `open` when absent/invalid. */
  state: SubtaskState;
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
   *  Same free-form, 2-level shape as notes. */
  brainstorm: IssueNote[];
  /** Agent memory — AI-mutable working state under agent-memory/.
   *  Same free-form, 2-level shape as notes. */
  agentMemory: IssueNote[];
  /** Agent logs — iterative AI execution notes under agent-log/ */
  agentLogs: IssueAgentLog[];
}

export interface IssuesVocabularyField {
  values: string[];
  colors?: Record<string, string>;
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
}

export interface LoadedIssues {
  vocabulary: IssuesVocabulary;
  /** Root-level draft flag — if true, the whole tracker is dev-only */
  rootDraft: boolean;
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

function computeSignature(dataPath: string): number {
  let sig = statMtime(path.join(dataPath, 'settings.json'));
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
    sig += statMtime(path.join(folder, 'settings.json'));
    sig += statMtime(path.join(folder, 'issue.md'));
    sig += statMtime(path.join(folder, 'glossary.md'));

    for (const sub of ['comments', 'subtasks', 'notes', 'brainstorm', 'agent-memory', 'agent-log']) {
      const subDir = path.join(folder, sub);
      sig += statMtime(subDir);
      // subtasks, notes, and agent-log support up to 2 levels of
      // subfolders; comments stays flat.
      const allowsNesting = sub !== 'comments';
      try {
        const items = fs.readdirSync(subDir, { withFileTypes: true });
        for (const item of items) {
          const abs = path.join(subDir, item.name);
          if (item.isFile() && item.name.endsWith('.md')) {
            sig += statMtime(abs);
          } else if (item.isDirectory() && allowsNesting) {
            sig += statMtime(abs);
            // Folder-level settings.json (subtasks groups may carry one).
            sig += statMtime(path.join(abs, 'settings.json'));
            try {
              for (const inner of fs.readdirSync(abs, { withFileTypes: true })) {
                const innerAbs = path.join(abs, inner.name);
                if (inner.isFile() && inner.name.endsWith('.md')) {
                  sig += statMtime(innerAbs);
                } else if (inner.isDirectory()) {
                  sig += statMtime(innerAbs);
                  sig += statMtime(path.join(innerAbs, 'settings.json'));
                  try {
                    for (const f of fs.readdirSync(innerAbs)) {
                      if (f.endsWith('.md')) sig += statMtime(path.join(innerAbs, f));
                    }
                  } catch { /* empty leaf */ }
                }
              }
            } catch { /* empty group */ }
          }
        }
      } catch { /* dir absent */ }
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

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
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
        const fm = matter(fs.readFileSync(abs, 'utf-8')).data as { author?: string; date?: string };
        if (!author && typeof fm.author === 'string') author = fm.author;
        if (!date && typeof fm.date === 'string') date = fm.date;
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

  const settingsPath = path.join(folderPath, 'settings.json');
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
  // Up to 2 levels of grouping folders; folder = label only, no body file.
  const { subtasks, subtaskGroups } = await readSubtasks(
    path.join(folderPath, 'subtasks'), dataPath, id,
  );

  // Notes: rendered markdown under notes/, up to 2 levels of subfolders
  const notes = await readFreeformDocs(path.join(folderPath, 'notes'), dataPath, id, 'notes');

  // Brainstorm: same free-form 2-level shape as notes
  const brainstorm = await readFreeformDocs(path.join(folderPath, 'brainstorm'), dataPath, id, 'brainstorm');

  // Agent memory: AI-mutable working state; same free-form 2-level shape as notes
  const agentMemory = await readFreeformDocs(path.join(folderPath, 'agent-memory'), dataPath, id, 'agent-memory');

  // Agent logs: same 2-level shape as notes; sequence resets per leaf folder
  const agentLogs = await readAgentLogs(path.join(folderPath, 'agent-log'), dataPath, id);

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
    agentLogs,
  };
}

/**
 * Walk a 2-level tree of `*.md` files under `rootDir`. Yields entries in
 * stable folder-then-name order; sequence counter (assigned by the caller
 * via `onFile`) resets at each leaf folder. Anything deeper than 2 levels
 * is logged as a warning and skipped.
 */
async function walkTwoLevels<T>(
  rootDir: string,
  issueId: string,
  subName: string,
  onFile: (abs: string, groupPath: string[], fallbackSeq: number) => Promise<T>,
): Promise<T[]> {
  if (!fs.existsSync(rootDir)) return [];
  const out: T[] = [];

  async function emitFolder(absDir: string, groupPath: string[]): Promise<void> {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
    catch { return; }

    const files = entries
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
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
      if (groupPath.length >= 2) {
        console.warn(
          `[issues] "${issueId}": ${subName}/${[...groupPath, folder].join('/')}/ exceeds the 2-level depth cap — ignored`,
        );
        continue;
      }
      await emitFolder(path.join(absDir, folder), [...groupPath, folder]);
    }
  }

  await emitFolder(rootDir, []);
  return out;
}

async function readFreeformDocs(
  dir: string,
  dataPath: string,
  issueId: string,
  subName: string,
): Promise<IssueNote[]> {
  return walkTwoLevels(dir, issueId, subName, async (abs, groupPath) => {
    let fm: { color?: string } = {};
    try { fm = matter(fs.readFileSync(abs, 'utf-8')).data as typeof fm; } catch {}
    return {
      name: path.basename(abs).replace(/\.md$/, ''),
      filePath: abs,
      relativePath: path.relative(dataPath, abs),
      groupPath,
      color: typeof fm.color === 'string' && fm.color.length > 0 ? fm.color : null,
      html: await renderMarkdown(abs, dataPath),
    };
  });
}

async function readAgentLogs(
  logsDir: string,
  dataPath: string,
  issueId: string,
): Promise<IssueAgentLog[]> {
  return walkTwoLevels(logsDir, issueId, 'agent-log', async (abs, groupPath, fallbackSeq) => {
    const base = path.basename(abs).replace(/\.md$/, '');
    const sequence = parseOrderPrefixLoose(base).position ?? fallbackSeq;
    let fm: { iteration?: number; agent?: string; status?: string; date?: string; color?: string } = {};
    try { fm = matter(fs.readFileSync(abs, 'utf-8')).data as typeof fm; } catch {}
    return {
      name: base,
      sequence,
      iteration: typeof fm.iteration === 'number' ? fm.iteration : null,
      agent: fm.agent || null,
      status: fm.status || null,
      date: fm.date || null,
      groupPath,
      filePath: abs,
      relativePath: path.relative(dataPath, abs),
      color: typeof fm.color === 'string' && fm.color.length > 0 ? fm.color : null,
      html: await renderMarkdown(abs, dataPath),
    };
  });
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
  let state: SubtaskState = 'open';
  try {
    const parsed = matter(fs.readFileSync(abs, 'utf-8'));
    const fm = parsed.data as { title?: string; state?: string };
    if (fm.title) title = fm.title;
    if (fm.state === 'open' || fm.state === 'review' || fm.state === 'closed' || fm.state === 'cancelled') {
      state = fm.state;
    }
  } catch {
    // malformed frontmatter — fall back to defaults
  }
  const html = await renderMarkdown(abs, dataPath);
  return {
    slug,
    sequence,
    title,
    state,
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
      if (groupPath.length >= 2) {
        console.warn(
          `[issues] "${issueId}": subtasks/${[...groupPath, folder].join('/')}/ exceeds the 2-level depth cap — ignored`,
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

  if (!fs.existsSync(dataPath)) {
    const empty: LoadedIssues = { vocabulary, rootDraft, issues: [] };
    cache.set(cacheKey, { signature, data: empty });
    return empty;
  }

  if (rootDraft && !includeDrafts) {
    const empty: LoadedIssues = { vocabulary, rootDraft, issues: [] };
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

  const result: LoadedIssues = { vocabulary, rootDraft, issues };
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
