/**
 * _help-render.mjs — PURE help renderers (no process.exit, no top-level side
 * effects), so both help.mjs (the `agent-ks help` command) and cli.mjs (the global
 * --help/-h interceptor in subtask 05) can import them safely.
 *
 * Everything is generated from the manifest — help text never drifts.
 */

import { MANIFEST, CONTRACT_FLAGS, byBin, bySubcommand } from './_manifest.mjs';

// The collision-safe dispatcher binary name — the single entrypoint on PATH.
// Commands are invoked as `agent-ks <group> <verb>`; the flat `docs-*` names
// are retired to internal manifest ids (the `bin` field), not PATH binaries.
export const DISPATCH = 'agent-ks';

const CATEGORY_LABEL = {
  0: 'shared contract / meta',
  1: 'common code (cross-content)',
  2: 'common name, type-specific',
  3: 'type-specific',
};

export function usageLine(c) {
  return c.group ? `${DISPATCH} ${c.group} ${c.verb}` : `${DISPATCH} ${c.verb}`;
}

/** Full manifest as a plain object for `--json`. */
export function manifestJson() {
  return {
    commands: MANIFEST.map((c) => ({
      bin: c.bin,
      subcommand: c.group ? `${c.group} ${c.verb}` : c.verb,
      category: c.category,
      summary: c.summary,
      script: c.script,
      runtime: c.runtime,
      flags: [...c.flags, ...CONTRACT_FLAGS],
    })),
  };
}

/** Detail for one command (usage + flags). Returns a string. */
export function renderCommandDetail(entry) {
  const flags = [...entry.flags, ...CONTRACT_FLAGS];
  const out = [];
  out.push(`${usageLine(entry)}  —  ${entry.summary}`);
  out.push(`  id: ${entry.bin}   ·   category ${entry.category} (${CATEGORY_LABEL[entry.category]})`);
  out.push('');
  out.push('  Flags:');
  const width = Math.max(...flags.map((f) => (f.value ? `--${f.name} <${f.value}>` : `--${f.name}`).length));
  for (const f of flags) {
    const sig = f.value ? `--${f.name} <${f.value}>` : `--${f.name}`;
    const al = f.alias ? ` (-${f.alias})` : '';
    out.push(`    ${sig.padEnd(width)}${al}  ${f.desc}`);
  }
  return out.join('\n');
}

/** Resolve a command token ("docs-list" or "issue list") to a manifest entry. */
export function resolveEntry(tokenA, tokenB) {
  const two = tokenB ? `${tokenA} ${tokenB}` : null;
  return (two && bySubcommand[two]) || byBin[tokenA] || bySubcommand[tokenA] || null;
}

/** Grouped listing for bare `agent-ks help`. Returns a string. */
export function renderList() {
  const out = [];
  out.push('agent-ks — agent-knowledge-system toolkit\n');
  out.push(`Usage: ${DISPATCH} <group> <verb> [flags]\n`);

  const GROUP_ORDER = [null, 'issue', 'check'];
  const GROUP_LABEL = { null: 'GENERAL', issue: 'ISSUE', check: 'CHECK' };
  const seen = new Set();
  const groups = [...GROUP_ORDER, ...MANIFEST.map((c) => c.group).filter((g) => !GROUP_ORDER.includes(g))];

  for (const g of groups) {
    if (seen.has(String(g))) continue;
    seen.add(String(g));
    const cmds = MANIFEST.filter((c) => c.group === g);
    if (!cmds.length) continue;
    out.push(GROUP_LABEL[String(g)] ?? String(g).toUpperCase());
    const width = Math.max(...cmds.map((c) => usageLine(c).length));
    for (const c of cmds) out.push(`  ${usageLine(c).padEnd(width)}  ${c.summary}`);
    out.push('');
  }
  out.push(`Run \`${DISPATCH} help <command>\` for flags, or \`<command> --help\`.`);
  out.push(`Add \`--json\` to any data command — or to \`${DISPATCH} help\` — for machine output.`);
  return out.join('\n');
}
