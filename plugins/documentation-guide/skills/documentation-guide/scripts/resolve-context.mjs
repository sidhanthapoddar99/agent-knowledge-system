#!/usr/bin/env bun
/**
 * resolve-context.mjs — emit the framework's `.env`-derived project context
 * (subtask 13). Non-JS commands (a future Python script) call this instead of
 * re-implementing `.env` discovery / CONFIG_DIR resolution: one call hands back
 * the content root, config dir, and data dir.
 *
 * Default output is shell-sourceable `KEY=value` lines; `--json` gives the same
 * data structured. Honors the Category-0 contract (--help/-h intercepted by
 * cli.mjs; exit 0 ok / 1 unresolved).
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectContext } from './_env.mjs';
import { parseArgs, emitJson, writeStdout } from './_cli.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));

let ctx;
try { ctx = resolveProjectContext(SCRIPT_DIR); }
catch (e) { console.error(`resolve-context: ${e.message.split('\n')[0]}`); process.exit(1); }

if (!ctx || !ctx.contentRoot) {
  console.error('resolve-context: could not resolve a content root (.env / CONFIG_DIR not found)');
  process.exit(1);
}

const out = {
  contentRoot: ctx.contentRoot,
  configDir: ctx.configDir ?? null,
  dataDir: path.join(ctx.contentRoot, 'data'),
  envPath: ctx.envPath ?? null,
  envDir: ctx.envDir ?? null,
};

if (args.flags.json) { emitJson(out); process.exit(0); }

const lines = [
  `CONTENT_ROOT=${out.contentRoot}`,
  `CONFIG_DIR=${out.configDir ?? ''}`,
  `DATA_DIR=${out.dataDir}`,
  `ENV_PATH=${out.envPath ?? ''}`,
  `ENV_DIR=${out.envDir ?? ''}`,
];
writeStdout(lines.join('\n') + '\n');
process.exit(0);
