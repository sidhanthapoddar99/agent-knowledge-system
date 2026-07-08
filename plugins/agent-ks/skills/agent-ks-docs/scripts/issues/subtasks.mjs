#!/usr/bin/env bun
/**
 * subtasks.mjs — list subtasks for one issue, or across all issues.
 *
 * Default: grouped output that mirrors the on-disk folder grouping (subtasks
 * may live under up to 2 levels of grouping folders). Pass `--flat` to get a
 * one-line-per-subtask list instead — handy when you want to pipe into
 * another tool and don't care about the grouping intent.
 *
 * Default status filter: everything not in the Closed category (done/dropped
 * hidden) — matches the AI default-search rule.
 */

import {
  resolveTracker, listIssueFolders, readIssueSubtasks, readIssueSubtaskGroups,
  parseArgs, csv, printHelp, isValidState, STATUSES, TERMINAL_STATUSES,
} from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
const positional = args._[0];

if (args.flags.help || (!positional && !args.flags.all)) {
  printHelp('issue subtasks', [
    '<issue-id|--all> [--status open,in-progress,review,done,…] [--flat] [--json] [--tracker <path>]',
    '',
    'List subtasks for one issue, or across all issues with --all.',
    'Default: grouped output (mirrors the subtasks/ folder tree, up to 2 levels).',
    '--flat   one-line-per-subtask, no grouping (issue<TAB>file<TAB>status<TAB>title).',
    '--json   machine-readable; carries groupPath per subtask + group metadata.',
    'Default scope: everything not in the Closed category (done/dropped hidden).',
    '--status all   include every status (done/dropped shown too).',
  ]);
  process.exit(args.flags.help ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);
// Accept `--status` (canonical) and `--state` (legacy alias). The `all`
// keyword widens to every status (mirrors `issue list` at list.mjs) — it must
// be expanded BEFORE the vocabulary filter, which would otherwise drop it and
// silently fall back to the default non-Closed scope. Unknown tokens are still
// dropped so a typo can't smuggle in an empty filter as "everything".
const rawStatus = csv(args.flags.status ?? args.flags.state);
const stateFilter = rawStatus.includes('all')
  ? [...STATUSES]
  : rawStatus.filter(isValidState);
const scope = stateFilter.length
  ? stateFilter
  : STATUSES.filter((s) => !TERMINAL_STATUSES.includes(s));
const isAll = args.flags.all || positional === '--all';
const flat = !!args.flags.flat;

const issueIds = isAll ? listIssueFolders(tracker) : [positional];

const matches = [];
for (const id of issueIds) {
  const subs = readIssueSubtasks(tracker, id);
  const groups = readIssueSubtaskGroups(tracker, id);
  for (const s of subs) {
    if (!scope.includes(s.status)) continue;
    matches.push({
      issue: id,
      file: [...s.groupPath, s.fileName].join('/'),
      slug: s.slug,
      groupPath: s.groupPath,
      status: s.status,
      title: s.title,
      sequence: s.sequence,
    });
  }
  // Stash groups on the issue for grouped output. Indexed by joined groupPath.
  matches._groups = matches._groups || {};
  matches._groups[id] = groups;
}

if (args.flags.json) {
  const groupMap = matches._groups || {};
  delete matches._groups;
  console.log(JSON.stringify({ subtasks: matches, groups: groupMap }, null, 2));
  process.exit(0);
}

if (flat) {
  for (const m of matches) console.log(`${m.issue}\t${m.file}\t${m.status}\t${m.title}`);
  process.exit(0);
}

// Grouped output. For each issue, render groups as labelled blocks; leaves
// indented under their group. Groups + leaves are interleaved by NNN_ prefix.
const groupMap = matches._groups || {};
delete matches._groups;

function pad(n) { return String(n ?? '').padStart(2, '0').replace(/^0$/, '  '); }

function indentFor(depth) { return '  '.repeat(depth); }

function printIssueTree(issueId) {
  const issueSubs = matches.filter((m) => m.issue === issueId);
  if (issueSubs.length === 0) return;
  const groups = groupMap[issueId] || [];

  // Build a tree: { files: [], groups: Map<name, node> }
  function emptyNode(meta) { return { files: [], groups: new Map(), meta: meta || null }; }
  const root = emptyNode(null);
  for (const g of groups) {
    let cursor = root;
    for (let i = 0; i < g.groupPath.length; i++) {
      const seg = g.groupPath[i];
      let child = cursor.groups.get(seg);
      const isLeaf = i === g.groupPath.length - 1;
      if (!child) {
        child = emptyNode(isLeaf ? g : null);
        cursor.groups.set(seg, child);
      } else if (isLeaf) {
        child.meta = g;
      }
      cursor = child;
    }
  }
  for (const s of issueSubs) {
    let cursor = root;
    for (const seg of s.groupPath) {
      let child = cursor.groups.get(seg);
      if (!child) { child = emptyNode(null); cursor.groups.set(seg, child); }
      cursor = child;
    }
    cursor.files.push(s);
  }

  console.log(`# ${issueId}`);
  function render(node, depth) {
    const entries = [];
    for (const f of node.files) entries.push({ kind: 'leaf', sequence: f.sequence, name: f.slug, leaf: f });
    for (const [name, child] of node.groups) {
      entries.push({ kind: 'group', sequence: child.meta?.sequence ?? null, name, group: child });
    }
    entries.sort((a, b) => {
      const sa = a.sequence ?? Number.MAX_SAFE_INTEGER;
      const sb = b.sequence ?? Number.MAX_SAFE_INTEGER;
      if (sa !== sb) return sa - sb;
      return a.name.localeCompare(b.name);
    });
    for (const e of entries) {
      if (e.kind === 'leaf') {
        const { status, title, sequence } = e.leaf;
        const seq = sequence !== null ? `${pad(sequence)}. ` : '    ';
        console.log(`${indentFor(depth)}${seq}[${status}] ${title}`);
      } else {
        const meta = e.group.meta;
        const seq = meta?.sequence !== null && meta?.sequence !== undefined ? `${pad(meta.sequence)}. ` : '    ';
        const label = meta?.title || e.name;
        console.log(`${indentFor(depth)}${seq}${label}/`);
        render(e.group, depth + 1);
      }
    }
  }
  render(root, 1);
  console.log('');
}

if (isAll) {
  const seen = new Set();
  for (const m of matches) {
    if (seen.has(m.issue)) continue;
    seen.add(m.issue);
    printIssueTree(m.issue);
  }
} else {
  printIssueTree(positional);
}
