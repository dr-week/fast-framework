import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KEBAB_CASE = /^[a-z][a-z0-9-]*$/;
const ALLOWED_SUBMODULE_PACKAGES = new Set(['ui', 'hardware']);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toPascalCase(kebabName) {
  return kebabName
    .split('-')
    .filter(Boolean)
    .map(segment => segment[0].toUpperCase() + segment.slice(1))
    .join('');
}

function detectFormat(rawText) {
  return {
    eol: rawText.includes('\r\n') ? '\r\n' : '\n',
    hasTrailingNewline: /\r?\n$/.test(rawText)
  };
}

function serializeJson(data, { eol = '\n', hasTrailingNewline = true } = {}) {
  const body = JSON.stringify(data, null, 2).replace(/\n/g, eol);
  return hasTrailingNewline ? `${body}${eol}` : body;
}

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

function buildSubmoduleStarter(targetPkg, name, eol) {
  const pascalName = toPascalCase(name);
  if (targetPkg === 'ui') {
    return [
      `export interface ${pascalName}Props {`,
      '  label: string;',
      '}',
      '',
      `export function create${pascalName}(props: ${pascalName}Props): HTMLDivElement {`,
      "  const element = document.createElement('div');",
      `  element.classList.add('zuari-${name}');`,
      '  element.textContent = props.label;',
      '  return element;',
      '}',
      ''
    ].join(eol);
  }

  return [
    "import { signal, type Signal } from '@zuari/signals';",
    '',
    `export interface ${pascalName}State {`,
    '  readonly active: Signal<boolean>;',
    '  setActive(next: boolean): void;',
    '}',
    '',
    `export function create${pascalName}(initialActive = false): ${pascalName}State {`,
    '  const active = signal<boolean>(initialActive);',
    '  return {',
    '    active,',
    '    setActive(next: boolean): void {',
    '      active.value = next;',
    '    }',
    '  };',
    '}',
    ''
  ].join(eol);
}

function buildPackageManifest(name) {
  return serializeJson({
    name: `@zuari/${name}`,
    version: '0.1.0',
    description: `Modular @zuari/${name} package for Zuari Framework`,
    type: 'module',
    sideEffects: false,
    main: './dist/index.js',
    types: './dist/index.d.ts',
    files: ['dist'],
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js'
      }
    },
    scripts: {
      build: 'tsc'
    }
  });
}

function buildPackageTsconfig() {
  return serializeJson({
    extends: '../../tsconfig.base.json',
    compilerOptions: {
      outDir: './dist',
      rootDir: './src'
    },
    include: ['src/**/*']
  });
}

function buildPackageEntry(name) {
  const pascalName = toPascalCase(name);
  return [
    `export interface ${pascalName}Options {`,
    '  id: string;',
    '}',
    '',
    `export function create${pascalName}(options: ${pascalName}Options): { readonly id: string } {`,
    '  return { id: options.id };',
    '}',
    ''
  ].join('\n');
}

function buildPackageTest(name) {
  const pascalName = toPascalCase(name);
  return [
    "import { describe, expect, it } from 'vitest';",
    `import { create${pascalName} } from './index.js';`,
    '',
    `describe('@zuari/${name}', () => {`,
    "  it('creates an instance with the provided id', () => {",
    `    const instance = create${pascalName}({ id: '${name}' });`,
    `    expect(instance.id).toBe('${name}');`,
    '  });',
    '});',
    ''
  ].join('\n');
}

function appendBarrelExport(rawBarrel, name) {
  const exportPattern = new RegExp(
    `^\\s*export\\s+\\*\\s+from\\s+['"]\\./${escapeRegExp(name)}/index\\.js['"];?\\s*$`,
    'm'
  );
  if (exportPattern.test(rawBarrel)) {
    return { changed: false, content: rawBarrel };
  }

  const { eol, hasTrailingNewline } = detectFormat(rawBarrel);
  const statement = `export * from './${name}/index.js';`;
  const trimmedEnd = rawBarrel.replace(/(?:\r?\n)+$/, '');
  const nextBody = trimmedEnd.length > 0 ? `${trimmedEnd}${eol}${statement}` : statement;

  return {
    changed: true,
    content: hasTrailingNewline || rawBarrel.length === 0 ? `${nextBody}${eol}` : nextBody
  };
}

