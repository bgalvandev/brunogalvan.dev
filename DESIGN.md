# Design memory

## Current brief

The deliverable is the portfolio: a home page a visitor reads from top to bottom
to decide whether to write, and a case study for each project that has something
to show. It must answer who Bruno Galván is, what he has built, with what, and
how to reach him, in Spanish or English, in either theme. Do not manufacture
accomplishments, clients, testimonials or service claims; a project whose source
is private or whose deployment is gone says so instead of linking nowhere.

## Shared decisions

- Archivo Variable is the primary face and JetBrains Mono Variable labels every
  piece of metadata: periods, technologies, section indices, link names. Two
  self-hosted latin files, and no third face without measuring what it costs.
- Keep identity and language/theme controls in the header, then the hero, then
  the sections, then contact. The root entry opens the Spanish home page without
  a language-selection screen.
- Semantic colors and font families live only in `src/styles/tokens.css` as
  `light-dark()` pairs mapped through `@theme inline`; layout and control rules
  live in `src/styles/global.css` through `var(--token)`. Both themes are defined
  together; no raw palette, bare white or black, or literal font stack elsewhere.
- System light/dark preference works without JavaScript. A progressively enhanced
  button provides a persistent override. It is hidden until functional.
- Contact and profile links are real. A destination that is private or no longer
  reachable renders as plain text, never as a link a visitor cannot follow.
- Narrow screens wrap controls and long contact text without horizontal scrolling.
  Keyboard users have visible focus and a skip link into main content.

### Editorial-technical direction (2026-09-20) — superseded by Instrument

- **Objective.** Carry a seven-year record of production work, public code and a
  technology inventory in one page without the page reading as a résumé dump.
- **Decision.** A single measure of 56rem; every section is a labelled region
  whose uppercase mono label holds an 8rem left column and sticks beside the
  content while that section is read; prose in the sans face, all metadata
  (periods, technologies, project kind, link names) in mono; hairlines separate
  sections and entries; the accent is spent only on focus and the current
  language. Reading order is hero, experience, projects, stack, about, contact.
- **Case study composition.** A case study drops the labelled left column: it is
  one measure of prose under the project name, opening with a back link, the
  kind, the lead, the technologies and the real destinations, then hairline-
  separated sections whose headings are sentences rather than category labels.
  The page is narrower than the home measure because it is read, not scanned.
- **Rejected alternatives.** A product-marketing surface of cards, layered
  backgrounds and scroll-revealed blocks: it adds surface and motion to maintain
  while the evidence here is text, not product screenshots. An expressive,
  scroll-driven composition: it fights static output, reduced-motion support and
  the accessibility gates. Projects before experience: the public repositories
  are technical challenges, and production systems are the stronger claim.
- **Verification.** Rendered captures at 360, 768 and 1440px in both themes and
  both languages; axe clean in both themes on desktop and mobile; no horizontal
  overflow at any width; the section order asserted in the browser suite.

### Instrument (2026-09-21)

- **Objective.** The editorial baseline was correct and forgettable: it read as a
  well-set document, not as a person with a practice. This direction has to hold
  a brand — recognisable, deliberate, and closer to the work of the product
  teams this visitor already respects — without inventing evidence the site does
  not have. Bruno has no product screenshots to show, so the visual payload must
  be typography, generated structure and a mark.
- **Decision.** A near-black canvas with a true light twin, and one drawing
  across the whole page. The brand mark is an initial inside registration marks;
  the same corner geometry frames the viewport, so mark and layout are one
  system rather than a logo placed on a page. The opening statement is set large
  and light — 4.5rem at weight 400, leading 1, tracking −0.035em — over a 1px
  lattice faded by a radial mask with a single accent bloom, all gradients and
  no asset. Sections are numbered in mono and keep a sticky label column.
  Raised surfaces are hairline-bordered, lightly rounded and lit along the top
  edge by an inset highlight. Entrance motion is scroll-driven CSS with no
  script, and disappears under reduced motion.
- **Motion.** Nothing uses the browser's default `ease`. The site has three
  curves and three durations, and every interactive surface names one:
  `cubic-bezier(0.16, 1, 0.3, 1)` to settle, a `linear()` spring for a lift, and
  150/320/520ms. The opening lines arrive in 70ms steps rather than together; a
  band of tool names runs on a 64s loop and pauses on hover or focus; the
  pointer carries a light across a project card; routes cross-fade through the
  view transition API. All of it is CSS and about twenty lines of script, and
  all of it disappears under reduced motion — which the browser suite asserts,
  because an entrance that holds its first keyframe hides the page when it
  breaks.
