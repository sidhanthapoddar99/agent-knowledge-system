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
 *     plans / agent-log / agent-memory / comments (unknown dirs → warning)
 *   • Agent-log grammar: NNN_<code>_<name>/ folders, a required 01_summary.md,
 *     the numbered 02_working/ + 03_debrief/ slots, the prefix>=100 rule that
 *     separates a child activity from a slot, and iteration-file numbering
 *   • Plans: plan folders only, the reserved overview.md, stage numbering, and
 *     — the one ERROR here — every `subtasks:` reference resolving to a real
 *     subtask, because a broken reference silently under-counts a stage
 *   • Agent-memory has a memory.md index
 *   • Comments / agent-logs follow naming conventions (warned, not errored)
 *   • Stray .md at folder root (other than issue.md) → warning
 *
 * Exit code 0 = clean, 1 = errors found.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { resolveTracker, listIssueFolders, readVocabulary, parseArgs, printHelp, STATUSES, TERMINAL_STATUSES, normalizeStatus, LEGACY_STATUS_MAP, MAX_SUBFOLDER_DEPTH } from './_lib.mjs';
import { readJsonChecked, reportAndExit } from '../_check-lib.mjs';
import { MD_LINK_RE, isIgnorableTarget, splitAnchor, orderingPathFor, parseOrderingLabel, makeFenceTracker } from '../_links.mjs';
import { isRetiredAgentLogShape } from './_agent-log-shape.mjs';
import { parseOrderPrefixLoose } from '../_order-prefix.mjs';

