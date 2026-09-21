import { test, expect } from '@playwright/test';

import { site } from '@/config/site';

const sections = {
  es: ['Experiencia', 'Proyectos', 'Stack', 'Sobre mí', 'Contacto'],
  en: ['Experience', 'Projects', 'Stack', 'About', 'Contact'],
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

  // The deployed Star Wars API endpoint is gone, so only the repository ships.
  const retiredDemo = page
    .getByRole('article')
    .filter({ hasText: 'Star Wars API' });
  await expect(retiredDemo.getByRole('link')).toHaveCount(1);
  await expect(retiredDemo.getByRole('link')).toHaveAttribute(
    'href',
    'https://github.com/bgalvandev/starwars-api',
  );
});
