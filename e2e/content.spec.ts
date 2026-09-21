import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { site } from '@/config/site';

const sections = {
  es: [
    'Experiencia',
    'Proyectos',
    'El taller',
    'Stack',
    'Método',
    'Sobre mí',
    'Contacto',
  ],
  en: [
    'Experience',
    'Projects',
    'The workshop',
    'Stack',
    'Method',
    'About',
    'Contact',
  ],
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
    // Each section heading carries a decorative index that is hidden from the
    // accessibility tree, so the accessible name is the label alone.
    const headings = page.getByRole('heading', { level: 2 });
    await expect(headings).toHaveCount(sections[locale].length);
    for (const [index, label] of sections[locale].entries()) {
      await expect(headings.nth(index)).toHaveAccessibleName(label);
    }
  });

  test(`${locale}: profile links reach the approved destinations`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/`);
    // The hero repeats the contact affordances, so these are scoped to the
    // contact footer rather than matched across the whole document.
    const footer = page.getByRole('contentinfo');
    await expect(
      footer.getByRole('link', { name: site.email }),
    ).toHaveAttribute('href', `mailto:${site.email}`);
    await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      site.github,
    );
    await expect(
      footer.getByRole('link', { name: 'LinkedIn' }),
    ).toHaveAttribute('href', site.linkedin);
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
  await expect(intro).toContainText(/\d+ años/);
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

// The entrance holds its first keyframe during its delay, so a mistake in the
// animation hides the opening statement permanently. Both paths are asserted:
// reduced motion must skip it entirely, and a normal visit must end visible.
test('the opening statement is visible whether or not motion is allowed', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es/');
  const headline = page.getByRole('heading', { level: 1 });
  await expect(headline).toBeVisible();
  expect(
    await headline.evaluate((node) => getComputedStyle(node).opacity),
  ).toBe('1');
  expect(
    await page
      .locator('.marquee-track')
      .evaluate((node) => getComputedStyle(node).animationName),
  ).toBe('none');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/es/');
  await expect(headline).toBeVisible();
  await expect
    .poll(async () =>
      headline.evaluate((node) => getComputedStyle(node).opacity),
    )
    .toBe('1');
});

test('a client-side navigation keeps the theme and the working toggle', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/es/');
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  // The router swaps the document rather than reloading it, so the pre-paint
  // theme work and the button's handler both have to run again.
  await page
    .getByRole('link', { name: 'Caso de estudio — Star Wars API' })
    .click();
  await expect(page).toHaveURL('/es/proyectos/starwars-api/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveClass(/js/);
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
