import { describe, expect, it } from 'vitest';
import { formatPeriod, positions, yearsOfExperience } from './experience';

function position(id: string) {
  const match = positions.find((item) => item.id === id);
  if (!match) throw new Error(`No position with id ${id}`);
  return match;
}

describe('experience timeline', () => {
  it('counts whole years from the earliest position, never rounding up', () => {
    const earliest = positions.reduce(
      (first, item) => (item.start < first ? item.start : first),
      positions[0]?.start ?? '',
    );
    expect(earliest).toBe('2019-02');
    expect(yearsOfExperience(new Date('2026-02-01T00:00:00Z'))).toBe(7);
    expect(yearsOfExperience(new Date('2026-01-31T00:00:00Z'))).toBe(6);
  });

  it('closes an open position with the caller-supplied present label', () => {
    const period = formatPeriod(position('clinicsay'), 'es', 'Actualidad');
    expect(period).toContain('2024');
    expect(period.endsWith('Actualidad')).toBe(true);
  });

  it('renders both bounds of a finished position', () => {
    const period = formatPeriod(position('platanitos'), 'en', 'Present');
    expect(period).toContain('2019');
    expect(period).toContain('2022');
    expect(period).not.toContain('Present');
  });

  it('reads the month in the requested language', () => {
    const spanish = formatPeriod(position('platanitos'), 'es', 'Actualidad');
    const english = formatPeriod(position('platanitos'), 'en', 'Present');
    expect(spanish).not.toBe(english);
  });
});
