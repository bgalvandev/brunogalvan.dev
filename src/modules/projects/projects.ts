import type { Messages } from '@/i18n/messages';

type ProjectId = keyof Messages['projects']['items'];
type ProjectKind = keyof Messages['projects']['kinds'];
// Only a project with a written case study has a page; the id doubles as its
// slug, and typing it against the catalog keeps a page from losing its prose.
type CaseStudyId = keyof Messages['caseStudies'];

interface Project {
  id: ProjectId;
  // The repository name is the project's proper name in every locale.
  name: string;
  kind: ProjectKind;
  caseStudy: CaseStudyId | null;
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
    caseStudy: null,
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
    caseStudy: 'starwars-api',
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
    caseStudy: 'idbi-invoice',
    repository: 'https://github.com/bgalvandev/idbi-invoice-challenge',
    demo: null,
    technologies: ['PHP', 'Laravel', 'MySQL', 'Docker', 'Nginx', 'JWT'],
  },
  {
    id: 'rimac-frontend',
    name: 'RIMAC Frontend',
    kind: 'challenge',
    caseStudy: 'rimac-frontend',
    repository: 'https://github.com/bgalvandev/rimac-frontend-challenge',
    demo: 'https://rimac-frontend-challeng.netlify.app',
    technologies: ['React', 'TypeScript', 'Sass', 'Vite'],
  },
  {
    id: 'rollpay-auth',
    name: 'Rollpay Auth',
    kind: 'challenge',
    caseStudy: null,
    repository: 'https://github.com/bgalvandev/rollpay-php-challenge',
    demo: null,
    technologies: ['PHP', 'JWT'],
  },
  {
    id: 'placer-sano',
    name: 'Placer Sano',
    kind: 'project',
    caseStudy: null,
    repository: 'https://github.com/bgalvandev/placersano-restaurant',
    demo: 'https://placer-sano.netlify.app',
    technologies: ['Astro', 'CSS', 'Netlify'],
  },
];

// The detail route's source of truth: every project that has prose to show.
export const caseStudies = projects.flatMap((project) =>
  project.caseStudy === null ? [] : [{ project, id: project.caseStudy }],
);
