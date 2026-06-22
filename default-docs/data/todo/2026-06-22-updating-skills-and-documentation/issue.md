## Goal

Keep the `documentation-guide` skill and the framework's published docs (user-guide +
dev-docs) accurate, consistent, and **lean** as the conventions evolve. This issue
batches skill/doc maintenance work — some already shipped, some queued for discussion.

It pairs with [2026-06-22-numeric-ordering-prefix-convention](../2026-06-22-numeric-ordering-prefix-convention/issue.md):
that issue did the *parser* change; this one tracks the *skill + documentation* surface
that describes the conventions to humans and agents.

## Done

- **Restructure layout references** — moved the three content-type layout references into
  `references/layouts/` and fixed every live pointer. See `subtasks/010_*`.
- **Notation + digit-width standard** — swept `XX_` → `NN_` everywhere, and documented the
  2–5 digit width as a tier (`NN_` default for docs; `NN_`/`NNN_` both conventional in the
  tracker). See `subtasks/020_*`.

## Queued — discuss before implementing

- **Split the issue reference into multiple files** (`subtasks/030_*`) — `issue-layout.md`
  is ~580 lines; loading it whole bloats context.
- **Agent-log structure standardization** (`subtasks/040_*`).
- **Rethink the validators + optimize the skill for token cost** (`subtasks/050_*`).

These three carry only a basic description for now — we'll scope each before starting.

## Tasks

See `subtasks/`. `010` and `020` are closed (shipped this session); `030`–`050` are open
and pending discussion.
