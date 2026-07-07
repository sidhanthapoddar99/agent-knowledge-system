/**
 * Shared file-type glyph vocabulary for sidebar trees (docs sidebar and the
 * issues sub-doc tree). Markdown is the default content type and deliberately
 * carries NO icon — a glyph marks only the exception (first-class diagram and
 * artifact pages). Icons are monochrome (currentColor): color stays reserved
 * for status meaning.
 */

export interface FileTypeIcon {
  /** Tooltip / aria label naming the type. */
  label: string;
  /** Inline SVG markup (12px, stroke-based, currentColor). */
  svg: string;
}

const ICONS: Record<string, FileTypeIcon> = {
  diagram: {
    label: 'Diagram',
    svg: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1.5" y="1.5" width="6" height="4.5" rx="1"/><rect x="8.5" y="10" width="6" height="4.5" rx="1"/><path d="M4.5 6v2.5a2 2 0 002 2h2"/></svg>',
  },
  artifact: {
    label: 'Artifact',
    svg: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="12" height="10" rx="1.5"/><path d="M2 6.5h12"/></svg>',
  },
};

/**
 * Resolve a content/file type to its glyph, or null when the type is unmarked
 * (markdown and everything else). Accepts both the docs `fileType` and the
 * issues `docType` vocabularies — the marked values are the same two keys.
 */
export function fileTypeIcon(type: string | null | undefined): FileTypeIcon | null {
  return type ? ICONS[type] ?? null : null;
}
