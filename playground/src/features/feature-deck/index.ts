import { connectFeatureDeckController } from './controller.js';
import type { FeatureDeckOptions } from './model.js';
import { createFeatureDeckView } from './view.js';

export type { FeatureDeckOptions } from './model.js';

export function createFeatureDeck(options: FeatureDeckOptions): HTMLElement {
  const view = createFeatureDeckView();
  connectFeatureDeckController(view, options);
  return view.section;
}
