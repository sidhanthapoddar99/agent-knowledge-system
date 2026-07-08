/**
 * _order-prefix — the numeric ordering-prefix grammar for the plugin scripts.
 *
 * Mirror of `astro-doc-code/src/parsers/core/order-prefix.ts`. The plugin can't
 * import across the package boundary, so this is the second (and last) copy —
 * keep the two in lockstep when the grammar changes.
 *
 * Grammar: a leading **2–5 digit** numeric prefix, ordered by **numeric value**
 * (widths coexist; gaps allowed — `05_`, `010_`, `110_`). `_` is the canonical
 * separator (docs use it exclusively). The issue tracker also tolerates a legacy
 * `-` separator in existing subtask / agent-log / group folders — same width,
 * same sort, wider separator class (the `*Loose` family).
 */

export const ORDER_PREFIX_MIN_DIGITS = 2;
export const ORDER_PREFIX_MAX_DIGITS = 5;

function makeOrderPrefix(sepClass) {
  const re = new RegExp(`^(\\d{2,5})${sepClass}`);
  const fullRe = new RegExp(`^(\\d{2,5})${sepClass}(.+)$`);
  return {
    re,
    fullRe,
    parse(name) {
      const match = name.match(fullRe);
      if (match) return { position: parseInt(match[1], 10), cleanName: match[2] };
      return { position: null, cleanName: name };
    },
    has(name) {
      return re.test(name);
    },
    strip(name) {
      return name.replace(re, '');
    },
  };
}

const strict = makeOrderPrefix('_');
const loose = makeOrderPrefix('[_-]');

/** Strict (`NN_`) ordering-prefix regex — docs canonical separator. */
export const ORDER_PREFIX_RE = strict.re;
/** Strict regex capturing the remainder: `^(\d{2,5})_(.+)$`. */
export const ORDER_PREFIX_FULL_RE = strict.fullRe;
/** Any leading `digits_` — used to flag bad widths (1 or 6+) in the validator. */
export const ANY_DIGIT_PREFIX_RE = /^(\d+)_/;

export function parseOrderPrefix(name) {
  return strict.parse(name);
}
export function hasOrderPrefix(name) {
  return strict.has(name);
}
export function stripOrderPrefix(name) {
  return strict.strip(name);
}

/** Loose variant — accepts `_` or a legacy `-` separator (issue tracker). */
export function parseOrderPrefixLoose(name) {
  return loose.parse(name);
}
export function hasOrderPrefixLoose(name) {
  return loose.has(name);
}
export function stripOrderPrefixLoose(name) {
  return loose.strip(name);
}
