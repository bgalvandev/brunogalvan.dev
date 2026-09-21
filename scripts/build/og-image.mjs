import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { chromium } from '@playwright/test';

// Renders the social card for each locale and the touch icon from the same
// tokens the site uses, then writes them to public/. Run by hand
// (`pnpm run og:generate`) when the name, role, colors or favicon change;
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

// The brand mark, drawn from the same paths as the favicon and the header.
const mark = (size) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" stroke="#f2f1ee">` +
  '<path d="M10 21V10h11M43 10h11v11M54 43v11H43M21 54H10V43" stroke-width="4" stroke-linecap="square"/>' +
  '<path d="M25 19v26M25 19h8.5a6.5 6.5 0 0 1 0 13H25M25 32h9.5a6.5 6.5 0 0 1 0 13H25" stroke-width="5" stroke-linecap="square"/></svg>';

function card(locale) {
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
    @font-face { font-family: Archivo; src: url("${archivo}") format("woff2"); font-weight: 100 900; }
    @font-face { font-family: Mono; src: url("${mono}") format("woff2"); font-weight: 100 900; }
    html, body { margin: 0; }
    body { width: 1200px; height: 630px; background: #08090a; color: #f2f1ee; font-family: Archivo, sans-serif;
      display: flex; flex-direction: column; justify-content: space-between; padding: 88px 96px; box-sizing: border-box;
      background-image:
        repeating-linear-gradient(to right, #1c1d21 0 1px, transparent 1px 88px),
        repeating-linear-gradient(to bottom, #1c1d21 0 1px, transparent 1px 88px); }
    .top { display: flex; align-items: center; gap: 20px; }
    .domain { font-family: Mono, monospace; font-size: 26px; color: #8d8d96; letter-spacing: 0.06em; }
    h1 { margin: 0; font-size: 104px; font-weight: 400; letter-spacing: -0.038em; line-height: 1; }
    p { margin: 24px 0 0; font-size: 40px; color: #8d8d96; font-weight: 400; letter-spacing: -0.01em; }
  </style></head><body>
    <div class="top">${mark(44)}<span class="domain">${new URL(site.url).host}</span></div>
    <div><h1>${site.name}</h1><p>${catalogs[locale].home.role}</p></div>
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
  await icon.setContent(
    `<!doctype html><html><body style="margin:0;background:#08090a;display:flex;align-items:center;justify-content:center">${mark(132)}</body></html>`,
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
