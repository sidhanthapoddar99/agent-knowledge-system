/**
 * Narrated video entry point
 *
 * A `video: true` page carries a player mount and its transcript (see
 * `parsers/postprocessors/video-page.ts`). The player code, and the diagram
 * libraries it pulls in, load only when such a page is open.
 */

const mount = document.querySelector<HTMLElement>('[data-video-player]');
const transcript = document.querySelector<HTMLElement>('[data-video-transcript]');

if (mount && transcript) {
  import('./video/player').then((m) => m.mountPlayer(mount, transcript));
}
