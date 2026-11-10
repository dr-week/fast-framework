import { effect, signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import { getCompactAiSystemPrompt } from '@zuari/mcp';
import { createShareAndFeedbackModal } from '../community/index.js';

const CLI_COMMANDS = {
  minimal: 'pnpm create zuari@latest my-app --template minimal',
  desktop: 'pnpm create zuari@latest my-app --template desktop-tauri',
  spatial: 'pnpm create zuari@latest my-app --template spatial-xr'
} as const;

type CliPreset = keyof typeof CLI_COMMANDS;

interface HeroOptions {
  onTryPlayground: () => void;
  onInteraction: () => void;
}

export function createHeroSection({ onTryPlayground, onInteraction }: HeroOptions): HTMLElement {
  const header = document.createElement('header');
  header.className = 'spatial-header';

  const brandLockup = document.createElement('div');
  brandLockup.className = 'brand-lockup';
  const logoContainer = document.createElement('div');
  logoContainer.className = 'logo-glow-wrapper';
  const logoImg = document.createElement('img');
  logoImg.src = './zuari-logo.svg';
  logoImg.alt = 'Zuari Crest Logo';
  logoImg.width = 64;
  logoImg.height = 64;
  logoContainer.appendChild(logoImg);

  const brandCopy = document.createElement('div');
  brandCopy.className = 'brand-copy';
  const title = document.createElement('h1');
  title.className = 'brand-title';
  title.textContent = 'ZUARI';
  const subtitle = document.createElement('p');
  subtitle.className = 'brand-subtitle';
  subtitle.textContent = 'A direct-to-DOM UI framework by Danger.Labs';
  brandCopy.append(title, subtitle);
  brandLockup.append(logoContainer, brandCopy);
  header.appendChild(brandLockup);

  const hero = document.createElement('section');
  hero.className = 'hero-editorial';
  hero.setAttribute('aria-labelledby', 'hero-title');

  const heroCopy = document.createElement('div');
  heroCopy.className = 'hero-copy';
  const heroEyebrow = document.createElement('p');
  heroEyebrow.className = 'hero-eyebrow';
  heroEyebrow.textContent = 'THE WEB, WITHOUT THE MIDDLE LAYER';
  const heroTitle = document.createElement('h2');
  heroTitle.id = 'hero-title';
  heroTitle.innerHTML = 'Build for the <em>frame</em><br> beyond the browser.';
  const heroDescription = document.createElement('p');
  heroDescription.className = 'hero-description';
  heroDescription.textContent =
    'Signals update the real DOM. One modular framework stretches from tiny interfaces to spatial, hardware and WebAssembly workloads.';

  const heroActions = document.createElement('div');
  heroActions.className = 'hero-actions';
  const tryButton = document.createElement('button');
  tryButton.type = 'button';
  tryButton.className = 'hero-primary-action';
  tryButton.textContent = 'Try the live playground';
  tryButton.addEventListener('click', onTryPlayground);
  const sourceLink = document.createElement('a');
  sourceLink.className = 'hero-secondary-action';
  sourceLink.href = 'https://github.com/dr-week/fast-framework';
  sourceLink.target = '_blank';
  sourceLink.rel = 'noreferrer';
  sourceLink.textContent = 'Explore the source ↗';
  heroActions.append(tryButton, sourceLink);
  heroCopy.append(heroEyebrow, heroTitle, heroDescription, heroActions);

  const heroVisual = document.createElement('div');
  heroVisual.className = 'hero-visual';
  heroVisual.setAttribute('role', 'group');
  heroVisual.setAttribute('aria-label', 'Interactive Zuari signal visualization');
  heroVisual.innerHTML =
    '<div class="hero-visual-orbit orbit-one"></div><div class="hero-visual-orbit orbit-two"></div><div class="hero-visual-core"><img src="./zuari-logo.svg" alt="" width="68" height="68"></div><div class="hero-signal-card signal-a"><span>REACTIVE CORE</span><strong>LIVE<small>signal</small></strong><i></i></div><div class="hero-signal-card signal-b"><span>RENDER MODEL</span><strong>0 <small>VDOM</small></strong><i></i></div><div class="hero-visual-caption">SIGNAL → DOM / DIRECT PATH</div>';
  heroVisual.dataset.mood = 'violet';

  const moodButton = document.createElement('button');
  moodButton.type = 'button';
  moodButton.className = 'mood-shuffle';
  moodButton.setAttribute('aria-label', 'Shuffle the ambient color');
  moodButton.textContent = 'Shuffle light';
  const moods = ['violet', 'ice', 'ember', 'lime'] as const;
  moodButton.addEventListener('click', () => {
    const available = moods.filter((mood) => mood !== heroVisual.dataset.mood);
    const nextMood = available[Math.floor(Math.random() * available.length)] ?? 'violet';
    heroVisual.dataset.mood = nextMood;
    moodButton.textContent = `${nextMood[0]!.toUpperCase()}${nextMood.slice(1)} light`;
    onInteraction();
  });
  heroVisual.appendChild(moodButton);

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    heroVisual.addEventListener('pointermove', (event) => {
      const bounds = heroVisual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      heroVisual.style.setProperty('--pointer-x', `${x * 100}%`);
      heroVisual.style.setProperty('--pointer-y', `${y * 100}%`);
      heroVisual.style.setProperty('--tilt-x', `${(x - 0.5) * 5}deg`);
      heroVisual.style.setProperty('--tilt-y', `${(0.5 - y) * 4}deg`);
    });
    heroVisual.addEventListener('pointerleave', () => {
      heroVisual.style.setProperty('--pointer-x', '50%');
      heroVisual.style.setProperty('--pointer-y', '50%');
      heroVisual.style.setProperty('--tilt-x', '0deg');
      heroVisual.style.setProperty('--tilt-y', '0deg');
    });
  }
  hero.append(heroCopy, heroVisual);
  header.appendChild(hero);

  const communityWidget = createShareAndFeedbackModal();
  header.appendChild(communityWidget);

  const cliBar = document.createElement('div');
  cliBar.className = 'cli-scaffolder-bar';
  const cliPreset = signal<CliPreset>('minimal');
  const cliView = html`
    <div class="cli-preset-pills">
      <button type="button" class="cli-pill" data-preset="minimal" @click=${() => { cliPreset.value = 'minimal'; onInteraction(); }}>minimal</button>
      <button type="button" class="cli-pill" data-preset="desktop" @click=${() => { cliPreset.value = 'desktop'; onInteraction(); }}>desktop (Tauri)</button>
      <button type="button" class="cli-pill" data-preset="spatial" @click=${() => { cliPreset.value = 'spatial'; onInteraction(); }}>spatial (WebXR)</button>
    </div>
    <div class="cli-cmd-box">
      <code id="cli-cmd-text">${CLI_COMMANDS.minimal}</code>
      <button type="button" class="cli-copy-btn" id="cli-copy-btn" @click=${() => {
        navigator.clipboard?.writeText(CLI_COMMANDS[cliPreset.value]);
        const button = document.getElementById('cli-copy-btn');
        if (button) {
          button.textContent = 'Copied!';
          setTimeout(() => { button.textContent = 'Copy'; }, 1400);
        }
        onInteraction();
      }}>Copy</button>
      <button type="button" class="cli-copy-btn" id="ai-copy-btn" title="Copy Zuari context for an AI assistant" @click=${() => {
        navigator.clipboard?.writeText(getCompactAiSystemPrompt());
        const button = document.getElementById('ai-copy-btn');
        if (button) {
          button.textContent = 'AI context copied';
          setTimeout(() => { button.textContent = 'Copy AI context'; }, 1600);
        }
        onInteraction();
      }}>Copy AI context</button>
    </div>
  `;
  cliBar.appendChild(render(cliView).fragment);
  header.appendChild(cliBar);

  effect(() => {
    const activePreset = cliPreset.value;
    const commandElement = document.getElementById('cli-cmd-text');
    if (commandElement) commandElement.textContent = CLI_COMMANDS[activePreset];
    cliBar.querySelectorAll('.cli-pill').forEach((element) => {
      element.setAttribute('data-active', String(element.getAttribute('data-preset') === activePreset));
    });
  });

  return header;
}
