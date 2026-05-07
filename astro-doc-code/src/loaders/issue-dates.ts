/**
 * Issue date cache — derived `updated` dates from git history.
 *
 * Per-tracker in-memory map of `<issue-folder> → ISO author date`. Computed
 * once on cold start by walking `git log --no-merges --name-only -- <tracker>`
 * and taking the most recent commit date that touched any file under each
 * issue folder. Refreshed incrementally on `.git/HEAD` change when the
 * stored sync point is an ancestor of the new HEAD; otherwise full rebuild.
 *
 * No disk persistence. Falls back to null when:
 *   - the project isn't a git checkout (`.git/` absent)
 *   - the tracker / issue folder has no committed files yet
 * Callers (issues loader) substitute the issue's `created` date in those
 * cases.
 *
 * Design rationale + per-step detail:
 *   default-docs/data/todo/2026-05-07-tracker-mental-model-alignment/
 *     notes/derived-issues-updates/
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { paths } from './paths';

interface CacheEntry {
  /** Per-issue folder name (e.g. "2026-04-10-issues-layout") → ISO author date */
  issues: Map<string, string>;
  /** HEAD SHA at the time the cache was last populated. Empty when unset. */
  syncedAt: string;
}

/** Per-tracker cache, keyed by absolute tracker path. */
const cache = new Map<string, CacheEntry>();

/** Repo-root resolution per absolute path — small map, never invalidated. */
const repoRootByPath = new Map<string, string | null>();

const FOLDER_PATTERN = /^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*$/;
const RECORD_SEP = '§'; // §

// ============================================================================
// Public API
// ============================================================================

/**
 * Return the derived `updated` ISO date for a single issue, or null when
 * the cache has nothing for it (no git history, never committed, no repo).
 */
export function getIssueDate(trackerRoot: string, issueSlug: string): string | null {
  ensureFresh(trackerRoot);
  const entry = cache.get(trackerRoot);
  return entry?.issues.get(issueSlug) ?? null;
}

/**
 * Return the full per-issue date map for a tracker. Returns an empty map
 * when the project isn't a git checkout.
 */
export function getAllIssueDates(trackerRoot: string): Map<string, string> {
  ensureFresh(trackerRoot);
  const entry = cache.get(trackerRoot);
  return entry ? new Map(entry.issues) : new Map();
}

/**
 * Drop the cache for a tracker (or all trackers when omitted). Used by HMR
 * when a `.git/HEAD` watcher fires.
 */
export function invalidateIssueDateCache(trackerRoot?: string): void {
  if (trackerRoot) cache.delete(trackerRoot);
  else cache.clear();
}

/**
 * Watch paths to register with the dev-server cache manager. `.git/HEAD`
 * changes on commit / checkout / pull; the active branch ref under
 * `.git/refs/heads/<branch>` changes when commits land directly on the
 * checked-out branch (HEAD itself doesn't move on `git commit`, only on
 * branch switches). Returns absolute paths that exist.
 */
export function getIssueDateWatchPaths(): string[] {
  const repoRoot = findRepoRoot(paths.root);
  if (!repoRoot) return [];
  const out: string[] = [];
  const headFile = path.join(repoRoot, '.git', 'HEAD');
  if (fs.existsSync(headFile)) out.push(headFile);
  // Also watch the currently-checked-out branch ref for new commits.
  const branchRef = readActiveBranchRef(repoRoot);
  if (branchRef && fs.existsSync(branchRef)) out.push(branchRef);
  return out;
}

// ============================================================================
// Internals
// ============================================================================

function ensureFresh(trackerRoot: string): void {
  const repoRoot = findRepoRoot(trackerRoot);
  if (!repoRoot) {
    // Not a git checkout. Leave cache empty so callers fall back.
    cache.delete(trackerRoot);
    return;
  }

  const headSha = currentHeadSha(repoRoot);
  if (!headSha) {
    cache.delete(trackerRoot);
    return;
  }

  const entry = cache.get(trackerRoot);
  if (entry && entry.syncedAt === headSha) return;

  if (entry && entry.syncedAt && isAncestor(repoRoot, entry.syncedAt, headSha)) {
    // Incremental: walk only the new commits.
    incrementalRefresh(trackerRoot, repoRoot, entry, headSha);
    return;
  }

  // Cold start or non-linear move (rebase, branch switch, checkout backward).
  fullBuild(trackerRoot, repoRoot, headSha);
}

