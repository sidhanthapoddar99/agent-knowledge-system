# custom/info — Simple Content Page Layout

Minimal single-column layout for about pages, legal pages, etc. Loads its own data from YAML.

## Props (received from route handler)

```typescript
interface Props {
  dataPath: string;   // Absolute path to the YAML data file (e.g. pages/about.yaml)
}
```

## Data loaded internally

```typescript
const fileContent = await loadFile(dataPath);
const pageData = fileContent.data;
// pageData.title, pageData.description
```

## Expected YAML shape

```yaml
title: "About Us"
description: |
  We are a team of developers passionate about creating
  great documentation experiences.

  Our mission is to make documentation easy and beautiful.
```

## Components in this folder

| File | Purpose |
|------|---------|
| `Layout.astro` | Entry point — loads YAML and passes to Content |
| `Content.astro` | Renders title and description in a centered container |

## Visual structure

```
┌──────────────────────────────────────────────────────────────┐
│                          Navbar                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Title                                                      │
│                                                              │
│   Description content here...                                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                          Footer                              │
└──────────────────────────────────────────────────────────────┘
```
