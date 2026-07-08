/**
 * order-prefix — the single definition of the numeric ordering-prefix grammar.
 *
 * Content orders siblings with a leading numeric prefix: `NN_name` … `NNNNN_name`.
 * Width is **2–5 digits**; order is by **numeric value** (so widths coexist and
 * gaps are allowed — e.g. `05_`, `010_`, `110_`); the prefix is stripped for the
 * URL/slug. The leading digit can also annotate a group inside a flat folder
 * (`110_`, `120_` = group 1; `210_` = group 2).
 *
 * This module is the ONLY place that grammar lives — the docs loader, parsers,
 * sidebar hook, the issue-tracker loader, and the validators (mirrored in the
 * agent-ks plugin, which can't import across the package boundary)
 * all defer to it.
 *
 * **One grammar, one knob — the separator.** Width (2–5) and numeric-value sort
 * are identical everywhere. `_` is the canonical separator: docs use it
 * exclusively (the `parseOrderPrefix` family). The issue tracker also tolerates a
 * legacy `-` separator in existing subtask / agent-log / group folders (the
 * `parseOrderPrefixLoose` family) — same width, same sort, just a wider separator
 * class so historical hyphen folders keep parsing.
 */

/** Accepted digit-width range for an ordering prefix. */
export const ORDER_PREFIX_MIN_DIGITS = 2;
export const ORDER_PREFIX_MAX_DIGITS = 5;

export interface ParsedOrderPrefix {
  /** Numeric order from the prefix, or null when the segment has none. */
  position: number | null;
  /** The segment with its ordering prefix removed. */
  cleanName: string;
}

/**
 * Build a parse/test/strip trio for a given separator class. `sepClass` is the
 * regex fragment between the digits and the name (`_` for docs, `[_-]` for the
 * loose issue-tracker variant). Width (2–5) and numeric-value semantics are
 * shared — only the separator differs.
 */
function makeOrderPrefix(sepClass: string) {
  const re = new RegExp(`^(\\d{2,5})${sepClass}`);
  const fullRe = new RegExp(`^(\\d{2,5})${sepClass}(.+)$`);
  return {
    re,
    parse(name: string): ParsedOrderPrefix {
      const match = name.match(fullRe);
      if (match) {
        return { position: parseInt(match[1], 10), cleanName: match[2] };
      }
      return { position: null, cleanName: name };
    },
    has(name: string): boolean {
      return re.test(name);
    },
    strip(name: string): string {
      return name.replace(re, '');
    },
  };
}

const strict = makeOrderPrefix('_');
const loose = makeOrderPrefix('[_-]');

/** Leading 2–5 digit prefix followed by `_` (docs canonical separator). */
export const ORDER_PREFIX_RE = strict.re;

/** Parse a leading 2–5 digit `NN_` ordering prefix from one path segment. */
export function parseOrderPrefix(name: string): ParsedOrderPrefix {
  return strict.parse(name);
}

/** True if the segment carries an ordering prefix (`NN_`). */
export function hasOrderPrefix(name: string): boolean {
  return strict.has(name);
}

/** Strip the `NN_` ordering prefix from a segment (unchanged if it has none). */
export function stripOrderPrefix(name: string): string {
  return strict.strip(name);
}

/**
 * Loose variant — accepts `_` or a legacy `-` separator. Used by the issue
 * tracker so historical hyphen folders (`00-foo`) keep parsing. Same width and
 * numeric-value sort as the strict family.
 */
export function parseOrderPrefixLoose(name: string): ParsedOrderPrefix {
  return loose.parse(name);
}

/** True if the segment carries a `NN_` or `NN-` ordering prefix. */
export function hasOrderPrefixLoose(name: string): boolean {
  return loose.has(name);
}

/** Strip a `NN_` or `NN-` ordering prefix from a segment. */
export function stripOrderPrefixLoose(name: string): string {
  return loose.strip(name);
}
