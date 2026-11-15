import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runDoctor } from './doctor.mjs';
import { scaffoldModule } from './new-module.mjs';
import { syncAiRules } from './sync-ai-rules.mjs';
import {
  getPackageInfo,
  listPackages,
  listPresets,
  updateTargetPackages
} from './zuari-pkg.mjs';

const REQUIRED_DOC_FILES = [
  'docs/README.md',
  'docs/architecture/01-modular-monorepo.md',
  'docs/architecture/02-package-management-cli.md',
  'docs/design-system/01-apple-liquid-glass.md',
  'docs/design-system/02-contrasting-boxiness-and-planes.md',
  'docs/ai-workflow/01-agent-automation-and-subagents.md',
  'docs/automation/01-dev-scripts-guide.md'
];

const CANONICAL_AGENTS_CONTENT = [
  '# AGENTS.md',
  'Contrasting Boxiness',
  '5-Plane Placement Matrix',
  '@zuari/glyphs',
  ''
].join('\n');

const tempRoots = [];

async function createTempWorkspace(prefix) {
  const dir = await mkdtemp(path.join(os.tmpdir(), prefix));
  tempRoots.push(dir);
  return dir;
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

async function writeText(filePath, content) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, 'utf8');
}

async function writeJson(filePath, data) {
  await writeText(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

async function seedValidDoctorWorkspace(root) {
  await writeText(path.join(root, 'AGENTS.md'), CANONICAL_AGENTS_CONTENT);
  await writeText(path.join(root, 'CLAUDE.md'), CANONICAL_AGENTS_CONTENT);
  await writeText(path.join(root, '.cursorrules'), CANONICAL_AGENTS_CONTENT);
  await writeText(path.join(root, 'llms.txt'), '# Zuari\n');
  await writeText(path.join(root, 'llms-full.txt'), '# Zuari Full\n');

  for (const relDocPath of REQUIRED_DOC_FILES) {
    await writeText(path.join(root, relDocPath), `# ${relDocPath}\n`);
  }

  const paritySpecs = [
    { folder: 'ui', subdirs: ['button'] },
    { folder: 'hardware', subdirs: ['drone'] },
    { folder: 'headless', subdirs: ['dialog', 'drawer'] }
  ];

  for (const spec of paritySpecs) {
    const exportsMap = {
      '.': {
        types: './dist/index.d.ts',
        import: './dist/index.js'
      }
    };
    for (const subdir of spec.subdirs) {
      exportsMap[`./${subdir}`] = {
        types: `./dist/${subdir}/index.d.ts`,
        import: `./dist/${subdir}/index.js`
      };
      await writeText(
        path.join(root, 'packages', spec.folder, 'src', subdir, 'index.ts'),
        `export const ${subdir}Ready = true;\n`
      );
    }

    await writeJson(path.join(root, 'packages', spec.folder, 'package.json'), {
      name: `@zuari/${spec.folder}`,
      version: '0.1.0',
      type: 'module',
      sideEffects: false,
      files: ['dist'],
      exports: exportsMap
    });
  }
}

afterEach(async () => {
  while (tempRoots.length > 0) {
    const dir = tempRoots.pop();
    await rm(dir, { recursive: true, force: true });
  }
});

describe('scripts/zuari-pkg.mjs', () => {
  it('lists workspace packages sorted by folder and ignores folders without package.json', async () => {
    const root = await createTempWorkspace('zuari-pkg-list-');

    await writeJson(path.join(root, 'packages', 'ui', 'package.json'), {
      name: '@zuari/ui',
      version: '0.1.0',
      description: 'UI components',
      sideEffects: false,
      exports: {
        '.': { types: './dist/index.d.ts', import: './dist/index.js' },
        './button': { types: './dist/button/index.d.ts', import: './dist/button/index.js' }
      }
    });
    await writeJson(path.join(root, 'packages', 'recipes', 'package.json'), {
      name: '@zuari/recipes',
      version: '0.1.0',
      description: 'Scoped CSS recipes',
      sideEffects: ['./styles/**/*.css'],
      main: './styles/index.css',
      exports: {
        './aether.css': './styles/index.css'
      }
    });
    await mkdir(path.join(root, 'packages', 'scratch-empty'), { recursive: true });

    const packages = await listPackages({ root });

    expect(packages.map(pkg => pkg.folder)).toEqual(['recipes', 'ui']);
    expect(packages[0]).toMatchObject({
      folder: 'recipes',
      dir: 'packages/recipes',
      name: '@zuari/recipes',
      sideEffectsLabel: 'patterns(1)',
      exportsCount: 1,
      main: './styles/index.css'
    });
    expect(packages[1]).toMatchObject({
      folder: 'ui',
      dir: 'packages/ui',
      name: '@zuari/ui',
      sideEffectsLabel: 'false',
      exportsCount: 2
    });
    expect(packages[1].subpaths.map(entry => entry.specifier)).toEqual([
      '@zuari/ui',
      '@zuari/ui/button'
    ]);
  });

  it('resolves package info by folder name or scoped npm name and rejects unknown queries', async () => {
    const root = await createTempWorkspace('zuari-pkg-info-');

    await writeJson(path.join(root, 'packages', 'headless', 'package.json'), {
      name: '@zuari/headless',
      version: '0.1.0',
      dependencies: { '@zuari/signals': 'workspace:*' },
      exports: {
        '.': { types: './dist/index.d.ts', import: './dist/index.js' },
        './dialog': { types: './dist/dialog/index.d.ts', import: './dist/dialog/index.js' }
      }
    });

    const byFolder = await getPackageInfo('headless', { root });
    const byScopedName = await getPackageInfo('@zuari/headless', { root });

    expect(byFolder).toEqual(byScopedName);
    expect(byFolder.name).toBe('@zuari/headless');
    expect(byFolder.dependencies).toEqual({ '@zuari/signals': 'workspace:*' });
    expect(byFolder.subpaths.map(item => item.specifier)).toEqual([
      '@zuari/headless',
      '@zuari/headless/dialog'
    ]);

    await expect(getPackageInfo('nonexistent', { root })).rejects.toThrow('Unknown Zuari package');
    await expect(getPackageInfo('  ', { root })).rejects.toThrow('Provide a package name');
  });

  it('returns curated presets as defensive copies', () => {
    const presets = listPresets();

    expect(presets.map(preset => preset.id)).toEqual([
      'minimal-core',
      'ui-liquid-glass',
      'spatial-hud',
      'tactical-hardware',
      'ai-local-first'
    ]);
    for (const preset of presets) {
      expect(preset.packages.length).toBeGreaterThan(0);
      expect(preset.command).toBe(`pnpm run zuari:pkg add ${preset.packages.join(' ')}`);
    }

    presets[0].packages.push('@zuari/tampered');
    expect(listPresets()[0].packages).not.toContain('@zuari/tampered');
  });

  it('adds and removes workspace dependencies in a temp target package.json', async () => {
    const root = await createTempWorkspace('zuari-pkg-mutate-');

    for (const name of ['signals', 'ui', 'headless']) {
      await writeJson(path.join(root, 'packages', name, 'package.json'), {
        name: `@zuari/${name}`,
        version: '0.1.0',
        exports: { '.': './dist/index.js' }
      });
    }

    const targetManifestPath = path.join(root, 'apps', 'demo', 'package.json');
    await writeJson(targetManifestPath, {
      name: 'demo-app',
      private: true,
      dependencies: {
        lucide: '^1.0.0'
      }
    });

    const addResult = await updateTargetPackages({
      root,
      targetDir: 'apps/demo',
      action: 'add',
      packages: ['ui', '@zuari/signals']
    });

    expect(addResult.action).toBe('add');
    expect(addResult.packages).toEqual(['@zuari/ui', '@zuari/signals']);
    expect(addResult.changed).toEqual(['@zuari/ui', '@zuari/signals']);
    expect(Object.keys(addResult.dependencies)).toEqual([
      '@zuari/signals',
      '@zuari/ui',
      'lucide'
    ]);

    const afterAdd = JSON.parse(await readFile(targetManifestPath, 'utf8'));
    expect(afterAdd.dependencies).toEqual({
      '@zuari/signals': 'workspace:*',
      '@zuari/ui': 'workspace:*',
      lucide: '^1.0.0'
    });

    const idempotentAdd = await updateTargetPackages({
      root,
      targetDir: 'apps/demo',
      action: 'add',
      packages: ['@zuari/ui']
    });
    expect(idempotentAdd.changed).toEqual([]);

    const removeResult = await updateTargetPackages({
      root,
      targetDir: 'apps/demo',
      action: 'remove',
      packages: ['@zuari/ui', 'headless']
    });

    expect(removeResult.action).toBe('remove');
    expect(removeResult.changed).toEqual(['@zuari/ui']);
    expect(removeResult.dependencies).toEqual({
      '@zuari/signals': 'workspace:*',
      lucide: '^1.0.0'
    });

    const afterRemove = JSON.parse(await readFile(targetManifestPath, 'utf8'));
    expect(afterRemove.dependencies).toEqual({
      '@zuari/signals': 'workspace:*',
      lucide: '^1.0.0'
    });

    await expect(
      updateTargetPackages({ root, targetDir: 'apps/demo', action: 'replace', packages: ['ui'] })
    ).rejects.toThrow('Unsupported action');
    await expect(
      updateTargetPackages({ root, targetDir: 'apps/missing', action: 'add', packages: ['ui'] })
    ).rejects.toThrow('Target package.json not found');
  });
});

describe('scripts/doctor.mjs', () => {
  it('passes on a valid synthetic workspace with ui, hardware, and headless parity', async () => {
    const root = await createTempWorkspace('zuari-doctor-pass-');
    await seedValidDoctorWorkspace(root);

    const report = await runDoctor({ root });

    expect(report.ok).toBe(true);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.stats).toEqual({
      packagesScanned: 3,
      manifestsParsed: 3,
      parityPackagesChecked: 3,
      aiFilesChecked: 5,
      aiFilesPresent: 5,
      docsChecked: 7,
      docsPresent: 7,
      errorCount: 0,
      warningCount: 0
    });
  });

  it('exempts VS Code extensions from main-only exports warning while keeping files and non-VS Code warnings', async () => {
    const root = await createTempWorkspace('zuari-doctor-vscode-');
    await seedValidDoctorWorkspace(root);

    await writeJson(path.join(root, 'packages', 'vscode-zuari', 'package.json'), {
      name: 'vscode-zuari',
      version: '0.1.0',
      engines: { vscode: '^1.85.0' },
      main: './dist/extension.js',
      files: ['dist']
    });
    await writeJson(path.join(root, 'packages', 'legacy-pkg', 'package.json'), {
      name: '@zuari/legacy-pkg',
      version: '0.1.0',
      type: 'module',
      main: './dist/index.js',
      files: ['dist']
    });

    const cleanVscodeReport = await runDoctor({ root });

    expect(cleanVscodeReport.ok).toBe(true);
    expect(cleanVscodeReport.errors).toEqual([]);
    expect(cleanVscodeReport.warnings).toEqual([
      'packages/legacy-pkg: uses "main"-only manifest without modern "exports" map.'
    ]);

    await writeJson(path.join(root, 'packages', 'vscode-zuari', 'package.json'), {
      name: 'vscode-zuari',
      version: '0.1.0',
      engines: { vscode: '^1.85.0' },
      main: './dist/extension.js'
    });

    const missingFilesReport = await runDoctor({ root });

    expect(missingFilesReport.ok).toBe(true);
    expect(missingFilesReport.warnings).toContain(
      'packages/vscode-zuari: missing "files" whitelist in package.json.'
    );
    expect(
      missingFilesReport.warnings.some(msg => msg.includes('vscode-zuari') && msg.includes('exports'))
    ).toBe(false);
  });

  it('catches bidirectional subpath export parity mismatches on headless', async () => {
    const root = await createTempWorkspace('zuari-doctor-parity-');
    await seedValidDoctorWorkspace(root);

    // Add src/combobox/index.ts without "./combobox" in package.json#exports,
    // and add "./orphan" in package.json#exports without src/orphan/index.ts.
    await writeText(
      path.join(root, 'packages', 'headless', 'src', 'combobox', 'index.ts'),
      'export const createCombobox = () => ({});\n'
    );
    const headlessManifestPath = path.join(root, 'packages', 'headless', 'package.json');
    const headlessManifest = JSON.parse(await readFile(headlessManifestPath, 'utf8'));
    headlessManifest.exports['./orphan'] = {
      types: './dist/orphan/index.d.ts',
      import: './dist/orphan/index.js'
    };
    await writeJson(headlessManifestPath, headlessManifest);

    const report = await runDoctor({ root });

    expect(report.ok).toBe(false);
    expect(report.errors).toContain(
      'packages/headless: src/combobox/index.ts exists but "./combobox" is missing from package.json#exports.'
    );
    expect(report.errors).toContain(
      'packages/headless: package.json#exports defines "./orphan" without a matching src/orphan/index.ts.'
    );
  });
});

describe('scripts/sync-ai-rules.mjs', () => {
  it('fails checkOnly on drift, syncs target files, and passes idempotently on re-check', async () => {
    const root = await createTempWorkspace('zuari-sync-rules-');
    await writeText(path.join(root, 'AGENTS.md'), CANONICAL_AGENTS_CONTENT);
    await writeText(path.join(root, 'llms.txt'), '# llms\n');
    await writeText(path.join(root, 'llms-full.txt'), '# llms-full\n');
    await writeText(path.join(root, 'CLAUDE.md'), '# outdated claude rules\n');

    const checkFailed = await syncAiRules({ root, checkOnly: true });

    expect(checkFailed.ok).toBe(false);
    expect(checkFailed.checkOnly).toBe(true);
    expect(checkFailed.inSync).toEqual([]);
    expect(checkFailed.updated).toEqual([]);
    expect(checkFailed.outOfSync).toEqual([
      { file: 'CLAUDE.md', reason: 'differs from AGENTS.md' },
      { file: '.cursorrules', reason: 'missing' }
    ]);
    expect(await readFile(path.join(root, 'CLAUDE.md'), 'utf8')).toBe('# outdated claude rules\n');
    expect(await pathExists(path.join(root, '.cursorrules'))).toBe(false);

    const synced = await syncAiRules({ root, checkOnly: false });

    expect(synced.ok).toBe(true);
    expect(synced.updated).toEqual(['CLAUDE.md', '.cursorrules']);
    expect(await readFile(path.join(root, 'CLAUDE.md'), 'utf8')).toBe(CANONICAL_AGENTS_CONTENT);
    expect(await readFile(path.join(root, '.cursorrules'), 'utf8')).toBe(CANONICAL_AGENTS_CONTENT);

    const recheck = await syncAiRules({ root, checkOnly: true });

    expect(recheck.ok).toBe(true);
    expect(recheck.inSync).toEqual(['CLAUDE.md', '.cursorrules']);
    expect(recheck.outOfSync).toEqual([]);
    expect(recheck.updated).toEqual([]);
  });

  it('rejects incomplete AGENTS.md or missing llms context files', async () => {
    const root = await createTempWorkspace('zuari-sync-invalid-');
    await writeText(path.join(root, 'AGENTS.md'), '# Incomplete rules\n');
    await writeText(path.join(root, 'llms.txt'), '# llms\n');
    await writeText(path.join(root, 'llms-full.txt'), '# llms-full\n');

    await expect(syncAiRules({ root, checkOnly: true })).rejects.toThrow(
      'missing required core section(s)/term(s)'
    );

    await writeText(path.join(root, 'AGENTS.md'), CANONICAL_AGENTS_CONTENT);
    await rm(path.join(root, 'llms-full.txt'));

    await expect(syncAiRules({ root, checkOnly: true })).rejects.toThrow(
      'Missing required AI context file: llms-full.txt'
    );
  });
});

describe('scripts/new-module.mjs', () => {
  it('plans submodule and package scaffolds in dryRun mode without writing files', async () => {
    const root = await createTempWorkspace('zuari-new-dry-');
    const uiManifestPath = path.join(root, 'packages', 'ui', 'package.json');
    const uiBarrelPath = path.join(root, 'packages', 'ui', 'src', 'index.ts');
    const originalManifest = {
      name: '@zuari/ui',
      version: '0.1.0',
      type: 'module',
      exports: {
        '.': { types: './dist/index.d.ts', import: './dist/index.js' }
      }
    };
    const originalBarrel = "export * from './button/index.js';\n";

    await writeJson(uiManifestPath, originalManifest);
    await writeText(uiBarrelPath, originalBarrel);

    const submodulePlan = await scaffoldModule({
      root,
      mode: 'submodule',
      targetPkg: 'ui',
      name: 'accordion',
      dryRun: true
    });

    expect(submodulePlan.dryRun).toBe(true);
    expect(submodulePlan.mode).toBe('submodule');
    expect(submodulePlan.targetPkg).toBe('ui');
    expect(submodulePlan.operations.map(op => [op.action, op.relativePath])).toEqual([
      ['create', 'packages/ui/src/accordion/index.ts'],
      ['update', 'packages/ui/src/index.ts'],
      ['update', 'packages/ui/package.json']
    ]);
    expect(await pathExists(path.join(root, 'packages', 'ui', 'src', 'accordion', 'index.ts'))).toBe(false);
    expect(await readFile(uiBarrelPath, 'utf8')).toBe(originalBarrel);
    expect(JSON.parse(await readFile(uiManifestPath, 'utf8'))).toEqual(originalManifest);

    const packagePlan = await scaffoldModule({
      root,
      mode: 'package',
      name: 'telemetry',
      dryRun: true
    });

    expect(packagePlan.dryRun).toBe(true);
    expect(packagePlan.mode).toBe('package');
    expect(packagePlan.targetPkg).toBeNull();
    expect(packagePlan.operations.map(op => [op.action, op.relativePath])).toEqual([
      ['create', 'packages/telemetry/package.json'],
      ['create', 'packages/telemetry/tsconfig.json'],
      ['create', 'packages/telemetry/src/index.ts'],
      ['create', 'packages/telemetry/src/telemetry.test.ts']
    ]);
    expect(await pathExists(path.join(root, 'packages', 'telemetry'))).toBe(false);
  });

  it('scaffolds submodule and package files when dryRun is false', async () => {
    const root = await createTempWorkspace('zuari-new-write-');
    const hwManifestPath = path.join(root, 'packages', 'hardware', 'package.json');
    const hwBarrelPath = path.join(root, 'packages', 'hardware', 'src', 'index.ts');

    await writeJson(hwManifestPath, {
      name: '@zuari/hardware',
      version: '0.1.0',
      type: 'module',
      exports: {
        '.': { types: './dist/index.d.ts', import: './dist/index.js' }
      }
    });
    await writeText(hwBarrelPath, "export * from './drone/index.js';\n");

    const submoduleResult = await scaffoldModule({
      root,
      mode: 'submodule',
      targetPkg: 'hardware',
      name: 'lidar',
      dryRun: false
    });

    expect(submoduleResult.dryRun).toBe(false);
    const lidarEntry = await readFile(
      path.join(root, 'packages', 'hardware', 'src', 'lidar', 'index.ts'),
      'utf8'
    );
    expect(lidarEntry).toContain('export function createLidar');
    expect(await readFile(hwBarrelPath, 'utf8')).toContain("export * from './lidar/index.js';");

    const updatedHwManifest = JSON.parse(await readFile(hwManifestPath, 'utf8'));
    expect(updatedHwManifest.exports['./lidar']).toEqual({
      types: './dist/lidar/index.d.ts',
      import: './dist/lidar/index.js'
    });

    const packageResult = await scaffoldModule({
      root,
      mode: 'package',
      name: 'telemetry-hud',
      dryRun: false
    });

    expect(packageResult.dryRun).toBe(false);
    const pkgManifest = JSON.parse(
      await readFile(path.join(root, 'packages', 'telemetry-hud', 'package.json'), 'utf8')
    );
    expect(pkgManifest).toMatchObject({
      name: '@zuari/telemetry-hud',
      type: 'module',
      sideEffects: false,
      files: ['dist'],
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js'
        }
      }
    });
    expect(await pathExists(path.join(root, 'packages', 'telemetry-hud', 'tsconfig.json'))).toBe(true);
    expect(
      await readFile(path.join(root, 'packages', 'telemetry-hud', 'src', 'index.ts'), 'utf8')
    ).toContain('export function createTelemetryHud');
    expect(
      await readFile(path.join(root, 'packages', 'telemetry-hud', 'src', 'telemetry-hud.test.ts'), 'utf8')
    ).toContain("describe('@zuari/telemetry-hud'");

    await expect(
      scaffoldModule({ root, mode: 'package', name: 'BadName', dryRun: true })
    ).rejects.toThrow('Invalid module name');
    await expect(
      scaffoldModule({ root, mode: 'submodule', targetPkg: 'unknown', name: 'valid-mod', dryRun: true })
    ).rejects.toThrow('Unsupported submodule package');
  });
});
