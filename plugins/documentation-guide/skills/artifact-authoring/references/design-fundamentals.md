# Design fundamentals

The craft that applies to **every** artifact, whatever its treatment (`SKILL.md`
§0 decides the treatment; this file is what you execute afterward). Work like a
versatile studio serving a client: palette, type, and layout decisions made
deliberately *for this subject*, with the templated default never the reason a
choice was made.

## Fundamentals for every artifact

- **Anchor everything to the subject.** A subject that hasn't been pinned gets
  pinned first: name one concrete subject, who reads it, and the one job the page
  performs. Distinctive decisions grow out of the subject's own territory — the
  materials it involves, the instruments around it, the vocabulary its people use.
  Populate the page with real content from the start (§ *Realistic content*).
- **Neutrals are decisions too.** Dead-center mid-grey announces that nobody chose
  it; a grey leaning faintly toward the page's accent announces that somebody did.
  Plain white and near-black grounds are perfectly good — *when the subject wants
  them*. What matters is a neutral somebody selected on purpose rather than one
  that arrived by default. (In `site` mode the neutrals arrive via `--color-bg-*` /
  `--color-text-*`; the pick-don't-default rule concerns `self` artifacts, which
  declare their own.)
- **Space with layout, not margins.** Sibling groups get flex or grid plus `gap`;
  per-element margins collapse and double without telling you. Anything wide — a
  table, a code block, a diagram — scrolls inside its *own* `overflow-x: auto`
  wrapper, and the page body itself never grows a horizontal scrollbar. Digit
  columns take `font-variant-numeric: tabular-nums` (big standalone numbers do
  not — the dataviz figure rules cover why).
- **Build so the output matches the source.** The gap between what you wrote and
  what renders is where visual bugs live: elements overlapping, cascade rules
  colliding, a font silently falling back. Every non-void element gets closed,
  every attribute double-quoted; keyboard focus is visibly styled, and
  `prefers-reduced-motion` is respected. When a graphic is generative or decorative, draw it
  with Canvas or WebGL instead of hand-writing long runs of SVG path data.
- **Watch selector specificity.** Generated CSS loves producing classes that undo
  each other — a `.section` rule and a `.cta` rule wrestling over the same padding
  is the classic case. Arrange the cascade so no rule quietly cancels the spacing
  another one set.
- **Copy is part of the design.** Stand on the reader's side of the screen when
  naming things: people recognize what they *do*, not the system's internal
  wiring — a person manages *notifications*, no one manages *webhook config*. Keep the voice
  active, and let a control declare its exact effect: a button reading "Publish",
  a toast confirming "Published". An error message states what broke and what to
  do about it — never an apology, never a shrug. Concrete wording beats clever
  wording.
- **Structure must tell the truth.** Numbering, eyebrows, dividers, labels — every
  structural device has to encode a real property of the content, not dress it up.
  Markers like 01 / 02 / 03 are honest only when the content actually runs in
  order (a genuine process, a dated timeline). Before adding any device, ask what
  fact about the content it expresses.

## The anti-generic rules

AI-produced design keeps collapsing into the same few looks. When the user names a
visual direction, **deliver that direction verbatim — their words outrank every
rule here, even when what they name sits on this list.** When no direction is
given, don't burn that latitude reproducing one of these:

- a cream ground (`#F4F1EA`) under a serif display face, accented in terracotta
- a near-black page rescued by one acid-green or vermilion highlight
- a hero washing purple into blue over a white page
- Inter or Space Grotesk picked as the "safe" face
- a broadsheet look — hairline rules over dense text columns
- sections flagged with emoji
- center-aligning the entire page
- `rounded-lg` applied to everything indiscriminately
- rounded cards wearing an accent bar or rail

No entry here is *banned* — each earned its place only by being the unconsidered
default. A subject that genuinely calls for one gets it, deliberately.

**Scale the execution to the vision.** A maximalist direction demands elaborate
follow-through; a minimal one demands exactness of spacing, of type, of detail.
Elegance means the chosen vision executed well, not the dial turned to maximum.
Concentrate boldness at a single point and let its surroundings stay quiet; an
accent at war with its ground gets pulled toward an analogous hue or desaturated —
not swapped out.

## Editorial branch only — the tone menu and texture

