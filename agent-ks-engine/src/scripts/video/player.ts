/**
 * Narrated video player
 *
 * Plays a `video: true` page: one beat (paragraph) at a time, spoken by the
 * narrator, with the stage showing the beat's visual and focus. The page's
 * transcript stays below the player; the paragraph being spoken is marked.
 *
 * Time is estimated from word counts at speaking pace. Speech synthesis gives
 * no durations in advance, so the clock is honest about being approximate.
 */

import { readVideo, type Video } from './scenes';
import { Stage } from './stage';
import { Narrator, WORDS_PER_MINUTE } from './narrator';

const RATES = [0.9, 1, 1.15, 1.3];

function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function button(cls: string, label: string, text: string): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `vp-btn ${cls}`;
  b.setAttribute('aria-label', label);
  b.dataset.tip = label;
  b.setAttribute('data-tip-always', '');
  b.textContent = text;
  return b;
}

export async function mountPlayer(mount: HTMLElement, transcript: HTMLElement): Promise<void> {
  const video: Video = readVideo(transcript);
  if (video.beats.length === 0) {
    mount.textContent = 'This video page has no paragraphs to narrate.';
    mount.classList.add('vp-error');
    return;
  }

  mount.tabIndex = 0;
  mount.setAttribute('aria-label', `Video: ${video.title}`);
  mount.innerHTML = `
    <div class="vp-stage">
      <div class="vp-heading"><span class="vp-scene-title"></span><span class="vp-scene-count"></span></div>
      <div class="vp-viewport"><div class="vp-canvas"></div><div class="vp-card"></div></div>
      <div class="vp-caption" aria-live="polite"></div>
      <button type="button" class="vp-start" aria-label="Play video">▶</button>
    </div>
    <div class="vp-progress" role="group" aria-label="Scenes"></div>
    <div class="vp-controls">
      <span class="vp-left"></span>
      <span class="vp-time"></span>
      <span class="vp-right">
        <select class="vp-voice" aria-label="Voice"></select>
        <select class="vp-rate" aria-label="Speed"></select>
      </span>
    </div>`;
  const $ = <T extends Element>(s: string) => mount.querySelector<T>(s)!;
  const viewport = $<HTMLElement>('.vp-viewport');
  const stage = new Stage(video, viewport, $('.vp-canvas'), $('.vp-card'));
  const narrator = new Narrator();
  const caption = $<HTMLElement>('.vp-caption');
  const time = $<HTMLElement>('.vp-time');
  const start = $<HTMLButtonElement>('.vp-start');

  const prev = button('vp-prev', 'Previous paragraph (←)', '⏮');
  const play = button('vp-play', 'Play (space)', '▶');
  const next = button('vp-next', 'Next paragraph (→)', '⏭');
  const full = button('vp-full', 'Fullscreen (f)', '⛶');
  $('.vp-left').append(prev, play, next);
  $('.vp-right').append(full);

  // Time model: seconds before each beat, at speaking pace and the chosen rate
  const secs = (words: number) => (words / WORDS_PER_MINUTE) * 60 / narrator.rate;
  const before = (i: number) => video.beats.slice(0, i).reduce((t, b) => t + secs(b.words), 0);
  const total = () => before(video.beats.length);

  // One progress segment per scene, sized by its narration length
  const progress = $<HTMLElement>('.vp-progress');
  const segments = video.scenes.map((scene, i) => {
    const end = video.scenes[i + 1]?.start ?? video.beats.length;
    const seg = document.createElement('button');
    seg.type = 'button';
    seg.className = 'vp-seg';
    seg.style.flexGrow = String(video.beats.slice(scene.start, end).reduce((w, b) => w + b.words, 0));
    seg.dataset.tip = scene.title;
    seg.setAttribute('data-tip-always', '');
    seg.setAttribute('aria-label', `Scene ${i + 1}: ${scene.title}`);
    seg.innerHTML = '<span class="vp-seg-fill"></span>';
    seg.addEventListener('click', () => go(scene.start));
    progress.appendChild(seg);
    return seg;
  });

  let index = 0;
  let playing = false;

  function paint(fraction: number) {
    const beat = video.beats[index];
    const elapsed = before(index) + secs(beat.words) * fraction;
    time.textContent = `${clock(elapsed)} / ~${clock(total())}`;
    segments.forEach((seg, i) => {
      const s = video.scenes[i];
      const end = video.scenes[i + 1]?.start ?? video.beats.length;
      const span = before(end) - before(s.start);
      const done = Math.min(Math.max(elapsed - before(s.start), 0), span);
      (seg.firstElementChild as HTMLElement).style.width = `${(done / span) * 100}%`;
    });
  }

  function say() {
    narrator.speak(video.beats[index].speech, {
      onSentence: (i, n) => paint(i / n),
      onEnd: () => {
        if (index < video.beats.length - 1) setTimeout(() => playing && go(index + 1), 350);
        else {
          setPlaying(false);
          mount.classList.add('vp-ended');
        }
      },
    });
  }

  async function go(i: number) {
    start.hidden = true;
    index = Math.max(0, Math.min(i, video.beats.length - 1));
    const beat = video.beats[index];
    narrator.stop();
    video.beats.forEach((b) => b.el.classList.toggle('vp-current', b === beat));
    const scene = video.scenes[beat.scene];
    $('.vp-scene-title').textContent = scene.title;
    $('.vp-scene-count').textContent = `${beat.scene + 1} / ${video.scenes.length}`;
    caption.innerHTML = beat.html;
    paint(0);
    await stage.show(beat);
    if (playing && video.beats[index] === beat) say();
  }

  /** `speak` is false when the caller's own go() starts the narration. */
  function setPlaying(on: boolean, speak = true) {
    playing = on;
    mount.classList.toggle('vp-playing', on);
    play.textContent = on ? '⏸' : '▶';
    const label = on ? 'Pause (space)' : 'Play (space)';
    play.setAttribute('aria-label', label);
    play.dataset.tip = label;
    if (!on) narrator.stop();
    else if (speak) say();
  }

  function toggle() {
    start.hidden = true;
    // Once the video has ended, play restarts it from the top
    if (mount.classList.contains('vp-ended')) {
      mount.classList.remove('vp-ended');
      setPlaying(true, false);
      go(0);
      return;
    }
    setPlaying(!playing);
  }

  start.addEventListener('click', toggle);
  play.addEventListener('click', toggle);
  $('.vp-stage').addEventListener('click', (e) => {
    if (e.target !== start && !(e.target as Element).closest('a')) toggle();
  });
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  full.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else mount.requestFullscreen();
  });
  mount.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).matches('select')) return;
    const keys: Record<string, () => void> = {
      ' ': toggle, k: toggle, ArrowLeft: () => go(index - 1), ArrowRight: () => go(index + 1),
      f: () => full.click(),
    };
    if (keys[e.key]) {
      e.preventDefault();
      keys[e.key]();
    }
  });
  new ResizeObserver(() => stage.refit(video.beats[index])).observe(viewport);

  // Speed: changing it restarts the current paragraph at the new pace
  const rate = $<HTMLSelectElement>('.vp-rate');
  rate.innerHTML = RATES.map((r) => `<option value="${r}" ${r === 1 ? 'selected' : ''}>${r}×</option>`).join('');
  rate.addEventListener('change', () => {
    narrator.rate = Number(rate.value);
    paint(0);
    if (playing) say();
  });

  await narrator.init();
  const voice = $<HTMLSelectElement>('.vp-voice');
  if (narrator.silent) {
    voice.replaceWith(Object.assign(document.createElement('span'), {
      className: 'vp-silent',
      textContent: 'No voice in this browser — captions only',
    }));
  } else {
    for (const v of narrator.voices) voice.add(new Option(v.name, v.name, false, v === narrator.voice));
    voice.addEventListener('change', () => {
      narrator.setVoice(voice.value);
      if (playing) say();
    });
  }

  await go(0);
  start.hidden = false;
  stage.preload();
}
