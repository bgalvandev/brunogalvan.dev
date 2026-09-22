# ADR 0010: English as the default entry

- Status: Accepted
- Date: 2026-09-22
- Supersedes: the default language in [0006](0006-language-entry.md)

## Context

ADR 0006 made Spanish the default: `/` redirected to `/es/` and `x-default`
pointed at each page's Spanish URL. On 2026-09-22 the owner set the site's
audience as large companies in the United States. For that reader the first
page they reach, the one a shared bare link opens and the one search engines
offer when no language matches, should be English.

## Options

1. **Keep Spanish as the default.** No change, but the intended reader lands on
   a page in a language they may not read and has to find the switch.
2. **Negotiate from `Accept-Language` at the root.** Serves each visitor their
   language, but needs host logic, varies the cache on a header, and ADR 0006
   already rejected it for an unproven need.
3. **Make English the default.** One configuration value: `/` redirects to
   `/en/`, and `x-default` points at each page's English URL.

## Decision

Option 3. `defaultLocale` in `src/i18n/locales.ts` is `en`, and `locales` lists
English first, so every list of alternates starts with the default.
`public/_redirects` sends `/ /en/ 301`; Astro's own redirect follows the same
value. Everything else in ADR 0006 stands: both languages keep their prefixed
URLs, explicit URLs always win, and nothing reads cookies or browser language.

## Consequences

- A link to the bare domain opens the English home page, and search engines
  receive English as the fallback for unmatched languages.
- Spanish stays complete and equal: same pages, same content, reciprocal
  `hreflang`. The 404 page leads with English and offers both homes.
- The host checks in ADR 0007 now expect `301 → /en/`. They remain unverified
  until the domain is connected.
