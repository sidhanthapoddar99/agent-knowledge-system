/**
 * Lightbox viewer — interactive full-screen viewer for images and diagrams
 * in markdown content.
 *
 * - Pan/zoom: wheel zoom toward cursor, drag pan, pinch, double-click zoom
 *   (engine in panzoom.ts), plus toolbar buttons and +/-/0 keys.
 * - Diagram SVG text stays selectable; clicking a label copies its text.
 * - Copy/download: a split button — click copies as PNG (light); its caret
 *   opens a dropdown with PNG light/dark, source, and SVG copy/download
 *   actions (menu + actions in diagram-actions.ts).
 * Inline diagrams get the same split button plus expand on a hover toolbar.
 */

import { createPanZoom, type PanZoom } from './panzoom';
import { copyPng, openCopyMenu, svgSize, toast, type ActionTarget } from './diagram-actions';

/** Elements whose pointer events belong to text selection, not panning. */
const TEXT_TARGETS = 'text, tspan, foreignObject, a';

let overlay: HTMLDivElement | null = null;
let stage: HTMLDivElement | null = null;
let canvas: HTMLDivElement | null = null;
let zoomLabel: HTMLSpanElement | null = null;
let openBtn: HTMLAnchorElement | null = null;
let viewerCopyBtn: HTMLButtonElement | null = null;
let viewerCaretBtn: HTMLButtonElement | null = null;
let panzoom: PanZoom | null = null;
let currentTarget: ActionTarget | null = null;
const boundElements = new WeakSet();

function toolbarButton(label: string, title: string, onClick: () => void) {
  const btn = document.createElement('button');
  btn.className = 'lightbox-btn';
  btn.textContent = label;
  btn.title = title;
  btn.setAttribute('aria-label', title);
  btn.addEventListener('click', onClick);
  return btn;
}

function ensureOverlay() {
  if (overlay) return;

  overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';

  // Stage: the pan/zoom viewport
  stage = document.createElement('div');
  stage.className = 'lightbox-stage';
  canvas = document.createElement('div');
  canvas.className = 'lightbox-canvas';
  stage.appendChild(canvas);
  overlay.appendChild(stage);

  // Toolbar
  const toolbar = document.createElement('div');
  toolbar.className = 'lightbox-toolbar';

  const zoomGroup = document.createElement('div');
  zoomGroup.className = 'lightbox-group';
  zoomGroup.appendChild(toolbarButton('−', 'Zoom out (-)', () => panzoom?.zoomOut()));
  zoomLabel = document.createElement('span');
  zoomLabel.className = 'lightbox-zoom-label';
  zoomLabel.title = 'Reset zoom (0)';
  zoomLabel.addEventListener('click', () => panzoom?.reset());
  zoomGroup.appendChild(zoomLabel);
  zoomGroup.appendChild(toolbarButton('+', 'Zoom in (+)', () => panzoom?.zoomIn()));
  zoomGroup.appendChild(toolbarButton('⛶', 'Fit to screen (0)', () => panzoom?.reset()));
  toolbar.appendChild(zoomGroup);

  const actionGroup = document.createElement('div');
  actionGroup.className = 'lightbox-group';
  viewerCopyBtn = toolbarButton('⎘ Copy', 'Copy as PNG', () => {
    if (currentTarget) copyPng(currentTarget);
  });
  actionGroup.appendChild(viewerCopyBtn);
  viewerCaretBtn = toolbarButton('▾', 'More copy/download options', () => {
    if (currentTarget) openCopyMenu(viewerCaretBtn!, currentTarget);
  });
  viewerCaretBtn.classList.add('lightbox-caret');
  actionGroup.appendChild(viewerCaretBtn);
  openBtn = document.createElement('a');
  openBtn.className = 'lightbox-btn';
  openBtn.textContent = '↗';
  openBtn.title = 'Open original';
  openBtn.target = '_blank';
  openBtn.rel = 'noopener';
  actionGroup.appendChild(openBtn);
  const closeBtn = toolbarButton('×', 'Close (Esc)', close);
  closeBtn.classList.add('lightbox-close');
  actionGroup.appendChild(closeBtn);
  toolbar.appendChild(actionGroup);
  overlay.appendChild(toolbar);

  document.body.appendChild(overlay);

  panzoom = createPanZoom({
    viewport: stage,
    content: canvas,
    shouldStartPan: (target) => !(target instanceof Element && target.closest(TEXT_TARGETS)),
    onChange: (scale) => {
      zoomLabel!.textContent = `${Math.round(scale * 100)}%`;
    },
  });

  // Click on empty stage closes; click on a text/label copies it.
  stage.addEventListener('click', (e) => {
    if (panzoom!.wasDragged()) return;
    if (!window.getSelection()?.isCollapsed) return;
    const el = e.target instanceof Element ? e.target : null;
    const label = el?.closest('text, tspan, foreignObject');
    if (label) {
      copyText(labelText(label));
      return;
    }
    if (el?.closest('a')) return;
    if (e.target === stage || e.target === canvas) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay!.classList.contains('lightbox-open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === '+' || e.key === '=') panzoom?.zoomIn();
    else if (e.key === '-') panzoom?.zoomOut();
    else if (e.key === '0') panzoom?.reset();
  });
}

/**
 * Full label text for a clicked element. A click often lands on one <tspan>
 * of a multi-tspan label (renderers split labels per word/line), so copy the
 * whole parent <text>, joining tspans with spaces.
 */
function labelText(el: Element): string {
  const textEl = el.closest('text');
  if (textEl) {
    // Leaf tspans only — renderers nest row-tspans around word-tspans, and
    // counting both would duplicate the text
    const spans = [...textEl.querySelectorAll('tspan')].filter((s) => !s.querySelector('tspan'));
    if (spans.length > 1) {
      return spans.map((s) => s.textContent?.trim()).filter(Boolean).join(' ');
    }
    return textEl.textContent?.trim() ?? '';
  }
  return el.textContent?.trim() ?? '';
}

async function copyText(text: string) {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast(`Copied “${text.length > 40 ? text.slice(0, 40) + '…' : text}”`);
  } catch {
    toast('Copy failed');
  }
}

