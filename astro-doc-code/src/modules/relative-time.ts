/**
 * Relative timestamps that survive a static build.
 *
 * ## The problem this exists to solve
 *
 * "31 min ago" is not a property of the data — it is a property of *when you
 * looked*. Computing it while rendering bakes the answer for one instant into a
 * file that is then served for hours or days. A built site froze that text at
 * build time, so a reader saw an age measured from the last deploy rather than
 * from now, and two builds of identical input produced different bytes.
 *
 * That second consequence is the sharper one. It makes the build
 * nondeterministic, which blocks any form of build caching: you cannot skip work
 * you cannot prove is unchanged. And under Astro's incremental build it stops
 * being drift and becomes permanent — a page restored from cache keeps whatever
 * the string said when it was first rendered, and no cache key can ever
 * invalidate it, because the input is the wall clock and the wall clock is not a
 * file.
 *
 * ## The split
 *
 * The server renders `fullLabel()` — an absolute timestamp derived from nothing
 * but the ISO string, so identical input gives identical bytes forever. The
 * browser then rewrites recent ones to a relative form via
 * `hydrateRelativeTimes()`, where "now" is genuinely now.
 *
 * A reader without JavaScript keeps a correct absolute date, which is why the
 * server renders the full label rather than an empty element.
 *
 * ## Why both halves live in one file
 *
 * The tier boundaries below (sec → min → hours → days → give up at 7) have to
 * agree between the two, or a page would visibly change meaning on hydration
 * rather than just gaining precision. One table, two callers.
 *
 * Keep this module free of Node imports — it is bundled into the client.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Marks a `<time>` whose text the browser may replace with a relative form. */
export const RELATIVE_TIME_ATTR = 'data-relative-time';

/** Past this age a relative form stops being useful and the date is shown. */
const RELATIVE_CUTOFF_DAYS = 7;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Date-only inputs ("YYYY-MM-DD" — an issue whose `updated` fell back to its
 * folder-slug `created` because no commit touches the folder yet) are parsed as
 * **local** midnight. Parsing them as UTC would place them in the future for any
 * reader east of GMT before midnight UTC.
 */
function parse(iso: string): { date: Date; dateOnly: boolean } | null {
  const dateOnly = DATE_ONLY.test(iso);
  const date = new Date(dateOnly ? `${iso}T00:00:00` : iso);
  return Number.isNaN(date.getTime()) ? null : { date, dateOnly };
}

/**
 * The deterministic label: a function of the ISO string alone, never the clock.
 * This is what gets written into the HTML.
 */
export function fullLabel(iso: string | null | undefined): string {
  if (!iso) return '';
  const parsed = parse(iso);
  if (!parsed) return '';
  const { date, dateOnly } = parsed;
  const day = `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  if (dateOnly) return day;
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${hh}:${mm}`;
}

/**
 * The relative label, or `null` when there should not be one — an unparseable
 * value, a date-only source (no time precision to be fake-precise about), or
 * anything older than the cutoff, where `fullLabel()` is already the better
 * answer. A `null` means *leave the rendered text alone*, which is what keeps
 * old entries from flickering on load.
 *
 * Negative deltas (clock skew between a reader and the commit) clamp to zero.
 */
export function relativeLabel(iso: string | null | undefined, now: number): string | null {
  if (!iso) return null;
  const parsed = parse(iso);
  if (!parsed || parsed.dateOnly) return null;

  const seconds = Math.max(0, Math.floor((now - parsed.date.getTime()) / 1000));
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  const days = Math.floor(hours / 24);
  if (days < RELATIVE_CUTOFF_DAYS) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return null;
}

/**
 * Rewrite marked `<time>` elements to their relative form. Safe to call more
 * than once — it reads `datetime`, never the text it previously wrote.
 *
 * Call this before any code that clones rows (the index table clones `<tr>`
 * nodes to build its grouped view), so the clones inherit hydrated text.
 */
export function hydrateRelativeTimes(root: ParentNode = document): void {
  const now = Date.now();
  for (const el of root.querySelectorAll<HTMLTimeElement>(`time[${RELATIVE_TIME_ATTR}]`)) {
    const relative = relativeLabel(el.getAttribute('datetime'), now);
    if (relative) el.textContent = relative;
  }
}
