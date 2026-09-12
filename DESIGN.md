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
  supporting sentence, then contact. The root entry opens the Spanish home page without a language-selection screen.
- Semantic colors live only in `src/styles/tokens.css`; layout/control rules live
  in `src/styles/global.css`. Define both themes together rather than duplicating
  color values here.
- System light/dark preference works without JavaScript. A progressively enhanced
  button provides a persistent override. It is hidden until functional.
- Contact and profile links are real. The first page has no invented project cards,
  unavailable actions, placeholder metrics or implementation details in its copy.
- Narrow screens wrap controls and long contact text without horizontal scrolling.
  Keyboard users have visible focus and a skip link into main content.

## Review protocol

Inspect production rendering at 360, 768 and 1440px in both themes and languages.
Check hierarchy, text wrapping, contact affordances, keyboard focus and contrast.
Browser tests save review captures under ignored `test-results`; use actual
captures as evidence. This is a functional baseline, not a completed brand design.
