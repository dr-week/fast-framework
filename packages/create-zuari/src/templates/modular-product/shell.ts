import type { GeneratedFile } from '../../types.js';

export function createProductShellFiles(projectName: string): GeneratedFile[] {
const mainTs = `import { mountProductApp } from './app/start.js';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Application root "#app" was not found.');

const destroy = mountProductApp(root);
if (import.meta.hot) import.meta.hot.dispose(destroy);
`;

const appStart = `import { createApiClient } from '../api/client.js';
import { createAppShell } from './shell.js';

export function mountProductApp(root: HTMLElement): () => void {
  const api = createApiClient(import.meta.env.VITE_API_BASE_URL ?? '');
  const { view, settings } = createAppShell(api);
  const rendered = view.mount(root);
  const trigger = root.querySelector<HTMLButtonElement>('[data-open-settings]');

  if (!trigger) {
    rendered.destroy();
    settings.destroy();
    throw new Error('Settings trigger was not rendered.');
  }

  const unbindSettings = settings.drawer.bindTrigger(trigger);
  return () => {
    unbindSettings();
    rendered.destroy();
    settings.destroy();
  };
}
`;

const appShell = `import { html, render } from '@zuari/dom';
import { GridGlyph, HomeGlyph, TunerGlyph } from '@zuari/glyphs';
import type { ApiClient } from '../api/client.js';
import { createOverviewFeature } from '../features/overview/index.js';
import { createProductSettings } from './settings.js';

export function createAppShell(api: ApiClient) {
  const overview = createOverviewFeature(api);
  const settings = createProductSettings();

  const template = html\`
    <div class="app-shell">
      <header class="app-header">
        <a class="brand" href="/" aria-label="${projectName} home">
          <span class="brand-mark" aria-hidden="true">Z</span>
          <span>${projectName}</span>
        </a>
        <div class="header-actions">
          <span class="status-pill"><span class="status-dot"></span> Local workspace</span>
          <button class="icon-button" type="button" data-open-settings aria-label="Open settings">
            \${TunerGlyph({ size: 20 })}
          </button>
        </div>
      </header>
      <div class="app-body">
        <nav class="primary-nav" aria-label="Primary navigation">
          <button class="nav-item is-active" type="button" aria-current="page">
            \${HomeGlyph({ size: 18 })}<span>Overview</span>
          </button>
          <button class="nav-item" type="button" disabled title="Add a feature module">
            \${GridGlyph({ size: 18 })}<span>Workspace</span>
          </button>
        </nav>
        <main class="main-content">
          <header class="page-heading">
            <div>
              <p class="eyebrow">PRODUCT WORKSPACE</p>
              <h1>Overview</h1>
              <p class="page-description">A modular starting point. Connect a real data source to begin.</p>
            </div>
            <button class="primary-button" type="button" @click=\${overview.load}>
              Refresh data
            </button>
          </header>
          \${overview.view}
        </main>
      </div>
    </div>
  \`;

  return {
    view: {
      mount(root: HTMLElement) {
        return render(template, root);
      }
    },
    settings
  };
}
`;

const appSettings = `import { createDesignPresets } from '@zuari/presets';
import { createUiDrawer } from '@zuari/ui';

const THEME_NAMES = ['paper', 'blossom', 'matcha', 'twilight', 'midnight', 'studio'] as const;
type ThemeName = typeof THEME_NAMES[number];

export function createProductSettings() {
  const design = createDesignPresets({ theme: 'midnight' });
  const originalColorScheme = document.documentElement.style.colorScheme;
  const content = document.createElement('div');
  const label = document.createElement('label');
  const themeSelect = document.createElement('select');

  label.htmlFor = 'theme-preset';
  label.textContent = 'Color theme';
  themeSelect.id = 'theme-preset';

  for (const theme of THEME_NAMES) {
    const option = document.createElement('option');
    option.value = theme;
    option.textContent = theme[0].toUpperCase() + theme.slice(1);
    themeSelect.appendChild(option);
  }
  themeSelect.value = 'midnight';

  function updateTheme(): void {
    const selected = themeSelect.value;
    if (!isThemeName(selected)) throw new TypeError(\`Unsupported theme preset: \${selected}\`);
    design.setTheme(selected);
    document.documentElement.style.colorScheme = selected === 'midnight' || selected === 'twilight' ? 'dark' : 'light';
  }

  themeSelect.addEventListener('change', updateTheme);
  content.append(label, themeSelect);

  const drawer = createUiDrawer({
    id: 'workspace-settings',
    placement: 'right',
    title: 'Workspace settings',
    description: 'Choose a Zuari theme for this product.',
    content
  });

  return {
    drawer,
    destroy() {
      themeSelect.removeEventListener('change', updateTheme);
      design.destroy();
      drawer.destroy();
      document.documentElement.style.colorScheme = originalColorScheme;
    }
  };
}

function isThemeName(value: string): value is ThemeName {
  return THEME_NAMES.some(theme => theme === value);
}
`;

  return [
    { path: 'src/main.ts', content: mainTs },
    { path: 'src/app/start.ts', content: appStart },
    { path: 'src/app/shell.ts', content: appShell },
    { path: 'src/app/settings.ts', content: appSettings }
  ];
}
