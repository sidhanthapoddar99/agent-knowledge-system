#!/usr/bin/env python3
"""Rewrite slug-form internal links to the source path they name.

Authored: 2026-08-04. Brings content to the engine version in this filename.

WHAT CHANGED, AND WHY YOUR CONTENT IS SUDDENLY FAILING A GATE THAT USED TO PASS.
`agent-ks check link-form` used to ask one question — does this target start with
a `/` — which is a check on the SHAPE of a link and not on what it points at. It
now also requires the target to EXIST ON DISK, and that is an error rather than a
warning. So this passed before and fails now:

    [Design philosophy](./design-philosophy)      <- the published URL
    the file is                                      02_design-philosophy.md

NOTHING IS BROKEN IN A BROWSER, WHICH IS WHY THIS SAT UNNOTICED. The router
accepts both spellings and redirects the source form to the canonical slug, so
the rendered site is identical either way. Converting 300 of these in the
framework's own content changed 86,452 hrefs across 1,216 built pages by exactly
zero. If you skip this migration your site keeps working; what you lose is:

  * `agent-ks move` cannot follow the link. Rename the target and the link rots
    with nothing reporting it — it is skipped through the same branch as a link
    that legitimately points elsewhere, so the skip is invisible
  * `grep <filename>` does not find the reference, so a file's inbound links are
    invisible from the file tree
  * an editor (or Obsidian, or an agent walking the tree) cannot open it
  * it encodes the prefix-stripping rule into content, so a section that does not
    strip prefixes — as a tracker does not — silently breaks every such link

That is the whole reason the project's links are relative: these documents are
filesystem-first, and a slug is a fact about one consumer of them.

HOW A TARGET IS RESOLVED. Segment by segment against what is really on disk. An
exact name wins; otherwise the segment is matched against directory entries with
the `NN_` ordering prefix and the page extension stripped, and it is rewritten
ONLY when exactly one candidate matches. Zero or several candidates is a refusal
that gets reported, never a guess. The per-segment part matters: `./tokens/overview`
is a slug in BOTH halves and is really `./04_tokens/01_overview.md`.

WHAT IS DELIBERATELY LEFT ALONE.

  * fenced code blocks and inline code spans — markup being SHOWN is not markup
    being used. Inline spans are matched by backtick RUN LENGTH, so the
    ``[`x`](./x)`` form a document uses to quote a link containing backticks is
    protected too
  * images (`![...]`), external schemes, protocol-relative `//`, pure `#anchors`
  * site-absolute `/...` targets — those are a separate error with a separate
    fix (make them relative), and guessing a URL prefix is exactly what no tool
    here is allowed to do
  * link TEXT — only the target is rewritten. An `NN/MM` ordering label in the
    text is `agent-ks move`'s business, not this script's
  * anything that already resolves on disk

An earlier attempt at this class of sweep, done with a plain regex over the file
text, was reverted: it rewrote a link that was already inside a link, and it
destroyed a teaching example in a page whose subject was how to write links.
This script parses instead — which is why it protects code spans, and why it
refuses rather than guesses.

Idempotent: a rewritten target resolves on disk, so a re-run finds nothing.

Usage:
    python3 migration/0.2.3_slug-form-links.py detect  <content-root>
    python3 migration/0.2.3_slug-form-links.py locate  <content-root>
    python3 migration/0.2.3_slug-form-links.py migrate <content-root> [--dry-run]
    python3 migration/0.2.3_slug-form-links.py verify  <content-root>

`<content-root>` is your data directory — the one holding your docs sections and
tracker (`default-docs/data` in the framework repo).

`verify` is `detect` with the opposite reading: it asserts the tree is clean AND
that links were actually parsed, so a zero that came from finding nothing to look
at cannot be mistaken for a pass.

Exit codes: detect/locate -> 0 clean, 1 instances found; migrate -> 0 on success,
1 if anything was refused; verify -> 0 clean, 1 otherwise.
"""

import argparse
import os
import re
import sys

SKIP_DIRS = {"node_modules", ".git", "dist", ".astro"}

