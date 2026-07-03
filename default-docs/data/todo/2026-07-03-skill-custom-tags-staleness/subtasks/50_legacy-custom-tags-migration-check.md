---
title: "Migration check — detect legacy custom-tags usage in content"
status: in-progress
---

Content written before the native-markdown-only decision may still carry the retired
syntaxes — the fictional `:::callout{…}` / `:::collapsible` / `:::tabs` directive
form (mass-produced by agents following the old skill, e.g. 45 files in one consumer
migration) and the never-rendering `<callout>` / `<tabs>` / `<collapsible>` tag
form. Since the framework never parses any of these again, leftovers silently render
as raw text. This subtask adds a **migration check** so legacy usage is detected,
reported, and migratable.

- [x] **CLI check** — extend the plugin's `docs-guide check` group (validators live
      in the plugin's `scripts/`, shared helpers in `_check-lib.mjs`) with a
      legacy-custom-tags scan over a content root: flag `:::<known-tag>` fences and
      `<callout|tabs|tab|collapsible>` elements with file:line, and print the
      native replacement for each hit. Respect the uniform contract (`--help`,
      `--json`, exit 0/1/2 — hits exit 1 so it can gate CI). Exclude legitimate
      code-fence examples where feasible (or accept documented false positives).
- [x] **Migration mapping** (the check's suggestion table, also documented in the
      skills): callout `info`→`> [!NOTE]`, `tip`→`> [!TIP]`, `note`→`> [!NOTE]`,
      `warning`→`> [!WARNING]`, `danger`→`> [!CAUTION]` (plus `title=` folding into
      the first bolded line); `collapsible`→`<details><summary>`; `tabs`→sequential
      `###` sections (no native tab equivalent — flatten).
- [x] **Skill guidance** — add a short "legacy content" note to both skills'
      writing references: when touching a page that contains retired tag syntax,
      run the check and migrate the page as part of the edit. Mirror to the
      installed cache.
- [x] Self-test under bun alongside the existing validator tests, and register the
      command in the CLI help + the sibling skill's `cli-toolkit.md` reference.
