import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

import { messages } from '@/i18n/messages';

const { whatIDo, hero } = messages('es');
const phrase = whatIDo.headline.join(' ');
// What the eye reads: the words a typed line holds unseen, only to keep its
// height, are left out.
const visualText = (element: Element) => {
  const copy = element.cloneNode(true) as Element;
  copy
    .querySelectorAll('[data-typewriter-ghost]')
    .forEach((ghost) => ghost.remove());
  return copy.textContent?.replace(/\s+/g, ' ').trim();
};

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

test('the hero opens, types its first word, moves on to the next, and keeps its name', async ({
  page,
}) => {
  await page.goto('/es/');
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toHaveAccessibleName(hero.spoken);
  const fragment = page.locator('.hero [data-typewriter]');
  await expect(fragment).toHaveText('');
  await expect(fragment).toHaveText(hero.fragments[0]!);
  await expect(heading.locator('.reveal-char')).toHaveCount(0);
  // The lines are blocks, so compare the glyphs, not the spacing.
  const glyphs = (text: string | undefined) => text?.replace(/\s+/g, '');
  expect(glyphs(await heading.evaluate(visualText))).toBe(
    glyphs(`${hero.greeting}[${hero.fragments[0]}]${hero.closing}`),
  );
  await expect(fragment).toHaveText(hero.fragments[1]!, { timeout: 8000 });
  await expect(heading).toHaveAccessibleName(hero.spoken);
});

test('switching motion off mid-visit puts every piece of text back', async ({
  page,
}) => {
  await page.goto('/es/');
  await expect(page.locator('.reveal-char').first()).toBeAttached();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.reveal-char')).toHaveCount(0);
  await expect(page.locator('.hero [data-typewriter]')).toHaveText(
    hero.fragments[0]!,
  );
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
  await expect(page.locator('.hero [data-typewriter]')).toHaveText(
    hero.fragments[0]!,
  );
  const link = page.locator('.value-heading .button');
  await link.hover();
  await expect(link.locator('[data-scramble-text]')).toHaveText(whatIDo.action);
  await expect(link.locator('.button-bg')).toHaveCSS(
    'transition-duration',
    '0s',
  );
  expect(
    await page
      .locator('.hero [data-typewriter]')
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
        document.querySelector('.value-slider')!.getBoundingClientRect().top +
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
  await page.locator('#what-i-do-title').scrollIntoViewIfNeeded();
  await expect(page.locator('#what-i-do-title .reveal-char').first()).toHaveCSS(
    'opacity',
    '1',
  );
  expect(await layout()).toEqual(still);
});

test('the closing word cycles between tight brackets while its bands run in opposite directions', async ({
  page,
}) => {
  const { contact } = messages('es');
  await page.goto('/es/#contact');
  const word = page.locator('#contact [data-typewriter]');
  await expect(word).toHaveText(contact.fragments[1]!, { timeout: 10_000 });
  const line = page.locator('#contact .pixel-highlight');
  expect(await line.evaluate(visualText)).toBe(`[${contact.fragments[1]}]`);
  const directions = await page
    .locator('#contact .marquee-track')
    .evaluateAll((tracks) =>
      tracks.map((track) => getComputedStyle(track).animationDirection),
    );
  expect(directions).toEqual(['normal', 'reverse']);
});

test('hovers follow the master: the bullet turns, the line button closes a frame, the contact tab takes the accent', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/es/');
  const accent = await page.evaluate(() => {
    const probe = document.createElement('span');
    probe.style.color = 'var(--accent)';
    document.body.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  });
  const solid = page.locator('.hero .button').first();
  await solid.hover();
  await expect(solid.locator('.button-dot')).toHaveCSS(
    'transform',
    /^matrix\(-1, /,
  );
  const line = page.locator('.hero .button-line').first();
  await line.hover();
  await expect(line.locator('.button-line-frame')).toHaveCSS('opacity', '1');
  const contact = page.locator('.site-tools .site-contact');
  await contact.hover();
  await expect(contact).toHaveCSS('color', accent);
});

test('without motion the stack diagrams stand still in their finished state', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es/');
  const names = await page
    .locator('.dia *')
    .evaluateAll((elements) =>
      elements.map((element) => getComputedStyle(element).animationName),
    );
  expect(new Set(names)).toEqual(new Set(['none']));
  await expect(page.locator('.cap-chip-row').first()).toHaveCSS(
    'animation-name',
    'none',
  );
  // Finished: the rendered box has taken the accent, the last layer of the
  // request is the one crossed, and every document has arrived.
  const accent = await page
    .locator('.cap-tag')
    .first()
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(page.locator('.dia-out')).toHaveCSS('border-top-color', accent);
  await expect(page.locator('.dia-row').last()).toHaveCSS('color', accent);
  for (const document of await page.locator('.dia-doc').all()) {
    await expect(document).toHaveCSS('opacity', '1');
  }
});

