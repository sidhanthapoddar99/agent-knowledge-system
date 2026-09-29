/**
 * Reads a video page's rendered transcript into scenes and beats.
 *
 * The rules are the whole authoring format, so they stay small:
 * - the `#` title and the paragraphs before the first `##` are the intro scene;
 * - each `##` heading starts a scene;
 * - a diagram, code block, list, table or lone image is a visual. The stage
 *   shows the latest visual above the paragraph being spoken;
 * - each paragraph is one beat — one stretch of narration;
 * - `**bold**` text in a beat names the parts of the visual to focus on.
 */

export type VisualKind = 'mermaid' | 'graphviz' | 'code' | 'list' | 'table' | 'image';

export interface Visual {
  kind: VisualKind;
  /** The transcript element the visual was read from. */
  source: HTMLElement;
  /** Diagram source text (mermaid and graphviz only). */
  text?: string;
}

export interface Beat {
  /** The transcript paragraph, highlighted while it plays. */
  el: HTMLElement;
  /** Caption markup: the paragraph's own inline HTML. */
  html: string;
  /** What the narrator says. */
  speech: string;
  /** Lowercased bold terms to focus in the visual. */
  focus: string[];
  words: number;
  scene: number;
  /** Index into `Video.visuals`, or -1 for the scene's title card. */
  visual: number;
}

export interface Scene {
  title: string;
  /** Index of the scene's first beat. */
  start: number;
}

export interface Video {
  title: string;
  scenes: Scene[];
  beats: Beat[];
  visuals: Visual[];
}

function visualOf(el: HTMLElement): Visual | null {
  if (el.matches('.diagram-mermaid, .diagram-graphviz')) {
    // diagrams.ts may already have replaced the text with an SVG; it keeps
    // the source in data-diagram-source when it does
    const text = el.dataset.diagramSource ?? el.textContent ?? '';
    return { kind: el.matches('.diagram-mermaid') ? 'mermaid' : 'graphviz', source: el, text };
  }
  if (el.matches('pre')) return { kind: 'code', source: el };
  if (el.matches('ul, ol')) return { kind: 'list', source: el };
  if (el.matches('table, .table-wrapper')) return { kind: 'table', source: el };
  if (el.matches('p') && el.children.length === 1 && el.firstElementChild?.matches('img')
      && !el.textContent?.trim()) {
    return { kind: 'image', source: el };
  }
  return null;
}

/**
 * Speech text for a paragraph. Inline code is spoken as words, so
 * `site.yaml` reads "site yaml" and `[...slug].astro` reads "slug astro".
 */
function speechOf(p: HTMLElement): string {
  const clone = p.cloneNode(true) as HTMLElement;
  for (const code of clone.querySelectorAll('code')) {
    code.textContent = (code.textContent ?? '')
      .replace(/\[|\]|\.\.\.|[{}()<>`*]/g, ' ')
      .replace(/[._/\\-]+/g, ' ');
  }
  return (clone.textContent ?? '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

function beatOf(p: HTMLElement, scene: number, visual: number): Beat {
  const speech = speechOf(p);
  return {
    el: p,
    html: p.innerHTML,
    speech,
    focus: [...p.querySelectorAll('strong')]
      .map((s) => (s.textContent ?? '').trim().toLowerCase())
      .filter(Boolean),
    words: speech.split(' ').length,
    scene,
    visual,
  };
}

export function readVideo(transcript: HTMLElement): Video {
  const h1 = transcript.querySelector('h1');
  const title = h1?.textContent?.trim() || document.title;
  const video: Video = { title, scenes: [{ title, start: 0 }], beats: [], visuals: [] };
  let visual = -1;

  for (const el of transcript.children as HTMLCollectionOf<HTMLElement>) {
    if (el.matches('h2')) {
      // An intro with nothing to say still gets its title read out
      if (video.beats.length === 0) {
        const card = document.createElement('p');
        card.textContent = title;
        video.beats.push(beatOf(card, 0, -1));
      }
      video.scenes.push({ title: el.textContent?.trim() ?? '', start: video.beats.length });
      visual = -1;
      continue;
    }
    const v = visualOf(el);
    if (v) {
      video.visuals.push(v);
      visual = video.visuals.length - 1;
    } else if (el.matches('p')) {
      video.beats.push(beatOf(el, video.scenes.length - 1, visual));
    }
  }

  // A scene with no paragraphs has nothing to play; drop it
  video.scenes = video.scenes.filter((s, i) => {
    const next = video.scenes[i + 1]?.start ?? video.beats.length;
    return next > s.start;
  });
  video.beats.forEach((b, i) => {
    b.scene = video.scenes.findLastIndex((s) => s.start <= i);
  });
  return video;
}
