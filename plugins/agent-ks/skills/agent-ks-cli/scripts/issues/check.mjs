#!/usr/bin/env bun
/**
 * issues/check.mjs — validate the structure of an issue tracker.
 *
 * Checks, in the order the agent-ks-issues skill documents them:
 *
 *   • Tracker root has settings.json with a `fields:` block (vocabulary)
 *   • Every issue folder matches YYYY-MM-DD-<slug>/
 *   • Every issue has settings.json + issue.md
 *   • Issue settings.json carries required fields and uses vocabulary values
 *   • `agentLogKinds` well-formed (2-letter codes, string or {name, icon, desc})
 *   • Subtasks have a valid `status` (the fixed eight)
 *   • Sub-folders are the known anatomy: subtasks / notes / brainstorm /
 *     plans / agent-log / agent-memory / comments (unknown dirs → warning)
 *   • Agent-log values: a run folder's settings.json status and a file's
 *     frontmatter status must be run statuses. The folder shape (00_index.md,
 *     rounds, reports) is guidance in the issues skill, not checked here
 *   • Plans: plan folders only, the reserved overview.md, stage numbering, and
 *     — the errors here — every `subtasks:` entry being exactly one plain
 *     markdown link that resolves to a subtask
 *   • --template: the five `#` headings of templates/*.md on subtasks, stages
 *     and plan overviews
 *   • Agent-memory has a memory.md index
 *   • Comments / agent-logs follow naming conventions (warned, not errored)
 *   • Stray .md at folder root (other than issue.md) → warning
 *
 * Exit code 0 = clean, 1 = errors found.
 */

import fs from 'node:fs';
import path from 'node:path';
import { readFrontmatter } from '../_frontmatter.mjs';
import { resolveTracker, listIssueFolders, readVocabulary, parseArgs, printHelp, STATUSES, TERMINAL_STATUSES, normalizeStatus, LEGACY_STATUS_MAP, MAX_SUBFOLDER_DEPTH } from './_lib.mjs';
import { readJsonChecked, reportAndExit } from '../_check-lib.mjs';
import { eachLink, isIgnorableTarget, splitAnchor, orderingPathFor, parseOrderingLabel } from '../_links.mjs';
import { parseOrderPrefixLoose } from '../_order-prefix.mjs';
import { splitSections, templateHeadings, templateSectionBody } from '../_templates.mjs';

