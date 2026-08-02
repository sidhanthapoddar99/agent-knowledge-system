/**
 * plan-prefix-probe.ts — does a 1-digit plan prefix silently become "the active plan"?
 *
 * The validator's plan-prefix regex is `\d{1,5}`; the loader's grammar is 2-5
 * digits. A `1_foo/` folder therefore passes the check with no finding and
 * parses to `position: null` in the loader — which sorts LAST, and `activePlan`
 * walks from the END. Run from astro-doc-code/ so the tsconfig aliases resolve.
 *
 *   bun ../verification/skill-consistency/plan-prefix-probe.ts
 */
import { parseOrderPrefixLoose } from '../../astro-doc-code/src/parsers/core/order-prefix';
import { activePlan } from '../../astro-doc-code/src/layouts/issues/default/server/helpers';
import type { IssuePlan } from '../../astro-doc-code/src/loaders/issues';

function byPrefixValue(a: string, b: string): number {
  const av = parseOrderPrefixLoose(a).position ?? Number.POSITIVE_INFINITY;
  const bv = parseOrderPrefixLoose(b).position ?? Number.POSITIVE_INFINITY;
  if (av !== bv) return av - bv;
  return a.localeCompare(b);
}

const CASES: string[][] = [
  ['01_first', '02_second', '03_third'],
  ['1_first', '02_second', '03_third'],
  ['01_first', '02_second', 'unprefixed-plan'],
];

for (const folders of CASES) {
  const sorted = [...folders].sort(byPrefixValue);
  const plans = sorted.map((name) => ({
    name,
    sequence: parseOrderPrefixLoose(name).position,
    title: name,
    status: 'open',
    category: 'not-started',
    overviewHtml: null,
    stages: [],
    folderPath: '',
    relativePath: '',
  })) as unknown as IssuePlan[];
  const act = activePlan(plans);
  console.log(
    `folders ${JSON.stringify(folders)}\n  loader order: ${sorted.join(' < ')}` +
    `\n  sequences:    ${sorted.map((n) => `${n}=${parseOrderPrefixLoose(n).position}`).join(', ')}` +
    `\n  ACTIVE PLAN:  ${act?.name}\n`,
  );
}