test("the closing word is already cycling when the visitor scrolls to it, as the master's is", async ({
  page,
}) => {
  await page.goto('/es/');
  // The visitor reads the top of the page for a while first.
  await page.waitForTimeout(4000);
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await expect(page.locator('#contact [data-typewriter]')).toHaveText(/\S/, {
    timeout: 500,
  });
});

test('revealed text is as wide whole as split into letters, so the end of the reveal moves nothing', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/');
  const [whole, split] = await page
    .locator('.hero-line')
    .first()
    .evaluate((line) => {
      const width = (node: Element) => {
        const range = document.createRange();
        range.selectNodeContents(node);
        return range.getBoundingClientRect().width;
      };
      // The line as the reveal lays it out: a box per letter, spaces between.
      const letters = line.cloneNode() as HTMLElement;
      for (const letter of line.textContent ?? '') {
        if (letter === ' ') {
          letters.append(' ');
          continue;
        }
        const box = document.createElement('span');
        box.className = 'reveal-char';
        box.textContent = letter;
        letters.append(box);
      }
      line.after(letters);
      const widths = [width(line), width(letters)];
      letters.remove();
      return widths;
    });
  expect(Math.abs(whole! - split!)).toBeLessThan(0.5);
});

test('on a phone the line a word types into takes its height first, so nothing below moves while it types', async ({
  page,
}) => {
  const { hero } = messages('en');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/');
  await expect(page.locator('.hero [data-typewriter]')).toHaveText(
    hero.fragments[0]!,
    { timeout: 10_000 },
  );
  // The whole of the next word, from its first letter to its last.
  const tops = await page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const heading = document.querySelector('#hero-title')!;
        const summary = document.querySelector('.hero-summary')!;
        let tops: number[] | undefined;
        new MutationObserver(() => {
          const word = heading.querySelector<HTMLElement>('[data-typewriter]');
          if (!word) return;
          if (!tops && word.dataset.cursor === 'typing') {
            if (word.textContent!.length === 1) tops = [];
            else return;
          }
          if (!tops) return;
          tops.push(summary.getBoundingClientRect().top);
          if (word.dataset.cursor === 'on') resolve(tops);
        }).observe(heading, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
        });
      }),
  );
  expect(tops.length).toBeGreaterThan(3);
  expect(new Set(tops).size).toBe(1);
});

test('on a phone the cursor and the closing bracket stay on the line of the last letter', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en/');
  const { letter, bracket } = await page
    .locator('.hero-fragment')
    .evaluate((fragment) => {
      const top = (node: Node) => {
        const range = document.createRange();
        const end = node.textContent!.length;
        range.setStart(node, end - 1);
        range.setEnd(node, end);
        return range.getBoundingClientRect().top;
      };
      const typed = fragment.querySelector('[data-typewriter]')!;
      return {
        letter: top(typed.firstChild!),
        bracket: top(typed.parentElement!.lastChild!),
      };
    });
  expect(Math.abs(bracket - letter)).toBeLessThan(1);
});
