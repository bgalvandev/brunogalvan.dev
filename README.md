# brunogalvan.dev

Bruno Galván's bilingual website foundation: Astro, strict TypeScript and Tailwind
CSS v4. The initial home page is intentionally basic; final design, content and
additional pages are future work.

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

Build output is static `dist/`; preview uses `http://127.0.0.1:3100`.
Preview is for local verification. Hosting is not configured yet.

## Engineering

- [Architecture and extension paths](docs/architecture.md): ownership, dependency
  contract, rendering, routes, future database/server capabilities and tooling.
- [Current decision](docs/adr/0005-astro-foundation.md): alternatives and tradeoffs.
- [Contributor rules](AGENTS.md): standing standards; procedures in `.agents/skills`.
- [Design memory](DESIGN.md): the restrained initial page and shared visual intent.

```sh
pnpm run check
pnpm run test:coverage
pnpm exec playwright install chromium
pnpm run test:e2e
pnpm run security:audit
```

The browser suite builds and manages an isolated preview on port 3100, which must
be free. CI runs the local gates, browser journeys and registry security auditing.

Public identity and links live in `src/config/site.ts`. Approved contact:
`brunogalvangarcia@outlook.com`. Catalogs live in `src/i18n/messages`; route pairs in
`src/i18n/routes.ts`. Do not copy identities or affiliations from templates.
