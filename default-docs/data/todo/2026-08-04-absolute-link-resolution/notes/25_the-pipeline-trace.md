---
title: "The pipeline trace — where the path is decided, and who finishes the job"
---

# The answer first

**The renderer decides the *shape* of the link and the browser decides the
*destination*.** That split is the entire defect. Path resolution does not
happen in one place — it happens in two, in two different processes, hours or
days apart, and only the first one has ever seen the file system.

```
   BUILD TIME (our code)              REQUEST TIME (the browser)
   ───────────────────────            ──────────────────────────
   knows: the file tree               knows: the address bar
   knows: the slug rules              knows NOTHING about files
   does:  edits the href text         does:  the actual arithmetic
                        └──────── hands off ────────┘
                            an unfinished answer
```

# 1 · Where the current path resolution sits

One file, one function, and it is a **text edit on a string** — not a resolution:

```
astro-doc-code/src/parsers/postprocessors/internal-links.ts
   └─ rewriteHref(href, addLevel)
```

It sits fifth in a seven-stage pipeline, and its position tells you what it can
see. `DocsParser`, `astro-doc-code/src/parsers/content-types/docs.ts`:

```
  MARKDOWN FILE
       │
       ▼
  ┌──────────────────────┐
  │ PRE   asset-embed    │   [[./assets/code.py]] → inlined
  └──────────────────────┘
       │
       ▼
  ┌──────────────────────┐
  │ RENDER  marked       │   markdown → HTML
  │                      │   [Installation](./02_installation.md)
  │                      │        becomes
  │                      │   <a href="./02_installation.md">
  └──────────────────────┘
       │
       ▼
  ┌──────────────────────┐
  │ POST 1  heading-ids  │
  ├──────────────────────┤
  │ POST 2  INTERNAL-    │  ◀── ★ HERE. The only stage that
  │         LINKS        │        touches an <a href>.
  ├──────────────────────┤
  │ POST 3  excalidraw   │
  ├──────────────────────┤
  │ POST 4  asset-src    │  ◀── ★ AND HERE — <img src> → ABSOLUTE
  ├──────────────────────┤        /content-assets/…
  │ POST 5  external     │
  ├──────────────────────┤
  │ POST 6  table-wrap   │
  └──────────────────────┘
       │
       ▼
  HTML, frozen into dist/
```

**Look at stages 2 and 4 together — this is the whole finding in one screen.**
The same file's `<img>` and `<a>` go through the same pipeline, and:

```
  <img src="./assets/diagram.png">   →   /content-assets/user-guide/…/diagram.png
                                          └──── ABSOLUTE. Never breaks. ────┘

  <a href="./02_installation.md">    →   ./installation
                                          └── RELATIVE. Breaks. ──┘
```

`asset-src.ts` carries the reason in its own comment: *"content folders aren't
served at any browser-relative position."* **That is equally true of pages.** The
image pipeline learned this and resolved absolutely; the link pipeline never did.
The fix is to make stage 2 behave like stage 4.

# 2 · How the data flows

One link, every byte, from disk to click:

```
① FILE ON DISK
   default-docs/data/user-guide/05_getting-started/01_overview.md

   [Installation](./02_installation.md)
                  └────────┬─────────┘
                    what you wrote — TRUE ON DISK
                    (02_installation.md really is a sibling)


② RENDERER — internal-links.ts, rewriteHref()
   Four string operations. No file is opened. No URL is looked up.

   ./02_installation.md
   ./02_installation        ← strip  .md            PAGE_EXT_STRIP_RE
   ./installation           ← strip  02_            stripPrefix() per segment
   ./installation           ← collapse /index       (not applicable here)
   ./installation           ← NO SHIFT              ← today
     ../installation        ← +1 level              ← what the shift did


③ HTML IN dist/
   <a href="./installation">Installation</a>
             └─────┬──────┘
        STILL RELATIVE — the job is only half done.
        This string is now frozen. It ships. It cannot
        change based on who asks for it or from where.


④ BROWSER — the half nobody wrote
   The browser takes the address bar, throws away everything
   after the last "/", and glues the href onto what is left.

   address bar   /user-guide/getting-started/overview
                 └───────────┬──────────────┘└──┬───┘
                     directory portion        discarded
                                              (no trailing slash ⇒
                                               "overview" is a FILE)

   base          /user-guide/getting-started/
   href          ./installation
                 ───────────────────────────────────────
   result        /user-guide/getting-started/installation   ✅
```

