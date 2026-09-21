# brunogalvan.dev

Bruno Galván's bilingual personal website: Astro, strict TypeScript and Tailwind
CSS v4. The home page carries the professional record, the public projects and
the technology inventory in Spanish and English; project case studies are future
work.

## Local development

Use the Node version in `.nvmrc` and the pnpm version in `package.json` via Corepack.

```sh
nvm use
corepack enable
pnpm install --frozen-lockfile
pnpm run dev
```

Open `http://127.0.0.1:3000/es/` or `http://127.0.0.1:3000/en/`.
The root URL redirects to `/es/`; the visible language selector links to `/en/`. Stop the owned terminal process with Ctrl+C.
No environment file, database or container service is required.

```sh
pnpm run build
pnpm run preview
```

Build output is static `dist/`; preview uses `http://127.0.0.1:3100` for local
verification. Cloudflare Pages builds `main` and every pull request from the
connected repository (build command `pnpm run build`, output `dist`); redirects
live in `public/_redirects` and the build writes `dist/_headers`. See ADR 0007.

## Engineering

- [Architecture and extension paths](docs/architecture.md): ownership, dependency
  contract, rendering, routes, future database/server capabilities and tooling.
- [Current decision](docs/adr/0005-astro-foundation.md): alternatives and tradeoffs.
- [Contributor rules](AGENTS.md): standing standards; procedures in `.agents/skills`.
- [Design memory](DESIGN.md): the editorial-technical direction and shared visual intent.
- [Content model](docs/adr/0008-portfolio-content-model.md): typed data beside the
  feature, prose in both catalogs.

```sh
pnpm run check
pnpm exec playwright install chromium
pnpm run test:e2e
pnpm run security:audit
```

The browser suite builds and manages an isolated preview on port 3100, which must
be free. CI runs the local gates, browser journeys and registry security auditing.

Public identity and links live in `src/config/site.ts`; `pnpm run og:generate`
re-renders the social cards and touch icon from it after a change. Approved contact:
`brunogalvangarcia@outlook.com`. Catalogs live in `src/i18n/messages`; route pairs in
`src/i18n/routes.ts`. Do not copy identities or affiliations from templates.
