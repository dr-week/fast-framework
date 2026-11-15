import { readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const CANONICAL_SOURCE = 'AGENTS.md';
const TARGET_FILES = Object.freeze(['CLAUDE.md', '.cursorrules']);
const REQUIRED_CONTEXT_FILES = Object.freeze(['llms.txt', 'llms-full.txt']);
const REQUIRED_CORE_TERMS = Object.freeze([
  'Contrasting Boxiness',
  '5-Plane Placement Matrix',
  '@zuari/glyphs'
]);

async function assertFileExists(filePath, label) {
  let info;
  try {
    info = await stat(filePath);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`Missing required AI context file: ${label}`);
    }
    throw error;
  }
  if (!info.isFile()) {
    throw new Error(`Expected regular file for AI context: ${label}`);
  }
}

/**
 * Validates `AGENTS.md` and `llms*.txt`, then checks or synchronizes `CLAUDE.md` and `.cursorrules`.
 */
export async function syncAiRules({ root = ROOT, checkOnly = false } = {}) {
  const resolvedRoot = path.resolve(root);
  const sourcePath = path.join(resolvedRoot, CANONICAL_SOURCE);

  await assertFileExists(sourcePath, CANONICAL_SOURCE);
  const canonicalBuffer = await readFile(sourcePath);
  const canonicalText = canonicalBuffer.toString('utf8');

  const missingTerms = REQUIRED_CORE_TERMS.filter(term => !canonicalText.includes(term));
  if (missingTerms.length > 0) {
    throw new Error(
      `${CANONICAL_SOURCE} is missing required core section(s)/term(s): ${missingTerms.join(', ')}`
    );
  }

  for (const contextFile of REQUIRED_CONTEXT_FILES) {
    await assertFileExists(path.join(resolvedRoot, contextFile), contextFile);
  }

  const inSync = [];
  const outOfSync = [];
  const updated = [];

  for (const targetFile of TARGET_FILES) {
    const targetPath = path.join(resolvedRoot, targetFile);
    let existingBuffer = null;
    try {
      existingBuffer = await readFile(targetPath);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }

    if (existingBuffer !== null && existingBuffer.equals(canonicalBuffer)) {
      inSync.push(targetFile);
      continue;
    }

    outOfSync.push({
      file: targetFile,
      reason: existingBuffer === null ? 'missing' : 'differs from AGENTS.md'
    });

    if (!checkOnly) {
      // Write exact canonical bytes to preserve EOL and keep subsequent runs idempotent.
      await writeFile(targetPath, canonicalBuffer);
      updated.push(targetFile);
    }
  }

  return {
    ok: checkOnly ? outOfSync.length === 0 : true,
    checkOnly,
    source: CANONICAL_SOURCE,
    requiredTermsVerified: [...REQUIRED_CORE_TERMS],
    contextFilesVerified: [...REQUIRED_CONTEXT_FILES],
    inSync,
    outOfSync,
    updated
  };
}

function readArguments(rawArgs) {
  const args = rawArgs.filter(arg => arg !== '--');
  let checkOnly = false;

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      console.log('Usage: node scripts/sync-ai-rules.mjs [--check]');
      process.exit(0);
    }
    if (arg === '--check') {
      checkOnly = true;
      continue;
    }
    throw new Error(`Unknown option: ${arg}`);
  }

  return { checkOnly };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { checkOnly } = readArguments(process.argv.slice(2));
    const result = await syncAiRules({ checkOnly });

    console.log(`Source verified: ${result.source} (${result.requiredTermsVerified.join(', ')})`);
    console.log(`LLM context verified: ${result.contextFilesVerified.join(', ')}`);

    if (result.inSync.length > 0) {
      console.log(`In sync: ${result.inSync.join(', ')}`);
    }

    if (result.outOfSync.length > 0) {
      if (checkOnly) {
        for (const item of result.outOfSync) {
          console.error(`Out of sync: ${item.file} (${item.reason})`);
        }
        console.error('Run "pnpm run sync:rules" to synchronize AI instruction files with AGENTS.md.');
        process.exitCode = 1;
      } else {
        console.log(`Synchronized: ${result.updated.join(', ')}`);
      }
    } else {
      console.log('All AI rule files are in sync.');
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  }
}
