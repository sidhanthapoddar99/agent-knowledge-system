/**
 * _manifest.mjs — the SINGLE SOURCE OF TRUTH for every command.
 *
 * Replaces the old inline `COMMANDS` map in cli.mjs. One registry now drives
 * three things: routing (cli.mjs), help/discovery (the `help` command), and the
 * self-test harness. Help text is GENERATED from this — never hand-written per
 * script — so docs and reality cannot drift.
 *
 * Naming model (subtask 01 decision: B + flat aliases):
 *   • `bin`   — the flat `docs-*` name the shims call (also the back-compat alias).
 *   • `group`/`verb` — the `docs <group> <verb>` subcommand form. `group: null`
 *                       means a top-level verb (`docs <verb>`).
 *   • routing keys on `bin`; the subcommand dispatcher (rollout) maps
 *     `<group> <verb>` and the `docs-*` alias to the same entry.
 *
 * `runtime` is for future polyglot (subtask 13): 'mjs' today; a Python command
 * would set 'py' and cli.mjs would route it to a Python interpreter.
 *
 * `category` ties back to the feature matrix (notes/01):
 *   0 = shared contract/meta · 1 = common code (cross-content) ·
 *   2 = common-name/type-specific · 3 = type-specific.
 *
 * A `flag` is { name, alias?, value?: '<meta>', desc }. `value` present ⇒ takes
 * an argument. Every command also implicitly supports the Category-0 contract
 * flags (--help/-h, and --json where it returns data) — see CONTRACT_FLAGS.
 */

export const CONTRACT_FLAGS = [
  { name: 'help', alias: 'h', desc: 'Show this help and exit' },
];

