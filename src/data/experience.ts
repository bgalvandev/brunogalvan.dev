// The professional record, newest first. Periods are year-month; an open end
// is the current role. `clients` are named only where the record names them. Role titles and one-line summaries are visible text,
// so they live in the catalogs under `experience.roles.<id>`. A two-month IT
// support role at USIL (2019-02 → 2019-03) is deliberately left out.
export type Month = `${number}-${number}`;

export const roles = [
  { id: 'clinicsay', company: 'ClinicSay', start: '2024-12', end: null },
  {
    id: 'metrica-andina',
    company: 'Métrica Andina',
    start: '2023-09',
    end: '2024-03',
    clients: ['Instituto SISE', 'Universidad Científica del Sur', 'Educa_d'],
  },
  {
    id: 'surtidores',
    company: 'Surtidores S.A.C.',
    start: '2022-08',
    end: '2023-05',
  },
  { id: 'platanitos', company: 'Platanitos', start: '2019-07', end: '2022-05' },
] as const satisfies readonly {
  id: string;
  company: string;
  start: Month;
  end: Month | null;
  clients?: readonly string[];
}[];
