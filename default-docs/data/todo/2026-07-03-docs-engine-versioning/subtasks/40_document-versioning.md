---
title: "Document the versioning structure in the user-guide"
status: done
---

- [x] New page under `10_configuration/`: the version contract — `N.N.N` (major
      0 in beta), `engine_version` in site.yaml, missing → `0.0.0`, the two
      gate errors verbatim, and the upgrade flow (ask your AI; scripts in
      `migration/`; detect → dry-run → migrate → verify → bump).
- [x] Register the page in the section flow (settings.json ordering; sidebar).
- [x] Cross-link from the site.yaml configuration page's key reference.
- [x] Quote the real error messages from the shipped gate — never paraphrase
      (the message is effectively a prompt for the reader's AI).
- [x] Dedicated **dev-docs `30_versioning/` section** (added on review,
      sidhantha): last section of dev-docs, five pages — overview / version
      gate / minimum version / migrations / authoring migrations — carrying the
      full engineering detail incl. the breaking-vs-good-to-have floor
      discipline; cross-linked from the user-guide page.
