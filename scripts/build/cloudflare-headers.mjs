import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Cloudflare Pages reads `_headers` from the build output. The Content Security
// Policy is derived from the built HTML: every inline script and style block
// becomes a sha256 source, so the pre-paint theme initializer and the font
// pipeline's @font-face block keep working without 'unsafe-inline', and an
// edited inline block can never ship with a stale hash.
const inlineScript = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
const inlineStyle = /<style[^>]*>([\s\S]*?)<\/style>/g;

const sha256 = (text) =>
  `'sha256-${createHash('sha256').update(text).digest('base64')}'`;

async function htmlFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await htmlFiles(file)));
    else if (entry.name.endsWith('.html')) files.push(file);
  }
  return files;
}

export async function inlineHashes(root) {
  const scripts = new Set();
  const styles = new Set();
  for (const file of await htmlFiles(root)) {
    const html = await readFile(file, 'utf8');
    for (const [, body] of html.matchAll(inlineScript))
      scripts.add(sha256(body));
    for (const [, body] of html.matchAll(inlineStyle)) styles.add(sha256(body));
  }
  return { scripts: [...scripts].sort(), styles: [...styles].sort() };
}

export function renderHeaders({ scripts, styles }) {
  const scriptSources = ["'self'", ...scripts].join(' ');
  const styleSources = ["'self'", ...styles].join(' ');
  return [
    '/*',
    `  Content-Security-Policy: default-src 'self'; script-src ${scriptSources}; style-src ${styleSources}; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`,
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
        const hashes = await inlineHashes(root);
        await writeFile(path.join(root, '_headers'), renderHeaders(hashes));
        logger.info(
          `_headers written with ${hashes.scripts.length} inline script and ${hashes.styles.length} inline style hash(es)`,
        );
      },
    },
  };
}
