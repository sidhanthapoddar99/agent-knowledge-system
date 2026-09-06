/**
 * Views module — re-exports
 */

export type { EditorMode, SplitDirection, ViewState } from './types.js';
export { initPreviewPanel, type PreviewPanel } from './preview.js';
export { initViewManager, type ViewManagerHandle, type ViewManagerDom } from './view-manager.js';
export { sourceExtensions } from './source.js';
export { wysiwygExtensions, wysiwygAvailable } from './wysiwyg.js';
