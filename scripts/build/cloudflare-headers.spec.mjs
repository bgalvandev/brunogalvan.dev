import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { inlineScriptHashes, renderHeaders } from './cloudflare-headers.mjs';

const sha = (text) =>
  `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

test('hashes every inline script once and ignores external ones', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'headers-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'es'));
  await writeFile(
    path.join(root, 'es', 'index.html'),
    '<script>init()</script><script type="module">toggle()</script><script src="/_astro/a.js"></script>',
  );
  await writeFile(path.join(root, '404.html'), '<script>init()</script>');
  assert.deepEqual(
    await inlineScriptHashes(root),
    [sha('init()'), sha('toggle()')].sort(),
  );
});

test('renders a hashed script-src and an immutable cache for build assets', () => {
  const headers = renderHeaders([sha('init()')]);
  assert.match(
    headers,
    new RegExp(`script-src 'self' ${sha('init()').replace(/[+/=]/g, '\\$&')};`),
  );
  assert.doesNotMatch(headers, /unsafe-inline/);
  assert.match(
    headers,
    /\/_astro\/\*\n {2}Cache-Control: public, max-age=31536000, immutable/,
  );
});
