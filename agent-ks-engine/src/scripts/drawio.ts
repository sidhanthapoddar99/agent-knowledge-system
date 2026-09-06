/**
 * draw.io (`.drawio`) client-side renderer
 *
 * Unlike mermaid and graphviz, draw.io publishes no npm renderer — the only
 * full-fidelity one is its own GraphViewer, vendored at
 * `src/vendor/drawio/viewer-static.min.js` (see the README there for
 * provenance and the upgrade procedure). It is a 3 MiB UMD bundle that
 * installs globals rather than exporting anything, so it is injected as a
 * `<script>` tag on demand and never enters the main bundle. Vite's `?url`
 * import emits it as a content-hashed asset.
 *
 * Dark mode is NATIVE here, not the `invert()` filter the other three formats
 * use. draw.io diagrams routinely carry raster icons and brand colours that an
 * invert wrecks; GraphViewer instead re-resolves the default palette (dark
 * canvas, light strokes) while leaving author-chosen colours alone.
 */

import viewerUrl from '../vendor/drawio/viewer-static.min.js?url';

/**
 * Where GraphViewer looks for resources it does not inline. Every one of the
 * six globals below defaults to a `viewer.diagrams.net` URL — a built site
 * must not call a third party when a reader opens a page — so all of them are
 * pointed at local routes instead. Two routes, split by who owns the files:
 *
 * - `/assets/drawio` resolves to the project's own asset directory, so a
 *   consumer can populate it without touching code. The realistic case is
 *   draw.io's stencil icon sets, which are ~21 MB and are not vendored.
 * - `/vendor/drawio` is the framework's, served from `public/`. Only the
 *   MathJax no-op lives there; see that file for why it exists at all.
 */
const PROJECT_BASE = '/assets/drawio';
const FRAMEWORK_BASE = '/vendor/drawio';

/**
 * The vendored bundle is a UMD script: it exports nothing and installs its API
 * on `window`. The index signature covers the six resource-path globals, which
 * are plain string slots rather than a typed API.
 */
interface DrawioGlobals {
  GraphViewer?: any;
  mxUtils?: any;
  Editor?: { darkMode?: boolean };
  [key: string]: unknown;
}

const drawio = () => window as unknown as DrawioGlobals;

let loadPromise: Promise<void> | null = null;

