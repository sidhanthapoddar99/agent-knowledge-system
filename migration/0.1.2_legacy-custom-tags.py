#!/usr/bin/env python3
"""Migrate retired custom-tags syntax to native markdown.

Authored: 2026-07-03. Brings content to the engine version in this filename.

The platform is native-markdown-only (decided 2026-07-03, tracker issue
`2026-07-03-skill-custom-tags-staleness`): the `:::callout` / `:::collapsible` /
`:::tabs` directive forms and the `<callout>` / `<collapsible>` / `<tabs>` /
`<tab>` tag forms were retired — the engine never parsed any of them, so
leftovers render as raw text. This migration rewrites them to the native
constructs that DO render on the 0.1.2 engine:

  * callout (any form)     -> GFM alert blockquote  (> [!NOTE] / [!TIP] /
                              [!WARNING] / [!CAUTION]); type mapping
                              info|note->NOTE, tip->TIP, warning->WARNING,
                              danger->CAUTION; a title= folds into the first
                              bold body line
  * collapsible (any form) -> native <details><summary>...</summary>...</details>
  * tabs / tab (any form)  -> sequential "### <label>" sections (flattened —
                              there is no native tab equivalent)

Skipped (mentions, not usage): fenced code blocks, inline code spans, and YAML
frontmatter. Idempotent: the rewritten output contains none of the legacy
patterns, so a re-run finds zero instances and is a no-op.

Usage:
    python3 migration/0.1.2_legacy-custom-tags.py detect  <content-root>
    python3 migration/0.1.2_legacy-custom-tags.py locate  <content-root>
    python3 migration/0.1.2_legacy-custom-tags.py migrate <content-root> [--dry-run]

Exit codes: detect/locate -> 0 clean, 1 instances found; migrate -> 0 on success.
"""

import argparse
import os
import re
import sys

SKIP_DIRS = {"node_modules", ".git", "dist", ".astro"}

ALERT_MAP = {"info": "NOTE", "note": "NOTE", "tip": "TIP", "warning": "WARNING", "danger": "CAUTION"}

# --- shared masking: fenced code + frontmatter are untouchable ----------------

def split_regions(text):
    """Yield (is_protected, chunk) pairs — protected chunks are frontmatter or
    fenced code blocks and must pass through unmodified."""
    chunks = []
    rest = text
    # frontmatter
    m = re.match(r"^---\n.*?\n---\n", rest, re.S)
    if m:
        chunks.append((True, m.group(0)))
        rest = rest[m.end():]
    # fenced blocks (``` or ~~~, any length >= 3)
    fence_re = re.compile(r"^([`~]{3,})[^\n]*\n.*?^\1[`~]*[ \t]*$\n?", re.S | re.M)
    pos = 0
    for m in fence_re.finditer(rest):
        if m.start() > pos:
            chunks.append((False, rest[pos:m.start()]))
        chunks.append((True, m.group(0)))
        pos = m.end()
    if pos < len(rest):
        chunks.append((False, rest[pos:]))
    return chunks


def mask_inline_code(line):
    return re.sub(r"`[^`]*`", "", line)

# --- detection -----------------------------------------------------------------

PATTERNS = [
    (re.compile(r":::\s*callout\b", re.I), ":::callout directive"),
    (re.compile(r":::\s*collapsible\b", re.I), ":::collapsible directive"),
    (re.compile(r":::\s*tabs?\b", re.I), ":::tabs directive"),
    (re.compile(r"<callout\b", re.I), "<callout> tag"),
    (re.compile(r"<collapsible\b", re.I), "<collapsible> tag"),
    (re.compile(r"<tabs?\b", re.I), "<tabs>/<tab> tag"),
]


def find_instances(text):
    """Return [(line_no, label)] for legacy usage outside protected regions."""
    hits = []
    line_no = 0
    for protected, chunk in split_regions(text):
        n_lines = chunk.count("\n")
        if protected:
            line_no += n_lines
            continue
        for i, line in enumerate(chunk.split("\n")):
            scannable = mask_inline_code(line)
            for rx, label in PATTERNS:
                if rx.search(scannable):
                    hits.append((line_no + i + 1, label))
                    break
        line_no += n_lines
    return hits

# --- rewriting -----------------------------------------------------------------

def attr(attrs_str, name):
    m = re.search(rf'{name}\s*=\s*"([^"]*)"', attrs_str, re.I) or \
        re.search(rf"{name}\s*=\s*'([^']*)'", attrs_str, re.I) or \
        re.search(rf"{name}\s*=\s*(\S+)", attrs_str, re.I)
    return m.group(1) if m else None


def to_alert(attrs_str, body):
    alert = ALERT_MAP.get((attr(attrs_str, "type") or "info").lower(), "NOTE")
    title = attr(attrs_str, "title")
    lines = [l for l in body.strip().split("\n")]
    out = [f"> [!{alert}]"]
    if title:
        out.append(f"> **{title}**")
    out += [f"> {l}".rstrip() for l in lines]
    return "\n".join(out)