# A markdown link or image. Groups: leading '!', text, target.
LINK_RE = re.compile(r"(!?)\[([^\]]*)\]\(([^)\s]+)\)")

# A fence opens/closes on 3+ backticks or tildes, indented at most 3 spaces.
FENCE_RE = re.compile(r"^\s{0,3}(`{3,}|~{3,})")

# Page extensions the sidebar treats as a page — stripped when comparing slugs.
PAGE_EXT_RE = re.compile(r"\.(mdx?|html|mmd|mermaid|dot|gv|excalidraw)$", re.I)

ORDER_PREFIX_RE = re.compile(r"^\d{2,5}[_-]")

SCHEME_RE = re.compile(r"^[a-z][a-z0-9+.-]*:", re.I)


def slug_of(name):
    """A path segment with its ordering prefix and page extension removed."""
    return PAGE_EXT_RE.sub("", ORDER_PREFIX_RE.sub("", name))


def blank_code_spans(line):
    """Replace inline code spans with same-length filler.

    The run length matters. A `` `[^`]*` `` pattern stops at the first inner
    backtick and leaves exposed the very form a document uses to quote a link
    that itself contains backticks.
    """
    out = []
    i = 0
    n = len(line)
    while i < n:
        if line[i] != "`":
            out.append(line[i])
            i += 1
            continue
        j = i
        while j < n and line[j] == "`":
            j += 1
        run = line[i:j]
        close = line.find(run, j)
        if close == -1:
            out.append(line[i:j])
            i = j
            continue
        end = close + len(run)
        out.append(" " * (end - i))
        i = end
    return "".join(out)


def prose_lines(text):
    """Yield (index, line, is_prose) — False inside fenced blocks and frontmatter."""
    lines = text.split("\n")
    open_fence = None
    in_frontmatter = bool(lines) and lines[0].strip() == "---"
    for idx, line in enumerate(lines):
        if in_frontmatter:
            yield idx, line, False
            if idx > 0 and line.strip() == "---":
                in_frontmatter = False
            continue
        m = FENCE_RE.match(line)
        marker = m.group(1) if m else None
        if open_fence:
            if marker and marker[0] == open_fence[0] and len(marker) >= len(open_fence):
                open_fence = None
            yield idx, line, False
            continue
        if marker:
            open_fence = marker
            yield idx, line, False
            continue
        yield idx, line, True


def resolve_exact(from_dir, rel):
    """The path a target names, if it exists exactly as written."""
    p = os.path.normpath(os.path.join(from_dir, rel))
    return p if os.path.exists(p) else None


def resolve_slug_path(from_dir, rel):
    """Walk `rel` segment by segment against the real tree. None = refuse."""
    cur = from_dir
    out = []
    for seg in rel.split("/"):
        if seg in ("", "."):
            out.append(seg)
            continue
        if seg == "..":
            cur = os.path.dirname(cur) or "."
            out.append(seg)
            continue
        if not os.path.isdir(cur):
            return None
        entries = os.listdir(cur)
        if seg in entries:
            out.append(seg)
            cur = os.path.join(cur, seg)
            continue
        want = slug_of(seg)
        cands = [e for e in entries if slug_of(e) == want]
        if len(cands) != 1:
            return None
        out.append(cands[0])
        cur = os.path.join(cur, cands[0])
    return "/".join(out)


def md_files(root):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS and not d.startswith(".")]
        for name in sorted(filenames):
            if name.endswith((".md", ".mdx")):
                yield os.path.join(dirpath, name)


