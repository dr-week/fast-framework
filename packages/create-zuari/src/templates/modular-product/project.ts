import type { GeneratedFile } from '../../types.js';

export function createProductProjectFiles(projectName: string): GeneratedFile[] {
const packageJson = JSON.stringify(
      {
        name: projectName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc --noEmit && vite build',
          preview: 'vite preview',
          test: 'vitest run'
        },
        dependencies: {
          '@zuari/dom': '^0.1.0',
          '@zuari/glyphs': '^0.1.0',
          '@zuari/presets': '^0.1.0',
          '@zuari/signals': '^0.1.0',
          '@zuari/ui': '^0.1.0'
        },
        devDependencies: {
          typescript: '^5.9.0',
          vite: '^6.0.0',
          vitest: '^5.0.5'
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
    <meta name="theme-color" content="#111827" />
    <title>${projectName}</title>
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;

const tsconfig = JSON.stringify(
      {
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          noEmit: true,
          skipLibCheck: true,
          types: ['vite/client']
        },
        include: ['src/**/*']
      },
      null,
      2
    );

const readme = `# ${projectName}

Feature-first Zuari product starter. It includes a shell, a sample feature boundary, typed API parsing, and explicit loading/empty/error states. It deliberately contains no fake business data or backend implementation.

## Run

\`\`\`sh
pnpm install
pnpm dev
\`\`\`

Set \`VITE_API_BASE_URL\` in a local \`.env.local\` when the API is hosted separately. The starter expects \`GET /api/overview\` to return an array of \`{ "id": string, "title": string, "summary": string }\` items. Update the parser and endpoint to match your real API contract. Run \`pnpm test\` before changing a contract.

## Module ownership

- \`src/app/\`: application shell, startup, navigation, and settings surface.
- \`src/features/<feature>/\`: feature state, user actions, and feature view; no transport-specific fetch logic.
- \`src/app/settings.ts\`: appearance settings composed from Zuari's built-in theme presets.
- \`src/api/\`: HTTP transport and runtime validation at the external-data boundary.
- \`src/styles.css\`: app-owned theme tokens and layout. Replace or extend them with \`@zuari/tokens\` and \`@zuari/recipes\` when needed.
- \`src/main.ts\`: boot only; keep product rules out of the entry point.

## Build the next feature without a planning detour

1. Write the feature's input/output contract and the unavailable/empty/error cases.
2. Add or update the runtime parser in \`src/api/contracts.ts\`.
3. Keep provider/backend calls behind \`src/api/client.ts\`; retain your existing backend and expose a small API rather than copying backend internals into the browser.
4. Put the feature's state/actions/view in its own \`src/features/<name>/\` folder.
5. Connect it in \`src/app/shell.ts\`; do not move domain calculations into the shell or renderer.
6. Add focused tests for the parser and the feature's meaningful states before extracting another boundary.

Keep the first version a modular monolith. Split modules only when they have an independent contract, test boundary, or reason to change. Preserve a small facade when moving an existing public API.
`;

  return [
    { path: 'package.json', content: packageJson },
    { path: 'index.html', content: indexHtml },
    { path: 'tsconfig.json', content: tsconfig },
    { path: 'README.md', content: readme }
  ];
}
