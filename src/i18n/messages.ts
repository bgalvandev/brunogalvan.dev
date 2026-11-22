import es from './messages/es.json' with { type: 'json' };
import en from './messages/en.json' with { type: 'json' };
import type { Locale } from './locales';

const catalogs = { es, en } satisfies Record<Locale, typeof es>;
export function messages(locale: Locale) {
  return catalogs[locale];
}
