import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { inlineHashes, renderHeaders } from './build/cloudflare-headers.mjs';
import { checkDist } from './check-dist.mjs';

const preload = (file) =>
  `<link rel="preload" href="/_astro/fonts/${file}" as="font" type="font/woff2" crossorigin>`;

async function dist(t, { fonts = ['a.woff2', 'b.woff2'], home, headers } = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'dist-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'es'));
  await mkdir(path.join(root, '_astro', 'fonts'), { recursive: true });
  for (const font of fonts)
    await writeFile(path.join(root, '_astro', 'fonts', font), '');
  await writeFile(path.join(root, '404.html'), '<h1>404</h1>');
  await writeFile(path.join(root, '_redirects'), '/ /es/ 301');
  await writeFile(
    path.join(root, 'index.html'),
    '<meta http-equiv="refresh" content="0;url=/es/">',
  );
  await writeFile(
    path.join(root, 'es', 'index.html'),
    home ??
      `${preload('a.woff2')}${preload('b.woff2')}<style>@font-face{}</style><script>init()</script><script type="module" src="/_astro/x.js"></script>`,
  );
  await writeFile(
    path.join(root, '_headers'),
    headers ?? renderHeaders(await inlineHashes(root)),
  );
  return root;
}

test('accepts a complete build', async (t) => {
  assert.deepEqual(await checkDist(await dist(t)), []);
});

test('reports missing documents, extra fonts, missing preloads, foreign scripts, secrets and uncovered inline blocks', async (t) => {
  const root = await dist(t, {
    fonts: ['a.woff2', 'b.woff2', 'c.woff2'],
    home: '<script src="https://cdn.example/x.js"></script><script>alert(1)</script>ghp_abcdefghijklmnopqrstuv',
    headers: renderHeaders({ scripts: [], styles: [] }),
  });
  await rm(path.join(root, '404.html'));
  const problems = await checkDist(root);
  for (const expected of [
    '404.html is missing',
    'found 3',
    'expected 3 font preloads on /es/, found 0',
    'unexpected script source https://cdn.example/x.js',
    'credential-like',
    '_headers lacks',
  ]) {
    assert.ok(
      problems.some((problem) => problem.includes(expected)),
      `missing "${expected}" in:\n${problems.join('\n')}`,
    );
  }
});
