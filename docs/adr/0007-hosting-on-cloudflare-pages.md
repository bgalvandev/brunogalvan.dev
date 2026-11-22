# ADR 0007: Hosting on Cloudflare Pages

- Status: Accepted; the root now redirects to `/en/` ([0010](0010-english-default-entry.md))
- Date: 2026-09-13

## Context

The site is a static `dist/` with two behaviors only a host can provide: an HTTP
301 from `/` to `/es/` (the static build can only emit an HTML refresh) and a
real 404 status for unknown paths (a host that answers 200 with the 404 page's
body hurts indexing). Until now no host was chosen, so the browser test that
asserts a 404 only proved what `astro preview` does. The maintainer already has a
Cloudflare account and the domain on it.

## Options

- **Cloudflare Pages** (chosen): Git integration builds on push and per pull
  request, `_redirects` and `_headers` files in the output control redirects,
  cache and security headers, `404.html` is served with status 404, free for this
  volume, and the domain's DNS already lives on Cloudflare.
- **Netlify**: equivalent feature set and file conventions; a second provider to
  operate when DNS is already on Cloudflare.
- **GitHub Pages**: no custom 301 redirects or response headers, so the root
  redirect and the CSP would stay in the HTML.

## Decision

Deploy through Cloudflare Pages' Git integration: build command `pnpm run build`,
output directory `dist`, Node from `.nvmrc`, pnpm from `packageManager`. The
repository owns the host configuration as files: `public/_redirects` (`/ /es/ 301`)
and `dist/_headers`, written at build time by `scripts/build/cloudflare-headers.mjs`.
The Content Security Policy allows scripts from `'self'` plus the sha256 hash of
each inline script found in the built HTML, so the intentional pre-paint theme
initializer keeps running without `'unsafe-inline'` and a changed script can never
ship with a stale hash; `/_astro/*` gets a one-year immutable cache because Astro
fingerprints those files.

## Consequences

- The redirect, the 404 status and the headers become verifiable in production
  instead of assumed from preview.
- Connecting the repository and the domain is a one-time step in the Cloudflare
  dashboard; no token or secret enters this repository.
- A new inline script is hashed automatically; a new external origin (fonts,
  analytics, an embed) needs an explicit CSP change in the integration.

## Verification

After the first deploy and after any change to redirects, headers or scripts:

```sh
curl -sI https://brunogalvan.dev/ | grep -iE '^(HTTP|location)'        # 301 → /es/
curl -sI https://brunogalvan.dev/fr/ | grep -i '^HTTP'                  # 404
curl -sI https://brunogalvan.dev/es/ | grep -i 'content-security-policy'
curl -sI "https://brunogalvan.dev$(grep -o '/_astro/[^" ]*\.css' dist/es/index.html | head -1)" | grep -i cache-control
```

Sources consulted 2026-09-13:

- [Cloudflare Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Cloudflare Pages headers](https://developers.cloudflare.com/pages/configuration/headers/)
- [Cloudflare Pages custom 404 pages](https://developers.cloudflare.com/pages/configuration/serving-pages/)
