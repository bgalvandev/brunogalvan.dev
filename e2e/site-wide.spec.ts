import { readFile } from 'node:fs/promises';

import { test, expect } from '@playwright/test';

import { site } from '@/config/site';
import { messages } from '@/i18n/messages';

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
    await expect(page).toHaveURL('/en/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      messages('en').hero.spoken,
    );
    await expect(page.getByRole('link', { name: contact })).toBeVisible();
    await expect(page.locator('[data-theme-toggle]')).toBeHidden();
    await page.getByRole('link', { name: 'Español', exact: true }).click();
    await expect(page).toHaveURL('/es/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      messages('es').hero.spoken,
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
    for (const path of [
      '/es/',
      '/en/',
      '/fr/',
      '/es/experiencia/',
      '/en/about/',
      '/es/proyectos/brunogalvan-dev/',
    ]) {
      const response = await page.goto(path);
      expect(response?.headers()['content-security-policy']).toBe(csp);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      // Motion writes styles at runtime: scroll every reveal into play and
      // hover a scrambling link before reading the violations.
      await page.mouse.wheel(0, 20_000);
      const scrambling = page.locator('[data-scramble-hover]').first();
      if (await scrambling.count()) await scrambling.hover();
      await page.waitForTimeout(500);
      expect(await violations(), `${path} in ${colorScheme}`).toEqual([]);
    }
  }
  // The theme button is the one script that runs after paint.
  await page.goto('/es/');
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
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

test('manual visual review evidence at narrow, tablet and desktop widths', async ({
  page,
}, testInfo) => {
  for (const width of [360, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const colorScheme of ['light', 'dark'] as const) {
      // A capture taken during an entrance shows a frame, not the page.
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      for (const locale of ['es', 'en']) {
        await page.goto(`/${locale}/`);
        await page.evaluate(() => document.fonts.ready);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page.screenshot({
          path: testInfo.outputPath(`${locale}-${width}-${colorScheme}.png`),
          fullPage: true,
        });
      }
    }
  }
});
