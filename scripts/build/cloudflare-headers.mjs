import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cloudflare Pages reads `_headers` from the build output. The Content Security
// Policy is derived from the built HTML: every inline script becomes a sha256
// source, so the pre-paint theme initializer keeps working without
// 'unsafe-inline' and an edited inline script can never ship with a stale hash.
const inlineScript = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(file)));
    else if (entry.name.endsWith('.html')) files.push(file);
  }
  return files;
}

export async function inlineScriptHashes(root) {
  const hashes = new Set();
  for (const file of await htmlFiles(root)) {
    const html = await readFile(file, 'utf8');
    for (const [, body] of html.matchAll(inlineScript)) {
      hashes.add(
        `'sha256-${createHash('sha256').update(body).digest('base64')}'`,
      );
    }
  }
  return [...hashes].sort();
}

export function renderHeaders(hashes) {
  const scripts = ["'self'", ...hashes].join(' ');
  return [
    '/*',
    `  Content-Security-Policy: default-src 'self'; script-src ${scripts}; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`,
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=()',
    '',
    '/_astro/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n');
}

export function cloudflareHeaders() {
  return {
    name: 'cloudflare-headers',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const hashes = await inlineScriptHashes(root);
        await writeFile(path.join(root, '_headers'), renderHeaders(hashes));
        logger.info(
          `_headers written with ${hashes.length} inline script hash(es)`,
        );
      },
    },
  };
}
