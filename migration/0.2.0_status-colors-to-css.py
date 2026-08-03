#!/usr/bin/env python3
"""Move status colours out of tracker settings and into theme CSS.

Authored 2026-08-03.

WHAT CHANGED
------------
Status colours used to be configurable per tracker, under a top-level
`statusColors` map in the tracker's root settings file:

    "statusColors": {
      "done":    "#7ec699",
      "dropped": "#e06c75"
    }

They are now **theme CSS variables** — one per status, in the theme's
`color.css`:

    :root                { --status-done: #16a34a; --status-dropped: #dc2626; }
    [data-theme="dark"]  { --status-done: #7ec699; --status-dropped: #e06c75; }

Three things were wrong with the JSON arrangement, and CSS fixes all three:

1. **One value served both colour modes.** The shipped hexes were dark-mode
   colours rendered unchanged on a light background. JSON had nowhere to put a
   second value; CSS has `[data-theme="dark"]`.
2. **The resolved map had to be threaded as a prop** to every surface that
   draws a status — sidebar, badges, plan table, subtask page, the Guide.
3. **A second copy of the palette drifted.** The bundled Guide hand-wrote its
   own tint map and disagreed with the real one on two statuses for as long as
   both existed.

The status *names* were already fixed in framework code and are unchanged. What
this migration removes is the ability to override their *colours* from settings.

WHY THIS IS A HARD ERROR AND NOT A SILENT IGNORE
------------------------------------------------
The loader now REJECTS a leftover `statusColors` block rather than ignoring it,
matching how `fields.status` is already handled. A tracker that kept a working
override and silently lost it would render different colours with no signal —
the failure would surface as "the colours look wrong somehow", weeks later, with
nothing pointing at the cause. A build that stops and names the file is strictly
better than a build that quietly changes what you see.

Most trackers will find the block is identical to the framework defaults it was
copied from, in which case deleting it changes nothing visually and the whole
migration is a no-op you can confirm in one run.

WHAT THIS SCRIPT DOES
---------------------
Finds every tracker root settings file (`settings.json` / `settings.jsonc`)
carrying a top-level `statusColors` map, reports each with its file and line,
and removes the block.

**It reports any NON-DEFAULT colour it is about to delete**, with the status and
the hex, so a tracker that had genuinely customised its palette gets told what
to re-declare in CSS instead of discovering the loss on screen. That report is
the point of the script; the deletion is the easy half.

JSON is edited **textually**, never through a `json.loads`/`dumps` round-trip:
tracker roots are conventionally `.jsonc` with comments and trailing commas, and
a round-trip would silently destroy both.

USAGE
-----
    python3 migration/0.2.0_status-colors-to-css.py detect  [--root .]
    python3 migration/0.2.0_status-colors-to-css.py migrate [--root .] [--dry-run]
    python3 migration/0.2.0_status-colors-to-css.py verify  [--root .]

`detect` changes nothing. `migrate --dry-run` prints the exact edits. `migrate`
is idempotent — a second run finds zero. `verify` exits non-zero if any
`statusColors` block remains.
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

# The framework defaults at the moment colours moved to CSS. A block matching
# these exactly is a copy of the defaults and can be deleted with no visual
# change; anything else is a real customisation and gets reported loudly.
DEFAULTS = {
    "open": "#888888",
    "blocked": "#d1854f",
    "in-progress": "#61afef",
    "input-needed": "#e8a54b",
    "review": "#f0c674",
    "done": "#7ec699",
    "dropped": "#e06c75",
}

# Historic default for `dropped`, before it was changed to red in the same
# release. A tracker still carrying the magenta is echoing an old default rather
# than expressing a preference, so it is not reported as a customisation.
SUPERSEDED_DEFAULTS = {"dropped": {"#c678dd"}}

SETTINGS_NAMES = ("settings.json", "settings.jsonc")

# Matches the whole `"statusColors": { … }` member including a trailing comma.
# Non-greedy to the first closing brace: the map's values are strings, so it
# cannot legitimately contain a nested object.
BLOCK_RE = re.compile(
    r'[ \t]*"statusColors"[ \t]*:[ \t]*\{.*?\}[ \t]*,?[ \t]*\r?\n?',
    re.DOTALL,
)
ENTRY_RE = re.compile(r'"(?P<status>[a-z-]+)"\s*:\s*"(?P<hex>#[0-9A-Fa-f]{3,8})"')


@dataclass
class Hit:
    path: Path
    line_no: int
    entries: dict[str, str]
    custom: dict[str, str] = field(default_factory=dict)


def _is_tracker_root_settings(path: Path) -> bool:
    """A tracker root settings file, not an issue's or an agent log's.

    The distinguishing mark is a top-level `statusColors` key — per-issue and
    per-agent-log settings never carry one. Checking for the key rather than
    guessing at folder depth keeps this correct for trackers at any path.
    """
    return path.name in SETTINGS_NAMES


def find_hits(root: Path) -> list[Hit]:
    hits: list[Hit] = []
    for path in sorted(root.rglob("settings.json*")):
        if not _is_tracker_root_settings(path):
            continue
        if any(part in {"node_modules", "dist", ".git"} for part in path.parts):
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        m = BLOCK_RE.search(text)
        if not m:
            continue
        entries = {e.group("status"): e.group("hex") for e in ENTRY_RE.finditer(m.group(0))}
        custom = {
            s: h
            for s, h in entries.items()
            if h.lower() != DEFAULTS.get(s, "").lower()
            and h.lower() not in {v.lower() for v in SUPERSEDED_DEFAULTS.get(s, set())}
        }
        line_no = text[: m.start()].count("\n") + 1
        hits.append(Hit(path=path, line_no=line_no, entries=entries, custom=custom))
    return hits


def _report(hits: list[Hit], root: Path) -> None:
    if not hits:
        print("No `statusColors` blocks found — nothing to migrate.")
        return
    print(f"{len(hits)} file(s) carry a `statusColors` block:\n")
    for h in hits:
        rel = h.path.relative_to(root)
        print(f"  {rel}:{h.line_no} — {len(h.entries)} colour(s)")
        if h.custom:
            print("    !! NON-DEFAULT — re-declare these in your theme's color.css:")
            for status, hexv in sorted(h.custom.items()):
                print(f"       --status-{status}: {hexv};")
        else:
            print("    all values match the framework defaults — safe to delete")
    if any(h.custom for h in hits):
        print(
            "\n  Put the lines above inside `:root` (and/or `[data-theme=\"dark\"]`)\n"
            "  in your theme's color.css. CSS lets the two modes differ, which the\n"
            "  JSON map could not express."
        )


def cmd_detect(root: Path) -> int:
    _report(find_hits(root), root)
    return 0


def cmd_migrate(root: Path, dry_run: bool) -> int:
    hits = find_hits(root)
    _report(hits, root)
    if not hits:
        return 0
    print()
    changed = 0
    for h in hits:
        text = h.path.read_text(encoding="utf-8")
        new_text, n = BLOCK_RE.subn("", text, count=1)
        if not n:
            continue
        rel = h.path.relative_to(root)
        if dry_run:
            print(f"  would rewrite {rel} (drop {len(h.entries)} colour(s))")
        else:
            h.path.write_text(new_text, encoding="utf-8")
            print(f"  rewrote {rel} (dropped {len(h.entries)} colour(s))")
        changed += 1
    print(f"\n{'would rewrite' if dry_run else 'rewrote'} {changed} file(s)")
    # A `.jsonc` tracker root usually documents its own blocks in comments, and
    # deleting the block leaves the paragraph describing it behind — still
    # advertising a feature that is now a hard error. This script will not guess
    # at which comment belonged to it, so it says so instead of leaving the
    # reader to find out from a stale file.
    if changed and not dry_run:
        print(
            "\n  CHECK THE COMMENTS around where the block was. A settings file that\n"
            "  documented `statusColors` in prose still does — describing a key that\n"
            "  now fails the build. The block is gone; the paragraph above it is not."
        )
    return 0


def cmd_verify(root: Path) -> int:
    hits = find_hits(root)
    if hits:
        print(f"FAIL — {len(hits)} file(s) still carry a `statusColors` block:")
        for h in hits:
            print(f"  {h.path.relative_to(root)}:{h.line_no}")
        return 1
    print("OK — no `statusColors` blocks remain.")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("detect", "migrate", "verify"):
        p = sub.add_parser(name)
        p.add_argument("--root", default=".", help="tree to scan (default: cwd)")
        if name == "migrate":
            p.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    root = Path(args.root).resolve()
    if args.cmd == "detect":
        return cmd_detect(root)
    if args.cmd == "migrate":
        return cmd_migrate(root, args.dry_run)
    return cmd_verify(root)


if __name__ == "__main__":
    sys.exit(main())
