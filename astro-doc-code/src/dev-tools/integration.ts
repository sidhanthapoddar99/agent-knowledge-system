/**
 * Dev Toolbar Integration
 *
 * Registers the layout & theme selector app with Astro's dev toolbar.
 * Only active during development (npm run start).
 *
 * Uses unified cache manager for selective invalidation:
 * - Content changes: invalidate content + sidebar
 * - Settings changes: invalidate sidebar + settings
 * - Theme changes: invalidate theme only
 * - Config changes: invalidate config (+ theme if site.yaml)
 */

import type { AstroIntegration } from 'astro';
import path from 'path';
import fs from 'fs';
import yaml from 'js-yaml';
import cacheManager from '../loaders/cache-manager';
import { paths, getUserPaths, getPathsByCategory } from '../loaders/paths';
import { getThemePaths, loadSiteConfig } from '../loaders/config';
import { invalidateIssueDateCache, getIssueDateWatchPaths } from '../loaders/issue-dates';
import { invalidateIssuesCache } from '../loaders/issues';
import { EditorStore } from './server/editor-store';
import { setupEditorMiddleware } from './server/middleware';
import { PresenceManager, type PresenceConfig } from './server/presence';
import { YjsSync } from './server/yjs-sync';

/**
 * Read editor configuration from site.yaml.
 * Throws a clear error if editor.autosave_interval is missing.
 * Presence settings are optional with sensible defaults.
 */
function getEditorConfig(): { autosaveInterval: number; presence: PresenceConfig } {
  const siteYamlPath = path.join(paths.config, 'site.yaml');

  if (!fs.existsSync(siteYamlPath)) {
    throw new Error(
      `\n[CONFIG ERROR] site.yaml not found at: ${siteYamlPath}\n`
    );
  }

  const content = fs.readFileSync(siteYamlPath, 'utf-8');
  const config = yaml.load(content) as Record<string, any>;

  if (!config?.editor?.autosave_interval) {
    throw new Error(
      `\n[CONFIG ERROR] Missing required field "editor.autosave_interval" in site.yaml.\n` +
      `  Add the following to your site.yaml:\n\n` +
      `  editor:\n` +
      `    autosave_interval: 10000  # milliseconds\n`
    );
  }

  const autosaveInterval = Number(config.editor.autosave_interval);
  if (isNaN(autosaveInterval) || autosaveInterval < 1000) {
    throw new Error(
      `\n[CONFIG ERROR] "editor.autosave_interval" must be a number >= 1000 (ms).\n` +
      `  Current value: ${config.editor.autosave_interval}\n`
    );
  }

  // Presence config with defaults
  const p = config.editor?.presence || {};
  const presence: PresenceConfig = {
    pingInterval: Math.max(Number(p.ping_interval) || 5000, 1000),
    staleThreshold: Math.max(Number(p.stale_threshold) || 30000, 5000),
    cursorThrottle: Math.max(Number(p.cursor_throttle) || 100, 16),
    contentDebounce: Math.max(Number(p.content_debounce) || 150, 50),
    sseKeepalive: Math.max(Number(p.sse_keepalive) || 15000, 5000),
    sseReconnect: Math.max(Number(p.sse_reconnect) || 2000, 500),
  };

  return { autosaveInterval, presence };
}

