#!/usr/bin/env python3
"""Migrate the legacy `done:` subtask frontmatter field to canonical `state:`.

Authored: 2026-06-22. Brings content to the engine version in this filename.

The documentation-template issue tracker once carried a boolean `done:` field on
subtask markdown frontmatter alongside the 4-state `state:` field
(`open | review | closed | cancelled`). `state:` is now the sole source of truth:
the loader reads `state:` first and only ever fell back to `done:` when `state:`
was missing, and the completion boolean it exposes is re-derived from `state:`.
`done:` is therefore dead weight. This migration removes it everywhere.

What it does to each markdown file's frontmatter:

  * `done: true`  -> ensure `state: closed` (only when no `state:` is present),
  * `done: false` -> ensure `state: open`   (only when no `state:` is present),
  * when a `state:` line is ALREADY present, `state` wins -> just drop the
    redundant `done:` line and leave `state` untouched,
  * in every case the `done:` line is removed.

It is idempotent: re-running after a successful migrate finds zero `done:` lines
and changes nothing.

This is a pure Python standard-library script (no PyYAML) — it works on the
frontmatter line-by-line so it preserves the rest of the file (key order,
blank lines, body) exactly. It only understands the simple `key: value` flow
frontmatter the tracker uses; it is deliberately conservative.

USAGE
-----
Three capabilities, selected by the first positional argument:

    # 1. detect — count files that still carry a `done:` field
    python3 2026-06-22_done-to-state.py detect <path>

    # 2. locate — list every offending file + the line number and value
    python3 2026-06-22_done-to-state.py locate <path>

    # 3. migrate — rewrite frontmatter (add --dry-run to preview, change nothing)
    python3 2026-06-22_done-to-state.py migrate <path> [--dry-run]

`<path>` may be a single .md file, an issue folder, or a whole section folder
(e.g. data/todo/) — directories are scanned recursively for *.md files.

Recommended flow:

    detect <root>            # how big is it?
    locate <root>            # exactly where?
    migrate <root> --dry-run # preview the rewrites
    migrate <root>           # apply
    detect <root>            # expect 0 (idempotency check)
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

# Matches a frontmatter fence delimiter (--- on its own line).
FENCE = "---"
# Matches `done: <value>` at the start of a frontmatter line (tolerant of
# surrounding whitespace and an optional trailing comment).
DONE_RE = re.compile(r"^\s*done\s*:\s*(?P<value>true|false)\s*(?:#.*)?$", re.IGNORECASE)
STATE_RE = re.compile(r"^\s*state\s*:\s*(?P<value>\S+)\s*(?:#.*)?$", re.IGNORECASE)


@dataclass
class DoneHit:
    """One `done:` frontmatter line found in a file."""

    path: Path
    line_no: int          # 1-based line number within the file
    value: str            # "true" / "false"
    has_state: bool       # whether a `state:` line also exists in the frontmatter


def _split_frontmatter(text: str) -> tuple[list[str] | None, int]:
    """Return (frontmatter_lines, start_index) or (None, -1) if no frontmatter.

    `start_index` is the line index (0-based) of the first frontmatter line
    after the opening fence, so callers can map to absolute line numbers.
    """
    lines = text.splitlines()
    if not lines or lines[0].strip() != FENCE:
        return None, -1
    for i in range(1, len(lines)):
        if lines[i].strip() == FENCE:
            return lines[1:i], 1
    return None, -1  # unterminated frontmatter — treat as none


def scan_file(path: Path) -> list[DoneHit]:
    """Find every `done:` frontmatter line in a single markdown file."""
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return []
    fm, start = _split_frontmatter(text)
    if fm is None:
        return []
    has_state = any(STATE_RE.match(line) for line in fm)
    hits: list[DoneHit] = []
    for offset, line in enumerate(fm):
        m = DONE_RE.match(line)
        if m:
            hits.append(
                DoneHit(
                    path=path,
                    line_no=start + offset + 1,  # +1 for the opening fence, +1 for 1-based
                    value=m.group("value").lower(),
                    has_state=has_state,
                )
            )
    return hits


def iter_markdown(path: Path):
    """Yield every markdown file at or under `path`."""
    if path.is_file():
        if path.suffix == ".md":
            yield path
        return
    yield from sorted(path.rglob("*.md"))


def collect_hits(root: Path) -> list[DoneHit]:
    hits: list[DoneHit] = []
    for md in iter_markdown(root):
        hits.extend(scan_file(md))
    return hits


def migrate_file(path: Path, dry_run: bool) -> bool:
    """Rewrite one file's frontmatter. Returns True if it would change / changed."""
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return False
    fm, _ = _split_frontmatter(text)
    if fm is None:
        return False
    if not any(DONE_RE.match(line) for line in fm):
        return False  # nothing to do — idempotent no-op

    has_state = any(STATE_RE.match(line) for line in fm)

    lines = text.splitlines(keepends=True)
    out: list[str] = []
    # Track whether we've already emitted a synthesized `state:` line so we add
    # at most one (only relevant when no state existed and there's a done line).
    state_added = has_state
    in_fm = False
    fm_fence_seen = 0

    for line in lines:
        stripped = line.strip()
        if stripped == FENCE:
            fm_fence_seen += 1
            in_fm = fm_fence_seen == 1
            out.append(line)
            continue

        if in_fm:
            m = DONE_RE.match(line)
            if m:
                # Drop the done line. If no state present anywhere, synthesize
                # the equivalent state from the done value in its place (once).
                if not state_added:
                    val = m.group("value").lower()
                    new_state = "closed" if val == "true" else "open"
                    newline = "\n" if line.endswith("\n") else ""
                    out.append(f"state: {new_state}{newline}")
                    state_added = True
                # else: state already present -> just drop the done line.
                continue

        out.append(line)

    new_text = "".join(out)
    if new_text == text:
        return False
    if not dry_run:
        path.write_text(new_text, encoding="utf-8")
    return True


