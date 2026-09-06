/**
 * View system types
 *
 * Mode = what the editor pane shows (source, live-preview, wysiwyg)
 * Preview = toggle (on/off) for the rendered HTML panel
 *
 * Combined states:
 *   source + preview off     → just source editor
 *   source + preview on      → source + preview split
 *   live-preview + preview off → just live preview
 *   live-preview + preview on  → live preview + preview split
 *   preview-only              → full-width rendered preview, no editor
 */

export type EditorMode = 'source' | 'live-preview' | 'wysiwyg';
export type SplitDirection = 'vertical' | 'horizontal';

export interface ViewState {
  mode: EditorMode;
  previewOpen: boolean;
  splitDirection: SplitDirection;
}
