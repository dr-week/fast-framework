import { signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import { SparkleGlyph, CommandGlyph, LayersGlyph, GridGlyph, TunerGlyph } from '@zuari/glyphs';
import { createGlyphButton } from '@zuari/headless';

const app = document.getElementById('app')!;

// 1. Reactive State Primitive (Zero Virtual DOM)
const activeTab = signal<'spark' | 'cmd' | 'layers' | 'grid' | 'tune'>('spark');
const clickCount = signal(0);

// 2. Render Declarative UI using @zuari/dom (html`...`)
const headerView = html`
  <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
    <div class="hero-badge">Zuari • Tidal Speed • Zero-VDOM</div>
    <h1 class="hero-title">Zuari UI Framework</h1>
    <p class="hero-subtitle">Born on the Goan tide. Declarative direct-to-DOM template literals (<code>html\`...\`</code>) without Virtual DOM overhead.</p>
  </div>
`;

app.appendChild(render(headerView).fragment);

// 3. Floating Glyph Ribbon (The Minimalist Dock)
const dock = document.createElement('nav');
dock.className = 'nova-glyph-dock';
dock.setAttribute('role', 'toolbar');
dock.setAttribute('aria-label', 'Primary Actions');

const buttons = [
  { id: 'spark', glyph: SparkleGlyph, label: 'AI Intelligence', tip: 'Run Copilot' },
  { id: 'cmd', glyph: CommandGlyph, label: 'Terminal', tip: 'Command Palette' },
  { id: 'layers', glyph: LayersGlyph, label: 'Modular Stack', tip: 'Module Graph' },
  { id: 'grid', glyph: GridGlyph, label: 'Spatial Canvas', tip: 'Toggle Grid' },
  { id: 'tune', glyph: TunerGlyph, label: 'Design Tokens', tip: 'Configure Tokens' },
] as const;

buttons.forEach((item) => {
  const isItemActive = signal(activeTab.value === item.id);

  const btnInstance = createGlyphButton({
    label: item.label,
    tooltip: item.tip,
    active: isItemActive,
    onClick: () => {
      activeTab.value = item.id;
      clickCount.value++;
      // Sync active state
      buttons.forEach(b => {
        if (b.id === item.id) isItemActive.value = true;
      });
    }
  });

  btnInstance.buttonElement.classList.add('nova-glyph-tile');
  if (item.id === 'spark') {
    btnInstance.buttonElement.setAttribute('data-badge', 'true');
  }

  const icon = item.glyph({ size: 20 });
  btnInstance.buttonElement.appendChild(icon);
  dock.appendChild(btnInstance.buttonElement);

  if (btnInstance.tooltipElement) {
    btnInstance.tooltipElement.classList.add('nova-glyph-tooltip');
    dock.appendChild(btnInstance.tooltipElement);
  }
});

app.appendChild(dock);

// 4. Reactive Status Card using Declarative @zuari/dom Template
const statusView = html`
  <div class="status-card">
    <div class="status-pulse"></div>
    <span>Active: <strong>${() => activeTab.value.toUpperCase()}</strong> • Interactions: <strong>${clickCount}</strong></span>
  </div>
`;

app.appendChild(render(statusView).fragment);
