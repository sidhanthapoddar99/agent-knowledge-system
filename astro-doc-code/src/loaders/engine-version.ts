/**
 * Engine ↔ content version contract.
 *
 * Content declares the engine version it targets in `site.yaml → engine_version`
 * (missing → "0.0.0"). The engine carries its current version and a
 * backward-compatibility floor here. `loadSiteConfig()` enforces the gate: content
 * below the floor (or above the engine) is a hard startup error whose message
 * walks the user's AI through the migration chain in `<repo-root>/migration/`.
 *
 * VERSION SCHEME — stated by position, never by name. "minor" and "patch" mean
 * different places to different readers, and that ambiguity has already caused
 * one wrong call (see `2026-08-02-refactor-efficiency-and-planning`):
 *
 *     X . Y . Z
 *     │   │   └── small additions and fixes
 *     │   └────── major upgrades
 *     └────────── reserved: beta (0) vs production
 *
 * Bump discipline — any format change: bump ENGINE_VERSION and ship a
 * `migration/<new-version>_<statement>.py`. Which place moves is a judgement
 * about the size of the change; in practice every format migration this repo
 * has shipped moved Z (0.1.0, 0.1.1, 0.1.2). Raise MIN_CONTENT_VERSION ONLY for
 * breaking changes (old content fails/misrenders without the migration); a
 * good-to-have migration leaves the floor alone — old trees keep working and
 * migrate opportunistically. The floor means "oldest content version that still
 * works unmigrated", not "newest migration available".
 */

/** What this engine currently is. Major stays 0 while the project is in beta. */
export const ENGINE_VERSION = '0.1.2';

/** Oldest content version this engine still parses. */
export const MIN_CONTENT_VERSION = '0.1.2';

/** Content trees with no `engine_version` declaration predate the contract. */
export const UNVERSIONED = '0.0.0';

const VERSION_RE = /^\d+\.\d+\.\d+$/;

export function isValidVersion(v: string): boolean {
  return VERSION_RE.test(v);
}

/**
 * Numeric per-segment comparison over ALL THREE places. Returns <0 / 0 / >0
 * like a comparator.
 *
 * The minimum means the minimum: content below MIN_CONTENT_VERSION is refused,
 * full stop. There is no rule about which place "counts".
 *
 * Fixed 2026-08-02. Previously this compared X and Y only, discarding Z — and
 * since every format migration this repo has shipped moved only Z (0.1.0 ->
 * 0.1.1 -> 0.1.2), content at 0.1.0 compared EQUAL to a floor of 0.1.2 and
 * passed. The check had therefore never once refused a migrated format; the
 * only thing it ever caught was content with no `engine_version` at all.
 * `0.1.1_state-to-status.py` was a breaking value remap and reached nobody.
 *
 * This does NOT make every release mandatory. MIN_CONTENT_VERSION is the
 * control: ship a fix as 0.1.4 and leave the floor at 0.1.3, and content at
 * 0.1.3 still passes. Raise the floor only when old content genuinely breaks.
 */
export function compareFormatVersions(a: string, b: string): number {
  const [aMaj, aMin, aPat] = a.split('.').map(Number);
  const [bMaj, bMin, bPat] = b.split('.').map(Number);
  return aMaj - bMaj || aMin - bMin || aPat - bPat;
}

/**
 * The gate. Throws when `contentVersion` falls outside
 * [MIN_CONTENT_VERSION, ENGINE_VERSION]; silent when in range.
 */
export function assertContentVersionSupported(contentVersion: string | undefined): void {
  const declared = contentVersion ?? UNVERSIONED;

  if (!isValidVersion(declared)) {
    throw new Error(
      `site.yaml engine_version "${declared}" is not a valid N.N.N version. ` +
      `Set it to the engine version this content targets, e.g.: engine_version: "${ENGINE_VERSION}"`,
    );
  }

  if (compareFormatVersions(declared, MIN_CONTENT_VERSION) < 0) {
    throw new Error(
      `This content targets engine ${declared}${contentVersion ? '' : ' (no engine_version declared in site.yaml)'}, ` +
      `but this engine is ${ENGINE_VERSION} and supports content ${MIN_CONTENT_VERSION} or newer. ` +
      `The content must be migrated from ${declared} to ${ENGINE_VERSION} — ask your AI to do it: ` +
      `the migration scripts live in migration/ at the repo root, named by the version they bring ` +
      `content to. Run each script between ${declared} and ${ENGINE_VERSION} in version order ` +
      `(detect pass, then --dry-run, then migrate), verify with agent-ks check, ` +
      `then set engine_version: "${ENGINE_VERSION}" in site.yaml.`,
    );
  }

  if (compareFormatVersions(declared, ENGINE_VERSION) > 0) {
    throw new Error(
      `This content targets engine ${declared}, but this engine is only ${ENGINE_VERSION}. ` +
      `Update the framework to ${declared} or newer (./start offers the update when the ` +
      `upstream is ahead), or check upgrade options for your install.`,
    );
  }
}
