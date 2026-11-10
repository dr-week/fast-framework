import { batch, effect, type CleanupFn } from '@zuari/signals';
import { THEME_PRESETS } from '@zuari/tokens';
import { createDesignPresets } from './aesthetics.js';
import type {
  DesignPreferenceStorage,
  ElevationPreset,
  PersistentDesignPresetOptions,
  PersistentDesignPresetController,
  SpacingPreset,
  SurfacePreset
} from './types.js';

interface StoredDesignPreferences {
  theme?: string;
  elevation?: string;
  spacing?: string;
  surface?: string;
}

const ELEVATIONS = new Set<ElevationPreset>(['flat', 'soft', 'float', 'halo']);
const SPACING = new Set<SpacingPreset>(['compact', 'balanced', 'airy']);
const SURFACES = new Set<SurfacePreset>(['paper', 'frosted', 'liquid', 'canvas', 'cel']);

/**
 * Creates the normal reactive design controller and optionally persists its selections.
 * Stored values are treated as untrusted input and validated against the built-in presets.
 */
export function createPersistentDesignPresets(
  options: PersistentDesignPresetOptions = {}
): PersistentDesignPresetController {
  const storageKey = options.storageKey ?? 'zuari:design-preferences:v1';
  const storage = resolveStorage(options.storage);
  const stored = storage ? readPreferences(storage, storageKey) : {};

  const controller = createDesignPresets({
    theme: isTheme(stored.theme) ? stored.theme : options.theme,
    elevation: isElevation(stored.elevation) ? stored.elevation : options.elevation,
    spacing: isSpacing(stored.spacing) ? stored.spacing : options.spacing,
    surface: isSurface(stored.surface) ? stored.surface : options.surface,
    targetElement: options.targetElement
  });

  let disposePersistence: CleanupFn = () => {};
  if (storage) {
    disposePersistence = effect(() => {
      const snapshot = JSON.stringify({
        theme: controller.theme.value,
        elevation: controller.elevation.value,
        spacing: controller.spacing.value,
        surface: controller.surface.value
      });
      try {
        storage.setItem(storageKey, snapshot);
      } catch {
        // Storage can be unavailable in private, sandboxed, or quota-limited contexts.
      }
    });
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== storageKey || !event.newValue || !storage || (event.storageArea && event.storageArea !== storage)) return;
    const next = parsePreferences(event.newValue);
    batch(() => {
      if (isTheme(next.theme) && controller.theme.peek() !== next.theme) controller.setTheme(next.theme);
      if (isElevation(next.elevation) && controller.elevation.peek() !== next.elevation) controller.setElevation(next.elevation);
      if (isSpacing(next.spacing) && controller.spacing.peek() !== next.spacing) controller.setSpacing(next.spacing);
      if (isSurface(next.surface) && controller.surface.peek() !== next.surface) controller.setSurface(next.surface);
    });
  };

  const listenForStorage = Boolean(storage) && options.syncAcrossTabs !== false && typeof window !== 'undefined';
  if (listenForStorage) window.addEventListener('storage', onStorage);

  return {
    ...controller,
    storageKey,
    destroy: () => {
      disposePersistence();
      if (listenForStorage && typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
      controller.destroy();
    }
  };
}

function resolveStorage(storage: DesignPreferenceStorage | null | undefined): DesignPreferenceStorage | null {
  if (storage === null) return null;
  if (storage) return storage;
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

function readPreferences(storage: DesignPreferenceStorage, key: string): StoredDesignPreferences {
  try {
    const raw = storage.getItem(key);
    return raw ? parsePreferences(raw) : {};
  } catch {
    return {};
  }
}

function parsePreferences(raw: string): StoredDesignPreferences {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
    const value = parsed as Record<string, unknown>;
    return {
      theme: typeof value.theme === 'string' ? value.theme : undefined,
      elevation: typeof value.elevation === 'string' ? value.elevation : undefined,
      spacing: typeof value.spacing === 'string' ? value.spacing : undefined,
      surface: typeof value.surface === 'string' ? value.surface : undefined
    };
  } catch {
    return {};
  }
}

function isTheme(value: string | undefined): value is keyof typeof THEME_PRESETS {
  return value !== undefined && Object.prototype.hasOwnProperty.call(THEME_PRESETS, value);
}

function isElevation(value: string | undefined): value is ElevationPreset {
  return value !== undefined && ELEVATIONS.has(value as ElevationPreset);
}

function isSpacing(value: string | undefined): value is SpacingPreset {
  return value !== undefined && SPACING.has(value as SpacingPreset);
}

function isSurface(value: string | undefined): value is SurfacePreset {
  return value !== undefined && SURFACES.has(value as SurfacePreset);
}
