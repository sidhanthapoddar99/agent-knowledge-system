---
title: "Issue search script — regex + filters, drop-in replacement for grep/find"
status: done
---

The skill ships `scripts/issues/list.mjs` which already does multi-field filtering (status, priority, component, milestone, label, has-review-subtasks). What's missing is a **regex/free-text body search** dimension — currently the only path for "find issues mentioning X" is `Grep`, which validation (`comments/003_12-agent-validation-and-loading-caveat.md`) flagged as the one task where the baseline beats the skill.

This subtask **upgrades the existing `list.mjs`** (rather than adding a new script) so search becomes one optional dimension on the same multi-filter call. Direct, tuned replacement for `grep` + `find` over the issue tracker.

## Relationship to site-wide search

The site-wide-search issue (`2026-04-19-site-wide-search`) already designs a full Orama-backed `/api/search` engine with an agent skill (`subtasks/05_ai-search-api.md`). When that lands, this script becomes the **offline / fast-path fallback** — same query shape, same filter vocabulary, no dev server required. Until then, this script is the primary tool.

## Scope of the upgrade

### New `--search <regex>` flag (first-class)

- Regex applies to **title + body + comment bodies + subtask bodies + note bodies + agent-log bodies** by default. `--search-fields title,body` to narrow.
- Case-insensitive by default; `--case-sensitive` to flip.
- Returns exact file paths + line numbers + excerpts so the agent can `Read` them directly — not just issue IDs.
- Output format additions:
  - Default: `id<TAB>status<TAB>title<TAB>match-path:line<TAB>excerpt`
  - `--json`: includes `matches: [{ path, line, snippet }]` per issue
  - `--paths-only`: bare list of file paths (escape hatch for the rare case where the user wants to grep manually with PCRE / multi-line / lookbehinds — features the script doesn't expose)

### Why `--search` is first-class, not a separate `grep` step

Token + latency math: a "filter, then I call Grep on the paths" two-step costs **~3× the tokens and ~2× the wall-clock** of one combined call (50 paths into context → I construct Grep call → process results = 2 round-trips, each with model-decide latency). Bundling search inside `list.mjs` keeps the hot path to a single tool call with structured JSON output.

### Search backend — three-tier ladder

The script picks the fastest available backend at startup:

1. **`rg` (ripgrep) on PATH** → one ripgrep call over candidate paths. Fastest; rust regex (finite-automata, no backtracking blowups), parallelism for free.
2. **`grep` on PATH** → one `grep -E -n` call with all candidate paths as args. POSIX-required, available on Linux / macOS / WSL / Git Bash. Note: pass paths in one call, not fan-out — `grep` handles multi-file natively, no subprocess fan-out needed.
3. **Neither** (native Windows cmd / minimal containers) → pure async JS fallback using `Promise.all` + `fs.readFile` + JS regex. Works everywhere bun/node runs.

### One-time install hint (runtime-only, not in the skill prompt)

**Important: this lives in the JS script, never in the skill body / `references/issue-layout.md`.** Putting install instructions in the skill text would burn tokens on every conversation that loads the skill, even when `rg` is already installed and the hint is irrelevant. The script knows at runtime whether the hint applies; the skill doesn't need to.

When the script lands on tier 2 or 3, print to **stderr** (so it doesn't pollute stdout JSON), once per process. Detect `process.platform` and show the platform-appropriate command:

```
tip: ripgrep is not installed — using grep fallback (works, but ~10× slower on large corpora).
     install for the fast path:

  macOS         brew install ripgrep
  Ubuntu/Debian sudo apt install ripgrep
  Fedora        sudo dnf install ripgrep
  Arch          sudo pacman -S ripgrep
  Alpine        apk add ripgrep
  Windows       winget install BurntSushi.ripgrep.MSVC
                  (or: choco install ripgrep, or: scoop install ripgrep)
  other         https://github.com/BurntSushi/ripgrep#installation

  suppress this hint: pass --quiet-tips or set DOCS_SKILL_QUIET_TIPS=1
```

Detection logic: `process.platform === 'darwin' | 'linux' | 'win32'`. For Linux, show all four common package managers (don't try to guess the distro — listing them is cheap and removes a class of "wrong instruction" failure modes). Once `rg` is on PATH, the hint goes silent automatically.

Same pattern when `grep` is also missing (tier 3 / pure JS): mention that grep is the universal fallback and is also worth installing — though on most systems missing grep is unusual.

### New filter dimensions

Aligned with the per-issue vocabulary surfaced by the tracker's root `settings.json`. The script reads vocabulary dynamically — adding a new vocab field doesn't require a code change.

- `--assignee <name,unassigned>` — requires the `assignee` field to be added to issue settings (separate vocabulary discussion; see chat 2026-04-25 about "actively being worked on" indicator)
- `--created-after YYYY-MM-DD` / `--created-before YYYY-MM-DD` — uses the date prefix on the issue folder
- `--due-after YYYY-MM-DD` / `--due-before YYYY-MM-DD` — uses `due:` field if present in `settings.json`
- `--subtasks-min N` / `--subtasks-max N` — count of subtasks
- `--has-open-subtasks` / `--has-review-subtasks` (already exists) / `--has-closed-subtasks`
- `--type <bug,feature,…>` — already-existing vocab field, just expose it as a filter flag
- `--scope <path>` — restrict the search to a subfolder (defaults to the whole tracker). Lets the agent target one issue's subfolder for a deep regex scan.

### Other improvements

- `--invert-match` (`-v`) — like `grep -v`, exclude matches.
- `--limit N` — cap result count (useful when the agent expects "top 10").
- Exit code: 0 if matches found, 1 if none — so scripts can `if bun list.mjs --search foo; then …`.

## Skill prompt changes

Update `references/issue-layout.md` (the issue-tracker reference inside `documentation-guide`) so the model is steered hard away from `grep` / `find` for the issue tracker:

> **Do not use `Grep` or `find` on `dynamic_data/data/todo/`.** The `list.mjs` script is the tuned replacement — it knows the schema (vocabulary, subtask states, frontmatter), can combine free-text search with structured filters in one call, and returns exact file paths so you can `Read` precisely. `Grep` only sees text; `list.mjs` sees the schema.
>
> Use `Grep` only for content **outside** the tracker (source code, docs, blog).

### Synonym / paraphrase coverage

The skill description (and the reference's "When to use" section) must list the natural language phrases that should route here. Synonyms / paraphrases the model should recognise as triggers:

- search · find · look up · locate · grep · scan · query · lookup
- filter · narrow · restrict · scope · slice · subset
- "issues mentioning X" · "issues about X" · "issues touching X" · "issues that talk about X"
- "show me X-priority Y-status issues" · "list bugs assigned to Z" · "what's in review"
- "where is X discussed in the tracker"

The reason for the explicit list: a sparse description leaves the model second-guessing whether `Grep` is faster. Spelling out the vocabulary makes the routing decision automatic.

## Acceptance criteria

- `list.mjs --search "<regex>"` returns issues + match locations + excerpts
- `--paths-only` output is greppable / pipe-friendly
- All existing filters still work; combining `--search` with filters is AND-composed
- Date and subtask-count filters work
- `references/issue-layout.md` explicitly tells the model to prefer `list.mjs` over `Grep`/`find` for the tracker, with the synonym list above
- Exit code semantics implemented (0 found / 1 not found / 2 usage error)
- Help output (`--help`) covers every flag with one-line examples

## Out of scope

- Implementing the `assignee` field schema change — that's a separate vocabulary decision (see chat 2026-04-25). This subtask only adds the filter flag; if the field is missing from issues, the filter is a no-op.
- Replacing `list.mjs` with the site-wide-search HTTP API — that's the upstream win, owned by `2026-04-19-site-wide-search/subtasks/05_ai-search-api.md`. This script remains the offline fallback after that lands.
- Indexing / caching — the `_index.json` indexer is owned by `2026-04-10-issues-layout/subtasks/04_remaining-polish.md` line 11. If/when it lands, this script can read the index for speed; until then, the live walk is fine at current scale (~50 issues).
