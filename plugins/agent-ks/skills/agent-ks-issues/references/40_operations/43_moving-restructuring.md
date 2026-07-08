# Moving & restructuring the tracker

How to rename / move items and reshape issues without breaking links or losing history.

## `agent-ks move` — link-aware moves on the tracker

Issues, subtasks, notes, and comments cross-link each other with **relative** paths. A plain `mv` / `git mv` moves the file but leaves every relative link pointing at the old location — inbound links from sibling files break, and relative links *inside* the moved file now resolve from the wrong directory. Nothing warns you; the build still passes.

Use **`agent-ks move`** (on your `PATH` after install) instead — a link-aware move, the same move-and-update-links behaviour an editor like Obsidian does. It operates on the whole content root, so it works on tracker paths just like docs paths.

```bash
agent-ks move <from> <to> [--dry-run] [--no-git] [--root <dir>]
```

- `<from>` may be a single `.md` file **or** a folder (moved recursively, all depths).
- **Inbound** — every file whose relative link resolved to the moved target is repointed at the new location (`#anchor` fragments preserved).
- **Outbound** — relative links *inside* the moved files that pointed at targets which did **not** move are recomputed from the new directory. Links between two files that moved together stay correct automatically.
- `--dry-run` — print the planned move + every link edit (`file:line  old → new`), change nothing. **Run this first when reorganising.**
- `--no-git` — force a plain filesystem move; by default it uses `git mv` so history follows the file.

```bash
# rename a subtask (preview first)
agent-ks move 2026-04-19-foo/subtasks/02_bar.md 2026-04-19-foo/subtasks/02_baz.md --dry-run

# regroup: move a flat subtask into a grouping folder, fixing links on both sides
agent-ks move 2026-04-19-foo/subtasks/05_styles.md \
          2026-04-19-foo/subtasks/020_polish/010_styles.md
```

It prints `moved <N> file(s); rewrote <M> link(s) across <K> file(s)` on success.

> **Renumbering:** when two neighbours have no gap left (you must insert between `010_` and `011_`), re-prefix with `agent-ks move` rather than `mv` — it re-points links as it renumbers. If a gap exists, just use the in-between number; no move needed (that's the whole point of gap-spacing — see [23_subtasks.md](../20_sections/23_subtasks.md)).

## Restructuring patterns

### Promote a subtask to its own issue

The core move of the **phase/index pattern** ([64_phase-index.md](../60_examples/64_phase-index.md)): a parked subtask is a lightweight pointer until work begins, then it graduates to a full issue.

1. Create the new issue folder (`<YYYY-MM-DD>-<slug>/`) with its own `settings.json` + `issue.md` (see [42_updating.md](42_updating.md)). Carry the subtask's framing into `issue.md`.
2. **Leave the original subtask in place** as the index entry, but update it to point at the new issue (`Promoted to <new-issue-id>`) and flip its status to `review`/`done` as appropriate — the index issue stays the roadmap.
3. Use `agent-ks move` for any notes that should travel from the parent into the new issue so their links survive.

### Split an issue

When an issue has grown two distinct responsibilities: create the second issue, `agent-ks move` the relevant `notes/` and `subtasks/` into it, and add a comment in each pointing at the other. Don't silently delete content — the recorded reasoning is the value.

### Merge issues

When two issues turn out to be the same work (often caught by the duplicate check too late): pick the canonical one, `agent-ks move` the other's `notes/`/`subtasks/` into it, add a comment summarising the merge, and `dropped`-with-a-comment the now-empty duplicate (never just delete it — see [21_comments.md](../20_sections/21_comments.md); the `dropped` flip itself is human-only).

### Regroup subtasks

Wrapping a flat list into grouping folders (or the reverse): `agent-ks move` each leaf into/out of the `NN_<group>/` folder. Add an optional folder `settings.json` (`{ "title": "..." }`) if the group slug doesn't read cleanly as a label.

> **Don't rewrite history.** `comments/` and `agent-log/` are append-only. Restructuring moves *plan* and *reference* material (issues, subtasks, notes); it never edits a past comment or iteration in place.
