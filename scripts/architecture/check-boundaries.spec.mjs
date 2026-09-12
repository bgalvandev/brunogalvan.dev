import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const script = fileURLToPath(
  new URL('./check-boundaries.mjs', import.meta.url),
);
async function check(files) {
  const root = await mkdtemp(path.join(tmpdir(), 'architecture-'));
  try {
    for (const [name, code] of Object.entries(files)) {
      const file = path.join(root, 'src', name);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, code);
    }
    return spawnSync(process.execPath, [script], {
      cwd: root,
      encoding: 'utf8',
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test('composition wires infrastructure while domain remains pure', async () => {
  const result = await check({
    'pages/index.astro':
      '---\nimport "@/modules/contact/infrastructure/mail";\n---\n<h1>Contact</h1>',
    'modules/contact/infrastructure/mail.ts': 'import "../application/send";',
    'modules/contact/application/send.ts': 'import "../domain/message";',
    'modules/contact/domain/message.ts': 'export const message = "hello";',
  });
  assert.equal(result.status, 0, result.stderr);
});

for (const [name, source, code, reason] of [
  [
    'alias import',
    'modules/contact/domain/message.ts',
    'import "@/modules/contact/infrastructure/db";',
    'domain cannot depend on infrastructure',
  ],
  [
    'relative reexport',
    'modules/contact/application/send.ts',
    'export * from "../infrastructure/db";',
    'application cannot depend on infrastructure',
  ],
  [
    'dynamic import',
    'modules/contact/interface/form.ts',
    'import("../infrastructure/db");',
    'interface cannot depend on infrastructure',
  ],
  [
    'cross-feature import',
    'modules/blog/interface/post.ts',
    'import "@/modules/contact/domain/message";',
    'cross-feature',
  ],
  [
    'shared import',
    'components/header.ts',
    'import "@/modules/contact/interface/form";',
    'shared code',
  ],
  [
    'external domain dependency',
    'modules/contact/domain/message.ts',
    'import "node:fs";',
    'external package',
  ],
  [
    'unverifiable dynamic import',
    'pages/endpoint.ts',
    'import(target);',
    'computed imports',
  ],
  [
    'relative escape',
    'pages/endpoint.ts',
    'import "../../outside";',
    'stay within src',
  ],
]) {
  test(`rejects ${name}`, async () => {
    const result = await check({ [source]: code });
    assert.equal(result.status, 1);
    assert.match(result.stderr, new RegExp(reason));
  });
}

test('checks Astro browser scripts transitively', async () => {
  const result = await check({
    'pages/index.astro':
      '---\nimport "@/server/db";\n---\n<script>import "../components/helper";</script>',
    'components/helper.ts': 'export * from "../server/db.js";',
    'server/db.ts': 'import "node:fs";',
  });
  assert.equal(result.status, 1);
  assert.match(
    result.stderr,
    /<script>: browser dependency reaches server module/,
  );
  assert.match(result.stderr, /browser dependency reaches node:fs/);
});

test('rejects direct server env imports in an Astro script', async () => {
  const result = await check({
    'pages/index.astro':
      '<script>import { SECRET } from "astro:env/server";</script>',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /browser dependency reaches astro:env\/server/);
});

test('public config cannot import presentation', async () => {
  const result = await check({
    'config/site.ts': 'import "@/components/header";',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /shared code/);
});

for (const code of [
  '<script src="/src/server/db.ts"></script>',
  '<script src="@/server/db.ts"></script>',
  '<script src={getSource()}></script>',
]) {
  test(`checks script src: ${code}`, async () => {
    const result = await check({
      'pages/index.astro': code,
      'server/db.ts': 'export const value = 1;',
    });
    assert.equal(result.status, 1);
    assert.match(
      result.stderr,
      /browser dependency reaches server module|computed script src/,
    );
  });
}

test('checks imports in Astro template expressions', async () => {
  const result = await check({
    'modules/home/interface/page.astro':
      '{await import("../infrastructure/db")}',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /interface cannot depend on infrastructure/);
});

test('presentation-only features do not need an interface directory', async () => {
  const result = await check({
    'pages/index.astro': '---\nimport "@/modules/home/home-page.astro";\n---',
    'modules/home/home-page.astro':
      '---\nimport "@/components/header.astro";\n---',
    'components/header.astro': '<header>Home</header>',
  });
  assert.equal(result.status, 0, result.stderr);
});

test('root-level feature presentation still cannot import infrastructure', async () => {
  const result = await check({
    'modules/home/home-page.astro': '---\nimport "./infrastructure/db";\n---',
    'modules/home/infrastructure/db.ts': 'export const value = 1;',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /interface cannot depend on infrastructure/);
});
