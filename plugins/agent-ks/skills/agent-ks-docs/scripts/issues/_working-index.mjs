/**
 * _working-index.mjs — build `02_working/00_index.md`, the table of a run's rounds.
 *
 * WHY THIS FILE EXISTS AT ALL. A scaffolded agent log shows one file, so two of
 * its three slots are invisible: `02_working/` appears only when the first round
 * is written and `03_debrief/` only if the run produces one. An agent scaffolds a
 * log, sees `01_summary.md`, and writes everything into it. The convention lives
 * in a skill that may not be loaded. Seeding the folder makes the structure
 * visible at the moment of use — and it has to be a FILE, because git does not
 * track empty directories and a bare folder would vanish on clone.
 *
 * WHY IT IS GENERATED AND NEVER TYPED. This issue has already paid for the
 * alternative: a hand-written Status column beside fourteen subtasks read
 * `review` for thirteen rows while every one of those files said `done`, for a
 * day. A status in two places with nothing keeping them honest is the defect,
 * not the number. So every cell here is READ from a round file's own
 * frontmatter, and `agent-ks check issues` re-runs this generator and compares —
 * drift is a gate failure rather than silent rot.
 *
 * WHAT EACH COLUMN COMES FROM, and nothing is inferred from a title:
 *
 *   #        the `NNN_` prefix — first two digits are the iteration
 *   Round    the iteration file's `title:`, linked
 *   Kind     its `unit:` — the work-unit flag `new-iteration --unit` records.
 *            Absent is printed as `—`; guessing it from the name is exactly the
 *            thing this file refuses to do
 *   Who      its `agent:` — the orchestrator, or the named subagent
 *   Status   its `status:`
 *   Produced the producer files of that iteration (digits 1-9), each carrying
 *            its own agent. A fan-out is ONE round with N workers, which is why
 *            producers are a cell here and never rows of their own
 *
 * `03_debrief/` is deliberately NOT seeded. Every run that does work has a
 * round; only some produce a handover, so seeding it everywhere creates an empty
 * section on most logs — the noise a deletable placeholder is meant to avoid.
 * It gets a line in the scaffolder's printed hint instead.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

/** The index's own name. Two digits, so it sorts ahead of every `NNN_` round. */
export const WORKING_INDEX = '00_index.md';

const ROUND_RE = /^(\d{2})(\d)[_-](.+)\.md$/;

const BANNER =
  '<!-- GENERATED — do not hand-edit. Every cell is read from a round file\'s own\n' +
  '     frontmatter (title / unit / agent / status); correct it there and this\n' +
  '     table follows. Rewritten by `agent-ks issue new-iteration`. -->';

/** Read the rounds in a `02_working/` directory, grouped by iteration. */
function readRounds(workingDir) {
  if (!fs.existsSync(workingDir)) return [];
  const byIteration = new Map();
  for (const e of fs.readdirSync(workingDir, { withFileTypes: true })) {
    if (!e.isFile()) continue;
    const m = e.name.match(ROUND_RE);
    if (!m) continue;
    let fm = {};
    try { fm = matter(fs.readFileSync(path.join(workingDir, e.name), 'utf-8')).data || {}; }
    catch { /* malformed frontmatter is the generic walk's finding, not ours */ }
    const entry = {
      file: e.name,
      digit: parseInt(m[2], 10),
      title: typeof fm.title === 'string' && fm.title.trim() ? fm.title.trim() : m[3].replace(/-/g, ' '),
      unit: typeof fm.unit === 'string' && fm.unit.trim() ? fm.unit.trim() : '',
      agent: typeof fm.agent === 'string' && fm.agent.trim() ? fm.agent.trim() : '',
      status: typeof fm.status === 'string' && fm.status.trim() ? fm.status.trim() : '',
    };
    const list = byIteration.get(m[1]) || [];
    list.push(entry);
    byIteration.set(m[1], list);
  }
  return [...byIteration.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([iteration, list]) => ({
      iteration,
      round: list.find((f) => f.digit === 0) || null,
      producers: list.filter((f) => f.digit !== 0).sort((a, b) => a.digit - b.digit),
    }));
}

/** Escape a `|` so a title cannot break out of its table cell. */
const cell = (s) => String(s).replace(/\|/g, '\\|');

/** The exact text `02_working/00_index.md` should contain. Pure of the filesystem
 *  once the rounds are read, so the validator can compare against it. */
export function renderWorkingIndex(workingDir) {
  const rows = readRounds(workingDir);
  const head = `---\ntitle: "Rounds"\n---\n\n${BANNER}\n\n# Rounds\n\n`;

  if (rows.length === 0) {
    return head +
      'No rounds yet. This run has done no work it has written down.\n\n' +
      '**The three slots** — `01_summary.md` is the conclusive file and the brief;\n' +
      '`02_working/` is one file per round, plus a file for each agent that produced\n' +
      'something substantial; `03_debrief/` is what leaves the run, opened only if\n' +
      'the run produces a handover.\n\n' +
      'Open the next round with `agent-ks issue new-iteration <issue> --log <log> --name <round>`.\n';
  }

  const lines = ['| # | Round | Kind | Who | Status | Produced |', '|---|---|---|---|---|---|'];
  for (const { iteration, round, producers } of rows) {
    const produced = producers.length
      ? producers.map((p) => `[${cell(p.title)}](./${p.file})${p.agent ? ` · ${cell(p.agent)}` : ''}`).join('<br>')
      : '—';
    if (!round) {
      // A producer with no round file is the validator's warning, not a reason to
      // omit the iteration — hiding it here would make the index disagree with `ls`.
      lines.push(`| ${iteration} | *(no round file)* | — | — | — | ${produced} |`);
      continue;
    }
    lines.push(
      `| ${iteration} | [${cell(round.title)}](./${round.file}) | ${cell(round.unit || '—')} ` +
      `| ${cell(round.agent || '—')} | ${cell(round.status || '—')} | ${produced} |`,
    );
  }
  return head + lines.join('\n') + '\n';
}

/** Write the index, creating `02_working/` if needed. Returns its absolute path. */
export function writeWorkingIndex(workingDir) {
  fs.mkdirSync(workingDir, { recursive: true });
  const abs = path.join(workingDir, WORKING_INDEX);
  fs.writeFileSync(abs, renderWorkingIndex(workingDir));
  return abs;
}
