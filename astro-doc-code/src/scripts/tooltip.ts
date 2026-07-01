/**
 * Site-wide tooltip — one singleton, cursor-anchored, for any element carrying
 * `data-tip`. Loaded from BaseLayout, so it works in every layout (docs, blogs,
 * issues, custom) and both side panels (left sidebar, right outline/index).
 *
 * Display rule (lives HERE, not in the markup):
 *   - `data-tip-always` present (icons, symbols, dots) → tooltip always shows.
 *   - otherwise (text rows) → the tooltip shows ONLY when the text is actually
 *     cropped — the element or a descendant overflows horizontally (ellipsis).
 *     Fully visible text gets no tooltip; it would add nothing.
 *
 * The tip is `position: fixed` at the TOP-RIGHT of the cursor (following it),
 * so it can never be clipped by a scroll container or hidden by stacking.
 */

const SHOW_DELAY_MS = 60;
const CURSOR_OFFSET = 10;
const VIEWPORT_PAD = 4;

const tip = document.createElement('div');
tip.className = 'ui-tooltip';
document.body.appendChild(tip);

let current: HTMLElement | null = null;
let showTimer = 0;
let lastX = 0;
let lastY = 0;

/** Is this element's text (or any descendant's) horizontally cropped? */
function isCropped(el: HTMLElement): boolean {
  if (el.scrollWidth > el.clientWidth + 1) return true;
  for (const child of el.querySelectorAll<HTMLElement>('*')) {
    if (child.scrollWidth > child.clientWidth + 1) return true;
  }
  return false;
}

function shouldShow(el: HTMLElement): boolean {
  return el.hasAttribute('data-tip-always') || isCropped(el);
}

/** Anchor the tip's bottom-left corner at the pointer's top-right, clamped to
 *  the viewport (flips below the cursor when there's no room above). */
function place(): void {
  const w = tip.offsetWidth;
  const h = tip.offsetHeight;
  let left = lastX + CURSOR_OFFSET;
  let top = lastY - CURSOR_OFFSET - h;
  if (left + w > window.innerWidth - VIEWPORT_PAD) left = window.innerWidth - w - VIEWPORT_PAD;
  if (top < VIEWPORT_PAD) top = lastY + CURSOR_OFFSET;
  tip.style.left = `${left}px`;
  tip.style.top = `${top}px`;
}

function hide(): void {
  window.clearTimeout(showTimer);
  tip.classList.remove('is-visible');
  current = null;
}

document.addEventListener('mousemove', (e) => {
  lastX = e.clientX;
  lastY = e.clientY;
  if (current && tip.classList.contains('is-visible')) place();
});

document.addEventListener('mouseover', (e) => {
  const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tip]');
  if (el === current) return;
  hide();
  const text = el?.getAttribute('data-tip');
  if (!el || !text || !shouldShow(el)) return;
  current = el;
  lastX = e.clientX;
  lastY = e.clientY;
  showTimer = window.setTimeout(() => {
    tip.textContent = text;
    place();
    tip.classList.add('is-visible');
  }, SHOW_DELAY_MS);
});

document.addEventListener('mouseout', (e) => {
  if (current && !current.contains(e.relatedTarget as Node)) hide();
});

// Scrolling under a shown tip would leave it hovering over the wrong row.
document.addEventListener('scroll', hide, { capture: true, passive: true });
