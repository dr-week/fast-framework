import '@zuari/recipes/aether.css';
import './style.scss';
import { signal } from '@zuari/signals';
import { createFeatureDeck } from './features/feature-deck/index.js';
import { createHeroSection } from './features/hero/index.js';
import { createShowcase } from './features/showcase/index.js';
import type { ActiveTab } from './features/state.js';
import { createTelemetryBar } from './features/telemetry/index.js';

const app = document.getElementById('app');
if (!app) throw new Error('Playground app root (#app) was not found.');

const currentTab = signal<ActiveTab>('repl');
const interactions = signal(0);
const recordInteraction = () => {
  interactions.value++;
};
const showcase = createShowcase({
  getActiveTab: () => currentTab.value,
  onInteraction: recordInteraction
});

const scrollToShowcase = () => {
  const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  showcase.stage.scrollIntoView({ behavior, block: 'start' });
};

const hero = createHeroSection({
  onTryPlayground: () => {
    currentTab.value = 'repl';
    scrollToShowcase();
  },
  onInteraction: recordInteraction
});

const featureDeck = createFeatureDeck({
  getActiveTab: () => currentTab.value,
  onSelect: (tab) => {
    currentTab.value = tab;
  },
  onOpenDemo: scrollToShowcase,
  onInteraction: recordInteraction
});

app.append(
  hero,
  featureDeck,
  showcase.heading,
  showcase.stage,
  createTelemetryBar(interactions)
);
