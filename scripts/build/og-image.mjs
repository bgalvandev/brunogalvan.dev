import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium } from '@playwright/test';

// Renders the social card for each locale and the touch icon from the same
// tokens the site uses, then writes them to public/. Run by hand
// (`pnpm run og:generate`) when the name, headline, colors or favicon change;
// the PNGs are committed so the build stays free of a browser dependency.
const require = createRequire(import.meta.url);
const root = path.resolve(import.meta.dirname, '../..');
const font = (pkg, file) =>
  pathToFileURL(
    path.join(
      path.dirname(require.resolve(`${pkg}/package.json`)),
      'files',
      file,
    ),
  ).href;
const archivo = font(
  '@fontsource-variable/archivo',
  'archivo-latin-wght-normal.woff2',
);
const mono = font(
  '@fontsource-variable/jetbrains-mono',
  'jetbrains-mono-latin-wght-normal.woff2',
);

const { site } = await import(
  pathToFileURL(path.join(root, 'src/config/site.ts')).href
).catch(() => ({
  site: { name: 'Bruno Galván', url: 'https://brunogalvan.dev' },
}));
const catalogs = {
  es: JSON.parse(
    await readFile(path.join(root, 'src/i18n/messages/es.json'), 'utf8'),
  ),
  en: JSON.parse(
    await readFile(path.join(root, 'src/i18n/messages/en.json'), 'utf8'),
  ),
};

function card(locale) {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
    @font-face { font-family: Archivo; src: url("${archivo}") format("woff2"); font-weight: 100 900; }
    @font-face { font-family: Mono; src: url("${mono}") format("woff2"); font-weight: 100 900; }
    html, body { margin: 0; }
    body { width: 1200px; height: 630px; background: #fcfcfa; color: #14140f; font-family: Archivo, sans-serif;
      display: flex; flex-direction: column; justify-content: space-between; padding: 88px 96px; box-sizing: border-box; }
    .domain { font-family: Mono, monospace; font-size: 28px; color: #6c6a61; letter-spacing: 0.02em; }
    h1 { margin: 0; font-size: 96px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.05; }
    p { margin: 20px 0 0; font-size: 44px; color: #6c6a61; font-weight: 400; }
    .mark { width: 72px; height: 10px; background: #2b4be3; border-radius: 2px; }
  </style></head><body>
    <div class="domain">${new URL(site.url).host}</div>
    <div><div class="mark"></div><h1 style="margin-top:28px">${site.name}</h1><p>${catalogs[locale].home.headline}</p></div>
  </body></html>`;
}

await mkdir(path.join(root, 'public/og'), { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  for (const locale of ['es', 'en']) {
    await page.setContent(card(locale), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: path.join(root, `public/og/${locale}.png`),
      type: 'png',
    });
    console.log(`public/og/${locale}.png`);
  }
  const icon = await browser.newPage({
    viewport: { width: 180, height: 180 },
    deviceScaleFactor: 1,
  });
  const svg = await readFile(path.join(root, 'public/favicon.svg'), 'utf8');
  await icon.setContent(
    `<!doctype html><html><body style="margin:0;background:#14140f">${svg.replace('<svg ', '<svg width="180" height="180" ')}</body></html>`,
  );
  await icon.screenshot({
    path: path.join(root, 'public/apple-touch-icon.png'),
    type: 'png',
    omitBackground: false,
  });
  console.log('public/apple-touch-icon.png');
} finally {
  await browser.close();
}
