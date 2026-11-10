import {
  CommandGlyph,
  ExternalLinkGlyph,
  GridGlyph,
  LayersGlyph,
  MonitorGlyph,
  PrinterGlyph,
  SparkleGlyph,
  TunerGlyph,
  type GlyphDefinition
} from '@zuari/glyphs';
import { generateAnchorName, setElementAnchor, tetherToAnchor } from '@zuari/headless';
import { effect } from '@zuari/signals';
import type { ActiveTab } from '../state.js';

interface NavigationOptions {
  getActiveTab: () => ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onInteraction: () => void;
}

const NAV_ITEMS: Array<{ id: ActiveTab; icon: GlyphDefinition; label: string }> = [
  { id: 'repl', icon: CommandGlyph, label: 'Live REPL' },
  { id: 'bench', icon: SparkleGlyph, label: '5K Benchmark' },
  { id: 'hardware', icon: PrinterGlyph, label: 'IoT & Tactical' },
  { id: 'core', icon: SparkleGlyph, label: 'Kinetic Core' },
  { id: 'spatial', icon: LayersGlyph, label: 'Spatial / XR' },
  { id: 'wasm', icon: MonitorGlyph, label: 'Systems Wasm' },
  { id: 'tokens', icon: TunerGlyph, label: 'Token Physics' },
  { id: 'alliances', icon: GridGlyph, label: 'Alliances' }
];

export function createNavigationDock({
  getActiveTab,
  setActiveTab,
  onInteraction
}: NavigationOptions): HTMLElement {
  const dock = document.createElement('nav');
  dock.className = 'spatial-dock';
  dock.setAttribute('role', 'toolbar');
  dock.setAttribute('aria-label', 'Feature Navigation');

  NAV_ITEMS.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dock-btn';
    button.setAttribute('aria-label', item.label);
    button.title = item.label;

    const anchor = generateAnchorName('tab');
    setElementAnchor(button, anchor);
    button.appendChild(item.icon({ size: 20 }));
    const label = document.createElement('span');
    label.className = 'dock-label';
    label.textContent = item.label;
    button.appendChild(label);

    effect(() => {
      const isActive = getActiveTab() === item.id;
      button.setAttribute('data-active', String(isActive));
      button.setAttribute('aria-pressed', String(isActive));
    });

    button.addEventListener('click', () => {
      setActiveTab(item.id);
      onInteraction();
    });

    const tip = document.createElement('div');
    tip.className = 'spatial-tip';
    tip.textContent = item.label;
    tetherToAnchor(tip, anchor);
    dock.append(button, tip);
  });

  const githubLink = document.createElement('a');
  githubLink.href = 'https://github.com/dr-week/fast-framework';
  githubLink.target = '_blank';
  githubLink.rel = 'noreferrer';
  githubLink.className = 'dock-btn';
  githubLink.setAttribute('aria-label', 'GitHub Repository');

  const githubAnchor = generateAnchorName('gh');
  setElementAnchor(githubLink, githubAnchor);
  githubLink.appendChild(ExternalLinkGlyph({ size: 20 }));
  const githubLabel = document.createElement('span');
  githubLabel.className = 'dock-label';
  githubLabel.textContent = 'GitHub';
  githubLink.appendChild(githubLabel);

  const githubTip = document.createElement('div');
  githubTip.className = 'spatial-tip';
  githubTip.textContent = 'GitHub Repo';
  tetherToAnchor(githubTip, githubAnchor);
  dock.append(githubLink, githubTip);

  return dock;
}
