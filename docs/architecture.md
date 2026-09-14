# Website architecture

The application delivers a public bilingual website as static HTML with explicit
feature ownership. The initial product is one basic home page in two languages.
Design, editorial content, services, a CMS and a database are separate future
requirements and get their own decision records when they arrive.

## Current structure

```text
src/
  pages/                     URL mapping and composition roots
    [locale]/index.astro      Statically generated /es/ and /en/
    404.astro                Bilingual recovery, noindex
    robots.txt.ts            Static crawler endpoint
  layouts/                   HTML document, global assets, metadata wiring
  components/                Shared SEO, language and theme controls
  modules/
    home/                    Initial feature presentation
  config/site.ts             Approved public identity and canonical origin
  i18n/                      Locale types, route pairs, typed message catalogs
  styles/                    Semantic theme tokens and shared styling
scripts/
  check-tokens.mjs           Semantic-color check over src and public
  e2e/                       Preview lifecycle owned by Playwright
```

Aliases use `@/` for `src/`. Pages compose; layouts own the document; components
are shared UI that never imports a feature; a feature keeps its files in its own
folder under `modules/`. Tests live beside pure TypeScript behavior; production
browser tests live in `e2e`. There is no server code, so there is nothing for an
import guard to check yet; one returns with the first feature that has separate
responsibilities or the first request-time capability.

## Rendering and localization

- `output: static` produces `dist/`, with no application server requirement.
- `/es/` and `/en/` are independent, cacheable documents. Cookies and browser
  language do not change their content. `/` redirects to `/es/`.
- Central route pairs drive internal links, canonical paths and reciprocal
  `hreflang`; each page's default-locale URL is its `x-default`.
- Catalog types catch missing values, and a parity test catches extra/missing keys
  in either language. Add formatted plurals only when actual content needs them.
- Static sitemap and robots use the public production origin; missing URLs return
  a non-indexable 404. The deployment must serve `404.html` with status 404 and
  preserve trailing-slash URLs; verify that on the chosen host.
- Astro markup requires no hydration framework. A short browser script enhances
  the theme button; an inline initializer restores the override before paint.
  CSS follows the OS with no JavaScript. Fonts go through Astro's font
  pipeline from the installed fontsource packages: only the two latin files
  ship, preloaded, with metric-matched fallbacks declared inline and hashed
  into the CSP.

## Adding a page

Add a feature folder under `src/modules`, both message catalogs, a route pair in
`src/i18n/routes.ts` and thin route composition. For editorial content, use a
schema-validated Astro content collection when entries need structured fields.
Add equivalent locale links and metadata tests, including an appropriate
x-default for that page.

A form or database-backed page changes the deployment model: it needs an adapter
and host decision recorded as an ADR, server-only environment validation, input
validation at the boundary and abuse controls. None of that is installed for
hypothetical content.

## Verification and operations

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm exec playwright install chromium
pnpm run test:e2e
pnpm run security:audit
```

`check` includes formatting, the token check, tool tests, lint, typecheck, unit
tests, build, dead-code and clone checks. Browser and registry checks are separate
because they need a browser/server and an external service. CI runs all three
categories; local execution is not evidence of remote CI success. Chromium
desktop/mobile coverage is not cross-engine browser certification.

Hosting is Cloudflare Pages ([ADR 0007](adr/0007-hosting-on-cloudflare-pages.md)):
the Git integration builds `main` with `pnpm run build`, serves `dist/` and gives
every pull request a preview deployment. `public/_redirects` carries the HTTP 301
from `/` to `/es/`; the build writes `dist/_headers` with a Content Security
Policy whose script sources are the sha256 hashes of the inline scripts in the
built HTML, so the pre-paint theme initializer needs no `'unsafe-inline'`, plus a
one-year immutable cache for `/_astro/*`. Pages serves `404.html` with status 404.
`check:dist` proves the file lists every inline hash; one browser test replays
the built `/*` headers on every preview response and asserts that no
`securitypolicyviolation` fires on either page, the 404, both themes and the
theme button, so the policy is exercised before a deploy, not only listed.
After a deploy, verify the redirect, the 404 status, the CSP header and TLS on
the real domain with the commands in the ADR. See
[ADR 0005](adr/0005-astro-foundation.md) for the framework decision.

The E2E preview wrapper uses the documented experimental Astro programmatic API
to keep lifecycle ownership with Playwright; the CLI can auto-background under an
agent. Astro is pinned to a minor series and the real browser suite checks startup
and teardown. Recheck this API when upgrading Astro. Knip marks that wrapper as an
entry because command-string discovery does not trace it.

The root redirect is declared in `astro.config.ts` and follows
[ADR 0006](adr/0006-language-entry.md): prefixed language URLs, a fixed default
entry and visible equivalent-page links. Astro emits an HTML refresh redirect for a
static build as a fallback; `public/_redirects` gives Cloudflare Pages the HTTP 301. Local preview is not proof of the HTTP redirect; verify it on the deployed
domain. The redirect source is excluded from the sitemap.
