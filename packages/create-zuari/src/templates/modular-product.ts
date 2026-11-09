import type { GeneratedFile } from '../types.js';
import { createProductApiFiles } from './modular-product/api.js';
import { createOverviewFeatureFiles } from './modular-product/overview.js';
import { createProductProjectFiles } from './modular-product/project.js';
import { createProductShellFiles } from './modular-product/shell.js';
import { createProductStylesFiles } from './modular-product/styles.js';

export function createModularProductFiles(projectName: string): GeneratedFile[] {
  return [
    ...createProductProjectFiles(projectName),
    ...createProductShellFiles(projectName),
    ...createProductApiFiles(),
    ...createOverviewFeatureFiles(),
    ...createProductStylesFiles(),
    { path: '.env.example', content: 'VITE_API_BASE_URL=http://127.0.0.1:8000\n' },
    { path: '.gitignore', content: 'node_modules\ndist\n.env\n.env.local\n' }
  ];
}
