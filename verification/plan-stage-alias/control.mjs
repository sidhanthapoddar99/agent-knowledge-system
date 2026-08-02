/**
 * Control — a stage has no page, but it must still have an ADDRESS.
 *
 * A plan renders as ONE page with every stage inlined under an anchored
 * heading, so `/plans/<plan>/<stage>` is no longer a page. It is kept as a
 * redirect to `/plans/<plan>#<anchor>`, because a stage is a FILE and a
 * relative markdown link to a file resolves to that file's path-shaped URL.
 *
 * The failure this guards is silent by construction: drop the alias and every
 * hand-written link to a stage file becomes a 404 that no build, validator or
 * link checker reads. There IS such a link in the tracker today — assertion 3
 * finds it by walking the source, so this cannot pass vacuously on a repo that
 * happens to contain none.
 *
 * Reads `astro-doc-code/dist`, so it needs a build first:
 *
 *   ./start build && bun verification/plan-stage-alias/control.mjs
 *
 * Every assertion is paired with a control that proves it can fail — a matcher
 * that always says PASS certifies nothing.
 */
import fs from 'node:fs';
import path from 'node:path';

const REPO = '/home/sid/projects/02_OpenSource/04_knowledge_management/agent-knowledge-system';
const TRACKER = path.join(REPO, 'default-docs/data/todo');
const DIST = path.join(REPO, 'astro-doc-code/dist');
const ISSUE = '2026-07-01-demo-issue-anatomy-showcase';

const results = [];
let failed = 0;
const say = (name, pass, detail = '') => {
  if (!pass) failed++;
  results.push(`${pass ? 'PASS' : '**FAIL**'}  ${name}${detail ? '  — ' + detail : ''}`);
};

const read = (p) => fs.readFileSync(p, 'utf8');
const exists = (p) => fs.existsSync(p);

/** Frontmatter `title:` of a markdown file, unquoted. */
function titleOf(file) {
  const m = read(file).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const t = m?.[1].match(/^title:\s*(.+)$/m)?.[1]?.trim() ?? '';
  return t.replace(/^["']|["']$/g, '');
}

/** The `#anchor` a redirect page points at, or null. */
function redirectAnchor(indexHtml) {
  const m = read(indexHtml).match(/<link rel="canonical" href="([^"]+)"/);
  if (!m) return null;
  const hash = m[1].indexOf('#');
  return hash < 0 ? null : { url: m[1].slice(0, hash), anchor: m[1].slice(hash + 1) };
}

/**
 * Does the plan page carry an `<h1 id="anchor">` whose text contains `title`?
 *
 * Asserted against the stage file's OWN frontmatter title, which the page does
 * not derive from the anchor — so this compares two independently-produced
 * values rather than a value against its own fallback.
 */
function headingMatches(planHtml, anchor, title) {
  const re = new RegExp(`<h1 id="${anchor}"[^>]*>([\\s\\S]{0,300}?)</h1>`);
  const m = planHtml.match(re);
  if (!m) return false;
  return m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').includes(title);
}

// ===========================================================================
// 1 + 2 — every stage file has a redirect, and it lands on a real heading
// ===========================================================================

const plansDir = path.join(TRACKER, ISSUE, 'plans');
const planDirs = fs.readdirSync(plansDir, { withFileTypes: true })
  .filter((e) => e.isDirectory()).map((e) => e.name).sort();

say('plans exist in the demo issue', planDirs.length > 0, `${planDirs.length} plan(s)`);

let stagesChecked = 0;
for (const plan of planDirs) {
  const planPage = path.join(DIST, 'todo', ISSUE, 'plans', plan, 'index.html');
  if (!exists(planPage)) { say(`plan page built: ${plan}`, false, planPage); continue; }
  const planHtml = read(planPage);

  const stages = fs.readdirSync(path.join(plansDir, plan))
    .filter((f) => f.endsWith('.md') && f !== 'overview.md').sort();

  for (const file of stages) {
    const name = file.replace(/\.md$/, '');
    const title = titleOf(path.join(plansDir, plan, file));
    const redirect = path.join(DIST, 'todo', ISSUE, 'plans', plan, name, 'index.html');

    if (!exists(redirect)) { say(`alias exists: ${plan}/${name}`, false, 'no page built'); continue; }
    const target = redirectAnchor(redirect);
    if (!target) { say(`alias redirects: ${plan}/${name}`, false, 'no canonical with a #anchor'); continue; }

    const toPlanPage = target.url.endsWith(`/plans/${plan}`);
    say(`alias points at its plan: ${plan}/${name}`, toPlanPage, target.url);
    say(`alias anchor is a real heading: ${plan}/${name}`,
      headingMatches(planHtml, target.anchor, title), `#${target.anchor} → "${title}"`);
    stagesChecked++;
  }
}

say('stages were actually checked', stagesChecked > 0, `${stagesChecked} stage(s)`);

// CONTROL for the heading matcher: a wrong anchor and a wrong title must both
// be rejected. Without this, a matcher that returns true unconditionally scores
// a clean run over a page it never read.
{
  const planHtml = read(path.join(DIST, 'todo', ISSUE, 'plans', planDirs[0], 'index.html'));
  const realAnchor = planHtml.match(/<h1 id="([^"]+)"/)?.[1] ?? '';
  const realTitle = planHtml.match(/<h1 id="[^"]+"[^>]*>([\s\S]{0,300}?)<\/h1>/)?.[1]
    ?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
  say('CONTROL matcher accepts the true pair',
    headingMatches(planHtml, realAnchor, realTitle.split(' ').slice(1).join(' ')));
  say('CONTROL matcher rejects a wrong anchor',
    !headingMatches(planHtml, 'no-such-anchor-anywhere', realTitle));
  say('CONTROL matcher rejects a wrong title',
    !headingMatches(planHtml, realAnchor, 'This Title Appears Nowhere On The Page'));
}