- **Rejected alternatives.** Cloning the reference sites' layered product
  surfaces: they are carrying screenshots this site does not have, and an empty
  frame reads as a missing image. A 3D or canvas hero: it buys attention at the
  cost of a runtime dependency, a CSP exception and a battery draw, on a page
  whose job is to be read — and of the twelve gallery-listed sites measured on
  2026-09-21, eleven carried no motion library at all. A third display face:
  the two-file font budget is a
  decision this repository already made and measured, and the scale and weight
  changes carry the display work without it.
- **Verification.** Contrast is asserted on the tokens themselves in
  `src/styles/contrast.spec.ts`, so a failing pair breaks before anything is
  rendered; axe then runs on the home page and a case study in both themes,
  desktop and mobile. Captures at 360, 768 and 1440px in both themes and
  languages, for both compositions.

### The drawing (2026-09-21)

- **Objective.** The page had no image of any kind, and a portfolio that shows
  nothing is asking to be read rather than looked at. The reference galleries
  answer this with product screenshots, photography or a 3D render; this site
  has no screenshots it may publish, so the opening image has to be made.
- **Decision.** An isometric line drawing of a workstation, generated by
  `scripts/build/workstation.mjs` on a true 2:1 projection so every solid shares
  one geometry, emitted as a committed Astro component and painted entirely from
  tokens so it belongs to whichever theme is showing. It sits beside the opening
  statement, and only the work inside it moves: code types itself on the two
  screens, a caret blinks, steam leaves the mug.
- **Rejected alternatives.** A seated figure, which is what the reference this
  was drawn against uses: at this scale and in line art it reads as stacked
  boxes, and the room carries the idea without it. A 3D render or a Spline
  scene: a runtime and a download for one image. Stock illustration: it would
  not share the drawing's geometry with the brand mark, and the point of
  generating it is that it does.
- **Verification.** Rendered at both themes in isolation while being drawn, then
  in the page at 360, 768 and 1440px; the browser suite asserts no horizontal
  overflow, which caught the drawing's column starving the headline.

### The portrait, and how much to say (2026-09-21)

- **Objective.** A photograph pasted into a line drawing is a photograph in a
  line drawing. And the page had grown to 1168 words while the ten
  best-regarded developer portfolios measured on 2026-09-21 run a median of
  200 - rauno.me at 52, loganliffick at 59 - with one of the ten carrying a
  stack section and two mentioning education.
- **Decision.** The portrait is generated from the photograph rather than
  showing it: a grid of this repository's own source where each glyph's weight
  is the luminance of the face beneath it, on a plate that stays dark in both
  themes, so it reads as another screen in the same room as the drawing. The
  source is abstract on purpose - the projection geometry and the contrast
  arithmetic, never a file that names an employer or a date - and the sampling
  is deliberately coarse, so the likeness is recognised rather than studied.
  Content drops to one line per role, four roles instead of five, one line per
  project, and two paragraphs about the person. Education, languages and the
  per-role technology lists are gone; the stack section already names the
  tools, and the case studies hold the depth.
- **Rejected alternatives.** The photograph itself, which was the first attempt
  and which sat on the drawing rather than in it. An HTML `<pre>`: the rows
  become dozens of inline runs and the engine rounds each run's origin until
  the columns drift and the glyphs overlap, which is why every row is one SVG
  `<text>` with an explicit `textLength`. Mapping dark pixels to bright glyphs,
  which lit the hair and hollowed out the face; and no vignette at all, which
  left the wall behind the head glowing as brightly as the likeness.
- **Verification.** The tier grid was printed as ASCII and read before anything
  was rendered, which is how both the inversion and the background were caught.
  Contrast of the plate against its ink is asserted in
  `src/styles/contrast.spec.ts`. Prose, measured in the built page, went from
  1168 words to 409.

## Working on visible changes

Choose the depth before touching markup. A precision fix preserves the
composition and needs no exploration. A pattern extension compares plausible
compositions for new content against the existing page and implements the
smallest coherent one. A new direction clarifies audience and purpose first and
selects one composition with a written rationale. In every case: state the
page's single job and reading order; keep spacing inside a group smaller than
spacing between groups; emphasize with weight and hierarchy before adding sizes;
spend the accent on meaningful emphasis and focus; never encode state with hue
alone; use motion only for orientation and respect reduced motion; keep every
non-linked element from looking actionable. Record a shared decision here as
objective, decision, rejected alternative and verification; numeric values stay
in CSS.

## Review protocol

Inspect production rendering at 360, 768 and 1440px in both themes and languages.
Check hierarchy, text wrapping, contact affordances, keyboard focus and contrast.
Browser tests save review captures under ignored `test-results`; use actual
captures as evidence, and state the missing evidence when rendering was not
possible rather than inferring quality from source. Zero verified findings is a
valid result; cosmetic preference does not justify an endless redesign.
