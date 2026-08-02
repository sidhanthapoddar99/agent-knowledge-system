#!/usr/bin/env python3
"""Number an agent log's own slots: summary/working/debrief -> 01_/02_/03_.

Authored 2026-08-03.

WHAT CHANGED
------------
An agent-log activity holds three things of its own, plus any number of child
activities. The three used to be identified by NAME:

    agent-log/010_lp_implement/
        summary.md
        working/
        debrief/
        100_wf_codec-migration/     <- a child activity

They are now identified by PREFIX:

    agent-log/010_lp_implement/
        01_summary.md
        02_working/
        03_debrief/
        100_wf_codec-migration/     <- still a child activity

and the read-time rule became arithmetic: **a folder inside an activity whose
numeric prefix is below 100 is one of that run's own slots; 100 or above is a
child activity.**

WHY
---
1. **The read order is now stated where every other section states it.** The
   three slots always had a fixed order — summary, then the rounds, then what
   leaves the run — and the only thing enforcing it was a hand-written
   "pin summary first" rule in the sidebar. That rule is deleted; the prefix
   does the work.
2. **A name list could not admit a fourth slot.** The framework carried
   `new Set(["working", "debrief"])` in two places. A fourth slot meant teaching
   both a fourth name. `04_` needs nothing.
3. **It removed a restriction nobody knew existed.** Under the old rule a child
   activity could not be *called* `working` — it would have been read as the
   parent's slot. That was never written down anywhere.

WHAT THIS SCRIPT DOES
---------------------
For every agent-log activity folder in a tracker:

  * renames `summary.md` -> `01_summary.md`
  * renames `working/`   -> `02_working/`
  * renames `debrief/`   -> `03_debrief/`

and then **rewrites every markdown link in the tracker that pointed at an old
path**, which is the half that actually matters: a tracker of any size has
dozens of `[the run](../agent-log/030_lp_overnight/summary.md)` references, and
a rename without the rewrite converts working links into broken ones.

Links are rewritten TEXTUALLY, matching the renamed path segment anywhere in a
markdown link target. Frontmatter list entries (`agent-logs:` in a plan stage)
are ordinary text to this script and are covered by the same pass — they are the
references most likely to break, because nothing renders them as a link until
the plan page resolves them.

WHAT IT DELIBERATELY DOES NOT DO
--------------------------------
**It does not touch a legacy-shape agent log.** A folder carrying the retired
six-slot layout (`00_goal.md`, `01_summary.md`, `02_task_list.md`, … or `MNN_`
milestone files) is history, is not migrated, and the validator already skips
it. Renaming inside one would half-convert a record that was deliberately left
as written.

The distinguishing mark is `03_working` / `04_benchmark` / `05_notes` or a
`0N_goal` / `0N_task_list` file: the old shape numbered SIX slots, this one
numbers three. A folder with a bare `working/` and a bare `summary.md` is the
current shape and is migrated.

**It does not renumber child activities.** A child already numbered below 100
(`020_wf_sub/` inside `010_lp_parent/`) is REPORTED, not moved: renumbering it
changes its identity, every inbound link, and the order it sorts in, which is a
decision for whoever owns the tracker rather than a mechanical fix. The report
names each one with the command to fix it.

USAGE
-----
    python3 migration/0.1.4_agent-log-slot-numbering.py detect  [--root .]
    python3 migration/0.1.4_agent-log-slot-numbering.py migrate [--root .] [--dry-run]
    python3 migration/0.1.4_agent-log-slot-numbering.py verify  [--root .]

`detect` changes nothing. `migrate --dry-run` prints every rename and every link
edit without touching the disk. `migrate` is idempotent — a second run finds
zero. `verify` exits non-zero if any unnumbered slot remains.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

# name on disk -> what it becomes. Order matters only for reporting.
SLOT_RENAMES = (
    ("summary.md", "01_summary.md", False),   # (old, new, is_dir)
    ("working", "02_working", True),
    ("debrief", "03_debrief", True),
)

# Below this, a folder inside an activity is one of the run's own slots.
CHILD_MIN_PREFIX = 100

# An activity folder: NNN_<code>_<name>. The kind code is two lowercase letters.
ACTIVITY_RE = re.compile(r"^(\d{1,5})_([a-z]{2})_(.+)$")

# Markers of the RETIRED six-slot shape. A folder carrying any of these is a
# historic record and is left exactly as written.
LEGACY_MARKERS = re.compile(
    r"^0\d_(goal|task_list|benchmark|notes)(\.md)?$|^0[3-9]_working$"
)

SKIP_DIRS = {"node_modules", "dist", ".git", ".astro"}


@dataclass
class Rename:
    old: Path
    new: Path
    is_dir: bool


@dataclass
class Report:
    renames: list[Rename] = field(default_factory=list)
    link_edits: list[tuple[Path, int, str, str]] = field(default_factory=list)
    legacy_skipped: list[Path] = field(default_factory=list)
    low_numbered_children: list[Path] = field(default_factory=list)


def _is_legacy_activity(activity: Path) -> bool:
    """True when this folder is a retired six-slot agent log."""
    try:
        names = [e.name for e in activity.iterdir()]
    except OSError:
        return False
    return any(LEGACY_MARKERS.match(n) for n in names)


def _iter_activities(root: Path):
    """Yield every agent-log activity folder under `root`, at any depth.

    An activity is a folder matching NNN_<code>_<name> that sits under an
    `agent-log/` directory. Child activities are yielded too — they have the
    same shape and the same three slots.
    """
    for agent_log in sorted(root.rglob("agent-log")):
        if not agent_log.is_dir():
            continue
        if any(part in SKIP_DIRS for part in agent_log.parts):
            continue
        stack = [agent_log]
        while stack:
            current = stack.pop()
            try:
                entries = sorted(current.iterdir())
            except OSError:
                continue
            for entry in entries:
                if not entry.is_dir():
                    continue
                if ACTIVITY_RE.match(entry.name):
                    yield entry
                    stack.append(entry)
                elif entry.name not in {"02_working", "03_debrief", "working", "debrief"}:
                    # A grouping folder: holds activities rather than being one.
                    stack.append(entry)


def collect(root: Path) -> Report:
    report = Report()
    for activity in _iter_activities(root):
        if _is_legacy_activity(activity):
            report.legacy_skipped.append(activity)
            continue

        for old_name, new_name, is_dir in SLOT_RENAMES:
            old = activity / old_name
            if not old.exists():
                continue
            if old.is_dir() != is_dir:
                continue
            new = activity / new_name
            if new.exists():
                # Already migrated, or a genuine collision. Either way, hands off.
                continue
            report.renames.append(Rename(old=old, new=new, is_dir=is_dir))

        # A child activity numbered into the slot band. Reported, never moved.
        for entry in sorted(activity.iterdir()):
            if not entry.is_dir():
                continue
            m = ACTIVITY_RE.match(entry.name)
            if m and int(m.group(1)) < CHILD_MIN_PREFIX:
                report.low_numbered_children.append(entry)

    return report


# A markdown link target: everything between `](` and the closing paren or the
# first whitespace. Also catches the quoted links inside a plan stage's YAML
# frontmatter, which are ordinary text at this level.
LINK_TARGET_RE = re.compile(r"\]\(([^)\s]+)")
SKIP_TARGET_PREFIXES = ("http://", "https://", "mailto:", "#", "/")


def slot_targets(root: Path) -> list[tuple[Path, str, str]]:
    """(activity folder, old slot, new slot) for every non-legacy activity.

    Derived from the TREE, not from the renames this run happens to plan.

    That distinction is the whole point. An earlier version built this list from
    `report.renames`, which made the link pass a no-op whenever the renames were
    already done — so a run that crashed after renaming could not be finished by
    re-running it, and a tracker with a hand-renamed folder kept its broken
    links forever. Deriving from the tree makes the pass idempotent and makes it
    the repair path for a partial run.
    """
    out: list[tuple[Path, str, str]] = []
    for activity in _iter_activities(root):
        if _is_legacy_activity(activity):
            continue
        for old_name, new_name, _is_dir in SLOT_RENAMES:
            out.append((activity.resolve(), old_name, new_name))
    return out


def _retarget(link: str, md_dir: Path, targets: list[tuple[Path, str, str]]) -> str | None:
    """Rewrite one link target if it points at an old slot. None when it does not.

    **Resolved, not pattern-matched.** The first version anchored a regex on the
    activity FOLDER NAME (`030_lp_overnight/summary.md`), which is precise
    against a decoy like `notes/summary.md` but blind to the commonest case of
    all: a link written from INSIDE the activity, where the folder name does not
    appear at all. `01_summary.md` says `[the round](./working/010_round.md)`,
    and no amount of anchoring on `030_lp_overnight` will see it.

    Resolving the target against the file's own directory answers the real
    question — *does this point into an activity's old slot?* — for links from
    inside and outside alike, and still leaves the decoy alone because
    `notes/summary.md` resolves somewhere no activity owns.
    """
    if link.startswith(SKIP_TARGET_PREFIXES):
        return None
    path_part, sep, anchor = link.partition("#")
    if not path_part:
        return None
    try:
        resolved = (md_dir / path_part).resolve()
    except (OSError, ValueError):
        return None

    for activity, old_name, new_name in targets:
        old_path = activity / old_name
        if resolved == old_path:
            rest: tuple[str, ...] = ()
        else:
            try:
                rest = resolved.relative_to(old_path).parts
            except ValueError:
                continue
        new_abs = activity.joinpath(new_name, *rest)
        try:
            new_rel = os.path.relpath(new_abs, md_dir)
        except ValueError:
            return None
        new_rel = new_rel.replace(os.sep, "/")
        # Preserve the author's leading `./`; relpath drops it.
        if path_part.startswith("./") and not new_rel.startswith((".", "/")):
            new_rel = f"./{new_rel}"
        return f"{new_rel}{sep}{anchor}"
    return None


def rewrite_links(root: Path, dry_run: bool, report: Report | None) -> int:
    """Rewrite every old-slot reference under the CURRENT tree. Idempotent."""
    targets = slot_targets(root)
    if not targets:
        return 0
    changed = 0
    for md in sorted(root.rglob("*.md")):
        if any(part in SKIP_DIRS for part in md.parts):
            continue
        try:
            text = md.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        md_dir = md.parent.resolve()

        def repl(m: re.Match) -> str:
            out = _retarget(m.group(1), md_dir, targets)
            return m.group(0) if out is None else f"]({out}"

        new_text = LINK_TARGET_RE.sub(repl, text)
        if new_text == text:
            continue
        changed += 1
        if report is not None:
            for i, (a, b) in enumerate(zip(text.splitlines(), new_text.splitlines()), start=1):
                if a != b:
                    report.link_edits.append((md, i, a.strip(), b.strip()))
        if not dry_run:
            md.write_text(new_text, encoding="utf-8")
    return changed


def collect_link_edits(root: Path, report: Report) -> None:
    """Populate `report.link_edits` without writing anything."""
    rewrite_links(root, dry_run=True, report=report)


def apply(report: Report, root: Path, dry_run: bool) -> None:
    for r in report.renames:
        print(f"  rename  {r.old.relative_to(root)}  ->  {r.new.name}")
        if not dry_run:
            r.old.rename(r.new)

    # Report from the pre-rename scan…
    by_file: dict[Path, list[tuple[int, str, str]]] = {}
    for path, line_no, before, after in report.link_edits:
        by_file.setdefault(path, []).append((line_no, before, after))
    for path, edits in sorted(by_file.items()):
        print(f"  links   {path.relative_to(root)}  ({len(edits)} edit(s))")
        for line_no, before, after in edits:
            print(f"            {line_no}: {before}")
            print(f"            {line_no}: {after}")

    if dry_run:
        return

    # …but APPLY against a fresh walk of the tree, never the paths collected
    # before the renames.
    #
    # A file that is itself renamed can also CONTAIN a link that needs
    # rewriting — `01_summary.md` points at `./02_working/…` constantly. Reusing
    # the collected path meant opening `…/summary.md` after it had become
    # `…/01_summary.md`, which raised FileNotFoundError partway through the
    # pass: renames all applied, links only partly, and the script exited
    # non-zero on a tree it had half-converted.
    rewrite_links(root, dry_run=False, report=None)


def summarise(report: Report, root: Path) -> None:
    print(f"  {len(report.renames)} slot(s) to number, "
          f"{len(report.link_edits)} link line(s) to rewrite")
    if report.legacy_skipped:
        print(f"\n  {len(report.legacy_skipped)} legacy-shape agent log(s) skipped — "
              f"history stays as written:")
        for p in report.legacy_skipped:
            print(f"    {p.relative_to(root)}")
    if report.low_numbered_children:
        print(f"\n  {len(report.low_numbered_children)} child activity(ies) numbered below "
              f"{CHILD_MIN_PREFIX} — REPORTED, NOT MOVED.")
        print("  Renumbering changes a child's identity and every inbound link, so it is")
        print("  your call. Fix each with the link-aware move:")
        for p in report.low_numbered_children:
            print(f"    agent-ks move {p.relative_to(root)} <parent>/1{p.name[1:] if p.name[0].isdigit() else p.name}")


def main() -> int:
    ap = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    ap.add_argument("command", choices=("detect", "migrate", "relink", "verify"))
    ap.add_argument("--root", default=".", help="tracker or repo root (default: .)")
    ap.add_argument("--dry-run", action="store_true", help="migrate: print, change nothing")
    args = ap.parse_args()

    root = Path(args.root).resolve()
    if not root.is_dir():
        print(f"not a directory: {root}", file=sys.stderr)
        return 2

    report = collect(root)
    collect_link_edits(root, report)

    # `relink` is the repair path: rewrite stale slot references without
    # touching a single file name. Safe to run at any time, including on a
    # tracker whose folders were renamed by hand.
    if args.command == "relink":
        mode = "dry-run" if args.dry_run else "applying"
        print(f"# agent-log slot numbering: relink [{mode}] ({root})")
        fresh = Report()
        n = rewrite_links(root, dry_run=args.dry_run, report=fresh)
        for path, line_no, before, after in fresh.link_edits:
            print(f"  {path.relative_to(root)}:{line_no}")
            print(f"    - {before}")
            print(f"    + {after}")
        print(f"  {n} file(s) {'would be ' if args.dry_run else ''}rewritten")
        return 0

    if args.command == "detect":
        print(f"# agent-log slot numbering: detect ({root})")
        summarise(report, root)
        if report.renames:
            print()
            apply(report, root, dry_run=True)
        return 0

    if args.command == "migrate":
        mode = "dry-run" if args.dry_run else "applying"
        print(f"# agent-log slot numbering: migrate [{mode}] ({root})")
        if not report.renames:
            print("  nothing to do")
            summarise(report, root)
            return 0
        apply(report, root, dry_run=args.dry_run)
        print()
        summarise(report, root)
        return 0

    # verify
    print(f"# agent-log slot numbering: verify ({root})")
    if report.renames:
        print(f"  FAIL — {len(report.renames)} unnumbered slot(s) remain:")
        for r in report.renames:
            print(f"    {r.old.relative_to(root)}")
        return 1
    print("  OK — every agent-log activity numbers its own slots")
    summarise(report, root)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
