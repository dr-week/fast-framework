import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PRESETS = Object.freeze([
  {
    id: 'minimal-core',
    description: 'Ultra-lightweight (<2.5 KB) TC39 Signals and direct-to-DOM template compiler',
    packages: ['@zuari/signals', '@zuari/dom']
  },
  {
    id: 'ui-liquid-glass',
    description: 'Accessible UI primitives, OKLCH tokens, recipes, presets, and vector glyphs',
    packages: [
      '@zuari/signals',
      '@zuari/dom',
      '@zuari/tokens',
      '@zuari/headless',
      '@zuari/recipes',
      '@zuari/glyphs',
      '@zuari/presets',
      '@zuari/ui'
    ]
  },
  {
    id: 'spatial-hud',
    description: '120 FPS WebXR spatial anchors, gaze/haptics, WebGPU signals, and zero-copy Wasm',
    packages: [
      '@zuari/signals',
      '@zuari/dom',
      '@zuari/spatial',
      '@zuari/wasm',
      '@zuari/webgpu'
    ]
  },
  {
    id: 'tactical-hardware',
    description: 'Ballistic optics, drone MAVLink/CRSF OSDs, rotary/D-Pad controls, and waveguide/E-Ink displays',
    packages: ['@zuari/signals', '@zuari/dom', '@zuari/hardware', '@zuari/tokens']
  },
  {
    id: 'ai-local-first',
    description: 'On-device WebNN / window.ai token streaming, local-first CRDT sync, and Navigation v2 router',
    packages: ['@zuari/signals', '@zuari/dom', '@zuari/ai', '@zuari/sync', '@zuari/router']
  }
]);

function detectJsonFormat(rawText) {
  const eol = rawText.includes('\r\n') ? '\r\n' : '\n';
  const hasTrailingNewline = /\r?\n$/.test(rawText);
  return { eol, hasTrailingNewline };
}

function serializeJson(data, { eol = '\n', hasTrailingNewline = true } = {}) {
  const body = JSON.stringify(data, null, 2).replace(/\n/g, eol);
  return hasTrailingNewline ? `${body}${eol}` : body;
}

function collectSubpathImports(pkg) {
  const name = pkg.name ?? '';
  if (pkg.exports && typeof pkg.exports === 'object' && !Array.isArray(pkg.exports)) {
    return Object.entries(pkg.exports).map(([exportKey, target]) => {
      const specifier = exportKey === '.'
        ? name
        : `${name}/${exportKey.replace(/^\.\//, '')}`;
      return { exportKey, specifier, target };
    });
  }
  if (typeof pkg.exports === 'string') {
    return [{ exportKey: '.', specifier: name, target: pkg.exports }];
  }
  if (pkg.main) {
    return [{ exportKey: '.', specifier: name, target: pkg.main }];
  }
  return [];
}

function formatSideEffects(value) {
  if (value === undefined) return 'unset';
  if (Array.isArray(value)) return `patterns(${value.length})`;
  return String(value);
}

/**
 * Scans `packages/<name>/package.json` across the workspace and returns normalized metadata.
 */
