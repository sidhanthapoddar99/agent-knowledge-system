/**
 * Copy/download actions + dropdown menu for diagrams and images.
 * Used by the lightbox viewer toolbar and the inline diagram hover toolbar.
 *
 * The menu is a single fixed-position element appended to <body> (inline
 * diagram containers scroll/clip, so it can't live inside them). Default
 * action everywhere is "copy as PNG (light)"; dark variants apply the same
 * invert filter the site's dark mode uses.
 */

/** What the actions operate on. */
export interface ActionTarget {
  /** Element to rasterize — the rendered SVG, or a raster <img>. */
  el: SVGSVGElement | HTMLImageElement;
  /** Original diagram text (mermaid/dot fence or excalidraw scene JSON). */
  source?: (() => Promise<string>) | null;
  /** Download filename for the source, e.g. "diagram.mmd". */
  sourceName?: string;
}

const DARK_FILTER = 'invert(1) hue-rotate(180deg) brightness(0.95)';

/* ---------- Toast ---------- */

let toastEl: HTMLDivElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function toast(message: string) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'lightbox-toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.classList.add('lightbox-toast-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl!.classList.remove('lightbox-toast-visible'), 1800);
}

/* ---------- Rasterization ---------- */

/**
 * Rasterize a rendered SVG (or an image) to a PNG blob. SVGs are drawn on a
 * white background (matching how diagrams display) at 2× for crispness,
 * capped at 4096px on the long edge. `dark` re-draws through the site's
 * dark-mode invert filter.
 */
async function rasterize(el: SVGSVGElement | HTMLImageElement, dark: boolean): Promise<Blob> {
  let w: number;
  let h: number;
  let img: HTMLImageElement;
  const isSvg = !(el instanceof HTMLImageElement);

  if (isSvg) {
    [w, h] = svgSize(el);
    const clone = el.cloneNode(true) as SVGSVGElement;
    clone.classList.remove('lightbox-svg');
    clone.removeAttribute('style');
    clone.setAttribute('width', String(w));
    clone.setAttribute('height', String(h));
    if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const blob = new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    try {
      img = new Image();
      img.src = url;
      await img.decode();
    } finally {
      URL.revokeObjectURL(url);
    }
  } else {
    w = el.naturalWidth || el.width;
    h = el.naturalHeight || el.height;
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = el.currentSrc || el.src;
    await img.decode();
  }

  const scale = Math.min(2, 4096 / Math.max(w, h));
  const target = document.createElement('canvas');
  target.width = Math.max(1, Math.round(w * scale));
  target.height = Math.max(1, Math.round(h * scale));
  const ctx = target.getContext('2d')!;
  if (dark) ctx.filter = DARK_FILTER;
  if (isSvg) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, target.width, target.height);
  }
  ctx.drawImage(img, 0, 0, target.width, target.height);
  return new Promise((resolve, reject) =>
    target.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  );
}

/** Read a rendered SVG's natural size from its viewBox/attrs. */
export function svgSize(svg: SVGSVGElement): [number, number] {
  const vb = svg.getAttribute('viewBox')?.split(/[\s,]+/).map(Number);
  if (vb && vb.length === 4 && vb[2] > 0 && vb[3] > 0) return [vb[2], vb[3]];
  const w = parseFloat(svg.getAttribute('width') || '');
  const h = parseFloat(svg.getAttribute('height') || '');
  if (w > 0 && h > 0) return [w, h];
  const rect = svg.getBoundingClientRect();
  return [rect.width || 800, rect.height || 600];
}

/* ---------- Actions ---------- */

function downloadBlob(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function copyPng(target: ActionTarget, dark = false) {
  try {
    // Pass the promise to ClipboardItem: Safari requires the clipboard call
    // to happen synchronously within the user gesture
    const item = new ClipboardItem({ 'image/png': rasterize(target.el, dark) });
    await navigator.clipboard.write([item]);
    toast(dark ? 'Image copied (dark)' : 'Image copied');
  } catch (err) {
    console.error('Copy as image failed:', err);
    toast('Copy failed');
  }
}

async function downloadPng(target: ActionTarget, dark: boolean) {
  try {
    downloadBlob(await rasterize(target.el, dark), dark ? 'diagram-dark.png' : 'diagram.png');
  } catch (err) {
    console.error('Download PNG failed:', err);
    toast('Download failed');
  }
}

function downloadSvg(target: ActionTarget) {
  if (target.el instanceof HTMLImageElement) return;
  const clone = target.el.cloneNode(true) as SVGElement;
  clone.classList.remove('lightbox-svg');
  clone.removeAttribute('style');
  downloadBlob(
    new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }),
    'diagram.svg'
  );
}

