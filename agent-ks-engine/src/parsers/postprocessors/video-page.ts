/**
 * Video Page Postprocessor
 *
 * A page with `video: true` in its frontmatter is a narrated video. The
 * markdown stays an ordinary document — on disk, in Obsidian or on GitHub it
 * reads as a transcript with diagrams. In the site, `src/scripts/video.ts`
 * builds a player from the rendered HTML:
 *
 * - each `##` heading starts a scene;
 * - the scene's first diagram, code block, list, table or image is its visual;
 * - each paragraph is one narration beat, spoken aloud in turn;
 * - **bold** text in a beat focuses the part of the visual that matches it.
 *
 * This processor only marks the page. It adds the empty player mount and
 * wraps the rendered body, so the client knows which HTML to read. It runs
 * last, after every other postprocessor has produced the final HTML.
 */

import type { Processor, ProcessContext } from '../types';

export const videoPagePostprocessor: Processor = {
  name: 'video-page',
  process(content: string, context: ProcessContext): string {
    if (context.frontmatter.video !== true) return content;
    return (
      `<div class="video-player" data-video-player></div>` +
      `<div class="video-transcript" data-video-transcript>${content}</div>`
    );
  },
};
