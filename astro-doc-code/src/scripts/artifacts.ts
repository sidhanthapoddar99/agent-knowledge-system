/**
 * Client-side artifact renderer
 *
 * Turns each server-emitted `.artifact-html` placeholder into a same-origin
 * `<iframe>` pointing at the reserved `/artifacts/<path>` route, and hangs the
 * embed affordances off it:
 *   - "Open full page" (primary) — a plain link to the route, in a new tab.
 *   - "Expand" (secondary) — an in-place, full-viewport overlay without
 *     navigating, so the reader keeps their scroll position.
 *
 * Theme: artifacts are first-party same-origin content (brainstorm Thread D),
 * so the parent can reach into `iframe.contentDocument` and set `data-theme` to
 * match the site — on load and on every site theme toggle. Artifacts that key
 * off `data-theme` / `prefers-color-scheme` adapt instantly; those that ignore
 * it are left untouched. We deliberately do NOT apply the diagram dark-mode
 * `invert()` filter — inverting arbitrary HTML destroys images and brand color
 * (Thread E).
 */

const RENDERED = 'artifact-rendered';

// Inline stroke icons (currentColor) so the affordances read as controls, not
// text links. Kept tiny and geometric to sit inside the pill toolbar.
const ICON_OPEN =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
const ICON_EXPAND =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
const ICON_CLOSE =
  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';

/** Swap the expand button between its two states (icon + label + aria). */
function setExpandUi(button: HTMLButtonElement, expanded: boolean): void {
  button.innerHTML =
    (expanded ? ICON_CLOSE : ICON_EXPAND) +
    `<span>${expanded ? 'Close' : 'Expand'}</span>`;
  button.setAttribute('aria-expanded', String(expanded));
}

/**
 * The site's effective theme. The site is purely attribute-driven: the head
 * script in BaseLayout stamps `data-theme="dark"` whenever dark resolves
 * (stored choice or OS preference) and stamps nothing for light — no site CSS
 * reads `prefers-color-scheme`. An absent attribute therefore means the site
 * is rendering light; falling back to the OS here would desync the artifact
 * from the chrome (dark-OS user, light-mode site).
 */
function currentTheme(): 'dark' | 'light' {
  const set = document.documentElement.getAttribute('data-theme');
  return set === 'dark' ? 'dark' : 'light';
}

// Every rendered iframe we've propagated theme into, so a later site toggle can
// re-sync them all. WeakSet won't do — we need to iterate.
const iframes = new Set<HTMLIFrameElement>();

/** Push the site theme into a same-origin artifact document (best-effort). */
function applyTheme(iframe: HTMLIFrameElement): void {
  try {
    const doc = iframe.contentDocument;
    if (doc?.documentElement) {
      doc.documentElement.setAttribute('data-theme', currentTheme());
    }
  } catch {
    /* cross-origin or not yet navigable — leave the artifact as-is */
  }
}

function syncAllThemes(): void {
  for (const iframe of iframes) applyTheme(iframe);
}

/**
 * Content-height embedding — the artifact scrolls with the PAGE, like every
 * other document, instead of living in a fixed box with a nested scrollbar.
 * Same-origin lets us read the artifact document's real height; a
 * ResizeObserver inside the iframe keeps the embed in sync when interactive
 * content reflows (tabs, expanders, viewport-width changes). A sidecar
 * embed_height override (inline height / aspect-ratio emitted by the loader)
 * opts back into the fixed box and is never touched.
 */
function hasDeclaredSize(container: HTMLElement): boolean {
  return (
    !('artifactFit' in container.dataset) &&
    Boolean(container.style.height || container.style.aspectRatio)
  );
}

function fitToContent(container: HTMLElement, iframe: HTMLIFrameElement): void {
  // Never fight the expand overlay (its 100vh is the point).
  if (container.classList.contains('artifact-expanded')) return;
  try {
    const doc = iframe.contentDocument;
    const win = iframe.contentWindow;
    if (!doc?.documentElement) return;
    const de = doc.documentElement;
    // Neutralize viewport-height floors (min-height:100vh bodies are the
    // common artifact pattern). In the embed they are self-defeating: vh
    // includes the horizontal scrollbar's gutter, so such a floor overflows
    // by exactly the scrollbar's thickness and pins a vertical scrollbar no
    // container height can cure (growing the container grows 100vh equally).
    // The full-page view is a separate document and keeps the author's value.
    de.style.minHeight = '0';
    if (doc.body) doc.body.style.minHeight = '0';
    // A horizontal scrollbar inside the artifact (zoom, narrow windows) eats
    // its thickness from the inner viewport; add it back or the content
    // overflows by exactly that much and spawns a pointless vertical
    // scrollbar. clientHeight excludes it, innerHeight includes it (0 on
    // overlay-scrollbar platforms). Measured at the live size, pre-collapse.
    const hScrollbar = win ? Math.max(0, win.innerHeight - de.clientHeight) : 0;
    // Measure with the inner viewport collapsed to 0 so viewport-relative
    // sizing (min-height:100vh bodies, vh sections) contributes nothing —
    // scrollHeight is max(content, viewport), so measuring at the height we
    // just set feeds our own value back and grows forever. Collapse + restore
    // happen in one task: nothing paints, and both ResizeObserver and inner
    // resize events sample at frame time, so the transient state is invisible.
    iframe.style.height = '0px';
    const content = Math.ceil(Math.max(de.scrollHeight, doc.body?.scrollHeight ?? 0));
    iframe.style.height = '';
    // scrollHeight/clientHeight/innerHeight are all integer-rounded reads of
    // fractional layout (site-injected CSS especially lands on fractional
    // line heights). When the horizontal scrollbar's thickness joins the sum,
    // the rounding errors stack and can come up 1–2px short — enough to spawn
    // a 1px vertical scrollbar. Two invisible pixels of slack absorb it.
    const h = content + hScrollbar + (hScrollbar > 0 ? 2 : 0);
    if (h > 0 && Math.abs(h - container.getBoundingClientRect().height) > 1) {
      container.style.height = `${h}px`;
      container.dataset.artifactFit = '1';
    }
  } catch {
    /* cross-origin or not yet navigable — the CSS placeholder height holds */
  }
}

