import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXCLUDED_DIRECTORIES = new Set([
  '.git', '.qodo', '.runtime', '.venv', '__pycache__', 'assets', 'backups',
  'build', 'coverage', 'data', 'dist', 'logs', 'node_modules', 'public',
  'target', 'vendor'
]);
const INCLUDED_EXTENSIONS = new Set([
  '.c', '.css', '.h', '.js', '.jsx', '.kt', '.md', '.mjs', '.py',
  '.rs', '.scss', '.sh', '.ts', '.tsx', '.zig'
]);
const SENSITIVE_FILE = /(?:^|[._-])(?:env|credentials?)(?:[._-]|$)|(?:secret|password|api[-_]?key)/i;
const DOMAIN_SPECIFIC_PATH = /(?:^|\/)(?:stock(?:[-_].*)?|paper[-_]?trading|trading|market[-_]?data|finance|portfolio|broker)(?:\/|$)|(?:^|\/)routes_(?:paper|scan)\.[^/]+$/i;
const DEFAULT_REUSE_TERMS = [
  'adapter', 'api', 'audit', 'contract', 'controller', 'docs', 'feature',
  'layout', 'module', 'palette', 'theme', 'token', 'validation', 'verify', 'workflow'
];
const TOKEN = /[a-z0-9]+(?:[._/-][a-z0-9]+)*/gi;

export async function researchReuse({
  roots,
  query = '',
  limit = 30,
  maxBytes = 1_000_000
} = {}) {
  if (!Array.isArray(roots) || roots.length === 0) {
    throw new TypeError('Provide at least one source root.');
  }
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError('limit must be a positive integer.');
  }
  if (!Number.isInteger(maxBytes) || maxBytes < 1) {
    throw new RangeError('maxBytes must be a positive integer.');
  }

  const queryTerms = new Set((query.match(TOKEN) ?? []).map(term => term.toLowerCase()));
  if (query && queryTerms.size === 0) {
    throw new TypeError('Query must include at least one searchable word.');
  }
  const searchTerms = queryTerms.size > 0 ? [...queryTerms] : DEFAULT_REUSE_TERMS;
  const candidates = [];

  for (const rootInput of roots) {
    const directory = path.resolve(rootInput);
    const rootStat = await stat(directory).catch(error => {
      if (error?.code === 'ENOENT') throw new Error(`Source root does not exist: ${directory}`);
      throw error;
    });
    if (!rootStat.isDirectory()) throw new TypeError(`Source root is not a directory: ${directory}`);

    await walk(directory, directory, path.basename(directory), searchTerms, maxBytes, candidates);
  }

  return candidates
    .sort((left, right) => right.score - left.score || left.path.localeCompare(right.path))
    .slice(0, limit);
}

async function walk(directory, root, label, terms, maxBytes, candidates) {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!EXCLUDED_DIRECTORIES.has(entry.name.toLowerCase())) {
        await walk(fullPath, root, label, terms, maxBytes, candidates);
      }
      continue;
    }

    if (!entry.isFile() || SENSITIVE_FILE.test(entry.name)) continue;
    const extension = path.extname(entry.name).toLowerCase();
    if (!INCLUDED_EXTENSIONS.has(extension)) continue;

    const relativePath = path.relative(root, fullPath).split(path.sep).join('/');
    if (DOMAIN_SPECIFIC_PATH.test(relativePath)) continue;

    const fileStat = await stat(fullPath);
    if (fileStat.size > maxBytes) continue;

    const contents = await readFile(fullPath, 'utf8');
    const haystack = `${relativePath}\n${contents}`.toLowerCase();
    const score = terms.reduce((total, term) => {
      const pathHits = (relativePath.toLowerCase().match(new RegExp(escapeRegExp(term), 'g')) ?? []).length;
      const contentHits = (haystack.match(new RegExp(escapeRegExp(term), 'g')) ?? []).length;
      return total + Math.min(pathHits * 3 + contentHits, 10);
    }, 0);

    if (score > 0) {
      const lineCount = contents.length === 0
        ? 0
        : contents.split(/\r\n|\n|\r/).length - (/\r\n$|\n$|\r$/.test(contents) ? 1 : 0);
      candidates.push({
        root: label,
        path: `${label}/${relativePath}`,
        extension,
        lines: lineCount,
        score
      });
    }
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readArguments(args) {
  const roots = [];
  let query = '';
  let limit = 30;

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--') continue;
    if (argument === '--help' || argument === '-h') {
      console.log('Usage: pnpm research:reuse -- --root <path> [--root <path>] [--query "theme workflow"] [--limit 30]');
      process.exit(0);
    }
    if (!['--root', '--query', '--limit'].includes(argument)) {
      throw new Error(`Unknown option: ${argument}`);
    }
    const value = args[index + 1];
    if (!value) throw new Error(`${argument} requires a value.`);

    if (argument === '--root') roots.push(value);
    else if (argument === '--query') query = value;
    else {
      limit = Number(value);
      if (!Number.isInteger(limit) || limit < 1) throw new Error('--limit must be a positive integer.');
    }
    index += 1;
  }

  return { roots, query, limit };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { roots, query, limit } = readArguments(process.argv.slice(2));
  const candidates = await researchReuse({ roots, query, limit });
  if (candidates.length === 0) {
    console.log('No reusable source candidates matched.');
  } else {
    for (const candidate of candidates) {
      console.log(`${String(candidate.score).padStart(3)}  ${String(candidate.lines).padStart(4)} lines  ${candidate.path}`);
    }
  }
  console.log('Read-only research: no files were copied. Review ownership, dependencies, and app-specific assumptions before adapting a candidate.');
}