def cmd_detect(root: Path) -> int:
    hits = collect_hits(root)
    files = {h.path for h in hits}
    print(f"done-to-state: scanned under {root}")
    print(f"  files with `done:` : {len(files)}")
    print(f"  `done:` lines      : {len(hits)}")
    if hits:
        redundant = sum(1 for h in hits if h.has_state)
        print(f"  of those, redundant (state: already present): {redundant}")
        print(f"  semantic (no state: -> derive from done)    : {len(hits) - redundant}")
    return 0 if not hits else 0  # detect always exits 0; it's a report


def cmd_locate(root: Path) -> int:
    hits = collect_hits(root)
    if not hits:
        print(f"done-to-state: no `done:` lines found under {root}")
        return 0
    print(f"done-to-state: {len(hits)} `done:` line(s) under {root}\n")
    for h in sorted(hits, key=lambda x: (str(x.path), x.line_no)):
        kind = "redundant (state present)" if h.has_state else "semantic (no state)"
        print(f"  {h.path}:{h.line_no}  done: {h.value}   [{kind}]")
    return 0


def cmd_migrate(root: Path, dry_run: bool) -> int:
    changed: list[Path] = []
    for md in iter_markdown(root):
        if migrate_file(md, dry_run=dry_run):
            changed.append(md)
    verb = "would change" if dry_run else "changed"
    print(f"done-to-state: {verb} {len(changed)} file(s) under {root}")
    for p in changed:
        print(f"  {'[dry-run] ' if dry_run else ''}{p}")
    if dry_run and changed:
        print("\nRe-run without --dry-run to apply.")
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Migrate the legacy `done:` subtask field to canonical `state:`.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_detect = sub.add_parser("detect", help="count files still carrying `done:`")
    p_detect.add_argument("path", type=Path)

    p_locate = sub.add_parser("locate", help="list every `done:` line with file + line number")
    p_locate.add_argument("path", type=Path)

    p_migrate = sub.add_parser("migrate", help="rewrite frontmatter (--dry-run to preview)")
    p_migrate.add_argument("path", type=Path)
    p_migrate.add_argument("--dry-run", action="store_true", help="report only, change nothing")

    args = parser.parse_args(argv)

    root: Path = args.path
    if not root.exists():
        print(f"error: path does not exist: {root}", file=sys.stderr)
        return 2

    if args.command == "detect":
        return cmd_detect(root)
    if args.command == "locate":
        return cmd_locate(root)
    if args.command == "migrate":
        return cmd_migrate(root, dry_run=args.dry_run)
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
