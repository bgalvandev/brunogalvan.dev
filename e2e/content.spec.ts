import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { site } from '@/config/site';

const sections = {
  es: ['Experiencia', 'Proyectos', 'Stack', 'Sobre mí', 'Contacto'],
  en: ['Experience', 'Projects', 'Stack', 'About', 'Contact'],
} as const;

const caseStudy = {
  es: '/es/proyectos/starwars-api/',
  en: '/en/projects/starwars-api/',
} as const;

for (const locale of ['es', 'en'] as const) {
  test(`${locale}: the home page reads as one ordered document`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 2 })).toHaveText([
      ...sections[locale],
    ]);
  });

  test(`${locale}: profile links reach the approved destinations`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`);
    await expect(page.getByRole('link', { name: site.email })).toHaveAttribute(
      'href',
      `mailto:${site.email}`,
    );
    await expect(page.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      site.github,
    );
    await expect(page.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      site.linkedin,
    );
  });

  test(`${locale}: a case study carries its own reciprocal metadata`, async ({
    page,
  }) => {
    const response = await page.goto(caseStudy[locale]);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Star Wars API',
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${site.url}${caseStudy[locale]}`,
    );
    for (const alternate of ['es', 'en'] as const) {
      await expect(
        page.locator(`link[hreflang="${alternate}"]`),
      ).toHaveAttribute('href', `${site.url}${caseStudy[alternate]}`);
    }
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      'href',
      `${site.url}${caseStudy.es}`,
    );
  });
}

test('the experience figure is resolved at build time, not left as a token', async ({
  page,
}) => {
  await page.goto('/es/');
  const intro = page.getByRole('main').locator('.hero-intro');
  await expect(intro).not.toContainText('{years}');
  await expect(intro).toContainText(/^\d+ años/);
});

// AGENTS.md rule 2: an unavailable destination stays non-interactive rather than
// shipping a link a visitor cannot follow.
test('a project without a reachable destination renders no link', async ({
  page,
}) => {
  await page.goto('/es/');
  const privateProject = page
    .getByRole('article')
    .filter({ hasText: 'VitalPro' });
  await expect(privateProject).toHaveCount(1);
  await expect(privateProject).toContainText('Repositorio privado');
  await expect(privateProject.getByRole('link')).toHaveCount(0);

  // The deployed Star Wars API endpoint is gone, so no demo link ships for it.
  const retiredDemo = page
    .getByRole('article')
    .filter({ hasText: 'Star Wars API' });
  await expect(retiredDemo.getByRole('link', { name: /^Demo/ })).toHaveCount(0);
  await expect(
    retiredDemo.getByRole('link', { name: 'Repositorio — Star Wars API' }),
  ).toHaveAttribute('href', 'https://github.com/bgalvandev/starwars-api');
});

test('a case study is reachable from its card and back again', async ({
  page,
}) => {
  await page.goto('/es/');
  await page
    .getByRole('link', { name: 'Caso de estudio — RIMAC Frontend' })
    .click();
  await expect(page).toHaveURL('/es/proyectos/rimac-frontend/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'RIMAC Frontend',
  );
  await page.getByRole('link', { name: 'Todos los proyectos' }).click();
  await expect(page).toHaveURL('/es/#projects');
});

test('switching language on a case study stays on the same project', async ({
  page,
}) => {
  await page.goto('/es/proyectos/idbi-invoice/');
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL('/en/projects/idbi-invoice/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'IDBI Invoice Recorder',
  );
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`a case study page is accessible in ${colorScheme}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await page.goto(caseStudy.es);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}