const args = parseArgs(process.argv.slice(2));
if (args.flags.help) {
  printHelp('check issues', [
    '[--tracker <path>] [--quiet|--no-warnings] [--verbose] [--strict] [--template]',
    '',
    'Validate the structure of an issue tracker. Defaults to <content-root>/data/todo (derived from .env CONFIG_DIR).',
    'Reports errors (the loader or the renderer breaks) and warnings (convention, including unknown-key drift).',
    '',
    '  --quiet, --no-warnings   suppress warnings; only errors print',
    '  --verbose                for unknown-key warnings, also list the canonical keys',
    '  --strict                 promote unknown-key warnings to errors (exit 1 on schema drift)',
    '  --template               check the five `#` headings of templates/*.md on subtasks, stages',
    '                           and plan overviews, and that a finished file holds a result in',
    '                           `# 02 Status and Result`. Also on when the tracker root settings.json',
    '                           sets `"template": true`.',
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
const TRACKER_ROOT_KEYS = new Set(['label', 'fields', 'authors', 'views', 'draft', 'statusColors', 'template']);
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
// `iteration` is tolerated: the filename prefix owns the round number, and
// the agent-log shape is guidance, not a check.
const AGENT_LOG_FM_KEYS = new Set([
  'title', 'iteration', 'agent', 'status', 'date', 'sidebar_label', 'color',
]);
// `agent-logs` is deliberately absent: it has its own error below, because the
// fix is a move rather than a deletion and the author needs telling where to.
const PLAN_STAGE_FM_KEYS = new Set([
  'title', 'outcome', 'notes', 'who', 'status', 'subtasks', 'sidebar_label', 'color',
]);
const PLAN_SETTINGS_KEYS = new Set(['title', 'status', 'description']);
// An agent log's status is a SUBSET of the one canonical vocabulary — the same
// eight values, minus the three that describe a work item rather than a run.
// One vocabulary, one palette; the subset is a convention this validator holds,
// not a second status axis. `superseded` is excluded with `blocked` and
// `review`: a run whose scope moved elsewhere did not finish, which is
// `dropped`. Where the scope went belongs in the round's `# Outcome`.
const AGENT_LOG_STATUSES = ['open', 'in-progress', 'input-needed', 'done', 'dropped'];

// A `superseded` item must name where its scope went. The convention is a line
// opening with an arrow — `→ absorbed into phase-3 notes/10, decision D2`. Both
// the ASCII `->` and the arrow character count, and the line may be a list item
// or a blockquote, because that is how people actually write it.
const SUPERSEDED_POINTER = /^\s*(?:[-*+]\s+|>\s*)?(?:→|->)\s*\S/m;
// The advice printed with every missing-pointer warning. One sentence, one
// example — the warning is only useful if it says what to type.
const SUPERSEDED_POINTER_HINT =
  'status `superseded` means the scope moved elsewhere, so the file must say where — add a line like `→ absorbed into phase-3 notes/10, decision D2`';
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

// Template lint — opt-in per tracker (root settings.json `"template": true`)
// or per run (--template). Subtasks, stages and plan overviews have one
// skeleton each in templates/, and the five `#` headings must be present. A
// file whose status says the work is finished must hold a result in
// `# 02 Status and Result`. Warnings, not errors: the loader renders a file in
// any shape. Agent-log files have no fixed sections and are not linted here.
const TEMPLATE_LINT = !!args.flags.template || vocab?.template === true;
const RESULT_SECTION = '02 Status and Result';
const RESULT_DUE = new Set(['review', 'done', 'superseded']);
// Index leaves: any 00_-prefixed leaf is a group's index and mirrors its
// siblings' status. Same template as a work order.
const INDEX_LEAF = /^00_[^/]+\.md$/i;
function lintTemplate(fileLabel, content, templateName, rawStatus) {
  const doc = splitSections(content);
  const have = new Set(doc.sections.map((s) => s.heading));
  const missing = templateHeadings(templateName).filter((h) => !have.has(h));
  if (missing.length) {
    warnings.push(`${fileLabel}: missing template section${missing.length > 1 ? 's' : ''} ${missing.map((s) => `\`# ${s}\``).join(', ')} — the shape is templates/${templateName}.md`);
  }
  if (!RESULT_DUE.has(normalizeStatus(rawStatus))) return;
  const section = doc.sections.find((s) => s.heading === RESULT_SECTION);
  if (section && (section.body === '' || section.body === templateSectionBody(templateName, RESULT_SECTION))) {
    warnings.push(`${fileLabel}: status \`${rawStatus}\` but \`# ${RESULT_SECTION}\` holds no result — write what was produced before hand-off`);
  }
}

// A subtask points at the log that ran it from one place: the `## Agent log`
// sub-head under `# 02`. Its body is the word `none` or exactly one markdown
// link. A subtask holds the outcome; the log holds the path. Anything written
// beside the link is a copy of what the log owns.
const AGENT_LOG_HEAD = /^## Agent log\s*$/;
function lintAgentLogLine(fileLabel, content, subtaskAbs) {
  const section = splitSections(content).sections.find((s) => s.heading === RESULT_SECTION);
  if (!section) return;
  const lines = section.body.split('\n');
  const at = lines.findIndex((l) => AGENT_LOG_HEAD.test(l));
  if (at < 0) {
    warnings.push(`${fileLabel}: \`# ${RESULT_SECTION}\` has no \`## Agent log\` sub-head — write \`none\` or one link to the log that ran it`);
    return;
  }
  const body = [];
  for (const l of lines.slice(at + 1)) {
    if (/^##? /.test(l)) break;
    if (l.trim()) body.push(l.trim());
  }
  if (body.length === 1 && body[0] === 'none') return;
  const m = body.length === 1 ? body[0].match(STAGE_LINK) : null;
  if (!m) {
    warnings.push(`${fileLabel}: \`## Agent log\` must be \`none\` or exactly one markdown link, got ${body.length ? JSON.stringify(body.join(' ')) : 'nothing'}`);
    return;
  }
  const target = path.resolve(path.dirname(subtaskAbs), m[2].split('#')[0]);
  if (!fs.existsSync(target)) warnings.push(`${fileLabel}: \`## Agent log\` link → ${m[2]} does not exist`);
}

// `## Questions` under `# 01 To Do` is transient: it holds only the questions
// still unanswered, and while it holds one the subtask waits on the user, which
// is the status `input-needed`. An answered question becomes a decision under
// `# 04` and the question is deleted. The template's placeholder sentence does
// not count as a question.
const TODO_SECTION = '01 To Do';
const QUESTIONS_HEAD = /^## Questions\s*$/;
function lintQuestions(fileLabel, content, rawStatus) {
  const section = splitSections(content).sections.find((s) => s.heading === TODO_SECTION);
  if (!section) return;
  const lines = section.body.split('\n');
  const at = lines.findIndex((l) => QUESTIONS_HEAD.test(l));
  if (at < 0) return;
  const placeholder = templateSectionBody('subtask', TODO_SECTION).split('\n')
    .map((l) => l.trim()).filter((l) => l && !/^##? /.test(l));
  const body = [];
  for (const l of lines.slice(at + 1)) {
    if (/^##? /.test(l)) break;
    if (l.trim() && !placeholder.includes(l.trim())) body.push(l.trim());
  }
  if (body.length === 0) return;
  if (normalizeStatus(rawStatus) !== 'input-needed') {
    warnings.push(`${fileLabel}: \`## Questions\` holds ${body.length} open question${body.length > 1 ? 's' : ''} but the status is \`${rawStatus}\` — set \`input-needed\`, or turn the answer into a decision under \`# 04\` and delete the question`);
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

/** Exactly one markdown link and nothing else: `[text](path)`. */
const STAGE_LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/** The only `#` headings a stage may hold: the template's five sections. */
const STAGE_HEADINGS = new Set(templateHeadings('plan-stage'));

/**
 * Parse one `subtasks:` entry. It must be exactly one markdown link with
 * non-empty text: nothing before it, nothing after it. Returns the link's
 * issue-relative posix path, or null when the entry is not that shape or the
 * path escapes the issue. The renderer pulls the live title and status from
 * the target, so anything written beside the link is a copy.
 */
function stageLinkTarget(entry, stageDir, issueDir) {
  if (typeof entry !== 'string') return null;
  const m = entry.trim().match(STAGE_LINK);
  if (!m || !m[1].trim()) return null;
  const raw = m[2].split('#')[0].trim();
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
        // A log's internal labels describe its own free-form layout; only
        // links from outside a log are held to the label rule.
        if (depth === 0 && e.name === 'agent-log') continue;
        if (!e.name.startsWith('.') && depth < MAX_SUBFOLDER_DEPTH + 2) walk(abs, depth + 1);
        continue;
      }
      if (!e.isFile() || !e.name.endsWith('.md')) continue;

      let raw;
      try { raw = fs.readFileSync(abs, 'utf-8'); }
      catch { continue; }

      // Whole-document via the shared walker — fenced blocks and code spans are
      // blanked inside it, and a wrapped label is found like any other link.
      for (const { label: text, target, line } of eachLink(raw)) {
        const label = parseOrderingLabel(text);
        if (!label) continue;
        if (isIgnorableTarget(target)) continue;
        const { rel } = splitAnchor(target);
        if (!rel) continue;
        const targetAbs = path.resolve(path.dirname(abs), rel);
        if (!fs.existsSync(targetAbs)) continue;   // broken link — a different lint's job
        const actual = orderingPathFor(targetAbs);
        if (!actual || actual === label.orderingPath) continue;
        const where = `${id}/${path.relative(issueDir, abs).split(path.sep).join('/')}:${line}`;
        warnings.push(
          `${where}: ordering label \`${label.orderingPath}\` does not match its target — ` +
          `\`${rel}\` sits at \`${actual}\`. Fix the label, or reword the link text if the ` +
          `number was never an ordering label`,
        );
      }
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

    const overviewPath = path.join(planDir, PLAN_OVERVIEW);
    if (!fs.existsSync(overviewPath)) {
      warnings.push(`${label}/: no ${PLAN_OVERVIEW} — it renders at the top of the plan page and holds the plan's goal, stage order, decisions and result`);
    } else if (TEMPLATE_LINT) {
      try { lintTemplate(`${label}/${PLAN_OVERVIEW}`, readFrontmatter(fs.readFileSync(overviewPath, 'utf-8')).content || '', 'plan-overview', status); }
      catch (err) { errors.push(`${label}/${PLAN_OVERVIEW}: malformed frontmatter (${err.message})`); }
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
      try { parsed = readFrontmatter(fs.readFileSync(path.join(planDir, f.name), 'utf-8')); }
      catch (err) { errors.push(`${stageLabel}: malformed frontmatter (${err.message})`); continue; }
      const fm = parsed.data || {};
      reportDrift(stageLabel, unknownKeys(fm, PLAN_STAGE_FM_KEYS), PLAN_STAGE_FM_KEYS);

      if (fm['agent-logs'] !== undefined) {
        errors.push(`${stageLabel}: \`agent-logs:\` is retired — the frontmatter ref list is for SUBTASKS only. Link the run from the stage BODY like anything else, with an ordering label in the text: \`[010 the section loop](../../agent-log/010_lp_implement-sections/00_index.md)\``);
      }
      if (!fm.title) warnings.push(`${stageLabel}: no \`title\` — the generated heading and its anchor both come from it, so a missing title makes the stage un-linkable by name`);
      if (fm.status !== undefined && !normalizeStatus(fm.status)) {
        errors.push(`${stageLabel}: invalid status \`${fm.status}\` (fixed vocabulary: ${STATUSES.join('|')})`);
      }
      // The stage heading is generated from `title`. The only `#` headings a
      // stage holds are the template's five sections.
      for (const s of splitSections(parsed.content || '').sections) {
        if (!STAGE_HEADINGS.has(s.heading)) {
          warnings.push(`${stageLabel}: \`# ${s.heading}\` — the stage heading is generated from \`title\`; the only \`#\` headings in a stage are the five template sections`);
        }
      }
      if (TEMPLATE_LINT) lintTemplate(stageLabel, parsed.content || '', 'plan-stage', fm.status);

      // The errors that matter. A `subtasks:` entry is exactly one plain link
      // to a subtask. Three ways to fail, three messages: the entry is not that
      // shape, the path names no file, or it names a file that is not a
      // subtask (see `issueFileIndex`). The renderer draws a reference it
      // cannot resolve as broken, and nothing else says so.
      const raw = fm.subtasks;
      const list = Array.isArray(raw) ? raw : raw == null ? [] : [raw];
      for (const entry of list) {
        const target = stageLinkTarget(entry, planDir, issueDir);
        if (!target) {
          errors.push(`${stageLabel}: \`subtasks\` entry ${JSON.stringify(entry)} is not exactly one markdown link \`[title](path)\` inside the issue — nothing before it, nothing after it. The renderer reads the live title and status from the target; a mark, an emoji or a status written here is a copy`);
        } else if (index.subtasks.has(target)) {
          continue;
        } else if (index.other.has(target)) {
          errors.push(`${stageLabel}: \`subtasks\` references \`${target}\`, which exists but is not a subtask — this list schedules subtasks only, and the renderer resolves it against subtasks alone, so the plan page draws this as a broken reference. Link a run from the stage body instead`);
        } else {
          errors.push(`${stageLabel}: \`subtasks\` references \`${target}\`, which does not exist — the plan page draws it as a broken reference and the stage schedules one fewer thing than it reads as scheduling`);
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
  errors.push(`<root>/settings.json: remove \`statusColors\` — status colours are no longer configurable per tracker. Override the \`--status-<name>\` CSS variables in your theme's color.css instead, e.g. \`[data-theme="dark"] { --status-dropped: #ef4444; }\` (one per status: ${STATUSES.map((s) => `--status-${s}`).join(' ')}). CSS also lets light and dark differ, which the JSON map could not. Run migration/0.2.0_status-colors-to-css.py`);
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
  const issueBodyPath = path.join(folder, 'issue.md');
  if (!fs.existsSync(issueBodyPath)) {
    errors.push(`${id}/issue.md: missing`);
  } else if (normalizeStatus(meta.status) === 'superseded') {
    // The pointer may sit in issue.md or in a comment — a scope move is often
    // recorded as the closing comment, and either place is readable on disk.
    let pointed = false;
    try { pointed = SUPERSEDED_POINTER.test(fs.readFileSync(issueBodyPath, 'utf-8')); }
    catch { pointed = false; }
    if (!pointed) {
      const commentsDir = path.join(folder, 'comments');
      try {
        for (const f of fs.readdirSync(commentsDir)) {
          if (!f.endsWith('.md')) continue;
          if (SUPERSEDED_POINTER.test(fs.readFileSync(path.join(commentsDir, f), 'utf-8'))) {
            pointed = true;
            break;
          }
        }
      } catch { /* no comments/ folder — nothing to search */ }
    }
    if (!pointed) {
      warnings.push(`${id}/issue.md: ${SUPERSEDED_POINTER_HINT} (a comment carrying the line counts too)`);
    }
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
            const parsed = readFrontmatter(fs.readFileSync(abs, 'utf-8'));
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
            if (normalizeStatus(rawStatus) === 'superseded'
                && !SUPERSEDED_POINTER.test(parsed.content || '')) {
              warnings.push(`${id}/subtasks/${rel}: ${SUPERSEDED_POINTER_HINT}`);
            }
            if (TEMPLATE_LINT) {
              lintTemplate(`${id}/subtasks/${rel}`, parsed.content || '', 'subtask', rawStatus);
              lintAgentLogLine(`${id}/subtasks/${rel}`, parsed.content || '', abs);
              lintQuestions(`${id}/subtasks/${rel}`, parsed.content || '', rawStatus);
            }
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
        // Any Closed-category status on the index satisfies a derived `done` —
        // an index can be dropped or superseded while its siblings all finished.
        if (indexLeaf.status !== derived
            && !(derived === 'done' && TERMINAL_STATUSES.includes(indexLeaf.status))) {
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
            const fm = readFrontmatter(fs.readFileSync(path.join(absDir, e.name), 'utf-8')).data || {};
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

  // agent-log values. A run is NNN_<code>_<name>/ — one run, one goal. Its
  // shape (00_index.md, round and report files, an assets/ folder) is guidance
  // in the issues skill and is not checked: any file layout renders. Only
  // values are checked here — a status in settings.json or in a file's
  // frontmatter must be one a run can hold, and JSON and frontmatter must parse.
  const logDir = path.join(folder, 'agent-log');

  function lintAgentLogFolder(absDir, rel) {
    let files;
    try { files = fs.readdirSync(absDir, { withFileTypes: true }); }
    catch { return; }

    // Folder-level settings.json is optional. A status must be one a run can
    // hold: `blocked` and `review` describe a work item, not a run.
    const logSettings = files.find((f) => f.isFile() && /^settings\.jsonc?$/.test(f.name));
    if (logSettings) {
      const settings = readJsonChecked(path.join(absDir, logSettings.name), `${rel}/${logSettings.name}`, errors);
      if (settings && settings.status !== undefined) {
        const norm = normalizeStatus(settings.status);
        if (!norm) {
          errors.push(`${rel}/${logSettings.name}: invalid status \`${settings.status}\` (fixed vocabulary: ${STATUSES.join('|')})`);
        } else if (!AGENT_LOG_STATUSES.includes(norm)) {
          errors.push(`${rel}/${logSettings.name}: status \`${norm}\` is not one a run can hold (${AGENT_LOG_STATUSES.join('|')}). \`blocked\` and \`review\` describe work items, not runs`);
        }
      }
    }

    for (const f of files) {
      if (!f.isFile() || !f.name.endsWith('.md')) continue;
      let parsed;
      try { parsed = readFrontmatter(fs.readFileSync(path.join(absDir, f.name), 'utf-8')); }
      catch { continue; } // malformed frontmatter is reported by the generic walk
      const fm = parsed.data || {};
      const roundStatus = normalizeStatus(fm.status);
      if (fm.status !== undefined && !roundStatus) {
        errors.push(`${rel}/${f.name}: invalid status \`${fm.status}\` (fixed vocabulary: ${STATUSES.join('|')}). \`status\` says whether the round finished; what it found goes under \`## Result\``);
      } else if (roundStatus && !AGENT_LOG_STATUSES.includes(roundStatus)) {
        errors.push(`${rel}/${f.name}: status \`${roundStatus}\` is not one a round can hold (${AGENT_LOG_STATUSES.join('|')}). \`blocked\` and \`review\` describe a work item — a round ran or it did not`);
      }
    }
  }

  /**
   * Walk `agent-log/`, checking the values of every run and descending through
   * grouping folders. A folder with no kind code is a grouping folder —
   * `new-agent-log --group` creates them — so it holds runs rather than being
   * one. Loose files and unprefixed folders are left alone: the layout is
   * guidance.
   */
  function walkAgentLogDir(dir, relPrefix, groupDepth) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;

      // Folder naming is guidance. The one value check: a kind code that the
      // issue does not declare renders without a symbol.
      const m = e.name.match(/^(\d{2,5})_(.+)$/);
      const codeMatch = m ? m[2].match(/^([a-z]{2})_(.+)$/) : null;
      if (codeMatch && !effectiveKindCodes.has(codeMatch[1])) {
        warnings.push(`${relPrefix}/${e.name}/: kind code \`${codeMatch[1]}\` not in the effective set (${[...effectiveKindCodes].sort().join('/')}) — declare it in settings.json \`agentLogKinds\` or it renders without a symbol`);
      }

      if (codeMatch) {
        lintAgentLogFolder(path.join(dir, e.name), `${relPrefix}/${e.name}`);
      } else if (groupDepth < MAX_SUBFOLDER_DEPTH) {
        walkAgentLogDir(path.join(dir, e.name), `${relPrefix}/${e.name}`, groupDepth + 1);
      }
    }
  }

  if (fs.existsSync(logDir)) walkAgentLogDir(logDir, `${id}/agent-log`, 1);
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
