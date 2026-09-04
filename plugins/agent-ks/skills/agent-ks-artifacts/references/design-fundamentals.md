# Design fundamentals

Calibrate the treatment first. Then these rules apply to every artifact. Make each palette, type and layout decision for this subject. A templated default is never the reason for a choice.

## Calibrate the treatment

Read the request before any visual decision. The question is never whether to design. A plan deserves the same craft as a landing page. The question is which treatment carries that craft. Pick one row.

| Treatment | Use for | Rule |
|---|---|---|
| Utilitarian, the default | An embedded explainer, a status dashboard, a metrics report, a decision memo | Real typographic hierarchy, considered spacing, a chosen palette. No giant hero. Keep flourishes few and tasteful. A well-composed page is never wrong. |
| Editorial | A standalone showcase: a brand-guideline landing surface, a poster-like specimen, an interactive toy to keep or share | Ask three questions before code. Purpose: what job the page does, and who reads it. Tone: a concrete direction from the tone menu below. Differentiation: the one thing a reader remembers. Commit to strong choices. Take one bold aesthetic risk where the work can carry it. |
| Decision tooling | A variation set: N options of one element, built to pick one | Each option is editorial and reads as a shippable design. The utilitarian default does not limit the options. The chrome around them (switcher, comparison table) stays utilitarian. See [design-systems.md](design-systems.md#variation-sets). |

When unsure, choose utilitarian. An over-composed page is sometimes wrong. A clean one never is. The editorial branch below runs only when the treatment is editorial.

## Fundamentals

| Rule | Do |
|---|---|
| Anchor to the subject | Name one concrete subject, its reader and the one job the page does. Draw distinctive choices from the subject's own materials, instruments and vocabulary. Fill the page with real content from the start. |
| Neutrals are decisions | A grey exactly in the middle looks like no one chose it. Lean a grey toward the page's accent. Plain white and near-black grounds are good when the subject wants them. In `site` mode the neutrals come from `--color-bg-*` and `--color-text-*`. This rule concerns `self` mode. |
| Space with layout | Give sibling groups flex or grid plus `gap`. Per-element margins collapse and double without warning. Wide content follows the [never-table](../SKILL.md#never). |
| Output matches source | Close every non-void element. Double-quote every attribute. Style keyboard focus visibly. Honor `prefers-reduced-motion`. Draw generative or decorative graphics with Canvas or WebGL, not long hand-written SVG paths. |
| Watch specificity | Arrange the cascade so no rule cancels the spacing another rule set. A `.section` rule and a `.cta` rule that fight over one padding is the common case. |
| Structure tells the truth | Every numbering, eyebrow (a small label above a heading), divider or label encodes a real property of the content. Use 01 / 02 / 03 only when the content runs in that order. |
| Digits | Digit columns take `font-variant-numeric: tabular-nums`. Big standalone numbers do not; see [dataviz.md](dataviz.md#figures). |

## Copy

Copy is part of the design.

- Name things by what people do: a person manages notifications, not webhook config.
- Keep the voice active.
- Let a control state its exact effect. A button reads "Publish". A toast reads "Published".
- An error states what broke and what to do. No apology. No vague message.
- Concrete wording beats clever wording.

## The anti-generic rules

AI-produced design repeats a few looks. The user's named direction outranks every rule here, even when it is on the list. With no direction given, do not spend that freedom on one of these.

Color and type defaults:

- A cream ground (`#F4F1EA`) under a serif display face, accented in terracotta.
- A near-black page with one acid-green or vermilion highlight.
- A hero that washes purple into blue over a white page.
- Inter or Space Grotesk as the "safe" face.

Layout defaults:

- A broadsheet look: hairline rules over dense text columns.
- Sections flagged with emoji.
- The whole page center-aligned.
- `rounded-lg` on everything.
- Rounded cards with an accent bar or rail.

No entry is banned. A subject that calls for one gets it, deliberately.

Match the execution to the vision. A maximalist direction needs elaborate follow-through. A minimal one needs exact spacing, type and detail. Put boldness at one point and keep its surroundings quiet. When an accent clashes with its background, move it toward a neighbouring hue or reduce its saturation. Do not swap it.

## Editorial branch

This section applies only when the treatment is editorial. The treatment table above decides that.

| Rule | Do |
|---|---|
| Commit to a tone | Pick one: brutally minimal, maximalist, retro-futuristic, organic, luxury, playful, editorial-magazine, brutalist, art-deco, soft pastel, industrial. Treat the list as a start. Design a tone that belongs to this subject. |
| Diverge between generations | Do not use the same display face every time. Space Grotesk is the common offender. Rotate light against dark, the type pairing and the whole aesthetic from artifact to artifact. |
| Background as atmosphere | Where the direction supports it: a gradient mesh, restrained grain, a geometric pattern, layered transparency, dramatic shadow, a decorative border. Keep texture only while it serves the tone. Texture obeys `prefers-reduced-motion`. |
| Open with a thesis | Lead with the most characteristic thing about the subject: a headline, an image, a live demo, an interactive moment. Put all motion into one page-load or scroll reveal. Over-animation marks a page as AI-made. |

## Typography

Type carries an artifact even when the artifact is not about type.

- Keep running text near 65 characters per line.
- Commit to one type scale. In `site` mode use the semantic tokens: `--content-*` for prose, `--ui-text-*` for chrome. In `self` mode define your own scale and keep to it.
- Pair a distinctive display face, used sparingly, with a body face that suits it. Add a utility face for captions and data when needed.
- Give headings `text-wrap: balance`. Give body text room. Give uppercase labels a little letter-spacing.
- Font delivery is a publishing concern. See [publishing.md](publishing.md#fonts).

## When the artifact is a UI

A dashboard or a tool is scanned and operated, not read top to bottom. The craft moves from typography to information design.

- Put the summary before the detail.
- Let form carry state beside the number: a chip, a pill, a severity stripe.
- Keep semantic color (good, warning, critical) apart from the accent. It never counts toward the accent.
- Make every interactive part look interactive.

When an artifact holds a chart, a stat tile, a meter or any plotted data, switch to [dataviz.md](dataviz.md). Follow its procedure.

## Process

Write no code before a compact plan exists.

| Part | Content |
|---|---|
| Color | Four to six hex values, each named. Or the theme tokens in `site` mode |
| Type | Faces for at least two roles: a display face and a body face. A utility face when needed |
| Layout | The layout idea in one or two sentences |

Build from the plan. Trace each color and type choice back to it.

For an editorial treatment, check the plan against the subject before code. Revise any part that could serve any similar page. Note what changed and why. Then follow the revised plan exactly.

## Realistic content

Use real content everywhere. No lorem ipsum. No `foo` or `test`. Collect real values before you invent any. Real values win when they exist. Make a fabricated value plausible and label it as fabricated. Anything with variants (a design system, a component gallery) shows the standard example first. Then the variant sweep. Then the static states: empty, loading, error. The verify gate in [publishing.md](publishing.md#verify-before-you-publish) checks this.
