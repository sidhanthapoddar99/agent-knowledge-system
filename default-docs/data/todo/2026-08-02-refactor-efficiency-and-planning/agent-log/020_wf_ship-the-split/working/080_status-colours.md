---
title: "Status colours — out of settings, into the theme"
status: done
agent: claude
---

# Goal

Sid asked why `dropped` rendered magenta, where the palette was defined, and
whether it was per-issue or global. Answering that surfaced a design problem
rather than a preference: the seven statuses are fixed in framework code, but
their **colours** were a per-tracker `settings.json` override — so a tracker
could recolour a vocabulary it could not otherwise change, and two trackers
could disagree about what `done` looks like.

The round ends with colours defined exactly once, in theme CSS, and with every
surface that shows a status actually tinted.

# Inputs

- Sid, in session: *"Keep it simple. Put it as red. Don't use magenta."*
- Sid, on where the definition belongs: *"Make colors as well nonoverridable.
  Like, it can be overridden by CSS… you also put the colors inside the default
  theme. In the color CSS."*
- The canonical vocabulary: `astro-doc-code/src/loaders/issue-status.ts`
- The theme contract: `astro-doc-code/src/styles/theme.yaml` →
  `required_variables`

# Expected Outcome

One definition of the palette, reachable by a theme and by nothing else; the
`settings.json` route removed loudly rather than ignored; a migration for
trackers that already carry the old block; and the skill and user-guide updated
so nobody is taught the retired route.

# Outcome

Five commits. Four of them are the palette move; the fifth is a rendering tail
that the first four missed.

| Commit | What it did |
|---|---|
| `4b45132` | `dropped` → red, and the Guide stopped carrying its own hand-written copy of the palette |
| `79b168e` | `RUN_STATUSES` — the five that mean something on a run — and the Guide's agent-log table tinted from the real map |
| `ff0d054` | The palette moved to `color.css`; `statusColors` in `settings.json` became a hard error; migration `0.1.3` ships |
| `c212a98` | The `NNN_` prefix number in the sidebar is tinted by the file's own status, and a `dropped` round must carry a callout |
| this round | The agent-log page header chip — the last surface still keyed to the retired vocabulary |

## The Guide had drifted, and that is why it was deleted rather than corrected

`guide.ts` held `STATUS_TINTS`, a hand-written map of the seven colours, written
so the Guide panel could render swatches. It disagreed with the real palette on
**two** of seven — `dropped` and `blocked`. Nothing could have caught that: two
independent lists of the same seven facts, with no code path comparing them.

So the fix was not to correct the numbers. `statusTable()` and the new
`runStatusTable()` now take the resolved map as an argument, and the second copy
is gone. This is the same move as a plan stage reading its subtasks' live status
instead of storing a duplicate — recorded in
[`050`](./050_migration-and-vocabulary.md) for the `iteration:` field, and it is
the same defect one level up.

## Why the override had to become an ERROR, not a silent ignore

Deleting the `statusColors` handling would have left every existing tracker's
block sitting in `settings.json`, read by nothing, looking authoritative. A
reader editing it to change a colour would get no colour change and no message.

`statusColorsForbiddenMessage()` throws at load with the file name and the
replacement route. It is the *"failing loudly over a plausible wrong answer"*
tie-breaker applied literally.

**`statusColors` stays in `TRACKER_ROOT_KEYS`.** Removing it from that list was
tried and reverted: the validator then reported the key twice — once as
forbidden, once as an unrecognised key — for one problem. A control run is what
showed this; the second message is not a second finding.

## Migration `0.1.3_status-colors-to-css.py`

`detect` / `migrate --dry-run` / `verify`, Python stdlib only, and the JSON is
edited **textually** because the tracker root is a `.jsonc` whose comments a
`json.loads`/`dumps` round-trip would destroy.

