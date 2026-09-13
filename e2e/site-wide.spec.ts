import { test, expect } from '@playwright/test';

const contact = 'brunogalvangarcia@outlook.com';
const origin = 'https://brunogalvan.dev';

test('content and locale navigation work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    colorScheme: 'dark',
  });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL('/es/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Ingeniero de software.',
    );
    await expect(page.getByRole('link', { name: contact })).toBeVisible();
    await expect(page.locator('[data-theme-toggle]')).toBeHidden();
    await page.getByRole('link', { name: 'English', exact: true }).click();
    await expect(page).toHaveURL('/en/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Software engineer.',
    );
  } finally {
    await context.close();
  }
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
      await page.emulateMedia({ colorScheme });
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
