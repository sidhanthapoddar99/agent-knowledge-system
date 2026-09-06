# footer/minimal — Single-Line Footer

Copyright text + optional inline links. Clean, minimal design.

## Props

None. The footer loads its own config:

```typescript
const config = loadFooterConfig();   // Reads footer.yaml
```

## Features

- Single row with copyright on one side, links on the other
- Uses first 4 links from footer.yaml columns (flattened)
- `{year}` in copyright is replaced with the current year