export const MANIFEST = [
  // ---- meta (Category 0b) ---------------------------------------------------
  {
    bin: 'docs-help', group: null, verb: 'help', category: 0, script: 'help.mjs', runtime: 'mjs',
    summary: 'List commands, show one command’s flags, or dump the manifest (--json)',
    flags: [{ name: 'json', desc: 'machine-readable manifest dump' }],
  },

  // ---- issues (group: issue) ------------------------------------------------
  {
    bin: 'docs-list', group: 'issue', verb: 'list', category: 2, script: 'issues/list.mjs', runtime: 'mjs',
    summary: 'Multi-field filter + free-text regex search over the tracker',
    flags: [
      { name: 'status', value: 'vals', desc: 'open,review,closed,cancelled (default open,review)' },
      { name: 'priority', value: 'vals', desc: 'low,medium,high,urgent' },
      { name: 'component', value: 'vals', desc: 'filter by component' },
      { name: 'label', value: 'vals', desc: 'filter by label' },
      { name: 'assignee', value: 'vals', desc: 'names, or assigned/unassigned' },
      { name: 'search', value: 'regex', desc: 'free-text regex over issue files' },
      { name: 'search-fields', value: 'list', desc: 'body,settings,comments,subtasks,notes,agent-log' },
      { name: 'limit', value: 'N', desc: 'cap to first N matching issues' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'paths-only', desc: 'bare list of unique match paths' },
      { name: 'tracker', value: 'path', desc: 'operate on a non-default tracker' },
    ],
  },
  {
    bin: 'docs-show', group: 'issue', verb: 'show', category: 2, script: 'issues/show.mjs', runtime: 'mjs',
    summary: "One issue's metadata + subtask/comment/agent-log heads",
    flags: [
      { name: 'full', desc: 'include full bodies, not just heads' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-subtasks', group: 'issue', verb: 'subtasks', category: 3, script: 'issues/subtasks.mjs', runtime: 'mjs',
    summary: 'List subtasks for one issue, or across all (--all)',
    flags: [
      { name: 'all', desc: 'across all issues' },
      { name: 'state', value: 'vals', desc: 'filter by subtask state' },
      { name: 'flat', desc: 'flat TSV instead of grouped tree' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-agent-logs', group: 'issue', verb: 'agent-logs', category: 3, script: 'issues/agent-logs.mjs', runtime: 'mjs',
    summary: 'Print the last N agent-log entries for an issue',
    flags: [
      { name: 'last', value: 'N', desc: 'how many entries (default a few)' },
      { name: 'full', desc: 'full bodies' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-set-state', group: 'issue', verb: 'set-state', category: 3, script: 'issues/set-state.mjs', runtime: 'mjs',
    summary: 'Set an issue status or a subtask state',
    flags: [
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-add-comment', group: 'issue', verb: 'add-comment', category: 3, script: 'issues/add-comment.mjs', runtime: 'mjs',
    summary: 'Append a comment with auto-incremented prefix',
    flags: [
      { name: 'author', value: 'name', desc: 'comment author (required)' },
      { name: 'body', value: 'md', desc: 'comment body (required)' },
      { name: 'date', value: 'YYYY-MM-DD', desc: 'override date' },
      { name: 'slug', value: 'slug', desc: 'short slug for the filename' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-add-agent-log', group: 'issue', verb: 'add-agent-log', category: 3, script: 'issues/add-agent-log.mjs', runtime: 'mjs',
    summary: 'Append an agent-log entry with auto-incremented iteration',
    flags: [
      { name: 'body', value: 'md', desc: 'entry body (required)' },
      { name: 'status', value: 'state', desc: 'in-progress|success|failed' },
      { name: 'iteration', value: 'N', desc: 'override iteration number' },
      { name: 'agent', value: 'name', desc: 'agent name (default claude)' },
      { name: 'group', value: 'a[/b]', desc: 'nest under up to 2 subgroups' },
      { name: 'date', value: 'YYYY-MM-DD', desc: 'override date' },
      { name: 'slug', value: 'slug', desc: 'short slug for the filename' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-review-queue', group: 'issue', verb: 'review-queue', category: 3, script: 'issues/review-queue.mjs', runtime: 'mjs',
    summary: 'Items awaiting review (status=review or open w/ review subtask)',
    flags: [
      { name: 'json', desc: 'structured JSON output' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },

  // ---- validators (group: check) -------------------------------------------
  {
    bin: 'docs-check-blog', group: 'check', verb: 'blog', category: 2, script: 'blog/check.mjs', runtime: 'mjs',
    summary: 'Validate the blog folder (naming, frontmatter, no nesting)',
    flags: [{ name: 'json', desc: 'structured findings' }],
  },
  {
    bin: 'docs-check-config', group: 'check', verb: 'config', category: 2, script: 'config/check.mjs', runtime: 'mjs',
    summary: 'Validate site/navbar/footer YAML (keys, pages, aliases)',
    flags: [{ name: 'json', desc: 'structured findings' }],
  },
  {
    bin: 'docs-check-section', group: 'check', verb: 'section', category: 2, script: 'docs/check.mjs', runtime: 'mjs',
    summary: 'Validate a docs section (NN_ prefixes, settings.json, title)',
    flags: [{ name: 'json', desc: 'structured findings' }],
  },

  // ---- cross-content (top-level, category 1) -------------------------------
  {
    bin: 'docs-move', group: null, verb: 'move', category: 1, script: 'docs/move.mjs', runtime: 'mjs',
    summary: 'Link-aware move/rename of docs files or folders',
    flags: [
      { name: 'dry-run', desc: 'preview every move + link edit' },
      { name: 'no-git', desc: 'plain fs move even inside a git tree' },
      { name: 'root', value: 'dir', desc: 'override scan/validation scope' },
    ],
  },
  {
    bin: 'docs-img', group: null, verb: 'img', category: 1, script: 'images/optimize.mjs', runtime: 'mjs',
    summary: 'Optimize images (resize, dpr, grayscale, webp/avif, strip)',
    flags: [
      { name: 'dpr', value: 'N', desc: 'undo retina capture (biggest win)' },
      { name: 'max-dim', value: 'px', desc: 'clamp largest dimension' },
      { name: 'gray', desc: 'grayscale' },
      { name: 'format', alias: 'f', value: 'fmt', desc: 'webp|avif|png|jpg' },
      { name: 'quality', alias: 'q', value: 'N', desc: 'encoder quality' },
      { name: 'strip', desc: 'strip metadata' },
      { name: 'target-size', value: 'SIZE', desc: 'step quality to fit (e.g. 100KB)' },
      { name: 'rewrite-links', desc: 'fix ![](…) on extension change' },
      { name: 'out', value: 'dir', desc: 'write to DIR instead of in-place' },
      { name: 'dry-run', desc: 'preview' },
    ],
  },
];

// ---- derived lookups --------------------------------------------------------

/** bin-name → entry (also the routing map source). */
export const byBin = Object.fromEntries(MANIFEST.map((c) => [c.bin, c]));

/** `<group> <verb>` or top-level `<verb>` → entry. */
export const bySubcommand = Object.fromEntries(
  MANIFEST.map((c) => [c.group ? `${c.group} ${c.verb}` : c.verb, c]),
);

/** Resolve a command from raw argv tokens (alias OR subcommand form).
 *  Returns { entry, rest } where rest is the remaining args for the script,
 *  or null if unrecognized. */
export function resolveCommand(tokens) {
  if (tokens.length === 0) return null;
  const [first, second] = tokens;
  // 1) flat alias: docs-list …
  if (byBin[first]) return { entry: byBin[first], rest: tokens.slice(1) };
  // 2) two-token subcommand: <group> <verb> …
  if (second && bySubcommand[`${first} ${second}`]) {
    return { entry: bySubcommand[`${first} ${second}`], rest: tokens.slice(2) };
  }
  // 3) top-level verb: <verb> …
  if (bySubcommand[first] && !MANIFEST.find((c) => c.group === first)) {
    return { entry: bySubcommand[first], rest: tokens.slice(1) };
  }
  return null;
}
