#!/usr/bin/env bun
/**
 * issues/check.mjs — validate the structure of an issue tracker.
 *
 * Joins the existing 8 read/write helpers with a domain validator. Checks
 * everything documented in the agent-ks-issues skill (entry: `references/00_overview.md`):
 *
 *   • Tracker root has settings.json with a `fields:` block (vocabulary)
 *   • Every issue folder matches YYYY-MM-DD-<slug>/
 *   • Every issue has settings.json + issue.md
 *   • Issue settings.json carries required fields and uses vocabulary values
 *   • `agentLogKinds` well-formed (2-letter codes, string or {name, icon, desc})
 *   • Subtasks have valid `status` (open|blocked|in-progress|input-needed|review|done|dropped)
 *   • Sub-folders are the known anatomy: subtasks / notes / brainstorm /
 *     agent-log / agent-memory / comments (unknown dirs → warning)
 *   • Agent-log grammar: NNN_<code>_<name>/ activity folders, 0NN meta files
 *     vs milestone files (milestones carry `iteration`; status vocabulary)
 *   • Agent-memory has a memory.md index
 *   • Comments / agent-logs follow naming conventions (warned, not errored)
 *   • Stray .md at folder root (other than issue.md) → warning
 *
 * Exit code 0 = clean, 1 = errors found.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { resolveTracker, listIssueFolders, readVocabulary, parseArgs, printHelp, STATUSES, TERMINAL_STATUSES, normalizeStatus, LEGACY_STATUS_MAP } from './_lib.mjs';
import { readJsonChecked, reportAndExit } from '../_check-lib.mjs';

const args = parseArgs(process.argv.slice(2));
if (args.flags.help) {
  printHelp('check issues', [
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

const tracker = resolveTracker(args.flags.tracker);
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
  'author', 'assignees', 'draft', 'agentLogKinds',
]);
const TRACKER_ROOT_KEYS = new Set(['label', 'fields', 'authors', 'views', 'draft', 'statusColors']);
// `status` is no longer a valid field — statuses are code-fixed and colours
// live under the top-level `statusColors` map (see the explicit check below).
const TRACKER_FIELD_KEYS = new Set(['priority', 'component', 'labels']);
const SUBTASK_FM_KEYS = new Set(['title', 'status', 'state', 'sidebar_label']);
const NOTE_FM_KEYS = new Set([
  'title', 'description', 'sidebar_label', 'author', 'date', 'created', 'tags',
  'color',
]);
const AGENT_LOG_FM_KEYS = new Set([
  'title', 'iteration', 'agent', 'status', 'date', 'sidebar_label',
  'color',
]);
const COMMENT_FM_KEYS = new Set(['author', 'date', 'title', 'sidebar_label']);

// Known issue sub-folders (the anatomy) + colocated assets. Anything else at
// the issue root is probably a typo — the loader silently ignores it.
const KNOWN_SUBFOLDERS = new Set([
  'subtasks', 'notes', 'brainstorm', 'agent-log', 'agent-memory', 'comments', 'assets',
]);

// Agent-log kind machinery — mirrors src/loaders/issues.ts (defaults, code
// shape) and layouts/issues/default/server/agent-log-icons.ts (palette).
const DEFAULT_KIND_CODES = new Set(['lp', 'au', 'rf', 'it', 'wf']);
const KIND_CODE_PATTERN = /^[a-z]{2}$/;
const ICON_PALETTE = new Set([
  'repeat', 'search', 'wrench', 'refresh-cw', 'git-branch',
  'flask', 'zap', 'flag', 'star', 'book', 'shield', 'layers', 'clock',
  'target', 'check-circle', 'bug', 'tag',
]);
// Milestone `status` vocabulary — aliases accepted by SubdocTree's colour map.
const MILESTONE_STATUSES = new Set([
  'not-started', 'todo', 'pending', 'planned',
  'in-progress', 'wip', 'active',
  'success', 'completed', 'complete', 'done',
  'failed', 'fail', 'error',
]);

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
// Statuses are fixed in framework code (mirrored in _lib.mjs) — a tracker can
// no longer define its own. `settings.json` may still list them for reference
// but they are not the source of validity.
const validStatuses = STATUSES;
const validPriorities = vocab?.fields?.priority?.values || [];
const validComponents = vocab?.fields?.component?.values || [];
const validLabels = vocab?.fields?.labels?.values || [];

// Schema-drift on tracker root + its fields block
reportDrift('<root>/settings.json', unknownKeys(vocab, TRACKER_ROOT_KEYS), TRACKER_ROOT_KEYS);
reportDrift('<root>/settings.json (fields)', unknownKeys(vocab?.fields, TRACKER_FIELD_KEYS), TRACKER_FIELD_KEYS);

// Statuses are code-fixed: a per-tracker `fields.status` is an error (its
// `values` list would read as authoritative). Colours live under a top-level
// `statusColors` map, validated against the fixed vocabulary — a colour for a
// status that doesn't exist is a typo, not an override.
if (vocab?.fields?.status) {
  errors.push(`<root>/settings.json: remove \`fields.status\` — statuses are fixed in code; override colours via a top-level \`statusColors\` map instead (covered by a repo-root migration/ script — run the migration chain)`);
}
if (vocab?.statusColors && typeof vocab.statusColors === 'object') {
  for (const key of Object.keys(vocab.statusColors)) {
    if (!STATUSES.includes(key)) {
      errors.push(`<root>/settings.json: \`statusColors.${key}\` is not a valid status (${STATUSES.join('|')}) — a colour for a status that doesn't exist is a typo (a repo-root migration/ script flags this via its detect pass — run the migration chain)`);
    }
  }
}
// Every component/label value must carry a description (rendered in the Guide
// modal). priority meanings stay optional.
for (const field of ['component', 'labels']) {
  const def = vocab?.fields?.[field];
  if (!def || !Array.isArray(def.values) || def.values.length === 0) continue;
  const descriptions = (def.descriptions && typeof def.descriptions === 'object') ? def.descriptions : {};
  const missing = def.values.filter((v) => typeof descriptions[v] !== 'string' || descriptions[v].trim() === '');
  if (missing.length > 0) {
    errors.push(`<root>/settings.json: \`fields.${field}\` — missing description(s) for: ${missing.join(', ')}. Add a \`descriptions\` map alongside \`values\` (covered by a repo-root migration/ script — run the migration chain)`);
  }
}

const FOLDER_PATTERN = /^(\d{4}-\d{2}-\d{2})-([a-z0-9][a-z0-9-]*)$/;
const VALID_SUBTASK_STATES = STATUSES;

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

  const meta = readJsonChecked(settingsPath, `${id}/settings.json`, errors);
  if (!meta) continue;

  reportDrift(`${id}/settings.json`, unknownKeys(meta, ISSUE_SETTINGS_KEYS), ISSUE_SETTINGS_KEYS);

  if (!meta.title) errors.push(`${id}/settings.json: missing \`title\``);
  if (!meta.status) errors.push(`${id}/settings.json: missing \`status\``);
  else if (LEGACY_STATUS_MAP[meta.status]) {
    warnings.push(`${id}/settings.json: legacy status \`${meta.status}\` — run the state→status migration (→ ${LEGACY_STATUS_MAP[meta.status]})`);
  }
  else if (!validStatuses.includes(meta.status)) {
    errors.push(`${id}/settings.json: status \`${meta.status}\` not in the fixed vocabulary (${validStatuses.join('|')})`);
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
  // Convention: exactly 1 component per issue — tag by center of gravity,
  // even for cross-cutting work. Hint surfaces the decision; never an error.
  if (components.length > 1) {
    warnings.push(`${id}/settings.json: declares ${components.length} components — pick the single one it most belongs to, or split into separate issues`);
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

  // agentLogKinds — per-issue code→kind map merged over framework defaults.
  // The loader tolerates malformed entries (skips them), so shape problems are
  // warnings, not errors. Valid custom codes join the effective set used to
  // vet agent-log folder names below.
  const effectiveKindCodes = new Set(DEFAULT_KIND_CODES);
  if (meta.agentLogKinds !== undefined) {
    if (typeof meta.agentLogKinds !== 'object' || meta.agentLogKinds === null || Array.isArray(meta.agentLogKinds)) {
      warnings.push(`${id}/settings.json: \`agentLogKinds\` must be an object ({ code: name | {name, icon, desc} }) — ignored by loader`);
    } else {
      for (const [code, val] of Object.entries(meta.agentLogKinds)) {
        if (!KIND_CODE_PATTERN.test(code)) {
          warnings.push(`${id}/settings.json: agentLogKinds code \`${code}\` isn't two lowercase letters — ignored by loader`);
          continue;
        }
        if (typeof val === 'string') {
          if (val.trim()) effectiveKindCodes.add(code);
          else warnings.push(`${id}/settings.json: agentLogKinds.\`${code}\` is an empty string — ignored by loader`);
        } else if (val && typeof val === 'object' && !Array.isArray(val)) {
          if (typeof val.name === 'string' && val.name.trim()) {
            effectiveKindCodes.add(code);
            if (val.icon !== undefined && !ICON_PALETTE.has(val.icon)) {
              warnings.push(`${id}/settings.json: agentLogKinds.\`${code}\` icon \`${val.icon}\` not in the symbol palette — falls back to the generic tag`);
            }
          } else {
            warnings.push(`${id}/settings.json: agentLogKinds.\`${code}\` has no \`name\` — ignored by loader`);
          }
        } else {
          warnings.push(`${id}/settings.json: agentLogKinds.\`${code}\` must be a string or {name, icon, desc} — ignored by loader`);
        }
      }
    }
  }

  // issue.md required
  if (!fs.existsSync(path.join(folder, 'issue.md'))) {
    errors.push(`${id}/issue.md: missing`);
  }

  // Stray *.md at folder root + unknown sub-folders (loader ignores both).
  // issue.md is the body; glossary.md is the optional per-issue glossary panel.
  const rootEntries = fs.readdirSync(folder, { withFileTypes: true });
  const stray = rootEntries
    .filter((e) => e.isFile() && e.name.endsWith('.md') && e.name !== 'issue.md' && e.name !== 'glossary.md')
    .map((e) => e.name);
  if (stray.length) {
    warnings.push(`${id}/: stray .md at folder root (move to notes/?): ${stray.join(', ')}`);
  }
  for (const e of rootEntries) {
    if (e.isDirectory() && !KNOWN_SUBFOLDERS.has(e.name)) {
      warnings.push(`${id}/${e.name}/: not a known issue sub-folder (${[...KNOWN_SUBFOLDERS].join('/')}) — ignored by loader`);
    }
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
            // Canonical field is `status:`; `state:` is the legacy name.
            const rawStatus = fm.status ?? fm.state;
            if (fm.status === undefined && fm.state !== undefined) {
              warnings.push(`${id}/subtasks/${rel}: legacy \`state:\` field — run the state→status migration to rename it to \`status:\``);
            }
            if (rawStatus !== undefined && LEGACY_STATUS_MAP[rawStatus]) {
              warnings.push(`${id}/subtasks/${rel}: legacy status \`${rawStatus}\` — run the migration (→ ${LEGACY_STATUS_MAP[rawStatus]})`);
            } else if (rawStatus !== undefined && !VALID_SUBTASK_STATES.includes(rawStatus)) {
              errors.push(`${id}/subtasks/${rel}: invalid status \`${rawStatus}\` (fixed vocabulary: ${VALID_SUBTASK_STATES.join('|')})`);
            }
            if (rawStatus === undefined) {
              warnings.push(`${id}/subtasks/${rel}: no \`status:\` — defaults to open`);
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
  if (hasAIAssignee && subtaskCount === 0 && !TERMINAL_STATUSES.includes(normalizeStatus(meta.status))) {
    warnings.push(`${id}/: AI-handoff-bound issue has no subtasks — consider adding at least one as the agent's handoff anchor`);
  }

  // Free-form sub-doc folders: depth cap (max 2 levels — anything deeper is
  // ignored by the loader; depth 0 = root, depth 1 = group, depth 2 = subgroup)
  // plus schema-drift on every .md frontmatter. Brainstorm and agent-memory
  // share the notes frontmatter surface (free-form docs, no extra machinery).
  const FM_KEYS_BY_TYPE = {
    notes: NOTE_FM_KEYS,
    brainstorm: NOTE_FM_KEYS,
    'agent-memory': NOTE_FM_KEYS,
    'agent-log': AGENT_LOG_FM_KEYS,
    comments: COMMENT_FM_KEYS,
  };
  for (const sub of ['notes', 'brainstorm', 'agent-memory', 'agent-log', 'comments']) {
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

  // agent-memory: memory.md is the section's entry point (index) — expected
  // whenever the folder exists.
  const memDir = path.join(folder, 'agent-memory');
  if (fs.existsSync(memDir) && !fs.existsSync(path.join(memDir, 'memory.md'))) {
    warnings.push(`${id}/agent-memory/: no \`memory.md\` index — agents read it first; add one line per topic file`);
  }

  // agent-log grammar: the norm is NNN_<code>_<name>/ activity folders (kind
  // code in the folder name), with 0NN_ pinned meta files and milestone files
  // (leading digit ≥ 1, `iteration` frontmatter) inside. Flat files and
  // code-less folders still parse — hints only.
  const logDir = path.join(folder, 'agent-log');
  if (fs.existsSync(logDir)) {
    for (const e of fs.readdirSync(logDir, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith('.md')) {
        warnings.push(`${id}/agent-log/${e.name}: flat file at agent-log root — parses, but the convention is an NNN_<code>_<name>/ activity folder`);
        continue;
      }
      if (!e.isDirectory()) continue;

      const m = e.name.match(/^(\d{2,5})_(.+)$/);
      const rest = m ? m[2] : e.name;
      const codeMatch = rest.match(/^([a-z]{2})_(.+)$/);
      if (!m) {
        warnings.push(`${id}/agent-log/${e.name}/: no numeric order prefix — sorts last; convention is NNN_<code>_<name>/`);
      } else if (!codeMatch) {
        warnings.push(`${id}/agent-log/${e.name}/: no kind code after the prefix — renders without a symbol; convention is NNN_<code>_<name>/ (codes: ${[...effectiveKindCodes].sort().join('/')})`);
      } else if (!effectiveKindCodes.has(codeMatch[1])) {
        warnings.push(`${id}/agent-log/${e.name}/: kind code \`${codeMatch[1]}\` not in the effective set (${[...effectiveKindCodes].sort().join('/')}) — declare it in settings.json \`agentLogKinds\` or it renders without a symbol`);
      }

      // Inside an activity folder: 0NN_ = pinned meta (no iteration),
      // leading digit ≥ 1 = milestone (iteration drives the #N badge).
      let files;
      try { files = fs.readdirSync(path.join(logDir, e.name), { withFileTypes: true }); }
      catch { continue; }
      for (const f of files) {
        if (!f.isFile() || !f.name.endsWith('.md')) continue;
        const rel = `${id}/agent-log/${e.name}/${f.name}`;
        const pm = f.name.match(/^(\d{2,5})_/);
        if (!pm) continue; // unprefixed — generic drift walk already covers fm
        const isMeta = pm[1][0] === '0';
        let fm;
        try { fm = matter(fs.readFileSync(path.join(logDir, e.name, f.name), 'utf-8')).data || {}; }
        catch { continue; } // malformed fm already reported by the generic walk
        if (isMeta && fm.iteration !== undefined) {
          warnings.push(`${rel}: 0NN_ meta file carries \`iteration\` — meta files are badge-less; milestones use a leading digit ≥ 1`);
        }
        if (!isMeta && fm.iteration === undefined) {
          warnings.push(`${rel}: milestone without \`iteration:\` frontmatter — no #N badge; falls back to sequence`);
        }
        if (fm.status !== undefined) {
          const s = String(fm.status).toLowerCase().replace(/\s+/g, '-');
          if (!MILESTONE_STATUSES.has(s)) {
            warnings.push(`${rel}: status \`${fm.status}\` not in the milestone vocabulary (not-started | in-progress | success | failed) — badge won't be tinted`);
          }
        }
      }
    }
  }
}

// Reconcile drift output mode. --strict promotes drift warnings to errors;
// otherwise they stack with the regular warning list.
if (STRICT) {
  for (const w of driftWarnings) errors.push(w);
} else {
  for (const w of driftWarnings) warnings.push(w);
}

reportAndExit({
  kind: 'issues',
  root: tracker,
  subtitle: `(${listIssueFolders(tracker).length} issue folders scanned)`,
  errors,
  warnings,
  quiet: QUIET,
  json: !!args.flags.json,
});
