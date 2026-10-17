export interface MorphKeyframes {
  sparkle: string;
  loadingRing: string;
  checkmark: string;
  cross: string;
}

export type MorphState = keyof MorphKeyframes;

export interface MorphGlyphOptions {
  state?: MorphState | undefined;
  size?: number | string | undefined;
  durationMs?: number | undefined;
  class?: string | undefined;
}

export interface MorphGlyphInstance {
  svgElement: SVGElement;
  pathElement: SVGPathElement;
  setState: (state: MorphState) => void;
  getState: () => MorphState;
}
