# custom/countdown — Countdown Timer Layout

Centered countdown timer to a target date. Self-contained — no sub-components.

## Props (received from route handler)

```typescript
interface Props {
  dataPath: string;   // Absolute path to the YAML data file
}
```

## Data loaded internally

```typescript
const fileContent = await loadFile(dataPath);
const pageData = fileContent.data;
```

## Expected YAML shape

```yaml
title: "Launch Countdown"         # required
subtitle: "Something big is coming"  # optional
targetDate: "2026-03-01T00:00:00"    # ISO datetime string
amount: "$99"                        # optional — displayed prominently above timer
note: "Early bird pricing ends soon" # optional — shown below timer
```

## Components in this folder

| File | Purpose |
|------|---------|
| `Layout.astro` | Entry point — loads YAML, renders timer with inline `<script>` + `<style>` |

This layout is self-contained: no sub-components. The timer uses `requestAnimationFrame` for smooth updates and includes its own scoped `<style>` block using theme CSS variables.

## Visual structure

```
┌──────────────────────────────────────────────────────────────┐
│                          Navbar                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                         Title                               │
│                        Subtitle                             │
│                         Amount                              │
│                                                              │
│            [ DD ]  :  [ HH ]  :  [ MM ]  :  [ SS ]          │
│            Days       Hours     Minutes    Seconds           │
│                                                              │
│                          Note                               │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                          Footer                              │
└──────────────────────────────────────────────────────────────┘
```
