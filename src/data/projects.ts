// Projects verified against GitHub on 2026-09-20. `repository` and `demo` are
// null when nothing public can be followed, and a null renders as plain text,
// never as a link. `featured` is the one pulled out large on the home page.
// Kinds and one-line summaries live in the catalogs under `projects`.
export const projects = [
  {
    id: 'vitalpro',
    name: 'VitalPro',
    kind: 'product',
    repository: null,
    demo: null,
    technologies: [
      'TypeScript',
      'Next.js',
      'Nx',
      'Prisma',
      'PostgreSQL',
      'Docker',
    ],
  },
  {
    id: 'starwars-api',
    name: 'Star Wars API',
    kind: 'project',
    featured: true,
    repository: 'https://github.com/bgalvandev/starwars-api',
    demo: null,
    technologies: [
      'TypeScript',
      'AWS Lambda',
      'DynamoDB',
      'Serverless Framework',
    ],
  },
  {
    id: 'idbi-invoice',
    name: 'IDBI Invoice Recorder',
    kind: 'challenge',
    repository: 'https://github.com/bgalvandev/idbi-invoice-challenge',
    demo: null,
    technologies: ['PHP', 'Laravel', 'MySQL', 'Docker', 'Nginx', 'JWT'],
  },
  {
    id: 'rimac-frontend',
    name: 'RIMAC Frontend',
    kind: 'challenge',
    repository: 'https://github.com/bgalvandev/rimac-frontend-challenge',
    demo: 'https://rimac-frontend-challeng.netlify.app',
    technologies: ['React', 'TypeScript', 'Sass', 'Vite'],
  },
  {
    id: 'rollpay-auth',
    name: 'Rollpay Auth',
    kind: 'challenge',
    repository: 'https://github.com/bgalvandev/rollpay-php-challenge',
    demo: null,
    technologies: ['PHP', 'JWT'],
  },
  {
    id: 'placer-sano',
    name: 'Placer Sano',
    kind: 'project',
    repository: 'https://github.com/bgalvandev/placersano-restaurant',
    demo: 'https://placer-sano.netlify.app',
    technologies: ['Astro', 'CSS', 'Netlify'],
  },
] as const satisfies readonly {
  id: string;
  name: string;
  kind: 'product' | 'project' | 'challenge';
  featured?: boolean;
  repository: string | null;
  demo: string | null;
  technologies: readonly string[];
}[];
