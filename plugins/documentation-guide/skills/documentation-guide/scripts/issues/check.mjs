#!/usr/bin/env bun
/**
 * issues/check.mjs — validate the structure of an issue tracker.
 *
 * Joins the existing 8 read/write helpers with a domain validator. Checks
 * everything documented in `references/issue-layout.md`:
 *
 *   • Tracker root has settings.json with a `fields:` block (vocabulary)
 *   • Every issue folder matches YYYY-MM-DD-<slug>/
 *   • Every issue has settings.json + issue.md
 *   • Issue settings.json carries required fields and uses vocabulary values
 *   • Subtasks have valid `state` (open|review|closed|cancelled), or legacy `done: true`
 *   • Comments / agent-logs follow naming conventions (warned, not errored)
 *   • Stray .md at folder root (other than issue.md) → warning
 *
 * Exit code 0 = clean, 1 = errors found.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { DEFAULT_TRACKER, listIssueFolders, readVocabulary, parseArgs, printHelp } from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (args.flags.help) {
  printHelp('check', [
    '[--tracker <path>] [--quiet|--no-warnings] [--verbose] [--strict]',
    '',
    'Validate the structure of an issue tracker. Defaults to <content-root>/data/todo (derived from .env CONFIG_DIR).',
    'Reports errors (will fail loaders) and warnings (lint-only — including unknown-key drift).',
    '',
    '  --quiet, --no-warnings   suppress warnings; only errors print',
    '  --verbose                for unknown-key warnings, also list the canonical keys',
    '  --strict                 promote unknown-key warnings to errors (exit 1 on schema drift)',
  ]);
  process.exit(0);
}

const tracker = args.flags.tracker || DEFAULT_TRACKER;
if (!fs.existsSync(tracker)) {
  console.error(`Not found: ${tracker}`);
  process.exit(1);
}

const QUIET = !!(args.flags.quiet || args.flags['no-warnings']);
const VERBOSE = !!args.flags.verbose;
const STRICT = !!args.flags.strict;

// Canonical schema — every key not in these sets is "unknown" (drift). Sourced
// from the documented schema in `default-docs/data/user-guide/19_issues/04_settings/`
// plus real-world frontmatter usage. When the schema changes, update here.
const ISSUE_SETTINGS_KEYS = new Set([
  'title', 'description', 'status', 'priority', 'component', 'labels',
  'author', 'assignees', 'draft',
]);
const TRACKER_ROOT_KEYS = new Set(['label', 'fields', 'authors', 'views', 'draft']);
const TRACKER_FIELD_KEYS = new Set(['status', 'priority', 'component', 'labels']);
const SUBTASK_FM_KEYS = new Set(['title', 'state', 'done', 'sidebar_label']);
const NOTE_FM_KEYS = new Set([
  'title', 'description', 'sidebar_label', 'author', 'date', 'created', 'tags',
  'color',
]);
const AGENT_LOG_FM_KEYS = new Set([
  'title', 'iteration', 'agent', 'status', 'date', 'sidebar_label',
  'color',
]);
const COMMENT_FM_KEYS = new Set(['author', 'date', 'title', 'sidebar_label']);

const errors = [];
const warnings = [];
const driftWarnings = []; // tracked separately so --strict can promote only these

function unknownKeys(obj, canonical) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj).filter((k) => !canonical.has(k));
}

function reportDrift(file, unknown, canonical) {
  if (unknown.length === 0) return;
  let msg = `${file}: unknown key${unknown.length > 1 ? 's' : ''} \`${unknown.join('`, `')}\``;
  if (VERBOSE) msg += ` — canonical: ${[...canonical].sort().join(', ')}`;
  driftWarnings.push(msg);
}

// 1. Tracker root vocabulary
const vocab = readVocabulary(tracker);
if (!vocab || !vocab.fields) {
  errors.push(`<root>/settings.json: missing or no \`fields\` block (vocabulary)`);
}
const validStatuses = vocab?.fields?.status?.values || ['open', 'review', 'closed', 'cancelled'];
const validPriorities = vocab?.fields?.priority?.values || [];
const validComponents = vocab?.fields?.component?.values || [];
const validLabels = vocab?.fields?.labels?.values || [];

// Schema-drift on tracker root + its fields block
reportDrift('<root>/settings.json', unknownKeys(vocab, TRACKER_ROOT_KEYS), TRACKER_ROOT_KEYS);
reportDrift('<root>/settings.json (fields)', unknownKeys(vocab?.fields, TRACKER_FIELD_KEYS), TRACKER_FIELD_KEYS);

const FOLDER_PATTERN = /^(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9-]*)$/;
const VALID_SUBTASK_STATES = ['open', 'review', 'closed', 'cancelled'];

// 2. Walk each issue folder
const allEntries = fs.readdirSync(tracker, { withFileTypes: true });
const issueFolders = allEntries.filter((e) => e.isDirectory());

for (const entry of issueFolders) {
  const id = entry.name;
  const folder = path.join(tracker, id);

  if (!FOLDER_PATTERN.test(id)) {
    errors.push(`${id}/: doesn't match YYYY-MM-DD-<kebab-slug>/`);
    continue;
  }

  const settingsPath = path.join(folder, 'settings.json');
  if (!fs.existsSync(settingsPath)) {
    errors.push(`${id}/settings.json: missing`);
    continue;
  }

  let meta;
  try {
    meta = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch (e) {
    errors.push(`${id}/settings.json: invalid JSON (${e.message})`);
    continue;
  }

  reportDrift(`${id}/settings.json`, unknownKeys(meta, ISSUE_SETTINGS_KEYS), ISSUE_SETTINGS_KEYS);

  if (!meta.title) errors.push(`${id}/settings.json: missing \`title\``);
  if (!meta.status) errors.push(`${id}/settings.json: missing \`status\``);
  else if (!validStatuses.includes(meta.status)) {
    errors.push(`${id}/settings.json: status \`${meta.status}\` not in vocabulary (${validStatuses.join('|')})`);
  }
  if (meta.priority && validPriorities.length && !validPriorities.includes(meta.priority)) {
    errors.push(`${id}/settings.json: priority \`${meta.priority}\` not in vocabulary`);
  }
  const components = Array.isArray(meta.component)
    ? meta.component
    : (typeof meta.component === 'string' && meta.component ? [meta.component] : []);
  if (components.length === 0 && validComponents.length > 0) {
    warnings.push(`${id}/settings.json: \`component\` is empty`);
  }
  // Convention: prefer 1 component per issue. Multi-component is allowed
  // for genuinely cross-cutting work but should be the exception. Hint
  // surfaces the decision; never an error.
  if (components.length > 1) {
    warnings.push(`${id}/settings.json: declares ${components.length} components — consider whether this should be split into separate issues`);
  }
  for (const c of components) {
    if (validComponents.length && !validComponents.includes(c)) {
      warnings.push(`${id}/settings.json: component \`${c}\` not in vocabulary`);
    }
  }
  for (const l of (Array.isArray(meta.labels) ? meta.labels : [])) {
    if (validLabels.length && !validLabels.includes(l)) {
      warnings.push(`${id}/settings.json: label \`${l}\` not in vocabulary`);
    }
  }

  // issue.md required
  if (!fs.existsSync(path.join(folder, 'issue.md'))) {
    errors.push(`${id}/issue.md: missing`);
  }

  // Stray *.md at folder root
  const stray = fs
    .readdirSync(folder, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'issue.md')
    .map((e) => e.name);
  if (stray.length) {
    warnings.push(`${id}/: stray .md at folder root (move to notes/?): ${stray.join(', ')}`);
  }

  // Subtasks (recursive — up to 2 levels of grouping folders allowed).
  // Folder = grouping label only; no folder body file. An optional
  // settings.json on a group folder may set its display title.
  const subDir = path.join(folder, 'subtasks');
  let subtaskCount = 0;
  if (fs.existsSync(subDir)) {
    function walkSubtasks(absDir, segments) {
      let entries;
      try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
      catch { return; }
      for (const e of entries) {
        if (e.isDirectory()) {
          if (segments.length >= 2) {
            warnings.push(`${id}/subtasks/${[...segments, e.name].join('/')}/: exceeds 2-level depth cap, ignored by loader`);
            continue;
          }
          walkSubtasks(path.join(absDir, e.name), [...segments, e.name]);
        } else if (e.isFile() && e.name.endsWith('.md')) {
          subtaskCount++;
          const rel = [...segments, e.name].join('/');
          const abs = path.join(absDir, e.name);
          try {
            const fm = matter(fs.readFileSync(abs, 'utf-8')).data || {};
            if (fm.state !== undefined && !VALID_SUBTASK_STATES.includes(fm.state)) {
              errors.push(`${id}/subtasks/${rel}: invalid state \`${fm.state}\``);
            }
            if (fm.state === undefined && fm.done === undefined) {
              warnings.push(`${id}/subtasks/${rel}: no \`state:\` or \`done:\` — defaults to open`);
            }
            reportDrift(`${id}/subtasks/${rel}`, unknownKeys(fm, SUBTASK_FM_KEYS), SUBTASK_FM_KEYS);
          } catch (err) {
            errors.push(`${id}/subtasks/${rel}: malformed frontmatter (${err.message})`);
          }
        }
      }
    }
    walkSubtasks(subDir, []);
  }

  // Convention: AI-handoff-bound issues should declare ≥1 subtask. We
  // detect AI handoff via an `assignees` entry that names a known agent.
  // Hint only — humans resolving trivial fixes don't need bookkeeping.
  const assignees = Array.isArray(meta.assignees) ? meta.assignees : [];
  const AI_AGENTS = new Set(['claude', 'gpt', 'gpt-4', 'gpt-5', 'codex', 'cursor', 'aider']);
  const hasAIAssignee = assignees.some((a) => AI_AGENTS.has(String(a).toLowerCase()));
  if (hasAIAssignee && subtaskCount === 0 && !['closed', 'cancelled'].includes(meta.status)) {
    warnings.push(`${id}/: AI-handoff-bound issue has no subtasks — consider adding at least one as the agent's handoff anchor`);
  }

  // notes/ + agent-log/ subfolder depth (max 2 levels — anything deeper is
  // ignored by the loader). Depth 0 = root, depth 1 = group, depth 2 = subgroup.
  // Also: schema-drift on every .md frontmatter under each sub-doc folder.
  const FM_KEYS_BY_TYPE = {
    notes: NOTE_FM_KEYS,
    'agent-log': AGENT_LOG_FM_KEYS,
    comments: COMMENT_FM_KEYS,
  };
  for (const sub of ['notes', 'agent-log', 'comments']) {
    const subDir = path.join(folder, sub);
    if (!fs.existsSync(subDir)) continue;
    function walk(absDir, segments) {
      let entries;
      try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
      catch { return; }
      for (const e of entries) {
        if (e.isDirectory()) {
          if (sub === 'comments') continue; // comments are flat
          if (segments.length >= 2) {
            warnings.push(`${id}/${sub}/${[...segments, e.name].join('/')}/: exceeds 2-level depth cap, ignored by loader`);
            continue;
          }
          walk(path.join(absDir, e.name), [...segments, e.name]);
        } else if (e.isFile() && e.name.endsWith('.md')) {
          const rel = [...segments, e.name].join('/');
          try {
            const fm = matter(fs.readFileSync(path.join(absDir, e.name), 'utf-8')).data || {};
            reportDrift(`${id}/${sub}/${rel}`, unknownKeys(fm, FM_KEYS_BY_TYPE[sub]), FM_KEYS_BY_TYPE[sub]);
          } catch (err) {
            warnings.push(`${id}/${sub}/${rel}: malformed frontmatter (${err.message})`);
          }
        }
      }
    }
    walk(subDir, []);
  }
}

// Reconcile drift output mode. --strict promotes drift warnings to errors;
// otherwise they stack with the regular warning list.
if (STRICT) {
  for (const w of driftWarnings) errors.push(w);
} else {
  for (const w of driftWarnings) warnings.push(w);
}

const showWarnings = !QUIET;

console.log(`# issues check: ${tracker}`);
console.log(`(${listIssueFolders(tracker).length} issue folders scanned)`);
console.log('');
if (errors.length === 0 && (warnings.length === 0 || !showWarnings)) {
  console.log(errors.length === 0 && warnings.length === 0 ? '✓ all checks passed' : '✓ no errors');
  process.exit(0);
}
if (errors.length) {
  console.log(`## ${errors.length} error(s)`);
  for (const e of errors) console.log(`  ✗ ${e}`);
}
if (warnings.length && showWarnings) {
  if (errors.length) console.log('');
  console.log(`## ${warnings.length} warning(s)`);
  for (const w of warnings) console.log(`  ⚠ ${w}`);
}
process.exit(errors.length ? 1 : 0);
