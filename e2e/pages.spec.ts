import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import { site } from '@/config/site';
import { projects } from '@/data/projects';
import { defaultLocale, type Locale } from '@/i18n/locales';
import { messages } from '@/i18n/messages';
import {
  alternatePages,
  pagePath,
  type PageRoute,
  type RouteKey,
} from '@/i18n/routes';
import { excerpts } from '@/modules/case-study/excerpts';

const caseStudies = Object.keys(excerpts);
// Every page, as the route and slug that name it in both languages.
const pages: { route: RouteKey; slug?: string }[] = [
  { route: 'home' },
  { route: 'experience' },
  { route: 'about' },
  ...caseStudies.map((slug) => ({ route: 'caseStudy' as const, slug })),
];
const path = (route: RouteKey, locale: Locale, slug?: string) =>
  slug
    ? pagePath('caseStudy', locale, slug)
    : pagePath(route as PageRoute, locale);

for (const { route, slug } of pages) {
  for (const locale of ['es', 'en'] as const) {
    const url = path(route, locale, slug);
    test(`${url}: reciprocal metadata and a language switch that keeps the page`, async ({
      page,
    }) => {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        'href',
        `${site.url}${url}`,
      );
      for (const alternate of alternatePages(route, slug)) {
        await expect(
          page.locator(`link[rel="alternate"][hreflang="${alternate.locale}"]`),
        ).toHaveAttribute('href', `${site.url}${alternate.path}`);
      }
      await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
        'href',
        `${site.url}${path(route, defaultLocale, slug)}`,
      );
      await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
        'content',
        `${site.url}${url}`,
      );
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      const other = locale === 'es' ? 'en' : 'es';
      await page
        .getByRole('link', {
          name: other === 'es' ? 'Español' : 'English',
          exact: true,
        })
        .click();
      await expect(page).toHaveURL(path(route, other, slug));
    });
  }
}

test('every page passes axe in both themes, with no horizontal overflow', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    for (const { route, slug } of pages.slice(1)) {
      const url = path(route, 'es', slug);
      await page.goto(url);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations, `${url} in ${colorScheme}`).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        url,
      ).toBe(true);
    }
  }
});

test('the navigation marks the current page and a case study leads back, and on to the next when there is one', async ({
  page,
}) => {
  const t = messages('es');
  await page.goto(pagePath('experience', 'es'));
  await expect(
    page
      .getByRole('navigation', { name: t.navigation.main })
      .getByRole('link', {
        name: t.navigation.experience,
      }),
  ).toHaveAttribute('aria-current', 'page');
  const [first, second] = caseStudies;
  await page.goto(pagePath('caseStudy', 'es', first!));
  const project = projects.find((candidate) => candidate.id === first)!;
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
    project.name,
  );
  await expect(
    page.getByRole('link', { name: t.caseStudy.back }),
  ).toHaveAttribute('href', `${pagePath('home', 'es')}#projects`);
  const onward = page
    .getByRole('navigation', { name: t.caseStudy.label })
    .getByRole('link');
  if (!second) {
    await expect(onward).toHaveCount(1);
    return;
  }
  const next = projects.find((candidate) => candidate.id === second)!;
  await page.getByRole('link', { name: next.name, exact: true }).click();
  await expect(page).toHaveURL(pagePath('caseStudy', 'es', second));
});

test('on a phone the pages fold into a menu that works without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 360, height: 800 },
    ...(baseURL === undefined ? {} : { baseURL }),
  });
  try {
    const page = await context.newPage();
    const t = messages('es');
    await page.goto('/es/');
    const menu = page.locator('.site-menu');
    const button = menu.locator('summary');
    await expect(button).toHaveAccessibleName(t.navigation.menu);
    await button.click();
    await expect(
      menu.getByRole('link', { name: t.navigation.contact }),
    ).toBeVisible();
    await expect(
      menu.getByRole('link', { name: 'English', exact: true }),
    ).toBeVisible();
    await menu.getByRole('link', { name: t.navigation.about }).click();
    await expect(page).toHaveURL(pagePath('about', 'es'));
  } finally {
    await context.close();
  }
});

test("on a phone the bar is the name and the master's three lines, and the menu holds the language, the theme and the pause", async ({
  page,
}) => {
  const t = messages('es');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/es/');
  await expect(
    page.getByRole('link', { name: `${site.name} ${t.identity.location}` }),
  ).toBeVisible();
  const tools = page.locator('.site-tools');
  await expect(tools).toBeHidden();
  const menu = page.locator('.site-menu');
  await menu.locator('summary').click();
  const theme = menu.getByRole('button', { name: t.theme.darkMode });
  const pressed = await theme.getAttribute('aria-pressed');
  await theme.click();
  await expect(theme).not.toHaveAttribute('aria-pressed', pressed!);
  // The bar's own button, hidden here, keeps the same state.
  await expect(tools.locator('[data-theme-toggle]')).toHaveAttribute(
    'aria-pressed',
    (await theme.getAttribute('aria-pressed'))!,
  );
  await menu.getByRole('button', { name: t.motion.pause }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await expect(menu.getByRole('link', { name: 'English' })).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('the sitemap lists every page in both languages', async ({ request }) => {
  const xml = await (await request.get('/sitemap-0.xml')).text();
  for (const { route, slug } of pages) {
    for (const locale of ['es', 'en'] as const) {
      expect(xml).toContain(
        `<loc>${site.url}${path(route, locale, slug)}</loc>`,
      );
    }
  }
});
