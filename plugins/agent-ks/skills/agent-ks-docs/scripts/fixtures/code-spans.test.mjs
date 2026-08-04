#!/usr/bin/env bun
/**
 * code-spans.test.mjs — the regression guard for the code-span blankers.
 *
 * IT LIVES IN THE REPO ON PURPOSE. Its first version was written in a scratch
 * directory outside the tree, so the eight cases it passed stopped being a
 * reproduction the moment that directory was cleared — and none of the five
 * inputs that later broke the blanker was among them.
 *
 * EVERY CASE HERE IS ONE THAT FAILED. The four marked `false negative` are the
 * dangerous direction: the gate blanking a genuinely broken link, going quiet,
 * and reading exactly like a clean tree. A fixture that only tests the case
 * which motivated the fix cannot tell silence from correctness.
 *
 * Run: bun plugins/agent-ks/skills/agent-ks-docs/scripts/fixtures/code-spans.test.mjs
 */

import { blankCodeSpans, blankCodeSpansDoc } from '../_links.mjs';

const hasLink = (s) => /\]\(/.test(s);

/** [name, input, fn, linkShouldSurvive] */
const CASES = [
  // ── per line ───────────────────────────────────────────────────────────
  ['a bare link is content',            'see [x](./real.md) here',                  blankCodeSpans,    true],
  ['single-backtick span is quoted',    'type `[x](./q.md)` please',                blankCodeSpans,    false],
  ['double-backtick span is quoted',    'quote `` [`x`](./q.md) `` here',           blankCodeSpans,    false],
  ['a stray run does not eat the next', 'a ``` fence then `[x](./q.md)` done',      blankCodeSpans,    false],
  ['a stray run leaves a real link',    'a ``` fence then [x](./real.md) done',     blankCodeSpans,    true],
  // CommonMark: a closer must be a run of EXACTLY the opener's length.
  ['a longer inner run is not a closer','`a ``b`` [x](./q.md)`',                    blankCodeSpans,    false],
  // CommonMark: `\`` is a literal backtick and cannot delimit a span.
  ['escaped backticks are literal',     'see \\`[x](./real.md)\\` here',            blankCodeSpans,    true],

  // ── across lines ───────────────────────────────────────────────────────
  ['a span that WRAPS is quoted',
   'intro\n> `- [x] [The plans](./q.md) — framework, CLI\n> and validator`\nend',   blankCodeSpansDoc, false],
  ['a link after that span survives',
   'intro\n> `- [x] [The plans](./q.md) — CLI\n> and validator`\n\nlater [y](./real.md)', blankCodeSpansDoc, true],
  ['a `>`-only line ends a block',
   '> a ` [x](./real.md) b\n>\n> c ` d',                                            blankCodeSpansDoc, true],
  ['a new list item ends a block',
   '- a ` [x](./real.md)\n- c ` d',                                                 blankCodeSpansDoc, true],
  ['a heading ends a block',
   '# head `\n[x](./real.md) body ` d',                                             blankCodeSpansDoc, true],
  ['a table row ends a block',
   '| a ` | [x](./real.md) |\n| c ` | d |',                                         blankCodeSpansDoc, true],
  ['CRLF blank lines separate paragraphs',
   'a ` [x](./real.md)\r\n\r\nnext ` d',                                            blankCodeSpansDoc, true],
];

let failed = 0;
for (const [name, input, fn, want] of CASES) {
  const got = hasLink(fn(input));
  const ok = got === want;
  if (!ok) failed++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}`);
}

// Offsets must survive, or every reported line:column is wrong.
const sample = CASES.map((c) => c[1]).join('\n\n');
const blanked = blankCodeSpansDoc(sample);
const aligned = blanked.length === sample.length
  && blanked.split('\n').length === sample.split('\n').length;
if (!aligned) failed++;
console.log(`${aligned ? 'ok  ' : 'FAIL'}  byte length and line count are preserved`);

console.log(failed ? `\n${failed} FAILED` : `\n${CASES.length + 1} passed`);
process.exit(failed ? 1 : 0);
