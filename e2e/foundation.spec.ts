import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import { site } from '@/config/site';
import { messages } from '@/i18n/messages';

const { name: identity, email: contact, url: origin } = site;

for (const locale of ['es', 'en'] as const) {
  test(`${locale}: direct URL, identity and reciprocal metadata`, async ({
    page,
    context,
    baseURL,
  }) => {
    await context.addCookies([
      { name: 'locale', value: locale === 'es' ? 'en' : 'es', url: baseURL! },
    ]);
    await context.setExtraHTTPHeaders({
      'Accept-Language': locale === 'es' ? 'en-US' : 'es-CO',
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(`/${locale}/`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page).toHaveTitle(new RegExp(identity));
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      messages(locale).hero.spoken,
    );
    await expect(page.getByRole('link', { name: contact })).toHaveAttribute(
      'href',
      `mailto:${contact}`,
    );
    for (const { name, href } of [
      { name: 'GitHub', href: site.github },
      { name: 'LinkedIn', href: site.linkedin },
    ]) {
      await expect(
        page.getByRole('link', { name, exact: true }),
      ).toHaveAttribute('href', href);
    }
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `${origin}/${locale}/`,
    );
    for (const alternate of ['es', 'en']) {
      await expect(
        page.locator(`link[hreflang="${alternate}"]`),
      ).toHaveAttribute('href', `${origin}/${alternate}/`);
    }
    await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
      'href',
      `${origin}/es/`,
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Bruno Galván/,
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      'content',
      `${origin}/${locale}/`,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      'content',
      `${origin}/og/${locale}.png`,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      'content',
      'summary_large_image',
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute(
      'content',
      locale === 'es' ? 'es_LA' : 'en_US',
    );
    const person = JSON.parse(
      (await page
        .locator('script[type="application/ld+json"]')
        .textContent()) ?? '{}',
    );
    expect(person).toMatchObject({
      '@type': 'Person',
      name: identity,
      url: origin,
      jobTitle: messages(locale).identity.role,
      address: { addressLocality: site.locality, addressCountry: site.country },
      sameAs: [site.github, site.linkedin],
    });
    expect(errors).toEqual([]);
  });

  for (const colorScheme of ['light', 'dark'] as const) {
    test(`${locale}: accessible ${colorScheme} page without overflow`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.goto(`/${locale}/`);
      await expect(page.getByRole('button')).toHaveAttribute(
        'aria-pressed',
        String(colorScheme === 'dark'),
      );
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
}

test('root opens default content and language links remain explicit', async ({
  page,
  context,
}) => {
  await context.setExtraHTTPHeaders({ 'Accept-Language': 'en-US' });
  await page.goto('/');
  await expect(page).toHaveURL('/es/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
    messages('es').hero.spoken,
  );
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page).toHaveURL('/en/');
  await page.getByRole('link', { name: 'Español', exact: true }).click();
  await expect(page).toHaveURL('/es/');
});

test('theme persists through locale navigation and reload', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/es/');
  await page.getByRole('button', { name: 'Modo oscuro' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('theme remains usable when browser storage fails', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('Storage unavailable');
      },
    });
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/en/');
  await page.getByRole('button').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('link', { name: contact })).toBeVisible();
});

test('invalid stored theme falls back to OS and follows OS changes', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('theme', 'invalid'));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/en/');
  await expect(page.getByRole('button')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.getByRole('button')).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('keyboard skip link reaches main content', async ({ page }) => {
  await page.goto('/en/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
});

test('unknown routes return an actual non-indexable 404', async ({ page }) => {
  const response = await page.goto('/fr/');
  expect(response?.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, follow',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Home', exact: true }),
  ).toHaveAttribute('href', '/en/');
});

test('section headers read as plain sentences, not punctuation', async ({
  page,
}) => {
  await page.goto('/es/');
  const { whatIDo } = messages('es');
  // The slashes are generated content with an empty alternative.
  await expect(
    page.getByRole('heading', { level: 2, name: whatIDo.headline.join(' ') }),
  ).toBeVisible();
  const section = page.getByRole('region', {
    name: whatIDo.headline.join(' '),
  });
  const total = await page.locator('section .eyebrow').count();
  await expect(section.locator('.eyebrow .sr-only')).toHaveText(
    `Sección 1 de ${total}: ${whatIDo.label}`,
  );
  // The index pieces are separate elements laid out without gaps.
  const index = await section
    .locator('.eyebrow-index')
    .evaluate((element) => element.textContent?.replace(/\s+/g, ''));
  expect(index).toBe(`[n.01/${String(total).padStart(2, '0')}]`);
});

test('every box is a sharp rectangle and every in-page link lands', async ({
  page,
}) => {
  for (const path of ['/es/', '/en/', '/fr/']) {
    await page.goto(path);
    const rounded = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .filter((element) => getComputedStyle(element).borderRadius !== '0px')
        .map((element) => element.tagName + '.' + element.className),
    );
    expect(rounded, path).toEqual([]);
    const missing = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
        .map((link) => link.hash.slice(1))
        .filter((id) => !document.getElementById(id)),
    );
    expect(missing, path).toEqual([]);
  }
});