**Stage ④ is the one our code does not own, and it is the one that decides.** Its
only input is the address bar. Nothing about the file tree, the slug rules, or
the author's intent reaches it.

# 3 · Why dev works and the shift breaks it

Everything turns on **one character in the address bar**, and who put it there.

```
       ┌─────────────────────────────────────────────────────────────┐
       │  WHO ANSWERS THE REQUEST decides whether the URL gets "/"   │
       └─────────────────────────────────────────────────────────────┘

  astro dev / astro preview            a real static host
  ─────────────────────────            ──────────────────
  A ROUTE TABLE.                       A FILE SERVER.
  Looks up "/a/b/c" in a list          Looks for "/a/b/c" on disk.
  of registered routes, finds it,      Finds a DIRECTORY (because every
  serves it.                           page builds as <slug>/index.html).
                                       Web convention since 1993:
  Address stays:  /a/b/c               301 → "/a/b/c/", then index.html
                        ▲
                  no slash             Address becomes: /a/b/c/
                                                              ▲
                                                        slash ADDED
```

Now run stage ④ twice, changing only that character:

```
  ── DEV ────────────────────────────────────────────────────────────

  address   /user-guide/getting-started/overview
                                       └───┬───┘
                          no slash ⇒ "overview" is a FILE
                          ⇒ the directory is one level UP

  base      /user-guide/getting-started/          ← ALREADY at the right place

     ./installation   →  /user-guide/getting-started/installation    ✅
     ../installation  →  /user-guide/installation                    ❌ 404
                          └── the ".." goes up from a base that
                              was already up. It OVERSHOOTS.

  ── STATIC HOST ────────────────────────────────────────────────────

  address   /user-guide/getting-started/overview/
                                               └┬┘
                          slash ⇒ "overview" is a FOLDER I am INSIDE
                          ⇒ the directory is HERE

  base      /user-guide/getting-started/overview/   ← one level too DEEP

     ./installation   →  /user-guide/getting-started/overview/installation  ❌ 404
                          └── points INSIDE the page it's on
     ../installation  →  /user-guide/getting-started/installation           ✅
                          └── the ".." cancels the segment the
                              slash added. Exactly its purpose.
```

**So the shift is not wrong. It is right in one column and wrong in the other,
and it is a constant.**

```
                    dev (no slash)        static host (slash)
                 ┌────────────────────┬────────────────────────┐
   no shift  ./  │   ✅  4 broken     │   ❌  546 broken       │
                 ├────────────────────┼────────────────────────┤
   shift     ../ │   ❌  broken       │   ✅  4 broken         │
                 └────────────────────┴────────────────────────┘
                              a perfect diagonal
```

The two columns differ by **exactly one URL segment**. The shift changes the href
by **exactly one URL segment**. A constant cannot cover a difference equal to
itself — so the diagonal is not bad luck, it is arithmetic. *(The 4 in both
winning cells are missing anchors, not path failures; measured 2026-08-04 over
1,245 in-body links.)*

# What the fix does to this picture

**It deletes stage ④.**

```
   TODAY
   ② renderer writes  ./installation        (half an answer)
   ④ browser computes /user-guide/getting-started/installation
                      └── using an address our code never saw ──┘

   AFTER
   ② renderer writes  /user-guide/getting-started/installation
   ④ browser computes  …nothing. There is no directory portion
                        to resolve against. The href IS the answer.
```

A root-absolute href has no base, so the address bar stops being an input. The
trailing slash **stops mattering** rather than being made uniform — which also
survives an embed at a different depth, a CDN that rewrites paths, and a host
nobody has tested.

The mechanism is [the path map](./30_the-path-map.md):

```
   relative link      →   absolute FILE path        →   absolute WEB url
   ./02_installation.md   …/05_getting-started/          /user-guide/
                            02_installation.md            getting-started/
                                                          installation
                          └── resolve on disk ──┘     └── look up, don't ──┘
                              (fails LOUDLY if           re-derive
                               the file is missing)
```

Stage ② stops editing a string and starts answering a question — which is what
stage 4 of the same pipeline, `asset-src.ts`, has been doing for images all
along.
