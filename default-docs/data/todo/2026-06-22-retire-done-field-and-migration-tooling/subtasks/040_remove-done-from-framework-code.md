---
title: Remove the `done` field from the documentation-template code
state: closed
---

Make `state:` the sole subtask source of truth in the framework. Remove all reading,
writing, and validating of the `done` frontmatter field.

## Touch points (confirmed)

- **`astro-doc-code/src/loaders/issues.ts`**
  - `SubtaskMeta` interface — the `done: boolean` field (~line 125) and the comment "Reads
    `state` first, falls back to `done`".
  - the parse fallback `else if (fm.done === true) { state = 'closed' }` (~559–565) — drop
    it; `state:` (defaulting to `open`) is the only input.
  - the derived `const done = ...` + returning `done` (~569/576).
  - **Layout-consumer check:** a grep shows no layout reads `subtask.done` (only
    `dev-tools/server/middleware.ts:408` touches `done`, and it *deletes* it). Confirm via
    build + grep that dropping the `done` output field breaks nothing; if a consumer surfaces,
    have it derive completion from `state` inline rather than reintroducing the field.
- **`scripts/issues/set-state.mjs`** — stop writing `done:` (the "Subtask flips also keep
  `done:` in sync" block, ~line 50, and the help text mentioning it).
- **`scripts/issues/check.mjs`** — remove `'done'` from `SUBTASK_FM_KEYS`; drop the "or
  legacy `done: true`" acceptance and the `fm.done === undefined` clause in the
  "no `state:`" warning so the validator keys only on `state:`.
- **`dev-tools/server/middleware.ts:408`** — the `delete (data as any).done` line: now that
  nothing writes `done`, this legacy-strip is redundant; remove it (or leave a no-op? prefer
  remove for cleanliness).

## Order / guard

- Runs **after** `030` has migrated existing content, so removing the fallback can't silently
  flip a `done:`-only file to open.
- Keep validator behavior otherwise identical (the `050`-issue refactor put shared logic in
  `_check-lib.mjs`; reuse it).

## Verify

- `grep -rn "done" astro-doc-code/src` returns only unrelated natural-language hits.
- `bun run build` green; run each validator (`docs`/`blog`/`config`/`issues` check) — clean.
- `docs-set-state <issue>/subtasks/NN_x.md closed` writes only `state:` (no `done:`).