Everything in this section applies **only** when `SKILL.md` §0 read the request as
*editorial*, and it stays under the restraint governor — these are aids for
picking a direction on a standalone showcase, never permission to over-design a
utilitarian page.

- **Commit to a specific tone** instead of settling into a neutral one: brutally
  minimal, maximalist, retro-futuristic, organic/natural, luxury/refined,
  playful/toy-like, editorial-magazine, brutalist/raw, art-deco/geometric,
  soft/pastel, industrial/utilitarian. Treat the list as a springboard — design a
  tone that belongs to *this* subject rather than transplanting a flavour whole.
- **Diverge between generations; never settle on one face.** Reaching for the same
  display family every time (Space Grotesk being the canonical offender) is
  convergence. Rotate light against dark, the type pairing, the entire aesthetic
  from artifact to artifact.
- **A background can be atmosphere, not just fill.** Where the direction supports
  it: gradient meshes, restrained noise or grain, geometric pattern, layered
  transparency, dramatic shadow, a decorative border. Texture stays only while it
  serves the tone — never as filler, and always answering to
  `prefers-reduced-motion`.
- **Open with a thesis.** An editorial artifact leads with whatever is most
  characteristic of its subject — a headline, an image, a live demo, an interactive
  moment. Motion is choreographed, not sprinkled: one orchestrated page-load or
  scroll reveal beats scattered micro-effects, and over-animation is itself a
  recognizable AI-design tell.

(Intensity is not decided here — the treatment governor in §0 owns that call.)

## Typography

Type carries an artifact even when the artifact isn't *about* type.

- **Measure.** Hold running text around a 65-character line. Commit to a type
  scale and don't leave it. In `site` mode that means the semantic tokens
  (`--content-*` for prose, `--ui-text-*` for chrome); in `self` mode define a
  scale of your own — but it must remain a scale.
- **Pairing.** Put a characterful display face (dosed sparingly) against a body
  face that complements it, with a third, utilitarian face on caption-and-data
  duty when needed. Headings get `text-wrap: balance`; body text gets air; uppercase labels
  get a whisper of letter-spacing.
- **Font delivery is a publishing concern.** The face ships as `.woff2` under the
  repo assets, referenced relatively — a webfont CDN link is out (see
  `publishing.md` → *Fonts*). A font that silently fell back still "looks fine"
  because *something* rendered; the check that catches it is inspecting the
  **computed** font, not trusting the impression.

## When the artifact is a UI, not a document — route into dataviz

A dashboard or tool gets *scanned and operated* rather than read top to bottom,
which moves the craft from typography toward information design:

- Put the summary in front of the detail.
- Let **form** carry state alongside the number — a chip, a pill, a severity
  stripe — keeping whatever needs attention legible at a glance.
- **Semantic color (good / warning / critical) lives apart from the accent and
  never counts toward it.**
- Anything interactive should announce it visually.

The moment an artifact has a chart, a stat tile, a meter, or any plotted data,
**switch to [`dataviz/00_overview.md`](dataviz/00_overview.md)** and follow its
procedure — the chart-specific craft (forms, color jobs, marks, interaction,
anti-patterns) lives there, deliberately not duplicated here.

## Process — plan before code

No code until a compact design plan exists:

- **Color** — 4–6 hex values, each with a name (or the named theme tokens, in
  `site` mode).
- **Type** — faces for at least two roles: a display face dosed with restraint, a
  body face, plus a utility face for captions/data when called for.
- **Layout** — the layout idea, stated in a sentence or two.

Build from the plan, tracing each color choice and each type choice back to it.
**Editorial addendum:** hold the finished plan up against the subject before any
code — any part of it that could have been produced for *any* similar page gets
revised, with a note on what changed and why. The code gets written only after the
plan has proven its uniqueness, and then it follows the revised plan to the
letter.

## Realistic content

One rule, everywhere: **real content — no lorem, no `foo` / `test`.** Curate
before inventing: real values win whenever they exist, and anything fabricated is
fabricated *plausibly* and labeled as such. Whatever exhibits variants (a design
system, a component gallery) shows the canonical example first, then the variant
sweep, then the static states — empty, loading, error — which are content in their
own right, not afterthoughts. The verify gate (`SKILL.md` §3, *Plausible*) checks
this.