export function devToolbarIntegration(): AstroIntegration {
  return {
    name: 'dev-tools-apps',
    hooks: {
      'astro:config:setup': ({ addDevToolbarApp, updateConfig }) => {
        // Build watch paths from the initialized path system
        const watchPaths: string[] = [];
        for (const entry of getUserPaths().values()) {
          watchPaths.push(entry.absolutePath);
        }
        // Always include config dir
        if (!watchPaths.includes(paths.config)) {
          watchPaths.push(paths.config);
        }
        // Include built-in styles dir so CSS edits trigger cache invalidation + reload
        if (!watchPaths.includes(paths.styles)) {
          watchPaths.push(paths.styles);
        }

        // Ensure site config is loaded so getThemePaths() is populated.
        // initPaths() has already run (from astro.config.mjs), but loadSiteConfig()
        // is what resolves theme_paths from site.yaml → absolute paths.
        loadSiteConfig();

        // Theme paths (used by cache manager and watcher handler)
        const themePaths = [...getThemePaths(), paths.styles];

        // Configure cache manager with categorized watch paths
        cacheManager.setWatchPaths({
          contentPaths: getPathsByCategory('content'),
          configPaths: getPathsByCategory('config'),
          assetPaths: getPathsByCategory('asset'),
          themePaths,
        });

        // Create editor store and presence manager
        const editorConfig = getEditorConfig();
        const editorStore = new EditorStore({
          autosaveInterval: editorConfig.autosaveInterval,
          watchPaths,
        });
        const presenceManager = new PresenceManager(editorConfig.presence);

        // Extensions to ignore (temp files, system files, etc.)
        const ignoreExtensions = ['.DS_Store', '.gitkeep', '.tmp', '.swp', '.bak'];

        // Helper to check if file should trigger reload
        const shouldTriggerReload = (file: string): boolean => {
          const isInWatchPath = watchPaths.some(p => file.startsWith(p));
          const isIgnored = ignoreExtensions.some(ext => file.endsWith(ext));
          return isInWatchPath && !isIgnored;
        };

        // Add Vite plugin to handle cache invalidation on file changes
        updateConfig({
          vite: {
            plugins: [
              (() => {
                // yjsSync is shared between configureServer and handleHotUpdate
                let yjsSync: YjsSync;
                return {
                name: 'cache-invalidation',
                configureServer(server) {
                  // Create Yjs sync manager and attach to HTTP server
                  yjsSync = new YjsSync();
                  yjsSync.setContentChangeHandler((filePath, raw) => {
                    editorStore.updateRaw(filePath, raw);
                  });
                  yjsSync.setDependencies(presenceManager, editorStore, editorConfig.presence);
                  if (server.httpServer) {
                    yjsSync.attachToServer(server.httpServer);
                  }

                  // Set up editor middleware, presence, and start background save
                  setupEditorMiddleware(
                    server,
                    editorStore,
                    presenceManager,
                    yjsSync,
                  );
                  editorStore.startBackgroundSave();
                  presenceManager.startCleanup();
                  yjsSync.startEviction();

                  // Stop presence cleanup and room eviction when server closes
                  server.httpServer?.on('close', () => {
                    presenceManager.stopCleanup();
                    yjsSync.stopEviction();
                  });

                  // Explicitly add watch paths to Vite's watcher
                  // Vite only watches src/ by default, not external content directories
                  watchPaths.forEach(watchPath => {
                    server.watcher.add(watchPath);
                    console.log('[HMR] Watching:', watchPath);
                  });

                  // Watch git refs so the derived issue-date cache invalidates
                  // on commit / checkout / pull. The cache is in-memory and
                  // only refreshes when something in the issues loader asks.
                  // Single listener + a dynamically-reconciled watch set:
                  // after `.git/HEAD` moves (branch switch), we re-resolve
                  // the active branch ref and re-point the watcher.
                  //
                  // Note: under Vite 6 SSR, the modules loaded by this plugin
                  // context and the modules loaded by the SSR context can be
                  // *separate instances* sharing source but not module-level
                  // state. Clearing only the local imports leaves the SSR
                  // copy stale; layouts then render an old `updated`. So
                  // after invalidating locally we also force-clear via
                  // `server.ssrLoadModule` to hit the same instance the
                  // layouts are reading from. See:
                  //   default-docs/data/todo/2026-05-08-update-date-time-
                  //     optimization/notes/03_ssr-module-isolation.md
                  let watchedGitPaths = new Set<string>(getIssueDateWatchPaths());
                  for (const p of watchedGitPaths) {
                    server.watcher.add(p);
                    console.log('[HMR] Watching git ref:', p);
                  }
                  // Absolute file paths of the modules we need to invalidate
                  // in the SSR context. Computed once so we can use the
                  // moduleGraph API reliably (which keys by absolute id).
                  const issueDatesModuleId = path.resolve(
                    path.dirname(new URL(import.meta.url).pathname),
                    '../loaders/issue-dates.ts',
                  );
                  const issuesLoaderModuleId = path.resolve(
                    path.dirname(new URL(import.meta.url).pathname),
                    '../loaders/issues.ts',
                  );

                  server.watcher.on('change', async (file) => {
                    if (!watchedGitPaths.has(file)) return;
                    console.log('[issue-dates] git ref changed:', path.basename(file));

                    // 1. Clear local (plugin-context) instances.
                    invalidateIssueDateCache();
                    invalidateIssuesCache();

                    // 2. Invalidate the SSR-context modules via moduleGraph.
                    //    Forces Vite to re-instantiate them on the next request,
                    //    which gives a fresh empty cache and a fresh git walk.
                    //    Belt-and-suspenders against Vite's plugin/SSR module
                    //    isolation. See:
                    //      default-docs/data/todo/2026-05-08-update-date-time-
                    //        optimization/notes/03_ssr-module-isolation.md
                    let invalidatedAny = false;
                    for (const id of [issueDatesModuleId, issuesLoaderModuleId]) {
                      const mod = server.moduleGraph.getModuleById(id);
                      if (mod) {
                        server.moduleGraph.invalidateModule(mod);
                        invalidatedAny = true;
                        console.log('[issue-dates] SSR module invalidated:', path.basename(id));
                      }
                    }
                    if (!invalidatedAny) {
                      console.log('[issue-dates] no SSR modules in graph yet (first-load case)');
                    }

                    const desired = new Set(getIssueDateWatchPaths());
                    for (const p of watchedGitPaths) {
                      if (!desired.has(p)) server.watcher.unwatch(p);
                    }
                    for (const p of desired) {
                      if (!watchedGitPaths.has(p)) {
                        server.watcher.add(p);
                        console.log('[HMR] Watching git ref:', p);
                      }
                    }
                    watchedGitPaths = desired;
                  });

                  // Watch for file additions
                  server.watcher.on('add', (file) => {
                    if (shouldTriggerReload(file)) {
                      const shortPath = file.split('/').slice(-3).join('/');
                      const { type, invalidated } = cacheManager.onFileAdd(file);
                      console.log(`[cache] File added (${type}):`, shortPath);
                      console.log(`[cache] Invalidated: ${invalidated.join(', ') || 'none'}`);

                      // Suppress reload if file is being edited
                      if (editorStore.isEditing(file)) {
                        if (!editorStore.consumeEditorSave(file)) {
                          console.log(`[editor] External file add detected: ${shortPath}`);
                          const doc = editorStore.reloadFromDisk(file);
                          yjsSync.resetContent(file, doc.raw);
                        }
                      } else {
                        server.ws.send({ type: 'full-reload' });
                      }
                    }
                  });

                  // Watch for file deletions
                  server.watcher.on('unlink', (file) => {
                    if (shouldTriggerReload(file)) {
                      const shortPath = file.split('/').slice(-3).join('/');
                      const { type, invalidated } = cacheManager.onFileDelete(file);
                      console.log(`[cache] File deleted (${type}):`, shortPath);
                      console.log(`[cache] Invalidated: ${invalidated.join(', ') || 'none'}`);

                      // Suppress reload if file is being edited
                      if (!editorStore.isEditing(file)) {
                        server.ws.send({ type: 'full-reload' });
                      }
                    }
                  });
                },
                async handleHotUpdate({ file, server }) {
                  // Check if file should trigger reload
                  if (!shouldTriggerReload(file)) return;

                  const shortPath = file.split('/').slice(-3).join('/');
                  const { type, invalidated } = cacheManager.onFileChange(file);
                  console.log(`[cache] File changed (${type}):`, shortPath);
                  console.log(`[cache] Invalidated: ${invalidated.join(', ') || 'none'}`);

                  // Suppress full-reload if file is being edited
                  // Caches are still cleared above, but we don't reload the page
                  if (editorStore.isEditing(file)) {
                    if (editorStore.consumeEditorSave(file)) {
                      // Our own save — just suppress HMR, no need to notify
                      console.log(`[editor] HMR suppressed (editor save): ${shortPath}`);
                    } else {
                      // External edit — reload from disk and push via Yjs
                      console.log(`[editor] External edit detected: ${shortPath}`);
                      try {
                        const doc = editorStore.reloadFromDisk(file);
                        yjsSync.resetContent(file, doc.raw);
                      } catch (err) {
                        console.error(`[editor] Failed to reload from disk: ${shortPath}`, err);
                      }
                    }
                    return [];
                  }

                  // Send full page reload to browser
                  server.ws.send({ type: 'full-reload' });

                  // Return empty array to prevent Vite's default HMR
                  return [];
                },
              };
              })(),
            ],
          },
        });

        // Layout & Theme Selector
        addDevToolbarApp({
          id: 'layout-theme-selector',
          name: 'Layout & Theme',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
          entrypoint: './src/dev-tools/layout-selector/index.ts',
        });

        // Error Logger
        addDevToolbarApp({
          id: 'error-logger',
          name: 'Doc Errors',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
          entrypoint: './src/dev-tools/error-logger/index.ts',
        });

        // Live Documentation Editor (CodeMirror 6)
        addDevToolbarApp({
          id: 'doc-editor',
          name: 'Edit Page',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
          entrypoint: './src/dev-tools/editor/index.ts',
        });

        // System Metrics (CPU / RAM / load avg) — lands in Astro's 3-dot overflow
        addDevToolbarApp({
          id: 'system-metrics',
          name: 'System Metrics',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
          entrypoint: './src/dev-tools/system-metrics/index.ts',
        });

        // Cache Inspector (Yjs rooms, editor docs, presence) — also in the 3-dot overflow
        addDevToolbarApp({
          id: 'cache-inspector',
          name: 'Cache Inspector',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 11v6c0 1.66 4.03 3 9 3s9-1.34 9-3v-6"/></svg>`,
          entrypoint: './src/dev-tools/cache-inspector/index.ts',
        });

        // Browser Cache (localStorage state + clear actions) — below Cache Inspector
        addDevToolbarApp({
          id: 'browser-cache',
          name: 'Browser Cache',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20"/><path d="M10 12l2 2 4-4"/></svg>`,
          entrypoint: './src/dev-tools/browser-cache/index.ts',
        });
      },
    },
  };
}

export default devToolbarIntegration;
