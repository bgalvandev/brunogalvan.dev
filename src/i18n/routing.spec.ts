import { describe, expect, it } from 'vitest';
import { locales } from './locales';
import { alternatePages, pagePath } from './routes';
import { messages } from './messages';

function leafPaths(value: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(value)
    .flatMap(([key, item]) => {
      const fullKey = `${prefix}${key}`;
      if (typeof item === 'string') {
        expect(item.trim(), `Empty translation: ${fullKey}`).not.toBe('');
        return [fullKey];
      }
      return leafPaths(item as Record<string, unknown>, `${fullKey}.`);
    })
    .sort();
}

describe('localized content and route contract', () => {
  it('keeps all message keys populated and synchronized', () => {
    expect(leafPaths(messages('en'))).toEqual(leafPaths(messages('es')));
  });
  it('provides distinct, reciprocal, prefixed home paths', () => {
    const alternatives = alternatePages('home');
    expect(alternatives.map(({ locale }) => locale)).toEqual([...locales]);
    expect(new Set(alternatives.map(({ path }) => path)).size).toBe(
      locales.length,
    );
    for (const { locale, path } of alternatives) {
      expect(path).toBe(`/${locale}/`);
      expect(pagePath('home', locale)).toBe(path);
    }
  });
});
