# Images

How to keep images small with `agent-ks img`. Read this when you add or update an image or a screenshot under `data/`.

## The rule

Never commit a raw screenshot. Run `agent-ks img` on it first. Git stores every version of every binary forever, so image size decides how long the repo stays usable.

| Size per image | Images before the repo reaches about 1 to 2 GB |
|---|---|
| 1 MB | about 1,000 |
| 100 KB | about 10,000 |

Git-LFS is not needed for docs figures. Shrink images before they enter history.

## What `agent-ks img` does

| Does | Does not |
|---|---|
| Resize, grayscale, re-encode to webp, avif, png or jpg, strip metadata | Capture anything. It works on the image you give it |
| Rewrite markdown links when the extension changes | Need an npm install. The engine is the ImageMagick CLI `magick`; when it is missing, the tool prints install steps |

To capture a running web page, use Playwright: `page.screenshot()` for raster, `page.pdf()` for vector text. Then run `agent-ks img` on the result.

## Choose a recipe

| Image | Recipe |
|---|---|
| Flat UI, screenshot, text | `--format webp --quality 80`. Add `--gray` for a monochrome UI. Add `--dpr 2` for a retina capture |
| Photo or rich gradient | `--format webp --quality 80`, or `avif` for less. No `--gray`, no `--colors` |
| Must stay pixel-perfect, a diagram to zoom | `--format webp --lossless`, full resolution |

The default recipe for most screenshots:

```bash
agent-ks img path/to/images/*.png --dpr 2 --gray --format webp --quality 80 --rewrite-links
```

| Flag | Effect |
|---|---|
| `--dpr 2` | The biggest win. A retina capture is 2×. Halving it quarters the pixels, with no loss on a 1× display |
| `--gray` | A grayscale UI shot shrinks with no visible change |
| `--format webp --quality 80` | Crisp text, far smaller than PNG |
| `--rewrite-links` | Fixes every `![](…)` reference when `.png` becomes `.webp`. An in-place run backs up the originals first |

A set of ten dense modals goes from about 2.3 MB to about 250 KB.

## Budget mode

```bash
agent-ks img images/*.png --dpr 2 --gray --format webp --target-size 100KB --rewrite-links
```

`--target-size` steps quality down from 80 to 30 until each file fits. If quality 30 is still over budget, the tool warns. Then use `--trim` to crop a dead backdrop, or `--max-dim` or `--scale` to cut pixels. Fewer pixels beat lower quality.

## Formats

| Format | Use when | Note |
|---|---|---|
| webp | the default for everything | lossy, or `--lossless`; small and crisp on text |
| avif | the smallest file matters most | the best ratios; some markdown viewers do not render it |
| png | line art, or lossless with maximum compatibility | pair with `--colors N` to shrink |
| jpg | photos for legacy targets | never for text; it rings on glyph edges |

## Pitfalls

| Pitfall | Rule |
|---|---|
| `--colors N` helps PNG and hurts lossy webp and avif | Posterized edges add detail the codec must encode, so the file grows. The tool warns. Use `--colors` only with `--format png` |
| Resolution is the main lever | `--dpr`, `--scale` and `--trim` shrink more than a quality change. Cut pixels first |
| Never upscale | `--max-dim` only shrinks. A `--width` above the source wastes bytes |
| The tool strips metadata by default | Pass `--no-strip` only when EXIF or orientation must stay |
| `--rewrite-links` fires only in place, on an extension change | With `--out` the tool rewrites nothing; that mode is for a preview |
| The tool backs up originals | An in-place write copies originals to a backup dir named in the report, unless you pass `--no-backup` |

Every flag: `agent-ks img --help`, or [cli-toolkit.md](../../agent-ks-cli/references/cli-toolkit.md).

## SVG

Do not trace a raster image to SVG. Tracing turns glyphs into fuzzy outlines, and the file is usually larger than a quantized webp. A vector figure with real text comes only from the capture step: `page.pdf()`, or a DOM-to-SVG capture. That is not the job of `agent-ks img`.
