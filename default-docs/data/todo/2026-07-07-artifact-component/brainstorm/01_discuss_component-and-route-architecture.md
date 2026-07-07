---
title: "Component + route architecture — deliberation (workstreams 1–3)"
---

# Component + route architecture for first-class artifacts

Brainstorm session (sidhantha + agent, 2026-07-07). Scope: the three
infrastructure workstreams that make an `.html` artifact behave like a page —
`10_component` (scan + sidebar + embed render), `20_route` (the reserved
`/artifacts/<path>` full-page view), and `30_reserved-url-guard` (config-load
validation). The authoring skill, skills integration, and documentation
workstreams are deliberated elsewhere; this entry is only the plumbing.

Everything here mirrors the first-class **diagram** pipeline shipped in
[[2026-04-10-editor-diagrams]] — that issue already solved "a non-markdown file
becomes a sidebar page," and the cleanest artifact design is to slot into the
exact same seams rather than invent a parallel mechanism. The audit below cites
the real diagram code so an implementer can diff the two side by side. Settled
decisions distilled from this entry live in
[../notes/02_settled-decisions.md](../notes/02_settled-decisions.md); the threads
that stay open after this session are flagged inline and collected at the end.

## Settled going in — don't re-litigate

The user has already fixed the top-level shape, so these are **not** open
questions in this brainstorm:

- **The dedicated URL is the primitive.** `/artifacts/<path>` is the primary
  full-view mechanism, not an afterthought. The embed's iframe needs a `src`
  regardless, and that `src` *is* the route — so the route is the foundation the
  embed is built on. The rationale (durable, bookmarkable, shareable; avoids the
  Fullscreen API's weaknesses) is recorded as settled in the notes; we do not
  re-argue URL-vs-expand here.
- **Embed in the content area, chrome intact.** Clicking an artifact in the
  sidebar replaces the central content area with the embedded artifact; sidebar
  and outline/TOC chrome stay. This is a direct consequence of rendering the
  artifact as an ordinary docs entry (see Thread C).
- **Optional same-name metadata sidecar**, mirroring the diagram sidecar. The
  *contract* of that sidecar is still open and is deliberated in Thread B.

What remains genuinely open — and what this entry works through — is *how* the
scan slots in, *what* the sidecar carries, *how* the iframe is sized and themed,
*what* the trust/sandbox stance is, and *where* the guard lives.

---

## Thread A — how the artifact scan slots into the diagram foundation

The diagram feature is one loader plus one hook. `loadDiagramPages()`
(`astro-doc-code/src/loaders/diagram-pages.ts:120`) is called from the docs
branch of the content loader at `astro-doc-code/src/loaders/data.ts:271-275`,
right after markdown parsing:

```ts
if (contentType === 'docs') {
  const diagramPages = await loadDiagramPages(absolutePath, content);
  content.push(...diagramPages.entries);
  dependencyFiles = diagramPages.dependencyFiles;   // NOTE: assigns, not appends
}
```

The loader globs `**/*.{mmd,mermaid,dot,gv,excalidraw}` with
`ignore: '**/assets/**'` (`diagram-pages.ts:44`, `:131-135`), skips files with no
`XX_` prefix via a **warning, not a throw** (`:148-156`), reads an optional
`<XX_name>.meta.json` sidecar (`:160-165`), emits a container-HTML body
(`diagramContainerHtml`, `:56-71`), and — critically — runs a **shared slug
collision pass** over `[...existingContent, ...entries]` (`:189-210`) so a
`.mmd` page and a `.md` page can't claim the same URL. The resulting entries are
plain `LoadedContent` objects (`astro-doc-code/src/parsers/types.ts:50-71`) with
`headings: []` and `fileType: 'diagram'`, and they flow through the same sort,
cache, and draft filter as markdown (`data.ts:278-286`).

We need the same five behaviours for `.html`. The question is packaging.

**Option A — a parallel `loadArtifactPages` module** that structurally clones
`diagram-pages.ts` (glob `**/*.html` with the same `assets/` ignore, same
prefix-warning policy, same sidecar read, its own `artifactContainerHtml`).
*Pros:* the artifact-specific rendering (an iframe container, a `text/html`
serving concern) stays isolated from diagram rendering (inline mermaid/graphviz
containers, SVG export); zero risk to the shipped, working diagram path. *Cons:*
it duplicates the scaffolding — prefix parsing, sidecar reading, slug computation
— and, most dangerously, if it also duplicates the collision loop the two
scanners each run their *own* pool and a `.mmd`/`.html` slug clash slips through.

**Option B — generalize `diagram-pages.ts` into a "non-markdown first-class
page" loader** with a registry of kinds. *Pros:* one collision pool by
construction, one sidecar reader, one prefix policy. *Cons:* a substantial
refactor of a feature that just shipped; it conflates two genuinely different
render models (inline diagram container vs. reference-fetched iframe) behind one
abstraction, and the module's identity and its bundled guide are diagram-shaped.

**Option C — extend `diagram-pages.ts` in place**: add `.html` to the glob and a
`kind: 'artifact'` branch in `diagramContainerHtml`. *Pros:* fewest lines, shares
the collision pool for free. *Cons:* an artifact is not a diagram; the file name,
the `allow_diagram_pages` opt-out, and the docs that describe it would all be
lying. Muddies a clean module.

**Recommendation: Option A, but extract the collision pass into a shared
helper.** Ship a parallel `loadArtifactPages` module so the two render models
stay cleanly separated, and lift the `diagram-pages.ts:189-210` collision block
into a small shared utility (e.g. `resolveSlugCollisions(entries)` in a
`loaders/first-class-page.ts` or similar) that both scanners call. That buys the
clean separation of Option A and the single collision pool of Option B without
Option B's big-bang refactor. The `data.ts` hook then becomes:

```ts
if (contentType === 'docs') {
  const diagramPages = await loadDiagramPages(absolutePath, content);
  content.push(...diagramPages.entries);
  const artifactPages = await loadArtifactPages(absolutePath, content); // content now includes diagrams
  content.push(...artifactPages.entries);
  dependencyFiles = [...diagramPages.dependencyFiles, ...artifactPages.dependencyFiles];
}
```

Two implementation notes an implementer must not miss:

- **Sequencing feeds the collision pool.** `loadArtifactPages` runs *after* the
  diagram push and is handed the already-augmented `content`, so its collision
  pass sees markdown **and** diagram entries — an `05_x.html` clashing with an
  `05_x.mmd` is caught. Do not run the artifact scan before the diagram push.
- **Append, don't overwrite `dependencyFiles`.** The current code *assigns* at
  `data.ts:274`; a second loader must concatenate both loaders' dependency
  lists (shown above) or artifact-file edits won't invalidate the section cache.

Also carry over two policy choices verbatim: the **`assets/` ignore** (embed-only
or working `.html` files live there and must not pollute the sidebar or trip the
prefix rule) and the **prefix-missing → warning, not throw** stance (stray
`.html` exports are common working files; a markdown file missing its prefix is a
hard error at `data.ts:252-265`, but non-markdown deliberately downgrades to a
warning — `diagram-pages.ts:17-19`). Add `'artifact'` to the `FileType` union at
`parsers/types.ts:10`, and add an `allow_artifact_pages: false` section opt-out
mirroring `allow_diagram_pages` (`diagram-pages.ts:126-129`).

---

## Thread B — the metadata sidecar contract

The diagram sidecar (`DiagramMeta`, `diagram-pages.ts:73-79`) carries five
rendering fields: `title`, `description`, `sidebar_label`, `sidebar_position`,
`draft`, with the title falling back to a prefix-stripped, title-cased filename
(`titleFromCleanName`, `:90-92`). Artifacts need all of those. The open question
is the *second* half of the user's ask: the sidecar must also carry **"explicit
declared values so an AI agent can understand the artifact without parsing the
HTML"** — palette, purpose, key data. What shape should that take?

**Naming first.** The diagram sidecar is `<XX_name>.meta.json`. The user's spec
says "same-name `.json`," but a bare `05_dashboard.json` collides with a very
plausible thing — a colocated data file the artifact itself fetches. So keep the
`.meta.json` (`.meta.jsonc`) suffix, matching diagrams and dodging the data-file
ambiguity. (And fix the diagram bug while cloning: `diagram-pages.ts:162` *reads*
`.json` or `.jsonc`, but `:165` only pushes the `.json` form into
`dependencyFiles`, so a `.jsonc` sidecar edit silently won't bust the cache —
`loadArtifactPages` should push whichever form exists.)

**Now the declared-values shape.** Three options:

- **Freeform open map** — a single `meta: { ... }` blob the author fills however
  they like. Maximum flexibility, zero schema. But an AI reader can't rely on any
  key existing, so it fails the very goal (predictable machine legibility).
- **Fully typed fields** — `palette: {...}`, `purpose: string`,
  `data_points: [...]` as first-class engine schema. Predictable, but rigid:
  artifacts range from a single chart to a full design-system showcase to a
  narrative report, and a fixed schema will fit none of them well and will churn
  the engine every time the authoring skill wants a new field.
- **Hybrid: reserved rendering fields + a convention-driven declared block.**
  Top-level `title`/`description`/`sidebar_*`/`draft` stay typed and are consumed
  by the loader exactly like the diagram sidecar. Everything AI-facing lives
  under one namespaced object — call it `artifact: { ... }` — that the **loader
  treats as opaque passthrough** (stored on `entry.data`, never parsed by the
  engine), while the **authoring skill owns its conventions**: a small set of
  standard keys it always writes and always reads (`purpose`, `palette`,
  `key_values` / `data`, `interactions`, `sources`), plus room for extras.

**Recommendation: the hybrid.** It gives the loader a stable, tiny typed surface
(no engine schema churn as design conventions evolve) and gives AI agents a
predictable place to look — an agent reads `artifact.purpose` and
`artifact.palette` from the sidecar instead of parsing a 400-line HTML file. The
engine's only responsibility is to pass the block through onto `data`; the
*meaning* of its keys is a skill-level contract, documented in the authoring
skill and the user-guide, not enforced in code. This mirrors how the tracker
already separates engine-enforced vocabulary from convention-driven prose. The
exact reserved key list inside `artifact:` is **left open for the authoring-skill
brainstorm to finalize** — it should be designed alongside the design-system
authoring flows, since those flows are its heaviest consumer.

---

## Thread C — embedding the artifact in the docs layout

An artifact entry's `content` field is an HTML string, same as a diagram's. It
reaches the layout unchanged: `Body.astro:18-26` drops it into
`<div class="docs-body markdown-content"><Fragment set:html={content} /></div>`,
and because the entry sets `headings: []`, the outline column auto-hides —
`Layout.astro:65-67` renders `<Outline>` only when `outlineHeadings.length > 0`,
so the sidebar stays and the TOC disappears, giving the artifact the full width.
That much is free.

**Reconciling with the vision's "chrome stays."** Vision requirement 1 says
clicking an artifact "replaces the central content area … sidebar and outline/TOC
chrome stay." This is a deliberate, accepted refinement of that: an artifact
carries no headings, so there is nothing to populate a TOC — rendering an empty
outline rail would be dead chrome. So "chrome stays" resolves in practice to
**sidebar-only**: the navigational sidebar (the thing that lets you leave the
artifact) stays; the outline column, having nothing to list, collapses and hands
its width to the artifact. This is the intended behavior, not an oversight. (If a
persistent TOC rail were ever wanted for symmetry, it would mean rendering an
empty `<Outline>` for `headings: []` — an explicit layout change we are choosing
*not* to make.)

The remaining questions are what the container HTML *is* and how the iframe is
sized.

**Server-emitted iframe vs. client-created iframe.** The excalidraw precedent
emits a placeholder `<div ... data-src="...">` and a global client script
(`scripts/diagrams.ts`, loaded at `BaseLayout.astro:139`) fetches and renders it.
We could instead emit a literal `<iframe>` in the container HTML and skip client
JS entirely. Trade-off: a raw server iframe is zero-JS but has no load/error
handling, no theme handshake, and no place to hang the expand affordance;
a client-created iframe (a `scripts/artifacts.ts` peer of `scripts/diagrams.ts`)
matches the diagram pattern and is where theme propagation (Thread E) and the
expand button (Thread H) naturally live. **Recommendation: client-created
iframe**, following the diagram pattern exactly — emit
`<div class="artifact artifact-html" data-src="/artifacts/<rel>?v=<mtime>"
data-title="…"></div>` and have `scripts/artifacts.ts` build the iframe. Note the
CSS-scoping rule (CLAUDE.md layout rule 5): a runtime-created iframe won't carry
Astro's `data-astro-cid-*` attribute, so its styles must live in a global
stylesheet — `markdown.css` is already global (the diagram chrome at
`markdown.css:360-470` relies on exactly this), so artifact container styles
belong there too.

**Sizing / height strategy** — the substantive open question:

- **Fixed pixel height** — trivial, but wrong for a content type whose whole
  point is variety (a KPI dashboard and a one-number report want different
  heights).
- **Aspect-ratio** — good for known-shape artifacts, but requires the author to
  declare an aspect and fits poster-shaped things badly.
- **postMessage auto-height** — the artifact posts its `scrollHeight`, the parent
  resizes the iframe to fit. Pixel-perfect and no dead space, but it *requires*
  the artifact to include a cooperating script, couples every artifact to a
  message contract, and actively fights the "fill the content area" goal for
  tall/full-bleed dashboards.
- **Viewport-relative fill** — `height: calc(100vh - <header>)`, so the embed
  fills the content area the way the user described.

**Recommendation: viewport-relative fill as the default**, because the stated
experience is "replaces the central content area with the embedded artifact" —
that *is* a fill, not a shrink-wrap. Let the sidecar override it: an
`artifact.embed_height` declared value (`"full"` default, or an explicit pixel
value, or an aspect) covers the short-report case without imposing a contract on
every artifact. postMessage auto-height is a legitimate *opt-in enhancement* an
artifact can advertise later, but it is mutually exclusive with full-bleed and
should not be the baseline. The full-page route (Thread F) always renders true
full-viewport regardless of the embed height.

---

## Thread D — sandboxing and script execution stance

Serving artifacts from our own `/artifacts/` route means the iframe document is
**same-origin** — its scripts run with site-origin privileges (localStorage,
cookies, `fetch` to site routes) and the parent can reach into
`iframe.contentDocument` (which Thread E depends on). That is a real trust
decision, so name it explicitly.

- **No sandbox (full trust).** Artifacts are first-party content: authored in the
  repo, reviewed in git, shipped like any layout or page. Same-origin scripting
  works, so the theme handshake and colocated-data `fetch` both work.
- **`sandbox="allow-scripts"` (omit `allow-same-origin`).** Scripts run but in an
  opaque origin — the frame can't touch the parent, storage, or same-origin data.
  This also **breaks the theme handshake** (`contentDocument` becomes
  inaccessible) and breaks any artifact that fetches a colocated data file. Too
  costly for first-party content.
- **`sandbox="allow-scripts allow-same-origin"`.** Restores scripting and
  same-origin, but per the HTML spec this combination is effectively *no*
  protection — a same-origin framed document can remove its own sandbox. Cosmetic
  security theatre.

**Recommendation: no sandbox, documented as a first-party-content trust
boundary.** The trust model of this framework is already "you own your content" —
an artifact is no more privileged than a custom layout. The authoring skill and
user-guide must state plainly that an artifact runs with site-origin privileges,
so authors don't paste *untrusted third-party* HTML into a docs section. This
stance is also *why* MIME handling should be scoped (Thread F): we deliberately do
**not** add `.html → text/html` to the shared mime map
(`astro-doc-code/src/pages/lib/mime.ts`), because that would silently make every
colocated `.html` anywhere in content — including inside the issue tracker —
executable first-party HTML. Scoping `text/html` to the dedicated route keeps the
executable surface to files the author deliberately placed as artifacts. If
untrusted embedding ever becomes a requirement, that's a separate hardening
effort (a distinct origin + CSP) and is out of scope here.

---

## Thread E — dark/light theme interplay

Site theme is a `data-theme="dark"` attribute on `<html>`, set by the inline
bootstrap script at `BaseLayout.astro:109-123` (localStorage →
`prefers-color-scheme` fallback). A self-contained artifact has its own styles.
How should the two relate?

- **Do nothing.** Simplest; the artifact stays whatever it is (usually light),
  which looks broken beside dark chrome.
- **Query param** `?theme=dark` on the iframe `src`. The artifact reads it, but a
  theme toggle now requires reloading the iframe, and the param leaks awkwardly
  into the bookmarkable full-page URL.
- **postMessage.** Parent posts the theme; the artifact listens. Works even
  cross-origin, but requires every artifact to implement a listener.
- **Same-origin attribute propagation.** On iframe `load`, the parent runs
  `iframe.contentDocument.documentElement.setAttribute('data-theme', current)`
  and re-runs it on the site's theme toggle. Works because the route is
  same-origin (Thread D). Artifacts that key off `data-theme` /
  `prefers-color-scheme` adapt instantly with no reload; artifacts that ignore it
  simply stay light.

**Recommendation: same-origin attribute propagation, plus a documented contract,
and absolutely no invert filter.** Diagrams get dark mode via a blanket CSS
`invert(1) hue-rotate(180deg)` (`markdown.css:456-465`) — that is fine for
monochrome SVG but would destroy an artifact's images and brand colours, so it
must never be applied to the iframe. Instead, `scripts/artifacts.ts` propagates
the attribute on load and on toggle, and the authoring skill teaches artifacts to
honour `data-theme` and `prefers-color-scheme` (the dual-theme token pattern the
artifact-design source already champions). On the full-page route there is no
parent, so the artifact falls back to `prefers-color-scheme` on its own; an
optional `?theme=` param on that URL is a minor nice-to-have for sharing an
explicitly-dark link and can be deferred.

---

## Thread F — the `/artifacts/<path>` route mechanics

The serving machinery already exists for every other colocated file.
`astro-doc-code/src/pages/content-assets/[...path].ts` enumerates servable files
across all content-category dirs at build (`getStaticPaths`), does symlink-proof
containment on `GET`, and sets dev `no-cache` / prod
`public, max-age=31536000` (no `immutable` directive) with ETag revalidation
(cache header at `:111`).
Its `isServable` filter blocks dotfiles, markdown, and `settings.json(c)` — it
*already* permits `.html`. The one gap is MIME: `mime.ts` has no `.html` entry,
so a colocated `.html` served through that route today ships as
`application/octet-stream` and downloads instead of rendering.

**Recommendation: a new `src/pages/artifacts/[...path].ts` cloned from the
content-assets route**, with two deliberate differences: (1) `getStaticPaths`
filters to `.html` files only, and (2) `GET` returns `Content-Type: text/html`
**hardcoded in this route**, not via the shared mime map — the scoping decision
from Thread D. Keep the dev/prod cache headers and ETag logic identical, and have
the embed's iframe `src` carry the `?v=<mtimeMs>` cache-buster exactly as
`diagram-pages.ts:65-66` does, so a prod edit isn't frozen behind the year-long
`max-age`. A static route segment (`artifacts`) beats the `[...slug]` catch-all —
the precedent is documented in the content-assets route header, along with the
caveat that the folder can't be underscore-prefixed (Astro drops `_`-dirs from
routing). Dev-vs-build behaves like content-assets: `getStaticPaths` must
enumerate the `.html` files or a static build 404s them, and the `?v=` query is
harmlessly ignored by static hosts. Also add `'artifacts'` to `isInternalSlug`
(`route-match.ts:49-51`) so the SSR/dev `[...slug]` matcher never tries to render
`/artifacts/...` as a page — today that list only reserves `api/`, `_*`, and
`editor`, and notably **not** `assets` or `content-assets`, which is a latent hole
the guard in Thread G should also close.

