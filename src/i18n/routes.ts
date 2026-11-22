import { locales, type Locale } from './locales';

// Every localized URL, as pairs. `caseStudy` is a parent: its pages are
// `<parent><slug>/`, and the slug is the same in both languages, so a case
// study translates by swapping the parent, never by rewriting its URL.
const routes = {
  home: { es: '/es/', en: '/en/' },
  experience: { es: '/es/experiencia/', en: '/en/experience/' },
  about: { es: '/es/sobre-mi/', en: '/en/about/' },
  caseStudy: { es: '/es/proyectos/', en: '/en/projects/' },
} as const;
export type RouteKey = keyof typeof routes;
type ParentRoute = 'caseStudy';
export type PageRoute = Exclude<RouteKey, ParentRoute>;

export function pagePath(route: PageRoute, locale: Locale): string;
export function pagePath(
  route: ParentRoute,
  locale: Locale,
  slug: string,
): string;
export function pagePath(route: RouteKey, locale: Locale, slug?: string) {
  return slug ? `${routes[route][locale]}${slug}/` : routes[route][locale];
}

export function alternatePages(route: RouteKey, slug?: string) {
  return locales.map((locale) => ({
    locale,
    path: slug
      ? pagePath(route as ParentRoute, locale, slug)
      : pagePath(route as PageRoute, locale),
  }));
}

// The localized segment a route adds after the locale, for getStaticPaths:
// `experience` in Spanish is `experiencia`.
export function segment(route: Exclude<RouteKey, 'home'>, locale: Locale) {
  return routes[route][locale].split('/')[2] ?? '';
}
