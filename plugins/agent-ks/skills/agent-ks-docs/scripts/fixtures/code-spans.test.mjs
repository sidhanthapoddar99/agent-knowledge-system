#!/usr/bin/env bun
/**
 * code-spans.test.mjs — a DIFFERENTIAL test of the code-region blanker.
 *
 * It asserts nothing of its own. For every input it asks micromark — the same
 * engine the site renders with — *does a link actually exist here?*, then asks
 * the blanker the same question, and fails on any disagreement.
 *
 * THE PREVIOUS VERSION OF THIS FILE IS WHY. It was fifteen hand-written cases,
 * each one a bug already found and fixed, each asserting a remembered answer.
 * It passed while the implementation diverged from the spec in ten places — an
 * external reviewer put it plainly: *"the current oracle-wrong code passes the
 * fixture."* A fixture written from the bugs you have met can only ever certify
 * that you have met them.
 *
 * So the cases below are not the assertions; they are the CORPUS. Adding one
 * costs a line and needs no expected value, because there is nothing to get
 * wrong — the oracle supplies it. Add any construction that has ever been
 * ambiguous.
 *
 * Run: bun plugins/agent-ks/skills/agent-ks-docs/scripts/fixtures/code-spans.test.mjs
 */

import { micromark } from 'micromark';
import { gfm } from 'micromark-extension-gfm';
import { blankedProseLines } from '../_links.mjs';

const B = '`';
const TARGET = './oracle-target.md';
const L = `[x](${TARGET})`;

/** [name, markdown] — every case puts exactly one link at TARGET somewhere. */
const CORPUS = [
  ['bare link in prose',              `see ${L} here`],
  ['single-backtick span',            `type ${B}${L}${B} please`],
  ['double-backtick span',            `quote ${B}${B} [${B}x${B}](${TARGET}) ${B}${B} here`],
  ['unmatched run then a span',       `a ${B}${B}${B} fence then ${B}${L}${B} done`],
  ['unmatched run then a link',       `a ${B}${B}${B} fence then ${L} done`],
  ['longer run inside a span',        `${B}a ${B}${B}b${B}${B} ${L}${B}`],
  ['escaped backticks outside',       `see \\${B}${L}\\${B} here`],
  ['escaped backtick inside content', `see ${B}a \\${B} ${L} ${B} end`],
  ['span wrapping one line',          `intro\n${B}- [x] ${L} — framework, CLI\nand validator${B}\nend`],
  ['wrapped span in a blockquote',    `> ${B}- [x] ${L} — CLI\n> and validator${B}`],
  ['blockquote, then a break, then', `> a ${B} ${L} b\n>\n> c ${B} d`],
  ['blockquote starting with prose',  `a ${B}\n> ${L} ${B}`],
  ['blockquoted list items',          `> - a ${B} ${L}\n> - c ${B} d`],
  ['two list items',                  `- a ${B} ${L}\n- c ${B} d`],
  ['nested list items',               `- outer\n  - a ${B} ${L}\n  - c ${B} d`],
  ['ordered list that cannot interrupt', `a ${B} wrap\n2. ${L} more ${B} z`],
  ['ATX heading between',             `# head ${B}\n${L} body ${B} d`],
  ['setext = underline between',      `head ${B}\n===\n${L} tail ${B}`],
  ['setext - underline between',      `head ${B}\n---\n${L} tail ${B}`],
  ['pipe-delimited table',            `| a ${B} | ${L} |\n| c ${B} | d |`],
  ['pipe-less GFM table',             `a | b\n--- | ---\na ${B} ${L} | b\nc ${B} d | e`],
  ['lone pipe continuation line',     `a ${B} wrap\n| ${L} more ${B} z`],
  ['CRLF paragraphs',                 `a ${B} ${L}\r\n\r\nnext ${B} d`],
  ['fenced block',                    `${B}${B}${B}\n${L}\n${B}${B}${B}`],
  ['fence inside a deeper fence',     `${B}${B}${B}${B}\n${B}${B}${B}\n${L}\n${B}${B}${B}\n${B}${B}${B}${B}`],
  ['indented code block',             `para\n\n    ${L}`],
  ['tab-indented code block',         `para\n\n\t${L}`],
  ['raw HTML block',                  `<div>\n${L}\n</div>`],
  ['thematic break between',          `a ${B}\n***\n${L} ${B}`],
  ['link inside link text',           `[outer ${L}](./other.md)`],
];

/** The oracle: does a rendered link to TARGET exist in this markdown? */
const oracleHasLink = (md) =>
  micromark(md, { extensions: [gfm()] }).includes(`href="${TARGET}"`);

/** The gate: does the blanked text still expose that link to the scanner? */
const blankerHasLink = (md) => blankedProseLines(md).join('\n').includes(`](${TARGET})`);

let failed = 0;
for (const [name, md] of CORPUS) {
  const want = oracleHasLink(md);
  const got = blankerHasLink(md);
  if (want !== got) {
    failed++;
    console.log(`FAIL  ${name}\n      micromark: link is ${want ? 'REAL' : 'code'}; blanker: ${got ? 'visible' : 'blanked'}`);
  } else {
    console.log(`ok    ${name}  (${want ? 'real link, visible' : 'code, blanked'})`);
  }
}

// Offsets must survive, or every line:column the gates report is wrong.
const joined = CORPUS.map(([, md]) => md).join('\n\n');
const blanked = blankedProseLines(joined).join('\n');
const aligned = blanked.length === joined.length
  && blanked.split('\n').length === joined.split('\n').length;
if (!aligned) failed++;
console.log(`${aligned ? 'ok  ' : 'FAIL'}  byte length and line count are preserved`);

console.log(failed ? `\n${failed} FAILED of ${CORPUS.length + 1}` : `\n${CORPUS.length + 1} passed`);
process.exit(failed ? 1 : 0);
