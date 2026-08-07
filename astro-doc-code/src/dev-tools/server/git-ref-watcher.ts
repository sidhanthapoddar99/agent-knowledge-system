/**
 * Git ref watcher — fires when the checked-out commit moves.
 *
 * The issue tracker derives each issue's `updated` date from git history, and
 * caches it. Something has to tell that cache when a commit lands, or dev
 * serves dates that are days stale until the server restarts.
 *
 * ## Why this does not use Vite's watcher
 *
 * It cannot. Vite builds its chokidar options with `"**\/.git/**"` as the first
 * entry of `ignored`, unconditionally, before any user config is merged
 * (`resolveChokidarOptions` in vite/dist/node). `server.watcher.add(refPath)`
 * therefore registers the path and then filters every event for it — the
 * watcher looks armed, logs that it is watching, and stays silent forever.
 * That is not a version regression; it is true on every Vite that has shipped
 * this list, which is why the symptom reproduced identically on Astro 5 and 7.
 *
 * ## Why it watches directories rather than the ref files
 *
 * Git never writes a ref in place. It writes `<ref>.lock` and renames it over
 * the target, so the original inode is replaced. `fs.watch` on a file path
 * follows the inode, so a file-level watch survives exactly zero commits. A
 * watch on the containing directory sees the rename and keeps working.
 *
 * ## What it watches
 *
 * - `<repo>/.git` — `HEAD` (branch switch, rebase, detach) and `packed-refs`.
 * - the directory holding the active branch ref — `git commit` moves the branch
 *   ref and leaves `HEAD` alone, so this is the one that fires on a plain
 *   commit. Branch names contain slashes, so the directory is derived rather
 *   than assumed to be `.git/refs/heads`.
 *
 * After every event the watch set is re-resolved, so switching from `main` to
 * `feature/x` re-points the ref watch without a restart.
 */

import fs from 'fs';
import path from 'path';

export interface GitRefWatcher {
  /** Absolute ref files currently considered interesting. Diagnostics only. */
  watched(): string[];
  close(): void;
}

/** Git writes a ref, its lock and sometimes HEAD within a few milliseconds. */
const COALESCE_MS = 60;

export function watchGitRefs(
  getRefPaths: () => string[],
  onChange: (changedRef: string) => void,
  log: (message: string) => void = () => {},
): GitRefWatcher {
  const watchers = new Map<string, fs.FSWatcher>();
  let interesting = new Set<string>();
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pending: string | null = null;
  let closed = false;

  function fire(changedRef: string): void {
    pending = changedRef;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const ref = pending;
      pending = null;
      if (closed || !ref) return;
      onChange(ref);
      // HEAD may have moved to a different branch — re-point before the next event.
      reconcile();
    }, COALESCE_MS);
  }

  function reconcile(): void {
    if (closed) return;

    const refs = getRefPaths();
    interesting = new Set(refs);

    const wantedDirs = new Set(refs.map((p) => path.dirname(p)));

    for (const [dir, watcher] of watchers) {
      if (!wantedDirs.has(dir)) {
        watcher.close();
        watchers.delete(dir);
      }
    }

    for (const dir of wantedDirs) {
      if (watchers.has(dir)) continue;
      try {
        const watcher = fs.watch(dir, { persistent: false }, (_event, filename) => {
          if (!filename) {
            // No name on this platform — cannot tell what moved, so assume it matters.
            fire(refs[0] ?? dir);
            return;
          }
          const full = path.join(dir, filename.toString());
          if (interesting.has(full)) fire(full);
        });
        // A ref directory can be removed by `git gc` packing refs away.
        watcher.on('error', () => {
          watcher.close();
          watchers.delete(dir);
        });
        watchers.set(dir, watcher);
        log(`[git-refs] watching ${dir}`);
      } catch (err) {
        // Do not take the dev server down because a ref directory vanished.
        log(`[git-refs] cannot watch ${dir}: ${(err as Error).message}`);
      }
    }
  }

  reconcile();

  return {
    watched: () => [...interesting],
    close: () => {
      closed = true;
      if (timer) clearTimeout(timer);
      for (const watcher of watchers.values()) watcher.close();
      watchers.clear();
    },
  };
}