function fullBuild(trackerRoot: string, repoRoot: string, headSha: string): void {
  const issues = walkLog(repoRoot, trackerRoot, /* sinceSha */ null);
  cache.set(trackerRoot, { issues, syncedAt: headSha });
}

function incrementalRefresh(
  trackerRoot: string,
  repoRoot: string,
  entry: CacheEntry,
  headSha: string,
): void {
  // Patch entries touched in the new range. Because git log is reverse-
  // chronological, the first hit per path is the most recent commit; that's
  // strictly newer than anything currently in the cache, so a single
  // overwrite per touched issue is correct.
  const touched = walkLog(repoRoot, trackerRoot, entry.syncedAt);
  for (const [slug, iso] of touched) {
    entry.issues.set(slug, iso);
  }
  entry.syncedAt = headSha;
}

/**
 * Walk `git log` and return per-issue most-recent-commit-date map.
 * When `sinceSha` is null, walks all history. Otherwise walks
 * `<sinceSha>..HEAD` so only new commits are read.
 */
function walkLog(
  repoRoot: string,
  trackerRoot: string,
  sinceSha: string | null,
): Map<string, string> {
  const result = new Map<string, string>();
  const trackerRel = path.relative(repoRoot, trackerRoot);
  if (!trackerRel || trackerRel.startsWith('..')) return result;

  const args = ['log', '--no-merges', '--name-only', `--pretty=format:${RECORD_SEP}%aI`];
  if (sinceSha) args.push(`${sinceSha}..HEAD`);
  args.push('--', trackerRel);

  const child = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (child.status !== 0) return result;

  const out = child.stdout || '';
  let currentDate: string | null = null;
  for (const rawLine of out.split('\n')) {
    if (!rawLine) continue;
    if (rawLine.startsWith(RECORD_SEP)) {
      currentDate = rawLine.slice(RECORD_SEP.length);
      continue;
    }
    if (!currentDate) continue;
    // Lines under each commit are paths relative to the repo root.
    const slug = issueSlugFromRepoPath(rawLine, trackerRel);
    if (!slug) continue;
    // First hit per slug wins (reverse-chronological order).
    if (!result.has(slug)) result.set(slug, currentDate);
  }
  return result;
}

/** Extract the `YYYY-MM-DD-<slug>` segment when `repoPath` lives under
 *  `trackerRel/<slug>/...`. Returns null otherwise. */
function issueSlugFromRepoPath(repoPath: string, trackerRel: string): string | null {
  // Normalise separators — git on Windows can emit forward slashes either way.
  const normalised = repoPath.replace(/\\/g, '/');
  const prefix = trackerRel.replace(/\\/g, '/') + '/';
  if (!normalised.startsWith(prefix)) return null;
  const rest = normalised.slice(prefix.length);
  const slash = rest.indexOf('/');
  const candidate = slash === -1 ? rest : rest.slice(0, slash);
  if (!FOLDER_PATTERN.test(candidate)) return null;
  return candidate;
}

// ============================================================================
// Git helpers (lightweight — no external dep)
// ============================================================================

function findRepoRoot(startDir: string): string | null {
  if (repoRootByPath.has(startDir)) return repoRootByPath.get(startDir)!;
  let dir = startDir;
  while (true) {
    if (fs.existsSync(path.join(dir, '.git'))) {
      repoRootByPath.set(startDir, dir);
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      repoRootByPath.set(startDir, null);
      return null;
    }
    dir = parent;
  }
}

function currentHeadSha(repoRoot: string): string | null {
  const r = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: repoRoot, encoding: 'utf-8' });
  if (r.status !== 0) return null;
  const sha = (r.stdout || '').trim();
  return sha || null;
}

function isAncestor(repoRoot: string, ancestor: string, descendant: string): boolean {
  const r = spawnSync(
    'git',
    ['merge-base', '--is-ancestor', ancestor, descendant],
    { cwd: repoRoot },
  );
  return r.status === 0;
}

function readActiveBranchRef(repoRoot: string): string | null {
  try {
    const head = fs.readFileSync(path.join(repoRoot, '.git', 'HEAD'), 'utf-8').trim();
    const m = head.match(/^ref:\s+(.+)$/);
    if (!m) return null; // detached HEAD
    return path.join(repoRoot, '.git', m[1]);
  } catch {
    return null;
  }
}