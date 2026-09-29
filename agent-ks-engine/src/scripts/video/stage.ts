/**
 * The stage: shows one visual and moves attention around it.
 *
 * Focus is the only animation primitive. A beat's bold terms pick parts of the
 * visual — diagram nodes, code lines, list items, table rows. The stage dims
 * everything else and the camera eases in on the picked parts. Lists and
 * tables also reveal each item at the beat that first names it.
 */

import type { Beat, Video, Visual } from './scenes';

/** Elements that can take focus, per visual kind. */
const PARTS: Record<Visual['kind'], string> = {
  mermaid: 'g.node, g.cluster',
  graphviz: 'g.node, g.cluster',
  code: '.line',
  list: ':scope > li',
  table: 'tbody tr',
  image: '',
};

let diagramId = 0;

const isDiagram = (v: Visual) => v.kind === 'mermaid' || v.kind === 'graphviz';
/** Largest fitted scale: diagrams may grow to fill the stage, text less so. */
const capOf = (v: Visual) => (isDiagram(v) ? 1.8 : 1.3);

function norm(s: string | null | undefined): string {
  return (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** A term matches a part when either contains the other (short labels must match whole). */
function matches(partText: string, term: string): boolean {
  return partText.includes(term) || (partText.length >= 3 && term.includes(partText));
}

/** Size an SVG to its viewBox so the camera can measure it at scale 1. */
function naturalSize(svg: SVGSVGElement): void {
  const vb = svg.viewBox.baseVal;
  if (!vb || !vb.width) return;
  svg.removeAttribute('style');
  svg.setAttribute('width', String(vb.width));
  svg.setAttribute('height', String(vb.height));
}

async function renderDiagram(v: Visual): Promise<HTMLElement> {
  const host = document.createElement('div');
  if (v.kind === 'mermaid') {
    const mermaid = (await import('mermaid')).default;
    // Same settings as scripts/diagrams.ts, so a diagram looks the same in
    // the transcript and on the stage
    mermaid.initialize({
      startOnLoad: false, theme: 'default', securityLevel: 'loose',
      htmlLabels: false, flowchart: { htmlLabels: false },
    });
    host.innerHTML = (await mermaid.render(`video-diagram-${diagramId++}`, v.text ?? '')).svg;
  } else {
    const { Graphviz } = await import('@hpcc-js/wasm-graphviz');
    host.innerHTML = (await Graphviz.load()).layout(v.text ?? '', 'svg', 'dot');
  }
  const svg = host.querySelector('svg');
  if (svg) naturalSize(svg);
  return host;
}

async function build(v: Visual): Promise<HTMLElement> {
  let el: HTMLElement;
  if (v.kind === 'mermaid' || v.kind === 'graphviz') {
    el = await renderDiagram(v);
  } else {
    el = v.source.cloneNode(true) as HTMLElement;
    el.querySelectorAll('.code-label').forEach((n) => n.remove());
  }
  el.classList.add('vp-visual', `vp-visual-${v.kind}`);
  return el;
}

export class Stage {
  private built = new Map<number, Promise<HTMLElement>>();
  private current = -2;

  constructor(
    private video: Video,
    private viewport: HTMLElement,
    private canvas: HTMLElement,
    private card: HTMLElement,
  ) {}

  private visual(i: number): Promise<HTMLElement> {
    if (!this.built.has(i)) this.built.set(i, build(this.video.visuals[i]));
    return this.built.get(i)!;
  }

  /** Render every visual up front so scene changes never wait. */
  preload(): Promise<unknown> {
    return Promise.allSettled(this.video.visuals.map((_, i) => this.visual(i)));
  }

  async show(beat: Beat): Promise<void> {
    this.card.textContent = beat.visual === -1 ? this.video.scenes[beat.scene].title : '';
    this.viewport.classList.toggle('vp-empty', beat.visual === -1);
    const fresh = beat.visual !== this.current;

    if (fresh) {
      this.current = beat.visual;
      this.canvas.replaceChildren();
      if (beat.visual === -1) return;
      try {
        this.canvas.appendChild(await this.visual(beat.visual));
      } catch (err) {
        console.error('[video] visual failed to render:', err);
        this.canvas.textContent = 'This visual failed to render.';
        return;
      }
      // Land on the whole visual first, then ease in on the focus
      this.fit([], false, capOf(this.video.visuals[beat.visual]));
    }
    if (beat.visual !== -1) this.focus(beat);
  }

  /** Re-fit after a resize or a fullscreen change. */
  refit(beat: Beat): void {
    if (beat.visual === this.current && beat.visual !== -1) this.focus(beat, false);
  }

  private focus(beat: Beat, animate = true): void {
    const v = this.video.visuals[beat.visual];
    const el = this.canvas.firstElementChild;
    if (!el || !PARTS[v.kind]) return this.fit([], animate, capOf(v));
    const parts = [...el.querySelectorAll<Element>(PARTS[v.kind])];
    const texts = parts.map((p) => norm(p.textContent));
    const hit = (terms: string[]) => parts.filter((_, i) => terms.some((t) => matches(texts[i], t)));

    const focused = hit(beat.focus);
    const missed = beat.focus.filter((t) => !texts.some((x) => matches(x, t)));
    if (missed.length) console.warn(`[video] nothing on the stage matches: ${missed.join(', ')}`);

    // Lists and tables reveal each item at the beat that first names it
    if (v.kind === 'list' || v.kind === 'table') {
      const beats = this.video.beats.filter((b) => b.visual === beat.visual);
      const mine = beats.indexOf(beat);
      const later = new Set(beats.slice(mine + 1).flatMap((b) => hit(b.focus)));
      const sofar = new Set(beats.slice(0, mine + 1).flatMap((b) => hit(b.focus)));
      parts.forEach((p) => p.classList.toggle('vp-pending', later.has(p) && !sofar.has(p)));
    }

    parts.forEach((p) => {
      p.classList.toggle('vp-focus', focused.includes(p));
      p.classList.toggle('vp-dim', focused.length > 0 && !focused.includes(p));
    });
    // Only diagrams zoom in. Text visuals stay readable at their fitted size,
    // where the highlight alone carries the focus.
    this.fit(isDiagram(v) ? focused : [], animate, capOf(v));
  }

  /**
   * Point the camera at `targets`, or at the whole visual when empty.
   *
   * Boxes are measured with the transform switched off, so a zoom that is
   * still easing never skews the numbers. The live (mid-transition) matrix is
   * put back before the new target is set, so the motion stays continuous.
   */
  private fit(targets: Element[], animate: boolean, cap: number): void {
    const el = this.canvas.firstElementChild;
    if (!el) return;
    const c = this.canvas;
    const live = getComputedStyle(c).transform;
    c.classList.add('vp-still');
    c.style.transform = 'none';

    const origin = c.getBoundingClientRect();
    const boxOf = (els: Element[]) => {
      const r = els.map((e) => e.getBoundingClientRect());
      return {
        left: Math.min(...r.map((b) => b.left)) - origin.left,
        top: Math.min(...r.map((b) => b.top)) - origin.top,
        right: Math.max(...r.map((b) => b.right)) - origin.left,
        bottom: Math.max(...r.map((b) => b.bottom)) - origin.top,
      };
    };
    const whole = boxOf([el]);
    const box = targets.length ? boxOf(targets) : whole;

    c.style.transform = live === 'none' ? '' : live;
    void c.offsetWidth; // commit the live matrix before transitions resume
    if (animate) c.classList.remove('vp-still');

    const vp = this.viewport.getBoundingClientRect();
    const base = Math.min(vp.width / (whole.right - whole.left), vp.height / (whole.bottom - whole.top), cap);
    const s = targets.length
      ? Math.max(base, Math.min(0.75 * vp.width / (box.right - box.left), 0.75 * vp.height / (box.bottom - box.top), base * 1.8))
      : base;
    const tx = vp.width / 2 - s * (box.left + box.right) / 2;
    const ty = vp.height / 2 - s * (box.top + box.bottom) / 2;
    c.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
  }
}
