export const locales = ['es', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'es';
// Native language names read the same in every locale, so they are locale
// metadata rather than translated messages.
export const localeNames = {
  es: 'Español',
  en: 'English',
} as const satisfies Record<Locale, string>;
