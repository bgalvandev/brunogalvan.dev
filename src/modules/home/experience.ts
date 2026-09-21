import type { Locale } from '@/i18n/locales';
import type { Messages } from '@/i18n/messages';

type ExperienceId = keyof Messages['experience']['items'];

interface Position {
  id: ExperienceId;
  // Proper names of real employers stay literal in every locale.
  company: string;
  // Calendar months as YYYY-MM; `end: null` means the position is current.
  start: string;
  end: string | null;
  technologies: readonly string[];
}

// Newest first: the reading order of the rendered timeline.
export const positions: readonly Position[] = [
  {
    id: 'clinicsay',
    company: 'ClinicSay',
    start: '2024-12',
    end: null,
    technologies: [
      'React',
      'TypeScript',
      'Node.js',
      'Prisma',
      'PostgreSQL',
      'Docker',
      'Tailwind CSS',
      'OpenAI',
      'LangChain',
      'DynamoDB',
      'PHP',
      'MySQL',
    ],
  },
  {
    id: 'metrica-andina',
    company: 'Métrica Andina',
    start: '2023-09',
    end: '2024-03',
    technologies: [
      'Node.js',
      'JavaScript',
      'Angular',
      'MongoDB',
      'SQL',
      'Salesforce',
      'WhatsApp',
    ],
  },
  {
    id: 'surtidores',
    company: 'Surtidores S.A.C.',
    start: '2022-08',
    end: '2023-05',
    technologies: [
      'PHP',
      'Laravel',
      'JavaScript',
      'PostgreSQL',
      'WordPress',
      'WooCommerce',
    ],
  },
  {
    id: 'platanitos',
    company: 'Platanitos',
    start: '2019-07',
    end: '2022-05',
    technologies: [
      'PHP',
      'JavaScript',
      'jQuery',
      'MySQL',
      'Transact-SQL',
      'SAP',
    ],
  },
  {
    id: 'usil',
    company: 'Universidad San Ignacio de Loyola',
    start: '2019-02',
    end: '2019-03',
    technologies: [],
  },
];

function monthStart(month: string): Date {
  const [year, index] = month.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (index ?? 1) - 1, 1));
}

// Derived from the timeline itself so the headline figure can never contradict
// the positions listed below it, and never needs a yearly edit.
export function yearsOfExperience(now: Date = new Date()): number {
  const first = positions.reduce(
    (earliest, position) =>
      position.start < earliest ? position.start : earliest,
    positions[0]?.start ?? '',
  );
  const elapsed = now.getTime() - monthStart(first).getTime();
  return Math.floor(elapsed / (365.2425 * 24 * 60 * 60 * 1000));
}

export function formatPeriod(
  position: Position,
  locale: Locale,
  present: string,
): string {
  const month = new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const from = month.format(monthStart(position.start));
  return `${from} — ${position.end ? month.format(monthStart(position.end)) : present}`;
}
