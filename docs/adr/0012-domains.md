# ADR 0012: One canonical domain, the others redirect

- Status: Accepted
- Date: 2026-09-22
- Extends: [0007](0007-hosting-on-cloudflare-pages.md)

## Context

The owner holds two domains on the same Cloudflare account, `brunogalvan.dev`
and `brunogalvan.com`. The site declares one origin, `https://brunogalvan.dev`
in `src/config/site.ts`, and every canonical URL, `hreflang` alternate, sitemap
entry and social card is built from it. Serving the same pages under several
hosts would split search signals and let links drift between them.

## Options

1. **Serve both domains**: two copies of every page, and canonical tags left
   to reconcile them.
2. **Make `.com` the origin**: familiar to more visitors, but every published
   URL, card and test already names `.dev`, and `.dev` sits on the HSTS preload
   list, so browsers only ever reach it over HTTPS.
3. **`.dev` is canonical; everything else redirects to it** (chosen): the apex
   `brunogalvan.dev` serves the Pages project; `www.brunogalvan.dev`,
   `brunogalvan.com` and `www.brunogalvan.com` answer a permanent redirect to
   the same path on `https://brunogalvan.dev`.

## Decision

Option 3, set up in the Cloudflare dashboard (no token or secret enters this
repository):

- **Pages**: the project builds `main` through the Git integration, as ADR 0007
  records, with `NODE_VERSION=24` and `PNPM_VERSION=11.15.1` so the build
  matches `.nvmrc` and `packageManager`. `brunogalvan.dev` is its only custom
  domain.
- **Redirects**: one redirect rule per zone at the edge, `301`, path and query
  kept: `www.brunogalvan.dev` in the `.dev` zone; `brunogalvan.com` and
  `www.brunogalvan.com` in the `.com` zone. Each redirected host has a proxied
  placeholder DNS record so the rule is reached; no origin behind it ever
  answers.
- **TLS**: Always Use HTTPS on in both zones, minimum TLS 1.2.
- **Mail**: neither domain sends email, so each publishes a null SPF
  (`v=spf1 -all`) and a DMARC `p=reject` record, and no one can send mail as
  them.

## Consequences

- One address for every page; old or typed `.com` links land on the right page.
- Adding a host later means a record and a rule, never a second deployment.
- The redirects live in the dashboard, not in `_redirects`, because a Pages
  `_redirects` file cannot change the host.

## Verification

Run on 2026-09-22, the day the domain was connected, every check below passed:
`/` 301 to `/en/`, `/fr/` 404, the CSP and security headers, `/_astro/*`
immutable, the three redirected hosts keeping path and query, http to https in
one hop, the null SPF and DMARC on both zones, and a browser pass over every
page in both themes with no CSP violation or script error. Cloudflare's Web
Analytics had injected its beacon, which the CSP blocked, from two places:
the zone's RUM on the custom domain, disabled completely in the
`brunogalvan.dev` zone on 2026-09-22; and, from the next production deploy
on 2026-09-23, the Pages project's own Metrics → Web Analytics on
`brunogalvan.dev` and `brunogalvan.pages.dev`, disabled there and cleared by
retrying the deployment. Both must stay off unless an ADR adds the beacon to
the policy.

After any change to the domains, redirects or zone settings:

```sh
curl -sI https://brunogalvan.dev/ | grep -iE '^(HTTP|location)'             # 301 → /en/
curl -sI https://brunogalvan.dev/fr/ | grep -i '^HTTP'                       # 404
curl -sI https://brunogalvan.dev/en/ | grep -i 'content-security-policy'
curl -s https://brunogalvan.dev/en/ | grep -c cloudflareinsights            # 0, after every production deploy
curl -sI https://www.brunogalvan.dev/en/about/ | grep -iE '^(HTTP|location)' # 301 → https://brunogalvan.dev/en/about/
curl -sI https://brunogalvan.com/es/ | grep -iE '^(HTTP|location)'          # 301 → https://brunogalvan.dev/es/
curl -sI http://www.brunogalvan.com/ | grep -iE '^(HTTP|location)'          # 301 → https
dig +short TXT brunogalvan.com                                               # "v=spf1 -all"
```

Sources consulted 2026-09-22:

- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Cloudflare single redirects](https://developers.cloudflare.com/rules/url-forwarding/single-redirects/)
- [Cloudflare Pages build image](https://developers.cloudflare.com/pages/configuration/build-image/)
