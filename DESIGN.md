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
- **Rejected alternatives.** Cloning the reference sites' layered product
  surfaces: they are carrying screenshots this site does not have, and an empty
  frame reads as a missing image. A 3D or canvas hero: it buys attention at the
  cost of a runtime dependency, a CSP exception and a battery draw, on a page
  whose job is to be read. A third display face: the two-file font budget is a
  decision this repository already made and measured, and the scale and weight
  changes carry the display work without it.
- **Verification.** Contrast is asserted on the tokens themselves in
  `src/styles/contrast.spec.ts`, so a failing pair breaks before anything is
  rendered; axe then runs on the home page and a case study in both themes,
  desktop and mobile. Captures at 360, 768 and 1440px in both themes and
  languages, for both compositions.

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