async function planSubmodule({ root, targetPkg, name }) {
  if (!ALLOWED_SUBMODULE_PACKAGES.has(targetPkg)) {
    throw new TypeError(`Unsupported submodule package "${targetPkg}". Expected "ui" or "hardware".`);
  }

  const pkgDir = path.join(root, 'packages', targetPkg);
  const manifestPath = path.join(pkgDir, 'package.json');
  const barrelPath = path.join(pkgDir, 'src', 'index.ts');
  const entryPath = path.join(pkgDir, 'src', name, 'index.ts');

  if (!(await pathExists(manifestPath)) || !(await pathExists(barrelPath))) {
    throw new Error(`Target package "packages/${targetPkg}" is missing package.json or src/index.ts.`);
  }
  if (await pathExists(entryPath)) {
    throw new Error(`Submodule already exists: packages/${targetPkg}/src/${name}/index.ts`);
  }

  const rawBarrel = await readFile(barrelPath, 'utf8');
  const barrelFormat = detectFormat(rawBarrel);
  const entryContent = buildSubmoduleStarter(targetPkg, name, barrelFormat.eol);
  const nextBarrel = appendBarrelExport(rawBarrel, name);

  const rawManifest = await readFile(manifestPath, 'utf8');
  const manifestFormat = detectFormat(rawManifest);
  const manifest = JSON.parse(rawManifest);
  const exportsMap = (manifest.exports && typeof manifest.exports === 'object' && !Array.isArray(manifest.exports))
    ? { ...manifest.exports }
    : {};

  const exportKey = `./${name}`;
  const exportValue = {
    types: `./dist/${name}/index.d.ts`,
    import: `./dist/${name}/index.js`
  };
  const exportsChanged = JSON.stringify(exportsMap[exportKey]) !== JSON.stringify(exportValue);
  exportsMap[exportKey] = exportValue;
  manifest.exports = exportsMap;

  const operations = [
    { action: 'create', path: entryPath, content: entryContent },
    {
      action: nextBarrel.changed ? 'update' : 'unchanged',
      path: barrelPath,
      content: nextBarrel.content
    },
    {
      action: exportsChanged ? 'update' : 'unchanged',
      path: manifestPath,
      content: serializeJson(manifest, manifestFormat)
    }
  ];

  return operations;
}

async function planPackage({ root, name }) {
  const pkgDir = path.join(root, 'packages', name);
  if (await pathExists(pkgDir)) {
    throw new Error(`Package directory already exists: packages/${name}`);
  }

  return [
    { action: 'create', path: path.join(pkgDir, 'package.json'), content: buildPackageManifest(name) },
    { action: 'create', path: path.join(pkgDir, 'tsconfig.json'), content: buildPackageTsconfig() },
    { action: 'create', path: path.join(pkgDir, 'src', 'index.ts'), content: buildPackageEntry(name) },
    { action: 'create', path: path.join(pkgDir, 'src', `${name}.test.ts`), content: buildPackageTest(name) }
  ];
}

/**
 * Scaffolds either a subpath module under `ui`/`hardware` or a standalone `@zuari/<name>` package.
 */
export async function scaffoldModule({
  root = ROOT,
  mode,
  targetPkg,
  name,
  dryRun = false
} = {}) {
  if (mode !== 'submodule' && mode !== 'package') {
    throw new TypeError(`Unsupported scaffold mode "${mode}". Expected "submodule" or "package".`);
  }
  if (typeof name !== 'string' || !KEBAB_CASE.test(name)) {
    throw new TypeError(`Invalid module name "${name}". Expected kebab-case matching /^[a-z][a-z0-9-]*$/.`);
  }

  const resolvedRoot = path.resolve(root);
  const operations = mode === 'submodule'
    ? await planSubmodule({ root: resolvedRoot, targetPkg, name })
    : await planPackage({ root: resolvedRoot, name });

  if (!dryRun) {
    for (const op of operations) {
      if (op.action === 'unchanged') continue;
      await mkdir(path.dirname(op.path), { recursive: true });
      await writeFile(op.path, op.content, 'utf8');
    }
  }

  return {
    dryRun,
    mode,
    targetPkg: mode === 'submodule' ? targetPkg : null,
    name,
    operations: operations.map(op => ({
      ...op,
      relativePath: path.relative(resolvedRoot, op.path).split(path.sep).join('/')
    }))
  };
}

function printUsage() {
  console.log([
    'Usage:',
    '  node scripts/new-module.mjs submodule <ui|hardware> <name> [--dry-run]',
    '  node scripts/new-module.mjs package <name> [--dry-run]'
  ].join('\n'));
}

function readArguments(rawArgs) {
  const args = rawArgs.filter(arg => arg !== '--');
  let dryRun = false;
  const positional = [];

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    positional.push(arg);
  }

  const [mode, ...rest] = positional;
  if (mode === 'submodule') {
    if (rest.length !== 2) {
      throw new Error('Usage: new-module submodule <ui|hardware> <name> [--dry-run]');
    }
    return { mode, targetPkg: rest[0], name: rest[1], dryRun };
  }

  if (mode === 'package') {
    if (rest.length !== 1) {
      throw new Error('Usage: new-module package <name> [--dry-run]');
    }
    return { mode, targetPkg: undefined, name: rest[0], dryRun };
  }

  throw new Error('Specify scaffold mode "submodule" or "package". Run with --help for usage.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = readArguments(process.argv.slice(2));
    const result = await scaffoldModule(options);

    console.log(result.dryRun ? '[DRY RUN] Planned changes (no files modified):' : 'Scaffold complete:');
    for (const op of result.operations) {
      console.log(`  ${op.action.toUpperCase().padEnd(9)} ${op.relativePath}`);
      if (result.dryRun && op.action !== 'unchanged') {
        console.log('  --- preview ---');
        for (const line of op.content.trimEnd().split(/\r?\n/)) {
          console.log(`  | ${line}`);
        }
      }
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