/** Inject the vendored viewer once; resolves when its globals are installed. */
function loadViewer(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<void>((resolve, reject) => {
    // These MUST be assigned before the bundle executes: it claims each with
    // `window.X = window.X || "<remote>"`, so first writer wins.
    const w = drawio();
    w.PROXY_URL = `${PROJECT_BASE}/proxy`;
    w.STYLE_PATH = `${PROJECT_BASE}/styles`;
    w.SHAPES_PATH = `${PROJECT_BASE}/shapes`;
    w.STENCIL_PATH = `${PROJECT_BASE}/stencils`;
    w.GRAPH_IMAGE_PATH = `${PROJECT_BASE}/img`;
    // The only one fetched eagerly: the bundle calls Editor.initMath() at load
    // and appends `${DRAW_MATH_URL}/startup.js` unconditionally. Pointed at the
    // framework's no-op so it resolves instead of 404ing on every page.
    w.DRAW_MATH_URL = `${FRAMEWORK_BASE}/math`;
    // Blank rather than remote: no diagram view should phone home.
    w.DRAWIO_LOG_URL = '';
    // The bundle ends with `onDrawioViewerLoad?.() : GraphViewer.processElements()`.
    // We construct every viewer ourselves, so claim the hook to suppress the
    // global scan for `.mxgraph` elements rather than let it run over the page.
    w.onDrawioViewerLoad = () => {};

    const script = document.createElement('script');
    script.src = viewerUrl;
    script.async = true;
    script.onload = () => {
      if (drawio().GraphViewer) resolve();
      else reject(new Error('draw.io viewer loaded but installed no GraphViewer'));
    };
    script.onerror = () => reject(new Error('failed to load the draw.io viewer'));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/**
 * The site's effective theme — attribute-driven, exactly as in
 * `scripts/artifacts.ts`: BaseLayout stamps `data-theme="dark"` when dark
 * resolves and stamps nothing for light, so an absent attribute means light.
 * Falling back to the OS preference here would desync a diagram from the
 * chrome around it.
 */
function currentTheme(): 'dark' | 'light' {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/** Every container we have rendered, so a later theme toggle can rebuild them. */
const rendered = new Set<HTMLDivElement>();

/** `<mxfile>` page count — decides whether the pages toolbar is worth showing. */
function pageCount(xml: string): number {
  return (xml.match(/<diagram[\s>]/g) ?? []).length;
}

/**
 * Make a rendered diagram carry its own palette.
 *
 * GraphViewer writes its colours as `light-dark(<light>, <dark>)` in inline
 * `style` attributes and picks the branch from the **inherited**
 * `color-scheme`, which it sets on the container it owns — not on the `<svg>`.
 * So the SVG is only dark while it is still sitting inside that container. Any
 * consumer that detaches it renders the light branch: the lightbox clones it
 * into an overlay, and `diagram-actions.ts` serialises it into a standalone
 * `image/svg+xml` document for download.
 *
 * Fixing it at the source rather than in each consumer: stamp the scheme into
 * the SVG itself, as a `<style>` child so it survives both `cloneNode` and the
 * `removeAttribute('style')` those exporters do.
 *
 * The selector is class-scoped on purpose. A `<style>` inside *inline* SVG is
 * not scoped to that SVG — its rules apply to the whole document — so a bare
 * `svg { … }` here would reach every other diagram on the page.
 */
function stampColorScheme(svg: SVGSVGElement, dark: boolean): void {
  const cls = dark ? 'drawio-scheme-dark' : 'drawio-scheme-light';
  svg.classList.add(cls);

  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  style.textContent = `svg.${cls}{color-scheme:${dark ? 'dark' : 'light'}}`;
  svg.insertBefore(style, svg.firstChild);
}

/**
 * Empty a container for a (re-)render, keeping the hover toolbar `lightbox.ts`
 * appended. That module binds each container once and skips anything already
 * in its bound set, so a toolbar destroyed here never comes back.
 */
function clearContent(div: HTMLDivElement): void {
  for (const child of [...div.children]) {
    if (!child.classList.contains('diagram-tools')) child.remove();
  }
}

/**
 * Render one container. The GraphViewer instance owns a child div rather than
 * the container itself, so the caption and the hover toolbar that
 * `lightbox.ts` appends as siblings survive a re-render.
 */
function mount(div: HTMLDivElement, xml: string): void {
  const { GraphViewer, mxUtils, Editor } = drawio();
  const dark = currentTheme() === 'dark';

  // The shape-colour path reads the Editor-level global, while the container
  // chrome reads the per-viewer one. Both have to agree or the canvas goes
  // dark while the strokes stay black.
  if (Editor) Editor.darkMode = dark;

  const host = document.createElement('div');
  host.className = 'drawio-host';
  div.appendChild(host);

  const doc = mxUtils.parseXml(xml);
  new GraphViewer(host, doc.documentElement, {
    'dark-mode': dark ? 'dark' : 'light',
    'auto-fit': true,
    center: true,
    resize: true,
    // Our own hover toolbar and lightbox own expand/copy for every diagram
    // format; GraphViewer's would be a second, differently-styled set.
    lightbox: false,
    // The one affordance it must keep: a multi-page file is otherwise
    // truncated to page 1 with nothing saying so.
    ...(pageCount(xml) > 1 ? { toolbar: 'pages' } : {}),
  });

  // GraphViewer renders synchronously in its constructor, so the SVG is here.
  const svg = host.querySelector('svg');
  if (svg) stampColorScheme(svg, dark);
}

/** Fetch + render each placeholder emitted by the embed/page pipeline. */
export async function renderDrawio(divs: Iterable<HTMLDivElement>): Promise<void> {
  const targets = [...divs];
  if (targets.length === 0) return;

  try {
    await loadViewer();
  } catch (err) {
    console.error('draw.io viewer load error:', err);
    for (const div of targets) {
      div.textContent = 'Failed to load the draw.io viewer';
      div.classList.add('diagram-error');
    }
    return;
  }

  for (const div of targets) {
    const src = div.dataset.src;
    try {
      if (!src) throw new Error('missing data-src');
      // no-cache: revalidate against the server ETag (cheap 304 when
      // unchanged) so edited diagrams show up on a plain reload
      const res = await fetch(src, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`fetch failed (${res.status})`);
      const xml = await res.text();

      // Kept for the lightbox/toolbar "copy source" action, same as the
      // inline formats.
      div.dataset.diagramSource = xml;

      clearContent(div);
      mount(div, xml);
      appendCaption(div, src);

      rendered.add(div);
      div.classList.add('diagram-rendered');
    } catch (err) {
      console.error('draw.io render error:', err);
      div.textContent = `Failed to render draw.io diagram${src ? `: ${src}` : ''}`;
      div.classList.add('diagram-error');
    }
  }
}

/** Title + a link to the raw file, matching the excalidraw caption. */
function appendCaption(div: HTMLDivElement, src: string): void {
  const caption = document.createElement('div');
  caption.className = 'diagram-caption';

  const title = div.dataset.title;
  if (title) {
    const label = document.createElement('span');
    label.textContent = title;
    caption.appendChild(label);
    caption.appendChild(document.createTextNode(' · '));
  }

  const openLink = document.createElement('a');
  openLink.href = src;
  openLink.target = '_blank';
  openLink.rel = 'noopener';
  openLink.textContent = 'open file ↗';
  caption.appendChild(openLink);

  // Clicks on the caption must not bubble into the lightbox zoom.
  caption.addEventListener('click', (e) => e.stopPropagation());
  div.appendChild(caption);
}

/**
 * Rebuild every diagram when the site theme flips.
 *
 * GraphViewer can be re-themed in place (`darkMode` + `darkModeChanged()`),
 * but shape fills are resolved against the `Editor.darkMode` global at
 * validation time, so an in-place flip leaves stale colours on anything
 * already drawn. A full rebuild is a few milliseconds on a toggle a reader
 * does rarely, and it is correct by construction.
 */
function rebuildAll(): void {
  for (const div of rendered) {
    const xml = div.dataset.diagramSource;
    const src = div.dataset.src;
    if (!xml || !src) continue;
    clearContent(div);
    try {
      mount(div, xml);
      appendCaption(div, src);
    } catch (err) {
      console.error('draw.io re-theme error:', err);
    }
  }
}

// The theme toggle just flips the root `data-theme` attribute (no custom
// event), so observe it — same approach as scripts/artifacts.ts.
new MutationObserver(rebuildAll).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme'],
});
