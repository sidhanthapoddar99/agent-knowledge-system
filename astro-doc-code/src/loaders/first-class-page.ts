/**
 * Shared machinery for first-class non-markdown pages.
 *
 * A docs section can contain several kinds of non-markdown file that each
 * render as a first-class page: diagrams (`.mmd`/`.dot`/`.excalidraw`, see
 * `diagram-pages.ts`) and artifacts (`.html`, see `artifact-pages.ts`). Every
 * such scanner needs the same slug-collision pass so a `.md`, a `.mmd`, and a
 * `.html` can't silently claim the same URL. Keeping that pass here means the
 * scanners resolve collisions against **one shared pool** with **one
 * implementation** — the correctness concern raised in the component+route
 * brainstorm (Thread A). The only per-kind variation is the error body, passed
 * in as a factory so each kind keeps its own themed styling.
 */
import { addError } from './cache';
import type { LoadedContent } from '../parsers/types';

/**
 * Resolve slug collisions across `existingContent` (already-loaded markdown /
 * diagram entries) and this scanner's freshly-scanned `entries`.
 *
 * On a collision the first entry at that slug has its body replaced with the
 * `collisionHtml` error in place (and its headings cleared), an error is logged,
 * and every other colliding entry is dropped. Returns the surviving `entries`
 * (the caller's own new entries minus any that were dropped); mutations to
 * `existingContent` items happen in place on the shared objects.
 */
export function resolveSlugCollisions(
  existingContent: LoadedContent[],
  entries: LoadedContent[],
  collisionHtml: (slug: string, paths: string[]) => string
): LoadedContent[] {
  const bySlug = new Map<string, LoadedContent[]>();
  for (const item of [...existingContent, ...entries]) {
    const list = bySlug.get(item.slug) ?? [];
    list.push(item);
    bySlug.set(item.slug, list);
  }

  const dropped = new Set<LoadedContent>();
  for (const [slug, items] of bySlug) {
    if (items.length < 2) continue;
    const paths = items.map((i) => i.relativePath);
    addError({
      file: paths[0],
      type: 'config',
      message: `Slug collision at "/${slug}": ${paths.join(', ')}`,
      suggestion: 'Rename one of the files — pages cannot share a URL',
    });
    items[0].content = collisionHtml(slug, paths);
    items[0].headings = [];
    for (const extra of items.slice(1)) dropped.add(extra);
  }

  return entries.filter((e) => !dropped.has(e));
}
