# ADR 0005: Astro website foundation with explicit localized URLs

- Status: Accepted; root entry policy superseded by [0006](0006-language-entry.md)
- Date: 2026-09-11

## Context

The immediate deliverable is a well-defined website architecture and one basic
page, before design and editorial work. It must support a personal identity and
future commercial/service pages, including selective dynamic integrations.
The existing React/Next.js implementation is valid but uses request-based locale
selection and framework client facilities for a primarily static public surface.

## Decision

Adopt Astro 7 with static output, strict TypeScript, Tailwind v4 and feature-owned
modules. Keep the repository and history. Retain pnpm, semantic tokens, bilingual
catalogs, quality/review procedures, security auditing and CI safeguards; replace
framework-specific dependencies, tooling and instructions together.

Generate `/es/` and `/en/` with a root language selector, canonical and reciprocal
hreflang links. Theme enhancement uses native scripts and paired CSS colors;
content and language navigation work without JavaScript. Document and enforce
module direction and server/browser boundaries before new capabilities arrive.

Hosting is undecided: `dist/` is the portable artifact. Choose an adapter/runtime
when a concrete request-time capability is introduced. This record supersedes the
previous assumed hosting choice; it does not modify any external hosting account.

## Alternatives and consequences

- Keep Next.js: avoids migration, supports sophisticated application behavior and
  could also generate prefixed static pages. Reasonable, but its current runtime
  facilities are unnecessary for this initial website surface.
- Astro (chosen): HTML-oriented pages and selective client/server capabilities fit
  the expected public site. Tradeoffs include migration effort, Astro-specific
  conventions, adapter selection for runtime features, and less direct fit for an
  application dominated by shared interactive state.
- Plain static HTML: portable but requires rebuilding route, layout, asset and
  content tooling as the site grows.

No framework guarantees perfect architecture or zero limitations. Public content,
assets and deployment remain performance factors. A database needs a supported
runtime, secret management and operational work; choosing Astro does not prevent
that, nor does it provide it automatically.

Presentation-only features keep files directly in their feature folder.
The import guard and architecture guide define optional future layers without unused
implementations. TypeScript/Node tests protect contracts; production Playwright
journeys cover identity, localization, metadata, theme, accessibility and fallback.
The source archive outside the repository preserves the complete pre-migration
worktree and Git metadata. No remote repository deletion is required.

## Sources and verification

Official sources consulted 2026-09-11; recheck on relevant upgrades:

- [Astro internationalization](https://docs.astro.build/en/guides/internationalization/)
- [Astro client scripts](https://docs.astro.build/en/guides/client-side-scripts/)
- [Astro on-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Astro testing](https://docs.astro.build/en/guides/testing/)
- [Google localized sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)

Run the gates in [architecture](../architecture.md). Verify rendered output and
host behavior separately; a local build does not verify production deployment.