export async function listPackages({ root = ROOT } = {}) {
  const packagesDir = path.resolve(root, 'packages');
  const entries = await readdir(packagesDir, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  const packages = [];
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const manifestPath = path.join(packagesDir, entry.name, 'package.json');
    let raw;
    try {
      raw = await readFile(manifestPath, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }

    const manifest = JSON.parse(raw);
    const subpaths = collectSubpathImports(manifest);
    const exportsCount = manifest.exports && typeof manifest.exports === 'object'
      ? Object.keys(manifest.exports).length
      : (typeof manifest.exports === 'string' ? 1 : 0);

    packages.push({
      folder: entry.name,
      dir: path.join('packages', entry.name).split(path.sep).join('/'),
      name: manifest.name ?? entry.name,
      version: manifest.version ?? '0.0.0',
      description: manifest.description ?? '',
      sideEffects: manifest.sideEffects,
      sideEffectsLabel: formatSideEffects(manifest.sideEffects),
      exportsCount,
      subpaths,
      main: manifest.main ?? null,
      types: manifest.types ?? null,
      dependencies: manifest.dependencies ?? {},
      exports: manifest.exports ?? null
    });
  }

  return packages;
}

/**
 * Resolves a package by folder name (e.g. `ui`) or npm name (e.g. `@zuari/ui`).
 */
export async function getPackageInfo(identifier, { root = ROOT } = {}) {
  if (typeof identifier !== 'string' || !identifier.trim()) {
    throw new TypeError('Provide a package name (e.g. "ui" or "@zuari/ui").');
  }

  const query = identifier.trim();
  const packages = await listPackages({ root });
  const match = packages.find(pkg => (
    pkg.folder === query
    || pkg.name === query
    || (!query.startsWith('@') && pkg.name === `@zuari/${query}`)
  ));

  if (!match) {
    throw new Error(`Unknown Zuari package: "${query}". Run "pnpm run zuari:pkg list" to see available packages.`);
  }

  return match;
}

/**
 * Returns curated modular installation presets for common Zuari workloads.
 */
export function listPresets() {
  return PRESETS.map(preset => ({
    ...preset,
    packages: [...preset.packages],
    command: `pnpm run zuari:pkg add ${preset.packages.join(' ')}`
  }));
}

/**
 * Adds or removes workspace package dependencies in `<targetDir>/package.json`.
 */
export async function updateTargetPackages({
  root = ROOT,
  targetDir = 'playground',
  action,
  packages
} = {}) {
  if (action !== 'add' && action !== 'remove') {
    throw new TypeError(`Unsupported action "${action}". Expected "add" or "remove".`);
  }
  if (!Array.isArray(packages) || packages.length === 0) {
    throw new TypeError(`Provide at least one package name to ${action}.`);
  }

  // Resolve every package identifier before mutating the target manifest.
  const resolved = [];
  for (const identifier of packages) {
    resolved.push(await getPackageInfo(identifier, { root }));
  }

  const targetPath = path.resolve(root, targetDir, 'package.json');
  let rawTarget;
  try {
    rawTarget = await readFile(targetPath, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Target package.json not found: ${targetPath}`);
    }
    throw error;
  }

  const format = detectJsonFormat(rawTarget);
  const manifest = JSON.parse(rawTarget);
  const currentDeps = (manifest.dependencies && typeof manifest.dependencies === 'object')
    ? { ...manifest.dependencies }
    : {};

  const changed = [];
  for (const pkg of resolved) {
    if (action === 'add') {
      if (currentDeps[pkg.name] !== 'workspace:*') changed.push(pkg.name);
      currentDeps[pkg.name] = 'workspace:*';
    } else if (Object.prototype.hasOwnProperty.call(currentDeps, pkg.name)) {
      delete currentDeps[pkg.name];
      changed.push(pkg.name);
    }
  }

  const sortedDeps = {};
  for (const key of Object.keys(currentDeps).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))) {
    sortedDeps[key] = currentDeps[key];
  }

  if (Object.keys(sortedDeps).length > 0 || manifest.dependencies) {
    manifest.dependencies = sortedDeps;
  }

  await writeFile(targetPath, serializeJson(manifest, format), 'utf8');

  return {
    targetPath,
    action,
    packages: resolved.map(pkg => pkg.name),
    changed,
    dependencies: sortedDeps
  };
}

function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

function printTable(packages) {
  const rows = packages.map(pkg => ({
    folder: pkg.folder,
    name: pkg.name,
    version: pkg.version,
    exports: String(pkg.exportsCount),
    sideEffects: pkg.sideEffectsLabel,
    description: truncate(pkg.description || '-', 54)
  }));

  const headers = {
    folder: 'FOLDER',
    name: 'NPM NAME',
    version: 'VERSION',
    exports: 'EXPORTS',
    sideEffects: 'SIDE_EFFECTS',
    description: 'DESCRIPTION'
  };

  const columns = Object.keys(headers);
  const widths = {};
  for (const col of columns) {
    widths[col] = Math.max(
      headers[col].length,
      ...rows.map(row => row[col].length)
    );
  }

  const formatRow = row => columns
    .map(col => row[col].padEnd(widths[col]))
    .join('  ');

  console.log(formatRow(headers));
  console.log(columns.map(col => '-'.repeat(widths[col])).join('  '));
  for (const row of rows) {
    console.log(formatRow(row));
  }
}

function printUsage() {
  console.log([
    'Usage: node scripts/zuari-pkg.mjs <command> [options]',
    '',
    'Commands:',
    '  list                                List all @zuari/* workspace packages',
    '  info <pkg>                          Show dependencies and subpath exports for a package',
    '  presets                             List curated modular installation profiles',
    '  add <pkg...> [--target <dir>]       Add workspace dependencies (default target: playground)',
    '  remove <pkg...> [--target <dir>]    Remove workspace dependencies (default target: playground)'
  ].join('\n'));
}

function parseMutationArgs(args) {
  let targetDir = 'playground';
  const packages = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--target') {
      const value = args[index + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('--target requires a directory path.');
      }
      targetDir = value;
      index += 1;
      continue;
    }
    if (arg.startsWith('--target=')) {
      const value = arg.slice('--target='.length);
      if (!value) throw new Error('--target requires a directory path.');
      targetDir = value;
      continue;
    }
    if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    }
    packages.push(arg);
  }

  return { targetDir, packages };
}

async function runCli(rawArgs) {
  const args = rawArgs.filter(arg => arg !== '--');
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    return;
  }

  const [command, ...rest] = args;

  if (command === 'list') {
    if (rest.length > 0) throw new Error(`Unexpected arguments for list: ${rest.join(' ')}`);
    const packages = await listPackages();
    printTable(packages);
    console.log(`\nTotal packages: ${packages.length}`);
    return;
  }

  if (command === 'info') {
    if (rest.length !== 1) throw new Error('Usage: zuari-pkg info <pkg>');
    const info = await getPackageInfo(rest[0]);
    console.log(`${info.name} (${info.version}) [${info.dir}]`);
    console.log(`Description : ${info.description || '(none)'}`);
    console.log(`SideEffects : ${info.sideEffectsLabel}`);

    const depEntries = Object.entries(info.dependencies);
    console.log('Dependencies:');
    if (depEntries.length === 0) {
      console.log('  (none)');
    } else {
      for (const [dep, range] of depEntries) {
        console.log(`  - ${dep}: ${range}`);
      }
    }

    console.log('Subpath Imports:');
    if (info.subpaths.length === 0) {
      console.log('  (none)');
    } else {
      for (const entry of info.subpaths) {
        const target = typeof entry.target === 'string'
          ? entry.target
          : entry.target?.import ?? JSON.stringify(entry.target);
        console.log(`  - ${entry.specifier}  (${entry.exportKey} -> ${target})`);
      }
    }
    return;
  }

  if (command === 'presets') {
    if (rest.length > 0) throw new Error(`Unexpected arguments for presets: ${rest.join(' ')}`);
    const presets = listPresets();
    for (const preset of presets) {
      console.log(`[${preset.id}]`);
      console.log(`  ${preset.description}`);
      console.log(`  Packages: ${preset.packages.join(', ')}`);
      console.log(`  Usage   : ${preset.command}`);
      console.log('');
    }
    return;
  }

  if (command === 'add' || command === 'remove') {
    const { targetDir, packages } = parseMutationArgs(rest);
    const result = await updateTargetPackages({ action: command, packages, targetDir });
    const verb = command === 'add' ? 'Added/ensured' : 'Removed';
    console.log(`${verb} in ${path.relative(ROOT, result.targetPath).split(path.sep).join('/')}: ${result.packages.join(', ')}`);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await runCli(process.argv.slice(2));
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