def to_details(attrs_str, body):
    title = attr(attrs_str, "title") or "Details"
    opened = " open" if (attr(attrs_str, "open") or "").lower() == "true" else ""
    return f"<details{opened}>\n<summary>{title}</summary>\n\n{body.strip()}\n\n</details>"


def tabs_to_sections(inner):
    # tag form: <tab label="X">body</tab>
    parts = re.findall(r"<tab\b([^>]*)>(.*?)</tab>", inner, re.S | re.I)
    if parts:
        secs = []
        for attrs_str, body in parts:
            label = attr(attrs_str, "label") or f"Tab {len(secs) + 1}"
            secs.append(f"### {label}\n\n{body.strip()}")
        return "\n\n".join(secs)
    # directive form: "- tab: X" / "  content: ..." pseudo-list
    out = []
    for line in inner.strip().split("\n"):
        m = re.match(r"\s*-\s*tab:\s*(.+)", line)
        if m:
            out.append(f"### {m.group(1).strip()}")
        else:
            out.append(re.sub(r"^\s*content:\s*", "", line))
    return "\n".join(out)


def rewrite_chunk(chunk):
    # Tag forms (multiline bodies)
    chunk = re.sub(r"<callout\b([^>]*)>(.*?)</callout>",
                   lambda m: to_alert(m.group(1), m.group(2)), chunk, flags=re.S | re.I)
    chunk = re.sub(r"<collapsible\b([^>]*)>(.*?)</collapsible>",
                   lambda m: to_details(m.group(1), m.group(2)), chunk, flags=re.S | re.I)
    chunk = re.sub(r"<tabs\b[^>]*>(.*?)</tabs>",
                   lambda m: tabs_to_sections(m.group(1)), chunk, flags=re.S | re.I)
    # Directive forms — ::: name{attrs} ... :::
    chunk = re.sub(r":::\s*callout(\{[^}]*\})?\n(.*?)\n:::",
                   lambda m: to_alert(m.group(1) or "", m.group(2)), chunk, flags=re.S | re.I)
    chunk = re.sub(r":::\s*collapsible(\{[^}]*\})?\n(.*?)\n:::",
                   lambda m: to_details(m.group(1) or "", m.group(2)), chunk, flags=re.S | re.I)
    chunk = re.sub(r":::\s*tabs\n(.*?)\n:::",
                   lambda m: tabs_to_sections(m.group(1)), chunk, flags=re.S | re.I)
    return chunk


def rewrite(text):
    return "".join(chunk if protected else rewrite_chunk(chunk)
                   for protected, chunk in split_regions(text))

# --- walking -------------------------------------------------------------------

def md_files(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if not d.startswith(".") and d not in SKIP_DIRS]
        for f in sorted(filenames):
            if f.endswith(".md"):
                yield os.path.join(dirpath, f)


def main():
    p = argparse.ArgumentParser(description="Migrate retired custom-tags syntax to native markdown (v0.1.2).")
    sub = p.add_subparsers(dest="cmd", required=True)
    for name, help_ in (("detect", "count files with legacy custom-tags usage"),
                        ("locate", "list every instance with file + line"),
                        ("migrate", "rewrite to native markdown (--dry-run to preview)")):
        sp = sub.add_parser(name, help=help_)
        sp.add_argument("root")
        if name == "migrate":
            sp.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    if not os.path.isdir(args.root):
        print(f"Not found: {args.root}", file=sys.stderr)
        return 1

    total_files, total_hits = 0, 0
    for path in md_files(args.root):
        text = open(path, encoding="utf-8").read()
        hits = find_instances(text)
        if not hits:
            continue
        rel = os.path.relpath(path, args.root)
        total_files += 1
        total_hits += len(hits)
        if args.cmd == "locate":
            for line, label in hits:
                print(f"  {rel}:{line}: {label}")
        elif args.cmd == "migrate":
            new = rewrite(text)
            residual = find_instances(new)
            status = "" if not residual else f"  [WARN: {len(residual)} instance(s) need manual review]"
            print(f"  {rel}: {len(hits)} instance(s) rewritten{status}")
            if not args.dry_run:
                open(path, "w", encoding="utf-8").write(new)

    verb = {"detect": "detect", "locate": "locate", "migrate": "migrate" + (" (dry-run)" if args.cmd == "migrate" and args.dry_run else "")}[args.cmd]
    print(f"legacy-custom-tags {verb}: {total_files} file(s), {total_hits} instance(s) under {args.root}")
    if args.cmd in ("detect", "locate"):
        return 1 if total_hits else 0
    return 0


if __name__ == "__main__":
    sys.exit(main())