/** Source-file extension by diagram container type. */
function sourceName(container: HTMLElement): string {
  if (container.classList.contains('diagram-mermaid')) return 'diagram.mmd';
  if (container.classList.contains('diagram-graphviz')) return 'diagram.dot';
  if (container.classList.contains('diagram-excalidraw')) return 'diagram.excalidraw';
  return 'diagram.txt';
}

/** Build the copy-source resolver for a diagram container (null if none). */
function sourceResolver(container: HTMLElement): (() => Promise<string>) | null {
  const inline = container.dataset.diagramSource;
  if (inline) return async () => inline;
  const src = container.dataset.src;
  if (src && container.classList.contains('diagram-excalidraw')) {
    return async () => {
      const res = await fetch(src, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`fetch failed (${res.status})`);
      return res.text();
    };
  }
  return null;
}

function diagramTarget(container: HTMLElement, el: SVGSVGElement): ActionTarget {
  return { el, source: sourceResolver(container), sourceName: sourceName(container) };
}

function open(el: HTMLImageElement | HTMLDivElement) {
  ensureOverlay();
  canvas!.innerHTML = '';
  canvas!.style.transform = '';
  currentTarget = null;

  if (el instanceof HTMLImageElement) {
    const img = document.createElement('img');
    img.className = 'lightbox-img';
    img.src = el.src;
    img.alt = el.alt;
    img.draggable = false;
    canvas!.appendChild(img);
    currentTarget = { el: img };
    openBtn!.hidden = false;
    openBtn!.href = el.src;
    const fitImage = () => panzoom!.fit(img.naturalWidth || 800, img.naturalHeight || 600, 1);
    if (img.complete) fitImage();
    else img.addEventListener('load', fitImage, { once: true });
  } else {
    const svg = el.querySelector('svg');
    if (!svg) return;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.classList.add('lightbox-svg');
    const [w, h] = svgSize(svg);
    clone.removeAttribute('width');
    clone.removeAttribute('height');
    clone.style.width = `${w}px`;
    clone.style.height = `${h}px`;
    clone.style.maxWidth = 'none';
    canvas!.appendChild(clone);
    currentTarget = diagramTarget(el, clone);
    const fileSrc = el.dataset.src;
    openBtn!.hidden = !fileSrc;
    if (fileSrc) openBtn!.href = fileSrc;
    panzoom!.fit(w, h);
  }

  overlay!.classList.add('lightbox-open');
  document.body.style.overflow = 'hidden';
}

function close() {
  overlay?.classList.remove('lightbox-open');
  document.body.style.overflow = '';
}

/* ---------- Inline bindings ---------- */

function bindImages() {
  const images = document.querySelectorAll<HTMLImageElement>('.markdown-content img');
  for (const img of images) {
    if (boundElements.has(img)) continue;
    boundElements.add(img);
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => open(img));
  }
}

function bindDiagrams() {
  const diagrams = document.querySelectorAll<HTMLDivElement>('.markdown-content .diagram-rendered');
  for (const diagram of diagrams) {
    if (boundElements.has(diagram)) continue;
    boundElements.add(diagram);

    // Expand on click — but leave text selection, labels, links, caption
    // and the hover toolbar alone.
    diagram.addEventListener('click', (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el?.closest(`${TEXT_TARGETS}, .diagram-tools, .diagram-caption`)) return;
      if (!window.getSelection()?.isCollapsed) return;
      open(diagram);
    });

    // Hover toolbar: expand + copy split button (PNG by default, caret menu)
    const tools = document.createElement('div');
    tools.className = 'diagram-tools';
    const target = () => {
      const svg = diagram.querySelector('svg');
      return svg ? diagramTarget(diagram, svg) : null;
    };
    const expand = toolbarButton('⛶', 'Expand', () => open(diagram));
    expand.className = 'diagram-tool-btn';
    tools.appendChild(expand);
    const copy = toolbarButton('⎘', 'Copy as PNG', () => {
      const t = target();
      if (t) copyPng(t);
    });
    copy.className = 'diagram-tool-btn';
    tools.appendChild(copy);
    const caret = toolbarButton('▾', 'More copy/download options', () => {
      const t = target();
      if (t) openCopyMenu(caret, t);
    });
    caret.className = 'diagram-tool-btn diagram-tool-caret';
    tools.appendChild(caret);
    diagram.appendChild(tools);
  }
}

// Bind images immediately (they're in the DOM already)
bindImages();

// Bind diagrams now (in case they rendered before this script)
bindDiagrams();

// Re-bind when diagrams finish rendering asynchronously
document.addEventListener('diagrams:rendered', bindDiagrams);