---

## Thread G — where the reserved-base-URL guard lands, and its message

Because `/artifacts` is claimed by the route, no docs section may use `artifacts`
as its `base_url`. Base URLs come from `site.yaml → pages.<name>.base_url`
(`config.ts:37-42`), consumed at `route-match.ts:62` and in `static-paths.ts`.

**Where.** The check belongs in `loadSiteConfig()` — specifically at or beside the
pages-resolution loop at `config.ts:209-216`. That code runs once, precedes all
routing, and is cached against `site.yaml`. A reserved-base-URL clash is a
*config-level* misconfiguration, and the established pattern for those is a **hard
throw**, not the `addError`/`addWarning` collection used for content problems:
`getTheme` throws on a missing theme (`config.ts:246-250`), the version gate hard-
stops (`config.ts:172`), `paths.ts` throws on missing/reserved path keys
(`:190-207`). The guard should match that style and stop dev, build, and preview
alike.

**How — reuse the dead function.** `validateRoutes()` already exists
(`config.ts:354-384`) as an overlapping-route checker, but it is **never called**
anywhere except the barrel export (`loaders/index.ts:27`). Rather than inline a
one-off check, resurrect it: extend it with a reserved-segment list and call it
from `loadSiteConfig()`. Make the reserved list cover the whole set, not just
`artifacts` — `['artifacts', 'assets', 'content-assets', 'api', 'editor']` —
closing the pre-existing hole where nothing stops `base_url: "content-assets"`
from silently shadow-fighting the serving route (Thread F). This turns a dead
function into the single home for both route-overlap and reserved-segment
validation.

