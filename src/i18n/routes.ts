import { locales, type Locale } from './locales';

// A route is the path segment that follows the locale prefix; the home page has
// none. Localized segments live here so no caller builds or rewrites a URL by
// hand. Add a translated segment when a real page is introduced.
const routes = {
  home: { es: '', en: '' },
  projects: { es: 'proyectos', en: 'projects' },
} as const;
export type RouteKey = keyof typeof routes;

export function routeSegment(route: RouteKey, locale: Locale): string {
  return routes[route][locale];
}

export function pagePath(
  route: RouteKey,
  locale: Locale,
  slug?: string,
): string {
  const parts = [locale, routes[route][locale], slug].filter(
    (part): part is string => Boolean(part),
  );
  return `/${parts.join('/')}/`;
}

export function alternatePages(route: RouteKey, slug?: string) {
  return locales.map((locale) => ({
    locale,
    path: pagePath(route, locale, slug),
  }));
}
