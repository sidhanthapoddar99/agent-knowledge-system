/**
 * Narration through the browser's own speech engine (Web Speech API).
 *
 * There are no audio files: the voice is whatever the reader's browser and OS
 * provide. When there is no voice at all, the narrator says so and falls back
 * to reading time — captions advance at speaking pace, in silence.
 *
 * Each beat is spoken one sentence at a time. Chrome cuts long utterances off
 * after about fifteen seconds, and sentences also give the player a progress
 * point to report.
 */

/** Speaking pace used for timing estimates and the silent fallback. */
export const WORDS_PER_MINUTE = 160;

const VOICE_KEY = 'agent-ks-video-voice';

export interface Narration {
  /** Called when sentence `index` of `count` starts. */
  onSentence: (index: number, count: number) => void;
  onEnd: () => void;
}

function sentencesOf(text: string): string[] {
  return text.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
}

/** Rank English voices: neural/natural voices first, then known good ones. */
function score(v: SpeechSynthesisVoice): number {
  let s = 0;
  if (/natural|neural|online/i.test(v.name)) s += 4;
  if (/google/i.test(v.name)) s += 3;
  if (/samantha|daniel|karen|moira|aria|jenny|guy|ava|allison/i.test(v.name)) s += 2;
  if (/^en[-_](US|GB)/i.test(v.lang)) s += 1;
  return s;
}

export class Narrator {
  voices: SpeechSynthesisVoice[] = [];
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  /** Bumped on every stop, so callbacks from a cancelled beat are ignored. */
  private run = 0;
  private timer = 0;
  /** Held so Chrome does not garbage-collect it mid-sentence and drop onend. */
  private utterance: SpeechSynthesisUtterance | null = null;

  get silent(): boolean {
    return this.voice === null;
  }

  /** Wait briefly for the voice list; browsers fill it asynchronously. */
  async init(): Promise<void> {
    if (!('speechSynthesis' in window)) return;
    const list = () => speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
    if (list().length === 0) {
      await new Promise<void>((resolve) => {
        speechSynthesis.addEventListener('voiceschanged', () => resolve(), { once: true });
        setTimeout(resolve, 1500);
      });
    }
    this.voices = list().sort((a, b) => score(b) - score(a));
    const saved = localStorage.getItem(VOICE_KEY);
    this.voice = this.voices.find((v) => v.name === saved) ?? this.voices[0] ?? null;
  }

  setVoice(name: string): void {
    this.voice = this.voices.find((v) => v.name === name) ?? this.voice;
    if (this.voice) localStorage.setItem(VOICE_KEY, this.voice.name);
  }

  /** Speak `text` from sentence `from`; reports progress and the end. */
  speak(text: string, n: Narration, from = 0): void {
    this.stop();
    const run = this.run;
    const sentences = sentencesOf(text);

    const next = (i: number) => {
      if (run !== this.run) return;
      if (i >= sentences.length) return n.onEnd();
      n.onSentence(i, sentences.length);
      if (this.silent) {
        const words = sentences[i].split(/\s+/).length;
        this.timer = window.setTimeout(() => next(i + 1), (words / WORDS_PER_MINUTE) * 60000 / this.rate);
        return;
      }
      const u = new SpeechSynthesisUtterance(sentences[i]);
      u.voice = this.voice;
      u.lang = this.voice!.lang;
      u.rate = this.rate;
      u.onend = () => next(i + 1);
      u.onerror = (e) => {
        // `interrupted`/`canceled` are our own stop(); anything else is real
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.error('[video] speech failed:', e.error);
          next(i + 1);
        }
      };
      this.utterance = u;
      speechSynthesis.speak(u);
    };
    next(Math.min(from, sentences.length - 1));
  }

  stop(): void {
    this.run++;
    clearTimeout(this.timer);
    this.utterance = null;
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
}
