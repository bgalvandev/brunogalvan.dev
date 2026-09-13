---
name: frontend-theming
description: Change semantic colors, light/dark behavior, or theme controls. Use when styling components or editing shared CSS tokens.
---

# Frontend Theming

Read `src/styles/tokens.css`, `src/styles/global.css` and `DESIGN.md`.

- Use semantic utilities: paper, surface, ink, muted, line, accent and
  accent-contrast. Never use raw Tailwind palette colors in product components.
- Define each token with paired light/dark values using CSS `light-dark()` and
  map utilities through `@theme inline`. The root `color-scheme` follows the OS
  unless `data-theme` explicitly selects light or dark.
- `theme-init.astro` restores only valid stored values before paint. Storage
  failure must preserve a working page. `theme-toggle.astro` enhances the button
  only when its script runs; without JS the page still follows the OS.
- Keep labels in both catalogs. Expose the toggle state accessibly and preserve
  visible keyboard focus. Confirm theme persists across locale navigation.

Verify actual light/dark rendering, OS preference, storage failure, no-JS fallback
and contrast with [frontend-e2e](../frontend-e2e/SKILL.md) and [design-review](../design-review/SKILL.md). `pnpm run ai:guard`
rejects raw color utilities; browser accessibility tests check rendered contrast.
