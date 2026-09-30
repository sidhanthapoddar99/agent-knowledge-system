---
title: "Phase 2: editing, the dev toolbar and libraries"
status: in-progress
outcome: "People edit in place; projects pull library elements through dep.yaml and dep.lock"
notes: "Starts when [Phase 1](./20_phase-1-rendering.md) renders with parity"
who: "claude"
subtasks:
  - "[110/10 The dev toolbar: the bar, Edit and the tools](../../subtasks/110_editing/10_dev-toolbar.md)"
  - "[110/20 Edit in place: turning the page into its editor](../../subtasks/110_editing/20_edit-in-place.md)"
  - "[110/30 Live preview: carry over and improve today's CodeMirror 6 engine](../../subtasks/110_editing/30_live-preview.md)"
  - "[110/40 The save path: server-held document, autosave, safe writes, echo suppression](../../subtasks/110_editing/40_save-path-and-sync.md)"
  - "[110/50 Diagram editing in place (single-user)](../../subtasks/110_editing/50_diagram-editing.md)"
  - "[110/60 Authoring helpers: what survives of editor-advanced](../../subtasks/110_editing/60_authoring-helpers.md)"
  - "[050/35 File writes and echo suppression — `open` and `save` on the server](../../subtasks/050_server/35_file-writes-and-echo-suppression.md)"
  - "[060/10 yrs document per file — the server-held live document](../../subtasks/060_collaboration/10_yrs-document-per-file.md)"
  - "[120/10 dep.yaml and dep.lock: parse, validate and write](../../subtasks/120_libraries/10_dep-yaml-and-lock.md)"
  - "[120/20 Fetch and resolve: selectors, tags and the sync](../../subtasks/120_libraries/20_fetch-and-resolve.md)"
  - "[120/30 manifest.json, local libraries and the library.json catalog](../../subtasks/120_libraries/30_manifest-and-catalog.md)"
  - "[120/40 agentks install, agentks library and check libraries](../../subtasks/120_libraries/40_library-commands-and-tui.md)"
  - "[120/50 The /_lib/ route, the sandbox, and the hosting path prefix](../../subtasks/120_libraries/50_lib-route-and-sandbox.md)"
  - "[120/60 Default library: scaffold the library repository](../../subtasks/120_libraries/60_default-library-scaffold.md)"
  - "[120/70 Elements: the default icon set](../../subtasks/120_libraries/70_elements-icons.md)"
  - "[120/75 Elements: frames and HTML widgets](../../subtasks/120_libraries/75_elements-frames-and-widgets.md)"
  - "[120/80 Elements: the video cue kit (scene templates and script widgets)](../../subtasks/120_libraries/80_elements-video-cue-kit.md)"
  - "[120/85 Templates: agentks-default and its catalog entry](../../subtasks/120_libraries/85_templates.md)"
  - "[120/90 Library authoring guide](../../subtasks/120_libraries/90_library-authoring-guide.md)"
  - "[040/60 Library cache — the global store of library repositories at one commit](../../subtasks/040_caching/60_library-cache.md)"
  - "[070/40 Init from a template — `agentks init [--template] [path]`](../../subtasks/070_cli/40_init-template.md)"
  - "[030/95 Retrieval index — full-text search for the site and for agents (later stage)](../../subtasks/030_rust-engine/95_retrieval-index.md)"
  - "[130/10 Port the agentks usage plugin: rename and rewrite the ten skills](../../subtasks/130_ai-plugins/10_agentks-plugin-port.md)"
  - "[130/20 The library-development plugin (agentks-library)](../../subtasks/130_ai-plugins/20_library-dev-plugin.md)"
---

Editing in place (raw and live preview, diagrams), the dev toolbar, libraries and templates, and the rewritten plugin.

# 01 To Do
- [ ] **Editing:** dev toolbar, edit in place, live preview, the save path, diagram editing (group 110, 050/35, 060/10).
- [ ] **Libraries:** dep.yaml, dep.lock, fetch, manifest, catalog, commands, `/_lib/`, the default library and its elements, templates (group 120, 040/60, 070/40).
- [ ] **Search index** for the local client (030/95).
- [ ] **AI plugins** rewritten for agentks (130/10, 130/20).

# 02 Status and Result
Not started.

# 03 References
- [The plan overview](./overview.md)
- The design: [notes index](../../notes/01_overview/01_index.md)

# 04 Decisions
- See [the plan overview](./overview.md#04-decisions).

# 05 Notes & Analysis
## 01 Scope
The `subtasks:` list above is the whole scope of this stage. Each subtask is written for a cold start: read its references first.
