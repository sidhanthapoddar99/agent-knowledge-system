/**
 * Shared odds and ends for the `start` CLI. No dependencies, on purpose.
 */
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

/** Repo root — two levels up from scripts/lib/. */
export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const FRAMEWORK = path.join(REPO, 'astro-doc-code');

/**
 * Parse the repo-root `.env` into a plain object. Returns `{}` when there is no
 * `.env` — callers decide whether that is fatal.
 *
 * Last assignment wins, which is what dotenv does, which is what vite's
 * `loadEnv()` does, which is what `astro.config.mjs` reads. Any other rule here
 * would let this CLI and the engine disagree about which CONFIG_DIR is live.
 */
export function readEnv() {
  const out = {};
  let text;
  try { text = fs.readFileSync(path.join(REPO, '.env'), 'utf-8'); } catch { return out; }
  for (const line of text.split('\n')) {
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(line);
    if (!m) continue;
    // Strip a trailing comment only when whitespace precedes the '#', so a '#'
    // inside a value survives.
    out[m[1]] = m[2].replace(/\s+#.*$/, '').trim().replace(/^["'](.*)["']$/, '$1');
  }
  return out;
}

export const say = (msg) => console.log(`[start] ${msg}`);
export const warn = (msg) => console.error(`[start] ${msg}`);

export function die(msg, code = 1) {
  warn(`error: ${msg}`);
  process.exit(code);
}

/** A prompt is only honest when someone is there to answer it. */
export const isInteractive = () => process.stdin.isTTY === true && process.env.START_NONINTERACTIVE !== '1';

export function ask(question) {
  if (!isInteractive()) return Promise.resolve('');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(`[start] ${question}`, (a) => { rl.close(); resolve(a); }));
}
