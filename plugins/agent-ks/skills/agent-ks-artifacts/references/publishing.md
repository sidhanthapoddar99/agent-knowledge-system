# Publishing artifacts

This file teaches the authoring side of publishing, theming and delivery. The loader, the route and the sidebar belong to the framework.

## Where an artifact lives

| Home | Path | Rule |
|---|---|---|
| A docs section | `data/<section>/NN_name.html`, beside the markdown pages | The file renders as a page. It sorts in the sidebar by prefix. A missing prefix is a warning, not an error. The file is then skipped. `assets/` is never scanned, so put working or embed-only `.html` there. The section rules are in [docs-layout.md](../../agent-ks-docs/references/docs-layout.md). |
| A tracker folder | An issue's `brainstorm/` or `notes/` folder, and no other | A thinking aid beside the discussion, versioned with the issue. Every other tracker folder, `subtasks/` included, ignores an `.html` file. The engine reads artifacts from these two sections only, so a file elsewhere never renders. The naming and prefix rules are in [05_brainstorm-notes-memory.md](../../agent-ks-issues/references/05_brainstorm-notes-memory.md). |

- The title comes from the filename, with the prefix stripped and title case applied. A sidecar overrides it. A sidecar is a `NN_name.meta.json` file beside the artifact. It is optional for the title. It is required for a `site` artifact. An artifact with no sidecar reads as `self`, and the route then injects no theme.
- A slug collision (`05_foo.md` beside `05_foo.html`) renders an error at that slug. Rename one of the two.
- Read the section root `settings.json` before you write the file. `"allow_artifact_pages": false` opts the whole section out of `.html` pages, so pick another home. No gate catches this. `check section` passes, and the page never appears.
- A section `base_url` must not be `artifacts`. The config loader rejects it. The reserved set is in [03_site-config.md](../../agent-ks-config/references/03_site-config.md#pages-routing).
- To update an artifact, edit the file and rebuild. History lives in git.

## The route and the embed

The full-page URL is the base. The embed is built on it.

- **Full page.** `/artifacts/<path-from-the-content-root>`: a real URL a reader can bookmark.
- **Embed.** An iframe whose `src` is that route plus `?v=<mtime>`, a cache-buster. It fills the content column. The sidebar stays. The outline rail hides.
- **Controls.** "Full page" (primary) opens the route in a new tab and always ships. "Expand" (secondary) grows the embed in place. `Esc` closes it.

## Sizing

- **Design for the embed width first.** The primary viewport is the docs content column. Its width depends on the host page. A markdown page keeps its outline rail, so the column runs about 610px at a 1280px window and about 930px at its widest. An artifact page of its own shows no outline rail, so its column runs about 890px to 1210px. Compose for the narrow end. Let it scale up to full page. Test both ends.
- **Height follows content.** The embed sizes itself to the content height and scrolls with the page. There is no nested scrollbar.
- **`embed_height` opts into a fixed box.** A top-level sidecar `embed_height` gives a fixed box with its own inner scroll. Values: a CSS length such as `"640px"`, or an aspect such as `"16/9"`. `"full"` is the default.
- **Full page is full viewport.** The route renders the document as written.
- **`vh` floors.** The embed cancels `min-height: 100vh` on `html` or `body`, because there the viewport is the content height. The full-page view keeps it.
- **Wide content** follows the [never-table](../SKILL.md#never).

## Theme modes

The sidecar's `artifact.theme` selects the mode. The mode rule is in [SKILL.md](../SKILL.md#theme-mode). The route never applies an `invert()` filter.

In both modes the parent page writes `data-theme` onto the embed, on load and on every toggle. The full page differs by mode. A `site` full page reads `localStorage.theme`, then `prefers-color-scheme`, the same way the docs chrome does. The docs chrome is the site's own navbar and sidebar. A `self` full page gets nothing injected, so its own `prefers-color-scheme` block is the only full-page fallback.

### Site mode

The route injects the site's resolved theme CSS at the top of `<head>`, for the embed and the full page. The contract variables resolve inside the artifact. Reference them directly: `background: var(--color-bg-primary)`. Query the live values with `agent-ks theme tokens --json`.

- **Do not redefine the palette.** Do not redefine `--color-*`. The injected CSS sits at the top of the head. Your own `:root` rule comes later at equal specificity, so it wins in both modes. A redefinition freezes the artifact, so the site toggle stops changing it, and nothing warns.
- **The neutral fallback layer.** Write each consumed token with a minimal neutral fallback: `var(--color-bg-primary, #fff)`. The fallback serves a raw open with no host, such as `file://` or email. Inside the engine the injected value wins. The no-fallback rule for layouts protects layouts, where a variable must always resolve. It does not apply here.
- **Local elemental colors.** A diagram or chart needs colors the contract lacks: series hues, arrow strokes, node fills. Define them in the HTML as local custom properties. Backgrounds, text, borders and spacing stay injected. Pick values that work on both injected surfaces. A chart palette also passes the validator on both. Declare them in the sidecar.

### Self mode

The route serves the file byte for byte. You own the whole theme system. Design both themes. Give dark the same care as light. Define the tokens on `:root`, under `@media (prefers-color-scheme: dark)`, and under both `:root[data-theme]` values, so the site toggle wins in both directions. Style components through the tokens, never inside the media query. Reuse the contract's names.

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

Self-containment is a rule you follow. It is not a browser policy (CSP) that the site enforces. Everything is inline, or served by this site.

- **The document.** Author it complete: `<!doctype html>`, `<html>`, `<head>` with `<meta charset>`, the viewport, `<title>` and your `<style>`, then `<body>`. Nothing is wrapped around it.
- **CSS and JS.** Inline.
- **Images.** A data URI, or one of the URL forms below.
- **Fonts.** A `.woff2` file, in one of the URL forms below. See [Fonts](#fonts).
- **External scripts, stylesheets, fonts.** Never load one. An artifact runs with no sandbox on the site origin, so an external script can run any code inside the docs. That is an XSS surface.

A team that wants CDN fonts writes that down as an opt-out, and this skill advises against it. When enforcement is needed, it is a CSP header on the `/artifacts` route.

### The URL forms

The route serves an artifact at `/artifacts/<path>`, and it serves `.html` and nothing else. A `url()` or `src` written relative to the file **on disk** therefore resolves under `/artifacts/` and returns 404. Write one of these three instead:

- **A `data:` URI.** It works everywhere, including a raw open with no server.
- **`/content-assets/<path-from-the-content-root>`** for a file that sits beside the artifact. `data/<section>/assets/logo.svg` is `/content-assets/<section>/assets/logo.svg`.
- **`/assets/<path>`** for a file in the site's own asset folder, the one holding the favicon and the logos.

A leading `/` is correct here and wrong in markdown, so do not copy the habit from one to the other. `check link-form` reads `.md` and `.mdx` only, so it never sees an artifact and never warns you either way.

## Fonts

Ship the face as `.woff2` and declare it with `@font-face` and a `url()` in one of the forms above. A missing or blocked font falls back in silence. Check the computed font in devtools, not by eye. With no `.woff2` available, prefer a system stack over a CDN link.

## The sidecar

An artifact takes an optional same-name JSON sidecar, `<NN_name>.meta.json` or `.meta.jsonc`. Never put frontmatter in the `.html`. The sidecar has two layers: the rendering fields, read by the loader, and the `artifact:` block.

- `title`: page and sidebar title. Defaults to the prefix-stripped filename
- `description`: meta description and listing subtitle
- `sidebar_label`: short sidebar label when the title is long
- `sidebar_position`: manual ordering override
- `draft`: exclude from the built sidebar
- `embed_height`: `"full"` (default), a CSS length, or an aspect ratio

The `artifact:` block holds declared values, so an agent need not parse the HTML. The loader passes it through untouched, except `artifact.theme`, which selects the theme mode. This skill owns the keys. Always write and read the standard keys:

- `purpose`: one sentence, what the artifact is for and who reads it
- `type`: `report`, `dashboard`, `dataviz`, `design-system`, `showcase` or `variation-set`
- `theme`: `site` or `self`. The default is `self`. An unknown value reads as `self`
- `palette`: the hex values used, `{ light: {…}, dark: {…} }`, the list you feed the validator
- `data`: for dashboards and charts, the key figures or the source, in structured form
- `interactions`: notable interactive behaviors, an optional list
- `sources`: where the declared values came from, such as issue docs, files, URLs

A variation set adds `options` (required: the option names in display order), `recommendation` and `decision`. Add `decision` when the team decides, and copy it into the issue's notes or comments. The block is open for more declared values: `sections`, `decisions`, `key_facts`, `typography`. Keep the standard keys present.

Write a sidecar for every artifact. A design-system artifact must have one. Every declared hex, token and value appears in the artifact. The verify gate checks this.

The sidecar is the design's memory. Read it before you touch an existing artifact or build a companion in the same family. Reuse its declared palette and typography. Every edit to the `.html` updates the sidecar in the same change.

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

Run this gate before you call an artifact done. Render it and look at it. The palette validator checks color math, not layout.

1. **Check the placement.** For an artifact in a docs section, run `agent-ks check section <path-to-the-section-folder>`, for example `agent-ks check section ./data/user-guide`. The verb takes a path, not a section name. It checks the `NN_` prefix and the slug collision, which a render will not show you.
2. **Run the site.** Run `./start dev --detach`. Run `./start stop` when you are done. Without `--detach` the server holds your terminal. Open the artifact full page at `/artifacts/<path>` and on an embedding docs page. `<path>` is the file's path under its content root, with the `NN_` prefixes and the `.html` extension kept. It is not the clean docs slug. Check both themes with the site toggle. Check both viewports: the embed column at its narrow end, and the full page. A `site` artifact re-themes with the toggle on both surfaces. Playwright tools can take the screenshots.
3. **Styled.** Every token resolves to its injected or declared value. Inspect the computed value. A frozen neutral fallback or a dead dark mode is the failure. In `self` mode both palettes exist and dark is designed, not inverted. Check the computed font.
4. **Complete.** Nothing is collapsed or overflowing. There is no horizontal body scroll. Focus states are visible. `prefers-reduced-motion` is honored. Every chart passes its dataviz checks. Every declared state (empty, loading, error) is shown.
5. **Plausible.** Real content throughout. See [design-fundamentals.md](design-fundamentals.md#realistic-content).
6. **Operable.** Try every interaction in the rendered page: tap, drag, toggle each one. Reading the JS does not count.
7. **Sidecar honesty.** Every hex, token or value the `artifact:` block declares appears in the HTML. The declared `theme` matches how the artifact is built.
