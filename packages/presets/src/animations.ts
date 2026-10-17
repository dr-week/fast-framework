/**
 * @fileoverview Smooth, Expressive Animation Presets for Zuari (`floatUp`, `popIn`, `slideIn`, `brushIn`, `softPulse`, `ripple`).
 * Uses native hardware-accelerated Web Animations API (`element.animate`) with simple, memorable names.
 */

import type {
  AnimationPresetName,
  AnimationPresetConfig,
  AnimatePresetOverrides,
  AnimationHandle
} from './types.js';

export const ANIMATION_PRESETS: Record<AnimationPresetName, AnimationPresetConfig> = {
  floatUp: {
    name: 'floatUp',
    label: 'Float Up',
    description: 'Gentle upward drift with a soft, natural settle',
    keyframes: [
      { opacity: 0, transform: 'translate3d(0, 10px, 0) scale(0.97)' },
      { opacity: 1, transform: 'translate3d(0, -1px, 0) scale(1.005)', offset: 0.7 },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
    ],
    options: {
      duration: 320,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both'
    }
  },

  popIn: {
    name: 'popIn',
    label: 'Pop In',
    description: 'Crisp anime-style keyframe pop with a subtle spring overshoot',
    keyframes: [
      { opacity: 0, transform: 'scale(0.86) translateY(6px)' },
      { opacity: 1, transform: 'scale(1.035) translateY(-2px)', offset: 0.62 },
      { opacity: 1, transform: 'scale(1) translateY(0)' }
    ],
    options: {
      duration: 220,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'both'
    }
  },

  slideIn: {
    name: 'slideIn',
    label: 'Slide In',
    description: 'Smooth, effortless horizontal glide for panels and menus',
    keyframes: [
      { opacity: 0, transform: 'translate3d(-14px, 0, 0)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0)' }
    ],
    options: {
      duration: 240,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both'
    }
  },

  brushIn: {
    name: 'brushIn',
    label: 'Brush Reveal',
    description: 'Artistic brushstroke reveal with soft focus transition',
    keyframes: [
      { opacity: 0, transform: 'scaleX(0.92) translateY(4px)', filter: 'blur(3px)' },
      { opacity: 1, transform: 'scaleX(1) translateY(0)', filter: 'blur(0px)' }
    ],
    options: {
      duration: 260,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      fill: 'both'
    }
  },

  softPulse: {
    name: 'softPulse',
    label: 'Soft Pulse',
    description: 'Calm, organic breathing glow for highlights and indicators',
    keyframes: [
      { opacity: 0.88, transform: 'scale(0.995)' },
      { opacity: 1, transform: 'scale(1.01)', offset: 0.5 },
      { opacity: 0.88, transform: 'scale(0.995)' }
    ],
    options: {
      duration: 2400,
      easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
      iterations: 1,
      fill: 'both'
    }
  },

  ripple: {
    name: 'ripple',
    label: 'Tactile Ripple',
    description: 'Quick, responsive touch/click feedback',
    keyframes: [
      { transform: 'scale(0.95)', opacity: 0.78 },
      { transform: 'scale(1.02)', opacity: 1, offset: 0.5 },
      { transform: 'scale(1)', opacity: 1 }
    ],
    options: {
      duration: 180,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both'
    }
  }
};

/**
 * Plays a named animation preset (`floatUp`, `popIn`, `slideIn`, `brushIn`, `softPulse`, `ripple`)
 * on any HTML element.
 */
export function animatePreset(
  element: HTMLElement,
  presetName: AnimationPresetName,
  overrides: AnimatePresetOverrides = {}
): AnimationHandle {
  const preset = ANIMATION_PRESETS[presetName];
  const mergedOptions: KeyframeAnimationOptions = {
    ...preset.options,
    ...(overrides.duration !== undefined ? { duration: overrides.duration } : {}),
    ...(overrides.delay !== undefined ? { delay: overrides.delay } : {}),
    ...(overrides.easing !== undefined ? { easing: overrides.easing } : {}),
    ...(overrides.iterations !== undefined ? { iterations: overrides.iterations } : {}),
    ...(overrides.fill !== undefined ? { fill: overrides.fill } : {})
  };

  element.setAttribute('data-zuari-anim', presetName);

  if (typeof element.animate === 'function') {
    try {
      const anim = element.animate(preset.keyframes, mergedOptions);
      const finished = anim.finished
        ? anim.finished.then(() => undefined).catch(() => undefined)
        : Promise.resolve();
      return {
        preset: presetName,
        finished,
        cancel: () => anim.cancel()
      };
    } catch {
      // Fallback below
    }
  }

  const finalFrame = preset.keyframes[preset.keyframes.length - 1];
  if (finalFrame) {
    if (finalFrame.opacity !== undefined) {
      element.style.opacity = String(finalFrame.opacity);
    }
    if (finalFrame.transform !== undefined) {
      element.style.transform = String(finalFrame.transform);
    }
  }

  return {
    preset: presetName,
    finished: Promise.resolve(),
    cancel: () => {
      element.removeAttribute('data-zuari-anim');
    }
  };
}

/**
 * Plays a staggered animation cascade across a list of elements
 * (great for Bento grids, cards, and navigation menus).
 */
export function staggerPreset(
  elements: Iterable<HTMLElement>,
  presetName: AnimationPresetName = 'floatUp',
  staggerMs = 45,
  overrides: AnimatePresetOverrides = {}
): AnimationHandle[] {
  const handles: AnimationHandle[] = [];
  let index = 0;
  for (const el of elements) {
    const baseDelay = overrides.delay ?? 0;
    handles.push(
      animatePreset(el, presetName, {
        ...overrides,
        delay: baseDelay + index * staggerMs
      })
    );
    index++;
  }
  return handles;
}