def scan_file(path):
    """Return (hits, refusals, new_text, links_seen).

    A hit is (line_no, old_target, new_target) — a rewrite this script will make.
    A refusal is (line_no, target, reason) — reported, never guessed at.
    """
    text = open(path, encoding="utf-8").read()
    from_dir = os.path.dirname(path) or "."
    lines = text.split("\n")
    hits, refusals = [], []
    links_seen = 0

    for idx, line, is_prose in prose_lines(text):
        if not is_prose:
            continue
        scanned = blank_code_spans(line)
        jobs = []
        for m in LINK_RE.finditer(scanned):
            bang, target = m.group(1), m.group(3)
            if bang:
                continue
            links_seen += 1
            if SCHEME_RE.match(target) or target.startswith(("/", "#")):
                continue
            rel, _, frag = target.partition("#")
            anchor = ("#" + frag) if frag else ""
            if not rel:
                continue
            if resolve_exact(from_dir, rel):
                continue
            fixed = resolve_slug_path(from_dir, rel)
            if fixed is None:
                refusals.append((idx + 1, rel, "no single file matches this target"))
                continue
            jobs.append((m.start(), len(m.group(0)), target, fixed + anchor))

        # Right to left, so earlier offsets stay valid.
        for start, length, old, new in reversed(jobs):
            seg = line[start:start + length]
            replaced = seg.replace("(%s)" % old, "(%s)" % new, 1)
            if replaced == seg:
                refusals.append((idx + 1, old, "could not splice the replacement"))
                continue
            line = line[:start] + replaced + line[start + length:]
            hits.append((idx + 1, old, new))
        lines[idx] = line

    return hits, refusals, "\n".join(lines), links_seen


def main():
    p = argparse.ArgumentParser(description=(__doc__ or "").split("\n")[0])
    sub = p.add_subparsers(dest="cmd", required=True)
    for name, help_ in (
        ("detect", "count slug-form links (exit 1 if any)"),
        ("locate", "list them with file, line and the target they will become"),
        ("migrate", "rewrite them (--dry-run to preview)"),
        ("verify", "assert the tree is clean AND that links were parsed"),
    ):
        sp = sub.add_parser(name, help=help_)
        sp.add_argument("root")
        if name == "migrate":
            sp.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    if not os.path.isdir(args.root):
        print("Not found: %s" % args.root, file=sys.stderr)
        return 1

    total_files = total_hits = total_refused = total_links = scanned_files = 0

    for path in md_files(args.root):
        scanned_files += 1
        hits, refusals, new_text, links_seen = scan_file(path)
        total_links += links_seen
        total_refused += len(refusals)
        if not hits and not refusals:
            continue
        rel = os.path.relpath(path, args.root)
        if hits:
            total_files += 1
            total_hits += len(hits)
        if args.cmd == "locate":
            for line, old, new in hits:
                print("  %s:%d: %s  ->  %s" % (rel, line, old, new))
        elif args.cmd == "migrate":
            print("  %s: %d link(s) rewritten" % (rel, len(hits)))
            if not args.dry_run and hits:
                open(path, "w", encoding="utf-8").write(new_text)
        for line, target, reason in refusals:
            print("  REFUSED %s:%d: %s — %s" % (rel, line, target, reason), file=sys.stderr)

    verb = args.cmd + (" (dry-run)" if args.cmd == "migrate" and getattr(args, "dry_run", False) else "")
    # Refusals are stated on the summary line as well as on stderr. Otherwise a
    # run reads "0 link(s)" and exits 1, which looks like the script is broken
    # rather than like there is manual work waiting.
    tail = "" if not total_refused else ", %d refused" % total_refused
    print("slug-form-links %s: %d file(s), %d link(s)%s under %s"
          % (verb, total_files, total_hits, tail, args.root))
    if total_refused:
        print("%d link(s) REFUSED — a target no single file matches. These are broken "
              "links rather than slug-form ones; fix them by hand. The script will not guess."
              % total_refused, file=sys.stderr)

    # A run that inspected nothing must never read as a pass. Both halves of that
    # are checked: files found, and links actually parsed out of them.
    if scanned_files == 0:
        print("no markdown found under %s — nothing was checked" % args.root, file=sys.stderr)
        return 1
    if total_links == 0:
        print("%d file(s) but zero links parsed — the matcher is not working" % scanned_files, file=sys.stderr)
        return 1

    if args.cmd in ("detect", "locate", "verify"):
        return 1 if (total_hits or total_refused) else 0
    return 1 if total_refused else 0


if __name__ == "__main__":
    sys.exit(main())
