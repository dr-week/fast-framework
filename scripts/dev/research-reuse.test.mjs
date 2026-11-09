import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { researchReuse } from './research-reuse.mjs';

let temporaryRoot;

afterEach(async () => {
  if (temporaryRoot) await rm(temporaryRoot, { recursive: true, force: true });
  temporaryRoot = undefined;
});

describe('reuse research', () => {
  it('ranks reusable source candidates while excluding private and generated paths', async () => {
    temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'zuari-reuse-'));
    const root = path.join(temporaryRoot, 'mm');
    await mkdir(path.join(root, 'scripts', 'dev'), { recursive: true });
    await mkdir(path.join(root, 'data'), { recursive: true });
    await mkdir(path.join(root, 'stock-signal-bot'), { recursive: true });
    await mkdir(path.join(root, 'node_modules', 'theme-lib'), { recursive: true });
    await writeFile(path.join(root, 'scripts', 'dev', 'theme-audit.py'), 'def audit_theme_tokens():\n    return True\n');
    await writeFile(path.join(root, 'data', 'theme-report.md'), 'theme audit private data');
    await writeFile(path.join(root, 'stock-signal-bot', 'theme-audit.py'), 'def audit_theme_tokens():\n    return True\n');
    await writeFile(path.join(root, 'node_modules', 'theme-lib', 'index.ts'), 'export const themeAudit = true;');
    await writeFile(path.join(root, 'local_credentials.md'), 'theme audit credentials');

    const candidates = await researchReuse({ roots: [root], query: 'theme audit', limit: 10 });

    expect(candidates.map(candidate => candidate.path)).toEqual(['mm/scripts/dev/theme-audit.py']);
    expect(candidates[0]).toMatchObject({ root: 'mm', extension: '.py', lines: 2 });
  });

  it('requires an explicit root and rejects punctuation-only queries', async () => {
    await expect(researchReuse()).rejects.toThrow('at least one source root');
    await expect(researchReuse({ roots: [os.tmpdir()], query: '---' })).rejects.toThrow('searchable word');
  });
});
