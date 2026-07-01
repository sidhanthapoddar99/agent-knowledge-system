# Glossary — demo issue

Key terms and conventions used in **this** issue. (Every issue can carry its own
`glossary.md`; when absent, the Glossary panel shows an empty state.)

## Sections
- **Brainstorm** — active deliberation (process). **Notes** — finalized output (product).
- **Agent log** — execution record as `NNN_<code>_<name>/` activity folders, one per *kind*.
- **Agent memory** — AI-mutable working state, always-on.

## Badges
- **`NN`** — the filename ordering prefix.
- **`#N`** — an agent-log **iteration** (frontmatter `iteration:`); takes precedence over
  the filename prefix for both the badge and the sort order.

> Agent-log **kind codes** (`lp`/`au`/`rf`/`it`/`wf`, plus this issue's custom `ex`) are
> *not* documented here — they live in `settings.json` (`agentLogKinds`) and surface in the
> **Guide**. The glossary is just prose.

## Colour conventions (as used in this fixture)
The optional `color:` frontmatter tints a sidebar row's label. In this demo:

- <span style="color:#7aa2f7">**blue**</span> — an exploratory option still in play
  (`brainstorm/01_options/01_approach-a`).
- <span style="color:#e5a663">**amber**</span> — an iteration milestone worth
  eyeballing (`agent-log/050_it_ui/101_sizing-tweaks`).

Colour carries **no framework-defined meaning** — this table is what makes it legible,
which is exactly why the Glossary is the right home for it.
