export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';
// Native language names read the same in every locale, so they are locale
// metadata rather than translated messages.
export const localeNames = {
  es: 'Español',
  en: 'English',
} as const satisfies Record<Locale, string>;
// Open Graph locales use language_TERRITORY; Latin American Spanish matches the
// site's neutral Spanish better than any single country.
export const openGraphLocales = {
  es: 'es_LA',
  en: 'en_US',
} as const satisfies Record<Locale, string>;