// ===========================================================================
// 3 — the links that make the alias load-bearing
// ===========================================================================

/** Every `.md` under the tracker. */
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

/**
 * Strip fenced blocks and inline code spans.
 *
 * Without this the walker matches SYNTAX EXAMPLES — a brainstorm showing
 * `` `[…](../plans/01_decoder/20_journal-compat.md)` `` is demonstrating the
 * link form, not linking anywhere, and its target has never existed. Counting
 * it produced a FAIL against a file that renders correctly.
 */
function stripCode(md) {
  return md.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
}

const stageLinks = [];
const missingTargets = [];
for (const file of walk(TRACKER)) {
  const body = stripCode(read(file));
  for (const m of body.matchAll(/\]\((\.[^)\s#]+\.md)(#[^)\s]*)?\)/g)) {
    const abs = path.resolve(path.dirname(file), m[1]);
    const rel = path.relative(TRACKER, abs);
    const parts = rel.split(path.sep);
    // <issue>/plans/<plan>/<NN_stage>.md — the shape that resolves to an alias.
    if (parts.length !== 4 || parts[1] !== 'plans' || parts[3] === 'overview.md') continue;
    // A link to a file that does not exist is a BROKEN LINK, which is a
    // different defect and a different checker's job. Reported, never silently
    // dropped — a skip nobody sees is how a shrinking sample passes clean.
    if (!exists(abs)) { missingTargets.push(`${path.relative(TRACKER, file)} → ${rel}`); continue; }
    stageLinks.push({ from: path.relative(TRACKER, file), to: rel, parts });
  }
}

say('the tracker contains at least one link to a stage FILE',
  stageLinks.length > 0, `${stageLinks.length} link(s)`);

for (const link of stageLinks) {
  const [issue, , plan, file] = link.parts;
  const page = path.join(DIST, 'todo', issue, 'plans', plan, file.replace(/\.md$/, ''), 'index.html');
  say(`link resolves to a live URL: ${link.from} → ${link.to}`, exists(page));
}

// CONTROL for the link walker: it must find the known link by NAME, not just
// "some" link — a walker that matched the wrong shape would still report a
// non-zero count above.
say('CONTROL walker finds the known agent-log → stage link',
  stageLinks.some((l) =>
    l.from.includes('010_lp_implement-sections') && l.to.includes('10_loader-and-routes.md')),
  stageLinks.map((l) => l.to).join(', ') || 'none');

// ===========================================================================

if (missingTargets.length > 0) {
  results.push(`NOTE  ${missingTargets.length} stage link(s) point at a file that does not exist ` +
    `(a broken link, not an alias failure): ${missingTargets.join(', ')}`);
}

console.log(results.join('\n'));
console.log(`\n${results.length - failed}/${results.length} assertions passed`);
process.exit(failed === 0 ? 0 : 1);
