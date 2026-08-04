---
title: "The Comprehensive panel — the case no relative href can ever satisfy"
status: open
---

# Overview

**The same subtask HTML is displayed at two different URL depths, so one baked
relative href cannot be right for both.** This is the sharpest statement of why
[the shared resolver](./020_the-shared-resolver.md) is the fix and no slash
policy is: it breaks with the trailing-slash question entirely removed.

Two screens, one set of bytes:

- **The subtask's own page.** Sidebar → click the subtask → the address becomes
  `/todo/<issue>/subtasks/03_…`. **Deep.**
- **The Comprehensive tab.** On the issue's detail page, clicking *Comprehensive*
  stacks every subtask's full body inline — a **client-side tab swap** via
  `panels.ts`, not a navigation, so the address stays `/todo/<issue>`. **Shallow.**

A link authored as `../../2026-05-07-cache-isolation-cross-project/issue`, frozen
into the HTML at build time, resolves against whichever address the reader is on:

```
Own page   /todo/<issue>/subtasks/03_…      Comprehensive   /todo/<issue>
  current: /todo/<issue>/subtasks/            current: /todo/
  ../   →  /todo/<issue>/                     ../   →  /
  ../.. →  /todo/                             ../.. →  /        (clamped at root)
  + tgt →  /todo/cache-isolation/issue ✅     + tgt →  /cache-isolation/issue ❌ 404
```

Verified live on `:3088`, 2026-06-09.

**Done when** every link inside a Comprehensive-panel body resolves to the same
target it resolves to on the subtask's own page.

# Why this is its own subtask and not a line in the resolver's checklist

Because it is the **acceptance test for the whole approach.** The trailing-slash
matrix has two columns and a fix could plausibly pick one; this has no columns to
pick — the content genuinely lives at two depths at once. If a proposed fix
cannot make this case work, it is not a fix, regardless of what the link counts
say.

It is also the case a live crawler **cannot** catch, because the panel is a
client-side swap: crawling `/todo/<issue>` fetches the server's HTML, and the
stacked bodies are assembled in the browser afterwards. It needs a browser check,
by hand or scripted.

# Done when

- [ ] Land [the shared resolver](./020_the-shared-resolver.md) — this subtask
      adds no separate mechanism
- [ ] Open an issue's **Comprehensive** tab in a browser and click a relative
      cross-issue link inside a stacked subtask body; it reaches the same page as
      the identical link on that subtask's own page
- [ ] Do the same for a link to a **sibling subtask** and to an **asset**, which
      resolve through different code paths
- [ ] Remove the interim `issue-body-links.ts` postprocessor once the general
      pass covers the tracker's root `issue.md` — see
      [unify the tracker and blog](./050_unify-tracker-and-blog.md)

# References

- The design: [the path map](../../notes/30_the-path-map.md)
- The mechanism this shares a root cause with:
  [the trailing-slash matrix](../../notes/10_the-trailing-slash-matrix.html)
- The panel: `astro-doc-code/src/layouts/issues/default/parts/` (`panels.ts`)
- The interim postprocessor this deletes:
  `astro-doc-code/src/parsers/postprocessors/issue-body-links.ts`
- Recorded as an architectural rule for the Go rewrite in
  [the structure note](../../../2026-05-08-runtime-stack-migration/notes/architecture-update/01_the-structure.md)
  — per-structure URL rules own the file-path → URL mapping, and the renderer
  emits absolute links

# Details

## The generalisable statement

**A relative link encodes "N steps up from *here*", and "here" is a property of
the display surface, not of the content.** Any system that renders the same
content at more than one URL — a panel, an embed, a preview, a search-result
excerpt, an RSS body — makes relative links unanswerable. This project already
has at least three such surfaces.

That is the argument for absolute resolution independent of any trailing-slash
consideration, and it is why the decision taken on 2026-06-09 still stands after
everything measured on 2026-08-04.

## Where this came from

Opened as subtask `03` of the issue-link-resolution issue on 2026-06-09, which
decided render-time absolute resolution and shipped the interim
`issue-body-links.ts` postprocessor as `02`. Moved here on 2026-08-04 when that
issue closed, because the decision it recorded is this issue's whole premise
rather than a loose end of that one.
