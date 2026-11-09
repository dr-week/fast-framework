import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SOURCE_ROOTS = ['packages', 'playground/src'];
const SOURCE_EXTENSIONS = new Set(['.c', '.h', '.js', '.jsx', '.kt', '.mjs', '.py', '.rs', '.scss', '.ts', '.tsx', '.zig']);
const EXCLUDED_DIRECTORIES = new Set(['.git', '.venv', 'build', 'coverage', 'dist', 'node_modules', 'target', 'vendor']);

export async function auditModules({
  root = ROOT,
  roots = SOURCE_ROOTS,
  threshold = 250,
  top = 30
} = {}) {
  if (!Number.isInteger(threshold) || threshold < 1) {
    throw new RangeError('threshold must be a positive integer.');
  }
  if (!Number.isInteger(top) || top < 1) {
    throw new RangeError('top must be a positive integer.');
  }

  const modules = [];
  for (const sourceRoot of roots) {
    await collectModules(path.resolve(root, sourceRoot), path.resolve(root), modules);
  }

  const candidates = modules
    .filter(module => module.lines >= threshold)
    .sort((left, right) => right.lines - left.lines || left.file.localeCompare(right.file))
    .slice(0, top);

  return { candidates, moduleCount: modules.length, threshold };
}

async function collectModules(directory, root, modules) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return;
    throw error;
  }

  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRECTORIES.has(entry.name)) {
        await collectModules(fullPath, root, modules);
      }
      continue;
    }

    if (!entry.isFile() || !SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
    const contents = await readFile(fullPath, 'utf8');
    const lines = contents.length === 0
      ? 0
      : contents.split(/\r\n|\n|\r/).length - (/\r\n$|\n$|\r$/.test(contents) ? 1 : 0);
    modules.push({ file: path.relative(root, fullPath).split(path.sep).join('/'), lines });
  }
}

function readArguments(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') {
      console.log('Usage: pnpm audit:modules [--threshold 250] [--top 30]');
      process.exit(0);
    }
    if (argument !== '--threshold' && argument !== '--top') {
      throw new Error(`Unknown option: ${argument}`);
    }
    const value = Number(args[index + 1]);
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`${argument} must be followed by a positive integer.`);
    }
    options[argument === '--threshold' ? 'threshold' : 'top'] = value;
    index += 1;
  }
  return options;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { candidates, moduleCount, threshold } = await auditModules(readArguments(process.argv.slice(2)));
  console.log(`Module-size candidates (threshold: ${threshold} lines; scanned: ${moduleCount})`);
  if (candidates.length === 0) {
    console.log('No source modules exceed the threshold.');
  } else {
    for (const { lines, file } of candidates) console.log(`${String(lines).padStart(5)}  ${file}`);
  }
  console.log('Review rule: split only when a module has an independent responsibility, dependency boundary, and focused test.');
}
