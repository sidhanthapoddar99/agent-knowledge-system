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

function renderArtifact(container: HTMLElement): void {
  const src = container.dataset.src;
  const title = container.dataset.title || 'Artifact';

  if (!src) {
    container.classList.add('artifact-error');
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
  });
  iframe.addEventListener('error', () => {
    container.classList.add('artifact-error');
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
  open.textContent = 'Open full page ↗';
  tools.appendChild(open);

  const expand = document.createElement('button');
  expand.type = 'button';
  expand.className = 'artifact-tool artifact-expand';
  expand.textContent = 'Expand';
  expand.setAttribute('aria-expanded', 'false');
  expand.addEventListener('click', () => toggleExpand(container, expand));
  tools.appendChild(expand);

  container.appendChild(tools);
  container.classList.add(RENDERED);
}

/** In-place expand: fill the viewport as a fixed overlay, no navigation. */
function toggleExpand(container: HTMLElement, button: HTMLButtonElement): void {
  const expanded = container.classList.toggle('artifact-expanded');
  document.body.classList.toggle('artifact-expanded-lock', expanded);
  button.textContent = expanded ? 'Close' : 'Expand';
  button.setAttribute('aria-expanded', String(expanded));
}

function closeAnyExpanded(): void {
  const open = document.querySelector<HTMLElement>('.artifact.artifact-expanded');
  if (!open) return;
  open.classList.remove('artifact-expanded');
  document.body.classList.remove('artifact-expanded-lock');
  const button = open.querySelector<HTMLButtonElement>('.artifact-expand');
  if (button) {
    button.textContent = 'Expand';
    button.setAttribute('aria-expanded', 'false');
  }
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
