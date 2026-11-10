import '@zuari/recipes/aether.css';
import './style.scss';
import { signal } from '@zuari/signals';
import { createHeroSection } from './features/hero/index.js';
import { createNavigationDock } from './features/navigation/index.js';
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

const hero = createHeroSection({
  onTryPlayground: () => {
    currentTab.value = 'repl';
    showcase.stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },
  onInteraction: recordInteraction
});

const navigation = createNavigationDock({
  getActiveTab: () => currentTab.value,
  setActiveTab: (tab) => {
    currentTab.value = tab;
  },
  onInteraction: recordInteraction
});

app.append(
  hero,
  navigation,
  showcase.heading,
  showcase.stage,
  createTelemetryBar(interactions)
);
