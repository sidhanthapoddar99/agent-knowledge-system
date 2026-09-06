/**
 * Shared CSS for the non-editor dev-tools apps.
 *
 * Each Astro dev toolbar app lives in its own shadow root, so shared styles
 * can't be linked via a stylesheet — every app instead appends this string
 * to a <style> in its own canvas (usually as a prefix before app-specific
 * rules so the app's own rules can override if needed).
 *
 * Exposes:
 *   - Custom properties on :host — colors, typography, spacing, shape
 *   - Structural primitives: .dt-root · .dt-card · .dt-head · .dt-status · .dt-empty
 *   - Default height cap on the built-in astro-dev-toolbar-window element
 *
 * App-specific styling (grids, tables, bars, option-lists, etc.) stays local
 * to each app with its own BEM prefix (sm-*, ci-*, …). The editor app
 * (src/dev-tools/editor/) has its own --ev-* token system and does not
 * consume this file.
 */

export const devToolsSharedCss = `
  :host {
    /* Surfaces */
    --dt-bg-card: #18181b;
    --dt-bg-hover: #27272a;
    --dt-border: #27272a;
    --dt-border-subtle: #18181b;

    /* Text */
    --dt-text: #e4e4e7;
    --dt-text-muted: #a1a1aa;
    --dt-text-faint: #71717a;
    --dt-text-code: #d4d4d8;

    /* Accents */
    --dt-accent: #60a5fa;
    --dt-warn:   #fbbf24;
    --dt-danger: #f87171;

    /* Typography */
    --dt-font-body: 12px/1.4 system-ui, -apple-system, sans-serif;
    --dt-font-mono: 'JetBrains Mono', ui-monospace, monospace;
    --dt-text-micro: 10px;
    --dt-text-label: 11px;

    /* Shape */
    --dt-radius: 6px;
    --dt-radius-sm: 2px;
    --dt-pad-card: 10px;
    --dt-gap: 10px;
  }

  astro-dev-toolbar-window {
    max-height: 80vh !important;
    overflow-y: auto;
  }

  .dt-root {
    font: var(--dt-font-body);
    color: var(--dt-text);
    padding: 12px;
  }

  .dt-card {
    background: var(--dt-bg-card);
    border: 1px solid var(--dt-border);
    border-radius: var(--dt-radius);
    padding: var(--dt-pad-card);
    margin-bottom: var(--dt-gap);
  }
  .dt-card:last-child { margin-bottom: 0; }

  .dt-head {
    font-size: var(--dt-text-label);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--dt-text-muted);
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dt-status {
    color: var(--dt-text-faint);
    font-size: var(--dt-text-micro);
    margin-top: 4px;
  }

  .dt-empty {
    color: var(--dt-text-faint);
    font-style: italic;
    padding: 10px;
    text-align: center;
  }
`;
