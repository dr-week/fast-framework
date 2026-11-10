import { effect } from '@zuari/signals';
import type { ActiveTab } from '../state.js';
import { FEATURE_CARDS, type FeatureDeckOptions } from './model.js';
import type { FeatureCardElements, FeatureDeckView } from './view.js';

export function connectFeatureDeckController(
  view: FeatureDeckView,
  { getActiveTab, onSelect, onOpenDemo, onInteraction }: FeatureDeckOptions
): void {
  const explored = new Set<ActiveTab>();

  const updateProgress = () => {
    view.progress.value = explored.size;
    view.progressCopy.textContent = explored.size === FEATURE_CARDS.length
      ? 'All stations explored. Nice run!'
      : `${explored.size} / ${FEATURE_CARDS.length} stations explored`;
  };

  const setFace = (card: FeatureCardElements, showMission: boolean, focus = true) => {
    card.article.dataset.face = showMission ? 'mission' : 'front';
    card.front.setAttribute('aria-hidden', String(showMission));
    card.back.setAttribute('aria-hidden', String(!showMission));
    if (showMission) {
      card.front.setAttribute('inert', '');
      card.back.removeAttribute('inert');
      if (focus) card.backToggle.focus();
    } else {
      card.front.removeAttribute('inert');
      card.back.setAttribute('inert', '');
      if (focus) card.frontToggle.focus();
    }
  };

  for (const definition of FEATURE_CARDS) {
    const card = view.cards.get(definition.id);
    if (!card) throw new Error(`Feature card view missing for "${definition.id}".`);

    card.frontToggle.addEventListener('click', () => {
      setFace(card, true);
      onInteraction();
    });
    card.backToggle.addEventListener('click', () => {
      setFace(card, false);
      onInteraction();
    });
    card.launch.addEventListener('click', () => {
      explored.add(definition.id);
      updateProgress();
      onSelect(definition.id);
      onOpenDemo();
      onInteraction();
    });
  }

  view.surpriseButton.addEventListener('click', () => {
    const unseen = FEATURE_CARDS.filter((card) => !explored.has(card.id));
    const choices = unseen.length > 0 ? unseen : FEATURE_CARDS;
    const choice = choices[Math.floor(Math.random() * choices.length)];
    if (!choice) throw new Error('Feature deck has no cards to surprise with.');

    const card = view.cards.get(choice.id);
    if (!card) throw new Error(`Feature card view missing for "${choice.id}".`);
    setFace(card, true);
    onInteraction();
  });

  effect(() => {
    const activeTab = getActiveTab();
    for (const [tab, card] of view.cards) {
      card.article.dataset.active = String(tab === activeTab);
      card.article.setAttribute('aria-current', String(tab === activeTab));
    }
  });
}
