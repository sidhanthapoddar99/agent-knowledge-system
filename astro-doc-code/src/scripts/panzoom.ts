/**
 * Minimal pan/zoom engine for the lightbox viewer.
 * Applies translate+scale to a content element positioned inside a viewport:
 * wheel zoom toward the cursor, pointer-drag pan, two-pointer pinch zoom,
 * and double-click zoom toggle.
 *
 * Pointer-downs on SVG text (or anything the caller excludes via
 * `shouldStartPan`) are left alone so native text selection keeps working.
 */

export interface PanZoomOptions {
  viewport: HTMLElement;
  content: HTMLElement;
  minScale?: number;
  maxScale?: number;
  /** Return false to leave the pointer alone (e.g. text selection). */
  shouldStartPan?: (target: EventTarget | null) => boolean;
  onChange?: (scale: number) => void;
}

export interface PanZoom {
  zoomIn(): void;
  zoomOut(): void;
  /** Scale-to-fit content of the given natural size, centered. */
  fit(width: number, height: number, maxFitScale?: number): void;
  /** Re-apply the last fit() (e.g. reset button). */
  reset(): void;
  getScale(): number;
  /** True if the pointer sequence that just ended actually panned. */
  wasDragged(): boolean;
  destroy(): void;
}

const DRAG_THRESHOLD = 4;

export function createPanZoom(opts: PanZoomOptions): PanZoom {
  const { viewport, content } = opts;
  const minScale = opts.minScale ?? 0.1;
  const maxScale = opts.maxScale ?? 16;

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let fitState: { w: number; h: number; max?: number } | null = null;
  let fitScale = 1;

  // Pointer tracking
  const pointers = new Map<number, { x: number; y: number }>();
  let dragging = false;
  let lastDragged = false;
  let startX = 0;
  let startY = 0;
  let pinchDist = 0;

  function apply() {
    content.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    opts.onChange?.(scale);
  }

  function clamp(s: number) {
    return Math.min(maxScale, Math.max(minScale, s));
  }

  /** Zoom by factor keeping the viewport point (px, py) fixed. */
  function zoomAt(px: number, py: number, factor: number) {
    const next = clamp(scale * factor);
    const ratio = next / scale;
    tx = px - (px - tx) * ratio;
    ty = py - (py - ty) * ratio;
    scale = next;
    apply();
  }

  function center(): [number, number] {
    return [viewport.clientWidth / 2, viewport.clientHeight / 2];
  }

  function fit(w: number, h: number, maxFitScale?: number) {
    fitState = { w, h, max: maxFitScale };
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    let s = Math.min((vw * 0.92) / w, (vh * 0.85) / h);
    if (maxFitScale !== undefined) s = Math.min(s, maxFitScale);
    scale = clamp(s);
    fitScale = scale;
    tx = (vw - w * scale) / 2;
    ty = (vh - h * scale) / 2;
    apply();
  }

  function viewportPoint(e: { clientX: number; clientY: number }): [number, number] {
    const rect = viewport.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top];
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.002);
    const [px, py] = viewportPoint(e);
    zoomAt(px, py, factor);
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    // Any new gesture invalidates the previous drag flag, even one that
    // never starts a pan (e.g. a click on selectable text)
    lastDragged = false;
    if (opts.shouldStartPan && !opts.shouldStartPan(e.target)) return;
    // Pan-eligible gesture: suppress native text selection during the drag
    e.preventDefault();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      dragging = false;
      lastDragged = false;
      startX = e.clientX;
      startY = e.clientY;
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  }

  function onPointerMove(e: PointerEvent) {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;

    if (pointers.size === 2) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinchDist > 0 && dist > 0) {
        const mid = { clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 };
        const [px, py] = viewportPoint(mid);
        zoomAt(px, py, dist / pinchDist);
        dragging = true;
        lastDragged = true;
      }
      pinchDist = dist;
      return;
    }

    if (!dragging) {
      if (Math.hypot(e.clientX - startX, e.clientY - startY) < DRAG_THRESHOLD) {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        return;
      }
      dragging = true;
      lastDragged = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add('panzoom-dragging');
    }

    tx += e.clientX - prev.x;
    ty += e.clientY - prev.y;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    apply();
  }

  function onPointerEnd(e: PointerEvent) {
    if (!pointers.delete(e.pointerId)) return;
    if (pointers.size === 0) {
      dragging = false;
      viewport.classList.remove('panzoom-dragging');
    }
    pinchDist = 0;
  }

  function onDblClick(e: MouseEvent) {
    e.preventDefault();
    const [px, py] = viewportPoint(e);
    if (scale <= fitScale * 1.05) {
      zoomAt(px, py, (fitScale * 2.5) / scale);
    } else if (fitState) {
      fit(fitState.w, fitState.h, fitState.max);
    }
  }

  viewport.addEventListener('wheel', onWheel, { passive: false });
  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointermove', onPointerMove);
  viewport.addEventListener('pointerup', onPointerEnd);
  viewport.addEventListener('pointercancel', onPointerEnd);
  viewport.addEventListener('dblclick', onDblClick);

  return {
    zoomIn: () => zoomAt(...center(), 1.25),
    zoomOut: () => zoomAt(...center(), 0.8),
    fit,
    reset: () => {
      if (fitState) fit(fitState.w, fitState.h, fitState.max);
    },
    getScale: () => scale,
    wasDragged: () => lastDragged,
    destroy: () => {
      viewport.removeEventListener('wheel', onWheel);
      viewport.removeEventListener('pointerdown', onPointerDown);
      viewport.removeEventListener('pointermove', onPointerMove);
      viewport.removeEventListener('pointerup', onPointerEnd);
      viewport.removeEventListener('pointercancel', onPointerEnd);
      viewport.removeEventListener('dblclick', onDblClick);
      pointers.clear();
    },
  };
}