function observeContent(container: HTMLElement, iframe: HTMLIFrameElement): void {
  try {
    const doc = iframe.contentDocument;
    if (!doc?.documentElement) return;
    const ro = new ResizeObserver(() => fitToContent(container, iframe));
    ro.observe(doc.documentElement);
    if (doc.body) ro.observe(doc.body);
    // Width changes (zoom, window resize, sidebar collapse) reach the embed as
    // container resizes; observing from the parent side means our own height
    // writes converge in one extra no-op pass instead of echoing.
    const parentRo = new ResizeObserver(() => fitToContent(container, iframe));
    parentRo.observe(container);
  } catch {
    /* same failure surface as fitToContent */
  }
}

function renderArtifact(container: HTMLElement): void {
  const src = container.dataset.src;
  const title = container.dataset.title || 'Artifact';

  if (!src) {
    container.classList.add('artifact-error');
    container.style.height = ''; // error chrome is auto-height
    container.textContent = 'Artifact is missing its source URL.';
    return;
  }

  // Bookmarkable/shareable link: drop the ?v= cache-buster (the route ignores
  // the query for content anyway; the iframe keeps it to defeat the prod cache).
  const fullPageUrl = src.split('?')[0];

  const iframe = document.createElement('iframe');
  iframe.className = 'artifact-frame';
  iframe.src = src;
  iframe.title = title;
  // First-party trust boundary: intentionally unsandboxed so same-origin
  // scripting + the theme handshake work (brainstorm Thread D).
  iframe.addEventListener('load', () => {
    iframes.add(iframe);
    applyTheme(iframe);
    if (!hasDeclaredSize(container)) {
      fitToContent(container, iframe);
      observeContent(container, iframe);
    }
  });
  iframe.addEventListener('error', () => {
    container.classList.add('artifact-error');
    container.style.height = ''; // error chrome is auto-height
    container.textContent = `Failed to load artifact: ${fullPageUrl}`;
  });
  container.appendChild(iframe);

  // Affordance bar (runtime-created — styled by global CSS in markdown.css).
  const tools = document.createElement('div');
  tools.className = 'artifact-tools';

  const open = document.createElement('a');
  open.className = 'artifact-tool artifact-open';
  open.href = fullPageUrl;
  open.target = '_blank';
  open.rel = 'noopener';
  open.innerHTML = `${ICON_OPEN}<span>Full page</span>`; // static markup only
  open.title = 'Open full page in a new tab';
  open.setAttribute('aria-label', 'Open full page in a new tab');
  tools.appendChild(open);

  const expand = document.createElement('button');
  expand.type = 'button';
  expand.className = 'artifact-tool artifact-expand';
  setExpandUi(expand, false);
  expand.addEventListener('click', () => toggleExpand(container, expand));
  tools.appendChild(expand);

  container.appendChild(tools);
  container.classList.add(RENDERED);
}

/** In-place expand: fill the viewport as a fixed overlay, no navigation. */
function toggleExpand(container: HTMLElement, button: HTMLButtonElement): void {
  const expanded = container.classList.toggle('artifact-expanded');
  document.body.classList.toggle('artifact-expanded-lock', expanded);
  setExpandUi(button, expanded);
  // Collapsing returns to the in-flow embed; re-sync it to current content.
  if (!expanded) {
    const iframe = container.querySelector<HTMLIFrameElement>('.artifact-frame');
    if (iframe && !hasDeclaredSize(container)) fitToContent(container, iframe);
  }
}

function closeAnyExpanded(): void {
  const open = document.querySelector<HTMLElement>('.artifact.artifact-expanded');
  if (!open) return;
  open.classList.remove('artifact-expanded');
  document.body.classList.remove('artifact-expanded-lock');
  const button = open.querySelector<HTMLButtonElement>('.artifact-expand');
  if (button) setExpandUi(button, false);
}

function initArtifacts(): void {
  const containers = document.querySelectorAll<HTMLElement>(
    '.artifact-html:not(.artifact-rendered):not(.artifact-error)'
  );
  containers.forEach(renderArtifact);
}

// Re-sync every embedded artifact when the site theme changes. The toggle just
// flips the root `data-theme` attribute (no custom event), so observe that —
// this covers the default navbar, the minimal navbar, and the dev toolbar.
const themeObserver = new MutationObserver(syncAllThemes);
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});

// Escape closes an in-place expand.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAnyExpanded();
});

// Module scripts are deferred — the DOM is parsed when this runs.
initArtifacts();

// Live editor preview re-renders content; re-scan on the same signal diagrams use.
document.addEventListener('diagrams:render', () => initArtifacts());
