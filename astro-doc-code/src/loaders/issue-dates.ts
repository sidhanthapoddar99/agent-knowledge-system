/**
 * Issue date cache — derived `updated` dates from git history.
 *
 * Per-tracker in-memory map of `<issue-folder> → ISO author date`. Built once
 * on cold start by walking `git log --no-merges --name-only -- <tracker>` and
 * taking the most recent commit date that touched any file under each issue
 * folder.
 *
 * Lazy invalidation: the watcher in `dev-tools/integration.ts` clears the
 * cache entry on `.git/HEAD` or active-branch-ref change, and the next
 * reader rebuilds via the cold path. Reads themselves never spawn git —
 * a populated cache is trusted until invalidated.
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
  /** HEAD SHA at the time the cache was populated. Empty when unset.
   *  Stored only for diagnostics — the watcher invalidates on git change,
   *  reads never compare against HEAD. */
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
  // Lazy invalidation: trust the cache whenever it's populated. The watcher
  // (`.git/HEAD` + active branch ref in dev-tools/integration.ts) is the
  // authoritative invalidation signal — on any git-state change it deletes
  // the entry, and the next read here lands in the cold path and rebuilds.
  // Reads never compare against HEAD; that kept this loader's hot path at
  // a Map.get() instead of a sync `git rev-parse` per call.
  if (cache.has(trackerRoot)) return;

  const repoRoot = findRepoRoot(trackerRoot);
  if (!repoRoot) return; // Not a git checkout — leave cache empty so callers fall back.

  const headSha = currentHeadSha(repoRoot);
  if (!headSha) return;

  fullBuild(trackerRoot, repoRoot, headSha);
}

function fullBuild(trackerRoot: string, repoRoot: string, headSha: string): void {
  const issues = walkLog(repoRoot, trackerRoot);
  cache.set(trackerRoot, { issues, syncedAt: headSha });
}

/** Walk `git log` and return per-issue most-recent-commit-date map. */
function walkLog(repoRoot: string, trackerRoot: string): Map<string, string> {
  const result = new Map<string, string>();
  const trackerRel = path.relative(repoRoot, trackerRoot);
  if (!trackerRel || trackerRel.startsWith('..')) return result;

  const args = [
    'log', '--no-merges', '--name-only',
    `--pretty=format:${RECORD_SEP}%aI`,
    '--', trackerRel,
  ];

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