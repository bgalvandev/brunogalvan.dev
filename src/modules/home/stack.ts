// The public stack, grouped by capability. It stays inside what the CV and
// LinkedIn already state; nothing here comes from a private repository. Group
// names are visible text, so they live in the catalogs under `stack.groups`.
export const stack = {
  frontend: [
    'React',
    'TypeScript',
    'JavaScript',
    'Astro',
    'Angular',
    'Tailwind CSS',
    'Sass',
    'Vite',
  ],
  backend: ['Node.js', 'PHP', 'Laravel', 'Fastify', 'REST', 'JWT', 'Zod'],
  data: [
    'PostgreSQL',
    'MySQL',
    'MongoDB',
    'DynamoDB',
    'Redis',
    'Prisma',
    'SQL',
  ],
  ai: ['OpenAI', 'LangChain', 'Kommo CRM', 'Salesbot'],
  architecture: ['Clean Architecture', 'Domain-Driven Design', 'MVC', 'SOLID'],
  platform: [
    'Docker',
    'Git',
    'AWS Lambda',
    'Nginx',
    'Playwright',
    'Vitest',
    'ESLint',
  ],
} as const;
