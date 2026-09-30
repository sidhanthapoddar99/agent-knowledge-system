---
title: T4a Library restructure — components/<category>/ and the full Lucide icon set
status: review
---

Every library gets components/<category>/ with fifteen fixed categories, and the manifest gains a required category. The rename is free only until the library's first tag, so it happens now. Design: brainstorm/01_video-artifact-engine/08_library-components.md.

# 01 To Do
- [x] Create `components/<category>/` for all fifteen categories, each with a `README.md` that states its contract, plus `components/README.md` with the table of all fifteen
- [x] Move the 74 icons to `components/icons/` and the three widgets to `components/widgets/`
- [x] Turn the six HTML frames into `components/widgets/<device>-view.html` (category `widgets`)
- [x] Give every manifest entry a required `category` that matches its folder; update every `file`
- [x] `scripts/check.py`: the fixed category list, the folder-matches-category rule, `README.md` allowed per category folder; tests in `scripts/test_check.py`
- [x] `scripts/import_lucide.py`: a re-runnable import of the pinned Lucide release, with tests; run it; confirm `LICENSES/lucide.txt`
- [x] Update every reference: `manifest.json`, `library.json`, `preview/`, `README.md`, `AGENTS.md`, scripts, tests (CI needed no change)
- [x] `AGENTS.md`: document `components/<category>/`, the `category` field, where the contracts live, and the `<device>-view` `src` exception
- [x] Keep the library's checks green

## Guardrails
- Write only in the library repository (not `.git`) and this file. No git command that changes anything; the orchestrator commits.
- The library's version stays 0.1.0 and it stays untagged.
- Element names stay unique across the library, so `/_lib/<alias>/<element>` does not change.
- `scripts/check.py` keeps only structural rules and its sync step. Per-category content contracts belong to `agentks check libraries` in Rust.
- The 74 curated icons keep their names and win every name clash with Lucide.

## Done when
- All fifteen category folders exist with a `README.md`, and every element sits in the folder its `category` names.
- The full Lucide release is in `components/icons/` with a manifest entry per icon, and running the import twice changes nothing.
- `python3 scripts/check.py` and `python3 -m unittest discover -s scripts` pass.

# 02 Status and Result
In review: the restructure and the Lucide import are done and the checks pass. They are on the library's `main` as commit `ff3c325`, from 2026-10-01.

## Result
In `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system-library`:

- `components/` holds the fifteen category folders, each with a `README.md` contract, and `components/README.md` with the table.
- `components/icons/`: 1,897 icons. That is the 74 curated icons plus 1,823 from Lucide 1.49.0. Lucide has 1,857 icons, but 34 share a name with a curated icon, and the curated one wins: archive, arrow-right, book, bug, check, clock, cloud, code, container, cpu, cross, database, file, folder, image, info, key, laptop, link, lock, mail, merge, network, package, phone, search, server, settings, tag, terminal, user, video, webhook, workflow. The largest icon is 1,164 bytes; all icons together are 700,988 bytes.
- `components/widgets/`: `browser-view`, `code-view`, `laptop-view`, `phone-view`, `tablet-view`, `terminal-view`, `callout-card`, `kv-table`, `step-list`.
- `manifest.json`: 1,906 elements, each with `category`. It is 602,617 bytes. Each tag list sits on one line.
- `scripts/import_lucide.py`: fetches the source archive of Lucide tag 1.49.0 (5.5 MB) and checks a pinned content digest. It then converts each icon and writes the files, the manifest entries and `LICENSES/lucide.txt`. A run takes about 2 seconds, and a second run changes no file (tree hash compared before and after).
- The source archive matches the npm package `lucide-static` 1.49.0 (npm's sha512 integrity checked) for all 1,857 icons and their tags.
- `LICENSES/lucide.txt` was already identical to the release's ISC licence, and it covers the whole set.
- Commands and results:
  - `python3 scripts/check.py` prints `ok: agentks-default 0.1.0, 1906 elements` in 0.16 s.
  - `python3 -m unittest discover -s scripts` runs 28 tests, OK, in 0.23 s.
  - `python3 scripts/check.py --tag v0.1.0` passes.
  - `uv run scripts/import_lucide.py` prints `Lucide 1.49.0: 1857 icons; 1823 imported …; 34 kept as curated`.
- The preview page groups elements by category and filters by name or tag. Headless Chromium screenshots are in `/home/sid/projects/06_02_NeuraLabs/agent-knowledge-system/data/library-restructure/` (`preview-light.png`, `preview-dark.png`).

## Agent log
none

# 03 References
- [01/01 Video artifact engine — index](../brainstorm/01_video-artifact-engine/01_index.md): decisions 25, 28, 31 and 32; track T4a
- [01/08 Library components](../brainstorm/01_video-artifact-engine/08_library-components.md): the categories, the manifest, each category's contract, the day-one set
- [Comment 002, lean library-driven video](../comments/002_2026-09-30_lean-library-driven-video.md)
- [Migration note, the library system](../../2026-09-29-rust-core-engine-migration/notes/04_ecosystem/01_library-system.md)

# 04 Decisions
## 01 Structure and the check
- Decided (claude, 2026-10-01): an element's `file` must be exactly `components/<category>/<name>.<ext>`, so the file name is the element name. The design already names a manifest-less library's elements this way, and one rule then serves both kinds of library.
- Decided (claude, 2026-10-01): `scripts/check.py` checks each category's file type and size cap from the design's table, in place of the old flat caps (2 KB for any SVG, 15 KB for any HTML). With the old caps, T4b's 12 KB frame SVGs would fail as "icons".
- Decided (claude, 2026-10-01): the icon format check and the HTML element rules stay in `scripts/check.py` until `agentks check libraries` exists. No new per-category content rule goes in. Removing the existing checks now would leave the library unchecked.
- Decided (claude, 2026-10-01): the "no `<text>`" rule now applies to icons only. The design allows `<text data-label>` in frames, so the old all-SVG rule would reject T4b's frames. The icon check also gained round caps and joins and "no ids", both from the icon contract.
- Decided (claude, 2026-10-01): the check requires all fifteen folders, each with a `README.md`, plus `components/README.md`. It rejects any other entry in `components/`. This keeps the structure visible, and git keeps the empty folders because each holds a README.

## 02 The Lucide import
- Decided (claude, 2026-10-01): the import reads Lucide's GitHub source archive for tag 1.49.0, not the npm package. Only the source has Lucide's categories (and use cases). The pin is a SHA-256 over the files the script reads, not over the archive bytes, because GitHub may compress the same tag differently over time.
- Decided (claude, 2026-10-01): the script uses only the standard library, with an empty PEP 723 block, so `uv run` and plain `python3` both work, and the unit tests can import it with no install.
- Decided (claude, 2026-10-01): an imported icon carries the tag `lucide` first. The script treats exactly those icons as its own on a re-run, and a curated icon must never carry the tag. The manifest has no other field to mark where an element came from, and the tag also lets `library find lucide` work.
- Decided (claude, 2026-10-01): the icons are converted, not stripped. Anything outside the icon contract stops the import with an error: an unknown element, an attribute, an id, a colour other than `currentColor`, or more than 2 KB. A small dot may use `fill="currentColor"`, as the curated `key` and `tag` icons already do.
- Decided (claude, 2026-10-01): an imported icon's description reads `Lucide icon "<name>" (<categories>).`, plus Lucide's first use case when it has one, plus a note when Lucide marks the icon deprecated. Its tags are `lucide`, then Lucide's tags, then its categories.
- Decided (claude, 2026-10-01): the three icons that Lucide marks deprecated are imported like the rest. The design counts all 1,857.

## 03 Names and wording
- Decided (claude, 2026-10-01): the view widgets gained the tags `widget` and `view`, and the library's description in `library.json` and `manifest.json` now names the Lucide set and the device views.

# 05 Notes & Analysis
## Watch out
- The design's count "1,857 plus 74" is 1,897 distinct icons, not 1,931, because 34 names overlap.
- The README still names the library with the alias `default` in its examples, while the design gives the starter template the alias `ks`. This track did not change that.
