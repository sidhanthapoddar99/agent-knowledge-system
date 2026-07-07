/**
 * Client-side diagram renderer
 * Lazily loads Mermaid and Graphviz via dynamic imports (Vite code-splits
 * them into separate chunks) only when diagram elements exist on the page.
 *
 * Dark mode is handled via CSS filter (invert + hue-rotate) so all colors
 * — including user-defined style directives — are inverted uniformly.
 */

let mermaidIdCounter = 0;

async function initDiagrams() {
  const mermaidDivs = document.querySelectorAll<HTMLDivElement>('.diagram-mermaid:not(.diagram-rendered):not(.diagram-error)');
  const graphvizDivs = document.querySelectorAll<HTMLDivElement>('.diagram-graphviz:not(.diagram-rendered):not(.diagram-error)');
  const excalidrawDivs = document.querySelectorAll<HTMLDivElement>('.diagram-excalidraw:not(.diagram-rendered):not(.diagram-error)');

  if (mermaidDivs.length === 0 && graphvizDivs.length === 0 && excalidrawDivs.length === 0) return;

  const promises: Promise<void>[] = [];

  if (mermaidDivs.length > 0) {
    promises.push(renderMermaid(mermaidDivs));
  }

  if (graphvizDivs.length > 0) {
    promises.push(renderGraphviz(graphvizDivs));
  }

  if (excalidrawDivs.length > 0) {
    promises.push(renderExcalidraw(excalidrawDivs));
  }

  await Promise.all(promises);

  // Notify lightbox that diagrams are ready
  document.dispatchEvent(new CustomEvent('diagrams:rendered'));
}

async function renderMermaid(divs: NodeListOf<HTMLDivElement>) {
  const mermaid = (await import('mermaid')).default;

  mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    // Pure-SVG labels (no <foreignObject>): keeps exported/downloaded SVGs
    // self-contained and rasterizable — foreignObject taints the canvas in
    // Chromium, breaking the lightbox "copy as image" action
    htmlLabels: false,
    flowchart: { htmlLabels: false },
  });

  for (const div of divs) {
    try {
      const id = `mermaid-${mermaidIdCounter++}`;
      const source = div.textContent || '';
      // Keep the source around for the lightbox/toolbar "copy source" action
      div.dataset.diagramSource = source;
      const { svg } = await mermaid.render(id, source);
      div.innerHTML = svg;
      div.classList.add('diagram-rendered');
    } catch (err) {
      console.error('Mermaid render error:', err);
      div.classList.add('diagram-error');
    }
  }
}

async function renderGraphviz(divs: NodeListOf<HTMLDivElement>) {
  const { Graphviz } = await import('@hpcc-js/wasm-graphviz');
  const graphviz = await Graphviz.load();

  for (const div of divs) {
    try {
      const source = div.textContent || '';
      // Keep the source around for the lightbox/toolbar "copy source" action
      div.dataset.diagramSource = source;
      const svg = graphviz.layout(source, 'svg', 'dot');
      div.innerHTML = svg;
      div.classList.add('diagram-rendered');
    } catch (err) {
      console.error('Graphviz render error:', err);
      div.classList.add('diagram-error');
    }
  }
}

async function renderExcalidraw(divs: NodeListOf<HTMLDivElement>) {
  const { exportToSvg } = await import('@excalidraw/excalidraw');

  for (const div of divs) {
    const src = div.dataset.src;
    try {
      if (!src) throw new Error('missing data-src');
      // no-cache: revalidate against the server ETag (cheap 304 when
      // unchanged) so edited scenes show up on a plain reload
      const res = await fetch(src, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`fetch failed (${res.status})`);
      const scene = await res.json();

      const svg = await exportToSvg({
        elements: scene.elements ?? [],
        appState: { ...(scene.appState ?? {}), exportBackground: true, viewBackgroundColor: '#ffffff' },
        files: scene.files ?? null,
      });

      div.innerHTML = '';
      div.appendChild(svg);

      // Caption: title + link to the independently openable file. Clicks on
      // the caption must not bubble into the lightbox zoom on the container.
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
      caption.addEventListener('click', (e) => e.stopPropagation());
      div.appendChild(caption);

      div.classList.add('diagram-rendered');
    } catch (err) {
      console.error('Excalidraw render error:', err);
      div.textContent = `Failed to render Excalidraw diagram${src ? `: ${src}` : ''}`;
      div.classList.add('diagram-error');
    }
  }
}

// Module scripts are deferred — DOM is already parsed when this runs
initDiagrams();

// Allow editor preview to trigger re-rendering when content updates
document.addEventListener('diagrams:render', () => initDiagrams());
