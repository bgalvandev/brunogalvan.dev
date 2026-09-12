---
name: frontend-e2e
description: Write or debug production browser journeys and accessibility checks with Playwright. Use for routing, metadata, theme, contact, or visible interaction changes.
---

# Frontend E2E

`pnpm run test:e2e` builds Astro and starts Astro preview on port 3100. It refuses
to reuse another listener. Preview verifies the artifact; it is not a production
hosting recommendation. Tests live in `e2e`; desktop and mobile use Chromium.
This covers responsive behavior, not all browser engines.

- Install the browser with `pnpm exec playwright install chromium`; use
  `--with-deps` when OS libraries are missing (CI does this).
- Prefer accessible role/name locators and web-first assertions; avoid sleeps.
- Keep cases independent. Test real HTML and navigation rather than mock routes.
- Cover direct locale URLs, equivalent links, contact destinations, canonical and
  hreflang tags, 404, sitemap and robots. Theme tests include persistence, OS
  preference, blocked storage and JavaScript-disabled content.
- Use axe for rendered accessibility in both themes. Automated checks supplement
  keyboard navigation and [[design-review]]; they do not prove full accessibility.
- Extract a page object only when repeated user actions justify one.
- Capture visual evidence in ignored `test-results`; inspect desktop, tablet and
  narrow layouts in both themes. Reports and traces must not contain secrets.

The suite is separate from `pnpm run check` because it needs a browser and a
server; CI has a dependent e2e job. Use `--project=chromium` for a focused retry.
Stop only servers owned by the task; see [[local-development]].

The test server uses `scripts/e2e/preview.mjs` so Playwright owns its lifecycle even
when the CLI detects an agent and would auto-background. Astro documents this API
as experimental; the pinned minor and production suite bound that compatibility
risk. Recheck the programmatic preview API on framework upgrades.
