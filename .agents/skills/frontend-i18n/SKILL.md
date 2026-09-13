---
name: frontend-i18n
description: Add or change localized text, URLs, metadata, or languages. Use for bilingual content and route changes.
---

# Frontend Internationalization

Spanish and English have explicit, prerendered `/es/` and `/en/` URLs.
`astro.config.ts` redirects to the default locale's home page. It does not
infer language from location, cookies or browser settings. Each route's default
locale URL is its `x-default` alternate. Static output uses Astro's HTML refresh
fallback; configure an equivalent HTTP 301 redirect on the chosen production host.

1. Add visible text to both `src/i18n/messages/es.json` and `en.json` with the same
   keys. Read it through typed `messages(locale)`. Proper names, addresses and
   technology names may remain literal. Native language names live in
   `src/i18n/locales.ts` beside the locale list and are not translated. 404
   bilingual navigation labels are
   intentional exceptions; do not use them in localized feature UI.
2. Add each page to `src/i18n/routes.ts` with equivalent paths for both locales.
   Use `pagePath` and `alternatePages` for links; do not rewrite URL prefixes by
   string replacement. Translated slugs may differ.
3. Supply localized title/description and the mapped canonical path to the layout.
   Shared SEO renders canonical, reciprocal hreflang and x-default links from the
   route map. Keep every alternate URL directly accessible; only the unprefixed
   root redirects.
4. Generate all intended locale paths and return 404 for unsupported paths.
   Do not make the same URL depend on language cookies or Accept-Language.
5. Use `Intl` for dates/numbers when needed; specify timezone for date/time output.
   Add ICU support only when real pluralization/interpolation requires it.

Run unit tests for catalog parity and route pairs, then [frontend-e2e](../frontend-e2e/SKILL.md) for direct
links, equivalent-page switching, metadata and no-JS navigation. Prefixes make
language URLs explicit and cacheable; they are not themselves a speed optimization.
