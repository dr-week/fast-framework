import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const PARITY_PACKAGES = Object.freeze(['ui', 'hardware']);

const REQUIRED_AI_FILES = Object.freeze([
  'AGENTS.md',
  'CLAUDE.md',
  '.cursorrules',
  'llms.txt',
  'llms-full.txt'
]);

const REQUIRED_DOC_FILES = Object.freeze([
  'docs/README.md',
  'docs/architecture/01-modular-monorepo.md',
  'docs/architecture/02-package-management-cli.md',
  'docs/design-system/01-apple-liquid-glass.md',
  'docs/design-system/02-contrasting-boxiness-and-planes.md',
  'docs/ai-workflow/01-agent-automation-and-subagents.md',
  'docs/automation/01-dev-scripts-guide.md'
]);

async function isExistingFile(filePath) {
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

async function isExistingDirectory(dirPath) {
  try {
    const info = await stat(dirPath);
    return info.isDirectory();
  } catch {
    return false;
  }
}

async function checkRequiredFiles(root, relativePaths, categoryLabel, errors) {
  let presentCount = 0;
  for (const relPath of relativePaths) {
    const fullPath = path.resolve(root, relPath);
    if (await isExistingFile(fullPath)) {
      presentCount += 1;
    } else {
      errors.push(`Missing required ${categoryLabel} file: ${relPath}`);
    }
  }
  return presentCount;
}

async function checkSubpathParity(pkgDir, pkgName, manifest, errors) {
  const srcDir = path.join(pkgDir, 'src');
  if (!(await isExistingDirectory(srcDir))) {
    errors.push(`packages/${pkgName}: missing src/ directory for subpath export parity.`);
    return;
  }

  const entries = await readdir(srcDir, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  const srcSubdirs = new Set();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (await isExistingFile(path.join(srcDir, entry.name, 'index.ts'))) {
      srcSubdirs.add(entry.name);
    }
  }

  const exportsMap = (manifest.exports && typeof manifest.exports === 'object' && !Array.isArray(manifest.exports))
    ? manifest.exports
    : {};

  for (const subdir of srcSubdirs) {
    const expectedKey = `./${subdir}`;
    if (!Object.prototype.hasOwnProperty.call(exportsMap, expectedKey)) {
      errors.push(
        `packages/${pkgName}: src/${subdir}/index.ts exists but "${expectedKey}" is missing from package.json#exports.`
      );
    }
  }

  for (const exportKey of Object.keys(exportsMap)) {
    if (exportKey === '.') continue;
    if (!exportKey.startsWith('./')) {
      errors.push(`packages/${pkgName}: invalid subpath export key "${exportKey}" (expected "./<subdir>").`);
      continue;
    }
    const subdir = exportKey.slice(2);
    const expectedEntry = path.join(srcDir, subdir, 'index.ts');
    if (!(await isExistingFile(expectedEntry))) {
      errors.push(
        `packages/${pkgName}: package.json#exports defines "${exportKey}" without a matching src/${subdir}/index.ts.`
      );
    }
  }
}

/**
 * Audits workspace packages, subpath export parity, AI rule files, and documentation files.
 */
export async function runDoctor({ root = ROOT } = {}) {
  const resolvedRoot = path.resolve(root);
  const errors = [];
  const warnings = [];
  const manifestMap = new Map();

  const packagesDir = path.join(resolvedRoot, 'packages');
  let packageEntries = [];
  if (!(await isExistingDirectory(packagesDir))) {
    errors.push('Missing packages/ directory.');
  } else {
    packageEntries = (await readdir(packagesDir, { withFileTypes: true }))
      .filter(entry => entry.isDirectory())
      .sort((left, right) => left.name.localeCompare(right.name));
  }

  for (const entry of packageEntries) {
    const pkgDir = path.join(packagesDir, entry.name);
    const manifestPath = path.join(pkgDir, 'package.json');

    let raw;
    try {
      raw = await readFile(manifestPath, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') {
        errors.push(`packages/${entry.name}: missing package.json.`);
        continue;
      }
      throw error;
    }

    let manifest;
    try {
      manifest = JSON.parse(raw);
    } catch (error) {
      errors.push(`packages/${entry.name}: invalid JSON in package.json (${error.message}).`);
      continue;
    }

    manifestMap.set(entry.name, { pkgDir, manifest });

    if (typeof manifest.name !== 'string' || !manifest.name.trim()) {
      errors.push(`packages/${entry.name}: package.json is missing a valid "name".`);
    }

    const hasExports = Boolean(
      manifest.exports
      && (typeof manifest.exports === 'string'
        || (!Array.isArray(manifest.exports) && Object.keys(manifest.exports).length > 0))
    );
    const hasMain = typeof manifest.main === 'string' && manifest.main.trim().length > 0;

    if (!hasExports && !hasMain) {
      errors.push(`packages/${entry.name}: package.json is missing both "exports" and "main".`);
    }

    const isVscodeExtension = Boolean(manifest.engines?.vscode);
    if (!isVscodeExtension && manifest.type !== 'module') {
      errors.push(`packages/${entry.name}: missing "type": "module" (required for non-VS Code packages).`);
    }

    if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
      warnings.push(`packages/${entry.name}: missing "files" whitelist in package.json.`);
    }

    if (hasMain && !hasExports) {
      warnings.push(`packages/${entry.name}: uses "main"-only manifest without modern "exports" map.`);
    }
  }

  let parityPackagesChecked = 0;
  for (const pkgName of PARITY_PACKAGES) {
    const record = manifestMap.get(pkgName);
    if (!record) continue;
    parityPackagesChecked += 1;
    await checkSubpathParity(record.pkgDir, pkgName, record.manifest, errors);
  }

  const aiFilesPresent = await checkRequiredFiles(resolvedRoot, REQUIRED_AI_FILES, 'AI rule', errors);
  const docsPresent = await checkRequiredFiles(resolvedRoot, REQUIRED_DOC_FILES, 'documentation', errors);

  const stats = {
    packagesScanned: packageEntries.length,
    manifestsParsed: manifestMap.size,
    parityPackagesChecked,
    aiFilesChecked: REQUIRED_AI_FILES.length,
    aiFilesPresent,
    docsChecked: REQUIRED_DOC_FILES.length,
    docsPresent,
    errorCount: errors.length,
    warningCount: warnings.length
  };

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stats
  };
}

