import { test, expect } from '@playwright/test';

import { roles } from '@/data/experience';
import { career, figures } from '@/data/figures';
import { projects } from '@/data/projects';
import { messages } from '@/i18n/messages';
import { pagePath } from '@/i18n/routes';
import { snippets } from '@/modules/home/snippets';

const t = messages('es');

test('every figure on the page is the figure the record gives', async ({
  page,
}) => {
  await page.goto('/es/');
  const counts = figures(new Date());
  await expect(page.locator('.numbers-stat dd')).toHaveText([
    String(counts.yearsSinceFirstRole),
    String(counts.companies),
    String(counts.publicProjects),
    String(counts.technologies),
  ]);
  await expect(page.locator('#projects-title')).toHaveAccessibleName(
    new RegExp(`^${counts.projects} .* ${counts.publicProjects} `),
  );
  const months = career(new Date()).filter((month) => month.role);
  await expect(page.locator('.numbers-bars rect')).toHaveCount(months.length);
  await expect(page.locator('.numbers-chart figcaption')).toContainText(
    String(months.length),
  );
});

test('a project with nothing public to follow is plain text, never a link', async ({
  page,
}) => {
  await page.goto('/es/');
  for (const project of projects) {
    const card = page
      .locator('.project-card')
      .filter({ has: page.getByRole('heading', { name: project.name }) });
    const expected = [
      'caseStudy' in project ? pagePath('caseStudy', 'es', project.id) : null,
      project.repository,
      project.demo,
    ].filter(Boolean);
    await expect(card.getByRole('link')).toHaveCount(expected.length);
    for (const href of expected) {
      await expect(card.locator(`a[href="${href}"]`)).toHaveCount(1);
    }
    if (!project.repository) {
      await expect(card).toContainText(t.projects.private);
    }
  }
});

test('the code shown is the file it cites, verbatim, and the switch works without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    ...(baseURL === undefined ? {} : { baseURL }),
  });
  try {
    const page = await context.newPage();
    await page.goto('/es/');
    for (const snippet of snippets) {
      const window = page.locator(`.code-window-${snippet.id}`);
      expect(
        await window.locator('pre').evaluate((pre) => pre.textContent),
      ).toBe(snippet.code);
      await expect(window.locator('a')).toHaveAttribute(
        'href',
        `https://github.com/${snippet.repository}/blob/${snippet.commit}/${snippet.path}`,
      );
    }
    await expect(page.locator('.code-window-ts')).toBeVisible();
    await expect(page.locator('.code-window-php')).toBeHidden();
    // A pointer clicks the label; a keyboard moves through the radio group.
    await page.locator('.code-tab', { hasText: 'PHP' }).click();
    await expect(page.getByRole('radio', { name: /PHP/ })).toBeChecked();
    await expect(page.locator('.code-window-php')).toBeVisible();
    await expect(page.locator('.code-window-ts')).toBeHidden();
    await page.getByRole('radio', { name: /PHP/ }).focus();
    await page.keyboard.press('ArrowUp');
    await expect(page.getByRole('radio', { name: /TypeScript/ })).toBeChecked();
    await expect(page.locator('.code-window-ts')).toBeVisible();
  } finally {
    await context.close();
  }
});

test('on a wide screen the scroll draws the method step by step', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/es/');
  const method = page.locator('#method');
  await expect(method).toHaveAttribute('data-scrubbing', '');
  const cards = method.locator('.method-card');
  await expect(cards.nth(0)).toHaveClass(/is-active/);
  await expect(cards.nth(3)).not.toHaveClass(/is-active/);
  const bottom = await method.evaluate(
    (element) => element.getBoundingClientRect().bottom + scrollY,
  );
  await page.evaluate((y) => window.scrollTo(0, y - innerHeight), bottom);
  await expect(cards.nth(3)).toHaveClass(/is-active/);
});

test('without motion every step of the method shows complete', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/es/');
  const method = page.locator('#method');
  await expect(method).not.toHaveAttribute('data-scrubbing');
  for (const line of await method.locator('.method-card-line').all()) {
    const [width, track] = await line.evaluate((element) => [
      element.getBoundingClientRect().width,
      element.parentElement!.getBoundingClientRect().width,
    ]);
    expect(width).toBeGreaterThan(track! * 0.8);
  }
});

test('the timeline lists every role with its period', async ({ page }) => {
  await page.goto('/es/');
  const items = page.locator('.experience-item');
  await expect(items).toHaveCount(roles.length);
  for (const [index, role] of roles.entries()) {
    const item = items.nth(index);
    await expect(item.getByRole('heading', { level: 3 })).toHaveText(
      role.company,
    );
    await expect(item.locator('time').first()).toHaveAttribute(
      'datetime',
      role.start,
    );
    await expect(item).toContainText(t.experience.roles[role.id].role);
  }
});
