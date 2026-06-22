---
title: "Code file editing — lazy-loaded language modes"
state: open
---

Editor opens non-markdown files (JS/TS/JSON/YAML/CSS/HTML/Python) with the right CM6 language extension, loaded on demand so the bundle stays small for the markdown-only path.

## Tasks

- [ ] Map file extension → CM6 language package
- [ ] Lazy `import()` per language so unused modes don't ship in the initial bundle
- [ ] Fall back to plain text for unknown extensions
