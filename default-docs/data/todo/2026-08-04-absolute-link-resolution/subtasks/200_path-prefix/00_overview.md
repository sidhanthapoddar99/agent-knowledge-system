---
title: "The hosting path prefix — serving from a sub-path"
status: blocked
---

# What this group is

**Making the site servable from a sub-path of a domain** — `/xyz/user-guide/…`
rather than `/user-guide/…` — so several static sites can live under one host.

The reasoning, the surfaces it has to cover, and the open questions are in
[the hosting path prefix](../../notes/40_the-hosting-path-prefix.md).

# Why it is here and not in its own issue

**A prefix is only implementable once something owns the final URL.** You cannot
prepend a segment to an href the browser is going to compute for itself. Today no
single place produces a URL, so there is nowhere to put the prefix — and
[the shared resolver](../100_absolute-resolution/020_the-shared-resolver.md)
creates exactly that place.

So this group **cannot start before that one**, and doing it as a separate issue
would mean building the same seam twice.
