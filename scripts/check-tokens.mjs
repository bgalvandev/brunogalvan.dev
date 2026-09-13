import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

// Rejects theme-blind color utilities in product markup. Every color must come
// from the semantic tokens in src/styles/tokens.css so one class renders in both
// themes; no ESLint plugin reads arbitrary class strings inside .astro files.
const families =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const rawColor = new RegExp(
  `\\b(?:bg|text|border|fill|stroke|from|via|to|ring|outline|divide|decoration|shadow|accent|caret)(?:-[xytrblse])?-(?:(?:${families})-(?:50|[1-9]00|950)|white|black)\\b`,
);
const sourceFile = /\.(?:astro|ts|tsx|js|jsx|css|json|md|mdx|svg|txt)$/;
const testFile = /\.(?:spec|test)\./;

export async function findRawColors(root, directories) {
  const findings = [];
  async function walk(directory) {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(file);
      } else if (sourceFile.test(entry.name) && !testFile.test(entry.name)) {
        const lines = (await readFile(file, 'utf8')).split('\n');
        lines.forEach((line, index) => {
          const match = rawColor.exec(line);
          if (match) {
            findings.push(
              `${path.relative(root, file)}:${index + 1}: use a semantic token instead of ${match[0]}.`,
            );
          }
        });
      }
    }
  }
  for (const directory of directories) await walk(path.join(root, directory));
  return findings;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === new URL(import.meta.url).pathname
) {
  const findings = await findRawColors(process.cwd(), ['src', 'public']);
  if (findings.length) {
    console.error(
      `Token check failed:\n${findings.map((f) => `- ${f}`).join('\n')}`,
    );
    process.exitCode = 1;
  } else {
    console.log('Token check passed: no raw color utilities in src or public.');
  }
}
