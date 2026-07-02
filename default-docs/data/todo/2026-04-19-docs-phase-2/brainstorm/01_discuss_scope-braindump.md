# Scope braindump — verbatim + structured interpretation

> **Resolved →** subtasks/ (expanded into subtasks 01–06)

## Verbatim from the user

> lets add quick sub tasks which are on top of mind in issues.md we will expand and convert to subtasks a bit later
>
> New Theme system -- update required at theme config
> New Theme system -- update is required at dev docs about standardization
> - we did a sizing and color standardization etc
>
> Check for config updates are there any more configs that require update?
>
> Dev tools
> - new dev tools (ram and cache tool)
> - new dev tools structure and common file
> - make  live editor a seperate part -- not adding live editor now as its a complete module by itself
>
>
> - Add a new issues layout
> - the new layout system
> - for user guide move the layout to outside like Docs Blogs Issues Custom would be their own headers so we would have
> -- Writing Content : its own thing move the layout logic outside byt markdown editing logics are good and
> -- Layout System : Simple explanation what are layout its config and settings, types and overview of their structure
> -- Docs
> -- Blogs
> -- Issues : purpose and all as well why its ai native
> -- Custom
>
> - there is no need for user to understand the code strucure or the project structure that code be move to the dev docs
> - claude skills are fine and its good we are giving emphasis to strucure of layouts etc basically how the write the Docs and Use it without changing or being concerned about the actual backend or frontend logics
>
> the Dev Docs on the other hand is not concered with the logics of how to write just basic struture to follow etc how data is parsed
>
> internal doc structure
>
> it also refers to check the config settings etc
>
> not concered with the claude skills etc
>
>
> These are just for user guide update
>
> for docs we would
>
> first define the main components of our code base which is
> - over all architecture
> - parsers
> - routing system
> - layout system
> - caching system
> - scripts
> - dev toolkits
> - optimizations
> - theme systems
>
> somthing like this which gives overall idea
>
> does this makes sense
>
> can you please create a agent log with exact what i wrote and then your interpretation in the initial comment
>
> from interpretation i mean more structure way to saying what i wrote

## Structured interpretation

Read as: "Here's what phase-2 added, and here's how the *information architecture* of our docs needs to change — split cleanly between user-guide (audience: people writing docs) and dev-docs (audience: people working on the codebase)."

### 1. Cross-cutting items (appear in both guides)

**Theme system** — phase 2 introduced a standardization pass across sizing and colour: a required-variables contract, a two-tier token model (primitives vs semantic UI/content/display tiers), no invented names, no hardcoded fallbacks.

- *User-guide angle*: the theme **config** page — how users pick / author a theme using the declared tokens.
- *Dev-docs angle*: the **standardization rationale** — why the contract exists, how layouts consume it, the mistakes it prevents.

**Config audit** — phase 2 moved / added config surfaces. Sweep `site.yaml`, `navbar.yaml`, `footer.yaml`, tracker `settings.json`, and flag anything the user-guide config section doesn't yet cover.

### 2. User-guide restructure

The user guide should be read by someone who has zero intent to touch backend or frontend code — just write content. So:

**Drop from user-guide**: code structure, project structure, any "how the backend works" material. Move that into dev-docs.

**Keep / emphasize in user-guide**: how to write content, how to pick and configure a layout, Claude skills.

**New top-level IA for user-guide:**

1. **Writing Content** — markdown conventions, frontmatter, custom tags, editing via the live editor. Layout mechanics *leave* this section.
2. **Layout System** — a simple overview: what a layout is, its config/settings, the four types (docs / blog / issues / custom), how they're structured at a glance.
3. **Docs** — authoring docs layouts.
4. **Blogs** — authoring blog layouts.
5. **Issues** — purpose, folder-per-item data model, why it's AI-native (subtasks/notes/agent-log are machine-writable + human-readable).
6. **Custom** — custom / marketing / landing layouts.

The point is: Docs / Blogs / Issues / Custom each become top-level sections instead of being buried under a generic "layouts" section.

### 3. Dev-docs restructure

The dev-docs are read by someone working on the framework itself. They should *not* duplicate the "how to write docs" material from the user-guide. They should:

- Explain the basic structural rules the codebase follows.
- Explain how data is parsed end-to-end.
- Cover internal doc structure conventions.
- Point at config settings from the *implementation* angle (what each surface controls, how it's loaded).
- Explicitly *not* cover Claude skills (that's user-facing).

**Open with a top-level component map** so a reader can orient before drilling in:

1. Overall architecture
2. Parsers
3. Routing system
4. Layout system
5. Caching system
6. Scripts
7. Dev toolkits
8. Optimizations
9. Theme system

### 4. Dev tools (dev-docs chapter)

Three items:

1. The two new toolbar apps — **system-metrics** (RAM / CPU) and **cache-inspector** (Yjs rooms, editor docs, presence). What they show, how to read it.
2. The new **`src/dev-tools/` folder-per-tool layout** and the `_shared/` common layer (CSS tokens now, formatters / types likely next).
3. The **live editor** gets lifted out as its own standalone module — deliberately *not* re-scoped into this docs-update pass, because it's large enough to warrant its own issue.

### 5. Deferred / explicit non-goals for this issue

- Rewriting the live-editor documentation (separate module / separate issue).
- Documenting phase-3 features (search, plugin system) that haven't landed.
- Auto-generating API reference.

## Does this make sense? → yes

The core move is: **split audiences cleanly** (writer vs. maintainer), **flatten the layout IA** in the user guide (each content type becomes its own top-level section instead of a sub-node under "layouts"), and **lead dev-docs with a component map** so the shape of the codebase is visible before any one file is.

Next step (pending user sign-off): expand each bullet under "Quick subtasks" in `issue.md` into a proper subtask file under `subtasks/`, with done flags and explicit before/after diffs for the affected pages.
