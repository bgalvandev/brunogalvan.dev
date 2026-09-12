import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { builtinModules } from 'node:module';
import ts from 'typescript';
import { parse } from '@astrojs/compiler';

const root = process.cwd();
const errors = [];
const graph = new Map();
const browserRoots = [];
const shared = {
  layouts: ['layouts', 'components', 'config', 'i18n', 'styles'],
  components: ['components', 'config', 'i18n', 'styles'],
  config: ['config'],
  i18n: ['i18n'],
  styles: ['styles'],
};
const layers = new Set([
  'domain',
  'application',
  'infrastructure',
  'interface',
]);
const builtins = new Set(
  builtinModules.flatMap((name) => [name, `node:${name}`]),
);

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(file)));
    else if (
      /\.(ts|tsx|js|mjs|astro)$/.test(file) &&
      !/\.(spec|test)\./.test(file)
    )
      files.push(file);
  }
  return files;
}

function owner(file) {
  const [area, module, segment] = path
    .relative(path.join(root, 'src'), file)
    .split(path.sep);
  // A feature can begin with presentation files directly in its root. Explicit
  // layers become necessary only when separate business or I/O responsibilities exist.
  const layer =
    area === 'modules' && segment?.includes('.') ? 'interface' : segment;
  return { area, module, layer };
}

function serverOnly(file) {
  const { area, layer } = owner(file);
  return (
    area === 'server' ||
    ['domain', 'application', 'infrastructure'].includes(layer)
  );
}

function violation(from, target) {
  const source = owner(from);
  const destination = owner(target);
  if (destination.area === '..') return 'source imports must stay within src';
  if (source.area in shared && !shared[source.area].includes(destination.area))
    return 'shared code cannot depend on this area';
  if (
    source.area === 'server' &&
    !['server', 'config'].includes(destination.area)
  )
    return 'shared server code cannot depend on presentation or features';
  if (source.area !== 'modules') return;
  if (destination.area === 'modules') {
    if (source.module !== destination.module)
      return 'cross-feature imports require composition through a public contract';
    const allowed = {
      domain: ['domain'],
      application: ['domain', 'application'],
      infrastructure: ['domain', 'application', 'infrastructure'],
      interface: ['domain', 'application', 'interface'],
    }[source.layer];
    if (!allowed?.includes(destination.layer))
      return `${source.layer} cannot depend on ${destination.layer}`;
  } else {
    const allowed = {
      domain: [],
      application: [],
      infrastructure: ['server', 'config'],
      interface: ['components', 'config', 'i18n', 'styles'],
    }[source.layer];
    if (!allowed?.includes(destination.area))
      return `${source.layer} cannot depend on ${destination.area}`;
  }
}

const files = await walk(path.join(root, 'src'));
const knownFiles = new Set(files);
function resolveLocal(from, specifier) {
  const target = specifier.startsWith('@/')
    ? path.resolve(root, 'src', specifier.slice(2))
    : specifier.startsWith('/')
      ? path.resolve(root, specifier.slice(1))
      : path.resolve(path.dirname(from), specifier);
  // TS allows a .js specifier to resolve to a .ts source file.
  const candidates = [
    target,
    target.replace(/\.js$/, '.ts'),
    ...['.ts', '.tsx', '.js', '.mjs', '.astro', '/index.ts', '/index.js'].map(
      (suffix) => target + suffix,
    ),
  ];
  return candidates.find((candidate) => knownFiles.has(candidate)) ?? target;
}

function imports(code, label) {
  const source = ts.createSourceFile(
    label,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const found = [];
  function visit(node) {
    let specifier;
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node))
      specifier = node.moduleSpecifier;
    else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require'))
    )
      specifier = node.arguments[0];
    else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument))
      specifier = node.argument.literal;
    else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    )
      specifier = node.moduleReference.expression;
    if (specifier) {
      if (ts.isStringLiteralLike(specifier)) found.push(specifier.text);
      else
        errors.push(
          `${label}: computed imports cannot be verified; use explicit imports`,
        );
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return found;
}

function inspect(file, code, browser = false) {
  const label = path.relative(root, file) + (browser ? ' <script>' : '');
  const dependencies = [];
  for (const specifier of imports(code, label)) {
    const local =
      specifier.startsWith('.') ||
      specifier.startsWith('@/') ||
      specifier.startsWith('/');
    const { layer } = owner(file);
    if (!local) {
      if (['domain', 'application'].includes(layer))
        errors.push(
          `${label}: ${layer} cannot import external package ${specifier}`,
        );
      dependencies.push({ external: specifier });
      continue;
    }
    const target = resolveLocal(file, specifier);
    const reason = violation(file, target);
    if (reason) errors.push(`${label}: ${specifier}: ${reason}`);
    dependencies.push({ target });
  }
  if (browser) browserRoots.push({ label, dependencies });
  else graph.set(file, [...(graph.get(file) ?? []), ...dependencies]);
}

for (const file of files) {
  const { area, layer } = owner(file);
  if (area === 'modules' && !layers.has(layer))
    errors.push(
      `${path.relative(root, file)}: feature files must belong to a defined layer`,
    );
  const code = await readFile(file, 'utf8');
  if (!file.endsWith('.astro')) {
    inspect(file, code);
    continue;
  }
  const { ast } = await parse(code);
  function visit(node) {
    if (node.type === 'frontmatter') inspect(file, node.value);
    if (node.type === 'expression') {
      inspect(file, node.children.map((child) => child.value ?? '').join('\n'));
    }
    if ('attributes' in node) {
      for (const attribute of node.attributes) {
        if (attribute.kind === 'expression') inspect(file, attribute.value);
      }
    }
    if (node.type === 'element' && node.name === 'script') {
      inspect(
        file,
        node.children.map((child) => child.value ?? '').join('\n'),
        true,
      );
      const src = node.attributes.find((attribute) => attribute.name === 'src');
      if (src) {
        if (src.kind !== 'quoted')
          errors.push(
            `${path.relative(root, file)}: computed script src cannot be verified`,
          );
        else inspect(file, `import ${JSON.stringify(src.value)}`, true);
      }
    }
    if ('children' in node) node.children.forEach(visit);
  }
  visit(ast);
}

for (const { label, dependencies } of browserRoots) {
  const visited = new Set();
  function visit(dependency) {
    if (dependency.external) {
      if (
        builtins.has(dependency.external) ||
        dependency.external === 'astro:env/server'
      )
        errors.push(
          `${label}: browser dependency reaches ${dependency.external}`,
        );
      return;
    }
    const target = dependency.target;
    if (visited.has(target)) return;
    visited.add(target);
    if (serverOnly(target) || target.endsWith('.astro'))
      errors.push(
        `${label}: browser dependency reaches server module ${path.relative(root, target)}`,
      );
    for (const child of graph.get(target) ?? []) visit(child);
  }
  dependencies.forEach(visit);
}

if (errors.length) {
  console.error(
    `Architecture check failed:\n${errors.map((error) => `- ${error}`).join('\n')}`,
  );
  process.exitCode = 1;
} else
  console.log(
    `Architecture check passed: ${files.length} source files, feature and browser import boundaries.`,
  );
