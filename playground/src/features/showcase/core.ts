import { createMorphGlyph } from '@zuari/glyphs';

const morphStates = ['sparkle', 'loadingRing', 'checkmark', 'cross'] as const;

export function createCoreShowcase(onInteraction: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'feature-card';
  const stage = document.createElement('div');
  stage.className = 'kinetic-stage-box';

  const morph = createMorphGlyph({ size: 64, durationMs: 280 });
  let stateIndex = 0;
  stage.appendChild(morph.svgElement);
  stage.setAttribute('role', 'button');
  stage.setAttribute('tabindex', '0');
  stage.setAttribute('aria-label', 'Change the animated glyph');

  const advance = () => {
    stateIndex = (stateIndex + 1) % morphStates.length;
    morph.setState(morphStates[stateIndex]!);
    onInteraction();
  };
  stage.addEventListener('click', advance);
  stage.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      advance();
    }
  });

  const description = document.createElement('div');
  description.className = 'card-desc';
  description.innerHTML =
    '<strong>Direct-to-DOM Vector Morph</strong><br/>Click or press Enter to morph the glyph through four states.';
  card.append(stage, description);
  return card;
}
