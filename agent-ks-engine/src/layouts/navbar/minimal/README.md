# navbar/minimal — Minimal Navbar

Logo + flat navigation links (no dropdowns) + theme toggle. Clean, low-noise design.

## Props (received from BaseLayout)

```typescript
interface Props {
  currentPath?: string;   // Current URL path — used for active state highlighting
}
```

## Data loaded internally

```typescript
const config = loadNavbarConfig();   // Reads navbar.yaml
const logo = getSiteLogo();          // Reads site.yaml logo config
```

## Differences from `default`

- No dropdown menus — nested nav items are flattened
- Simpler markup, fewer interactive elements
- Best for sites with 3–5 top-level nav items
