/**
 * Issue sections — THE single declaration of what sections exist.
 *
 * Before this module, adding one top-level section meant editing eleven files
 * that each hard-coded the same string: the loader's folder walk, the route
 * matcher, the static-path builder, the sidebar, the sub-doc tree, the note
 * page's prefix union, the sub-doc layout, the URL/panel-key helpers, the
 * client-side panel router, the bundled Guide, and the CLI validator. Eleven
 * places agreeing by hand is a defect waiting for the one that gets missed —
 * and a missed one fails by rendering nothing, with no error.
 *
 * What is declared here is a section's **identity**: its folder, its URL
 * segment, the field it lands on, its panel-key prefix, its label. What is NOT
 * declared here is how to *read* it — the four readers (subtask / free-form /
 * agent-log / plan) genuinely differ in shape, and flattening them into one
 * pluggable reader would be inventing a plugin system to avoid four functions.
 *
 * Adding a section is: one entry here, one reader call in `loadIssueFolder`,
 * one field on `Issue`. Everything else follows.
 */

/** How a section's content is read. Each value maps to one reader function in
 *  `issues.ts`; the registry names it so call-sites can branch on data rather
 *  than on a folder name they had to know. */
export type SectionReader = 'subtask' | 'freeform' | 'agent-log' | 'plan' | 'comment';

export interface IssueSection {
  /** Stable id AND the URL segment (`/todo/<issue>/<id>/…`). */
  id: string;
  /** Folder name inside the issue. Identical to `id` for every section today,
   *  but kept separate because the URL is a public surface and the folder name
   *  is not — renaming one should not force the other. */
  folder: string;
  /** Key on the loaded `Issue` object. */
  field: 'subtasks' | 'notes' | 'brainstorm' | 'agentMemory' | 'agentLogs' | 'plans' | 'comments';
  /** Sub-doc `kind` in routing props. `null` for sections with no sub-doc pages. */
  subDocKind: 'subtask' | 'note' | 'brainstorm' | 'memory' | 'log' | 'plan' | null;
  /** Panel-key prefix (`note-`, `log-`, …) and the legacy `#hash` namespace.
   *  `null` for sections whose entries have no panel of their own. */
  panelPrefix: string | null;
  /** Sidebar heading. */
  label: string;
  /** Sidebar heading icon — inner SVG markup on a `0 0 16 16` viewBox, stroked
   *  with `currentColor`. Declared here so a section cannot ship without one:
   *  Subtasks and the issue group went without for months precisely because the
   *  icon lived in the sidebar template rather than with the section. */
  icon: string;
  /** Empty-state line for the sidebar group. */
  emptyLabel: string;
  reader: SectionReader;
  /** Does the section have subfolders the loader walks at all? `comments` is the
   *  only flat one. Note this is NOT "free-form tree" — `plans` has subfolders
   *  (one per plan) in a fixed two-level shape, and conflating the two facts
   *  would stop plan stage edits from busting the cache. Free-form-ness is
   *  `reader === 'freeform'`. */
  nested: boolean;
  /** First-class `.html` artifacts render embedded here. The tracker's
   *  design-thinking folders only. */
  allowArtifacts: boolean;
}

