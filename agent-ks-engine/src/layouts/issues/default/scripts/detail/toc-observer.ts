/**
 * TOC highlighter: marks the currently-read heading in the right-sidebar
 * TOC as the user scrolls. Scoped to the visible meta panel to avoid cross-
 * panel id clashes; rebuilds on panel swap via a MutationObserver.
 *
 * Also wires the "Issue body" top link to smooth-scroll to page top.
 */

let tocObserver: IntersectionObserver | null = null;

function setupTocObserver() {
  tocObserver?.disconnect();
  const activePanel = document.querySelector<HTMLElement>('.issue-meta__panel.is-active');
  if (!activePanel) return;
  const links = activePanel.querySelectorAll<HTMLAnchorElement>('[data-toc-link]');
  if (!links.length) return;

  const linkById = new Map<string, HTMLAnchorElement>();
  const targets: HTMLElement[] = [];
  links.forEach((link) => {
    const id = link.dataset.tocLink!;
    if (id === '__issue_top') return;
    const el = document.getElementById(id);
    if (!el) return;
    linkById.set(id, link);
    targets.push(el);
  });

  const visible = new Set<string>();
  tocObserver = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) visible.add(e.target.id);
      else visible.delete(e.target.id);
    }
    links.forEach((l) => l.classList.remove('is-active'));
    for (const el of targets) {
      if (visible.has(el.id)) {
        linkById.get(el.id)?.classList.add('is-active');
        break;
      }
    }
  }, { rootMargin: '-20% 0px -70% 0px' });

  targets.forEach((t) => tocObserver!.observe(t));
}

export function wireTocObserver() {
  document.querySelectorAll<HTMLAnchorElement>('[data-toc-link="__issue_top"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  const metaRoot = document.querySelector('.issue-meta');
  if (metaRoot) {
    const mo = new MutationObserver(() => requestAnimationFrame(setupTocObserver));
    mo.observe(metaRoot, { attributes: true, attributeFilter: ['class', 'hidden'], subtree: true });
  }
  setupTocObserver();
}
