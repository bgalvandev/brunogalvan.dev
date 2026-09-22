import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { defaultLocale } from '../src/i18n/locales.ts';
import { inlineHashes } from './build/cloudflare-headers.mjs';

const credentialLike =
  /ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY/;

// Checks the shape of the built site rather than its rendering: the root
// redirect and 404 documents exist, and both redirects lead to the default
// language (Node strips the types of its single source); exactly the three
// latin font files ship and are preloaded, every script is a build asset, the
// CSP covers every inline block, and nothing credential-like reached the HTML.
export async function checkDist(root) {
  const problems = [];
  const read = (file) =>
    readFile(path.join(root, file), 'utf8').catch(() => null);
  for (const file of ['404.html', '_redirects', '_headers']) {
    await access(path.join(root, file)).catch(() =>
      problems.push(`${file} is missing`),
    );
  }

  const home = `/${defaultLocale}/`;
  const index = (await read('index.html')) ?? '';
  if (!index.includes(`http-equiv="refresh" content="0;url=${home}"`)) {
    problems.push(`index.html does not refresh to ${home}`);
  }
  const redirects = (await read('_redirects')) ?? '';
  if (!redirects.split('\n').includes(`/ ${home} 301`)) {
    problems.push(`_redirects does not send / to ${home}`);
  }

  const fonts = (
    await readdir(path.join(root, '_astro', 'fonts')).catch(() => [])
  ).filter((file) => file.endsWith('.woff2'));
  if (fonts.length !== 3) {
    problems.push(`expected the 3 latin font files, found ${fonts.length}`);
  }

  const page = (await read(path.join(defaultLocale, 'index.html'))) ?? '';
  const preloads = page.match(/<link rel="preload"[^>]*as="font"[^>]*>/g) ?? [];
  if (preloads.length !== fonts.length) {
    problems.push(
      `expected ${fonts.length} font preloads on ${home}, found ${preloads.length}`,
    );
  }
  for (const [, src] of page.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)) {
    if (!src.startsWith('/_astro/'))
      problems.push(`unexpected script source ${src}`);
  }
  if (credentialLike.test(page))
    problems.push(`credential-like text found in ${home}`);

  const headers = (await read('_headers')) ?? '';
  const hashes = await inlineHashes(root);
  for (const hash of [...hashes.scripts, ...hashes.styles]) {
    if (!headers.includes(hash)) problems.push(`_headers lacks ${hash}`);
  }
  return problems;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const problems = await checkDist(path.resolve('dist'));
  if (problems.length > 0) {
    console.error(
      `dist check failed:\n${problems.map((problem) => `- ${problem}`).join('\n')}`,
    );
    process.exitCode = 1;
  } else {
    console.log('dist check passed');
  }
}
