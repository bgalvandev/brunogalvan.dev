import type { Messages } from '@/i18n/messages';

type StackGroupId = keyof Messages['stack']['groups'];

interface StackGroup {
  id: StackGroupId;
  // Product and standard names read the same in both locales, so only the group
  // heading is translated.
  items: readonly string[];
}

export const stack: readonly StackGroup[] = [
  {
    id: 'frontend',
    items: [
      'React',
      'TypeScript',
      'JavaScript',
      'Astro',
      'Angular',
      'Tailwind CSS',
      'Sass',
      'Vite',
    ],
  },
  {
    id: 'backend',
    items: ['Node.js', 'PHP', 'Laravel', 'Fastify', 'REST', 'JWT', 'Zod'],
  },
  {
    id: 'data',
    items: [
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'DynamoDB',
      'Redis',
      'Prisma',
      'SQL',
    ],
  },
  {
    id: 'ai',
    items: ['OpenAI', 'LangChain', 'Kommo CRM', 'Salesbot'],
  },
  {
    id: 'architecture',
    items: ['Clean Architecture', 'Domain-Driven Design', 'MVC', 'SOLID'],
  },
  {
    id: 'platform',
    items: [
      'Docker',
      'Git',
      'AWS Lambda',
      'Nginx',
      'Playwright',
      'Vitest',
      'ESLint',
    ],
  },
];
