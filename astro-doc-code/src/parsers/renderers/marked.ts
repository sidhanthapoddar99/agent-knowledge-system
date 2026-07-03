/**
 * Marked Renderer Configuration
 * Configures the marked markdown parser with extensions and options
 * Includes syntax highlighting via shiki
 */

import { Marked, type TokenizerAndRendererExtension } from 'marked';
import markedAlert from 'marked-alert';
import { createHighlighter, type Highlighter } from 'shiki';

export interface MarkdownRendererOptions {
  /** Enable GitHub Flavored Markdown */
  gfm?: boolean;
  /** Enable line breaks */
  breaks?: boolean;
  /** Sanitize output (deprecated in marked, handled separately) */
  sanitize?: boolean;
  /** Custom extensions */
  extensions?: TokenizerAndRendererExtension[];
}

const defaultOptions: MarkdownRendererOptions = {
  gfm: true,
  breaks: false,
  sanitize: false,
};

const DIAGRAM_LANGS = new Set(['mermaid', 'dot', 'graphviz']);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Shared highlighter instance (lazy-initialized)
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['github-light', 'github-dark'],
      langs: [
        'javascript', 'typescript', 'jsx', 'tsx',
        'html', 'css', 'scss', 'json', 'yaml',
        'python', 'bash', 'shell', 'sh',
        'rust', 'go', 'java', 'c', 'cpp',
        'sql', 'graphql', 'markdown',
        'ruby', 'php', 'swift', 'kotlin',
        'dockerfile', 'toml', 'xml',
      ],
    });
  }
  return highlighterPromise;
}

/**
 * Create an async markdown renderer with syntax highlighting
 */
export async function createMarkdownRendererAsync(
  options: MarkdownRendererOptions = {}
): Promise<(content: string) => string> {
  const mergedOptions = { ...defaultOptions, ...options };
  const highlighter = await getHighlighter();

  const instance = new Marked({
    gfm: mergedOptions.gfm,
    breaks: mergedOptions.breaks,
    renderer: {
      code({ text, lang }) {
        // Diagram code blocks — output raw containers for client-side rendering
        if (lang && DIAGRAM_LANGS.has(lang.toLowerCase())) {
          const type = lang.toLowerCase() === 'mermaid' ? 'mermaid' : 'graphviz';
          return `<div class="diagram diagram-${type}">${escapeHtml(text)}</div>`;
        }
        const language = lang && highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
        const html = highlighter.codeToHtml(text, {
          lang: language,
          themes: { light: 'github-light', dark: 'github-dark' },
        });
        // Add data-language for the code block label/copy button
        const displayLang = lang || 'text';
        return html.replace('<pre class="shiki', `<pre data-language="${displayLang}" class="shiki`);
      },

      // Task list items: flex container [checkbox] [content]
      listitem(token: any) {
        const tokens = token.tokens || [];
        if (token.task) {
          const checked = token.checked;
          const checkboxSvg = checked
            ? `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 5.5"/></svg>`
            : '';
          const checkedClass = checked ? ' task-checked' : '';
          const cbClass = checked ? 'task-checkbox task-checkbox-checked' : 'task-checkbox';
          let inner = this.parser.parse(tokens);
          inner = inner.replace(/<input[^>]*type="checkbox"[^>]*>\s*/gi, '');
          return `<li class="task-item${checkedClass}"><span class="${cbClass}">${checkboxSvg}</span><span class="task-content">${inner}</span></li>\n`;
        }
        return `<li>${this.parser.parse(tokens)}</li>\n`;
      },
    },
  });

  // GFM alert blockquotes: > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
  instance.use(markedAlert());

  if (mergedOptions.extensions && mergedOptions.extensions.length > 0) {
    instance.use({ extensions: mergedOptions.extensions });
  }

  return (content: string): string => {
    return instance.parse(content) as string;
  };
}

/**
 * Create a markdown renderer function (sync, no highlighting)
 */
export function createMarkdownRenderer(options: MarkdownRendererOptions = {}): (content: string) => string {
  const mergedOptions = { ...defaultOptions, ...options };

  const instance = new Marked({
    gfm: mergedOptions.gfm,
    breaks: mergedOptions.breaks,
    renderer: {
      listitem(token: any) {
        const tokens = token.tokens || [];
        if (token.task) {
          const checked = token.checked;
          const checkboxSvg = checked
            ? `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3.5 8.5 6.5 11.5 12.5 5.5"/></svg>`
            : '';
          const checkedClass = checked ? ' task-checked' : '';
          const cbClass = checked ? 'task-checkbox task-checkbox-checked' : 'task-checkbox';
          let inner = this.parser.parse(tokens);
          inner = inner.replace(/<input[^>]*type="checkbox"[^>]*>\s*/gi, '');
          return `<li class="task-item${checkedClass}"><span class="${cbClass}">${checkboxSvg}</span><span class="task-content">${inner}</span></li>\n`;
        }
        return `<li>${this.parser.parse(tokens)}</li>\n`;
      },
    },
  });

  // GFM alert blockquotes: > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
  instance.use(markedAlert());

  if (mergedOptions.extensions && mergedOptions.extensions.length > 0) {
    instance.use({ extensions: mergedOptions.extensions });
  }

  return (content: string): string => {
    return instance.parse(content) as string;
  };
}

/**
 * Create a configured marked instance
 * Useful when you need more control over the parsing process
 */
export function createMarkedInstance(options: MarkdownRendererOptions = {}): Marked {
  const mergedOptions = { ...defaultOptions, ...options };

  const instance = new Marked({
    gfm: mergedOptions.gfm,
    breaks: mergedOptions.breaks,
  });

  // GFM alert blockquotes: > [!NOTE] / [!TIP] / [!IMPORTANT] / [!WARNING] / [!CAUTION]
  instance.use(markedAlert());

  if (mergedOptions.extensions && mergedOptions.extensions.length > 0) {
    instance.use({ extensions: mergedOptions.extensions });
  }

  return instance;
}

/**
 * Render markdown to HTML synchronously (no highlighting)
 */
export function renderMarkdown(content: string, options?: MarkdownRendererOptions): string {
  const render = createMarkdownRenderer(options);
  return render(content);
}

/**
 * Default renderer instance (sync, no highlighting)
 */
export const defaultRenderer = createMarkdownRenderer();
