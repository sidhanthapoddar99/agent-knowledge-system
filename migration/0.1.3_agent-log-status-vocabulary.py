#!/usr/bin/env python3
"""Migrate agent-log status values onto the canonical seven, and retire two labels.

Authored: 2026-08-02. Brings content to the engine version in this filename.

WHY THIS IS BREAKING
--------------------
Agent-log files carried their own status vocabulary — fourteen accepted aliases
collapsing to four colours:

    not-started · todo · pending · planned
    in-progress · wip · active
    success · completed · complete · done
    failed · fail · error

The tracker now has EXACTLY ONE status vocabulary: the canonical seven from
`src/loaders/issue-status.ts`, shared by issues, subtasks, plan stages, agent
logs and iteration files. Agent logs use five of the seven — `blocked` and
`review` mean nothing for a run. Ten of the fourteen aliases stop validating, so
existing content must be rewritten.

THREE CHANGES, ONE PASS
-----------------------
1. `status:` VALUES in agent-log markdown frontmatter, remapped:

       not-started, todo, pending, planned      -> open
       in-progress, wip, active                 -> in-progress
       success, completed, complete, done       -> done
       failed, fail, error                      -> dropped

   `failed -> dropped` is the one that needs explaining. Under the new rule,
   `status` answers *did the agent finish its assignment* — not *was the news
   good*. An audit that completed and found five real defects is `done`: it did
   its job. `dropped` means the run did not deliver — it crashed, was refused,
   or was superseded. What the run actually FOUND belongs in the file's
   `# Outcome` section, which is prose, not a status token.

2. `iteration:` is DROPPED from agent-log frontmatter. The `NNN_` filename owns
   the number now, and a field restating the filename is a second copy of a fact
   the name already holds. Nothing renders it any more.

3. The `wip` and `blocked` LABELS are removed from the tracker-root vocabulary
   and from every issue's `settings.json` that carries them. Execution state is
   a status; it was never meant to be a label as well, and keeping a deprecated
   value in the vocabulary is a permanent invitation to use it. Issues keep
   every other label they carry.

WHAT IT DOES NOT TOUCH
----------------------
* **Folder structure.** The retired six-slot shape (`00_goal.md` … `05_notes.md`)
  and `MNN_` milestone files are left exactly where they are. They still parse
  and still render as ordinary markdown; only the status *values* break. History
  stays as written — a script that restructured old folders would rewrite the
  record rather than migrate it.
* **Subtask, issue or plan-stage `status:`.** Those were already canonical.
* **The `blocked-external` label**, which is a genuine cross-cutting tag and
  unrelated to the `blocked` status.

Idempotent: a second run finds zero instances. Pure standard library; markdown
frontmatter is rewritten line-by-line so key order, blank lines and the body are
preserved exactly, and JSON is edited textually so comments in a `.jsonc` and
the author's formatting survive.

USAGE
-----
    python3 0.1.3_agent-log-status-vocabulary.py detect  <path>
    python3 0.1.3_agent-log-status-vocabulary.py locate  <path>
    python3 0.1.3_agent-log-status-vocabulary.py migrate <path> [--dry-run]
    python3 0.1.3_agent-log-status-vocabulary.py verify  <path>   # exit 1 if legacy remains

`<path>` may be a single file, an issue folder, or a whole tracker
(e.g. `data/todo/`). Directories are scanned recursively.

Recommended flow:
    detect <root>            # how big is it?
    migrate <root> --dry-run # preview every rewrite
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

# Legacy agent-log status value -> canonical status. Keys are lowercased.
VALUE_MAP = {
    "not-started": "open",
    "todo": "open",
    "pending": "open",
    "planned": "open",
    "wip": "in-progress",
    "active": "in-progress",
    "success": "done",
    "completed": "done",
    "complete": "done",
    "failed": "dropped",
    "fail": "dropped",
    "error": "dropped",
}

# Labels retired because execution state is a status, never a label.
RETIRED_LABELS = ("wip", "blocked")

STATUS_RE = re.compile(r"^(?P<pre>\s*status\s*:\s*)(?P<q>[\"']?)(?P<value>[A-Za-z-]+)(?P=q)(?P<post>\s*(?:#.*)?)$")
ITERATION_RE = re.compile(r"^\s*iteration\s*:\s*\S+\s*(?:#.*)?$", re.IGNORECASE)


@dataclass
class Hit:
    path: Path
    line_no: int
    kind: str   # "log-status" | "log-iteration" | "label-value" | "label-description"
    detail: str


# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

def _is_agent_log_md(path: Path) -> bool:
    return path.suffix == ".md" and "agent-log" in path.parts


def _is_settings(path: Path) -> bool:
    """Any issue `settings.json`/`.jsonc`, or a tracker-root one."""
    return path.name in ("settings.json", "settings.jsonc")


def _split_frontmatter(text: str) -> tuple[list[str], int, int] | None:
    """Return (frontmatter lines, start index, end index) or None.

    Indices are into the full line list: `start` is the line after the opening
    fence, `end` is the closing fence's index.
    """
    lines = text.splitlines()
    if not lines or lines[0].strip() != FENCE:
        return None
    for i in range(1, len(lines)):
        if lines[i].strip() == FENCE:
            return lines[1:i], 1, i
    return None


# ---------------------------------------------------------------------------
# Scanning
# ---------------------------------------------------------------------------

def scan_file(path: Path) -> list[Hit]:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return []
    hits: list[Hit] = []

    if _is_agent_log_md(path):
        split = _split_frontmatter(text)
        if split is not None:
            fm, start = split[0], split[1]
            for offset, line in enumerate(fm):
                line_no = start + offset + 1
                m = STATUS_RE.match(line)
                if m and m.group("value").lower() in VALUE_MAP:
                    old = m.group("value")
                    hits.append(Hit(path, line_no, "log-status",
                                    f"status: {old} -> {VALUE_MAP[old.lower()]}"))
                elif ITERATION_RE.match(line):
                    hits.append(Hit(path, line_no, "log-iteration",
                                    f"drop `{line.strip()}` — the NNN_ filename owns the number"))

    if _is_settings(path):
        for offset, line in enumerate(text.splitlines()):
            for label in RETIRED_LABELS:
                # A label VALUE inside a values array or an issue's labels array.
                if re.search(rf'"{label}"\s*,?', line) and not re.search(rf'"{label}"\s*:', line):
                    hits.append(Hit(path, offset + 1, "label-value",
                                    f'remove the "{label}" label'))
                    break
                # A description entry keyed by the retired label.
                if re.search(rf'"{label}"\s*:\s*"', line):
                    hits.append(Hit(path, offset + 1, "label-description",
                                    f'remove the "{label}" description'))
                    break

    return hits


def _iter_files(root: Path):
    if root.is_file():
        yield root
        return
    for p in sorted(root.rglob("*")):
        if p.is_file() and (p.suffix == ".md" or p.name in ("settings.json", "settings.jsonc")):
            yield p


def collect_hits(root: Path) -> list[Hit]:
    hits: list[Hit] = []
    for p in _iter_files(root):
        hits.extend(scan_file(p))
    return hits


# ---------------------------------------------------------------------------
# Rewriting
# ---------------------------------------------------------------------------

def _rewrite_agent_log(text: str) -> str | None:
    split = _split_frontmatter(text)
    if split is None:
        return None
    fm, start, end = split
    lines = text.splitlines(keepends=True)
    out_fm: list[str] = []
    changed = False

    for line in fm:
        m = STATUS_RE.match(line)
        if m and m.group("value").lower() in VALUE_MAP:
            new = VALUE_MAP[m.group("value").lower()]
            out_fm.append(f'{m.group("pre")}{m.group("q")}{new}{m.group("q")}{m.group("post")}')
            changed = True
            continue
        if ITERATION_RE.match(line):
            changed = True   # dropped entirely
            continue
        out_fm.append(line)

    if not changed:
        return None

    head = lines[:start]
    tail = lines[end:]
    nl = "\n"
    return "".join(head) + "".join(l + nl for l in out_fm) + "".join(tail)


def _rewrite_settings(text: str) -> str | None:
    """Remove the retired labels from a settings file, textually.

    Textual rather than json.loads/dumps on purpose: the tracker root may be a
    `.jsonc` with comments and deliberate alignment, and reserialising would
    destroy both.
    """
    out: list[str] = []
    changed = False

    for line in text.splitlines():
        drop_line = False
        new_line = line

        for label in RETIRED_LABELS:
            # A description entry on its own line -> drop the line.
            if re.search(rf'^\s*"{label}"\s*:\s*"', new_line):
                drop_line = True
                break
            # A value inside an array. Remove just the element, keeping the rest.
            if re.search(rf'"{label}"', new_line) and not re.search(rf'"{label}"\s*:', new_line):
                stripped = re.sub(rf'"{label}"\s*,\s*', "", new_line)
                if stripped == new_line:                      # last element on its line
                    stripped = re.sub(rf',?\s*"{label}"', "", new_line)
                new_line = stripped

        if drop_line:
            changed = True
            continue
        if new_line != line:
            changed = True
            # An array line emptied by the removal contributes nothing.
            if new_line.strip() in ("", ","):
                continue
        out.append(new_line)

    if not changed:
        return None
    trailing = "\n" if text.endswith("\n") else ""
    return "\n".join(out) + trailing


def rewrite_file(path: Path) -> str | None:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return None
    if _is_agent_log_md(path):
        return _rewrite_agent_log(text)
    if _is_settings(path):
        return _rewrite_settings(text)
    return None


# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_detect(root: Path) -> int:
    hits = collect_hits(root)
    if not hits:
        print(f"agent-log-status-vocabulary: nothing to migrate under {root}")
        return 0
    by_kind: dict[str, int] = {}
    for h in hits:
        by_kind[h.kind] = by_kind.get(h.kind, 0) + 1
    files = len({h.path for h in hits})
    print(f"agent-log-status-vocabulary: {len(hits)} change point(s) in {files} file(s) under {root}")
    for kind, n in sorted(by_kind.items()):
        print(f"  {kind:<18} {n}")
    print("\nRun `locate` for file:line detail, then `migrate --dry-run`.")
    return 0


def cmd_locate(root: Path) -> int:
    hits = collect_hits(root)
    for h in sorted(hits, key=lambda x: (str(x.path), x.line_no)):
        print(f"{h.path}:{h.line_no}  [{h.kind}] {h.detail}")
    if not hits:
        print(f"agent-log-status-vocabulary: nothing to migrate under {root}")
    return 0


def cmd_migrate(root: Path, dry_run: bool) -> int:
    touched = 0
    for p in _iter_files(root):
        new = rewrite_file(p)
        if new is None:
            continue
        touched += 1
        if dry_run:
            print(f"would rewrite {p}")
            for h in scan_file(p):
                print(f"    {h.line_no}: {h.detail}")
        else:
            p.write_text(new, encoding="utf-8")
            print(f"rewrote {p}")
    verb = "would rewrite" if dry_run else "rewrote"
    print(f"\nagent-log-status-vocabulary: {verb} {touched} file(s)")
    if not dry_run and touched:
        remaining = collect_hits(root)
        print(f"post-migration detect: {len(remaining)} change point(s) remain "
              f"({'idempotent' if not remaining else 'NOT CLEAN — investigate'})")
        return 0 if not remaining else 1
    return 0


def cmd_verify(root: Path) -> int:
    hits = collect_hits(root)
    if hits:
        print(f"agent-log-status-vocabulary: {len(hits)} legacy change point(s) REMAIN under {root}")
        for h in sorted(hits, key=lambda x: (str(x.path), x.line_no))[:20]:
            print(f"  {h.path}:{h.line_no}  [{h.kind}] {h.detail}")
        return 1
    print(f"agent-log-status-vocabulary: clean — no legacy agent-log status, "
          f"`iteration:` field, or retired label under {root}")
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Migrate agent-log status values onto the canonical seven, drop `iteration:`, "
                    "and retire the `wip`/`blocked` labels.")
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
