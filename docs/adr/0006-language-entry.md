# ADR 0006: Language URLs and direct default entry

- Status: Accepted
- Date: 2026-09-12
- Supersedes: the root selector and x-default policy in [0005](0005-astro-foundation.md)

## Decision

Keep Spanish and English under `/es/` and `/en/` on one origin. Redirect `/` to
`/es/`, the configured default, so visitors reach content without an interstitial.
Keep visible language links to equivalent pages. Explicit locale URLs always win;
neither geography nor browser preferences override them. Map x-default to each
page's default-language URL, with self-canonical URLs for each translation.

Subdomains are a valid alternative when language sites require separate ownership
or deployments. This website shares its content model, components and deployment;
subdirectories fit that requirement without adding separate origins. URL shape
alone is neither a performance advantage nor a measure of engineering quality.

A browser-language redirect from the root is another valid product choice, but
adds negotiation and cache behavior without a demonstrated audience requirement.
The visible selector makes both translations available without that dependency.

## Deployment and verification

Astro's static build emits an HTML refresh redirect, which works without JavaScript.
At deployment, configure an equivalent HTTP 301 for `/` → `/es/`; the host is not
yet chosen. Do not claim this host configuration is complete based on dev/preview.
The sitemap must omit the redirect source and include both localized destinations.

Verify root entry, direct URLs with conflicting cookies/browser preferences,
reciprocal metadata, equivalent-page switching, and JavaScript-disabled navigation.

Sources consulted 2026-09-12:

- [Google multilingual site guidance](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Astro redirects](https://docs.astro.build/en/reference/configuration-reference/#redirects)
