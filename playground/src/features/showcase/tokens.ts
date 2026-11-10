import { signal } from '@zuari/signals';

export function createTokensShowcase(onInteraction: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'feature-card';
  const sliderValue = signal(65);
  const sliderContainer = document.createElement('div');
  sliderContainer.className = 'token-slider';

  const labelRow = document.createElement('div');
  labelRow.className = 'token-slider-label';
  const label = document.createElement('span');
  label.textContent = 'OKLCH Chroma Level';
  const readout = document.createElement('strong');
  readout.textContent = `${sliderValue.value}%`;
  labelRow.append(label, readout);

  const range = document.createElement('input');
  range.type = 'range';
  range.min = '0';
  range.max = '100';
  range.value = String(sliderValue.value);
  range.className = 'zuari-slider';
  range.setAttribute('aria-label', 'OKLCH Chroma Level');
  const updateAccent = () => {
    const chroma = (sliderValue.value * 0.002).toFixed(3);
    document.documentElement.style.setProperty('--accent', `oklch(75% ${chroma} 190)`);
    document.documentElement.style.setProperty('--accent-soft', `oklch(75% ${chroma} 190 / 0.18)`);
  };
  updateAccent();
  range.addEventListener('input', () => {
    sliderValue.value = Number(range.value);
    readout.textContent = `${sliderValue.value}%`;
    updateAccent();
    onInteraction();
  });

  sliderContainer.append(labelRow, range);
  card.appendChild(sliderContainer);
  return card;
}
