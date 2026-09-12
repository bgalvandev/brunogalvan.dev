---
name: frontend-architecture
description: Structure Astro routes, layouts, shared UI, and feature presentation. Use when adding or reshaping source responsibilities or imports.
---

# Frontend Architecture

Read `docs/architecture.md` for the dependency contract and evolution examples.
The initial feature is `src/modules/home/home-page.astro`.

- `src/pages`: URL parameters, metadata selection and composition roots.
- `src/layouts`: HTML document and global assets, independent of features.
- `src/components`: shared UI, independent of pages and features.
- `src/modules/<feature>`: feature UI; files may live directly in the feature folder.
  Add explicit layers only when distinct responsibilities require them.
- `src/i18n`: locale types, route mappings and synchronized message catalogs.
- `src/config`: public identity and build-time configuration.
- `src/styles`: semantic tokens and shared visual rules.

Keep domain rules outside components. Introduce application ports and infrastructure
when a feature gains real I/O; follow [[backend-architecture]]. Do not create empty
layers, repositories or generic services for hypothetical behavior. Architecture
quality depends on explicit ownership and enforceable boundaries, not file count.

Astro frontmatter executes at build time for static pages. Browser `<script>`
blocks execute separately; never import a server capability into their graph.
Pass serializable, public view data to UI; never pass database handles or secrets.

Use a named feature module for a coherent responsibility. Share only actual reused
UI; avoid extracting every wrapper. Keep routes as composition, without business
rules. Cross-feature orchestration belongs in composition roots, not imports of
another feature's private files. Introduce a public contract with a documented
boundary-rule change if cross-feature collaboration becomes necessary.

Run `pnpm run architecture:check`, lint and typecheck. Add a regression fixture
when extending the import contract, then verify relevant production journeys with
[[frontend-e2e]]. Related: [[astro-development]], [[code-quality]].
