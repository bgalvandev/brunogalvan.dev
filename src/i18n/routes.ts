import { locales, type Locale } from './locales';

// Add translated paths here when a real page is introduced.
const routes = { home: { es: '/es/', en: '/en/' } } as const;
export type RouteKey = keyof typeof routes;

export function pagePath(route: RouteKey, locale: Locale): string {
  return routes[route][locale];
}

export function alternatePages(route: RouteKey) {
  return locales.map((locale) => ({ locale, path: pagePath(route, locale) }));
}
