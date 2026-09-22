import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import { messages } from '@/i18n/messages';

const { whatIDo, hero } = messages('es');
const phrase = whatIDo.headline.join(' ');
const visualText = (element: Element) =>
  element.textContent?.replace(/\s+/g, ' ').trim();

test('a heading reveals character by character and reads whole throughout', async ({
  page,
}) => {
  await page.goto('/es/');
  const heading = page.getByRole('heading', { level: 2, name: phrase });
  const visual = heading.locator('[data-reveal]');
  // Split and waiting below the fold: the characters exist but are closed.
  await expect(visual.locator('.reveal-char').first()).toBeAttached();
  await expect(visual.locator('.reveal-char').first()).toHaveCSS(
    'opacity',
    '0',
  );
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveAccessibleName(phrase);
  // Finished: the split is reverted and the visual text is the phrase again.
  await expect(visual.locator('.reveal-char')).toHaveCount(0);
  expect(await visual.evaluate(visualText)).toBe(phrase);
  await expect(heading).toHaveAccessibleName(phrase);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

test('the hero opens, then types its fragment once, and keeps its name', async ({
  page,
}) => {
  await page.goto('/es/');
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toHaveAccessibleName(hero.spoken);
  const fragment = page.locator('[data-typewriter]');
  await expect(fragment).toHaveText('');
  await expect(fragment).toHaveText(hero.fragment);
  await expect(heading.locator('.reveal-char')).toHaveCount(0);
  // The lines are blocks, so compare the glyphs, not the spacing.
  const glyphs = (text: string | undefined) => text?.replace(/\s+/g, '');
  expect(glyphs(await heading.evaluate(visualText))).toBe(
    glyphs(`${hero.greeting}[${hero.fragment}]${hero.closing}`),
  );
  await expect(heading).toHaveAccessibleName(hero.spoken);
});

test('switching motion off mid-visit puts every piece of text back', async ({
  page,
}) => {
  await page.goto('/es/');
  await expect(page.locator('.reveal-char').first()).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.reveal-char')).toHaveCount(0);
  await expect(page.locator('[data-typewriter]')).toHaveText(hero.fragment);
  expect(
    await page.locator('#what-i-do-title [data-reveal]').evaluate(visualText),
  ).toBe(phrase);
});

test('a heading already scrolled past when the page loads is shown', async ({
  page,
}) => {
  await page.goto('/es/#contact');
  await expect(
    page.getByRole('heading', { level: 2, name: phrase }),
  ).not.toBeInViewport();
  const visual = page.locator('#what-i-do-title [data-reveal]');
  await expect(visual.locator('.reveal-char')).toHaveCount(0);
  expect(await visual.evaluate(visualText)).toBe(phrase);
});

test('hovering a link scrambles its label and settles back without renaming it', async ({
  page,
}) => {
  await page.goto('/es/');
  const link = page.locator('.value-heading .button');
  await expect(link).toHaveAccessibleName(whatIDo.action);
  await link.hover();
  await expect(link).toHaveAccessibleName(whatIDo.action);
  await expect(link.locator('[data-scramble-text]')).not.toHaveText(
    whatIDo.action,
  );
  await expect(link.locator('[data-scramble-text]')).toHaveText(whatIDo.action);
  await expect(link).toHaveAccessibleName(whatIDo.action);
});

test('with reduced motion nothing is split, typed, scrambled or eased', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es/');
  await expect(page.locator('.reveal-char')).toHaveCount(0);
  await expect(page.locator('[data-typewriter]')).toHaveText(hero.fragment);
  const link = page.locator('.value-heading .button');
  await link.hover();
  await expect(link.locator('[data-scramble-text]')).toHaveText(whatIDo.action);
  await expect(link.locator('.button-bg')).toHaveCSS(
    'transition-duration',
    '0s',
  );
  expect(
    await page
      .locator('[data-typewriter]')
      .evaluate(
        (element) => getComputedStyle(element, '::after').animationName,
      ),
  ).toBe('none');
});

test('a heading never scrolled into view still prints whole', async ({
  page,
}) => {
  await page.goto('/es/');
  const char = page.locator('#what-i-do-title .reveal-char').first();
  await expect(char).toHaveCSS('opacity', '0');
  await page.emulateMedia({ media: 'print' });
  await expect(char).toHaveCSS('opacity', '1');
});

test('a revealing heading holds its height, so nothing below it moves', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  const layout = () =>
    page.evaluate(() => ({
      heading:
        document.querySelector<HTMLElement>('#what-i-do-title')!.offsetHeight,
      cards:
        document.querySelector('.value-cards')!.getBoundingClientRect().top +
        scrollY,
    }));
  // The static page is the reference layout.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es/');
  const still = await layout();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.reload();
  await expect(page.locator('#what-i-do-title .reveal-char').first()).toHaveCSS(
    'opacity',
    '0',
  );
  expect(await layout()).toEqual(still);
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(page.locator('#what-i-do-title .reveal-char').first()).toHaveCSS(
    'opacity',
    '1',
  );
  expect(await layout()).toEqual(still);
});