const args = parseArgs(process.argv.slice(2));
if (args.flags.help) {
  printHelp('check issues', [
    '[--tracker <path>] [--quiet|--no-warnings] [--verbose] [--strict] [--subtask-template]',
    '',
    'Validate the structure of an issue tracker. Defaults to <content-root>/data/todo (derived from .env CONFIG_DIR).',
    'Reports errors (will fail loaders) and warnings (lint-only — including unknown-key drift).',
    '',
    '  --quiet, --no-warnings   suppress warnings; only errors print',
    '  --verbose                for unknown-key warnings, also list the canonical keys',
    '  --strict                 promote unknown-key warnings to errors (exit 1 on schema drift)',
    '  --subtask-template       lint subtasks against the five-section template (Overview / References /',
    '                           Todo list / Outcomes and Next Steps / Details) + flag review/done subtasks',
    '                           whose Outcomes still carry the PLACEHOLDER marker. Also enabled when the',
    '                           tracker root settings.json sets `"subtaskTemplate": true`.',
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
// `statusColors` is listed as KNOWN even though it is a removed feature. It has
// its own explicit error below, naming the CSS variable to use instead; leaving
// it out of this set means a tracker carrying one gets that error AND a generic
// "unknown key" drift warning for the same problem. One defect, one message.
const TRACKER_ROOT_KEYS = new Set(['label', 'fields', 'authors', 'views', 'draft', 'statusColors', 'subtaskTemplate']);
// `status` is not a valid field — statuses are code-fixed and their colours are
// theme CSS variables (see the explicit checks below).
const TRACKER_FIELD_KEYS = new Set(['priority', 'component', 'labels']);
const SUBTASK_FM_KEYS = new Set(['title', 'status', 'state', 'sidebar_label']);
const NOTE_FM_KEYS = new Set([
  'title', 'description', 'sidebar_label', 'author', 'date', 'created', 'tags',
  'color',
]);
// agent-memory shares the notes surface exactly. `plans/` moved out to a
// top-level section, so the plan-file lifecycle fields are gone from here.
const AGENT_MEMORY_FM_KEYS = new Set([...NOTE_FM_KEYS]);
// `iteration` is retired — the `011_` filename owns the number, and a
// frontmatter copy is a second place to keep it right. It stays in this set
// because it is all over the historic record, which is NOT migrated; the
// retirement is enforced on new-shape files only (under `02_working/`), where
// it is an actual mistake rather than a fact about how things used to be
// written.
const AGENT_LOG_FM_KEYS = new Set([
  'title', 'iteration', 'agent', 'status', 'date', 'sidebar_label', 'color',
]);
// `agent-logs` is deliberately ABSENT — retired 2026-08-03, and reported by its
// own error below rather than as a generic unknown-key warning, because the fix
// is a move rather than a deletion and the author needs telling where to.
const PLAN_STAGE_FM_KEYS = new Set([
  'title', 'outcome', 'notes', 'who', 'status', 'subtasks', 'sidebar_label', 'color',
]);
const PLAN_SETTINGS_KEYS = new Set(['title', 'status', 'description']);
// GitHub-flavoured callout opener, any kind. Used to check that a round marked
// `dropped` says why in prose as well as in its status.
const ROUND_FAILURE_CALLOUT = /^\s*>\s*\[!(NOTE|IMPORTANT|WARNING|CAUTION|TIP)\]/m;
// An agent log's status is a SUBSET of the one canonical vocabulary — the same
// seven values, minus the two that describe a work item rather than a run.
// One vocabulary, one palette; the subset is a convention this validator holds,
// not a second status axis.
const AGENT_LOG_STATUSES = ['open', 'in-progress', 'input-needed', 'done', 'dropped'];
const COMMENT_FM_KEYS = new Set(['author', 'date', 'title', 'sidebar_label']);

// Known issue sub-folders (the anatomy) + colocated assets. Anything else at
// the issue root is probably a typo — the loader silently ignores it.
const KNOWN_SUBFOLDERS = new Set([
  'subtasks', 'notes', 'brainstorm', 'plans', 'agent-log', 'agent-memory', 'comments', 'assets',
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

// Subtask five-section template lint — opt-in per tracker (root settings.json
// `"subtaskTemplate": true`) or per run (--subtask-template). Convention, not
// loader-enforced, so everything it finds is a warning. Two rules:
//   1. every subtask carries the five section headings;
//   2. a Review/Closed-category subtask must not still carry the PLACEHOLDER
//      marker in its "Outcomes and Next Steps" section.
const TEMPLATE_LINT = !!args.flags['subtask-template'] || vocab?.subtaskTemplate === true;
const TEMPLATE_SECTIONS = ['Overview', 'References', 'Todo list', 'Outcomes and Next Steps', 'Details'];
const OUTCOME_DUE_STATUSES = new Set(['review', 'done']);
// Index leaves (any 00_-prefixed leaf — a group's series guide; naming it
// 00_overview.md / 00_index.md is good practice, not a mandate) are exempt:
// they are a status surface, not a work order.
const INDEX_LEAF = /^00_[^/]+\.md$/i;
function lintSubtaskTemplate(fileLabel, content, rawStatus) {
  if (INDEX_LEAF.test(fileLabel.split('/').pop())) return;
  const missing = TEMPLATE_SECTIONS.filter(
    (s) => !new RegExp(`^#{1,3} +${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'im').test(content),
  );
  if (missing.length) {
    warnings.push(`${fileLabel}: missing template section${missing.length > 1 ? 's' : ''} ${missing.map((s) => `\`# ${s}\``).join(', ')}`);
  }
  if (OUTCOME_DUE_STATUSES.has(normalizeStatus(rawStatus))) {
    // Scope the marker search to the Outcomes section when it exists.
    const m = content.match(/^#{1,3} +Outcomes and Next Steps\s*$([\s\S]*?)(?=^#{1,3} |\n*$(?![\s\S]))/im);
    const scope = m ? m[1] : content;
    if (/\bPLACEHOLDER\b/.test(scope)) {
      warnings.push(`${fileLabel}: status \`${rawStatus}\` but "Outcomes and Next Steps" still carries the PLACEHOLDER marker — write the outcomes before hand-off`);
    }
  }
}

// ---- plans/ ----------------------------------------------------------------
// A plan is a SCHEDULE, and its whole design is that it stores no status of its
// own about the work: stages REFERENCE subtasks and the renderer pulls their
// live status. That makes exactly one thing able to go silently wrong, and it
// is the one thing errored here — a reference that resolves to nothing.
//
// It shrinks the count beside it in the plan table, and a wrong count reads
// exactly like a right one. Every other rule in this section is a warning.

const PLAN_OVERVIEW = 'overview.md';

/** Resolve one `subtasks:`/`agent-logs:` entry (a markdown link, or a bare
 *  path) to an issue-relative posix path. Mirrors `planRefTarget` in the
 *  loader — both sides of the wall parse the same grammar. */
function planRefTarget(entry, stageDir, issueDir) {
  if (typeof entry !== 'string') return null;
  const link = entry.match(/\]\(([^)]+)\)/);
  const raw = (link ? link[1] : entry).trim().split('#')[0].trim();
  if (!raw) return null;
  const rel = path.relative(issueDir, path.resolve(stageDir, raw));
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join('/');
}

/**
 * Two indexes of issue-relative paths that name a real file: the ones a
 * `subtasks:` ref MAY point at, and the ones it may not.
 *
 * **Split on purpose.** This was one flat index over `subtasks/` AND
 * `agent-log/`, from when `agent-logs:` was a second frontmatter ref list
 * resolved by the same helper. Retiring that list left the index wider than the
 * only field it still guards — while the RENDERER resolves `subtasks:` against
 * subtasks alone (`server/helpers.ts`, `resolvePlanStage`). So a stage pointing
 * `subtasks:` at an agent-log file passed this gate clean and then drew the red
 * "resolves to nothing" block on its own plan page.
 *
 * Not hypothetical: it is the exact move the `agent-logs:` retirement invites —
 * off the retired list and into the only other structured one on the stage.
 * `other` exists so the error can say what is actually wrong, rather than
 * "does not exist" about a file that plainly does.
 */
function issueFileIndex(issueDir) {
  const collect = (sub) => {
    const seen = new Set();
    const root = path.join(issueDir, sub);
    if (!fs.existsSync(root)) return seen;
    const walk = (absDir, depth) => {
      let entries;
      try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
      catch { return; }
      for (const e of entries) {
        const abs = path.join(absDir, e.name);
        if (e.isFile() && e.name.endsWith('.md')) {
          seen.add(path.relative(issueDir, abs).split(path.sep).join('/'));
        } else if (e.isDirectory() && depth < MAX_SUBFOLDER_DEPTH) {
          walk(abs, depth + 1);
        }
      }
    };
    walk(root, 0);
    return seen;
  };
  return { subtasks: collect('subtasks'), other: collect('agent-log') };
}

/**
 * ORDERING LABELS — link text that opens with the target's numeric path, e.g.
 * `[040/100 the migration script](../../subtasks/040_execution/100_x.md)`. The
 * numbers let a reader match the link to the numbered entry in the sidebar.
 *
 * The label is derived from the target, so it is the same fact in two places —
 * and a stale one is INVISIBLE, because the link still resolves and only lies
 * about where the target sits. `agent-ks move` keeps labels current for moves
 * it performs; this catches the rest (a hand `git mv`, an editor rename, a
 * hand-typed label).
 *
 * A WARNING rather than an error, on purpose. The convention is optional, and
 * link text that legitimately opens with a bare number and a space — rare, but
 * possible — would otherwise block the gate over wording. The fix for such a
 * false positive is to reword; the message says so.
 */
function lintOrderingLabels(id, issueDir) {
  const walk = (absDir, depth) => {
    let entries;
    try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
      const abs = path.join(absDir, e.name);
      if (e.isDirectory()) {
        if (!e.name.startsWith('.') && depth < MAX_SUBFOLDER_DEPTH + 2) walk(abs, depth + 1);
        continue;
      }
      if (!e.isFile() || !e.name.endsWith('.md')) continue;

      let lines;
      try { lines = fs.readFileSync(abs, 'utf-8').split(/\r?\n/); }
      catch { continue; }

      const isProse = makeFenceTracker();
      lines.forEach((lineText, idx) => {
        if (!isProse(lineText)) return;   // illustrative link in a fenced example
        MD_LINK_RE.lastIndex = 0;
        let m;
        while ((m = MD_LINK_RE.exec(lineText)) !== null) {
          const [, , text, target] = m;
          const label = parseOrderingLabel(text);
          if (!label) continue;
          if (isIgnorableTarget(target)) continue;
          const { rel } = splitAnchor(target);
          if (!rel) continue;
          const targetAbs = path.resolve(path.dirname(abs), rel);
          if (!fs.existsSync(targetAbs)) continue;   // broken link — a different lint's job
          const actual = orderingPathFor(targetAbs);
          if (!actual || actual === label.orderingPath) continue;
          const where = `${id}/${path.relative(issueDir, abs).split(path.sep).join('/')}:${idx + 1}`;
          warnings.push(
            `${where}: ordering label \`${label.orderingPath}\` does not match its target — ` +
            `\`${rel}\` sits at \`${actual}\`. Fix the label, or reword the link text if the ` +
            `number was never an ordering label`,
          );
        }
      });
    }
  };
  walk(issueDir, 0);
}

function lintPlans(id, issueDir) {
  const plansDir = path.join(issueDir, 'plans');
  if (!fs.existsSync(plansDir)) return;

  let entries;
  try { entries = fs.readdirSync(plansDir, { withFileTypes: true }); }
  catch { return; }

  const index = issueFileIndex(issueDir);
  const plans = [];

  for (const e of entries) {
    if (e.isFile()) {
      warnings.push(`${id}/plans/${e.name}: plans/ holds plan FOLDERS and nothing else — a loose file here is never rendered. Standing questions that outlive every plan belong in the issue's notes/`);
      continue;
    }
    if (!e.isDirectory()) continue;

    const planDir = path.join(plansDir, e.name);
    const label = `${id}/plans/${e.name}`;
    // `parseOrderPrefixLoose`, not a hand-written regex — the grammar is 2–5
    // digits and the LOADER uses exactly this parser. A local `\d{1,5}` used to
    // accept `1_decoder`, so the warning below never fired while the loader read
    // the folder as unprefixed; unprefixed sorts last, and the active plan is
    // the last one, so a typo silently promoted the wrong plan to active.
    const planPosition = parseOrderPrefixLoose(e.name).position;
    if (planPosition === null) {
      warnings.push(`${label}/: no numeric prefix (the grammar is 2–5 digits, so \`1_\` does not count) — sorts last, and "which plan is active" is derived from the highest number, so this becomes the active plan. Convention is NN_<name>/`);
    }

    const settingsPath = path.join(planDir, 'settings.json');
    let status = 'open';
    if (fs.existsSync(settingsPath)) {
      const settings = readJsonChecked(settingsPath, `${label}/settings.json`, errors);
      if (settings) {
        reportDrift(`${label}/settings.json`, unknownKeys(settings, PLAN_SETTINGS_KEYS), PLAN_SETTINGS_KEYS);
        if (!settings.title) warnings.push(`${label}/settings.json: no \`title\` — the sidebar falls back to the folder slug`);
        if (settings.status !== undefined) {
          const norm = normalizeStatus(settings.status);
          if (!norm) errors.push(`${label}/settings.json: invalid status \`${settings.status}\` (fixed vocabulary: ${STATUSES.join('|')})`);
          else status = norm;
        }
      }
    } else {
      warnings.push(`${label}/: no settings.json — the plan renders with a slug-derived title and status \`open\``);
    }

    if (!fs.existsSync(path.join(planDir, PLAN_OVERVIEW))) {
      warnings.push(`${label}/: no ${PLAN_OVERVIEW} — it renders at the top of the plan page and is where the \`## Closed\` record goes when the plan ends`);
    }

    let planEntries;
    try { planEntries = fs.readdirSync(planDir, { withFileTypes: true }); }
    catch { continue; }

    const stagePositions = new Map();
    for (const f of planEntries) {
      if (f.isDirectory()) {
        warnings.push(`${label}/${f.name}/: a plan folder holds stage FILES only — nested folders are not read. If this is a body of work of its own it is another plan`);
        continue;
      }
      if (!f.isFile() || !f.name.endsWith('.md') || f.name === PLAN_OVERVIEW) continue;

      const stageLabel = `${label}/${f.name}`;
      // Same parser as the loader — see the plan-folder case above. A local
      // 1-digit-tolerant regex also recorded a stage id the loader does not
      // have, so `5_a.md` beside `05_b.md` was reported as a duplicate that
      // exists only in the validator.
      const stagePos = parseOrderPrefixLoose(f.name.replace(/\.md$/, '')).position;
      if (stagePos === null) {
        warnings.push(`${stageLabel}: no numeric prefix (the grammar is 2–5 digits, so \`5_\` does not count) — the prefix is both the stage's ORDER and its id ("stage 20"), so a stage without one cannot be referred to`);
      } else {
        const pos = stagePos;
        if (stagePositions.has(pos)) {
          errors.push(`${stageLabel}: stage ${pos} is also claimed by \`${stagePositions.get(pos)}\` — the prefix is the stage id, so two stages cannot share one`);
        } else {
          stagePositions.set(pos, f.name);
        }
      }

      let parsed;
      try { parsed = matter(fs.readFileSync(path.join(planDir, f.name), 'utf-8')); }
      catch (err) { errors.push(`${stageLabel}: malformed frontmatter (${err.message})`); continue; }
      const fm = parsed.data || {};
      reportDrift(stageLabel, unknownKeys(fm, PLAN_STAGE_FM_KEYS), PLAN_STAGE_FM_KEYS);

      if (fm['agent-logs'] !== undefined) {
        errors.push(`${stageLabel}: \`agent-logs:\` is retired — the frontmatter ref list is for SUBTASKS only. Link the run from the stage BODY like anything else, with an ordering label in the text: \`[010/01 the section loop](../../agent-log/010_lp_implement-sections/01_summary.md)\``);
      }
      if (!fm.title) warnings.push(`${stageLabel}: no \`title\` — the generated heading and its anchor both come from it, so a missing title makes the stage un-linkable by name`);
      if (fm.status !== undefined && !normalizeStatus(fm.status)) {
        errors.push(`${stageLabel}: invalid status \`${fm.status}\` (fixed vocabulary: ${STATUSES.join('|')})`);
      }
      if (/^#\s+/m.test(parsed.content || '')) {
        warnings.push(`${stageLabel}: carries an \`# H1\` — the heading is GENERATED as "<prefix> · <title>" on the plan page, so this duplicates a name the frontmatter owns`);
      }

      // The one error that matters. A ref the RENDERER cannot resolve is drawn
      // as a broken reference on the plan page, and nothing else says so — so
      // this must reject exactly what `resolvePlanStage` rejects, no wider and
      // no narrower. Two ways to miss, and they need different messages: the
      // path names nothing at all, or it names a real file that is not a
      // subtask (see `issueFileIndex`).
      for (const [field, raw] of [['subtasks', fm.subtasks]]) {
        const list = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
        for (const entry of list) {
          const target = planRefTarget(entry, planDir, issueDir);
          if (!target) {
            errors.push(`${stageLabel}: \`${field}\` entry ${JSON.stringify(entry)} has no parsable target (expected a markdown link or a path inside the issue)`);
          } else if (index.subtasks.has(target)) {
            continue;
          } else if (index.other.has(target)) {
            errors.push(`${stageLabel}: \`${field}\` references \`${target}\`, which EXISTS but is not a subtask — this list schedules subtasks and nothing else, and the renderer resolves it against subtasks alone, so the plan page draws this as a broken reference. Link a run from the stage BODY instead, with an ordering label in the text: \`[010/01 the section loop](../../agent-log/010_lp_implement-sections/01_summary.md)\``);
          } else {
            errors.push(`${stageLabel}: \`${field}\` references \`${target}\`, which does not exist — the plan page draws it as a broken reference and the stage silently schedules one fewer thing than it reads as scheduling`);
          }
        }
      }
    }

    plans.push({ folder: e.name, position: planPosition, status });
  }

  // One plan open at a time is CONVENTION, not enforcement (decided 2026-08-02),
  // so this is a hint. The derivation still degrades correctly with two open:
  // the higher number wins, visibly, rather than becoming ambiguous.
  const open = plans.filter((p) => !TERMINAL_STATUSES.includes(p.status));
  if (open.length > 1) {
    warnings.push(`${id}/plans/: ${open.length} plans are open (${open.map((p) => p.folder).join(', ')}) — the active plan is derived as the highest-numbered non-closed one, so the lower ones read as forgotten. Close them, or say so in their overview.md`);
  }
}

// Schema-drift on tracker root + its fields block
reportDrift('<root>/settings.json', unknownKeys(vocab, TRACKER_ROOT_KEYS), TRACKER_ROOT_KEYS);
reportDrift('<root>/settings.json (fields)', unknownKeys(vocab?.fields, TRACKER_FIELD_KEYS), TRACKER_FIELD_KEYS);

// NOTHING about status is per-tracker. The values are code-fixed (a
// `fields.status` block's `values` list would read as authoritative), and since
// colours moved to theme CSS, `statusColors` is forbidden too. Both are errors
// rather than ignored keys: a settings block that silently stops applying
// surfaces weeks later as "the colours look wrong", with nothing pointing at it.
if (vocab?.fields?.status) {
  errors.push(`<root>/settings.json: remove \`fields.status\` — statuses are fixed in code (${STATUSES.join('|')}), and their colours are theme CSS variables, not settings (covered by a repo-root migration/ script — run the migration chain)`);
}
if (vocab?.statusColors) {
  errors.push(`<root>/settings.json: remove \`statusColors\` — status colours are no longer configurable per tracker. Override the \`--status-<name>\` CSS variables in your theme's color.css instead, e.g. \`[data-theme="dark"] { --status-dropped: #ef4444; }\` (one per status: ${STATUSES.map((s) => `--status-${s}`).join(' ')}). CSS also lets light and dark differ, which the JSON map could not. Run migration/0.1.3_status-colors-to-css.py`);
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

  // Subtasks (recursive — nested grouping folders up to MAX_SUBFOLDER_DEPTH).
  // Folder = grouping label only; no folder body file. An optional
  // settings.json on a group folder may set its display title.
  const subDir = path.join(folder, 'subtasks');
  let subtaskCount = 0;
  if (fs.existsSync(subDir)) {
    function walkSubtasks(absDir, segments) {
      let entries;
      try { entries = fs.readdirSync(absDir, { withFileTypes: true }); }
      catch { return; }
      // Per-folder tally for the index-leaf derived-status rule: the index
      // mirrors its SIBLINGS (leaves in this folder, index excluded).
      let indexLeaf = null; // { rel, status }
      const siblingStatuses = [];
      for (const e of entries) {
        if (e.isDirectory()) {
          if (segments.length >= MAX_SUBFOLDER_DEPTH) {
            warnings.push(`${id}/subtasks/${[...segments, e.name].join('/')}/: exceeds ${MAX_SUBFOLDER_DEPTH}-level depth cap, ignored by loader`);
            continue;
          }
          walkSubtasks(path.join(absDir, e.name), [...segments, e.name]);
        } else if (e.isFile() && e.name.endsWith('.md')) {
          subtaskCount++;
          const rel = [...segments, e.name].join('/');
          const abs = path.join(absDir, e.name);
          try {
            const parsed = matter(fs.readFileSync(abs, 'utf-8'));
            const fm = parsed.data || {};
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
            if (TEMPLATE_LINT) lintSubtaskTemplate(`${id}/subtasks/${rel}`, parsed.content || '', rawStatus);
            if (INDEX_LEAF.test(e.name)) indexLeaf = { rel, status: normalizeStatus(rawStatus) };
            else siblingStatuses.push(normalizeStatus(rawStatus));
          } catch (err) {
            errors.push(`${id}/subtasks/${rel}: malformed frontmatter (${err.message})`);
          }
        }
      }
      // Index-leaf derived status: open (all siblings open) → in-progress
      // (any sibling non-open) → done (all siblings Closed: done/dropped).
      if (indexLeaf && siblingStatuses.length > 0) {
        const allOpen = siblingStatuses.every((s) => s === 'open');
        const allClosed = siblingStatuses.every((s) => TERMINAL_STATUSES.includes(s));
        const derived = allClosed ? 'done' : allOpen ? 'open' : 'in-progress';
        if (indexLeaf.status !== derived && !(derived === 'done' && indexLeaf.status === 'dropped')) {
          warnings.push(`${id}/subtasks/${indexLeaf.rel}: index-leaf status \`${indexLeaf.status}\` disagrees with its siblings — derived \`${derived}\` (open=all-open, in-progress=any started, done=all closed)`);
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

  // Free-form sub-doc folders: depth cap (MAX_SUBFOLDER_DEPTH levels — anything
  // deeper is ignored by the loader; depth 0 = files at root, each nested folder
  // adds a level) plus schema-drift on every .md frontmatter. Brainstorm and
  // agent-memory share the notes frontmatter surface (free-form docs).
  const FM_KEYS_BY_TYPE = {
    notes: NOTE_FM_KEYS,
    brainstorm: NOTE_FM_KEYS,
    'agent-memory': AGENT_MEMORY_FM_KEYS,
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
          if (segments.length >= MAX_SUBFOLDER_DEPTH) {
            warnings.push(`${id}/${sub}/${[...segments, e.name].join('/')}/: exceeds ${MAX_SUBFOLDER_DEPTH}-level depth cap, ignored by loader`);
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

  // plans/: the schedule section. `plans/` holds plan folders and nothing else,
  // each exactly one level deep.
  lintPlans(id, folder);
  lintOrderingLabels(id, folder);

  // agent-log grammar. An agent log is NNN_<code>_<name>/ — one run, one goal —
  // holding 01_summary.md (required) and the numbered 02_working/ + 03_debrief/
  // slots, plus any number of CHILD agent logs.
  //
  // Slot or child is ARITHMETIC: a nested folder with a prefix below 100 is one
  // of the run's own slots, 100 and up is a child activity. That replaced a
  // hard-coded {working, debrief} name set, which could not admit a fourth slot
  // and silently forbade a child ever being *named* `working`. Mirrors
  // AGENT_LOG_CHILD_MIN_PREFIX in src/loaders/issues.ts.
  const logDir = path.join(folder, 'agent-log');
  const CHILD_MIN_PREFIX = 100;
  const SLOT_NAMES = { '01': '01_summary.md', '02': '02_working', '03': '03_debrief' };
  /** A nested folder is a slot (not a child activity) when its prefix is < 100,
   *  or when it has no prefix at all — an unprefixed folder is not an activity,
   *  and reading it as one would invent a run that does not exist. */
  const isSlotFolder = (name) => {
    const { position } = parseOrderPrefixLoose(name);
    return position === null || position < CHILD_MIN_PREFIX;
  };

  function lintAgentLogFolder(absDir, rel, depth) {
    let files;
    try { files = fs.readdirSync(absDir, { withFileTypes: true }); }
    catch { return; }

    // Folder-level settings.json — OPTIONAL by design. Absent is not a finding:
    // an agent log without one renders a defined grey, which is deliberately
    // distinct from `open`. What is a finding is a status the vocabulary does
    // not contain, or one of the two that mean nothing for a run.
    const logSettings = files.find((f) => f.isFile() && /^settings\.jsonc?$/.test(f.name));
    if (logSettings) {
      const settings = readJsonChecked(path.join(absDir, logSettings.name), `${rel}/${logSettings.name}`, errors);
      if (settings && settings.status !== undefined) {
        const norm = normalizeStatus(settings.status);
        if (!norm) {
          errors.push(`${rel}/${logSettings.name}: invalid status \`${settings.status}\` (fixed vocabulary: ${STATUSES.join('|')})`);
        } else if (!AGENT_LOG_STATUSES.includes(norm)) {
          errors.push(`${rel}/${logSettings.name}: status \`${norm}\` is not meaningful for a RUN — an agent log is open, running, waiting on an answer, finished, or abandoned (${AGENT_LOG_STATUSES.join('|')}). \`blocked\` and \`review\` describe work items, not runs`);
        }
      }
    }

    // Existing agent logs are NOT migrated: "history stays as written; this
    // governs what is recorded next" (notes/20_agent-log-structure.md). So the
    // new-shape rules are skipped entirely — and silently — on a folder written
    // in the old one. Warning here would demand work that was deliberately
    // decided against, and 289 warnings nobody will act on is how a validator
    // stops being read at all, taking the real findings down with it.
    if (isRetiredAgentLogShape(files.map((f) => ({ name: f.name, isFile: f.isFile() })))) return;

    if (!files.some((f) => f.isFile() && f.name === '01_summary.md')) {
      warnings.push(`${rel}/: no \`01_summary.md\` — it is the one conclusive file for the run (State / Goal / Todo / Out of Scope / Outcome), and it IS the brief agents are pointed at`);
    }

    // The three slots are numbered so their READ ORDER is stated in the filename
    // rather than enforced by a sort rule in the layout. An unnumbered `working/`
    // or `debrief/` still renders — it just sorts by name into the middle of the
    // child activities, which is the one thing the numbering exists to prevent.
    for (const f of files) {
      const base = f.name.replace(/\.md$/, '');
      if (/^(summary|working|debrief)$/.test(base)) {
        const want = base === 'summary' ? '01_summary.md' : base === 'working' ? '02_working/' : '03_debrief/';
        warnings.push(`${rel}/${f.name}: unnumbered slot — rename to \`${want}\`. The prefix is what puts the run's own slots ahead of its child activities (which start at ${CHILD_MIN_PREFIX}); without it this sorts lexically among them`);
      }
    }

    // Iteration files. First two digits = the iteration, last = which file
    // within it (0 = the iteration file, 1-9 = a producer's own file).
    const workingDir = path.join(absDir, '02_working');
    if (fs.existsSync(workingDir)) {
      const byIteration = new Map();
      for (const f of fs.readdirSync(workingDir, { withFileTypes: true })) {
        const isDoc = f.isFile() && f.name.endsWith('.md');
        if (!isDoc && !f.isDirectory()) continue;
        const base = f.name.replace(/\.md$/, '');
        const pm = base.match(/^(\d{2})(\d)[_-]/);
        if (!pm) {
          if (/^\d/.test(base)) {
            warnings.push(`${rel}/02_working/${f.name}: prefix is not NNN_ — the first two digits are the iteration and the last is which file within it (0 = the iteration file, 1-9 = producers)`);
          }
          continue;
        }
        const key = pm[1];
        const list = byIteration.get(key) || [];
        list.push({ name: f.name, digit: parseInt(pm[2], 10) });
        byIteration.set(key, list);

        if (!isDoc) continue;
        let fm, body;
        try {
          const parsed = matter(fs.readFileSync(path.join(workingDir, f.name), 'utf-8'));
          fm = parsed.data || {};
          body = parsed.content || '';
        } catch { continue; } // malformed fm already reported by the generic walk
        if (fm.iteration !== undefined) {
          warnings.push(`${rel}/02_working/${f.name}: carries \`iteration:\` — retired. The \`${pm[1]}${pm[2]}_\` filename owns the number, and a frontmatter copy is a second place to keep it right`);
        }
        const iterStatus = normalizeStatus(fm.status);
        if (fm.status !== undefined && !iterStatus) {
          errors.push(`${rel}/02_working/${f.name}: invalid status \`${fm.status}\` (fixed vocabulary: ${STATUSES.join('|')}). \`status\` says whether the agent FINISHED; what it found goes in \`# Outcome\``);
        } else if (iterStatus && !AGENT_LOG_STATUSES.includes(iterStatus)) {
          errors.push(`${rel}/02_working/${f.name}: status \`${iterStatus}\` is not meaningful for a ROUND (${AGENT_LOG_STATUSES.join('|')}). \`blocked\` and \`review\` describe a work item — a round either ran or it did not`);
        }
        // A round that did not land carries TWO signals, and they do different
        // jobs: `status: dropped` is the scannable one, the callout is the one
        // that says why. Neither substitutes for the other — a bare `dropped`
        // compresses the only useful facts (what failed, what it cost, what was
        // learned) into a word that reads as if it already told you them.
        if (iterStatus === 'dropped' && !ROUND_FAILURE_CALLOUT.test(body)) {
          warnings.push(`${rel}/02_working/${f.name}: \`status: dropped\` with no callout — a round that did not land says why in a \`> [!WARNING]\` / \`> [!IMPORTANT]\` callout. The status makes it scannable; the callout is what a reader actually needs`);
        }
      }
      for (const [iteration, list] of byIteration) {
        if (list.length > 1 && !list.some((f) => f.digit === 0)) {
          warnings.push(`${rel}/02_working/: iteration ${iteration} has ${list.length} producer files but no iteration file (\`${iteration}0_…\`) — the round's own record is what ties them together`);
        }
      }
    }

    for (const f of files) {
      if (f.isFile() && f.name.endsWith('.md') && f.name !== '01_summary.md') {
        warnings.push(`${rel}/${f.name}: loose file at the agent log's root — iteration files go in 02_working/, anything leaving the run goes in 03_debrief/`);
        continue;
      }
      if (!f.isDirectory()) continue;
      if (isSlotFolder(f.name)) {
        // A slot, by prefix. Name it as one, or a reader has to guess.
        //
        // A bare `working`/`debrief` is skipped here because the unnumbered-slot
        // pass above already reported it, with the exact rename. Two warnings
        // for one problem is how a validator teaches people to skim it.
        if (/^(working|debrief)$/.test(f.name)) continue;
        if (f.name !== '02_working' && f.name !== '03_debrief') {
          warnings.push(`${rel}/${f.name}/: prefix is below ${CHILD_MIN_PREFIX}, so this reads as one of the run's own slots rather than a child activity — the slots are \`${SLOT_NAMES['02']}/\` and \`${SLOT_NAMES['03']}/\`. A child activity is \`NXX_<code>_<name>/\` with a prefix of ${CHILD_MIN_PREFIX} or more`);
        }
        continue;
      }

      // Prefix >= 100 — a CHILD agent log.
      const childRel = `${rel}/${f.name}`;
      const m = f.name.match(/^(\d{2,5})_(.+)$/);
      const codeMatch = m ? m[2].match(/^([a-z]{2})_(.+)$/) : null;
      if (!m) {
        warnings.push(`${childRel}/: no numeric order prefix — sorts last; a child agent log is NXX_<code>_<name>/ with a prefix of ${CHILD_MIN_PREFIX} or more`);
      } else if (!codeMatch) {
        warnings.push(`${childRel}/: no kind code after the prefix — renders without a symbol (codes: ${[...effectiveKindCodes].sort().join('/')})`);
      } else if (!effectiveKindCodes.has(codeMatch[1])) {
        warnings.push(`${childRel}/: kind code \`${codeMatch[1]}\` not in the effective set (${[...effectiveKindCodes].sort().join('/')}) — declare it in settings.json \`agentLogKinds\` or it renders without a symbol`);
      }
      // Depth budget: agent-log/<log>/<child>/working/<producer-folder>/ already
      // reaches the loader's cap. Overflow is SILENT there — no page, no error,
      // just a console warning nobody reads — so it is an ERROR here.
      if (depth + 2 >= MAX_SUBFOLDER_DEPTH) {
        errors.push(`${childRel}/: nesting reaches the loader's ${MAX_SUBFOLDER_DEPTH}-level cap, past which content is silently DROPPED (no page, no error). Two levels of child agent log is the working ceiling — deeper means the nesting is encoding when work happened rather than what it was for`);
        continue;
      }
      lintAgentLogFolder(path.join(absDir, f.name), childRel, depth + 1);
    }
  }

  if (fs.existsSync(logDir)) {
    for (const e of fs.readdirSync(logDir, { withFileTypes: true })) {
      if (e.isFile() && e.name.endsWith('.md')) {
        warnings.push(`${id}/agent-log/${e.name}: flat file at agent-log root — parses, but the convention is an NNN_<code>_<name>/ agent-log folder`);
        continue;
      }
      if (!e.isDirectory()) continue;

      const m = e.name.match(/^(\d{2,5})_(.+)$/);
      const codeMatch = m ? m[2].match(/^([a-z]{2})_(.+)$/) : null;
      if (!m) {
        warnings.push(`${id}/agent-log/${e.name}/: no numeric order prefix — sorts last; convention is NNN_<code>_<name>/`);
      } else if (!codeMatch) {
        warnings.push(`${id}/agent-log/${e.name}/: no kind code after the prefix — renders without a symbol; convention is NNN_<code>_<name>/ (codes: ${[...effectiveKindCodes].sort().join('/')})`);
      } else if (!effectiveKindCodes.has(codeMatch[1])) {
        warnings.push(`${id}/agent-log/${e.name}/: kind code \`${codeMatch[1]}\` not in the effective set (${[...effectiveKindCodes].sort().join('/')}) — declare it in settings.json \`agentLogKinds\` or it renders without a symbol`);
      }

      // A grouping folder (no kind code) holds agent logs rather than being one;
      // recursing into it as a log would demand an 01_summary.md it should not have.
      if (codeMatch) lintAgentLogFolder(path.join(logDir, e.name), `${id}/agent-log/${e.name}`, 1);
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
