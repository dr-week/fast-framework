import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EXCLUDED_DIRECTORIES = new Set(['.git', '.venv', 'build', 'coverage', 'dist', 'node_modules', 'target', 'vendor']);
const TOKEN = /[a-z0-9]+(?:[._/-][a-z0-9]+)*/gi;

export async function searchDocs(query, { root = ROOT, limit = 12 } = {}) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError('limit must be a positive integer.');
  }

  const terms = new Set((query.match(TOKEN) ?? []).map(term => term.toLowerCase()));
  if (terms.size === 0) {
    throw new TypeError('Query must include at least one searchable word.');
  }

  const files = [];
  await collectMarkdown(path.resolve(root), files);
  const results = [];

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    const lines = contents.split(/\r\n|\n|\r/);
    let bestMatch;

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index] ?? '';
      const lineTerms = new Set((line.match(TOKEN) ?? []).map(term => term.toLowerCase()));
      const score = [...terms].filter(term => lineTerms.has(term)).length;
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { score, line: index + 1, excerpt: line.trim().slice(0, 220) };
      }
    }

    if (bestMatch) {
      results.push({
        ...bestMatch,
        path: path.relative(root, file).split(path.sep).join('/')
      });
    }
  }

  return results
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
    .slice(0, limit);
}

async function collectMarkdown(directory, files) {
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
      if (!EXCLUDED_DIRECTORIES.has(entry.name)) await collectMarkdown(fullPath, files);
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.md') {
      files.push(fullPath);
    }
  }
}

function readArguments(args) {
  let query = '';
  let limit = 12;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--help' || argument === '-h') {
      console.log('Usage: pnpm docs:search --query "topic terms" [--limit 12]');
      process.exit(0);
    }
    if (argument === '--query' || argument === '--limit') {
      const value = args[index + 1];
      if (!value) throw new Error(`${argument} requires a value.`);
      if (argument === '--query') query = value;
      else {
        limit = Number(value);
        if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit must be a positive integer.');
      }
      index += 1;
      continue;
    }
    throw new Error(`Unknown option: ${argument}`);
  }
  if (!query) throw new Error('Provide --query with one or more search terms.');
  return { query, limit };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { query, limit } = readArguments(process.argv.slice(2));
  const results = await searchDocs(query, { limit });
  if (results.length === 0) {
    console.log('No documentation matched. Check docs and agent skills before starting new research.');
    process.exitCode = 1;
  } else {
    for (const { score, path: file, line, excerpt } of results) {
      console.log(`${file}:${line} (score ${score})`);
      console.log(`  ${excerpt}`);
    }
  }
}
