---
name: frontend-design
description: Design or refine portfolio layout, typography, responsiveness, motion, and action states. Use before visible UI changes; skip copy-only and invisible changes. Finish with design-review.
---

# Frontend Design

Read `DESIGN.md`, `src/styles/tokens.css`, and the rendered surface first. The brief
and actual content determine the direction. Do not invent previous client
preferences, accomplishments, metrics, or project evidence.

## Choose the depth

- Precision: fix a spacing, alignment, responsive, or state defect while preserving
  the established composition. No inspiration exercise is needed.
- Pattern extension: compare plausible compositions for new content against the
  existing site, then implement the smallest coherent extension.
- New direction: clarify the audience and purpose, explore distinct compositions,
  and select one with a rationale. Research current examples when requested or
  when unfamiliar patterns require it; derive original work and preserve licenses.

This portfolio uses the brand register: a clear professional thesis, readable
project evidence, and direct contact. Distinction should come from content,
typography, and precision. Extra interaction must earn its cost to reading speed.
Use supplied real content; keep missing links unavailable and placeholders honest.

## Build and evaluate

State the page's single job and intended reading order. Choose type roles, grouping,
width, and emphasis deliberately. Extend semantic tokens through
[frontend-theming](../frontend-theming/SKILL.md); numeric values stay in CSS, not duplicated in design memory.

Keep primary and secondary information visibly distinct. Structural numbering,
borders, and labels must encode meaningful relationships. Use restrained motion
for orientation and feedback, preserve focus, and respect reduced motion.

For dynamic surfaces, preserve ready-state geometry during loading. Scope pending
feedback to the affected action and expose one clear outcome. Static sections do
not need invented async states.

Use plain action labels and synchronized catalogs ([frontend-i18n](../frontend-i18n/SKILL.md)). Read
[craft guidance](./references/craft.md) when changing type, spacing, color, or motion.
Record shared decisions in `DESIGN.md`: objective, decision, alternative rejected,
and verification. Update superseded guidance in the same change.

Finish visible work with [design-review](../design-review/SKILL.md) using actual rendered evidence.
