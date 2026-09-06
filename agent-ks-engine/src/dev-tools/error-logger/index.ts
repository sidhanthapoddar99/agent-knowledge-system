/**
 * Dev Toolbar - Error Logger
 *
 * Displays all errors and warnings collected during content loading.
 * Groups errors by file for easy navigation.
 */

import { devToolsSharedCss } from '../_shared/styles';

interface ContentError {
  file: string;
  line?: number;
  type: string;
  message: string;
  suggestion?: string;
  timestamp: number;
}

interface ContentWarning {
  file: string;
  line?: number;
  type: string;
  message: string;
  suggestion?: string;
  timestamp: number;
}

interface ErrorsResponse {
  errors: ContentError[];
  warnings: ContentWarning[];
  stats: {
    initialized: boolean;
    entryCount: number;
    errorCount: number;
    warningCount: number;
    lastUpdate: number;
  };
}

export default {
  id: 'error-logger',
  name: 'Doc Errors',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,

  async init(canvas: ShadowRoot, _app: any, _server: any) {
    // Create styles
    // Shared tokens first, then app-specific rules (so app overrides win).
    const styles = document.createElement('style');
    styles.textContent = devToolsSharedCss + `
      .error-panel {
        padding: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        min-width: 350px;
        max-width: 500px;
        max-height: 400px;
        overflow-y: auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .header-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
      }

      .error-count {
        background: #ef4444;
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
      }

      .warning-count {
        background: #f59e0b;
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 11px;
        font-weight: 600;
      }

      .header-buttons {
        display: flex;
        gap: 6px;
      }

      .btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.7);
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
      }

      .btn.copied {
        background: rgba(34, 197, 94, 0.2);
        border-color: rgba(34, 197, 94, 0.4);
        color: #86efac;
      }

      .copy-icon {
        width: 12px;
        height: 12px;
      }

      .copy-item-btn {
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.4);
        padding: 2px;
        cursor: pointer;
        border-radius: 3px;
        display: flex;
        align-items: center;
        margin-left: auto;
      }

      .copy-item-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
      }

      .copy-item-btn.copied {
        color: #86efac;
      }

      .file-group {
        margin-bottom: 12px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 6px;
        overflow: hidden;
      }

      .file-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: rgba(255, 255, 255, 0.05);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        cursor: pointer;
      }

      .file-header:hover {
        background: rgba(255, 255, 255, 0.08);
      }

      .file-icon {
        width: 14px;
        height: 14px;
        opacity: 0.6;
      }

      .file-name {
        flex: 1;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.9);
        font-family: 'SF Mono', Monaco, monospace;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-count {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 8px;
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
      }

      .issue-list {
        padding: 6px;
      }

      .issue-item {
        padding: 8px;
        margin-bottom: 4px;
        border-radius: 4px;
        background: rgba(255, 255, 255, 0.02);
      }

      .issue-item:last-child {
        margin-bottom: 0;
      }

      .issue-item.error {
        border-left: 3px solid #ef4444;
      }

      .issue-item.warning {
        border-left: 3px solid #f59e0b;
      }

      .issue-header {
        display: flex;
        align-items: center;
        gap: 6px;
        margin-bottom: 4px;
      }

      .issue-badge {
        font-size: 9px;
        padding: 2px 5px;
        border-radius: 3px;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.3px;
      }

      .issue-badge.error {
        background: rgba(239, 68, 68, 0.2);
        color: #fca5a5;
      }

      .issue-badge.warning {
        background: rgba(245, 158, 11, 0.2);
        color: #fcd34d;
      }

      .issue-line {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.5);
        font-family: 'SF Mono', Monaco, monospace;
      }

      .issue-message {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        line-height: 1.4;
        margin-bottom: 4px;
      }

      .issue-suggestion {
        font-size: 11px;
        color: rgba(99, 102, 241, 0.9);
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .issue-suggestion::before {
        content: '→';
        opacity: 0.6;
      }

      .empty-state {
        text-align: center;
        padding: 30px 20px;
        color: rgba(255, 255, 255, 0.5);
      }

      .empty-icon {
        width: 40px;
        height: 40px;
        margin: 0 auto 12px;
        opacity: 0.3;
      }

      .empty-title {
        font-size: 14px;
        font-weight: 500;
        margin-bottom: 4px;
        color: rgba(255, 255, 255, 0.7);
      }

      .empty-text {
        font-size: 12px;
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.5);
      }

      .stats {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
    `;

    // Create window
    const windowEl = document.createElement('astro-dev-toolbar-window');
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'error-panel';
    contentWrapper.innerHTML = '<div class="loading">Loading errors...</div>';
    windowEl.appendChild(contentWrapper);

    canvas.appendChild(styles);
    canvas.appendChild(windowEl);

    // Fetch and render errors
    const renderErrors = async () => {
      try {
        const response = await fetch('/api/dev/errors');
        const data: ErrorsResponse = await response.json();

        const { errors, warnings, stats } = data;
        const allIssues = [...errors, ...warnings];

        if (allIssues.length === 0) {
          contentWrapper.innerHTML = `
            <div class="empty-state">
              <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
              <div class="empty-title">No issues found</div>
              <div class="empty-text">All documents are valid</div>
            </div>
            <div class="stats">
              Cache: ${stats.entryCount} entries | Last update: ${stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : 'Never'}
            </div>
          `;
          return;
        }

        // Group by file
        const grouped = new Map<string, (ContentError | ContentWarning)[]>();
        for (const issue of allIssues) {
          const existing = grouped.get(issue.file) || [];
          existing.push(issue);
          grouped.set(issue.file, existing);
        }

        let html = `
          <div class="header">
            <div class="header-title">
              <span>Issues</span>
              ${errors.length > 0 ? `<span class="error-count">${errors.length} errors</span>` : ''}
              ${warnings.length > 0 ? `<span class="warning-count">${warnings.length} warnings</span>` : ''}
            </div>
            <div class="header-buttons">
              <button class="btn" id="copy-all-errors">
                <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy All
              </button>
              <button class="btn" id="refresh-errors">Refresh</button>
            </div>
          </div>
        `;

        for (const [file, issues] of grouped) {
          html += `
            <div class="file-group">
              <div class="file-header">
                <svg class="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="file-name" title="${file}">${file}</span>
                <span class="file-count">${issues.length}</span>
              </div>
              <div class="issue-list">
          `;

          for (const issue of issues) {
            const isError = errors.includes(issue as ContentError);
            const issueType = isError ? 'error' : 'warning';
            const badgeText = (issue as any).type || issueType;
            const issueJson = JSON.stringify(issue);

            html += `
              <div class="issue-item ${issueType}">
                <div class="issue-header">
                  <span class="issue-badge ${issueType}">${badgeText}</span>
                  ${issue.line ? `<span class="issue-line">line ${issue.line}</span>` : ''}
                  <button class="copy-item-btn" data-issue='${issueJson.replace(/'/g, '&#39;')}' title="Copy error">
                    <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  </button>
                </div>
                <div class="issue-message">${issue.message}</div>
                ${issue.suggestion ? `<div class="issue-suggestion">${issue.suggestion}</div>` : ''}
              </div>
            `;
          }

          html += `
              </div>
            </div>
          `;
        }

        html += `
          <div class="stats">
            Cache: ${stats.entryCount} entries | Last update: ${stats.lastUpdate ? new Date(stats.lastUpdate).toLocaleTimeString() : 'Never'}
          </div>
        `;

        contentWrapper.innerHTML = html;

        // Add refresh handler
        const refreshBtn = contentWrapper.querySelector('#refresh-errors');
        if (refreshBtn) {
          refreshBtn.addEventListener('click', () => {
            contentWrapper.innerHTML = '<div class="loading">Refreshing...</div>';
            renderErrors();
          });
        }

        // Add copy all handler
        const copyAllBtn = contentWrapper.querySelector('#copy-all-errors');
        if (copyAllBtn) {
          copyAllBtn.addEventListener('click', async () => {
            const allErrors = JSON.stringify(allIssues, null, 2);
            await navigator.clipboard.writeText(allErrors);
            copyAllBtn.classList.add('copied');
            copyAllBtn.innerHTML = `
              <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Copied!
            `;
            setTimeout(() => {
              copyAllBtn.classList.remove('copied');
              copyAllBtn.innerHTML = `
                <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy All
              `;
            }, 1500);
          });
        }

        // Add copy individual error handlers
        contentWrapper.querySelectorAll('.copy-item-btn').forEach((btn) => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const issueData = (btn as HTMLElement).dataset.issue;
            if (issueData) {
              await navigator.clipboard.writeText(issueData);
              btn.classList.add('copied');
              setTimeout(() => btn.classList.remove('copied'), 1000);
            }
          });
        });
      } catch (error) {
        contentWrapper.innerHTML = `
          <div class="empty-state">
            <div class="empty-title">Error loading issues</div>
            <div class="empty-text">${error instanceof Error ? error.message : 'Unknown error'}</div>
          </div>
        `;
      }
    };

    // Initial render
    await renderErrors();
  },
};