function printReport({ ok, errors, warnings, stats }) {
  console.log('Zuari Workspace Doctor');
  console.log('======================');

  console.log(`\nErrors (${errors.length}):`);
  if (errors.length === 0) {
    console.log('  (none)');
  } else {
    for (const error of errors) console.log(`  [ERROR] ${error}`);
  }

  console.log(`\nNotices / Warnings (${warnings.length}):`);
  if (warnings.length === 0) {
    console.log('  (none)');
  } else {
    for (const warning of warnings) console.log(`  [WARN]  ${warning}`);
  }

  console.log('\nStats:');
  console.log(`  Packages scanned     : ${stats.packagesScanned} (${stats.manifestsParsed} manifests parsed)`);
  console.log(`  Parity suites checked: ${stats.parityPackagesChecked} (${PARITY_PACKAGES.join(', ')})`);
  console.log(`  AI files present     : ${stats.aiFilesPresent}/${stats.aiFilesChecked}`);
  console.log(`  Doc files present    : ${stats.docsPresent}/${stats.docsChecked}`);
  console.log(`  Result               : ${ok ? 'PASS' : 'FAIL'}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2).filter(arg => arg !== '--');
    if (args.includes('--help') || args.includes('-h')) {
      console.log('Usage: node scripts/doctor.mjs');
    } else if (args.length > 0) {
      throw new Error(`Unknown option: ${args[0]}`);
    } else {
      const report = await runDoctor();
      printReport(report);
      if (!report.ok) process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
