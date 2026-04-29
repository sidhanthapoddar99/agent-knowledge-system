# Notes — level 3 (depth 3, over the cap)

This is for testing the 2-level subfolder tree (subtask 20).

This note is intentionally placed too deep — at `notes/design/phase-1/deeper/level-3-note.md`, three folders below `notes/`. The loader caps depth at 2, so this folder should be skipped and the build should log a warning like:

```
[issues] "2026-04-10-issues-layout": notes/design/phase-1/deeper/ exceeds the 2-level depth cap — ignored
```

It should NOT appear in the sidebar.
