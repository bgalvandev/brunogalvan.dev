import { readFile } from 'node:fs/promises';

import { test, expect } from '@playwright/test';

import { site } from '@/config/site';

const { email: contact, url: origin } = site;

test('content and locale navigation work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    colorScheme: 'dark',
    ...(baseURL === undefined ? {} : { baseURL }),
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL('/es/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Construyo plataformas, APIs e integraciones que un negocio usa todos los días.',
    );
    await expect(
      page.getByRole('contentinfo').getByRole('link', { name: contact }),
    ).toBeVisible();
    await expect(page.locator('[data-theme-toggle]')).toBeHidden();
    await page.getByRole('link', { name: 'English', exact: true }).click();
    await expect(page).toHaveURL('/en/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'I build the platforms, APIs and integrations a business uses every day.',
    );
  } finally {
    await context.close();
  }
});

// Cloudflare Pages serves dist/_headers; astro preview does not. Replaying the
// built `/*` headers on every response, exactly as the host will, turns the
// policy from a listed file into an exercised one: a future inline style
// attribute, data: font or third-party script fails here, not in production.
test('the built Content Security Policy allows everything the pages do', async ({
  page,
}) => {
  const built = await readFile(
    new URL('../dist/_headers', import.meta.url),
    'utf8',
  );
  const csp = /^\s*Content-Security-Policy:\s*(.+)$/m.exec(built)?.[1];
  if (!csp) {
    throw new Error('dist/_headers declares no Content-Security-Policy');
  }
  await page.route('**/*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      headers: { ...response.headers(), 'content-security-policy': csp },
    });
  });
  type CspWindow = Window & { __cspViolations: string[] };
  await page.addInitScript(() => {
    const record = window as unknown as CspWindow;
    record.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      record.__cspViolations.push(
        `${event.violatedDirective} blocked ${event.blockedURI || 'inline'}`,
      );
    });
  });
  const violations = () =>
    page.evaluate(() => (window as unknown as CspWindow).__cspViolations);

  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme });
    for (const path of ['/es/', '/en/', '/fr/']) {
      const response = await page.goto(path);
      expect(response?.headers()['content-security-policy']).toBe(csp);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await violations(), `${path} in ${colorScheme}`).toEqual([]);
    }
  }
  // The theme button is the one script that runs after paint.
  await page.goto('/es/');
  await page.getByRole('button').click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-theme',
    /light|dark/,
  );
  expect(await violations()).toEqual([]);
});

test('robots and sitemap expose canonical production URLs', async ({
  request,
}) => {
  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain(`Sitemap: ${origin}/sitemap-index.xml`);
  const index = await request.get('/sitemap-index.xml');
  expect(index.status()).toBe(200);
  expect(await index.text()).toContain(`${origin}/sitemap-0.xml`);
  const sitemap = await request.get('/sitemap-0.xml');
  const xml = await sitemap.text();
  expect(xml).toContain(`${origin}/es/`);
  expect(xml).toContain(`${origin}/en/`);
  expect(xml).not.toContain('/404');
  expect(xml).not.toContain(`<loc>${origin}/</loc>`);
});

// One capture per rendered composition: the home page and a case study, which
// lay out differently, at every width and theme a reviewer is asked to inspect.
const compositions = {
  home: { es: '/es/', en: '/en/' },
  case: { es: '/es/proyectos/starwars-api/', en: '/en/projects/starwars-api/' },
} as const;

test('manual visual review evidence at narrow, tablet and desktop widths', async ({
  page,
}, testInfo) => {
  // Reduced motion pins the scroll-driven entrance at its resting state, so a
  // full-page capture shows the composition rather than a frame of animation.
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const colorScheme of ['light', 'dark'] as const) {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      for (const [name, paths] of Object.entries(compositions)) {
        for (const locale of ['es', 'en'] as const) {
          await page.goto(paths[locale]);
          await page.evaluate(() => document.fonts.ready);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
            `${paths[locale]} at ${width}px`,
          ).toBe(true);
          await page.screenshot({
            path: testInfo.outputPath(
              `${name}-${locale}-${width}-${colorScheme}.png`,
            ),
            fullPage: true,
          });
        }
      }
    }
  }
});
