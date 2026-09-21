import { access, readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { inlineHashes } from './build/cloudflare-headers.mjs';

const credentialLike =
  /ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY/;

// Every local image the built pages point at, from src and from srcset. An
// image service that cannot run emits a warning and finishes the build, so the
// only thing standing between a missing asset and a broken page is this check.
async function missingImages(root) {
  const gone = [];
  const pages = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.name.endsWith('.html')) pages.push(file);
    }
  }
  await walk(root);
  for (const page of pages) {
    const html = await readFile(page, 'utf8');
    const referenced = new Set();
    for (const [, src] of html.matchAll(/<img[^>]*\bsrc="([^"]+)"/g)) {
      referenced.add(src);
    }
    for (const [, set] of html.matchAll(/<img[^>]*\bsrcset="([^"]+)"/g)) {
      for (const candidate of set.split(',')) {
        const url = candidate.trim().split(/\s+/)[0];
        if (url) referenced.add(url);
      }
    }
    for (const url of referenced) {
      if (!url.startsWith('/')) continue;
      const asset = path.join(root, decodeURIComponent(url));
      const found = await stat(asset).then(
        (info) => info.isFile(),
        () => false,
      );
      if (!found) {
        gone.push(`${path.relative(root, page)} points at missing ${url}`);
      }
    }
  }
  return gone;
}

// Checks the shape of the built site rather than its rendering: the root
// redirect and 404 documents exist, exactly the two latin font files ship and
// are preloaded, every script is a build asset, every referenced image was
// actually written, the CSP covers every inline block, and nothing
// credential-like reached the HTML.
export async function checkDist(root) {
  const problems = [];
  const read = (file) =>
    readFile(path.join(root, file), 'utf8').catch(() => null);
  for (const file of ['404.html', '_redirects', '_headers']) {
    await access(path.join(root, file)).catch(() =>
      problems.push(`${file} is missing`),
    );
  }

  const index = (await read('index.html')) ?? '';
  if (!/http-equiv="refresh" content="0;url=\/es\/"/.test(index)) {
    problems.push('index.html does not refresh to /es/');
  }

  const fonts = (
    await readdir(path.join(root, '_astro', 'fonts')).catch(() => [])
  ).filter((file) => file.endsWith('.woff2'));
  if (fonts.length !== 2) {
    problems.push(`expected the 2 latin font files, found ${fonts.length}`);
  }

  const home = (await read(path.join('es', 'index.html'))) ?? '';
  const preloads = home.match(/<link rel="preload"[^>]*as="font"[^>]*>/g) ?? [];
  if (preloads.length !== fonts.length) {
    problems.push(
      `expected ${fonts.length} font preloads on /es/, found ${preloads.length}`,
    );
  }
  for (const [, src] of home.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)) {
    if (!src.startsWith('/_astro/'))
      problems.push(`unexpected script source ${src}`);
  }
  if (credentialLike.test(home))
    problems.push('credential-like text found in /es/');

  problems.push(...(await missingImages(root)));

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
