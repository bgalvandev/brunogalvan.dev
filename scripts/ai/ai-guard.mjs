import { readFile, readdir, readlink, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const skillsRoot = path.join(root, '.agents/skills');
const errors = [];

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function checkSkills() {
  const entries = await readdir(skillsRoot, { withFileTypes: true });
  const names = new Set(
    entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name),
  );
  if (!names.size) errors.push('No canonical skills found.');

  for (const name of names) {
    const file = path.join(skillsRoot, name, 'SKILL.md');
    if (!(await exists(file))) {
      errors.push(`${name}: missing SKILL.md.`);
      continue;
    }
    const text = await readFile(file, 'utf8');
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(
      text,
    )?.[1];
    // Repository skills use single-line scalar name and description fields.
    const declaredName = /^name:\s*(\S.*?)\s*$/m.exec(frontmatter ?? '')?.[1];
    const description = /^description:\s*(\S.*?)\s*$/m.exec(
      frontmatter ?? '',
    )?.[1];
    if (
      declaredName !== name ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) ||
      name.length > 64
    ) {
      errors.push(
        `${name}: frontmatter name must match its kebab-case folder.`,
      );
    }
    if (!description || ['|', '>'].includes(description)) {
      errors.push(`${name}: missing single-line applicability description.`);
    }
    if (/\[\[[^\]]*\]\]/.test(text)) {
      errors.push(
        `${name}: link skills with relative markdown paths instead of [[wikilinks]].`,
      );
    }
    for (const [, link] of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const target = link.split('#')[0];
      if (!target || /^(?:[a-z]+:|\/)/i.test(target)) continue;
      if (!(await exists(path.resolve(path.dirname(file), target)))) {
        errors.push(`${name}: missing reference ${target}.`);
      }
    }
  }

  try {
    if (
      (await readlink(path.join(root, '.claude/skills'))) !==
      '../.agents/skills'
    ) {
      errors.push('.claude/skills must link to ../.agents/skills.');
    }
  } catch {
    errors.push('.claude/skills must be a symlink to ../.agents/skills.');
  }
}

const families =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const rawColor = new RegExp(
  `\\b(?:bg|text|border|fill|stroke|from|via|to|ring|outline|divide|decoration|shadow|accent|caret)(?:-[xytrblse])?-(?:(?:${families})-(?:50|[1-9]00|950)|white|black)\\b`,
);

async function checkSource(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await checkSource(file);
    } else if (
      /\.(?:astro|ts|tsx|js|jsx|css|json|md|mdx|svg|txt)$/.test(entry.name) &&
      !/\.(?:spec|test)\./.test(entry.name)
    ) {
      const lines = (await readFile(file, 'utf8')).split('\n');
      lines.forEach((line, index) => {
        for (const [email] of line.matchAll(
          /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi,
        )) {
          if (email !== 'brunogalvangarcia@outlook.com') {
            errors.push(
              `${path.relative(root, file)}:${index + 1}: unapproved email identity; use the contact specified in AGENTS.md.`,
            );
          }
        }
        const match = rawColor.exec(line);
        if (match)
          errors.push(
            `${path.relative(root, file)}:${index + 1}: use a semantic token instead of ${match[0]}.`,
          );
      });
    }
  }
}

try {
  await checkSkills();
  await checkSource(path.join(root, 'src'));
  if (await exists(path.join(root, 'public')))
    await checkSource(path.join(root, 'public'));
  if (errors.length) {
    console.error(
      `AI guard failed:\n${errors.map((error) => `- ${error}`).join('\n')}`,
    );
    process.exitCode = 1;
  } else {
    console.log(
      'AI guard passed: skill metadata, references, discovery symlink, UI color utilities, and approved contact email.',
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
