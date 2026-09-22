import { describe, expect, it } from 'vitest';

import { career, figures } from './figures';

const today = new Date(Date.UTC(2026, 8, 22));

describe('figures read off the record', () => {
  it('counts years from the earliest role, companies, projects and tools', () => {
    expect(figures(today)).toEqual({
      yearsSinceFirstRole: 7,
      firstYear: 2019,
      companies: 4,
      projects: 6,
      publicProjects: 5,
      technologies: 37,
    });
  });
  it('rounds years down until a full year has passed', () => {
    expect(figures(new Date(Date.UTC(2026, 5, 30))).yearsSinceFirstRole).toBe(
      6,
    );
    expect(figures(new Date(Date.UTC(2026, 6, 1))).yearsSinceFirstRole).toBe(7);
  });
});

describe('the career by month', () => {
  const months = career(today);
  it('runs from the first role to the current month', () => {
    expect(months[0]).toMatchObject({
      year: 2019,
      month: 6,
      role: 'platanitos',
      tenure: 1,
    });
    expect(months.at(-1)).toMatchObject({
      year: 2026,
      month: 8,
      role: 'clinicsay',
    });
    expect(months).toHaveLength(87);
  });
  it('leaves the months between roles empty and restarts tenure per role', () => {
    const gap = months.find(
      (month) => month.year === 2022 && month.month === 6,
    );
    expect(gap).toMatchObject({ role: null, tenure: 0 });
    const first = months.find((month) => month.role === 'surtidores');
    expect(first).toMatchObject({ year: 2022, month: 7, tenure: 1 });
  });
});
