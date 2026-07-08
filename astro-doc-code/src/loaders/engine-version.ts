/**
 * Engine ↔ content version contract.
 *
 * Content declares the engine version it targets in `site.yaml → engine_version`
 * (missing → "0.0.0"). The engine carries its current version and a
 * backward-compatibility floor here. `loadSiteConfig()` enforces the gate: content
 * below the floor (or above the engine) is a hard startup error whose message
 * walks the user's AI through the migration chain in `<repo-root>/migration/`.
 *
 * Bump discipline — any format change: bump ENGINE_VERSION minor and ship a
 * `migration/<new-version>_<statement>.py`. Raise MIN_CONTENT_VERSION ONLY for
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
 * Numeric per-segment comparison on major.minor ONLY — a patch bump never
 * changes content format by definition, so it never trips the gate.
 * Returns <0 / 0 / >0 like a comparator.
 */
export function compareFormatVersions(a: string, b: string): number {
  const [aMaj, aMin] = a.split('.').map(Number);
  const [bMaj, bMin] = b.split('.').map(Number);
  return aMaj - bMaj || aMin - bMin;
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
