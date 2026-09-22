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
// Fonts travel as data: URIs; a page opened with setContent has no file://
// access, so a file URL would silently fall back to a system face.
const dataUri = async (file) =>
  `data:font/woff2;base64,${(await readFile(file)).toString('base64')}`;
const fontsource = (pkg, file) =>
  path.join(
    path.dirname(require.resolve(`${pkg}/package.json`)),
    'files',
    file,
  );
const sans = await dataUri(
  fontsource('@fontsource-variable/geist', 'geist-latin-wght-normal.woff2'),
);
const mono = await dataUri(
  fontsource(
    '@fontsource-variable/geist-mono',
    'geist-mono-latin-wght-normal.woff2',
  ),
);
// geist's exports map hides its font files, so this one resolves by path.
const pixel = await dataUri(
  path.join(
    root,
    'node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Square.woff2',
  ),
);

// Node 24 strips the types, so the identity comes from its single source.
const { site } = await import(
  pathToFileURL(path.join(root, 'src/config/site.ts')).href
);
const catalogs = {
  es: JSON.parse(
    await readFile(path.join(root, 'src/i18n/messages/es.json'), 'utf8'),
  ),
  en: JSON.parse(
    await readFile(path.join(root, 'src/i18n/messages/en.json'), 'utf8'),
  ),
};

// The card speaks the site's grammar: a dark gridded band on top, the name in
// Geist at weight 400 with negative tracking, the role's pixel fragment in the
// accent. Colours are the light-theme values of src/styles/tokens.css.
function card(locale) {
  const { hero, identity } = catalogs[locale];
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
    @font-face { font-family: Sans; src: url("${sans}") format("woff2"); font-weight: 100 900; }
    @font-face { font-family: Mono; src: url("${mono}") format("woff2"); font-weight: 100 900; }
    @font-face { font-family: Pixel; src: url("${pixel}") format("woff2"); }
    html, body { margin: 0; }
    body { width: 1200px; height: 630px; background: #ffffff; color: #1a1a1a; font-family: Sans, sans-serif;
      display: flex; flex-direction: column; box-sizing: border-box; letter-spacing: -0.05em; }
    .band { height: 200px; background-color: #212121; background-image: linear-gradient(#3d3d3d 1px, transparent 1px),
      linear-gradient(90deg, #3d3d3d 1px, transparent 1px); background-size: 40px 40px;
      display: flex; align-items: flex-end; padding: 0 96px 32px; box-sizing: border-box; }
    .domain { font-family: Mono, monospace; font-size: 26px; font-weight: 500; color: #a3a3a3; letter-spacing: -0.04em; text-transform: uppercase; }
    main { flex: 1; padding: 56px 96px 0; }
    footer { display: flex; justify-content: space-between; margin: 0 96px; padding: 28px 0 40px; border-top: 1px solid #e0e0e0;
      font-family: Mono, monospace; font-size: 24px; font-weight: 500; color: #6b6b6b; letter-spacing: -0.04em; text-transform: uppercase; }
    h1 { margin: 0; font-size: 112px; font-weight: 400; letter-spacing: -0.06em; line-height: 1.1; }
    p { margin: 12px 0 0; font-size: 44px; color: #474747; line-height: 1.3; }
    .fragment { font-family: Pixel, monospace; color: #c8341a; letter-spacing: 0; }
  </style></head><body>
    <div class="band"><div class="domain">${new URL(site.url).host}</div></div>
    <main><h1>${site.name}</h1><p><span class="fragment">[ ${hero.fragment} ]</span> ${identity.role}</p></main>
    <footer><span>${identity.location}</span><span>${new URL(site.github).host}${new URL(site.github).pathname}</span></footer>
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
    `<!doctype html><html><body style="margin:0;background:#1a1a1a">${svg.replace('<svg ', '<svg width="180" height="180" ')}</body></html>`,
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
