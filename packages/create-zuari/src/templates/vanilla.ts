import type { GeneratedFile } from '../types.js';

export function createVanillaTsFiles(projectName: string): GeneratedFile[] {
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
          '@zuari/tokens': '^0.1.0',
          '@zuari/presets': '^0.1.0'
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

    const mainTs = `import { signal, computed, effectScope, onMount } from '@zuari/signals';
import { html, render, repeat, when } from '@zuari/dom';

const count = signal(0);
const doubled = computed(() => count.value * 2);

const todos = signal([
  { id: 1, text: 'Install Zuari CLI' },
  { id: 2, text: 'Experience 0% Virtual DOM Velocity' },
  { id: 3, text: 'Ship Production Web App' }
]);

const scope = effectScope(() => {
  onMount(() => {
    console.log('⚡ [Zuari] App mounted with fine-grained reactivity.');
  });
});

const view = html\`
  <main style="font-family: system-ui, -apple-system, sans-serif; max-width: 640px; margin: 40px auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h1 style="margin-top: 0;">⚡ ${projectName}</h1>
    <p style="color: #666;">Built on <strong>Zuari</strong> — zero Virtual DOM, fine-grained TC39 Signals, pure W3C DOM Parts.</p>

    <div style="margin: 24px 0; padding: 16px; background: #fafafa; border-radius: 8px;">
      <button style="padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 6px; border: 1px solid #333; background: #222; color: #fff;" @click=\${() => { count.value++; }}>
        Clicked: \${count} times
      </button>
      <span style="margin-left: 16px; font-weight: 500;">Doubled: \${doubled}</span>
    </div>

    <h3>Keyed Checklist:</h3>
    <ul style="line-height: 1.8;">
      \${repeat(todos, item => item.id, item => html\`
        <li>\${item.text}</li>
      \`)}
    </ul>

    \${when(count, () => html\`
      <div style="margin-top: 20px; color: #2e7d32; font-weight: bold;">
        Awesome! Counter is active (\${count}).
      </div>
    \`)}
  </main>
\`;

const { fragment } = render(view);
document.getElementById('app')?.appendChild(fragment);
`;

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
