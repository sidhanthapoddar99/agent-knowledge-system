---
title: "Discuss — one reader or four"
---

> **Resolved →** [notes/01_decided-architecture.md](../notes/01_decided-architecture.md)

# One reader, or four?

**Resolved, and the trail stays.** The marker is one line at the top; the file is
not deleted and not moved. The note holds the distilled *what*; this holds the
*why*, including the option that lost.

## The argument for one pluggable reader

Four functions that each walk a folder tree look like duplication. A single
reader with a per-section descriptor would collapse them, and adding a section
would be one descriptor.

## Why it lost

The four shapes are not the same walk with different names:

| Section | What its reader must do |
|---|---|
| subtasks | key on `slug`, carry a status, count into groups |
| free-form | key on `name`, accept `.html` and diagrams |
| agent-log | reserved folder names, a per-folder `settings.json`, recursive children |
| plans | fixed two-level shape, resolve references at render |

A descriptor expressive enough to cover all four is a plugin system, and a plugin
system built to avoid four functions is more code and less legible.

**What survived the argument:** the *identity* of a section — its folder, URL,
label, icon — genuinely is uniform, and that became the registry. The reading is
not, and stayed four functions.
