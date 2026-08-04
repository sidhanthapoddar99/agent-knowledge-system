/**
 * _manifest.mjs — the SINGLE SOURCE OF TRUTH for every command.
 *
 * Replaces the old inline `COMMANDS` map in cli.mjs. One registry now drives
 * three things: routing (cli.mjs), help/discovery (the `help` command), and the
 * self-test harness. Help text is GENERATED from this — never hand-written per
 * script — so docs and reality cannot drift.
 *
 * Naming model (single entrypoint — flat shims retired):
 *   • `bin`   — internal id (the old `docs-*` name). NOT a PATH binary anymore:
 *               it keys this manifest, the harness, and `agent-ks help <id>`,
 *               and still resolves as a hidden convenience form.
 *   • `group`/`verb` — the documented `agent-ks <group> <verb>` subcommand
 *                       form. `group: null` means a top-level verb
 *                       (`agent-ks <verb>`).
 *   • the dispatcher (cli.mjs) maps both `<group> <verb>` and the bare `bin`
 *     id to the same entry; the single PATH entrypoint is `agent-ks`.
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
  {
    bin: 'docs-resolve-context', group: null, verb: 'resolve-context', category: 0, script: 'resolve-context.mjs', runtime: 'mjs',
    summary: 'Emit the .env-derived content root / config / data dir (for non-JS scripts)',
    flags: [{ name: 'json', desc: 'structured JSON instead of KEY=value lines' }],
  },

  // ---- issues (group: issue) ------------------------------------------------
  {
    bin: 'docs-list', group: 'issue', verb: 'list', category: 2, script: 'issues/list.mjs', runtime: 'mjs',
    summary: 'Multi-field filter + free-text regex search over the tracker',
    flags: [
      { name: 'status', value: 'vals', desc: 'open,blocked,in-progress,input-needed,review,done,dropped (default: not-Closed)' },
      { name: 'priority', value: 'vals', desc: 'low,medium,high,urgent' },
      { name: 'component', value: 'vals', desc: 'filter by component' },
      { name: 'label', value: 'vals', desc: 'filter by label' },
      { name: 'assignee', value: 'vals', desc: 'names, or assigned/unassigned' },
      { name: 'search', value: 'regex', desc: 'free-text regex over issue files' },
      { name: 'search-fields', value: 'list', desc: 'body,settings,comments,subtasks,notes,agent-log' },
      { name: 'path', value: 'regex', desc: 'match issues by file/folder path text' },
      { name: 'meta', value: 'regex', desc: 'match only frontmatter + JSON (structured layer)' },
      { name: 'count', desc: 'matches + titles only, no per-line excerpts' },
      { name: 'limit', value: 'N', desc: 'cap to first N matching issues' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'paths-only', desc: 'bare list of unique match paths' },
      { name: 'include-closed', desc: 'widen the default scope to include done/dropped' },
      { name: 'created-after', value: 'DATE', desc: 'YYYY-MM-DD, from the issue folder date prefix' },
      { name: 'has-review-subtasks', desc: 'only issues carrying a subtask in the Review category' },
      { name: 'has-open-subtasks', desc: 'only issues with an open subtask' },
      { name: 'has-closed-subtasks', desc: 'only issues with a closed subtask' },
      { name: 'subtasks-min', value: 'N', desc: 'at least N subtasks' },
      { name: 'subtasks-max', value: 'N', desc: 'at most N subtasks' },
      { name: 'created-before', value: 'DATE', desc: 'YYYY-MM-DD, from the issue folder date prefix' },
      { name: 'type', value: 'vals', desc: 'filter by type' },
      { name: 'scope', value: 'subpath', desc: 'restrict the search to a subpath' },
      { name: 'case-sensitive', desc: 'case-sensitive regex matching' },
      { name: 'invert-match', desc: 'return issues that do NOT match' },
      { name: 'include-cancelled', desc: 'include cancelled items' },
      { name: 'quiet-tips', desc: 'suppress the trailing usage tips' },
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
      { name: 'status', value: 'vals', desc: 'alias of --state' },
      { name: 'flat', desc: 'flat TSV instead of grouped tree' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'quiet-tips', desc: 'suppress the trailing usage tips' },
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
      { name: 'subtask', value: 'n|slug', desc: 'set a subtask state instead of the issue status' },
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
    summary: 'Append a ONE-LINE agent-log entry (flattens multi-line; write milestone logs as files)',
    flags: [
      { name: 'body', value: 'md', desc: 'entry body — single line only (written verbatim; multi-line collapses to one paragraph)' },
      { name: 'status', value: 'state', desc: 'in-progress|success|failed' },
      { name: 'iteration', value: 'N', desc: 'override iteration number' },
      { name: 'agent', value: 'name', desc: 'agent name (default claude)' },
      { name: 'group', value: 'a[/b/…]', desc: 'nest under subgroups (up to the depth cap; up to 3 recommended)' },
      { name: 'date', value: 'YYYY-MM-DD', desc: 'override date' },
      { name: 'slug', value: 'slug', desc: 'short slug for the filename' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-new-agent-log', group: 'issue', verb: 'new-agent-log', category: 3, script: 'issues/new-agent-log.mjs', runtime: 'mjs',
    summary: 'Scaffold an agent log — settings.json, 01_summary.md, and an empty 02_working/00_index.md',
    flags: [
      { name: 'kind', value: 'code', desc: 'agent-log kind code (lp/au/rf/it/wf or a custom agentLogKinds code) — required' },
      { name: 'name', value: 'slug', desc: 'kebab-case run name, sanitised to [a-z0-9-] — required' },
      { name: 'group', value: 'a[/b]', desc: 'nest under a grouping folder path (created if missing; numbering scoped to the group)' },
      { name: 'parent', value: 'path', desc: 'create as a CHILD agent log inside an existing one (a sub-goal with its own goal)' },
      { name: 'prefix', value: 'NNN', desc: 'explicit number (2–5 digits) instead of the next gap-spaced one' },
      { name: 'goal', value: 'text', desc: 'seed 01_summary.md’s Goal section' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-new-iteration', group: 'issue', verb: 'new-iteration', category: 3, script: 'issues/new-iteration.mjs', runtime: 'mjs',
    summary: "Create an iteration (or producer) file in an agent log's 02_working/, head pre-filled",
    flags: [
      { name: 'log', value: 'path', desc: 'path to the agent log, relative to agent-log/ — required' },
      { name: 'name', value: 'slug', desc: 'kebab-case file name — required' },
      { name: 'title', value: 'text', desc: 'frontmatter title (default: de-kebabed name)' },
      { name: 'producer', desc: "this file is ONE agent's substantial output — takes the next digit inside the current iteration" },
      { name: 'iteration', value: 'NN', desc: 'force the iteration number instead of deriving it' },
      { name: 'goal', value: 'text', desc: 'seed # Goal' },
      { name: 'inputs', value: 'a,b', desc: 'comma-separated paths to seed # Inputs' },
      { name: 'unit', value: 'kind', desc: 'work unit (planning/execution/audit/decide/fix/research/benchmark/test) — seeds # Expected Outcome' },
      { name: 'agent', value: 'name', desc: 'frontmatter `agent:` — who wrote it (name the TOOL for external jobs)' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-new-plan', group: 'issue', verb: 'new-plan', category: 3, script: 'issues/new-plan.mjs', runtime: 'mjs',
    summary: "Open a plan in an issue's plans/ section (folder + settings.json + overview.md)",
    flags: [
      { name: 'name', value: 'slug', desc: 'kebab-case plan slug — required' },
      { name: 'title', value: 'text', desc: 'settings.json title (default: de-kebabed name)' },
      { name: 'status', value: 'state', desc: 'settings.json status (default open)' },
      { name: 'overview', value: 'text', desc: 'seed overview.md instead of its placeholder' },
      { name: 'prefix', value: 'NN', desc: 'explicit plan number instead of the next one' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-new-stage', group: 'issue', verb: 'new-stage', category: 3, script: 'issues/new-stage.mjs', runtime: 'mjs',
    summary: 'Add a stage to a plan — the prefix is both its id and its order, gap-spaced by ten',
    flags: [
      { name: 'plan', value: 'folder', desc: 'the plan folder under plans/ — required' },
      { name: 'name', value: 'slug', desc: 'kebab-case stage name — required' },
      { name: 'title', value: 'text', desc: 'frontmatter title (default: de-kebabed name)' },
      { name: 'outcome', value: 'text', desc: 'one line: what "done" means for this stage' },
      { name: 'who', value: 'name', desc: 'who the stage waits on' },
      { name: 'notes', value: 'text', desc: 'free-text notes line in the stage frontmatter' },
      { name: 'status', value: 'state', desc: 'one of the canonical seven (default open)' },
      { name: 'after', value: 'NN', desc: 'insert after stage NN — takes the MIDPOINT of the following gap' },
      { name: 'prefix', value: 'NN', desc: 'explicit stage number, overriding --after' },
      { name: 'subtask', value: 'path,…', desc: 'seed the `subtasks:` reference list' },
      { name: 'json', desc: 'structured JSON output' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-new-subtask', group: 'issue', verb: 'new-subtask', category: 3, script: 'issues/new-subtask.mjs', runtime: 'mjs',
    summary: 'Scaffold a new subtask pre-seeded with the five-section template (Overview/References/Todo/Outcomes/Details)',
    flags: [
      { name: 'name', value: 'slug', desc: 'kebab-case subtask name, sanitised to [a-z0-9-] — required' },
      { name: 'title', value: 'text', desc: 'frontmatter title (default: de-kebabed name)' },
      { name: 'group', value: 'a[/b]', desc: 'nest under a grouping folder path (created if missing)' },
      { name: 'overview', value: 'text', desc: 'seed the Overview section instead of its placeholder callout' },
      { name: 'index', desc: 'scaffold the series index leaf (00_overview.md, index shape) instead of a work order' },
      { name: 'json', desc: 'structured JSON output' },
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
  {
    bin: 'docs-check-issues', group: 'check', verb: 'issues', category: 2, script: 'issues/check.mjs', runtime: 'mjs',
    summary: 'Validate the issue tracker (schema, vocabulary, subtask states)',
    flags: [
      { name: 'json', desc: 'structured findings' },
      { name: 'quiet', desc: 'suppress warnings' },
      { name: 'no-warnings', desc: 'same as --quiet' },
      { name: 'verbose', desc: 'per-file detail while walking' },
      { name: 'strict', desc: 'treat warnings as errors' },
      { name: 'subtask-template', desc: 'lint subtasks against the five-section template (also on via root settings `subtaskTemplate: true`)' },
      { name: 'tracker', value: 'path', desc: 'non-default tracker' },
    ],
  },
  {
    bin: 'docs-check-legacy-tags', group: 'check', verb: 'legacy-tags', category: 2, script: 'check-legacy-tags.mjs', runtime: 'mjs',
    summary: 'Detect retired custom-tags syntax (:::callout, <callout>, …) with native replacements',
    flags: [{ name: 'json', desc: 'structured findings' }],
  },
  {
    bin: 'docs-check-skill-links', group: 'check', verb: 'skill-links', category: 0, script: 'check-skill-links.mjs', runtime: 'mjs',
    summary: 'Maintainer tool: verify relative links between skill .md files resolve',
    flags: [{ name: 'json', desc: 'structured findings' }],
  },
  {
    bin: 'docs-check-link-form', group: 'check', verb: 'link-form', category: 2, script: 'check-link-form.mjs', runtime: 'mjs',
    summary: 'Every internal link is relative — the form agent-ks move can maintain (source-only, no build needed)',
    flags: [{ name: 'json', desc: 'structured findings' }],
  },
  {
    bin: 'docs-check-links', group: 'check', verb: 'links', category: 2, script: 'check-content-links.mjs', runtime: 'mjs',
    summary: 'Verify links between content pages resolve (run ./start build first)',
    flags: [
      { name: 'section', desc: 'check one page from site.yaml instead of all' },
      { name: 'all', desc: 'include trackers (type: issues) — excluded by default' },
      { name: 'dist', desc: 'built site to check against, if not auto-found' },
      { name: 'json', desc: 'structured findings' },
    ],
  },

  // ---- docs content (group: doc) -------------------------------------------
  {
    bin: 'docs-doc-list', group: 'doc', verb: 'list', category: 2, script: 'docs/list.mjs', runtime: 'mjs',
    summary: 'List doc pages (rel · section · title); optional [section] filter',
    flags: [{ name: 'json', desc: 'structured JSON output' }],
  },
  {
    bin: 'docs-doc-show', group: 'doc', verb: 'show', category: 2, script: 'docs/show.mjs', runtime: 'mjs',
    summary: "One doc page's metadata + frontmatter (by path/name)",
    flags: [{ name: 'json', desc: 'structured JSON output' }],
  },
  {
    bin: 'docs-doc-search', group: 'doc', verb: 'search', category: 2, script: 'docs/search.mjs', runtime: 'mjs',
    summary: 'Free-text regex search over doc pages; optional [section]',
    flags: [
      { name: 'count', desc: 'match count only' },
      { name: 'case-sensitive', desc: 'default: case-insensitive' },
      { name: 'json', desc: 'structured JSON output' },
    ],
  },

  // ---- blog content (group: blog) ------------------------------------------
  {
    bin: 'docs-blog-list', group: 'blog', verb: 'list', category: 2, script: 'blog/list.mjs', runtime: 'mjs',
    summary: 'List blog posts (date · slug · title), newest first',
    flags: [{ name: 'json', desc: 'structured JSON output' }],
  },
  {
    bin: 'docs-blog-show', group: 'blog', verb: 'show', category: 2, script: 'blog/show.mjs', runtime: 'mjs',
    summary: "One post's metadata + frontmatter (by slug/date)",
    flags: [{ name: 'json', desc: 'structured JSON output' }],
  },
  {
    bin: 'docs-blog-search', group: 'blog', verb: 'search', category: 2, script: 'blog/search.mjs', runtime: 'mjs',
    summary: 'Free-text regex search over blog posts',
    flags: [
      { name: 'count', desc: 'match count only' },
      { name: 'case-sensitive', desc: 'default: case-insensitive' },
      { name: 'json', desc: 'structured JSON output' },
    ],
  },

  // ---- git metadata (group: git, category 1) -------------------------------
  {
    bin: 'docs-git-updated', group: 'git', verb: 'updated', category: 1, script: 'git/updated.mjs', runtime: 'mjs',
    summary: 'Last-commit date/author/subject for any issue/doc/post path',
    flags: [{ name: 'json', desc: 'structured JSON output' }],
  },
  {
    bin: 'docs-git-changed', group: 'git', verb: 'changed', category: 1, script: 'git/changed.mjs', runtime: 'mjs',
    summary: 'Content changed under data/ since a ref (review sweeps)',
    flags: [
      { name: 'since', value: 'ref', desc: 'git ref to diff against (required)' },
      { name: 'type', value: 'list', desc: 'restrict scope: docs,blog,issues' },
      { name: 'json', desc: 'structured JSON output' },
    ],
  },
  {
    bin: 'docs-git-log', group: 'git', verb: 'log', category: 1, script: 'git/log.mjs', runtime: 'mjs',
    summary: 'Commit history of one issue/doc/post folder or file',
    flags: [
      { name: 'limit', value: 'N', desc: 'max commits (default 20)' },
      { name: 'json', desc: 'structured JSON output' },
    ],
  },
  {
    bin: 'docs-git-commit', group: 'git', verb: 'commit', category: 1, script: 'git/commit.mjs', runtime: 'mjs',
    summary: 'GUARDED: stage + commit ONLY one content path (never pushes)',
    flags: [
      { name: 'scope', value: 'path', desc: 'the only path to stage + commit (required)' },
      { name: 'message', alias: 'm', value: 'msg', desc: 'commit message (required)' },
      { name: 'dry-run', desc: 'show what would be committed, do nothing' },
      { name: 'json', desc: 'structured JSON output' },
    ],
  },

  // ---- theme (group: theme, category 2) ------------------------------------
  {
    bin: 'docs-theme-tokens', group: 'theme', verb: 'tokens', category: 2, script: 'theme/tokens.mjs', runtime: 'mjs',
    summary: 'Resolve the active (or a named) theme → variable→value map for light + dark',
    flags: [
      { name: 'json', desc: 'structured { theme, light, dark } map for agents' },
    ],
  },

  // ---- cross-content (top-level, category 1) -------------------------------
  {
    bin: 'docs-find', group: null, verb: 'find', category: 1, script: 'find.mjs', runtime: 'mjs',
    summary: 'Schema-agnostic search across ALL content (docs+blog+issues+config)',
    flags: [
      { name: 'meta', desc: 'match only the structured layer (frontmatter + JSON/YAML)' },
      { name: 'path', desc: 'match the file/folder path text instead of content' },
      { name: 'type', value: 'list', desc: 'restrict scope: docs,blog,issues,config' },
      { name: 'count', desc: 'match count only' },
      { name: 'paths-only', desc: 'bare list of unique match paths' },
      { name: 'case-sensitive', desc: 'default: case-insensitive' },
      { name: 'json', desc: 'structured JSON output' },
    ],
  },
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
      { name: 'scale', value: '%', desc: 'resize by percentage' },
      { name: 'width', value: 'px', desc: 'exact width (never upscales)' },
      { name: 'height', value: 'px', desc: 'exact height (never upscales)' },
      { name: 'trim', desc: 'crop uniform border' },
      { name: 'lossless', desc: 'lossless webp/png — for art you will zoom' },
      { name: 'colors', value: 'N', desc: 'palette-quantize; helps PNG, hurts lossy formats' },
      { name: 'depth', value: 'N', desc: 'bit depth' },
      { name: 'dither', value: 'mode', desc: 'dither mode when quantizing' },
      { name: 'no-strip', desc: 'keep metadata' },
      { name: 'rewrite-links', desc: 'fix ![](…) on extension change' },
      { name: 'links-root', value: 'dir', desc: 'root to search when rewriting links' },
      { name: 'out', value: 'dir', desc: 'write to DIR instead of in-place' },
      { name: 'in-place', desc: 'overwrite the source' },
      { name: 'backup', value: 'dir', desc: 'keep originals in DIR' },
      { name: 'no-backup', desc: 'no originals kept' },
      { name: 'recursive', alias: 'r', desc: 'descend into directories' },
      { name: 'quiet', desc: 'suppress per-file output' },
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
  // 1) internal id form: `agent-ks docs-list …` — the retired flat names
  //    still resolve as a hidden convenience (muscle memory / `help <id>`),
  //    but the documented surface is the `<group> <verb>` form below.
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
