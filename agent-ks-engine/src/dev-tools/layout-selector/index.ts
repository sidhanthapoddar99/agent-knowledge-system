/**
 * Dev Toolbar - Layout & Theme Selector
 *
 * Provides development-time UI for:
 * - Switching between doc layouts when on /docs/* pages
 * - Switching between blog layouts when on /blog/* pages
 * - Switching between color themes (@theme/default, @theme/minimal, etc.)
 * - Toggling display mode (light/dark/system) globally
 */

import { devToolsSharedCss } from '../_shared/styles';

interface LayoutInfo {
  name: string;
  source: 'builtin' | 'external';
}

interface LayoutsResponse {
  docs: LayoutInfo[];
  blog: LayoutInfo[];
  custom: LayoutInfo[];
  navbar: LayoutInfo[];
  footer: LayoutInfo[];
}

interface ThemeInfo {
  name: string;
  ref: string;
  displayName: string;
  description: string;
  version: string;
  extends: string | null;
  supportsDarkMode: boolean;
}

interface ThemesResponse {
  current: { ref: string; name: string };
  themes: ThemeInfo[];
}

export default {
  id: 'layout-theme-selector',
  name: 'Layout & Theme',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,

  async init(canvas: ShadowRoot, app: any, _server: any) {
    // Check if panel should auto-open (after a reload from style change)
    const shouldAutoOpen = sessionStorage.getItem('dev-toolbar-keep-open');
    if (shouldAutoOpen) {
      sessionStorage.removeItem('dev-toolbar-keep-open');
      // Small delay to ensure toolbar is ready
      setTimeout(() => app.toggleState({ state: true }), 100);
    }

    // Detect content type from data attribute (config-driven, not URL-based)
    const contentType = document.documentElement.getAttribute('data-content-type');
    const isDocsPage = contentType === 'docs';
    const isBlogPage = contentType === 'blog';
    // const isCustomPage = contentType === 'custom'; // Reserved for future use

    // Get overrides from cookies (cookies are sent to server, unlike localStorage)
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    };

    // Get theme from cookie (null or __reset__ means use config)
    const themeCookie = getCookie('dev-color-theme');
    const activeColorTheme = (themeCookie && themeCookie !== '__reset__') ? themeCookie : null;

    // Get layout from cookie
    const layoutCookie = getCookie('dev-layout');
    const activeLayout = (layoutCookie && layoutCookie !== '__reset__') ? layoutCookie : null;

    // Get navbar/footer from cookies
    const navbarCookie = getCookie('dev-navbar');
    const activeNavbar = (navbarCookie && navbarCookie !== '__reset__') ? navbarCookie : null;

    const footerCookie = getCookie('dev-footer');
    const activeFooter = (footerCookie && footerCookie !== '__reset__') ? footerCookie : null;

    // Get current display mode (light/dark/system)
    const currentDisplayMode = localStorage.getItem('theme') || 'system';

    // Fetch available themes and layouts from API (independent — one failure doesn't block the other)
    let themesData: ThemesResponse | null = null;
    let layoutsData: LayoutsResponse | null = null;

    const [themesResult, layoutsResult] = await Promise.allSettled([
      fetch('/api/dev/themes').then(r => r.ok ? r.json() : null),
      fetch('/api/dev/layouts').then(r => r.ok ? r.json() : null),
    ]);

    if (themesResult.status === 'fulfilled' && themesResult.value) {
      themesData = themesResult.value;
    } else {
      console.error('[dev-toolbar] Failed to fetch themes:', themesResult.status === 'rejected' ? themesResult.reason : 'bad response');
    }

    if (layoutsResult.status === 'fulfilled' && layoutsResult.value) {
      layoutsData = layoutsResult.value;
    } else {
      console.error('[dev-toolbar] Failed to fetch layouts:', layoutsResult.status === 'rejected' ? layoutsResult.reason : 'bad response');
    }

    // Fallback if API unavailable
    const LAYOUTS: LayoutsResponse = layoutsData || {
      docs: [{ name: 'default', source: 'builtin' }],
      blog: [{ name: 'default', source: 'builtin' }],
      custom: [],
      navbar: [{ name: 'default', source: 'builtin' }],
      footer: [{ name: 'default', source: 'builtin' }],
    };

    // Create the window using Astro's built-in component
    const windowEl = document.createElement('astro-dev-toolbar-window');

    // Create styles. Shared tokens come first; the app's own rules follow so
    // anything that needs to override the shared defaults wins on cascade.
    const styles = document.createElement('style');
    styles.textContent = devToolsSharedCss + `
      astro-dev-toolbar-window {
        max-height: 80vh !important;
        overflow: hidden !important;
      }

      .panel-content {
        padding: 12px;
        font-family: system-ui, -apple-system, sans-serif;
        min-width: 260px;
        max-height: 70vh;
        overflow-y: auto;
        scrollbar-width: thin;
      }

      .panel-content::-webkit-scrollbar {
        width: 6px;
      }

      .panel-content::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 3px;
      }

      .panel-content::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }

      .panel-content::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }

      .section {
        margin-bottom: 16px;
      }

      .section:last-child {
        margin-bottom: 0;
      }

      .section-title {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: rgba(255, 255, 255, 0.6);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .section-title svg {
        width: 12px;
        height: 12px;
        opacity: 0.6;
      }

      .option-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .option-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 13px;
        width: 100%;
        text-align: left;
      }

      .option-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.2);
      }

      .option-btn.active {
        background: rgba(99, 102, 241, 0.2);
        border-color: rgba(99, 102, 241, 0.5);
        color: #a5b4fc;
      }

      .radio-circle {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .option-btn.active .radio-circle {
        border-color: #a5b4fc;
      }

      .radio-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: transparent;
      }

      .option-btn.active .radio-dot {
        background: #a5b4fc;
      }

      .option-text {
        flex: 1;
      }

      .active-tag {
        font-size: 9px;
        padding: 2px 5px;
        background: rgba(99, 102, 241, 0.3);
        border-radius: 3px;
        color: #a5b4fc;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .disabled-msg {
        padding: 10px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.4);
        font-size: 12px;
        text-align: center;
      }

      .divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
        margin: 12px 0;
      }

      .theme-row {
        display: flex;
        gap: 6px;
      }

      .theme-btn {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 6px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 10px;
      }

      .theme-btn:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .theme-btn.active {
        background: rgba(99, 102, 241, 0.2);
        border-color: rgba(99, 102, 241, 0.5);
        color: #a5b4fc;
      }

      .theme-btn svg {
        width: 18px;
        height: 18px;
      }

      .reset-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 8px 12px;
        margin-top: 12px;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 6px;
        color: #fca5a5;
        cursor: pointer;
        transition: all 0.15s ease;
        font-size: 11px;
        width: 100%;
      }

      .reset-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.5);
      }

      .reset-btn svg {
        width: 14px;
        height: 14px;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .panel-title {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.9);
      }

      .close-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: rgba(255, 255, 255, 0.1);
        border: none;
        border-radius: 4px;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .close-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        color: rgba(255, 255, 255, 0.9);
      }

      .close-btn svg {
        width: 14px;
        height: 14px;
      }

      .ext-badge {
        font-size: 9px;
        padding: 1px 4px;
        background: rgba(234, 179, 8, 0.2);
        border-radius: 3px;
        color: #fbbf24;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .current-config {
        font-size: 10px;
        color: rgba(255, 255, 255, 0.4);
        margin-top: 8px;
        padding: 6px 8px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 4px;
      }
    `;

    // Build content
    let html = '<div class="panel-content">';

    // Header with close button
    html += `<div class="panel-header">
      <span class="panel-title">Layout & Theme</span>
      <button class="close-btn" id="close-panel">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>`;

    // Layout Section
    html += '<div class="section">';
    html += `<div class="section-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
      Layout
    </div>`;

    if (isDocsPage) {
      html += '<div class="option-list">';
      for (const entry of LAYOUTS.docs) {
        const isActive = activeLayout === entry.name || (!activeLayout && entry.name === 'default');
        const displayName = entry.name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
        html += `
          <button class="option-btn ${isActive ? 'active' : ''}" data-layout="${entry.name}" data-type="docs">
            <span class="radio-circle"><span class="radio-dot"></span></span>
            <span class="option-text">${displayName}</span>
            ${entry.source === 'external' ? '<span class="ext-badge">ext</span>' : ''}
            ${isActive ? '<span class="active-tag">Active</span>' : ''}
          </button>
        `;
      }
      html += '</div>';
    } else if (isBlogPage) {
      html += '<div class="option-list">';
      for (const entry of LAYOUTS.blog) {
        const isActive = activeLayout === entry.name || (!activeLayout && entry.name === 'default');
        const displayName = entry.name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
        html += `
          <button class="option-btn ${isActive ? 'active' : ''}" data-layout="${entry.name}" data-type="blog">
            <span class="radio-circle"><span class="radio-dot"></span></span>
            <span class="option-text">${displayName}</span>
            ${entry.source === 'external' ? '<span class="ext-badge">ext</span>' : ''}
            ${isActive ? '<span class="active-tag">Active</span>' : ''}
          </button>
        `;
      }
      html += '</div>';
    } else {
      html += '<div class="disabled-msg">Navigate to /docs or /blog to select layouts</div>';
    }
    html += '</div>';

    // Divider
    html += '<div class="divider"></div>';

    // Color Theme Section (if themes are available)
    if (themesData && themesData.themes.length >= 1) {
      html += '<div class="section">';
      html += `<div class="section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
        Color Theme
      </div>`;
      html += '<div class="option-list">';

      for (const theme of themesData.themes) {
        const isActive = activeColorTheme
          ? theme.name === activeColorTheme
          : theme.ref === themesData.current.ref;
        const extendsInfo = theme.extends ? ` (extends ${theme.extends.replace('@theme/', '')})` : '';
        html += `
          <button class="option-btn ${isActive ? 'active' : ''}" data-color-theme="${theme.name}" data-theme-ref="${theme.ref}">
            <span class="radio-circle"><span class="radio-dot"></span></span>
            <span class="option-text">
              ${theme.displayName}
              <span style="font-size: 10px; opacity: 0.6;">${extendsInfo}</span>
            </span>
            ${isActive ? '<span class="active-tag">Active</span>' : ''}
          </button>
        `;
      }
      html += '</div>';
      html += '</div>';

      // Divider before display mode
      html += '<div class="divider"></div>';
    } else {
      // Show message when themes couldn't be loaded
      html += '<div class="section">';
      html += `<div class="section-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
        Color Theme
      </div>`;
      html += '<div class="disabled-msg">Failed to load themes</div>';
      html += '</div>';
      html += '<div class="divider"></div>';
    }

    // Display Mode Section (Light/Dark/System)
    html += '<div class="section">';
    html += `<div class="section-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
      </svg>
      Display Mode
    </div>`;
    html += '<div class="theme-row">';

    const displayModeData = [
      { id: 'light', label: 'Light', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>` },
      { id: 'dark', label: 'Dark', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>` },
      { id: 'system', label: 'System', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>` },
    ];

    for (const mode of displayModeData) {
      const isActive = currentDisplayMode === mode.id;
      html += `
        <button class="theme-btn ${isActive ? 'active' : ''}" data-display-mode="${mode.id}">
          ${mode.icon}
          <span>${mode.label}</span>
        </button>
      `;
    }
    html += '</div>';
    html += '</div>';

    // Divider before Navbar
    html += '<div class="divider"></div>';

    // Navbar Section
    html += '<div class="section">';
    html += `<div class="section-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
      Navbar Style
    </div>`;
    html += '<div class="option-list">';
    for (const entry of LAYOUTS.navbar) {
      const isActive = activeNavbar === entry.name || (!activeNavbar && entry.name === 'default');
      const displayName = entry.name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
      html += `
        <button class="option-btn ${isActive ? 'active' : ''}" data-navbar="${entry.name}">
          <span class="radio-circle"><span class="radio-dot"></span></span>
          <span class="option-text">${displayName}</span>
          ${entry.source === 'external' ? '<span class="ext-badge">ext</span>' : ''}
          ${isActive ? '<span class="active-tag">Active</span>' : ''}
        </button>
      `;
    }
    html += '</div>';
    html += '</div>';

    // Divider before Footer
    html += '<div class="divider"></div>';

    // Footer Section
    html += '<div class="section">';
    html += `<div class="section-title">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="16" width="18" height="5" rx="1"/>
        <path d="M3 11h18"/>
      </svg>
      Footer Style
    </div>`;
    html += '<div class="option-list">';
    for (const entry of LAYOUTS.footer) {
      const isActive = activeFooter === entry.name || (!activeFooter && entry.name === 'default');
      const displayName = entry.name.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
      html += `
        <button class="option-btn ${isActive ? 'active' : ''}" data-footer="${entry.name}">
          <span class="radio-circle"><span class="radio-dot"></span></span>
          <span class="option-text">${displayName}</span>
          ${entry.source === 'external' ? '<span class="ext-badge">ext</span>' : ''}
          ${isActive ? '<span class="active-tag">Active</span>' : ''}
        </button>
      `;
    }
    html += '</div>';
    html += '</div>';

    // Show current config info and reset button
    const hasOverrides = activeColorTheme || activeLayout || activeNavbar || activeFooter;
    if (hasOverrides) {
      html += '<div class="divider"></div>';
      html += `
        <button class="reset-btn" id="reset-overrides">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Reset All Overrides
        </button>
      `;
    }

    // Show configured theme info
    if (themesData) {
      html += `<div class="current-config">Config: ${themesData.current.ref}</div>`;
    }

    html += '</div>';

    // Create a wrapper div for the content (can't query custom elements directly)
    const contentWrapper = document.createElement('div');
    contentWrapper.style.maxHeight = '65vh';
    contentWrapper.style.overflowY = 'auto';
    contentWrapper.innerHTML = html;
    windowEl.appendChild(contentWrapper);

    // Helper to reload page while keeping panel open
    const reloadKeepOpen = () => {
      sessionStorage.setItem('dev-toolbar-keep-open', 'true');
      window.location.reload();
    };

    // Add event listener for close button
    const closeBtn = contentWrapper.querySelector('#close-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        app.toggleState({ state: false });
      });
    }

    // Add event listeners for layout buttons
    contentWrapper.querySelectorAll('.option-btn[data-layout]').forEach(button => {
      button.addEventListener('click', () => {
        const layout = button.getAttribute('data-layout');

        if (layout) {
          // Set layout cookie (expires in 7 days)
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `dev-layout=${layout}; expires=${expires}; path=/`;

          console.log('[dev-toolbar] Set layout cookie:', layout);
          reloadKeepOpen();
        }
      });
    });

    // Add event listeners for color theme buttons (theme switching)
    contentWrapper.querySelectorAll('.option-btn[data-color-theme]').forEach(button => {
      button.addEventListener('click', () => {
        const themeName = button.getAttribute('data-color-theme');

        if (themeName) {
          // Set cookie (expires in 7 days, path=/ so it works on all pages)
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `dev-color-theme=${themeName}; expires=${expires}; path=/`;

          console.log('[dev-toolbar] Set theme cookie:', themeName);
          reloadKeepOpen();
        }
      });
    });

    // Add event listeners for display mode buttons (light/dark/system)
    contentWrapper.querySelectorAll('.theme-btn[data-display-mode]').forEach(button => {
      button.addEventListener('click', () => {
        const mode = button.getAttribute('data-display-mode');

        if (mode) {
          // Update button states
          contentWrapper.querySelectorAll('.theme-btn[data-display-mode]').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-display-mode') === mode);
          });

          // Store and apply display mode
          localStorage.setItem('theme', mode);

          if (mode === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
          } else {
            document.documentElement.setAttribute('data-theme', mode);
          }
        }
      });
    });

    // Add event listeners for navbar buttons
    contentWrapper.querySelectorAll('.option-btn[data-navbar]').forEach(button => {
      button.addEventListener('click', () => {
        const style = button.getAttribute('data-navbar');
        if (style) {
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `dev-navbar=${style}; expires=${expires}; path=/`;
          console.log('[dev-toolbar] Set navbar cookie:', style);
          reloadKeepOpen();
        }
      });
    });

    // Add event listeners for footer buttons
    contentWrapper.querySelectorAll('.option-btn[data-footer]').forEach(button => {
      button.addEventListener('click', () => {
        const style = button.getAttribute('data-footer');
        if (style) {
          const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
          document.cookie = `dev-footer=${style}; expires=${expires}; path=/`;
          console.log('[dev-toolbar] Set footer cookie:', style);
          reloadKeepOpen();
        }
      });
    });

    // Add event listener for reset button
    const resetBtn = contentWrapper.querySelector('#reset-overrides');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();

        // Clear theme cookie (set to '__reset__' which server ignores, using site.yaml config)
        document.cookie = `dev-color-theme=__reset__; expires=${expires}; path=/`;

        // Clear layout cookie
        document.cookie = `dev-layout=__reset__; expires=${expires}; path=/`;

        // Clear navbar cookie
        document.cookie = `dev-navbar=__reset__; expires=${expires}; path=/`;

        // Clear footer cookie
        document.cookie = `dev-footer=__reset__; expires=${expires}; path=/`;

        // Clear old localStorage values
        localStorage.removeItem('dev-layout-docs');
        localStorage.removeItem('dev-layout-blog');
        localStorage.removeItem('dev-color-theme');

        // Reload to apply
        reloadKeepOpen();
      });
    }

    canvas.appendChild(styles);
    canvas.appendChild(windowEl);
  },
};