export const ISSUE_SECTIONS: readonly IssueSection[] = [
  {
    id: 'comments', folder: 'comments', field: 'comments',
    subDocKind: null, panelPrefix: null, label: 'Comments',
    icon: '<path d="M2 3.5h12v8H6l-3 2.5V11.5H2v-8z"/>',
    emptyLabel: 'No comments',
    reader: 'comment', nested: false, allowArtifacts: false,
  },
  {
    id: 'brainstorm', folder: 'brainstorm', field: 'brainstorm',
    subDocKind: 'brainstorm', panelPrefix: 'brainstorm-', label: 'Brainstorm',
    icon: '<path d="M8 1.5a4.5 4.5 0 0 0-3 7.8V11h6V9.3a4.5 4.5 0 0 0-3-7.8z"/><path d="M6 13h4M6.5 14.5h3"/>',
    emptyLabel: 'No brainstorm entries',
    reader: 'freeform', nested: true, allowArtifacts: true,
  },
  {
    id: 'notes', folder: 'notes', field: 'notes',
    subDocKind: 'note', panelPrefix: 'note-', label: 'Notes',
    icon: '<path d="M3 1h7l3 3v11H3V1z"/><path d="M10 1v3h3"/>',
    emptyLabel: 'No notes',
    reader: 'freeform', nested: true, allowArtifacts: true,
  },
  {
    id: 'plans', folder: 'plans', field: 'plans',
    subDocKind: 'plan', panelPrefix: 'plan-', label: 'Plans',
    icon: '<path d="M2 4h2M2 8h2M2 12h2"/><path d="M6.5 4h7.5M6.5 8h7.5M6.5 12h7.5"/>',
    emptyLabel: 'No plans',
    reader: 'plan', nested: true, allowArtifacts: false,
  },
  {
    id: 'subtasks', folder: 'subtasks', field: 'subtasks',
    subDocKind: 'subtask', panelPrefix: 'subtask-', label: 'Subtasks',
    icon: '<path d="M2 4.5l1.5 1.5L6 3.5"/><path d="M2 11.5L3.5 13 6 10.5"/><path d="M8.5 5h5.5M8.5 12h5.5"/>',
    emptyLabel: 'No subtasks',
    reader: 'subtask', nested: true, allowArtifacts: false,
  },
  {
    id: 'agent-log', folder: 'agent-log', field: 'agentLogs',
    subDocKind: 'log', panelPrefix: 'log-', label: 'Agent log',
    icon: '<circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/>',
    emptyLabel: 'No agent-log entries',
    reader: 'agent-log', nested: true, allowArtifacts: false,
  },
  {
    id: 'agent-memory', folder: 'agent-memory', field: 'agentMemory',
    subDocKind: 'memory', panelPrefix: 'memory-', label: 'Agent memory',
    icon: '<ellipse cx="8" cy="4" rx="5" ry="2"/><path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4"/><path d="M3 8c0 1.1 2.2 2 5 2s5-.9 5-2"/>',
    emptyLabel: 'No agent-memory entries',
    reader: 'freeform', nested: true, allowArtifacts: false,
  },
] as const;

/** Every section folder, in declaration order. The loader's cache-signature walk
 *  and the CLI's known-folder set both come from here. */
export const SECTION_FOLDERS: readonly string[] = ISSUE_SECTIONS.map((s) => s.folder);

/** Sections that produce sub-doc pages (everything except `comments`). */
export const SUBDOC_SECTIONS: readonly IssueSection[] = ISSUE_SECTIONS.filter((s) => s.subDocKind !== null);

/** Sections read as a free-form nested tree — the ones whose routing, URLs and
 *  static paths are genuinely identical and can be emitted from one loop. */
export const FREEFORM_SECTIONS: readonly IssueSection[] = ISSUE_SECTIONS.filter((s) => s.reader === 'freeform');

const BY_ID = new Map(ISSUE_SECTIONS.map((s) => [s.id, s]));
const BY_PANEL_PREFIX = new Map(
  ISSUE_SECTIONS.filter((s) => s.panelPrefix).map((s) => [s.panelPrefix as string, s]),
);

/** Look a section up by its URL segment / id. */
export function sectionById(id: string): IssueSection | undefined {
  return BY_ID.get(id);
}

/** The section a panel key (`note-design`, `log-010_lp_x--summary`) belongs to.
 *  Longest prefix wins, so `agent-memory`'s `memory-` cannot be shadowed by a
 *  shorter prefix added later. */
export function sectionForPanelKey(key: string): IssueSection | undefined {
  let hit: IssueSection | undefined;
  for (const [prefix, section] of BY_PANEL_PREFIX) {
    if (!key.startsWith(prefix)) continue;
    if (!hit || prefix.length > (hit.panelPrefix as string).length) hit = section;
  }
  return hit;
}

/** Panel key for one entry in a section. `groupPath` segments join with `--` so
 *  the key stays unique across folders. */
export function sectionPanelKey(section: IssueSection, groupPath: string[], name: string): string {
  return `${section.panelPrefix ?? `${section.id}-`}${[...groupPath, name].join('--')}`;
}