**Message.** Actionable, naming the offending page and the fix — matching the
version-gate message's tone. Draft:

> **[CONFIG ERROR]** Page `"design-system"` uses `base_url: "artifacts"`, but
> `artifacts` is a reserved route — it serves full-page HTML artifacts at
> `/artifacts/<path>`. Reserved segments: artifacts, assets, content-assets, api,
> editor. Rename this page's `base_url` in `site.yaml`.

---

## Thread H — the secondary in-place expand affordance

The embed carries an **"open full page"** button — that is primary, settled, and
trivial: an `<a href="/artifacts/<rel>">` (or a `window.open`) to the route from
Thread F. No new machinery.

The *secondary* affordance is an **in-place expand**: a button that grows the
iframe to fill the viewport as a fixed-position overlay *without navigating*, so
the reader keeps their scroll position in the docs page. Why it's secondary: the
full-page route already delivers the "big view" with a real, shareable URL, so
expand adds no new capability — only the convenience of not leaving the page. It
costs an overlay layer and its own client JS, and the Fullscreen API is a poor
substitute (intrusive browser chrome, awkward escape behaviour, not linkable).
Note it can't reuse the diagram lightbox: `bindDiagrams`
(`scripts/lightbox.ts:244-283`) targets `.diagram-rendered` elements with an
`svg` child and its pan/zoom engine (`:185-225`) assumes SVG/IMG geometry — an
iframe fits neither. **Recommendation: ship the "open full page" button first and
treat expand as optional polish.** If built, it's a simple fixed-position overlay
that re-parents (or clones) the same iframe to full-viewport with a close button —
cheaper than the pan/zoom lightbox, and it should live in `scripts/artifacts.ts`
beside the theme-propagation logic.

---

## Open threads handed forward

Most of this entry lands on a firm recommendation. The following stay **open**
after this session and should be resolved in their subtasks or the authoring-skill
brainstorm, not silently frozen here:

- **Exact reserved-key list inside the sidecar `artifact:` block** (Thread B) —
  design it with the design-system authoring flows, its heaviest consumer.
- **Default embed height token and the `embed_height` override vocabulary**
  (Thread C) — pin the concrete `calc()` and the override grammar during
  `10_component` implementation against the real navbar height.
- **Whether to build the in-place expand at all in v1** (Thread H) — ship the
  open-full-page button first; decide expand after the embed is real.
- **Optional `?theme=` param on the full-page URL** (Thread E) — deferred
  nice-to-have, not blocking.

The settled decisions this session *did* fix are recorded in
[../notes/02_settled-decisions.md](../notes/02_settled-decisions.md).
