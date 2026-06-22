# Images — optimizing screenshots & figures (`docs-img`)

Reference for keeping images small in a documentation-template project. Read this
whenever you add or update an image/screenshot under `data/`.

## Why this matters

Git stores every version of every binary forever. A repo realistically caps at
**~1–2 GB including history**. At 1 MB/image that's ~1,000 images before the repo
is unusable; at ~100 KB you get ~10,000 — enough to illustrate issues, guides, and
blog posts for the life of the project. **Git-LFS is overkill** for small docs
figures; the answer is to shrink images *before* they ever land in history.

Rule: **never commit a raw screenshot.** Run `docs-img` on it first.

## What `docs-img` is (and isn't)

- It **optimizes** images: resize, grayscale, re-encode (webp/avif/png/jpg),
  strip metadata, and rewrite Markdown links when the extension changes.
- It does **not capture** anything. It works on whatever image you give it —
  a Playwright screenshot, a manual screen grab you pasted in, an exported PNG.
- **Engine:** the ImageMagick CLI (`magick`). One system prerequisite, no npm
  install. If it's missing, `docs-img` tells you how to install it.

### Capturing web pages (optional, separate)

If you need a *screenshot of a running web page* and have **Playwright**
installed, you can capture with it (`page.screenshot()` for raster,
`page.pdf()` for crisp-text vector), then run `docs-img` to shrink the result.
This is independent of `docs-img` — capture is not its job.

## The one decision: what kind of image is it?

| Image | Recipe |
|---|---|
| **Flat UI / screenshot / text** (no photographic gradients) | `--gray` (if monochrome UI) + `--format webp --quality 80`. Add `--dpr 2` if captured on a retina/2× display. |
| **Photo / rich gradient** | `--format webp --quality 80` (or `avif` lower), no `--gray`, no `--colors`. |
| **Must stay pixel-perfect** (diagram you'll zoom) | `--format webp --lossless`, keep full resolution. |

## Default recipe (most screenshots)

```bash
docs-img path/to/images/*.png --dpr 2 --gray --format webp --quality 80 \
  --rewrite-links --report
```

- `--dpr 2` — **the biggest free win.** Browser/retina screenshots render at 2×
  (e.g. 2880×1800 for a 1440×900 layout). Dividing by 2 quarters the pixels with
  zero loss a 1× display can show.
- `--gray` — grayscale UI shots shrink with no visible change.
- `--format webp --quality 80` — text-crisp and far smaller than PNG.
- `--rewrite-links` — since the extension changed (`.png`→`.webp`), fix every
  `![](…)` reference automatically. In-place runs back up originals first.

Typical result: a 10-shot set of dense modals goes from ~2.3 MB → ~250 KB.

## Budget mode — hit a size target

```bash
docs-img images/*.png --dpr 2 --gray --format webp --target-size 100KB --rewrite-links
```

`--target-size` steps quality down (80 → 30) until each file fits. If even q30 is
over budget, it warns — then reach for `--trim` (crop the dead backdrop behind a
modal) or `--max-dim`/`--scale` (smaller pixels beat lower quality for size).

## Format cheat-sheet

| Format | Use when | Notes |
|---|---|---|
| **webp** | default for everything | lossy *or* `--lossless`; great on text, tiny |
| **avif** | you need the absolute smallest | best ratios, but some Markdown viewers don't render it |
| **png** | line art / you need lossless + max compatibility | pair with `--colors N` (palette) to shrink |
| **jpg** | photos for legacy targets | never for text (ringing on glyph edges) |

## Gotchas (learned the hard way)

- **`--colors N` helps PNG, hurts lossy webp/avif.** Palette-posterizing smooth
  anti-aliased edges *adds* high-frequency detail the lossy codec must spend bits
  on — the file gets *bigger*. `docs-img` warns if you combine them. Use
  `--colors` only with `--format png`.
- **Resolution, not codec, is the main lever.** `--dpr`/`--scale`/`--trim`
  shrink more than quality tweaks. Drop DPR and crop first.
- **Don't upscale.** `--max-dim` only shrinks; `--width` larger than the source
  just wastes bytes.
- **Metadata is stripped by default** (`--strip`); pass `--no-strip` only if you
  truly need EXIF/orientation retained.
- **`--rewrite-links` only fires on extension change, in-place.** With `--out`
  (originals untouched) it doesn't rewrite — that mode is for previewing.
- **Always backed up.** In-place writes copy originals to a temp backup dir
  (printed in the report) unless you pass `--no-backup`.

## Full flag list

Run `docs-img --help`. Highlights: geometry (`--dpr --scale --width --height
--max-dim --trim`), color/quality (`--gray --quality/-q --lossless --colors
--depth --dither`), format (`--format --no-strip`), output (`--out --backup
--no-backup`), docs (`--rewrite-links --links-root --target-size`), misc
(`-r/--recursive --dry-run --quiet`).

## SVG?

Vector with real (selectable) text would be ideal for flat UI, but **PNG→SVG
tracing doesn't deliver it** — it turns glyphs into fuzzy outlines and the file
usually ends up *larger* than a quantized webp. The only real win is
**capture-time** (`<foreignObject>`/`dom-to-svg`, or `page.pdf()` for vector
text), which belongs in a capture step, not in `docs-img`. So: don't convert
existing raster images to SVG; if you want crisp-text vector figures, capture
them as SVG/PDF from the live DOM.
