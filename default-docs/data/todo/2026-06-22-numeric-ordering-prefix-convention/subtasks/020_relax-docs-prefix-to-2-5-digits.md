---
title: Relax docs prefix to 2–5 digits across the 5 hard-coded spots
done: true
state: closed
---

Move every fixed-`\d{2}` docs assumption onto the shared helper / `\d{2,5}`:

- `parsers/content-types/docs.ts` — prefix extraction + `generateSlug`
- `parsers/core/base-parser.ts` — "has a prefix?" detector
- `parsers/postprocessors/internal-links.ts` — URL prefix strip
- `loaders/data.ts` — sidebar sort key regex (sort is already numeric; only the width blocks)

Before starting, grep exhaustively for `\d{2}`, `{2}`, `\d\d` near prefix/slug/order logic
so nothing is missed (a missed spot fails silently). Keep `_` as the docs separator.
