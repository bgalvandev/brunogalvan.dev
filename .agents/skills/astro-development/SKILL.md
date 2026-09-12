---
name: astro-development
description: Build or evolve this Astro website, its configuration, routes, assets, or integrations. Use before Astro implementation and framework upgrades.
---

# Astro Development

Read `AGENTS.md`, `docs/architecture.md`, `astro.config.ts`, and installed package
versions first. This skill targets this application's Astro 7 baseline; do not
apply framework-monorepo contribution instructions to this website.

1. Confirm unfamiliar APIs against installed types and current official docs.
2. Put routes and dependency wiring in `src/pages`; put feature presentation in
   `src/modules/<feature>`. Follow [[frontend-architecture]].
3. Prefer prerendered `.astro` markup. Use processed `<script>` for modest browser
   behavior; attributes other than `src` opt out of normal processing. The theme
   initializer intentionally uses `is:inline` to run before paint. Keep it tiny.
4. Add framework islands only for interactions whose state/complexity justify a
   renderer. Choose a `client:*` directive based on when interaction is needed;
   retain useful server HTML and avoid `client:only` without a concrete reason.
5. Route through [[frontend-i18n]], use [[frontend-theming]], and keep public
   identity in `src/config/site.ts`. No runtime secret belongs in public config.
6. For runtime endpoints or database work, follow [[backend-architecture]] and
   record the adapter/host decision before changing rendering behavior.
7. Run `pnpm run check` and `pnpm run test:e2e` for framework/configuration changes;
   inspect emitted HTML, asset requests and console errors, not just dev output.

## Official references

Consulted 2026-09-11; recheck when changing related APIs:

- [Project structure](https://docs.astro.build/en/basics/project-structure/)
- [Internationalization](https://docs.astro.build/en/guides/internationalization/)
- [Client scripts](https://docs.astro.build/en/guides/client-side-scripts/)
- [On-demand rendering](https://docs.astro.build/en/guides/on-demand-rendering/)
- [Content collections](https://docs.astro.build/en/guides/content-collections/)
- [Testing](https://docs.astro.build/en/guides/testing/)

Use documentation links for API facts; do not install an unrelated skill merely
because its title mentions Astro. Keep this skill synchronized with actual gates.
