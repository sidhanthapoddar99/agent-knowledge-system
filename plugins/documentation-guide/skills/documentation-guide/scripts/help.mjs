/**
 * `docs help` — discovery command (Category 0b). Generated entirely from the
 * manifest, so it can never drift from the real command set.
 *
 *   docs help                 list every command grouped by domain
 *   docs help <command>       show one command's flags (bin or "group verb")
 *   docs help --json          machine-readable manifest dump (for agents)
 *
 * Honors the Category-0 contract: output to stdout, exit 0.
 */

import { parseArgs, emitJson } from './_cli.mjs';
import { MANIFEST, CONTRACT_FLAGS, byBin, bySubcommand } from './_manifest.mjs';

const args = parseArgs(process.argv.slice(2));

// --json: full manifest for programmatic consumption.
if (args.flags.json) {
  emitJson({
    commands: MANIFEST.map((c) => ({
      bin: c.bin,
      subcommand: c.group ? `${c.group} ${c.verb}` : c.verb,
      category: c.category,
      summary: c.summary,
      script: c.script,
      runtime: c.runtime,
      flags: [...c.flags, ...CONTRACT_FLAGS],
    })),
  });
  process.exit(0);
}

const CATEGORY_LABEL = {
  0: 'shared contract / meta',
  1: 'common code (cross-content)',
  2: 'common name, type-specific',
  3: 'type-specific',
};

function usageLine(c) {
  return c.group ? `docs ${c.group} ${c.verb}` : `docs ${c.verb}`;
}

// `docs help <command>` — detail for one command. (`-h` is not yet aliased by
// parseArgs — subtask 05 — so drop it from positionals to keep `help -h` working.)
const positionals = args._.filter((t) => t !== '-h' && t !== '--help');
const target = positionals[0] && (positionals[1] ? `${positionals[0]} ${positionals[1]}` : positionals[0]);
if (target) {
  const entry = byBin[target] || bySubcommand[target] || byBin[positionals[0]];
  if (!entry) {
    console.error(`docs help: unknown command "${target}"`);
    process.exit(2);
  }
  const flags = [...entry.flags, ...CONTRACT_FLAGS];
  console.log(`${usageLine(entry)}  —  ${entry.summary}`);
  console.log(`  alias: ${entry.bin}   ·   category ${entry.category} (${CATEGORY_LABEL[entry.category]})`);
  console.log('');
  console.log('  Flags:');
  const width = Math.max(...flags.map((f) => (f.value ? `--${f.name} <${f.value}>` : `--${f.name}`).length));
  for (const f of flags) {
    const sig = f.value ? `--${f.name} <${f.value}>` : `--${f.name}`;
    const al = f.alias ? ` (-${f.alias})` : '';
    console.log(`    ${sig.padEnd(width)}${al}  ${f.desc}`);
  }
  process.exit(0);
}

// `docs help` — grouped listing.
console.log('docs — documentation-template toolkit\n');
console.log('Usage: docs <group> <verb> [flags]   (or the flat `docs-*` alias)\n');

const GROUP_ORDER = [null, 'issue', 'check'];
const GROUP_LABEL = { null: 'GENERAL', issue: 'ISSUE', check: 'CHECK' };
const seen = new Set();
const groups = [...GROUP_ORDER, ...MANIFEST.map((c) => c.group).filter((g) => !GROUP_ORDER.includes(g))];

for (const g of groups) {
  if (seen.has(String(g))) continue;
  seen.add(String(g));
  const cmds = MANIFEST.filter((c) => c.group === g);
  if (!cmds.length) continue;
  console.log(GROUP_LABEL[String(g)] ?? String(g).toUpperCase());
  const width = Math.max(...cmds.map((c) => usageLine(c).length));
  for (const c of cmds) {
    console.log(`  ${usageLine(c).padEnd(width)}  (${c.bin})  ${c.summary}`);
  }
  console.log('');
}

console.log('Run `docs help <command>` for flags, or `<command> --help`.');
console.log('Add `--json` to any data command — or to `docs help` — for machine output.');
process.exit(0);
