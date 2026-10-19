import { describe, it, expect } from 'vitest';
import { createThemeEngine, THEME_PRESETS } from './index.js';

describe('@zuari/tokens Modular Plug-and-Play Theme Engine', () => {
  it('initializes with default preset and detects light/dark modes', () => {
    const el = document.createElement('div');
    const engine = createThemeEngine({ initialTheme: 'paper', targetElement: el });

    expect(engine.themeName.value).toBe('paper');
    expect(engine.isDark.value).toBe(false);
    expect(el.getAttribute('data-zuari-theme')).toBe('paper');
    expect(el.getAttribute('data-theme-mode')).toBe('light');

    // Switch to dark theme
    engine.setTheme('midnight');
    expect(engine.themeName.value).toBe('midnight');
    expect(engine.isDark.value).toBe(true);
    expect(el.getAttribute('data-zuari-theme')).toBe('midnight');
    expect(el.getAttribute('data-theme-mode')).toBe('dark');

    engine.destroy();
  });

  it('allows registering custom theme Lego bricks by composing presets', () => {
    const el = document.createElement('div');
    const engine = createThemeEngine({ targetElement: el });

    // Register a custom "cyber-neon" theme brick
    engine.registerTheme('cyber-neon', 'midnight', {
      colors: {
        accent: 'oklch(85% 0.3 140)',
        surface: 'oklch(12% 0.04 280 / 0.9)'
      },
      radii: {
        squircle: '20px'
      }
    });

    engine.setTheme('cyber-neon');
    expect(engine.themeName.value).toBe('cyber-neon');
    expect(el.style.getPropertyValue('--nova-color-accent')).toBe('oklch(85% 0.3 140)');
    expect(el.style.getPropertyValue('--nova-radius-squircle')).toBe('20px');

    engine.destroy();
  });

  it('applies scoped theme bricks to isolated subtrees without polluting root', () => {
    const engine = createThemeEngine();
    const card = document.createElement('div');

    const unscope = engine.applyScopedBricks(card, {
      colors: {
        accent: 'oklch(70% 0.25 350)'
      },
      elevations: {
        float: '0 8px 30px rgba(0,0,0,0.5)'
      }
    });

    expect(card.style.getPropertyValue('--nova-color-accent')).toBe('oklch(70% 0.25 350)');
    expect(card.style.getPropertyValue('--zuari-elevation-float')).toBe('0 8px 30px rgba(0,0,0,0.5)');

    // Teardown restores previous
    unscope();
    expect(card.style.getPropertyValue('--nova-color-accent')).toBe('');

    engine.destroy();
  });
});
