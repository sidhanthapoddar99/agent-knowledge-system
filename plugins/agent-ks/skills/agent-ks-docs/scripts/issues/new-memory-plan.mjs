#!/usr/bin/env bun
/**
 * new-memory-plan.mjs — open the next PLAN file in an issue's agent-memory.
 *
 * `agent-memory/plans/` holds the live picture: what's left, in what order, and
 * who is blocked. It uses two reserved numbering bands —
 *
 *   0NN_plan-<three-words>.md   sequential plan files; HIGHEST NUMBER = ACTIVE
 *   1NN_<standing>.md           standing files spanning every plan
 *
 * — and one rule that this command exists to make STRUCTURAL rather than merely
 * documented: **one plan open at a time.** A new plan may only open once the
 * current one is closed (frontmatter `plan: closed`, or a `## Closed` section).
 * Without enforcement, plan documents pile up, each reads as authoritative, and
 * nothing says which is live — which is the exact failure the numbering exists
 * to prevent.
 *
 * Creates `agent-memory/` + `memory.md` if absent, and seeds the standing
 * question list the first time `plans/` is created. `knowledge/` and `history/`
 * are NOT scaffolded — you grow into those; an empty bucket is noise.
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import {
  resolveTracker, isInsideAllowed, readIssueMeta, pad, todayISO,
  parseArgs, printHelp, relForLog,
} from './_lib.mjs';

const args = parseArgs(process.argv.slice(2));
const id = args._[0];
const rawName = args.flags.name && args.flags.name !== true ? String(args.flags.name) : null;

if (args.flags.help || !id || !rawName) {
  printHelp('issue new-memory-plan', [
    '<issue-id> --name <three-words> [--title <text>] [--goal <text>] [--close] [--force] [--json] [--tracker <path>]',
    '',
    'Open the next plan file in agent-memory/plans/, seeded with the plan template',
    '(Goal / Scope + the cycle table / one section per cycle / Not in this plan /',
    'Notes / Closed). Creates agent-memory/ + memory.md if absent, adds the index',
    'line, and seeds 101_questions-to-answer.md when plans/ is created.',
    '',
    'ONE PLAN OPEN AT A TIME: this refuses if the current highest plan is still',
    'open. Close it first (--close), or override deliberately (--force).',
    '',
    '--name    kebab-case plan slug, ~3 words (sanitised to [a-z0-9-]) — required.',
    '          "001_plan.md" is anonymous; the slug is what makes a CLOSED plan',
    '          identifiable years later without opening it',
    '--title   frontmatter title (default: "Plan NNN — <de-kebabed name>")',
    '--goal    seed the Goal section instead of its placeholder callout',
    '--close   close the current active plan first (stamps plan: closed + a',
    '          `## Closed` section for you to fill in), then open the new one',
    '--force   open a new plan even though the current one is still open',
    '--json    print the created file + what it superseded as JSON',
  ]);
  process.exit(id && rawName ? 0 : 1);
}

const tracker = resolveTracker(args.flags.tracker);

const meta = readIssueMeta(tracker, id);
if (!meta) {
  console.error(`No issue "${id}" (missing folder or settings.json) under ${tracker}`);
  process.exit(1);
}

const name = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
if (!name) {
  console.error(`--name "${rawName}" sanitises to empty; give a name with letters or digits.`);
  process.exit(1);
}

const memDir = path.join(tracker, id, 'agent-memory');
const plansDir = path.join(memDir, 'plans');

if (!isInsideAllowed(plansDir, tracker)) {
  console.error(`Refusing to write outside the tracker: ${plansDir}`);
  process.exit(1);
}

// ---- find the active plan -------------------------------------------------
// Plan files live in the 0NN band (prefix < 100); 1NN and above are standing
// files (the question list) and are not part of the sequence.
const PLAN_FILE = /^(\d{2,5})_plan-([a-z0-9-]+)\.md$/;

function listPlans(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .map((f) => ({ file: f, m: f.match(PLAN_FILE) }))
    .filter((e) => e.m && parseInt(e.m[1], 10) < 100)
    .map((e) => ({ file: e.file, num: parseInt(e.m[1], 10), slug: e.m[2] }))
    .sort((a, b) => a.num - b.num);
}

/** A plan is closed when its frontmatter says so, or it carries a `## Closed`
 *  section. Both are accepted: the frontmatter is machine-readable and the
 *  heading is what a human actually writes. */
function isClosed(absPath) {
  const raw = fs.readFileSync(absPath, 'utf-8');
  const fm = matter(raw).data || {};
  if (String(fm.plan || '').toLowerCase() === 'closed') return true;
  return /^##\s+Closed\s*$/m.test(raw);
}

const existing = listPlans(plansDir);
const active = existing.length ? existing[existing.length - 1] : null;
const plansDirIsNew = !fs.existsSync(plansDir);

