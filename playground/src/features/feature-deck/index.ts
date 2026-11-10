import {
  CommandGlyph,
  GridGlyph,
  LayersGlyph,
  MonitorGlyph,
  PrinterGlyph,
  SparkleGlyph,
  TunerGlyph,
  type GlyphDefinition
} from '@zuari/glyphs';
import { effect } from '@zuari/signals';
import type { ActiveTab } from '../state.js';

interface FeatureCardDefinition {
  id: ActiveTab;
  icon: GlyphDefinition;
  category: string;
  title: string;
  summary: string;
  mission: string;
  lesson: string;
  tint: 'violet' | 'sky' | 'mint' | 'amber' | 'rose' | 'cyan';
  art: 'signal' | 'scale' | 'hardware' | 'motion' | 'spatial' | 'memory' | 'color' | 'network';
}

interface FeatureDeckOptions {
  getActiveTab: () => ActiveTab;
  onSelect: (tab: ActiveTab) => void;
  onOpenDemo: () => void;
  onInteraction: () => void;
}

const FEATURE_CARDS: FeatureCardDefinition[] = [
  {
    id: 'repl',
    icon: CommandGlyph,
    category: 'SIGNALS + DOM',
    title: 'Signal Playground',
    summary: 'Change a signal and watch its real DOM bindings respond.',
    mission: 'Increment a value in the live editor and follow its computed signals into the page.',
    lesson: 'Fine-grained reactivity without a virtual DOM.',
    tint: 'violet',
    art: 'signal'
  },
  {
    id: 'bench',
    icon: SparkleGlyph,
    category: 'PERFORMANCE LAB',
    title: 'Scale Bench',
    summary: 'Put thousands of direct updates through their paces.',
    mission: 'Run the 5,000-node benchmark and compare the measured update times.',
    lesson: 'Measure real work on demand; no decorative performance claims.',
    tint: 'sky',
    art: 'scale'
  },
  {
    id: 'hardware',
    icon: PrinterGlyph,
    category: 'HARDWARE DECK',
    title: 'Device Control',
    summary: 'Try the controls built for specialized screens and inputs.',
    mission: 'Switch a device profile and operate its controls, from D-pad to telemetry.',
    lesson: 'The same signal model can drive hardware-focused interfaces.',
    tint: 'mint',
    art: 'hardware'
  },
  {
    id: 'core',
    icon: SparkleGlyph,
    category: 'VECTOR MOTION',
    title: 'Motion Forge',
    summary: 'Morph a vector glyph through four lively states.',
    mission: 'Click or press Enter on the glyph to cycle through its animated shapes.',
    lesson: 'SVG motion stays crisp and keyboard accessible.',
    tint: 'rose',
    art: 'motion'
  },
  {
    id: 'spatial',
    icon: LayersGlyph,
    category: 'SPATIAL UI',
    title: 'Spatial Field',
    summary: 'Explore a radar-inspired view of spatial anchors.',
    mission: 'Follow the moving sweep and locate the anchors across the scene.',
    lesson: 'A familiar DOM can present spatial interface concepts.',
    tint: 'cyan',
    art: 'spatial'
  },
  {
    id: 'wasm',
    icon: MonitorGlyph,
    category: 'SYSTEMS WORKBENCH',
    title: 'Memory Bridge',
    summary: 'Explore native memory, Wasm, and polyglot tooling.',
    mission: 'Edit a value and inspect the typed memory and systems-language output.',
    lesson: 'Connect interface state to low-level data without copying buffers.',
    tint: 'amber',
    art: 'memory'
  },
  {
    id: 'tokens',
    icon: TunerGlyph,
    category: 'COLOR LAB',
    title: 'Token Tuner',
    summary: 'Drag the chroma control and remix the live accent.',
    mission: 'Tune the OKLCH slider and watch the active accent shift with it.',
    lesson: 'Typed design tokens make themes interactive and reusable.',
    tint: 'rose',
    art: 'color'
  },
  {
    id: 'alliances',
    icon: GridGlyph,
    category: 'FRAMEWORK MAP',
    title: 'Ecosystem Map',
    summary: 'See how the framework connects across platforms.',
    mission: 'Explore the integrations and choose another station to try hands-on.',
    lesson: 'A modular toolkit can scale from browser UI to connected platforms.',
    tint: 'violet',
    art: 'network'
  }
];

interface CardElements {
  article: HTMLElement;
  front: HTMLElement;
  back: HTMLElement;
  frontToggle: HTMLButtonElement;
  backToggle: HTMLButtonElement;
}

export function createFeatureDeck({
  getActiveTab,
  onSelect,
  onOpenDemo,
  onInteraction
}: FeatureDeckOptions): HTMLElement {
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

  const explored = new Set<ActiveTab>();
  const cardElements = new Map<ActiveTab, CardElements>();

  const updateProgress = () => {
    progress.value = explored.size;
    progressCopy.textContent = explored.size === FEATURE_CARDS.length
      ? 'All stations explored. Nice run!'
      : `${explored.size} / ${FEATURE_CARDS.length} stations explored`;
  };

  const setFace = (card: CardElements, showMission: boolean, focus = true) => {
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

  FEATURE_CARDS.forEach((definition, index) => {
    const article = document.createElement('article');
    article.className = 'feature-flashcard';
    article.dataset.feature = definition.id;
    article.dataset.tint = definition.tint;
    article.dataset.face = 'front';
    article.style.setProperty('--card-order', String(index));
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
    grid.appendChild(article);

    const elements = { article, front, back, frontToggle, backToggle };
    cardElements.set(definition.id, elements);

    frontToggle.addEventListener('click', () => {
      setFace(elements, true);
      onInteraction();
    });
    backToggle.addEventListener('click', () => {
      setFace(elements, false);
      onInteraction();
    });
    launch.addEventListener('click', () => {
      explored.add(definition.id);
      updateProgress();
      onSelect(definition.id);
      onOpenDemo();
      onInteraction();
    });
  });

  surpriseButton.addEventListener('click', () => {
    const unseen = FEATURE_CARDS.filter((card) => !explored.has(card.id));
    const choices = unseen.length > 0 ? unseen : FEATURE_CARDS;
    const choice = choices[Math.floor(Math.random() * choices.length)]!;
    const card = cardElements.get(choice.id)!;
    setFace(card, true);
    onInteraction();
  });

  effect(() => {
    const activeTab = getActiveTab();
    for (const [tab, card] of cardElements) {
      card.article.dataset.active = String(tab === activeTab);
      card.article.setAttribute('aria-current', String(tab === activeTab));
    }
  });

  section.append(header, grid);
  return section;
}
