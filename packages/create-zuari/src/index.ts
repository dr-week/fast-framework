/**
 * @fileoverview Scaffolding generator engine for create-zuari CLI.
 */

import type { ScaffoldOptions, GeneratedFile, ZuariTemplate } from './types.js';

export function getTemplateFiles(projectName: string, template: ZuariTemplate = 'minimal'): GeneratedFile[] {
  const packageJson = JSON.stringify(
    {
      name: projectName,
      version: '0.1.0',
      private: true,
      type: 'module',
      scripts: {
        dev: 'vite',
        build: 'tsc && vite build',
        preview: 'vite preview'
      },
      dependencies: {
        '@zuari/core': '^0.1.0',
        '@zuari/signals': '^0.1.0',
        '@zuari/dom': '^0.1.0',
        '@zuari/ui': '^0.1.0',
        ...(template === 'spatial' ? { '@zuari/spatial': '^0.1.0' } : {}),
        ...(template === 'wasm' ? { '@zuari/wasm': '^0.1.0' } : {})
      },
      devDependencies: {
        typescript: '^5.9.0',
        vite: '^6.0.0'
      }
    },
    null,
    2
  );

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} • Zuari App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;

  let mainTs = '';
  if (template === 'spatial') {
    mainTs = `import { signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import { createSpatialAnchor, bindAnchorToElement } from '@zuari/spatial';

const active = signal(true);
const hud = createSpatialAnchor({ id: 'game-hud', initialPosition: { x: 0, y: 0.1, z: -1.0 } });

const view = html\`
  <div class="spatial-card">
    <h2>Zuari Spatial HUD</h2>
    <p>Status: <strong>\${() => (active.value ? 'ONLINE' : 'OFFLINE')}</strong></p>
    <button @click=\${() => { active.value = !active.value; }}>Toggle</button>
  </div>
\`;

const { fragment } = render(view);
const el = fragment.firstElementChild as HTMLElement;
bindAnchorToElement(hud, el);
document.getElementById('app')?.appendChild(fragment);
`;
  } else {
    mainTs = `import { signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';

const count = signal(0);

const view = html\`
  <main style="font-family: system-ui; padding: 32px; text-align: center;">
    <h1>⚡ Welcome to ${projectName}</h1>
    <p>Driven by <strong>Zuari</strong> — 0% Virtual DOM, raw tidal velocity.</p>
    <div style="margin-top: 24px;">
      <button style="padding: 10px 20px; font-size: 16px; cursor: pointer;" @click=\${() => { count.value++; }}>
        Counter: \${count}
      </button>
    </div>
  </main>
\`;

const { fragment } = render(view);
document.getElementById('app')?.appendChild(fragment);
`;
  }

  const tsconfig = JSON.stringify(
    {
      compilerOptions: {
        target: 'ESNext',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        strict: true,
        skipLibCheck: true
      },
      include: ['src/**/*']
    },
    null,
    2
  );

  return [
    { path: 'package.json', content: packageJson },
    { path: 'index.html', content: indexHtml },
    { path: 'tsconfig.json', content: tsconfig },
    { path: 'src/main.ts', content: mainTs }
  ];
}

export * from './types.js';
