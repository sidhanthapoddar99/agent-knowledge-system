# Glossary — demo issue

Key terms and conventions used in **this** issue. (Every issue can carry its own
`glossary.md`; when absent, the Glossary panel shows an empty state. Structure is
case-to-case — use the sections you need, prefer tables and pointers over paragraphs.)

## Colour legend

The optional `color:` frontmatter tints a sidebar row's label. In this demo:

| Colour | Meaning | Example |
|---|---|---|
| <span style="color:#7aa2f7">**blue**</span> | An exploratory option still in play. | `brainstorm/01_options/01_approach-a` |
| <span style="color:#e5a663">**amber**</span> | An iteration milestone worth eyeballing. | `agent-log/050_it_ui/101_sizing-tweaks` |

Colour carries **no framework-defined meaning** — this legend is what makes it legible,
which is exactly why the Glossary is the right home for it.

## Key terms

| Term | Meaning |
|---|---|
| **Brainstorm** | Active deliberation — the *process*. |
| **Notes** | Finalized output + references — the *product*. |
| **Agent log** | Execution record: `NNN_<code>_<name>/` activity folders, one per kind. |
| **Agent memory** | AI-mutable working state, always-on, `memory.md` index first. |

## Conventions

| Pattern | Meaning |
|---|---|
| `NN` badge | The filename ordering prefix. |
| `#N` badge | An agent-log **iteration** (frontmatter `iteration:`) — overrides the filename prefix for badge *and* sort. |
| `ex` activity code | This issue's custom **experiment** kind — quick spikes that may be kept or discarded. |

> Agent-log **kind codes** themselves (`lp`/`au`/`rf`/`it`/`wf`, plus custom ones like
> `ex`) are declared in `settings.json` (`agentLogKinds`) and surface in the **Guide** —
> the glossary only explains their *semantics in this issue*, in prose.
