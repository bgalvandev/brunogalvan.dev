---
name: website
description: Build or change this Astro website: pages, localized routes and catalogs, theme tokens, browser scripts and the Playwright suite. Use before any change under src or e2e; not for repository governance or Git tasks.
---

# Website

Read `AGENTS.md`, `docs/architecture.md`, `DESIGN.md` and `astro.config.ts`
first. Confirm any unfamiliar Astro API against the installed types and the
official guide before using it; this skill is project-authored, not official.

## Pages and localization

- A page is a feature folder under `src/modules`, a route pair in
  `src/i18n/routes.ts` (translated slugs are fine) and thin composition in
  `src/pages`. `pagePath` and `alternatePages` build every internal link,
  canonical and hreflang; never rewrite URL prefixes by string replacement.
- Every visible string goes to both catalogs under `src/i18n/messages` and is
  read through `messages(locale)`. Proper names, the contact address and native
  language names in `src/i18n/locales.ts` stay literal.
- `/` redirects to the default locale in `astro.config.ts`; each page's
  default-locale URL is its `x-default`. The static build emits an HTML refresh;
  the host must provide the HTTP 301.

## Scripts and theme

- Prefer prerendered markup. A processed `<script>` covers modest behavior; the
  theme initializer is `is:inline` on purpose so it runs before paint. Add a
  framework island only when state justifies it, with an HTML fallback.
- Tokens live in `src/styles/tokens.css` as `light-dark()` pairs mapped through
  `@theme inline`; components use `var(--token)` or the semantic utilities only.
  `theme-init.astro` restores a valid stored theme; `theme-toggle.astro` enhances
  the button, and the page follows the OS without JavaScript.

## Browser suite

- `pnpm run test:e2e` builds the site and serves it on port 3100 through
  `scripts/e2e/preview.mjs`, which keeps the server under Playwright's control.
  The port must be free; stop only servers this task started.
- Prefer role and name locators and web-first assertions; no sleeps. Cover
  direct locale URLs, equivalent links, contact destinations, canonical and
  hreflang, 404, sitemap, robots, theme persistence and the no-JavaScript path.
  axe runs in both themes and complements, never replaces, keyboard checks and a
  rendered review at 360, 768 and 1440 px.

## Commands

`pnpm run dev` (port 3000), `pnpm run check`, `pnpm run test:e2e`,
`pnpm run security:audit`. Framework or configuration changes run all of them and
inspect the emitted HTML and asset requests, not only the dev server.

Official references, consulted when changing the related behavior:
[project structure](https://docs.astro.build/en/basics/project-structure/),
[internationalization](https://docs.astro.build/en/guides/internationalization/),
[client scripts](https://docs.astro.build/en/guides/client-side-scripts/),
[fonts](https://docs.astro.build/en/guides/fonts/),
[content collections](https://docs.astro.build/en/guides/content-collections/),
[on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/).
