#!/usr/bin/env python3
"""Migrate the lifecycle field to the unified `status` vocabulary.

Authored: 2026-07-02. Brings content to the engine version in this filename.

Two coordinated renames land in this single pass (decided 2026-07-02, see the
tracker issue `2026-07-02-issue-lifecycle-and-creation-rules`, ground truth
`notes/01_lifecycle-vocabulary.md`):

  1. FIELD NAME — subtask frontmatter carried `state:`; issues carried `status:`.
     They are now one shared field, `status:`, at both levels. This script
     renames subtask `state:` → `status:`. (This is the field's SECOND rename —
     `done:` → `state:` → `status:` — which is exactly why the loader keeps a
     legacy-name warning rather than silently accepting the old spelling.)

  2. VALUES — the four-state vocabulary `open | review | closed | cancelled`
     became the seven-status vocabulary. The two renamed terminals map:
         closed    -> done
         cancelled -> dropped
     `open` and `review` are unchanged; the new statuses (`blocked`,
     `in-progress`, `input-needed`) never existed on disk before, so there is
     nothing to migrate into them. NO status is inferred from labels (`wip`
     stays a deprecated label; statuses start honest).

What it touches:

  * Subtask markdown frontmatter (files under a `subtasks/` directory):
      - rename the `state:` line to `status:` (when no `status:` already
        present; if both exist, `status` wins and `state:` is dropped),
      - remap the value via the terminal map above.
  * Issue `settings.json` / `settings.jsonc` (files directly inside a
      `YYYY-MM-DD-<slug>/` issue folder): remap the top-level `status` value.

Everything else (agent-log `status:` fields, notes, comments) is left untouched —
agent-log status is a different, free-form field and never carries these values.

Idempotent: a second run finds nothing to change. Pure standard library; the
frontmatter is rewritten line-by-line so key order, blank lines, and the body
are preserved exactly.

USAGE
-----
    python3 2026-07-02_state-to-status.py detect  <path>
    python3 2026-07-02_state-to-status.py locate  <path>
    python3 2026-07-02_state-to-status.py migrate <path> [--dry-run]
    python3 2026-07-02_state-to-status.py verify  <path>   # exit 1 if legacy remains

`<path>` may be a single file, an issue folder, or a whole tracker
(e.g. data/todo/). Directories are scanned recursively.

Recommended flow:
    detect <root>            # how big is it?
    migrate <root> --dry-run # preview
    migrate <root>           # apply
    verify  <root>           # exit 0 proves the tracker is fully migrated
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from pathlib import Path

FENCE = "---"
# Legacy terminal value → canonical status.
VALUE_MAP = {"closed": "done", "cancelled": "dropped"}

# A subtask frontmatter `state:` line (the field being renamed).
STATE_RE = re.compile(r"^(\s*)state(\s*):(\s*)(?P<value>\S+)(\s*)(#.*)?$", re.IGNORECASE)
# A `status:` line (already-canonical field name; value may still be legacy).
STATUS_RE = re.compile(r"^(\s*)status(\s*):(\s*)(?P<value>\S+)(\s*)(#.*)?$", re.IGNORECASE)
# A top-level JSON/JSONC `"status": "value"` entry in an issue settings file.
JSON_STATUS_RE = re.compile(r'("status"\s*:\s*")(?P<value>[a-z-]+)(")')


@dataclass
class Hit:
    path: Path
    line_no: int
    kind: str   # "subtask-field" | "subtask-value" | "settings-value"
    detail: str


def _split_frontmatter(text: str) -> list[str] | None:
    lines = text.splitlines()
    if not lines or lines[0].strip() != FENCE:
        return None
    for i in range(1, len(lines)):
        if lines[i].strip() == FENCE:
            return lines[1:i]
    return None


def _is_subtask(path: Path) -> bool:
    return "subtasks" in path.parts and path.suffix == ".md"


def _is_issue_settings(path: Path) -> bool:
    if path.name not in ("settings.json", "settings.jsonc"):
        return False
    # Directly inside a YYYY-MM-DD-<slug> issue folder (not a subtask group's).
    return bool(re.match(r"^\d{4}-\d{2}-\d{2}-", path.parent.name))


def scan_file(path: Path) -> list[Hit]:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return []
    hits: list[Hit] = []

    if _is_subtask(path):
        fm = _split_frontmatter(text)
        if fm is not None:
            has_status = any(STATUS_RE.match(l) for l in fm)
            for offset, line in enumerate(fm):
                m = STATE_RE.match(line)
                if m:
                    val = m.group("value").lower()
                    detail = "drop (status already present)" if has_status else f"state→status ({val}→{VALUE_MAP.get(val, val)})"
                    hits.append(Hit(path, offset + 2, "subtask-field", detail))
                ms = STATUS_RE.match(line)
                if ms and ms.group("value").lower() in VALUE_MAP:
                    v = ms.group("value").lower()
                    hits.append(Hit(path, offset + 2, "subtask-value", f"{v}→{VALUE_MAP[v]}"))

    elif _is_issue_settings(path):
        for i, line in enumerate(text.splitlines(), start=1):
            m = JSON_STATUS_RE.search(line)
            if m and m.group("value") in VALUE_MAP:
                v = m.group("value")
                hits.append(Hit(path, i, "settings-value", f"{v}→{VALUE_MAP[v]}"))
    return hits


def iter_files(root: Path):
    if root.is_file():
        yield root
        return
    yield from sorted(root.rglob("*.md"))
    yield from sorted(root.rglob("settings.json"))
    yield from sorted(root.rglob("settings.jsonc"))


def collect_hits(root: Path) -> list[Hit]:
    hits: list[Hit] = []
    for f in iter_files(root):
        hits.extend(scan_file(f))
    return hits


def migrate_file(path: Path, dry_run: bool) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return False

    if _is_subtask(path):
        fm = _split_frontmatter(text)
        if fm is None:
            return False
        has_status = any(STATUS_RE.match(l) for l in fm)
        lines = text.splitlines(keepends=True)
        out: list[str] = []
        fence_seen = 0
        in_fm = False
        for line in lines:
            if line.strip() == FENCE:
                fence_seen += 1
                in_fm = fence_seen == 1
                out.append(line)
                continue
            if in_fm:
                m = STATE_RE.match(line)
                if m:
                    if has_status:
                        continue  # status already present → drop the legacy line
                    val = m.group("value").lower()
                    newval = VALUE_MAP.get(val, val)
                    nl = "\n" if line.endswith("\n") else ""
                    out.append(f"status: {newval}{nl}")
                    continue
                ms = STATUS_RE.match(line)
                if ms and ms.group("value").lower() in VALUE_MAP:
                    val = ms.group("value").lower()
                    nl = "\n" if line.endswith("\n") else ""
                    out.append(f"status: {VALUE_MAP[val]}{nl}")
                    continue
            out.append(line)
        new_text = "".join(out)

    elif _is_issue_settings(path):
        def repl(m: re.Match) -> str:
            v = m.group("value")
            return f'{m.group(1)}{VALUE_MAP.get(v, v)}{m.group(3)}'
        new_text = JSON_STATUS_RE.sub(repl, text)
    else:
        return False

    if new_text == text:
        return False
    if not dry_run:
        path.write_text(new_text, encoding="utf-8")
    return True


def cmd_detect(root: Path) -> int:
    hits = collect_hits(root)
    files = {h.path for h in hits}
    print(f"state-to-status: scanned under {root}")
    print(f"  files needing migration : {len(files)}")
    print(f"  change points           : {len(hits)}")
    for kind in ("subtask-field", "subtask-value", "settings-value"):
        n = sum(1 for h in hits if h.kind == kind)
        if n:
            print(f"    {kind:16} : {n}")
    return 0


def cmd_locate(root: Path) -> int:
    hits = collect_hits(root)
    if not hits:
        print(f"state-to-status: nothing to migrate under {root}")
        return 0
    for h in sorted(hits, key=lambda x: (str(x.path), x.line_no)):
        print(f"  {h.path}:{h.line_no}  [{h.kind}] {h.detail}")
    return 0


def cmd_migrate(root: Path, dry_run: bool) -> int:
    changed = [f for f in iter_files(root) if migrate_file(f, dry_run)]
    verb = "would change" if dry_run else "changed"
    print(f"state-to-status: {verb} {len(changed)} file(s) under {root}")
    for p in changed:
        print(f"  {'[dry-run] ' if dry_run else ''}{p}")
    if dry_run and changed:
        print("\nRe-run without --dry-run to apply.")
    return 0


def cmd_verify(root: Path) -> int:
    hits = collect_hits(root)
    if hits:
        print(f"state-to-status: {len(hits)} legacy change point(s) REMAIN under {root}")
        for h in sorted(hits, key=lambda x: (str(x.path), x.line_no))[:20]:
            print(f"  {h.path}:{h.line_no}  [{h.kind}] {h.detail}")
        return 1
    print(f"state-to-status: clean — no legacy `state:` field or closed/cancelled value under {root}")
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Migrate the lifecycle field to the unified `status` vocabulary.")
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("detect", "locate", "verify"):
        p = sub.add_parser(name)
        p.add_argument("path", type=Path)
    p_m = sub.add_parser("migrate")
    p_m.add_argument("path", type=Path)
    p_m.add_argument("--dry-run", action="store_true")

    args = parser.parse_args(argv)
    root: Path = args.path
    if not root.exists():
        print(f"error: path does not exist: {root}", file=sys.stderr)
        return 2

    if args.command == "detect":
        return cmd_detect(root)
    if args.command == "locate":
        return cmd_locate(root)
    if args.command == "verify":
        return cmd_verify(root)
    if args.command == "migrate":
        return cmd_migrate(root, dry_run=args.dry_run)
    return 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
