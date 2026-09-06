# footer/default — Multi-Column Footer

Link columns + social icons + copyright. Loaded from `footer.yaml`.

## Props

None. The footer loads its own config:

```typescript
const config = loadFooterConfig();   // Reads footer.yaml
```

## Expected footer.yaml shape

```yaml
layout: "@footer/default"
columns:
  - title: "Product"
    links:
      - label: "Docs"
        href: "/docs"
      - label: "Blog"
        href: "/blog"
  - title: "Community"
    links:
      - label: "GitHub"
        href: "https://github.com/..."
copyright: "© {year} My Company"     # {year} is replaced with current year
social:
  github: "https://github.com/..."
  twitter: "https://twitter.com/..."
```

## Features

- Multi-column link layout
- Social icons: `github`, `twitter`, `linkedin`, `youtube`, `discord`, `facebook`
- `{year}` in copyright is replaced with the current year at build/render time
- Page references (`page: "blog"`) resolve to the configured base URL
