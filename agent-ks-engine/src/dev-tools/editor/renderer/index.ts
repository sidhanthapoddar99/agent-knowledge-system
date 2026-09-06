/**
 * Client-side markdown renderer for the editor preview pane.
 *
 * Uses `marked` + `shiki` — same libraries as the server-side renderer —
 * producing identical HTML output. No server round-trip needed.
 *
 * Shiki is loaded lazily (async) for syntax highlighting. Until it's ready,
 * code blocks render without highlighting. Once loaded, a re-render is triggered.
 */

import { Marked } from 'marked';
import markedAlert from 'marked-alert';
import type { Highlighter } from 'shiki';
import type { Disposable } from '../types.js';

const DIAGRAM_LANGS = new Set(['mermaid', 'dot', 'graphviz']);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---- Shiki highlighter (lazy, shared across renderer instances) ----

let shikiPromise: Promise<Highlighter> | null = null;
let shikiInstance: Highlighter | null = null;

async function loadShiki(): Promise<Highlighter> {
  if (shikiInstance) return shikiInstance;
  if (!shikiPromise) {
    shikiPromise = import('shiki').then(({ createHighlighter }) =>
      createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: [
          'javascript', 'typescript', 'jsx', 'tsx',
          'html', 'css', 'scss', 'json', 'yaml',
          'python', 'bash', 'shell',
          'rust', 'go', 'java', 'c', 'cpp',
          'sql', 'graphql', 'markdown',
          'ruby', 'php', 'swift', 'kotlin',
          'dockerfile', 'toml', 'xml',
        ],
      })
    ).then(h => { shikiInstance = h; return h; });
  }
  return shikiPromise;
}

// ---- Create marked instance ----

function createMarkedInstance(highlighter: Highlighter | null): Marked {
  const marked = new Marked({
    gfm: true,
    breaks: false,
    renderer: {
      code({ text, lang }) {
        // Diagram code blocks
        if (lang && DIAGRAM_LANGS.has(lang.toLowerCase())) {
          const type = lang.toLowerCase() === 'mermaid' ? 'mermaid' : 'graphviz';
          return `<div class="diagram diagram-${type}">${escapeHtml(text)}</div>`;
        }

        // Syntax highlighted code blocks (matches server output exactly)
        if (highlighter && lang && highlighter.getLoadedLanguages().includes(lang)) {
          const html = highlighter.codeToHtml(text, {
            lang,
            themes: { light: 'github-light', dark: 'github-dark' },
          });
          const displayLang = lang || 'text';
          return html.replace('<pre class="shiki', `<pre data-language="${displayLang}" class="shiki`);
        }

        // Fallback: no highlighting
        const escaped = escapeHtml(text);
        const displayLang = lang || 'text';
        return `<pre data-language="${displayLang}"><code class="language-${lang || 'text'}">${escaped}</code></pre>\n`;
      },

      // Task list items: wrap in flex container with separate checkbox + content divs
      listitem(token: any) {
        const text = token.text || '';
        const tokens = token.tokens || [];

        // Check if this is a task item
        if (token.task) {
          const checked = token.checked;
          const checkboxSvg = checked
            ? `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 5.5"/></svg>`
            : '';
          const checkedClass = checked ? ' task-checked' : '';
          const cbClass = checked ? 'task-checkbox task-checkbox-checked' : 'task-checkbox';

          // Parse the inner content (skip the checkbox that marked already added)
          let inner = this.parser.parse(tokens);
          // Remove the <input> checkbox that marked injects
          inner = inner.replace(/<input[^>]*type="checkbox"[^>]*>\s*/gi, '');

          return `<li class="task-item${checkedClass}"><span class="${cbClass}">${checkboxSvg}</span><span class="task-content">${inner}</span></li>\n`;
        }

        return `<li>${this.parser.parse(tokens)}</li>\n`;
      },
    },
  });

  // GFM alert blockquotes: > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
  marked.use(markedAlert());

  return marked;
}

// ---- Strip frontmatter ----

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---\n') && !markdown.startsWith('---\r\n')) return markdown;
  const closeIdx = markdown.indexOf('\n---', 4);
  if (closeIdx === -1) return markdown;
  let end = closeIdx + 4;
  if (end < markdown.length && markdown[end] === '\n') end++;
  return markdown.slice(end);
}

// ---- Public API ----

export interface ClientRenderer extends Disposable {
  render(markdown: string): string;
  renderDebounced(markdown: string): void;
}

export function createClientRenderer(
  onRender: (html: string) => void,
  debounceMs = 150,
): ClientRenderer {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let lastMarkdown = '';
  let lastHtml = '';
  let markedInstance = createMarkedInstance(null); // start without highlighting
  let disposed = false;

  // Load Shiki in background, re-render once ready
  loadShiki().then(highlighter => {
    if (disposed) return;
    markedInstance = createMarkedInstance(highlighter);
    // Force re-render with highlighting
    if (lastMarkdown) {
      lastHtml = ''; // invalidate cache
      renderDebounced(lastMarkdown);
    }
  });

  function render(markdown: string): string {
    if (markdown === lastMarkdown && lastHtml) return lastHtml;
    lastMarkdown = markdown;

    try {
      const body = stripFrontmatter(markdown);
      lastHtml = markedInstance.parse(body) as string;
    } catch (err) {
      console.error('[renderer] Render failed:', err);
      lastHtml = `<pre style="color:red">Render error: ${err}</pre>`;
    }
    return lastHtml;
  }

  function renderDebounced(markdown: string): void {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const html = render(markdown);
      onRender(html);
    }, debounceMs);
  }

  return {
    render,
    renderDebounced,
    cleanup() {
      disposed = true;
      if (debounceTimer) clearTimeout(debounceTimer);
    },
  };
}
