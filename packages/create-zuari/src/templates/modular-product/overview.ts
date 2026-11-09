import type { GeneratedFile } from '../../types.js';

export function createOverviewFeatureFiles(): GeneratedFile[] {
const overviewModel = `import { signal, type Signal } from '@zuari/signals';
import type { OverviewItem } from '../../api/contracts.js';

export type OverviewStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';

export interface OverviewModel {
  status: Signal<OverviewStatus>;
  items: Signal<OverviewItem[]>;
  errorMessage: Signal<string>;
}

export function createOverviewModel(): OverviewModel {
  return {
    status: signal<OverviewStatus>('idle'),
    items: signal<OverviewItem[]>([]),
    errorMessage: signal('')
  };
}
`;

const overviewController = `import type { ApiClient } from '../../api/client.js';
import { parseOverviewItems } from '../../api/contracts.js';
import type { OverviewModel } from './model.js';

export function createOverviewController(api: ApiClient, model: OverviewModel) {
  async function load(): Promise<void> {
    model.status.value = 'loading';
    model.errorMessage.value = '';

    try {
      model.items.value = await api.get('/api/overview', parseOverviewItems);
      model.status.value = model.items.value.length > 0 ? 'ready' : 'empty';
    } catch (error) {
      model.errorMessage.value = error instanceof Error ? error.message : String(error);
      model.status.value = 'error';
    }
  }

  return { load };
}
`;

const overviewView = `import { html, repeat } from '@zuari/dom';
import type { OverviewModel } from './model.js';

export function createOverviewView(model: OverviewModel, load: () => Promise<void>) {
  return html\`
    <section class="feature-panel" aria-labelledby="overview-title">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">YOUR DATA</p>
          <h2 id="overview-title">Overview</h2>
        </div>
        <span class="panel-badge">API connected by you</span>
      </div>
      <div class="resource-content" aria-live="polite">
        \${() => {
          switch (model.status.value) {
            case 'idle':
              return html\`<div class="empty-state"><h3>Ready when you are</h3><p>Connect an endpoint, then load its validated results.</p></div>\`;
            case 'loading':
              return html\`<p class="state-message" role="status">Loading overview…</p>\`;
            case 'error':
              return html\`<div class="state-message state-error" role="alert"><p>\${model.errorMessage}</p><button class="text-button" type="button" @click=\${load}>Try again</button></div>\`;
            case 'empty':
              return html\`<div class="empty-state"><h3>No results yet</h3><p>The API returned no overview items.</p></div>\`;
            case 'ready':
              return html\`<ul class="item-list">\${repeat(model.items, item => item.id, item => html\`
                <li class="data-card"><h3>\${item.title}</h3><p>\${item.summary}</p></li>
              \`)}</ul>\`;
          }
        }}
      </div>
    </section>
  \`;
}
`;

const overviewFeature = `import type { ApiClient } from '../../api/client.js';
import { createOverviewController } from './controller.js';
import { createOverviewModel } from './model.js';
import { createOverviewView } from './view.js';

export function createOverviewFeature(api: ApiClient) {
  const model = createOverviewModel();
  const { load } = createOverviewController(api, model);
  const view = createOverviewView(model, load);
  return { ...model, load, view };
}
`;

  return [
    { path: 'src/features/overview/index.ts', content: overviewFeature },
    { path: 'src/features/overview/model.ts', content: overviewModel },
    { path: 'src/features/overview/controller.ts', content: overviewController },
    { path: 'src/features/overview/view.ts', content: overviewView }
  ];
}
