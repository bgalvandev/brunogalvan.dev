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
        `https://github.com/${snippet.repository}/blob/${snippet.commit}/${snippet.path}${
          'lines' in snippet ? `#L${snippet.lines[0]}-L${snippet.lines[1]}` : ''
        }`,
      );
    }
    await expect(page.locator('.code-window-ts')).toBeVisible();
    await expect(page.locator('.code-window-astro')).toBeHidden();
    // A pointer clicks the label; a keyboard moves through the radio group.
    await page.locator('.code-tab', { hasText: 'Astro' }).click();
    await expect(page.getByRole('radio', { name: /Astro/ })).toBeChecked();
    await expect(page.locator('.code-window-astro')).toBeVisible();
    await expect(page.locator('.code-window-ts')).toBeHidden();
    await page.getByRole('radio', { name: /Astro/ }).focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.getByRole('radio', { name: /Playwright/ })).toBeChecked();
    await expect(page.locator('.code-window-playwright')).toBeVisible();
    await page.keyboard.press('ArrowUp');
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

test('on a wide screen a numbered rail marks the room being read and fills as the page is read', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/es/');
  const rail = page.getByRole('navigation', { name: t.navigation.sections });
  await expect(rail).toBeVisible();
  const links = rail.getByRole('link');
  await expect(links).toHaveCount(7);
  await expect(links.first()).toHaveAccessibleName(`01 ${t.whatIDo.label}`);
  await expect(links.first()).toHaveAttribute('href', '#what-i-do');
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect(
    rail.getByRole('link', { name: `06 ${t.projects.label}` }),
  ).toHaveAttribute('aria-current', 'location');
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await expect(page.locator('.rail-fill')).toHaveCSS(
    'transform',
    'matrix(1, 0, 0, 1, 0, 0)',
  );
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(rail).toBeHidden();
});

test('a value card opens its description and turns to pixels on hover, and a keyboard visitor sees every description', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/es/');
  const cards = page.locator('.value-card');
  const card = cards.first();
  const height = (index: number) =>
    cards
      .nth(index)
      .locator('.value-card-reveal')
      .evaluate((element) => element.getBoundingClientRect().height);
  const opacity = (selector: string) =>
    card
      .locator(selector)
      .evaluate((element) => Number(getComputedStyle(element).opacity));
  await card.scrollIntoViewIfNeeded();
  expect(await height(0)).toBe(0);
  expect(await opacity('.iso-line')).toBe(1);
  expect(await opacity('.iso-pixel')).toBe(0);
  await card.hover();
  await expect.poll(() => height(0)).toBeGreaterThan(0);
  await expect.poll(() => opacity('.iso-pixel')).toBe(1);
  expect(await opacity('.iso-line')).toBe(0);
  // The description is in the card's text whether it is open or not.
  await expect(card).toContainText(t.whatIDo.cards[0]!.text);
  await page.mouse.move(0, 0);
  await expect.poll(() => height(1)).toBe(0);
  await page.keyboard.press('Tab');
  for (const index of [0, 1, 2, 3]) {
    await expect.poll(() => height(index)).toBeGreaterThan(0);
  }
  // Below the desktop breakpoint there is nothing to hover for.
  await page.setViewportSize({ width: 360, height: 800 });
  await page.mouse.click(1, 1);
  await expect.poll(() => height(0)).toBeGreaterThan(0);
  await expect.poll(() => opacity('.iso-pixel')).toBe(1);
});

test('choosing a layer of the stack opens it and shows its diagram, without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1440, height: 900 },
    ...(baseURL === undefined ? {} : { baseURL }),
  });
  try {
    const page = await context.newPage();
    await page.goto('/es/');
    const tabs = page.locator('.cap-tab');
    const opened = (index: number) =>
      tabs
        .nth(index)
        .locator('.cap-tab-bottom')
        .evaluate((element) => element.getBoundingClientRect().height);
    await expect(page.locator('.cap-diagram-interfaces')).toBeVisible();
    await expect(page.locator('.cap-diagram-services')).toBeHidden();
    await tabs.nth(1).click();
    await expect(tabs.nth(1).getByRole('radio')).toBeChecked();
    await expect(page.locator('.cap-diagram-services')).toBeVisible();
    await expect(page.locator('.cap-diagram-interfaces')).toBeHidden();
    await expect.poll(() => opened(1)).toBeGreaterThan(0);
    await expect.poll(() => opened(0)).toBe(0);
  } finally {
    await context.close();
  }
});

test('on a wide screen the scroll checks each file of the code in turn, and a file chosen by hand scrolls to its stretch', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/es/');
  const room = page.locator('#code');
  await expect(room).toHaveAttribute('data-scrubbing', '');
  const checked = () =>
    room
      .locator('input:checked')
      .evaluate((input: HTMLInputElement) => input.value);
  const scrollRoom = (share: number) =>
    room.evaluate((element: HTMLElement, fraction) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(
        0,
        top + (element.offsetHeight - window.innerHeight) * fraction,
      );
    }, share);
  await scrollRoom(0.1);
  await expect.poll(checked).toBe('ts');
  await scrollRoom(0.5);
  await expect.poll(checked).toBe('astro');
  await scrollRoom(0.95);
  await expect.poll(checked).toBe('playwright');
  await expect(room.locator('.code-window-playwright')).toBeVisible();
  const [line, rail] = await room
    .locator('.code-rail-line')
    .evaluate((element) => [
      element.getBoundingClientRect().height,
      element.parentElement!.getBoundingClientRect().height,
    ]);
  expect(line).toBeGreaterThan(rail! * 0.95);
  await room.locator('.code-tab', { hasText: 'TypeScript' }).click();
  await expect.poll(checked).toBe('ts');
  await expect(room.locator('.code-window-ts')).toBeInViewport();
});

test('every technology logo points at a mark the page carries', async ({
  page,
}) => {
  await page.goto('/es/');
  const missing = await page.evaluate(() =>
    [...document.querySelectorAll('use')]
      .map((use) => use.getAttribute('href') ?? '')
      .filter((href) => !document.querySelector(href)),
  );
  expect(missing).toEqual([]);
  expect(await page.locator('.tech-logo-mark use').count()).toBeGreaterThan(20);
});
