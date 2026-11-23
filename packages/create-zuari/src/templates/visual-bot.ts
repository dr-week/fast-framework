/** @fileoverview Visual Bot & Automation App template for create-zuari. */
import type { GeneratedFile } from '../types.js';

export function createVisualBotFiles(projectName: string): GeneratedFile[] {
  return [
    {
      path: 'package.json',
      content: JSON.stringify(
        {
          name: projectName,
          version: '0.1.0',
          private: true,
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
          },
          dependencies: {
            '@zuari/signals': '^0.1.0',
            '@zuari/dom': '^0.1.0',
            '@zuari/visual-bot': '^0.1.0',
          },
          devDependencies: {
            typescript: '^5.8.0',
            vite: '^6.2.0',
          },
        },
        null,
        2
      ),
    },
    {
      path: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} — Zuari Visual Bot</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
    },
    {
      path: 'src/main.ts',
      content: `import { signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import { createVisualBot } from '@zuari/visual-bot/cascade';
import { createActionRunner, createDomDriver } from '@zuari/visual-bot/drivers';
import { createQuotaGuard, createWorkflowEngine } from '@zuari/visual-bot/runtime';

const status = signal('Idle — click Run Workflow to test self-healing automation.');
const bot = createVisualBot({
  initialSelectors: { primaryAction: '.stale-selector' },
});
const driver = createDomDriver({ bot });
const quota = createQuotaGuard({ maxPerWindow: 30, windowMs: 3_600_000 });
const runner = createActionRunner(driver, { quota });

const engine = createWorkflowEngine(async (action) => {
  if (action.type === 'click-target') {
    return runner.resolveAndClick('primaryAction', { query: 'Approve Draft' });
  }
  return { ok: true };
});

async function runSampleWorkflow(): Promise<void> {
  const run = await engine.run(
    { id: 'sample-heal', actions: [{ type: 'click-target' }] },
    {}
  );
  status.value = \`Workflow \${run.status} — cached selector: \${bot.selectorCache.value.primaryAction ?? 'none'}\`;
}

const view = html\`
  <main style="font-family: system-ui, sans-serif; padding: 2rem; max-width: 640px;">
    <h1>${projectName}</h1>
    <p>\${status}</p>
    <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
      <button type="button" @click=\${runSampleWorkflow}>Run Workflow</button>
      <button type="button" aria-label="Approve Draft" @click=\${() => { status.value = 'Approve Draft clicked via self-healed cascade.'; }}>
        Approve Draft
      </button>
    </div>
  </main>
\`;

const { fragment } = render(view);
document.getElementById('app')?.appendChild(fragment);
`,
    },
  ];
}
