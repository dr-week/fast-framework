import { signal, effect } from '@zuari/signals';
import { createGlyphButton } from '@zuari/headless';
import { SparkleGlyph, CommandGlyph, LayersGlyph, GridGlyph, TunerGlyph } from '@zuari/glyphs';

const app = document.getElementById('app')!;

// 1. Reactive State Primitive (Zero Virtual DOM)
const activeTab = signal<'spark' | 'cmd' | 'layers' | 'grid' | 'tune'>('spark');
const clickCount = signal(0);

// 2. Render Header
const header = document.createElement('div');
header.style.display = 'flex';
header.style.flexDirection = 'column';
header.style.alignItems = 'center';
header.style.gap = '12px';

header.innerHTML = `
  <div class="hero-badge">Zuari • Tidal Speed • Zero-VDOM</div>
  <h1 class="hero-title">Zuari UI Framework</h1>
  <p class="hero-subtitle">Born on the Goan tide. Icon-first minimalist design language powered by TC39 Signals, native @scope CSS, and CSS Anchor Positioning.</p>
`;
app.appendChild(header);

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

  // Sync with global activeTab signal
  effect(() => {
    isItemActive.value = activeTab.value === item.id;
  });

  const btnInstance = createGlyphButton({
    label: item.label,
    tooltip: item.tip,
    active: isItemActive,
    onClick: () => {
      activeTab.value = item.id;
      clickCount.value++;
    }
  });

  btnInstance.buttonElement.classList.add('nova-glyph-tile');
  if (item.id === 'spark') {
    btnInstance.buttonElement.setAttribute('data-badge', 'true');
  }

  // Append SVG vector glyph inside button
  const icon = item.glyph({ size: 20 });
  btnInstance.buttonElement.appendChild(icon);

  dock.appendChild(btnInstance.buttonElement);

  if (btnInstance.tooltipElement) {
    btnInstance.tooltipElement.classList.add('nova-glyph-tooltip');
    dock.appendChild(btnInstance.tooltipElement);
  }
});

app.appendChild(dock);

// 4. Reactive Status Card (Demonstrating Granular DOM Updates)
const statusCard = document.createElement('div');
statusCard.className = 'status-card';

const pulse = document.createElement('div');
pulse.className = 'status-pulse';

const statusText = document.createElement('span');

statusCard.appendChild(pulse);
statusCard.appendChild(statusText);
app.appendChild(statusCard);

// Fine-grained direct text node mutation (No VDOM tree diffing)
effect(() => {
  statusText.textContent = `Active Glyph: ${activeTab.value.toUpperCase()} • Interactions: ${clickCount.value}`;
});
