---
title: "Iteration 3 — error ↔ migration ↔ guide.ts coherence audit"
iteration: 3
status: success
---

## Goal

One Opus agent, read-only: walk the full error-to-resolution path a real user
hits when their tracker violates the v0.7.0 root-settings schema — every
vocabulary error message in `issue-status.ts`/`issues.ts`, the same three rules
in CLI `check.mjs`, the merged migration script's `detect`/`guide`/`verify`
subcommands (traced line-by-line), the bundled `guide.ts` panel, and the older
`2026-07-02_state-to-status.py`'s cross-references.

## Result — 5 findings (1 logic gap, 3 message/path issues, 1 stale label)

1. **Unfindable migration path — 4 sites** (misleading). The three new hard
   errors cited the fix script as bare `migration/2026-07-03_root-settings-schema.py`
   (`issue-status.ts:160`, `issues.ts:422`, `check.mjs:139`, `check.mjs:156`) —
   a user at repo root can't locate that fragment. The sibling legacy-status
   error already used the full `plugins/documentation-guide/...` prefix; the new
   ones should match.
2. **`guide` subcommand gap** (logic). `cmd_guide`'s facet-A output was gated on
   an old `fields.status` block being present. A tracker already on the new
   shape but carrying a **typo'd `statusColors` key** — which hard-fails the
   build and which `detect`/`verify` DO flag — got "already on the v0.7.0
   schema — nothing to do" from `guide`. A clean bill for a hard-fail state.
3. **`unknownStatusColorMessage` doesn't cite the migration** (minor) — in both
   `issue-status.ts:166` and `check.mjs:144`, even though facet A covers exactly
   this case; the other two rules do cite it.
4. **`guide.ts:90` stale legacy field name** — the ideal-shape ASCII diagram
   said `← title + state frontmatter`; the field was renamed `status`
   (the same file's own Subtasks table already said `status`).
5. **`guide.ts` hand-copies the vocabulary** (drift risk). `issue-status.ts`'s
   docstring claims guide.ts consumes the module, but guide.ts imported nothing
   from it — the 7/4 vocabulary was restated as prose. Content currently
   matches; the next lifecycle change could silently drift.

Also noted, deferred as a nit: the per-issue (not root) status-error fileHint
hardcodes `settings.json` where an issue authored as `.jsonc` would get the wrong
extension in the hint (`issues.ts:617`) — root vocabulary hint is correct.

Verified correct (highlights): root fileHint via `resolveSettingsPath` (`.jsonc`
wins); suggested-fix JSON in every message passes the validator; `check.mjs`
rules match the loader exactly with errors → exit 1; migration docstring quotes
the real hard errors verbatim; `detect`/`verify` behave as documented and
`verify` exits 1 on either facet; `guide` emits valid JSONC and hoists only
non-default colours; `.json`/`.jsonc` precedence matches the loader; the
2026-07-02 script claims no root-settings scope and its cross-reference is
accurate; zero hits repo-wide for the two deleted migration filenames outside
correctly-historical tracker records.

## Next

Findings 1–4 + the fileHint nit fixed in the fix wave (milestone 105); finding 5
addressed by generating the guide.ts lifecycle section from the imported
constants so it can no longer drift.
