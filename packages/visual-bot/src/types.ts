/**
 * @fileoverview Core types for @zuari/visual-bot.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface RgbaImageLike {
  data: Uint8ClampedArray | Uint8Array | number[];
  width: number;
  height: number;
}

export interface EdgeMapData {
  edges: Float32Array;
  width: number;
  height: number;
}

export interface EdgeMatchResult {
  found: boolean;
  confidence: number;
  center: Point2D;
  box: BoundingBox | null;
}

export interface MultiScaleMatchOptions {
  scales?: number[];
  threshold?: number;
  earlyExitConfidence?: number;
}

export interface MultiScaleMatchResult extends EdgeMatchResult {
  scale: number;
  scalesTested: number;
  durationMs: number;
}

export interface IconTemplateSpec {
  width: number;
  height: number;
  description: string;
  category: string;
}

export type IconSynthesizer = (width: number, height: number) => Float32Array;

export interface DomElementLike {
  tagName?: string;
  id?: string;
  textContent?: string | null;
  getAttribute?: (name: string) => string | null;
  getBoundingClientRect?: () => { x: number; y: number; width: number; height: number };
}

export interface DomRootLike {
  querySelector?: (selector: string) => DomElementLike | null;
  querySelectorAll?: (selector: string) => Iterable<DomElementLike> | ArrayLike<DomElementLike>;
}

export interface SemanticMark {
  markId: number;
  tag: string;
  role: string;
  label: string;
  selector: string;
  rect: BoundingBox;
}

export interface SemanticMarkMatch extends SemanticMark {
  matchScore: number;
}

export interface DomIndexResult {
  marks: SemanticMark[];
  totalIndexed: number;
  blockedCount: number;
}

export interface CascadeResolveOptions {
  query?: string;
  cachedSelector?: string;
  root?: DomRootLike | null;
  templateEdgeData?: EdgeMapData | null;
  sceneEdgeData?: EdgeMapData | null;
  scales?: number[];
  visionThreshold?: number;
  minSemanticScore?: number;
  extraUnsafePattern?: RegExp;
  onHealSelector?: (selector: string, mark: SemanticMarkMatch) => void;
}

export interface CascadeResolution {
  found: boolean;
  layer: 0 | 1 | 2 | 3;
  selector?: string;
  healed: boolean;
  mark?: SemanticMarkMatch;
  confidence?: number;
  scale?: number;
  center?: Point2D;
  rect?: BoundingBox | null;
  blockedCount?: number;
  durationMs: number;
}

export interface BezierPathPoint extends Point2D {
  t: number;
}

export interface ScrollStep {
  deltaY: number;
  delayMs: number;
  isReadingPause?: boolean;
}

export interface RecordedStep {
  id: string;
  action: 'click' | 'fill' | 'scroll' | 'wait';
  selector?: string;
  label?: string;
  value?: string;
  deltaY?: number;
  durationMs?: number;
}

export interface RecordedWorkflow {
  origin: string;
  steps: RecordedStep[];
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
