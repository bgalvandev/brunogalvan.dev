# Design memory

## Current brief

The current deliverable is architecture plus a basic, usable first page. Final
visual direction, services, projects and editorial content have not been approved.
Do not manufacture accomplishments, clients, testimonials or service claims.

The visitor should identify Bruno Galván, read a short professional introduction,
choose Spanish or English and find a direct contact link.

## Shared decisions

- Retain restrained typography and generous spacing for readable baseline content.
  Archivo Variable is the primary face; JetBrains Mono Variable labels controls.
  Fonts are self-hosted build assets. Avoid decorative interaction at this stage.
- Keep identity and language/theme controls in the header, one main statement and
  supporting sentence, then contact. The root entry opens the Spanish home page
  without a language-selection screen.
- Semantic colors and font families live only in `src/styles/tokens.css` as
  `light-dark()` pairs mapped through `@theme inline`; layout and control rules
  live in `src/styles/global.css` through `var(--token)`. Both themes are defined
  together; no raw palette, bare white or black, or literal font stack elsewhere.
- System light/dark preference works without JavaScript. A progressively enhanced
  button provides a persistent override. It is hidden until functional.
- Contact and profile links are real. The first page has no invented project cards,
  unavailable actions, placeholder metrics or implementation details in its copy.
- Narrow screens wrap controls and long contact text without horizontal scrolling.
  Keyboard users have visible focus and a skip link into main content.

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
valid result; cosmetic preference does not justify an endless redesign. This is a
functional baseline, not a completed brand design.
