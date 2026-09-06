/**
 * Editor V2 — Dev toolbar app
 *
 * Single click on the toolbar icon navigates directly to /editor?root=...
 * No popup panel — just a direct action.
 */

export default {
  id: 'doc-editor-v2',
  name: 'Edit Page',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,

  init(canvas: ShadowRoot, eventTarget: EventTarget) {
    const currentPath = window.location.pathname.replace(/\/$/, '');
    const pathSegments = currentPath.split('/').filter(Boolean);
    const contentRoot = pathSegments[0] || '';
    const isEditorPage = currentPath.startsWith('/editor');

    // Store current page path so the editor can auto-open the matching file
    if (!isEditorPage && contentRoot) {
      sessionStorage.setItem('ev2-last-doc-path', currentPath);
      sessionStorage.setItem('ev2-last-doc-root', contentRoot);
    }

    const editorUrl = contentRoot && !isEditorPage ? `/editor?root=${contentRoot}` : '';

    // Navigate on toolbar icon click (app-toggled event)
    eventTarget.addEventListener('app-toggled', (e: any) => {
      if (e.detail?.state && editorUrl) {
        window.location.href = editorUrl;
      }
    });
  },
};
