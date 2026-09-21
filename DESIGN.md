# Design memory

## Current brief

The deliverable is the portfolio home page: one document a visitor reads from top
to bottom to decide whether to write. It must answer who Bruno Galván is, what he
has built, with what, and how to reach him, in Spanish or English, in either
theme. Project case studies are the next requirement and are not approved yet.
Do not manufacture accomplishments, clients, testimonials or service claims.

## Shared decisions

- Retain restrained typography and generous spacing for readable baseline content.
  Archivo Variable is the primary face; JetBrains Mono Variable labels controls
  and metadata. Fonts are self-hosted build assets.
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

### Editorial-technical direction (2026-09-20)

- **Objective.** Carry a seven-year record of production work, public code and a
  technology inventory in one page without the page reading as a résumé dump.
- **Decision.** A single measure of 56rem; every section is a labelled region
  whose uppercase mono label holds an 8rem left column and sticks beside the
  content while that section is read; prose in the sans face, all metadata
  (periods, technologies, project kind, link names) in mono; hairlines separate
  sections and entries; the accent is spent only on focus and the current
  language. Reading order is hero, experience, projects, stack, about, contact.
- **Rejected alternatives.** A product-marketing surface of cards, layered
  backgrounds and scroll-revealed blocks: it adds surface and motion to maintain
  while the evidence here is text, not product screenshots. An expressive,
  scroll-driven composition: it fights static output, reduced-motion support and
  the accessibility gates. Projects before experience: the public repositories
  are technical challenges, and production systems are the stronger claim.
- **Verification.** Rendered captures at 360, 768 and 1440px in both themes and
  both languages; axe clean in both themes on desktop and mobile; no horizontal
  overflow at any width; the section order asserted in the browser suite.

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
