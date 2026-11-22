import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { inlineHashes, renderHeaders } from './cloudflare-headers.mjs';

const sha = (text) =>
  `'sha256-${createHash('sha256').update(text).digest('base64')}'`;
const literal = (text) => new RegExp(text.replace(/[+/=]/g, '\\$&'));

test('hashes every inline script and style once and ignores external scripts', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'headers-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'es'));
  await writeFile(
    path.join(root, 'es', 'index.html'),
    '<style>@font-face{}</style><script>init()</script><script type="module">toggle()</script><script src="/_astro/a.js"></script>',
  );
  await writeFile(
    path.join(root, '404.html'),
    '<script>init()</script><style>@font-face{}</style>',
  );
  assert.deepEqual(await inlineHashes(root), {
    scripts: [sha('init()'), sha('toggle()')].sort(),
    styles: [sha('@font-face{}')],
  });
});

test('renders hashed script and style sources and an immutable cache for build assets', () => {
  const headers = renderHeaders({
    scripts: [sha('init()')],
    styles: [sha('@font-face{}')],
  });
  assert.match(headers, literal(`script-src 'self' ${sha('init()')};`));
  assert.match(headers, literal(`style-src 'self' ${sha('@font-face{}')};`));
  assert.doesNotMatch(headers, /unsafe-inline/);
  assert.match(
    headers,
    /\/_astro\/\*\n {2}Cache-Control: public, max-age=31536000, immutable/,
  );
});
