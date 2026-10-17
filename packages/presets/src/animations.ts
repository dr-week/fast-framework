/**
 * @fileoverview Anime & Human-Artistic Web Animations API (WAAPI) Presets.
 * Zero-dependency, GPU-composited keyframe presets inspired by Japanese animation timing
 * (crisp keyframe attack, organic settle, and calligraphic fluidity).
 */

import type {
  AnimationPresetName,
  AnimationPresetConfig,
  AnimatePresetOverrides,
  AnimationHandle
} from './types.js';

export const ANIMATION_PRESETS: Record<AnimationPresetName, AnimationPresetConfig> = {
  sakuraFloat: {
    name: 'sakuraFloat',
    label: 'Sakura Float',
    japaneseTitle: '桜舞う (Petal Drift)',
    keyframes: [
      { opacity: 0, transform: 'translate3d(0, 10px, 0) scale(0.97) rotate(-0.8deg)' },
      { opacity: 1, transform: 'translate3d(0, -1px, 0) scale(1.005) rotate(0.2deg)', offset: 0.7 },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1) rotate(0deg)' }
    ],
    options: {
      duration: 340,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'both'
    }
  },

  inkBrushReveal: {
    name: 'inkBrushReveal',
    label: 'Sumi-e Brush Reveal',
    japaneseTitle: '墨絵 (Ink Stroke)',
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

  shojiGlide: {
    name: 'shojiGlide',
    label: 'Shoji Screen Glide',
    japaneseTitle: '障子 (Sliding Screen)',
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

  animePop: {
    name: 'animePop',
    label: 'Anime Keyframe Pop',
    japaneseTitle: '作画スナップ (Sakuga Snap)',
    keyframes: [
      { opacity: 0, transform: 'scale(0.84) translateY(6px)' },
      { opacity: 1, transform: 'scale(1.035) translateY(-2px)', offset: 0.62 },
      { opacity: 1, transform: 'scale(1) translateY(0)' }
    ],
    options: {
      duration: 220,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      fill: 'both'
    }
  },

  komorebiPulse: {
    name: 'komorebiPulse',
    label: 'Komorebi Sunlight Breathe',
    japaneseTitle: '木漏れ日 (Dappled Light)',
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

  zenRipple: {
    name: 'zenRipple',
    label: 'Zen Water Ripple',
    japaneseTitle: '波紋 (Hamon Ripple)',
    keyframes: [
      { transform: 'scale(0.95)', opacity: 0.75 },
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
 * Triggers a named Japanese minimal / anime-artistic animation preset on a DOM element
 * using the native Web Animations API (`element.animate`), with a graceful fallback
 * for headless/non-WAAPI test environments.
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

  // Headless / fallback path: apply final keyframe inline
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
 * Staggers a Japanese animation preset across a collection of DOM elements
 * (ideal for Bento grids, navigation docks, and list cascades).
 */
export function staggerPreset(
  elements: Iterable<HTMLElement>,
  presetName: AnimationPresetName = 'sakuraFloat',
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
