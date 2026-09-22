import { test, expect } from '@playwright/test';

import { site } from '@/config/site';
import { projects } from '@/data/projects';
import { messages } from '@/i18n/messages';
import { excerpts } from '@/modules/case-study/excerpts';

const pages = [
  '/es/',
  '/en/',
  '/es/experiencia/',
  '/en/about/',
  ...Object.keys(excerpts).flatMap((id) => [
    `/es/proyectos/${id}/`,
    `/en/projects/${id}/`,
  ]),
];

test('internal links are prerendered and pages cross-fade under a still header', async ({
  page,
}) => {
  await page.goto('/es/');
  const rules = JSON.parse(
    (await page.locator('script[type="speculationrules"]').textContent()) ??
      '{}',
  );
  expect(rules).toEqual({
    prerender: [{ where: { href_matches: '/*' }, eagerness: 'moderate' }],
  });
  await expect(page.locator('.site-header')).toHaveCSS(
    'view-transition-name',
    'site-header',
  );
});

test('the wheel is smoothed only while motion runs', async ({ page }) => {
  await page.goto('/es/');
  await expect(page.locator('html')).toHaveClass(/\blenis\b/);
  await page.mouse.move(600, 500);
  await page.mouse.wheel(0, 800);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(400);
  await page.getByRole('button', { name: messages('es').motion.pause }).click();
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);
});

test('every page names a social card that exists', async ({
  page,
  request,
}) => {
  for (const path of pages) {
    await page.goto(path);
    const image = await page
      .locator('meta[property="og:image"]')
      .getAttribute('content');
    expect(image, path).toMatch(new RegExp(`^${site.url}/og/`));
    const response = await request.get(new URL(image!).pathname);
    expect(response.status(), image!).toBe(200);
    expect(response.headers()['content-type'], image!).toContain('image/png');
  }
});

test('printed, the site is a light CV with its outside links spelled out', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/es/');
  // The chosen theme too, not only the system one.
  await page.evaluate(() => (document.documentElement.dataset.theme = 'dark'));
  await page.emulateMedia({ media: 'print', colorScheme: 'dark' });
  await expect(page.locator('.site-header')).toBeHidden();
  await expect(page.locator('.marquee').first()).toBeHidden();
  for (const room of ['body', '#stack', '.hero-band']) {
    await expect(page.locator(room).first()).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
    );
  }
  const github = page
    .locator('.site-footer a[href^="https://github.com"]')
    .first();
  expect(
    await github.evaluate((link) => getComputedStyle(link, '::after').content),
  ).toContain(site.github);
});

test('a case study describes itself as source code and says where it sits', async ({
  page,
}) => {
  const [id] = Object.keys(excerpts);
  const project = projects.find((candidate) => candidate.id === id)!;
  await page.goto(`/es/proyectos/${id}/`);
  const entities = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) =>
      scripts.map((script) => JSON.parse(script.textContent ?? '{}')),
    );
  expect(entities).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ '@type': 'Person', name: site.name }),
      expect.objectContaining({
        '@type': 'SoftwareSourceCode',
        name: project.name,
        codeRepository: project.repository,
      }),
      expect.objectContaining({
        '@type': 'BreadcrumbList',
        itemListElement: expect.arrayContaining([
          expect.objectContaining({ position: 3, name: project.name }),
        ]),
      }),
    ]),
  );
});
