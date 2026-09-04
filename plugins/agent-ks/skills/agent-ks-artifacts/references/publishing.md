# Publishing artifacts

This file teaches the authoring side of publishing, theming and delivery. The loader, the route and the sidebar belong to the framework.

## Where an artifact lives

| Home | Path | Rule |
|---|---|---|
| A docs section | `data/<section>/NN_name.html`, beside the markdown pages | A first-class page; it sorts in the sidebar by prefix. A missing prefix is a warning, not an error: the file is skipped. `assets/` is never scanned; put working or embed-only `.html` there. Section mechanics: [docs-layout.md](../../agent-ks-docs/references/docs-layout.md). |
| A tracker folder | An issue's `brainstorm/` or `notes/` folder, and no other | A thinking-artifact beside the deliberation, versioned with the issue. Every other tracker folder, `subtasks/` included, ignores an `.html` file: the engine reads artifacts from these two sections only, so a file elsewhere never renders. Naming and prefix rules: [05_brainstorm-notes-memory.md](../../agent-ks-issues/references/05_brainstorm-notes-memory.md). |

- The title derives from the prefix-stripped, title-cased filename. A sidecar overrides it. The sidecar is optional for the title and required for a `site` artifact, because no sidecar reads as `self` and the route then injects no theme.
- A slug collision (`05_foo.md` beside `05_foo.html`) renders an error at that slug; rename one.
- Read the section root `settings.json` before you write the file. `"allow_artifact_pages": false` opts the whole section out of `.html` pages, so pick another home. No gate catches this: `check section` passes and the page simply never appears.
- A section `base_url` must not be `artifacts`; the config loader rejects it. The reserved set is in [03_site-config.md](../../agent-ks-config/references/03_site-config.md#pages-routing).
- Update = edit the file and rebuild; history lives in git.

## The route and the embed

The full-page URL is the primitive. The embed is built on it.

- **Full page.** `/artifacts/<path-from-the-content-root>`: a real, bookmarkable URL.
- **Embed.** An iframe whose `src` is that route plus `?v=<mtime>`, a cache-buster. It fills the content column; the sidebar stays; the outline rail hides.
- **Controls.** "Full page" (primary) opens the route in a new tab and always ships. "Expand" (secondary) grows the embed in place; `Esc` closes it.

## Sizing

- **Design for the embed width first.** The primary viewport is the docs content column, and its width depends on the host page. A markdown page keeps its outline rail, so the column runs about 610px at a 1280px window and about 930px at its widest. An artifact page of its own shows no outline rail, so its column runs about 890px to 1210px. Compose for the narrow end; let it scale up to full page. Test both ends.
- **Height follows content.** The embed sizes itself to the content height and scrolls with the page. No nested scrollbar.
- **`embed_height` opts into a fixed box.** A top-level sidecar `embed_height` gives a fixed box with its own inner scroll. Values: a CSS length such as `"640px"`, or an aspect such as `"16/9"`. `"full"` is the default.
- **Full page is full viewport.** The route renders the document as written.
- **`vh` floors.** `min-height: 100vh` on `html` or `body` is neutralized in the embed, where the viewport is the content height. The full-page view keeps it.
- **Wide content** follows the [never-table](../SKILL.md#never).

## Theme modes

The sidecar's `artifact.theme` selects the mode; the mode rule is in [SKILL.md](../SKILL.md#theme-mode). The route never applies an `invert()` filter.

The embed gets `data-theme` stamped in both modes: the parent page writes it on load and on every toggle. The full page splits by mode. A `site` full page reads `localStorage.theme`, then `prefers-color-scheme`, like the docs chrome. A `self` full page gets nothing injected, so its own `prefers-color-scheme` block is the only full-page fallback.

### Site mode

The route injects the site's resolved theme CSS at the top of `<head>`, for the embed and the full page. The contract variables resolve inside the artifact; reference them directly: `background: var(--color-bg-primary)`. Query the live values with `agent-ks theme tokens --json`.

- **No ambient palette.** Do not redefine `--color-*`. The injected CSS sits at the top of the head, so your own `:root` rule comes later at equal specificity and wins in both modes. A redefinition freezes the artifact against the site toggle, in silence.
- **The neutral fallback layer.** Write each consumed token with a minimal neutral fallback: `var(--color-bg-primary, #fff)`. It serves a raw open with no host (`file://`, email). Inside the engine the injected value wins. The layouts no-fallback rule protects layouts, where a var must always resolve; it does not apply here.
- **Local elemental colors.** A diagram or chart needs colors the contract lacks: series hues, arrow strokes, node fills. Define them in the HTML as local custom properties. Backgrounds, text, borders and spacing stay injected. Pick values that hold on both injected surfaces; a chart palette also passes the validator on both. Declare them in the sidecar.

### Self mode

The route serves the file byte for byte; you own the whole theme system. Design both themes; give dark the same care as light. Define the tokens on `:root`, under `@media (prefers-color-scheme: dark)`, and under both `:root[data-theme]` values, so the site toggle wins in both directions. Style components through the tokens, never inside the media query. Reuse the contract's names.

```html
<style>
  :root { --color-bg-primary: #fafafa; --color-text-primary: #1a1a1a;
          --color-accent-soft: #dbeafe; /* beyond the contract */ }
  @media (prefers-color-scheme: dark) {
    :root { --color-bg-primary: #0a0a0a; --color-text-primary: #fafafa; --color-accent-soft: #1e3a5f; }
  }
  :root[data-theme="light"] { --color-bg-primary: #fafafa; --color-text-primary: #1a1a1a; --color-accent-soft: #dbeafe; }
  :root[data-theme="dark"]  { --color-bg-primary: #0a0a0a; --color-text-primary: #fafafa; --color-accent-soft: #1e3a5f; }
  body { background: var(--color-bg-primary); color: var(--color-text-primary); }
</style>
```

## Self-contained

Self-containment is a policy, not a CSP: everything inline, or served by this site.

- **The document.** Author it complete: `<!doctype html>`, `<html>`, `<head>` with `<meta charset>`, the viewport, `<title>` and your `<style>`, then `<body>`. Nothing is wrapped around it.
- **CSS and JS.** Inline.
- **Images.** A data URI, or one of the URL forms below.
- **Fonts.** A `.woff2` file, in one of the URL forms below; see [Fonts](#fonts).
- **External scripts, stylesheets, fonts.** Never. An artifact runs unsandboxed on the site origin, so an external script is an XSS surface inside the docs.

A team that wants CDN fonts documents that as a discouraged opt-out. Enforcement, when needed, is a CSP header on the `/artifacts` route.

### The URL forms

The route serves an artifact at `/artifacts/<path>`, and it serves `.html` and nothing else. A `url()` or `src` written relative to the file **on disk** therefore resolves under `/artifacts/` and returns 404. Write one of these three instead:

- **A `data:` URI.** It works everywhere, including a raw open with no server.
- **`/content-assets/<path-from-the-content-root>`** for a file colocated with the artifact. `data/<section>/assets/logo.svg` is `/content-assets/<section>/assets/logo.svg`.
- **`/assets/<path>`** for a file in the site's own asset folder, the one holding the favicon and the logos.

A leading `/` is correct here and wrong in markdown, so do not carry the habit across. `check link-form` reads `.md` and `.mdx` only, so it never sees an artifact and never warns you either way.

## Fonts

Ship the face as `.woff2` and declare it with `@font-face` and a `url()` in one of the forms above. A missing or blocked font falls back in silence. Check the computed font in devtools, not by eye. With no `.woff2` available, prefer a system stack over a CDN link.

## The sidecar

An artifact takes an optional same-name JSON sidecar, `<NN_name>.meta.json` or `.meta.jsonc`. Never put frontmatter in the `.html`. Two layers: the rendering fields, read by the loader, and the `artifact:` block.

- `title`: page and sidebar title; defaults to the prefix-stripped filename
- `description`: meta description and listing subtitle
- `sidebar_label`: short sidebar label when the title is long
- `sidebar_position`: manual ordering override
- `draft`: exclude from the built sidebar
- `embed_height`: `"full"` (default), a CSS length, or an aspect ratio

The `artifact:` block holds declared values, so an agent need not parse the HTML. The loader passes it through untouched, except `artifact.theme`, which selects the theme mode. This skill owns the keys. Always write and read the standard keys:

- `purpose`: one sentence, what the artifact is for and who reads it
- `type`: `report`, `dashboard`, `dataviz`, `design-system`, `showcase` or `variation-set`
- `theme`: `site` or `self`; the default is `self`; an unknown value reads as `self`
- `palette`: the hex values used, `{ light: {…}, dark: {…} }`, the list you feed the validator
- `data`: for dashboards and charts, the key figures or the source, in structured form
- `interactions`: notable interactive behaviors, an optional list
- `sources`: where the declared values came from, such as issue docs, files, URLs

A variation set adds `options` (required: the option names in display order), `recommendation` and `decision`. Add `decision` when the team decides, and mirror it into the issue's notes or comments. The block is open for more declared values: `sections`, `decisions`, `key_facts`, `typography`. Keep the standard keys present.

A sidecar is encouraged for every artifact and mandatory for a design-system artifact. Every declared hex, token and value appears in the artifact; the verify gate checks this.

The sidecar is design memory. Read it before you touch an existing artifact or build a companion in the same family. Reuse its declared palette and typography. Every edit to the `.html` updates the sidecar in the same change.

```jsonc
// 20_coverage-dashboard.meta.jsonc
{
  "title": "Coverage Dashboard",
  "embed_height": "full",
  "artifact": {
    "purpose": "Give maintainers a one-screen read of coverage per package.",
    "type": "dashboard",
    "theme": "site",
    "data": { "packages": 12, "overall": "84%", "source": "coverage/summary.json" },
    "sources": ["coverage/summary.json"]
  }
}
```

Two live examples ship in the framework's docs under `@root/default-docs/data/user-guide/15_writing-content/20_examples/`: `03_design-system-demo.meta.json` (`self`, a declared palette) and `04_site-theme-demo.meta.json` (`site`, declared consumed tokens).

## Verify before you publish

Run this gate before you call an artifact done. Render it and look at it; the palette validator checks color math, not layout.

1. **Check the placement.** For an artifact in a docs section, run `agent-ks check section <path-to-the-section-folder>`, for example `agent-ks check section ./data/user-guide`. The verb takes a path, not a section name. It checks the `NN_` prefix and the slug collision, which a render will not show you.
2. **Run the site.** `./start dev --detach`, and `./start stop` when you are done. Without `--detach` the server holds your terminal. Open the artifact full page at `/artifacts/<path>` and on an embedding docs page. `<path>` is the file's path under its content root, `NN_` prefixes and the `.html` extension kept; it is not the clean docs slug. Check both themes with the site toggle and both viewports: the embed column at its narrow end and the full page. A `site` artifact re-themes with the toggle on both surfaces. Playwright tools can take the screenshots.
3. **Styled.** Every token resolves to its injected or declared value; inspect the computed value. A frozen neutral fallback or a dead dark mode is the failure. In `self` mode both palettes exist and dark is designed, not inverted. Check the computed font.
4. **Complete.** Nothing collapsed or overflowing. No horizontal body scroll. Focus states visible. `prefers-reduced-motion` honored. Every chart passes its dataviz checks. Every declared state (empty, loading, error) is shown.
5. **Plausible.** Real content throughout; see [design-fundamentals.md](design-fundamentals.md#realistic-content).
6. **Operable.** Exercise every interaction in the rendered page: tap, drag, toggle each one. Reading the JS does not count.
7. **Sidecar honesty.** Every hex, token or value the `artifact:` block declares appears in the HTML. The declared `theme` matches how the artifact is built.
