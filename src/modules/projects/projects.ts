import type { Messages } from '@/i18n/messages';

type ProjectId = keyof Messages['projects']['items'];
type ProjectKind = keyof Messages['projects']['kinds'];

interface Project {
  id: ProjectId;
  // The repository name is the project's proper name in every locale.
  name: string;
  kind: ProjectKind;
  // `null` where the source is private or the deployment is no longer reachable;
  // the card then renders plain text instead of a dead link.
  repository: string | null;
  demo: string | null;
  technologies: readonly string[];
}

// Strongest evidence first: an owned product, then public code.
export const projects: readonly Project[] = [
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
    repository: 'https://github.com/bgalvandev/starwars-api',
    // The deployed API Gateway endpoint no longer answers, so no demo link ships.
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
];
