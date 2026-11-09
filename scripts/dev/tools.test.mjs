import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { auditModules } from './audit-modules.mjs';
import { searchDocs } from './search-docs.mjs';

let temporaryRoot;

afterEach(async () => {
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
  temporaryRoot = undefined;
});

describe('development tools', () => {
  it('reports oversized source files without treating line count as an automatic failure', async () => {
    temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'zuari-audit-'));
    await mkdir(path.join(temporaryRoot, 'packages', 'sample', 'src'), { recursive: true });
    await mkdir(path.join(temporaryRoot, 'packages', 'sample', 'dist'), { recursive: true });
    await writeFile(path.join(temporaryRoot, 'packages', 'sample', 'src', 'large.ts'), 'one\ntwo\nthree\n');
    await writeFile(path.join(temporaryRoot, 'packages', 'sample', 'dist', 'generated.ts'), 'a\nb\nc\nd');

    const report = await auditModules({ root: temporaryRoot, roots: ['packages'], threshold: 3, top: 5 });

    expect(report.moduleCount).toBe(1);
    expect(report.candidates).toEqual([{ file: 'packages/sample/src/large.ts', lines: 3 }]);
  });

  it('finds and ranks existing documentation without traversing generated folders', async () => {
    temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'zuari-docs-'));
    await mkdir(path.join(temporaryRoot, 'docs'), { recursive: true });
    await mkdir(path.join(temporaryRoot, 'node_modules', 'vendor-docs'), { recursive: true });
    await writeFile(path.join(temporaryRoot, 'docs', 'architecture.md'), '# Architecture\nModular feature boundaries and API contracts.');
    await writeFile(path.join(temporaryRoot, 'node_modules', 'vendor-docs', 'guide.md'), 'Modular feature boundaries and API contracts.');

    const results = await searchDocs('modular feature API contracts', { root: temporaryRoot });

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      path: 'docs/architecture.md',
      line: 2,
      score: 4
    });
  });

  it('rejects empty documentation queries', async () => {
    await expect(searchDocs('---')).rejects.toThrow('Query must include');
  });
});