let closedNow = null;
if (active) {
  const activePath = path.join(plansDir, active.file);
  if (!isClosed(activePath)) {
    if (args.flags.close) {
      let raw = fs.readFileSync(activePath, 'utf-8');
      const fmMatch = raw.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/);
      if (fmMatch) {
        let block = fmMatch[2];
        block = /^plan\s*:/m.test(block) ? block.replace(/^plan\s*:.*$/m, 'plan: closed') : `${block}\nplan: closed`;
        block = /^closed\s*:/m.test(block) ? block.replace(/^closed\s*:.*$/m, `closed: ${todayISO()}`) : `${block}\nclosed: ${todayISO()}`;
        raw = raw.replace(fmMatch[0], `${fmMatch[1]}${block}${fmMatch[3]}`);
      }
      if (!/^##\s+Closed\s*$/m.test(raw)) {
        raw = `${raw.replace(/\s*$/, '')}\n\n## Closed\n\n**Closed ${todayISO()}.**\n\n` +
          `> [!NOTE]\n> Fill this in, then never edit this file again: **what shipped**, and\n` +
          `> **what was dropped rather than finished, with why**. A closed plan is the\n` +
          `> record of what that body of work covered.\n`;
      }
      fs.writeFileSync(activePath, raw);
      closedNow = active.file;
    } else if (!args.flags.force) {
      console.error(
        `Refusing: the active plan \`${active.file}\` is still OPEN.\n` +
        `  One plan is open at a time — a new plan opens only when the previous one is\n` +
        `  COMPLETE, not when the plan changes. Mid-plan discoveries belong in the\n` +
        `  CURRENT file.\n` +
        `  Close it first:  agent-ks issue new-memory-plan ${id} --name ${name} --close\n` +
        `  Or override:     … --force`
      );
      process.exit(1);
    }
  }
}

// ---- write the new plan ---------------------------------------------------
const num = active ? active.num + 1 : 1;
const prefix = pad(num);
const fileName = `${prefix}_plan-${name}.md`;
const abs = path.join(plansDir, fileName);

if (fs.existsSync(abs)) {
  console.error(`Plan file already exists: ${relForLog(abs)}`);
  process.exit(1);
}

const humanName = name.replace(/-/g, ' ');
const title = args.flags.title && args.flags.title !== true
  ? String(args.flags.title)
  : `Plan ${prefix} — ${humanName}`;

const goalBody = args.flags.goal && args.flags.goal !== true
  ? `${String(args.flags.goal).trim()}\n`
  : `> [!NOTE]\n> Blank — fill this in. **One paragraph: what "done" means for this whole\n> plan.** Not a task list; the outcome that makes every cycle below worth it.\n`;

const body = `> [!IMPORTANT]
> **This plan is OPEN.** Update it in place as work lands — tick boxes, and add
> anything you discover, because a mid-plan discovery belongs to *this* plan.
> **Never delete it.** A new \`${pad(num + 1)}_plan-<three-words>.md\` opens only when this
> one is COMPLETE. The highest-numbered plan file is always the active one.
>
> If this file disagrees with anything else in \`agent-memory/\`, **this file wins**,
> and the other one gets corrected.
>
> Opened **${todayISO()}**. The subtask is always the source of truth for detail.

## Goal

${goalBody}
## Scope

<!-- Where this shape came from: the user's words, an audit, a decision. Then: -->

| # | Cycle | Outcome | Owner | Depends on | Subtasks | Status |
|---|-------|---------|-------|------------|----------|--------|
| 1 | **<name>** \`<slug>\` | what it actually gets you | agent | — | 0/0 | open |

<!--
  A CYCLE is a grouped set of tasks finishable in ONE setting or one autonomous
  flow, closed by a review. The tasks need not be related — what makes them one
  cycle is that they can be done together, in one pass.
  Right-sizing test: one cycle = one agent-log activity = one work branch.

  \`#\` IS A STABLE IDENTIFIER — assigned once, NEVER renumbered and never reused,
  because other files cite it. The row order carries no meaning; when the running
  order changes, edit the Execution order section below, never these numbers.
  The \`slug\` is identity too, and is what a reference from ANOTHER file should
  cite ("#7" is meaningless outside this plan).
  \`Depends on\` is STRUCTURAL: cycle → cycle, permanent. (What is blocking a cycle
  TODAY — including a person — belongs in the execution-order table instead.)
  \`Subtasks\` is done/total, derived from the boxes below. \`Status\` uses the
  tracker's own vocabulary; "ready" is derived (open + no unmet dependency).
-->

<!-- OPTIONAL — delete this whole section if the \`#\` order IS the running order.
     Add it the moment the two diverge, which is the ONLY correct response to
     "we need to do these in a different order now". Renumbering is never it.

## Execution order — what actually happens next

**The numbers above are stable identifiers, not a running order.** Other files
cite them, so they are never renumbered; this table is the order work actually
happens in, and **when it disagrees with the numbering above, this table wins.**

| Order | Cycle | Why it sits here | Blocked on |
|---|---|---|---|
| **1st** | **1** — <name> | the reason, which is often NOT a dependency: code freshly understood, finish what is started, doing it later means doing it twice | nobody |
| **2nd** | **3 + 2 together** — <name> | cycles that interleave as ONE loop rather than following one another | nobody |
| **last** | **4** — <name> | | 3 |

**Cycle N is not in this order — it is a parallel track.** Say so explicitly for
anything deliberately outside the sequence, or it reads as forgotten.
-->

## 1 · <cycle name>

<!-- Objective and outcome, in prose a human reads once and gets. What this is,
     plainly — never a restatement of the subtasks below. -->

- [ ] [\`NN/NN\` — <subtask title>](../../subtasks/<group>/<file>.md) — why it's here

## Not in this plan

<!-- Explicit exclusions. Kills the "is X covered?" question before it's asked. -->

## Notes

<!-- Anything that doesn't fit a cycle: risks, watch-items, sequencing caveats. -->
`;

