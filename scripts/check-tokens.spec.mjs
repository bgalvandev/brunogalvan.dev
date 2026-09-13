import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { findRawColors } from './check-tokens.mjs';

async function fixture(t, files) {
  const root = await mkdtemp(path.join(tmpdir(), 'check-tokens-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, text] of Object.entries(files)) {
    const file = path.join(root, name);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, text);
  }
  return root;
}

test('accepts semantic utilities and skips test files', async (t) => {
  const root = await fixture(t, {
    'src/page.astro': '<main class="bg-paper text-ink border-line" />',
    'src/page.spec.ts': 'const cls = "bg-white";',
  });
  assert.deepEqual(await findRawColors(root, ['src', 'public']), []);
});

test('reports theme-blind colors with variants, directional borders and bare black', async (t) => {
  const root = await fixture(t, {
    'src/page.astro':
      '<main class="hover:bg-slate-100\ndark:border-t-white/20\ntext-black" />',
  });
  const findings = await findRawColors(root, ['src']);
  assert.equal(findings.length, 3);
  for (const color of ['bg-slate-100', 'border-t-white', 'text-black']) {
    assert.ok(
      findings.some((f) => f.includes(color)),
      color,
    );
  }
  assert.match(findings[0], /^src\/page\.astro:1:/);
});
