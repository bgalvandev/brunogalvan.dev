// Projects verified against GitHub and the repositories on 2026-09-22.
// `repository` and `demo` are null when nothing public can be followed, and a
// null renders as plain text, never as a link. `featured` is the one pulled out
// large on the home page; `caseStudy` marks the one with a written case study,
// read off its code. Work at an employer is a project of kind `work`, described
// at feature level only. Kinds and one-line summaries live in the catalogs under
// `projects`.
export const projects = [
  {
    id: 'clinicsay',
    name: 'ClinicSay',
    kind: 'work',
    featured: true,
    repository: null,
    demo: null,
    technologies: [
      'React',
      'TypeScript',
      'TanStack Query',
      'Fastify',
      'Prisma',
      'PostgreSQL',
      'OpenAI API',
    ],
  },
  {
    id: 'vitalpro',
    name: 'VitalPro',
    kind: 'product',
    repository: null,
    demo: null,
    technologies: [
      'Next.js',
      'Fastify',
      'Better Auth',
      'Prisma',
      'PostgreSQL',
      'Nx',
      'Fly.io',
    ],
  },
  {
    id: 'brunogalvan-dev',
    caseStudy: true,
    name: 'brunogalvan.dev',
    kind: 'project',
    repository: 'https://github.com/bgalvandev/brunogalvan.dev',
    demo: null,
    technologies: ['Astro', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Playwright'],
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
  kind: 'work' | 'product' | 'project';
  featured?: boolean;
  caseStudy?: boolean;
  repository: string | null;
  demo: string | null;
  technologies: readonly string[];
}[];
