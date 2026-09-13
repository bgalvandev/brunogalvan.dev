---
name: design-review
description: Inspect rendered portfolio layout, spacing, responsiveness, motion, and action feedback against the brief and DESIGN.md. Use before finishing visible UI changes; skip copy-only and invisible changes.
allowed-tools: Bash(pnpm run dev), Bash(pnpm exec playwright *)
---

# Design Review

Read `DESIGN.md` and state the audience, page purpose, and changed surface. Review
as a separate skeptical pass; source inspection alone is not visual evidence.

- Run the site with `pnpm run dev` or inspect the production preview. Capture actual affected states using Playwright
  in `test-results/`. For a page change inspect approximately 360, 768, and 1440px
  in light and dark themes; for a leaf correction inspect affected and adjacent
  widths. Check Spanish and English wrapping where text affects geometry.
- Complete the main task, then check reading order, spacing groups, contact and
  project affordances, overflow, contrast, visible keyboard focus, and reduced
  motion. Compare any loading state with its ready state at the same width.
- Check pending feedback and recovery only where an action exists. Never add fake
  loading or error UI to static content for the sake of a checklist.
- For each finding record screenshot/state, objective harmed, mechanism, severity,
  and a concrete fix. Try to falsify it before reporting it.
- Fix blocking or consequential issues and re-review changed areas. Cosmetic
  preferences do not justify an endless redesign. Zero verified findings is valid.

Report the actual widths/themes/interactions inspected, remaining findings, and
whether the primary task works. If rendering was unavailable, state the missing
evidence rather than inferring visual quality from source markup.

Related: [frontend-design](../frontend-design/SKILL.md), [frontend-theming](../frontend-theming/SKILL.md), [frontend-i18n](../frontend-i18n/SKILL.md).
