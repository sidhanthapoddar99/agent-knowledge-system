/**
 * _templates.mjs — the one reader for `templates/*.md`.
 *
 * A template is a markdown skeleton: frontmatter, a lead paragraph with no
 * heading, then `#` sections in order. Three readers share this file:
 *   • the scaffolders render a template into a new file
 *   • the validator reads a template's headings and section bodies
 *   • the reference links to the template file itself
 * One file per file type, read at runtime. The code holds no skeleton text.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFrontmatter } from './_frontmatter.mjs';
import { makeFenceTracker } from './_links.mjs';

export const TEMPLATE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'templates');

/** Every template name, one per file type. */
export const TEMPLATE_NAMES = ['subtask', 'plan-overview', 'plan-stage', 'log-index', 'log-index-lp', 'log-index-rf', 'log-index-au', 'log-index-re', 'log-index-it', 'log-index-wf', 'log-round', 'note', 'comment'];

/** The index template for one agent-log kind: `log-index-<kind>` when it exists, else the fallback. */
export function logIndexTemplateFor(kind) {
  const name = `log-index-${kind}`;
  return TEMPLATE_NAMES.includes(name) && fs.existsSync(templatePath(name)) ? name : 'log-index';
}

const cache = new Map();

/** Absolute path of one template file. */
export function templatePath(name) {
  return path.join(TEMPLATE_DIR, `${name}.md`);
}

/**
 * Split a markdown body into its lead paragraph and its `#` sections.
 * Lines inside fenced code blocks never open a section.
 * Returns `{ lead, sections: [{ heading, body }] }`, bodies trimmed.
 */
export function splitSections(body) {
  const isProse = makeFenceTracker();
  const lead = [];
  const sections = [];
  let current = null;
  for (const line of String(body).split(/\r?\n/)) {
    const prose = isProse(line);
    const m = prose ? line.match(/^# (.+?)\s*$/) : null;
    if (m) {
      current = { heading: m[1], body: [] };
      sections.push(current);
      continue;
    }
    (current ? current.body : lead).push(line);
  }
  const trim = (lines) => lines.join('\n').replace(/^\n+/, '').replace(/\s+$/, '');
  return {
    lead: trim(lead),
    sections: sections.map((s) => ({ heading: s.heading, body: trim(s.body) })),
  };
}

/**
 * One parsed template: `{ name, data, lead, sections }`.
 * Throws when the template file is missing — a scaffolder must not guess a shape.
 */
export function readTemplate(name) {
  if (cache.has(name)) return cache.get(name);
  const file = templatePath(name);
  if (!fs.existsSync(file)) throw new Error(`template not found: ${file}`);
  const { data, content } = readFrontmatter(fs.readFileSync(file, 'utf-8'));
  const parsed = { name, data, ...splitSections(content) };
  cache.set(name, parsed);
  return parsed;
}

/** The `#` headings of one template, in order. */
export function templateHeadings(name) {
  return readTemplate(name).sections.map((s) => s.heading);
}

/** The template body of one section, or '' when the template has no such section. */
export function templateSectionBody(name, heading) {
  return readTemplate(name).sections.find((s) => s.heading === heading)?.body ?? '';
}

function yamlScalar(value) {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const s = String(value);
  return /^[A-Za-z0-9_.-]+$/.test(s) ? s : JSON.stringify(s);
}

/**
 * A frontmatter block from ordered `[key, value]` pairs.
 * A value that is undefined, null, '' or an empty array writes no line.
 * An array writes a YAML list, one quoted item per line.
 */
export function frontmatterBlock(fields) {
  const out = ['---'];
  for (const [key, value] of fields) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      out.push(`${key}:`);
      for (const item of value) out.push(`  - ${yamlScalar(item)}`);
    } else {
      out.push(`${key}: ${yamlScalar(value)}`);
    }
  }
  out.push('---');
  return out.join('\n');
}

/**
 * Render one template into file text.
 *   fields         ordered `[key, value]` frontmatter pairs
 *   seeds.lead     replaces the lead paragraph
 *   seeds.sections `{ '<heading>': '<body>' }` replaces one section body
 * Every part without a seed keeps the template text.
 */
export function renderTemplate(name, fields, seeds = {}) {
  const t = readTemplate(name);
  const given = (v) => v !== undefined && v !== null && String(v).trim() !== '';
  const lead = given(seeds.lead) ? String(seeds.lead).trim() : t.lead;
  const parts = [frontmatterBlock(fields), ''];
  if (lead) parts.push(lead, '');
  for (const s of t.sections) {
    const seeded = seeds.sections?.[s.heading];
    const body = given(seeded) ? String(seeded).trim() : s.body;
    parts.push(`# ${s.heading}`);
    if (body) parts.push(body);
    parts.push('');
  }
  return parts.join('\n');
}
