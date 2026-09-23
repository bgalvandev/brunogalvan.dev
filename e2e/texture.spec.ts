import { test, expect, type Page } from '@playwright/test';

import { marks } from '@/components/tech-marks';
import { stack } from '@/data/stack';
import { messages } from '@/i18n/messages';

const { motion, positioning } = messages('es');

// Records every class the document root ever carries, from before the first
// script runs, so a preloader that came and went is still visible to a test.
async function recordRootClasses(page: Page) {
  await page.addInitScript(() => {
    const seen = new Set<string>();
    (window as unknown as { __rootClasses: Set<string> }).__rootClasses = seen;
    // The root element may not exist yet, so watch the whole document.
    new MutationObserver(() =>
      document.documentElement?.classList.forEach((name) => seen.add(name)),
    ).observe(document, {
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
  });
  return () =>
    page.evaluate(() => [
      ...(window as unknown as { __rootClasses: Set<string> }).__rootClasses,
    ]);
}

test('the first view of a session opens behind the preloader, which clears, and the next does not', async ({
  page,
}) => {
  const classes = await recordRootClasses(page);
  await page.goto('/es/');
  expect(await classes()).toContain('preloading');
  await expect(page.locator('html')).not.toHaveClass(/preloading/);
  await expect(page.locator('[data-preloader]')).toBeHidden();
  await page.goto('/en/');
  expect(await classes()).not.toContain('preloading');
});

test('no preloader under reduced motion or paused motion', async ({ page }) => {
  const classes = await recordRootClasses(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es/');
  expect(await classes()).not.toContain('preloading');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.setItem('motion', 'paused');
  });
  await page.goto('/es/');
  expect(await classes()).not.toContain('preloading');
});

test('the preloader lifts by itself if the motion script never arrives', async ({
  page,
}) => {
  await page.route('**/_astro/*.js', (route) => route.abort());
  await page.goto('/es/');
  await expect(page.locator('html')).toHaveClass(/preloading/);
  await expect(page.locator('[data-preloader]')).toBeHidden({
    timeout: 4_000,
  });
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('pausing motion stops the marquee and every reveal, and persists', async ({
  page,
}) => {
  await page.goto('/es/');
  const toggle = page.getByRole('button', { name: motion.pause });
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  // The closing room's words move at every width.
  const track = page.locator('.marquee-text .marquee-track').first();
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await expect(page.locator('.reveal-char').first()).toBeAttached();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await expect(page.locator('.reveal-char')).toHaveCount(0);
  await expect(page.locator('.pixel-field canvas')).toHaveCount(0);

  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await expect(page.locator('.reveal-char')).toHaveCount(0);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(track).toHaveCSS('animation-play-state', 'running');
});

test('under reduced motion the pause control is gone and nothing moves', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/es/');
  await expect(page.getByRole('button', { name: motion.pause })).toBeHidden();
  await expect(page.locator('.marquee-text .marquee-track').first()).toHaveCSS(
    'animation-name',
    'none',
  );
  await expect(page.locator('.pixel-field canvas')).toHaveCount(0);
});

test('the pixel field lights the cell under the pointer, keeps it lit while the pointer rests, and lets it fade once it moves on', async ({
  page,
}) => {
  await page.goto('/es/');
  await expect(page.locator('html')).not.toHaveClass(/preloading/);
  const canvas = page.locator('.hero .pixel-field canvas');
  await expect(canvas).toBeAttached();
  // Aim at the centre of a cell, never at an edge between two.
  const cell = await page
    .locator('.hero .pixel-field-lines')
    .evaluate((element) =>
      parseFloat(getComputedStyle(element).getPropertyValue('--cell')),
    );
  const box = (await canvas.boundingBox())!;
  const at = {
    x: box.x + (Math.floor(box.width / cell / 2) + 0.5) * cell,
    y: box.y + (Math.floor(box.height / cell / 2) + 0.5) * cell,
  };
  const alpha = () =>
    canvas.evaluate((element: HTMLCanvasElement, point) => {
      const bounds = element.getBoundingClientRect();
      const ratio = element.width / bounds.width;
      return element
        .getContext('2d')!
        .getImageData(
          Math.round((point.x - bounds.left) * ratio),
          Math.round((point.y - bounds.top) * ratio),
          1,
          1,
        ).data[3];
    }, at);
  await page.mouse.move(at.x - cell, at.y);
  await page.mouse.move(at.x, at.y);
  await expect.poll(alpha).toBe(255);
  // Longer than the hold and the fade together: a resting pointer's cell
  // stays fully lit.
  await page.waitForTimeout(900);
  expect(await alpha()).toBe(255);
  await page.mouse.move(at.x + 3 * cell, at.y);
  await expect.poll(alpha, { timeout: 2_000 }).toBe(0);
});

test('below the desktop breakpoint the pixel field flickers on its own, a fifth of the accent, never over the whole field, under its grid lines', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/es/');
  const canvas = page.locator('.hero .pixel-field canvas');
  await expect(canvas).toBeAttached();
  // The lines are drawn over the glow, so a lit cell keeps its edges.
  const stack = await page.evaluate(() => {
    const box = document
      .querySelector('.hero .pixel-field')!
      .getBoundingClientRect();
    return document
      .elementsFromPoint(box.left + 5, box.top + box.height / 2)
      .map((element) =>
        element.tagName === 'CANVAS'
          ? 'canvas'
          : element.classList.contains('pixel-field-lines')
            ? 'lines'
            : '',
      )
      .filter(Boolean);
  });
  expect(stack).toEqual(['lines', 'canvas']);
  // A whole cycle, read at the centre of every cell: each cell swells and
  // goes dark at once, so part of the field glows and never all of it.
  const { share, brightest } = await canvas.evaluate(
    (element: HTMLCanvasElement) =>
      new Promise<{ share: number[]; brightest: number }>((resolve) => {
        const context = element.getContext('2d')!;
        const ratio = element.width / element.clientWidth;
        const cell = parseFloat(
          getComputedStyle(
            element.parentElement!.querySelector('.pixel-field-lines')!,
          ).getPropertyValue('--cell'),
        );
        const share: number[] = [];
        let brightest = 0;
        const columns = Math.floor(element.clientWidth / cell);
        const rows = Math.floor(element.clientHeight / cell);
        const read = () => {
          const { data } = context.getImageData(
            0,
            0,
            element.width,
            element.height,
          );
          let lit = 0;
          for (let row = 0; row < rows; row += 1) {
            for (let column = 0; column < columns; column += 1) {
              const x = Math.floor((column + 0.5) * cell * ratio);
              const y = Math.floor((row + 0.5) * cell * ratio);
              const alpha = data[(y * element.width + x) * 4 + 3]!;
              brightest = Math.max(brightest, alpha);
              if (alpha > 0) lit += 1;
            }
          }
          share.push(lit / (columns * rows));
          if (share.length < 22) setTimeout(read, 200);
          else resolve({ share, brightest });
        };
        read();
      }),
  );
  expect(Math.max(...share)).toBeGreaterThan(0);
  expect(Math.max(...share)).toBeLessThan(0.6);
  expect(brightest).toBeLessThanOrEqual(Math.ceil(255 * 0.2));
});

test('decoration stays out of the accessibility tree and the positioning line reads whole', async ({
  page,
}) => {
  await page.goto('/es/');
  await expect(page.locator('.marquee').first()).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(page.locator('.hero .pixel-field')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(page.locator('.hero-positioning-text')).toContainText(
    positioning.spoken,
  );
  const snapshot = await page.locator('.hero-positioning').ariaSnapshot();
  expect(snapshot).toContain(positioning.spoken);
  expect(snapshot).not.toContain('→');
});

test.describe('on a high-density screen', () => {
  test.use({ deviceScaleFactor: 2 });
  test('the pixel field canvas covers its field exactly, at device resolution', async ({
    page,
  }) => {
    await page.goto('/es/');
    const field = page.locator('.hero .pixel-field');
    const canvas = field.locator('canvas');
    await expect(canvas).toBeAttached();
    expect(await canvas.boundingBox()).toEqual(await field.boundingBox());
    const [bitmap, css] = await canvas.evaluate(
      (element: HTMLCanvasElement) => [
        element.width,
        element.getBoundingClientRect().width,
      ],
    );
    expect(bitmap).toBe(Math.round(css! * 2));
  });
});

test("the logo row is a carousel of every tool with a mark, in the master's even cells of a closed box", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/es/');
  const row = page.locator('.marquee-logos');
  const tools = Object.values(stack)
    .flat()
    .filter((tool) => marks.has(tool));
  const cells = row.locator('.marquee-group').first().locator('.marquee-item');
  await expect(cells).toHaveCount(tools.length);
  await expect(row.locator('.marquee-track')).toHaveCSS(
    'animation-name',
    'marquee',
  );
  await expect(row).toHaveCSS('border-left-style', 'solid');
  await expect(row).toHaveCSS('mask-image', 'none');
  const widths = await cells.evaluateAll((items) =>
    items.map(
      (item) => Math.round(item.getBoundingClientRect().width * 10) / 10,
    ),
  );
  expect(new Set(widths)).toEqual(new Set([201.6]));
});
