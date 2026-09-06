# custom/home — Landing Page Layout

Hero section + Features grid. Loads its own data from a YAML file.

## Props (received from route handler)

```typescript
interface Props {
  dataPath: string;   // Absolute path to the YAML data file (e.g. pages/home.yaml)
}
```

The route handler passes only `dataPath`. The layout loads and parses the YAML itself.

## Data loaded internally

```typescript
const fileContent = await loadFile(dataPath);
const pageData = fileContent.data;
// pageData.hero, pageData.features
```

## Expected YAML shape

```yaml
hero:
  title: "Welcome"
  subtitle: "Brief tagline"           # optional
  cta:
    label: "Get Started"
    href: "/docs"
  secondaryCta:                        # optional
    label: "View on GitHub"
    href: "https://github.com/..."

features:
  - icon: "🚀"
    title: "Fast"
    description: "Built on Astro"
  - icon: "🧩"
    title: "Modular"
    description: "Pick your layout"
```

## Components in this folder

| File | Purpose |
|------|---------|
| `Layout.astro` | Entry point — loads YAML, passes sections to components |
| `Hero.astro` | Hero section with title, subtitle, CTA buttons |
| `Features.astro` | Feature cards grid |

## Visual structure

```
┌──────────────────────────────────────────────────────────────┐
│                          Navbar                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                       HERO SECTION                           │
│              Title · Subtitle · [CTA] [Secondary]           │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│   │   Icon       │  │   Icon       │  │   Icon       │      │
│   │   Title      │  │   Title      │  │   Title      │      │
│   │   Desc       │  │   Desc       │  │   Desc       │      │
│   └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                          Footer                              │
└──────────────────────────────────────────────────────────────┘
```
