import { effect } from '@zuari/signals';
import { createProofBenchView } from '../benchmark/index.js';
import { createHardwareLabView } from '../hardware/index.js';
import { createPolyglotWorkbenchView } from '../polyglot/index.js';
import { createReplView } from '../repl/index.js';
import type { ActiveTab } from '../state.js';
import { FEATURE_ARTWORK, getArcadeArtworkUrl } from '../feature-artwork.js';
import { createAlliancesShowcase } from './alliances.js';
import { createCoreShowcase } from './core.js';
import { createSpatialShowcase } from './spatial.js';
import { createTokensShowcase } from './tokens.js';

interface ShowcaseOptions {
  getActiveTab: () => ActiveTab;
  onInteraction: () => void;
}

export function createShowcase({ getActiveTab, onInteraction }: ShowcaseOptions): {
  heading: HTMLElement;
  stage: HTMLElement;
} {
  const heading = document.createElement('header');
  heading.className = 'showcase-heading';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'hero-eyebrow';
  eyebrow.textContent = 'LIVE FEATURE STATION';
  const title = document.createElement('h2');
  title.textContent = 'Your station is ready.';
  const description = document.createElement('p');
  description.textContent = 'Play with a real Zuari feature, then flip another card to keep exploring.';
  heading.append(eyebrow, title, description);

  const stage = document.createElement('section');
  stage.className = 'showcase-stage';
  const views: Record<ActiveTab, HTMLElement> = {
    repl: createReplView(onInteraction),
    bench: createProofBenchView(onInteraction),
    hardware: createHardwareLabView(onInteraction),
    core: createCoreShowcase(onInteraction),
    spatial: createSpatialShowcase(),
    wasm: createPolyglotWorkbenchView(onInteraction),
    tokens: createTokensShowcase(onInteraction),
    alliances: createAlliancesShowcase()
  };

  function renderActiveShowcase(): void {
    const activeTab = getActiveTab();
    stage.replaceChildren(views[activeTab]);
    stage.dataset.activeTab = activeTab;
    const artwork = FEATURE_ARTWORK[activeTab];
    const artworkUrl = getArcadeArtworkUrl(artwork.station);
    stage.style.setProperty('--station-artwork', `url("${artworkUrl}")`);
    stage.style.setProperty('--station-glow', artwork.glow);
    stage.style.setProperty('--station-hue', artwork.hue);
    stage.style.setProperty('--station-blend', artwork.blend);
    stage.style.setProperty('--station-position', artwork.position);
    heading.style.setProperty('--station-glow', artwork.glow);
    stage.firstElementChild?.classList.add('showcase-enter');
  }

  effect(() => {
    getActiveTab();
    renderActiveShowcase();
  });

  return { heading, stage };
}
