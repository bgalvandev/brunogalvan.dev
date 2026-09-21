import es from './messages/es.json';
import en from './messages/en.json';
import type { Locale } from './locales';

// The Spanish catalog is the shape every locale satisfies, so a missing or
// extra key in English fails the type check before the parity test runs.
export type Messages = typeof es;
const catalogs = { es, en } satisfies Record<Locale, Messages>;
export function messages(locale: Locale): Messages {
  return catalogs[locale];
}
