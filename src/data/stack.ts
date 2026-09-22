// The current stack, grouped by capability: what Bruno's own commits show in
// his 2025–2026 work (ClinicSay, VitalPro and this site), checked against the
// repositories on 2026-09-22. Team-built parts of a product he did not touch
// are left out, and so is anything only older work used; that history stays in
// each role. Group names are visible text, so they live in the catalogs under
// `stack.groups`.
export const stack = {
  frontend: [
    'React',
    'Next.js',
    'TypeScript',
    'TanStack Query',
    'React Hook Form',
    'Tailwind CSS',
    'shadcn/ui',
    'Vite',
    'Astro',
  ],
  backend: [
    'Node.js',
    'Fastify',
    'Zod',
    'OpenAPI',
    'REST',
    'Better Auth',
    'JWT',
  ],
  data: ['PostgreSQL', 'Prisma', 'Redis', 'SQL'],
  ai: ['OpenAI API', 'LLM assistants', 'WhatsApp', 'Claude Code'],
  architecture: [
    'Hexagonal architecture',
    'Domain-Driven Design',
    'Domain events',
    'Contract-first APIs',
    'Modular monolith',
    'Nx monorepo',
    'ADRs',
  ],
  platform: [
    'Docker',
    'GitHub Actions',
    'Fly.io',
    'Cloudflare',
    'Vitest',
    'Playwright',
    'Testing Library',
    'ESLint',
    'Git',
  ],
} as const;