It **reports non-default colours before deleting them**, so a tracker that had
genuinely customised its palette learns what it is losing and where to put it
instead. `SUPERSEDED_DEFAULTS` carries the old magenta `#c678dd` for `dropped`,
so a tracker still on the pre-red default is not reported as a custom colour it
never chose.

**Control-tested.** A crafted fixture with one custom colour (`#00ff00`), one
superseded default (`#c678dd`) and one live default (`#888888`) — the detector
reported exactly the first, which proves it can tell the three apart rather than
reporting everything or nothing.

**It also warns about the comment left behind.** The first run on this repo's own
`default-docs/data/todo/settings.jsonc` deleted the block and left the comment
above it still advertising the feature. That was fixed in the file and turned
into a warning in the script, because a migration that removes a feature and
leaves its documentation in place has told the next reader the opposite of the
truth.

## The rendering tail — found by Sid, not by any gate

Sid opened `073_verdict-sol.md` and asked why the `status: done` at the top of a
working-folder file had no colour.

`AgentLogPage.astro` set `issue-log__chip--status is-<status>`, and `detail.css`
carried exactly three rules for it:

```css
.issue-log__chip--status.is-success  { … }
.issue-log__chip--status.is-failed   { … }
.issue-log__chip--status.is-in-progress { … }
```

`success` and `failed` are **retired values** — the migration in
[`050`](./050_migration-and-vocabulary.md) rewrote them to `done` and `dropped`
across 75 files. So two of the three rules had been dead since that migration
ran, and every `done`, `dropped`, `open` and `input-needed` chip rendered as
neutral grey. The build never complains about a CSS selector that matches
nothing, and the validator checks frontmatter values, not stylesheets.

**A colour keyed to a value that no longer exists fails silently and looks
deliberate.** That is worth stating plainly, because it is the same shape as the
`STATUS_TINTS` drift above: a second place holding the same facts, with nothing
comparing them.

The fix converges the chip on the treatment `SubtaskPage`, `PlanPage` and
`PlanStagePage` already use — the status chip sets `--badge-color` inline from
the resolved map, and the chips with no status (agent, date) fall through to the
neutral default. The three vocabulary-keyed rules are gone, so there is no list
to drift.

### Proof it works, and proof it could have failed

Counted over the whole 948-page build:

| Chip | Count |
|---|---:|
| tinted `var(--status-done)` | 99 |
| tinted `var(--status-open)` | 2 |
| tinted `var(--status-dropped)` | 2 |
| tinted `var(--status-input-needed)` | 1 |
| tinted `var(--status-in-progress)` | 1 |
| **untinted chip whose text is a status word** | **0** |

The last row is the control. If the map lookup had silently returned
`undefined` — the exact failure this replaces — the chips would still render,
still read `done`, and land in that row. It is zero, and five distinct statuses
resolved, so the lookup is doing work rather than falling back uniformly.

## Gate

| Check | Result |
|---|---|
| `./start build` | clean, **948 pages** |
| `agent-ks check issues` (repo's own `check.mjs`, run under `bun`) | 51 issue folders, **2 long-standing warnings**, no errors |

**The repo's own `check.mjs` will not run under `node`** — `gray-matter` is not
resolvable from `plugins/`, and there is no root `package.json`. `bun` resolves
it. The `agent-ks` on `PATH` is the *installed plugin*, which predates this work
and warns about the now-retired `iteration:` field on every migrated file; those
warnings are the stale plugin, not a regression. Use `bun` and the repo copy.

## Where the colours live now

`astro-doc-code/src/styles/color.css`, seven `--status-*` tokens in `:root` and
seven more under `[data-theme="dark"]`, and declared in `theme.yaml` →
`required_variables.colors` so a theme that omits them is caught. Everything
downstream — the Guide, the sidebar prefix numbers, the subtask and plan badges,
and now the agent-log header chip — reads `STATUS_CSS_VARS`, which is
`var(--status-…)` strings rather than hex.

A theme overrides the palette by redeclaring the tokens. A tracker cannot
override it at all, which was the point.
