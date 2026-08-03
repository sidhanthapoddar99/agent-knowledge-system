---
title: "Relative in shape, a URL in fact — 334 links name a slug instead of a file"
status: open
---

# Overview

**A link can be relative, pass every gate, and still not be a path.** `./design-philosophy`
is relative. The file is `02_design-philosophy.md`. Nothing on disk is called
`design-philosophy`, so no filesystem tool can follow it — it is the published
URL written in a relative shape.

This is the same defect the group has been chasing all along, wearing the one
costume nothing checks for. A site-absolute link at least *announces* itself with
a leading `/`; this one looks exactly like the correct form.

Measured 2026-08-04 across `default-docs/data`, counting relative link targets
with no file extension:

| Section | Relative links | Written as slugs | |
|---|---:|---:|---|
| `user-guide/` | 487 | **294** | 60% |
| `dev-docs/` | 90 | **14** | 16% |
| `todo/` (tracker) | 1,069 | **26** | 2% |

**334 in total, and the user-guide is where it lives.** The tracker is almost
clean, which fits: tracker links were written against the file tree from the
start, while the user-guide's were rewritten twice — first to site-absolute form
in the 341-link conversion, then back out of it by
[`020`](./020_relative-links-are-the-contract.md). The conversion back restored
the *shape* and not the *target*.

**Done when** every internal link names a file that exists on disk, and a gate
fails when one does not.

# The demonstration

Not inferred — run. `agent-ks move` on
`user-guide/19_issues/02_design-philosophy.md`, dry run. Eight links point at
that file:

| Written as | Count | What `move` did |
|---|---:|---|
| `../02_design-philosophy.md` — the real path | 2 | ✅ **rewritten** to `../03_…` |
| `../design-philosophy` · `./design-philosophy` — the slug | 6 | ❌ **silently skipped** |

`move` printed `2 link edit(s) across 2 file(s)` and a warning about 13
site-absolute links elsewhere. About the six it had just walked past: nothing.

**That silence is the finding.** `move.mjs:261` resolves each target by path
arithmetic and compares it to the file being moved; a slug never matches, so the
link falls through the `continue` on line 268 — which is the same branch a link
that legitimately points somewhere else takes. It is not classified as
unmaintainable, so it is not counted, so it is not reported. **A site-absolute
link is skipped loudly; this one is skipped invisibly.**

# Why nothing catches it

| Gate | Why it passes | |
|---|---|---|
| `check link-form` | asks only *does this start with `/`* | 569 links, 161 files, green |
| `check links` | resolves against the **built site**, where the slug is exactly what works | green |
| `move` | has no concept of a target it cannot resolve | reports nothing |
| the build | renders the href as written | green |

**Every check agrees, and the link is still wrong** — because each one asks about
a different artefact than the rule does. The rule is about the filesystem; two of
the four gates look at the site, one looks at a prefix, and one looks at a diff.

This is the group's recurring shape once more: *a wrong answer indistinguishable
from a right one until someone looks.*

# Todo list

- [ ] **Extend `check link-form` to resolve the target on disk.** A relative
      internal link must name a file that exists — the existence test, not just
      the leading-slash test. That is the control this gate has always been
      missing, and it is what would have caught this class on day one
- [ ] Control-test it both directions: a deliberate slug-form link must fail it,
      and correcting that one link must return the gate to zero
- [ ] Decide how anchors and directory targets are handled (`./folder`,
      `./page#section`) before the rule can be strict — a folder with an
      `index.md` is a legitimate target that has no file of its own name
- [ ] **Convert the 334.** Mechanical: the slug's file is the one whose name
      matches after `NN_` prefix and extension stripping. `user-guide/` first
      (294 of them), then `dev-docs/`, then the tracker's 26
- [ ] Verify the conversion changed no rendered URL — the slug and the source
      path resolve to the same page since 0.2.2, so the site must be unaffected.
      **Build before and after and diff the emitted hrefs**
- [ ] Re-run the `move` demonstration above afterwards: all eight links to
      `design-philosophy` should be rewritten, not two

# Details

## Why this is not a style question

The rule is not "use the source form because it is tidier". A link is a
**reference to a file**, and the project's load-bearing principle is that these
documents are filesystem-first — written so `move`, `grep`, an editor and an
agent walking the tree can all follow them. A slug is a fact about one consumer,
the rendered site. Writing it into the source makes the document depend on the
renderer it is supposed to be independent of.

Concretely, a slug-form link costs:

- **`agent-ks move` cannot follow it**, so it rots on the next rename with
  nothing reporting it — proven above.
- **`grep` for the filename does not find the reference**, so a file's inbound
  links are invisible from the tree.
- **An editor cannot open it**, and neither can Obsidian.
- **It encodes the prefix-stripping rule into content**, so changing that rule —
  or a section that does not strip prefixes, as the tracker does not — silently
  breaks every link written this way.

## Both forms resolve on the site, which is why nobody noticed

Since 0.2.2 the router accepts both spellings and redirects the source form to
the canonical slug ([`140`](./140_dual-slug-url-resolution.md)). So this is
**not** a rendering defect and fixing it changes nothing a reader sees. That is
precisely why it needs a gate rather than a bug report: there is no symptom to
notice.

## Where it came from

[`030`](./030_user-guide-relative-links-404.md) measured 85 broken links and its
fix converted them to site-absolute form. That was reverted, and
[`020`](./020_relative-links-are-the-contract.md) converted 129 links back to
relative. **The conversion back went to slug form, not path form** — understandably,
since the site-absolute links being converted already named slugs
(`/user-guide/issues/design-philosophy`), and dropping the base is the obvious
transformation. Nothing at the time asked whether the remaining path named a
file.

**The generalisable point:** a conversion that fixes the *form* of a link is not
the same as one that fixes its *target*, and a gate that tests the form will
certify both alike.
