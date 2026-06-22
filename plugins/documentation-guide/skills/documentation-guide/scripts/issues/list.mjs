#!/usr/bin/env bun
/**
 * list.mjs — multi-field filter + free-text regex search over the tracker.
 *
 * Replaces `grep` / `find` for the issue tracker: knows the schema
 * (vocabulary, subtask states, frontmatter, agent-log subgroups) and emits
 * issue ids + exact file paths + line numbers + excerpts in one call.
 *
 * Default scope: open + review (skips closed/cancelled). Override with
 * --status, or --include-cancelled to see everything. AND across fields,
 * OR within a field.
 *
 * Search backend (auto-picked, fastest first): ripgrep → grep → pure JS.
 * See _lib.mjs detectSearchBackend() / runSearch().
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTracker, listIssueFolders, readIssueMeta, readIssueSubtasks,
  parseArgs, csv, printHelp,
  detectSearchBackend, maybePrintInstallHint, runSearch, listSearchableFiles,
  issueDateFromId,
} from './_lib.mjs';
import { writeStdout } from '../_cli.mjs';

const args = parseArgs(process.argv.slice(2));
if (args.flags.help || args.flags.h) {
  printHelp('list', [
    '[filters] [--search <regex>] [output] [--quiet-tips]',
    '',
    'Filters (AND across fields, OR within):',
    '  --status open,review,closed,cancelled    default: open,review (use `all` for every state)',
    '  --priority low,medium,high,urgent',
    '  --component <vals>',
    '  --label <vals>',
    '  --type <vals>                            (if `type` field present)',
    '  --assignee <names,assigned,unassigned>   per-name match; `assigned`/`unassigned`',
    '                                           are coarse "is anyone on it?" pseudo-values',
    '  --created-after YYYY-MM-DD               from issue folder date prefix',
    '  --created-before YYYY-MM-DD',
    '  --subtasks-min N        --subtasks-max N',
    '  --has-open-subtasks     --has-review-subtasks     --has-closed-subtasks',
    '  --include-cancelled                      shorthand for adding cancelled to default scope',
    '',
    'Search (free-text regex over issue files):',
    '  --search <regex>                         POSIX ERE / JS-regex syntax',
    '  --search-fields body,settings,comments,subtasks,notes,agent-log',
    '                                           default: all',
    '  --case-sensitive                         default: case-insensitive',
    '  --invert-match                           include lines that do NOT match',
    '  --scope <subpath>                        restrict to a subfolder of the tracker',
    '  --path <regex>                           match issues by file/folder PATH text',
    '  --meta <regex>                           match only frontmatter + JSON (the structured layer)',
    '',
    'Output:',
    '  --count                                  matches + titles only (no per-line excerpts)',
    '  default                                  id<TAB>status<TAB>title  (no --search)',
    '                                           id<TAB>status<TAB>title<TAB>path:line<TAB>excerpt  (with --search)',
    '  --json                                   structured records, with `matches: [...]` if --search',
    '  --paths-only                             bare list of unique match paths (escape hatch)',
    '  --limit N                                cap to first N matching issues',
    '  --tracker <path>                         operate on a non-default tracker',
    '',
    'Exit codes: 0 = matches found, 1 = no matches, 2 = usage error.',
    '',
    'Examples:',
    '  list.mjs --priority high,urgent',
    '  list.mjs --search "indexer" --status review',
    '  list.mjs --search "TODO\\\\(.*\\\\)" --search-fields body,subtasks --json',
    '  list.mjs --created-after 2026-04-01 --has-review-subtasks',
    '  list.mjs --component live-editor --priority high,urgent',
  ]);
  process.exit(args.flags.help || args.flags.h ? 0 : 2);
}

// ---------- Resolve options ------------------------------------------------

const tracker = resolveTracker(args.flags.tracker);
const filterStatus     = csv(args.flags.status);
const filterPriority   = csv(args.flags.priority);
const filterComponent  = csv(args.flags.component);
const filterLabel      = csv(args.flags.label);
const filterType       = csv(args.flags.type);
const filterAssignee   = csv(args.flags.assignee);
const requireReviewSub = !!args.flags['has-review-subtasks'];
const requireOpenSub   = !!args.flags['has-open-subtasks'];
const requireClosedSub = !!args.flags['has-closed-subtasks'];
const subtasksMin      = numOrNull(args.flags['subtasks-min']);
const subtasksMax      = numOrNull(args.flags['subtasks-max']);
const createdAfter     = strOrNull(args.flags['created-after']);
const createdBefore    = strOrNull(args.flags['created-before']);

const searchPattern    = strOrNull(args.flags.search);
const searchFields     = csv(args.flags['search-fields']); // empty = all
const caseSensitive    = !!args.flags['case-sensitive'];
const invertMatch      = !!args.flags['invert-match'];
const scopeSub         = strOrNull(args.flags.scope); // subpath restriction
const pathPattern      = strOrNull(args.flags.path);  // match against file/folder paths
const metaPattern      = strOrNull(args.flags.meta);  // match frontmatter + JSON only
const wantCount        = !!args.flags.count;
const limit            = numOrNull(args.flags.limit);
const wantJson         = !!args.flags.json;
const wantPathsOnly    = !!args.flags['paths-only'];
const quietTips        = !!args.flags['quiet-tips'];

const reFlags = caseSensitive ? '' : 'i';

const ALL_STATUSES = ['open', 'review', 'closed', 'cancelled'];
const scope = filterStatus.length
  ? (filterStatus.includes('all') ? ALL_STATUSES : filterStatus)
  : (args.flags['include-cancelled']
      ? ALL_STATUSES
      : ['open', 'review']);

// ---------- Phase 1: structural filter -------------------------------------

const structural = [];
for (const id of listIssueFolders(tracker)) {
  const meta = readIssueMeta(tracker, id);
  if (!meta) continue;

  if (!scope.includes(meta.status)) continue;
  if (filterPriority.length  && !filterPriority.includes(meta.priority))   continue;

  if (filterComponent.length) {
    const comps = arrify(meta.component);
    if (!comps.some((v) => filterComponent.includes(v))) continue;
  }
  if (filterLabel.length) {
    const labels = Array.isArray(meta.labels) ? meta.labels : [];
    if (!labels.some((v) => filterLabel.includes(v))) continue;
  }
  if (filterType.length) {
    const types = arrify(meta.type);
    if (!types.some((v) => filterType.includes(v))) continue;
  }
  if (filterAssignee.length) {
    // Two pseudo-values express the coarse "in-progress" filter:
    //   `unassigned` — assignees array is empty (nobody is on it)
    //   `assigned`   — assignees array has at least one entry (work is in flight)
    // Any other value is matched against the actual assignee names. Pseudo +
    // named values OR together so `--assignee assigned,sid` reads as
    // "anything in-flight, plus anything sid touches even if also unassigned".
    const assignees = arrify(meta.assignee).concat(arrify(meta.assignees));
    const wantUnassigned = filterAssignee.includes('unassigned');
    const wantAssigned   = filterAssignee.includes('assigned');
    const isUnassigned = assignees.length === 0;
    const matchesNamed = assignees.some((v) => filterAssignee.includes(v));
    if (!(
      (wantUnassigned && isUnassigned) ||
      (wantAssigned && !isUnassigned) ||
      matchesNamed
    )) continue;
  }

  if (createdAfter  && (issueDateFromId(id) ?? '') < createdAfter)  continue;
  if (createdBefore && (issueDateFromId(id) ?? '') > createdBefore) continue;

  // Subtask-related filters require reading subtasks (slightly more I/O).
  let subs = null;
  const needSubs = requireReviewSub || requireOpenSub || requireClosedSub
                   || subtasksMin != null || subtasksMax != null;
  if (needSubs) subs = readIssueSubtasks(tracker, id);
  if (requireReviewSub && !subs.some((s) => s.state === 'review'))   continue;
  if (requireOpenSub   && !subs.some((s) => s.state === 'open'))     continue;
  if (requireClosedSub && !subs.some((s) => s.state === 'closed'))   continue;
  if (subtasksMin != null && (subs ?? []).length < subtasksMin)      continue;
  if (subtasksMax != null && (subs ?? []).length > subtasksMax)      continue;

  structural.push({
    id,
    status: meta.status,
    priority: meta.priority,
    component: arrify(meta.component),
    labels: Array.isArray(meta.labels) ? meta.labels : [],
    type: arrify(meta.type),
    assignees: arrify(meta.assignee).concat(arrify(meta.assignees)),
    title: meta.title,
  });
}

// ---------- Phase 2: regex search (optional) -------------------------------

let results = structural.map((m) => ({ ...m, matches: [] }));

if (searchPattern) {
  const backend = detectSearchBackend();
  maybePrintInstallHint(backend, { quietTips });

  const fields = searchFields.length ? searchFields : null;
  const filtered = [];
  try {
    for (const issue of results) {
      let files = listSearchableFiles(tracker, issue.id, fields);
      if (scopeSub) {
        const scopeAbs = path.resolve(tracker, issue.id, scopeSub);
        files = files.filter((f) => f === scopeAbs || f.startsWith(scopeAbs + path.sep));
      }
      const matches = runSearch(backend, files, searchPattern,
                                { caseSensitive, invert: invertMatch });
      if (matches.length === 0) continue;
      filtered.push({ ...issue, matches });
    }
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exit(2);
  }
  results = filtered;
}

// ---------- Phase 2b: --meta (frontmatter + JSON only) ---------------------
// A *vertical* cut across files — the structured layer — distinct from
// --search-fields (which picks a file category). Implemented in JS (the
// rg/grep backend can't restrict to a file's frontmatter region).
if (metaPattern) {
  const re = new RegExp(metaPattern, reFlags);
  const filtered = [];
  for (const issue of results) {
    const metaHits = [];
    for (const f of listSearchableFiles(tracker, issue.id, null)) {
      for (const region of extractMetaRegions(f)) {
        region.text.split('\n').forEach((ln, i) => {
          if (re.test(ln)) {
            metaHits.push({ path: f, line: region.startLine + i, snippet: ln.trim() });
          }
        });
      }
    }
    if (metaHits.length) filtered.push({ ...issue, matches: [...issue.matches, ...metaHits] });
  }
  results = filtered;
}

// ---------- Phase 2c: --path (match against file/folder path text) ---------
// Pure filter: keep an issue if its id (folder slug) or any of its file paths
// match the regex. Descriptive paths are often the fastest way to an issue.
if (pathPattern) {
  const re = new RegExp(pathPattern, reFlags);
  results = results.filter((issue) =>
    re.test(issue.id) ||
    listSearchableFiles(tracker, issue.id, null).some((f) => re.test(path.relative(tracker, f))),
  );
}

if (limit != null) results = results.slice(0, limit);

// ---------- Output ---------------------------------------------------------

if (wantPathsOnly) {
  const seen = new Set();
  const lines = [];
  for (const issue of results) {
    for (const m of issue.matches) {
      if (!seen.has(m.path)) { seen.add(m.path); lines.push(m.path); }
    }
  }
  if (lines.length) writeStdout(lines.join('\n') + '\n');
  process.exit(seen.size === 0 ? 1 : 0);
}

const hasLineMatches = !!(searchPattern || metaPattern);

if (wantJson) {
  // Strip empty `matches` arrays when there's nothing match-bearing.
  const out = results.map((r) => hasLineMatches ? r : (({ matches, ...rest }) => rest)(r));
  writeStdout(JSON.stringify(out, null, 2) + '\n');
  process.exit(out.length === 0 ? 1 : 0);
}

// --count: matches + titles only, no per-line excerpt dump.
if (wantCount) {
  let total = 0;
  const lines = [];
  for (const issue of results) {
    total += issue.matches.length;
    lines.push(hasLineMatches
      ? `${issue.id}\t${issue.status}\t${issue.title}\t${issue.matches.length} match${issue.matches.length === 1 ? '' : 'es'}`
      : `${issue.id}\t${issue.status}\t${issue.title}`);
  }
  lines.push(`# ${results.length} issue(s)${hasLineMatches ? `, ${total} match(es)` : ''}`);
  writeStdout(lines.join('\n') + '\n');
  process.exit(results.length === 0 ? 1 : 0);
}

// Default tabular output.
let printedAny = false;
const lines = [];
for (const issue of results) {
  if (hasLineMatches) {
    for (const m of issue.matches) {
      const rel = path.relative(process.cwd(), m.path);
      lines.push(`${issue.id}\t${issue.status}\t${issue.title}\t${rel}:${m.line}\t${m.snippet}`);
      printedAny = true;
    }
  } else {
    lines.push(`${issue.id}\t${issue.status}\t${issue.title}`);
    printedAny = true;
  }
}
if (lines.length) writeStdout(lines.join('\n') + '\n');
process.exit(printedAny ? 0 : 1);

// ---------- Tiny helpers ---------------------------------------------------

function arrify(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === 'string' && v) return [v];
  return [];
}
function numOrNull(v) {
  if (v === undefined || v === true) return null;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : null;
}
function strOrNull(v) {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t || null;
}

/**
 * The metadata region(s) of a file, for --meta:
 *   • .json  → the whole file (it IS structured metadata)
 *   • .md    → only the leading `--- … ---` frontmatter block
 *   • other  → none
 * Returns [{ startLine, text }] (1-based startLine for line reporting).
 */
function extractMetaRegions(absFile) {
  let content;
  try { content = fs.readFileSync(absFile, 'utf-8'); } catch { return []; }
  if (absFile.endsWith('.json')) return [{ startLine: 1, text: content }];
  if (absFile.endsWith('.md')) {
    const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content);
    return m ? [{ startLine: 2, text: m[1] }] : []; // frontmatter inner starts at line 2
  }
  return [];
}
