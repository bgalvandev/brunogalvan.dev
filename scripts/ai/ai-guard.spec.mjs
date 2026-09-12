import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const guard = fileURLToPath(new URL('./ai-guard.mjs', import.meta.url));

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'portfolio-guard-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ['.agents/skills/example', '.claude', 'src']) {
    await mkdir(path.join(root, dir), { recursive: true });
  }
  await symlink('../.agents/skills', path.join(root, '.claude/skills'));
  await writeFile(
    path.join(root, '.agents/skills/example/SKILL.md'),
    '---\nname: example\ndescription: Use when editing the example.\n---\n',
  );
  await writeFile(
    path.join(root, 'src/page.astro'),
    '<main class="bg-paper text-ink" />',
  );
  return {
    write: (file, text) => writeFile(path.join(root, file), text),
    run: () =>
      spawnSync(process.execPath, [guard], { cwd: root, encoding: 'utf8' }),
    root,
  };
}

test('accepts portable skills, a discovery symlink, and semantic colors', async (t) => {
  const repo = await fixture(t);
  const result = repo.run();
  assert.equal(result.status, 0, result.stderr);
});

test('rejects broken skill metadata and references', async (t) => {
  const repo = await fixture(t);
  await repo.write(
    '.agents/skills/example/SKILL.md',
    '---\nname: wrong\n---\n[[missing]]\n[guide](./missing.md)\n',
  );
  const result = repo.run();
  assert.equal(result.status, 1);
  for (const failure of [
    'frontmatter name',
    'applicability description',
    'missing skill',
    'missing reference',
  ]) {
    assert.ok(result.stderr.includes(failure), result.stderr);
  }
});

test('rejects copied discovery directories', async (t) => {
  const repo = await fixture(t);
  await rm(path.join(repo.root, '.claude/skills'));
  await mkdir(path.join(repo.root, '.claude/skills'));
  const result = repo.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /must be a symlink/);
});

test('rejects theme-blind colors including variants and directional borders', async (t) => {
  const repo = await fixture(t);
  await repo.write(
    'src/page.astro',
    '<main class="hover:bg-slate-100\ndark:border-t-white/20\ntext-black" />',
  );
  const result = repo.run();
  assert.equal(result.status, 1);
  for (const color of ['bg-slate-100', 'border-t-white', 'text-black']) {
    assert.ok(result.stderr.includes(color), result.stderr);
  }
});

test('accepts the approved public contact in markup and message catalogs', async (t) => {
  const repo = await fixture(t);
  await repo.write(
    'src/page.astro',
    '<a href="mailto:brunogalvangarcia@outlook.com">brunogalvangarcia@outlook.com</a>',
  );
  await repo.write(
    'src/es.json',
    JSON.stringify({ contact: 'brunogalvangarcia@outlook.com' }),
  );
  const result = repo.run();
  assert.equal(result.status, 0, result.stderr);
});

test('rejects unrelated email identities in markup and message catalogs', async (t) => {
  const repo = await fixture(t);
  await repo.write(
    'src/page.astro',
    '<a href="mailto:contact@example.invalid">Contact</a>',
  );
  await repo.write(
    'src/es.json',
    JSON.stringify({ contact: 'contact@example.invalid' }),
  );
  const result = repo.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /src\/page\.astro:1: unapproved email identity/);
  assert.match(result.stderr, /src\/es\.json:1: unapproved email identity/);
});
