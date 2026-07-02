#!/usr/bin/env python3
"""Migrate a tracker-root settings file to the v0.7.0 vocabulary schema.

Decided 2026-07-03 (tracker issue `2026-07-02-issue-lifecycle-and-creation-rules`,
subtasks 11 + 12). ONE transition of the tracker-root `settings.json(c)` with two
facets — both are checked and guided here because they touch the same file, ship
together, and are both manual (see "why no `migrate`" below):

  A. STATUS COLOURS ARE COLOURS-ONLY (subtask 12).
     The seven statuses and four categories are FIXED IN FRAMEWORK CODE
     (astro-doc-code/src/loaders/issue-status.ts). A tracker may no longer declare
     a `fields.status` block; the only status customisation is COLOURS, which move
     to a top-level `statusColors` map (sibling of `fields`). Keys must be a subset
     of the seven statuses — a colour for a status that doesn't exist is a typo,
     itself a hard error. Omit any you don't override; they inherit the default.

  B. COMPONENT/LABEL VALUES REQUIRE DESCRIPTIONS (subtask 11).
     Each `component` and `labels` value must have an entry in a parallel
     `descriptions` map keyed by value (a plain sibling of `values`, which stays a
     `string[]`). These render in the tracker Guide modal on the issues index.
     `priority` descriptions are OPTIONAL and not enforced.

WHY THESE ARE HARD ERRORS, NOT WARNINGS
---------------------------------------
A `fields.status.values` list reads as authoritative and would eventually be
consumed as the vocabulary, diverging from the code constant. A component/label
without a description is a hole in the Guide. So the loader REFUSES to start while
either is wrong. Until you migrate, `bun run build` / `./start dev` aborts during
getStaticPaths, e.g.:

    [issues] "<tracker>/settings.jsonc" declares `fields.status`, but statuses are
    fixed by the framework and cannot be defined per-tracker. ...
    Fix: delete the entire `fields.status` block. To override colours, add a
    top-level `statusColors` map instead ...

  — or —

    [issues] "<tracker>/settings.jsonc" — every `component` value must declare a
    description (these are rendered in the tracker Guide). Missing for: <values>.

`docs-guide check issues` reports the same as errors (exit 1) without a build.

WHY NO `migrate` COMMAND (manual transition)
--------------------------------------------
The tracker root is authored as JSONC with load-bearing comments explaining what
each vocabulary entry means, and descriptions are human-authored MEANING the script
cannot invent (often the meaning already IS the `//` comment beside the value —
move it into the map by hand; the comment may stay). An automated rewrite would
strip or misplace comments. So this script DETECTS the old shape and PRINTS the
exact replacement to paste; it never edits the file. (Contrast the mechanical,
per-file 2026-07-02_state-to-status.py, which safely rewrites frontmatter
line-by-line and so ships a `migrate` command — a different kind of migration.)

USAGE
-----
    python3 2026-07-03_root-settings-schema.py detect <path>
    python3 2026-07-03_root-settings-schema.py guide  <path>   # paste-in replacements
    python3 2026-07-03_root-settings-schema.py verify <path>   # exit 1 if any facet fails

`<path>` may be a tracker-root settings file or a tracker directory (which
resolves `settings.jsonc` first, then `settings.json`).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Mirror of astro-doc-code/src/loaders/issue-status.ts (kept in sync by hand —
# this is a one-shot script, not wired to the constant).
STATUSES = ["open", "blocked", "in-progress", "input-needed", "review", "done", "dropped"]
DEFAULT_STATUS_COLORS = {
    "open": "#888888",
    "blocked": "#d1854f",
    "in-progress": "#61afef",
    "input-needed": "#e8a54b",
    "review": "#f0c674",
    "done": "#7ec699",
    "dropped": "#c678dd",
}
REQUIRED_DESC_FIELDS = ("component", "labels")
OPTIONAL_DESC_FIELDS = ("priority",)


def strip_jsonc(text: str) -> str:
    """Strip // and /* */ comments and trailing commas. String-aware — mirrors
    astro-doc-code/src/loaders/settings-file.ts so both sides agree."""
    out = []
    in_string = in_line = in_block = escaped = False
    i, n = 0, len(text)
    while i < n:
        c = text[i]
        nxt = text[i + 1] if i + 1 < n else ""
        if in_line:
            if c == "\n":
                in_line = False
                out.append(c)
            i += 1
            continue
        if in_block:
            if c == "*" and nxt == "/":
                in_block = False
                i += 2
                continue
            i += 1
            continue
        if in_string:
            out.append(c)
            if escaped:
                escaped = False
            elif c == "\\":
                escaped = True
            elif c == '"':
                in_string = False
            i += 1
            continue
        if c == '"':
            in_string = True
            out.append(c)
            i += 1
            continue
        if c == "/" and nxt == "/":
            in_line = True
            i += 2
            continue
        if c == "/" and nxt == "*":
            in_block = True
            i += 2
            continue
        if c in "}]":
            trimmed = "".join(out).rstrip()
            if trimmed.endswith(","):
                out = [trimmed[:-1]]
        out.append(c)
        i += 1
    return "".join(out)


def resolve_settings(path: Path) -> Path | None:
    """A settings file, or a dir → its `settings.jsonc` (preferred) / `settings.json`."""
    if path.is_file():
        return path
    for base in ("settings.jsonc", "settings.json"):
        cand = path / base
        if cand.exists():
            return cand
    return None


def load(path: Path) -> dict | None:
    try:
        return json.loads(strip_jsonc(path.read_text(encoding="utf-8")))
    except (OSError, ValueError):
        return None


# ---- Facet A: status colours -------------------------------------------------

def status_field(data: dict) -> dict | None:
    fields = data.get("fields")
    if isinstance(fields, dict) and isinstance(fields.get("status"), dict):
        return fields["status"]
    return None


def status_problems(data: dict) -> list[str]:
    problems = []
    if status_field(data) is not None:
        problems.append("`fields.status` present — remove it (statuses are code-fixed)")
    sc = data.get("statusColors")
    if isinstance(sc, dict):
        for k in sc:
            if k not in STATUSES:
                problems.append(f"`statusColors.{k}` is not a valid status")
    return problems


# ---- Facet B: descriptions ---------------------------------------------------

def missing_descriptions(data: dict, field: str) -> list[str]:
    fields = data.get("fields") or {}
    fdef = fields.get(field)
    if not isinstance(fdef, dict):
        return []
    values = fdef.get("values") or []
    if not isinstance(values, list):
        return []
    descriptions = fdef.get("descriptions") or {}
    if not isinstance(descriptions, dict):
        descriptions = {}
    missing = []
    for v in values:
        d = descriptions.get(v)
        if not isinstance(d, str) or not d.strip():
            missing.append(v)
    return missing


# ---- Commands ----------------------------------------------------------------

def cmd_detect(path: Path) -> int:
    f = resolve_settings(path)
    if not f:
        print(f"root-settings-schema: no settings file under {path}")
        return 0
    data = load(f)
    if data is None:
        print(f"root-settings-schema: could not parse {f}")
        return 2
    print(f"root-settings-schema: {f}\n")
    print("  A. status colours (colours-only)")
    sf = status_field(data)
    print(f"     fields.status         : {'PRESENT — must be removed' if sf else 'absent (ok)'}")
    print(f"     top-level statusColors: {'present' if isinstance(data.get('statusColors'), dict) else 'absent'}")
    for p in status_problems(data):
        print(f"     ✗ {p}")
    print("\n  B. component/label descriptions (required)")
    for field in REQUIRED_DESC_FIELDS:
        miss = missing_descriptions(data, field)
        print(f"     {field:10} (required): {len(miss)} missing" + (f" — {', '.join(miss)}" if miss else ""))
    for field in OPTIONAL_DESC_FIELDS:
        miss = missing_descriptions(data, field)
        print(f"     {field:10} (optional): {len(miss)} without a description" + (f" — {', '.join(miss)}" if miss else ""))
    return 0


def cmd_guide(path: Path) -> int:
    f = resolve_settings(path)
    if not f:
        print(f"root-settings-schema: no settings file under {path}")
        return 0
    data = load(f)
    if data is None:
        print(f"root-settings-schema: could not parse {f}")
        return 2

    any_work = False
    sf = status_field(data)
    if sf is not None:
        any_work = True
        colors = sf.get("colors") or {}
        overrides = {k: v for k, v in colors.items() if DEFAULT_STATUS_COLORS.get(k) != v}
        unknown = [k for k in colors if k not in STATUSES]
        print(f"A. status colours — for {f}\n")
        print("   1. DELETE the entire `fields.status` block (values + colors).")
        if overrides:
            print("   2. ADD this top-level `statusColors` map (sibling of `fields`):\n")
            print("        \"statusColors\": " + json.dumps(overrides, indent=2).replace("\n", "\n        ") + ",")
            print("\n      (only colours that differ from the framework defaults — omitted")
            print("       statuses inherit the default automatically.)")
        else:
            print("   2. No `statusColors` map needed — every colour matched the default.")
        if unknown:
            print(f"\n   ⚠ NOT valid statuses (drop them): {', '.join(unknown)}")

    for field in REQUIRED_DESC_FIELDS + OPTIONAL_DESC_FIELDS:
        miss = missing_descriptions(data, field)
        if not miss:
            continue
        any_work = True
        req = field in REQUIRED_DESC_FIELDS
        print(f"\nB. fields.{field}.descriptions — add {'(REQUIRED)' if req else '(optional)'}:")
        skeleton = {v: "…" for v in miss}
        print("     \"descriptions\": " + json.dumps(skeleton, indent=2, ensure_ascii=False).replace("\n", "\n     "))
        print("   (tip: the meaning is often already the `//` comment beside the value —")
        print("    move it in; the comment may stay too.)")

    if not any_work:
        print(f"root-settings-schema: {f} is already on the v0.7.0 schema — nothing to do.")
    return 0


def cmd_verify(path: Path) -> int:
    f = resolve_settings(path)
    if not f:
        print(f"root-settings-schema: no settings file under {path}")
        return 0
    data = load(f)
    if data is None:
        print(f"root-settings-schema: could not parse {f}")
        return 2
    problems = list(status_problems(data))
    for field in REQUIRED_DESC_FIELDS:
        miss = missing_descriptions(data, field)
        if miss:
            problems.append(f"{field}: missing description(s) for {', '.join(miss)}")
    if problems:
        print(f"root-settings-schema: {len(problems)} problem(s) in {f}")
        for p in problems:
            print(f"  ✗ {p}")
        return 1
    print(f"root-settings-schema: clean — {f} is on the v0.7.0 schema.")
    return 0


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description="Migrate a tracker root to the v0.7.0 vocabulary schema (detect/guide/verify).")
    sub = parser.add_subparsers(dest="command", required=True)
    for name in ("detect", "guide", "verify"):
        p = sub.add_parser(name)
        p.add_argument("path", type=Path)
    args = parser.parse_args(argv)
    if not args.path.exists():
        print(f"error: path does not exist: {args.path}", file=sys.stderr)
        return 2
    return {"detect": cmd_detect, "guide": cmd_guide, "verify": cmd_verify}[args.command](args.path)


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
