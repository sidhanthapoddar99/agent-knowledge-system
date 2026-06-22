---
title: Build + render-test 3-digit and grouped pages
done: true
state: closed
---

Prove the change end-to-end before closing:

- Add throwaway test pages mixing widths and a group: `05_a.md`, `010_b.md`, plus a grouped
  set `110_x.md` / `120_y.md` / `210_z.md` in one section.
- `./start build` (or dev) and confirm: they **build**, **sort by numeric value**
  (5, 10, then group 1 before group 2), and produce **prefix-stripped URLs**
  (`/.../a`, `/.../b`, `/.../x` …).
- Confirm an existing 2-digit section is byte-for-byte unchanged (same URLs + order).
- Run `docs-check-section` on the test section (accepts 2–5, rejects 1 / >5, flags numeric
  collisions). Remove the throwaway pages after.