async function copySource(target: ActionTarget) {
  if (!target.source) return;
  try {
    await navigator.clipboard.writeText(await target.source());
    toast('Source copied');
  } catch {
    toast('Copy failed');
  }
}

async function downloadSource(target: ActionTarget) {
  if (!target.source) return;
  try {
    const text = await target.source();
    downloadBlob(new Blob([text], { type: 'text/plain' }), target.sourceName || 'diagram.txt');
  } catch (err) {
    console.error('Download source failed:', err);
    toast('Download failed');
  }
}

/* ---------- Dropdown menu ---------- */

let menuEl: HTMLDivElement | null = null;
let menuAnchor: HTMLElement | null = null;
let reopenSuppressed = false;

function closeMenu() {
  menuEl?.remove();
  menuEl = null;
  menuAnchor = null;
}

function onDocPointerDown(e: PointerEvent) {
  if (!menuEl || !(e.target instanceof Node) || menuEl.contains(e.target)) return;
  // Closing via a press on the anchor itself must not let the anchor's
  // upcoming click event immediately reopen the menu
  reopenSuppressed = !!(e.target instanceof Element && menuAnchor && menuAnchor.contains(e.target));
  closeMenu();
}
document.addEventListener('pointerdown', onDocPointerDown, true);
// Close on Escape before the viewer's own Escape handler closes the overlay
document.addEventListener(
  'keydown',
  (e) => {
    if (e.key === 'Escape' && menuEl) {
      e.stopPropagation();
      closeMenu();
    }
  },
  true
);

/**
 * Open the copy/download dropdown anchored under `anchor`. Rebuilt on each
 * open (targets differ per diagram); clicking an item runs it and closes.
 */
export function openCopyMenu(anchor: HTMLElement, target: ActionTarget) {
  if (reopenSuppressed) {
    reopenSuppressed = false;
    return;
  }
  if (menuEl) {
    closeMenu();
    return;
  }
  menuAnchor = anchor;
  const isDiagram = !(target.el instanceof HTMLImageElement);

  type Item = { label: string; run: () => void } | 'sep';
  const items: Item[] = [{ label: 'Copy as PNG', run: () => copyPng(target, false) }];
  if (isDiagram) items.push({ label: 'Copy as PNG (dark)', run: () => copyPng(target, true) });
  if (target.source) items.push({ label: 'Copy source', run: () => copySource(target) });
  items.push('sep');
  items.push({ label: 'Download PNG', run: () => downloadPng(target, false) });
  if (isDiagram) {
    items.push({ label: 'Download PNG (dark)', run: () => downloadPng(target, true) });
    items.push({ label: 'Download SVG', run: () => downloadSvg(target) });
  }
  if (target.source) items.push({ label: 'Download source', run: () => downloadSource(target) });

  menuEl = document.createElement('div');
  menuEl.className = 'copy-menu';
  for (const item of items) {
    if (item === 'sep') {
      const sep = document.createElement('div');
      sep.className = 'copy-menu-sep';
      menuEl.appendChild(sep);
      continue;
    }
    const btn = document.createElement('button');
    btn.className = 'copy-menu-item';
    btn.textContent = item.label;
    btn.addEventListener('click', () => {
      closeMenu();
      item.run();
    });
    menuEl.appendChild(btn);
  }
  document.body.appendChild(menuEl);

  // Fixed positioning below the anchor, right-aligned, clamped to viewport
  const rect = anchor.getBoundingClientRect();
  const menuRect = menuEl.getBoundingClientRect();
  let left = rect.right - menuRect.width;
  left = Math.max(8, Math.min(left, window.innerWidth - menuRect.width - 8));
  let top = rect.bottom + 4;
  if (top + menuRect.height > window.innerHeight - 8) top = rect.top - menuRect.height - 4;
  menuEl.style.left = `${left}px`;
  menuEl.style.top = `${top}px`;
}
