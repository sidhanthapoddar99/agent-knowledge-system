# navbar/default — Full-Featured Navbar

Logo + navigation links with dropdown support + theme toggle + mobile hamburger menu.

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

No data is passed in from the page — the navbar loads its own config.

## Expected navbar.yaml shape

See `default-docs/config/navbar.yaml` for the full schema. Key fields:

```yaml
layout: "@navbar/default"
items:
  - label: "Docs"
    href: "/docs"
  - label: "More"
    children:
      - label: "Blog"
        href: "/blog"
      - label: "GitHub"
        href: "https://github.com/..."
```

## Features

- Logo (left) — supports separate light/dark variants
- Nav items with optional dropdown menus
- External link detection (opens in new tab)
- Theme toggle (light/dark)
- Mobile-responsive hamburger menu