fs.mkdirSync(plansDir, { recursive: true });
fs.writeFileSync(abs, `---\ntitle: "${title.replace(/"/g, '\\"')}"\nplan: open\nopened: ${todayISO()}\n---\n\n${body}`);

const created = [path.join('plans', fileName)];

// Standing question list — seeded once, when plans/ is first created. It spans
// every plan (1NN band), so it is never re-created for later plans.
const questionsPath = path.join(plansDir, '101_questions-to-answer.md');
if (plansDirIsNew && !fs.existsSync(questionsPath)) {
  fs.writeFileSync(questionsPath, `---
title: "Questions to answer"
---

> [!IMPORTANT]
> **Standing file — it spans every plan**, which is why it sits in the \`1NN_\`
> band rather than the plan sequence. Everything here is blocked on a human
> answer, not on other work.
>
> **Answered questions MOVE to the Answered section — never deleted.** A decision
> whose reasoning is lost gets re-litigated.

## Open

<!-- One \`### Qn — <question>\` per item: what is blocked on it, what the options
     are, and what you'd do absent an answer. -->

## Answered

<!-- Move them here with the answer AND its reasoning, and the date. -->
`);
  created.push(path.join('plans', '101_questions-to-answer.md'));
}

// ---- the index ------------------------------------------------------------
// memory.md routes; it never stores. Create it if absent, and keep its Plans
// section pointing at the file that is now active.
const indexPath = path.join(memDir, 'memory.md');
const indexLine = `- [${title}](./plans/${fileName}) — **ACTIVE plan**, opened ${todayISO()}`;

if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(indexPath, `---
title: "Agent memory — index"
---

This index **routes**; it never stores. Load it, then read only what the task
needs. When a section here is superseded, **delete it** — an annotated-stale
section competes with \`plans/\` and loses silently. If it is worth keeping, it
belongs in \`history/\`.

> [!IMPORTANT]
> **Start at the ACTIVE plan** — the highest-numbered file in \`plans/\` is the
> live picture of what is left, in what order, and what is blocked on a human.
> When it disagrees with anything else in this folder, **it wins**.

## Plans — what's left (live, rewritten every session)

${indexLine}
- [Questions to answer](./plans/101_questions-to-answer.md) — standing, spans every plan

## Knowledge — what's true (mutable in place)

<!-- - [Gotchas](./knowledge/gotchas.md) — one-line hook -->

## History — how we got here (write-once, never goes stale)

<!-- - [<subject>](./history/<subject>.md) — one-line hook -->
`);
  created.push('memory.md');
} else {
  let idx = fs.readFileSync(indexPath, 'utf-8');
  if (!idx.includes(`plans/${fileName}`)) {
    // Demote the previous ACTIVE marker, then file the new line under Plans.
    idx = idx.replace(/ — \*\*ACTIVE plan\*\*, opened (\d{4}-\d{2}-\d{2})/g, ' — closed plan (opened $1)');
    if (/^##\s+Plans\b.*$/m.test(idx)) {
      idx = idx.replace(/^(##\s+Plans\b.*)$/m, `$1\n\n${indexLine}`);
    } else {
      idx = `${idx.replace(/\s*$/, '')}\n\n## Plans — what's left (live, rewritten every session)\n\n${indexLine}\n`;
    }
    fs.writeFileSync(indexPath, idx);
  }
}

if (args.flags.json) {
  console.log(JSON.stringify({
    issue: id,
    plan: fileName,
    path: relForLog(abs),
    number: num,
    slug: name,
    closed: closedNow,
    created,
  }, null, 2));
} else {
  if (closedNow) console.log(`Closed ${closedNow} (fill in its \`## Closed\` section, then never edit it again)`);
  console.log(`Created ${relForLog(abs)}`);
  if (created.length > 1) console.log(`  also: ${created.filter((f) => !f.endsWith(fileName)).join(' ')}`);
}
