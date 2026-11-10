import type { ActiveTab } from '../state.js';
import { FEATURE_ARTWORK, getArcadeArtworkUrl } from '../feature-artwork.js';
import { FEATURE_CARDS, type FeatureCardDefinition } from './model.js';

export interface FeatureCardElements {
  article: HTMLElement;
  front: HTMLElement;
  back: HTMLElement;
  frontToggle: HTMLButtonElement;
  backToggle: HTMLButtonElement;
  launch: HTMLButtonElement;
}

export interface FeatureDeckView {
  section: HTMLElement;
  progressCopy: HTMLSpanElement;
  progress: HTMLProgressElement;
  surpriseButton: HTMLButtonElement;
  cards: Map<ActiveTab, FeatureCardElements>;
}

export function createFeatureDeckView(): FeatureDeckView {
  const section = document.createElement('section');
  section.className = 'feature-deck';
  section.setAttribute('aria-labelledby', 'feature-deck-title');

  const header = document.createElement('div');
  header.className = 'feature-deck-header';
  const headingCopy = document.createElement('div');
  const eyebrow = document.createElement('p');
  eyebrow.className = 'feature-deck-eyebrow';
  eyebrow.textContent = 'THE FRAMEWORK ARCADE';
  const title = document.createElement('h2');
  title.id = 'feature-deck-title';
  title.textContent = 'Pick a card. Play a feature.';
  const description = document.createElement('p');
  description.className = 'feature-deck-description';
  description.textContent = 'Flip a mission card, try the live demo, and learn by doing.';
  headingCopy.append(eyebrow, title, description);

  const deckActions = document.createElement('div');
  deckActions.className = 'feature-deck-actions';
  const progressCopy = document.createElement('span');
  progressCopy.className = 'feature-deck-progress-copy';
  progressCopy.setAttribute('aria-live', 'polite');
  progressCopy.textContent = `0 / ${FEATURE_CARDS.length} stations explored`;
  const progress = document.createElement('progress');
  progress.className = 'feature-deck-progress';
  progress.max = FEATURE_CARDS.length;
  progress.value = 0;
  progress.setAttribute('aria-label', 'Feature stations explored');
  const surpriseButton = document.createElement('button');
  surpriseButton.type = 'button';
  surpriseButton.className = 'feature-deck-surprise';
  surpriseButton.textContent = 'Surprise me';
  deckActions.append(progressCopy, progress, surpriseButton);
  header.append(headingCopy, deckActions);

  const grid = document.createElement('div');
  grid.className = 'feature-deck-grid';
  grid.setAttribute('role', 'list');
  grid.setAttribute('aria-label', 'Interactive framework feature missions');

  const cards = new Map<ActiveTab, FeatureCardElements>();
  FEATURE_CARDS.forEach((definition, index) => {
    const elements = createFeatureCardView(definition, index);
    cards.set(definition.id, elements);
    grid.appendChild(elements.article);
  });

  section.append(header, grid);
  return { section, progressCopy, progress, surpriseButton, cards };
}

function createFeatureCardView(
  definition: FeatureCardDefinition,
  index: number
): FeatureCardElements {
  const article = document.createElement('article');
  article.className = 'feature-flashcard';
  article.dataset.feature = definition.id;
  article.dataset.face = 'front';
  article.style.setProperty('--card-order', String(index));
  const artwork = FEATURE_ARTWORK[definition.id];
  article.style.setProperty('--card-artwork', `url("${getArcadeArtworkUrl(artwork.card)}")`);
  article.style.setProperty('--mission-artwork', `url("${getArcadeArtworkUrl(artwork.station)}")`);
  article.style.setProperty('--card-glow', artwork.glow);
  article.style.setProperty('--artwork-hue', artwork.hue);
  article.style.setProperty('--artwork-blend', artwork.blend);
  article.style.setProperty('--artwork-position', artwork.position);
  article.style.animationDelay = `${index * 55}ms`;
  article.setAttribute('role', 'listitem');

  const inner = document.createElement('div');
  inner.className = 'feature-flashcard-inner';
  const front = document.createElement('div');
  front.className = 'feature-flashcard-face feature-flashcard-face--front';
  const back = document.createElement('div');
  back.className = 'feature-flashcard-face feature-flashcard-face--back';
  back.setAttribute('aria-hidden', 'true');
  back.setAttribute('inert', '');

  const frontMeta = document.createElement('div');
  frontMeta.className = 'feature-flashcard-meta';
  const number = document.createElement('span');
  number.className = 'feature-flashcard-number';
  number.textContent = `${String(index + 1).padStart(2, '0')} / ${String(FEATURE_CARDS.length).padStart(2, '0')}`;
  const category = document.createElement('span');
  category.className = 'feature-flashcard-category';
  category.textContent = definition.category;
  frontMeta.append(number, category);

  const icon = document.createElement('div');
  icon.className = 'feature-flashcard-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.appendChild(definition.icon({ size: 22 }));

  const art = document.createElement('div');
  art.className = 'feature-flashcard-art';
  art.dataset.art = definition.art;
  art.setAttribute('aria-hidden', 'true');
  for (let part = 0; part < 4; part++) art.appendChild(document.createElement('span'));

  const cardTitle = document.createElement('h3');
  cardTitle.textContent = definition.title;
  const summary = document.createElement('p');
  summary.className = 'feature-flashcard-summary';
  summary.textContent = definition.summary;
  const frontToggle = document.createElement('button');
  frontToggle.type = 'button';
  frontToggle.className = 'feature-flashcard-flip';
  frontToggle.dataset.action = 'reveal';
  frontToggle.textContent = 'Reveal mission';
  front.append(frontMeta, icon, art, cardTitle, summary, frontToggle);

  const backMeta = document.createElement('div');
  backMeta.className = 'feature-flashcard-meta';
  const missionLabel = document.createElement('span');
  missionLabel.className = 'feature-flashcard-number';
  missionLabel.textContent = 'YOUR MISSION';
  const activeLabel = document.createElement('span');
  activeLabel.className = 'feature-flashcard-category';
  activeLabel.textContent = definition.category;
  backMeta.append(missionLabel, activeLabel);

  const missionTitle = document.createElement('h3');
  missionTitle.textContent = definition.title;
  const mission = document.createElement('p');
  mission.className = 'feature-flashcard-mission';
  mission.textContent = definition.mission;
  const lessonLabel = document.createElement('span');
  lessonLabel.className = 'feature-flashcard-lesson-label';
  lessonLabel.textContent = 'WHAT YOU’LL LEARN';
  const lesson = document.createElement('p');
  lesson.className = 'feature-flashcard-lesson';
  lesson.textContent = definition.lesson;
  const backActions = document.createElement('div');
  backActions.className = 'feature-flashcard-actions';
  const backToggle = document.createElement('button');
  backToggle.type = 'button';
  backToggle.className = 'feature-flashcard-flip feature-flashcard-flip--back';
  backToggle.dataset.action = 'flip-back';
  backToggle.textContent = 'Flip back';
  const launch = document.createElement('button');
  launch.type = 'button';
  launch.className = 'feature-flashcard-launch';
  launch.dataset.action = 'launch';
  launch.textContent = 'Play station';
  backActions.append(backToggle, launch);
  back.append(backMeta, missionTitle, mission, lessonLabel, lesson, backActions);

  inner.append(front, back);
  article.appendChild(inner);
  return { article, front, back, frontToggle, backToggle, launch };
}
