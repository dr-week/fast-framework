/**
 * @fileoverview Type definitions for @zuari/ai.
 * First-class reactive wrappers for the browser WebNN API and Prompt API (window.ai),
 * enabling zero-latency token streaming directly into a ChildNodePart text node.
 */

import type { Signal, CleanupFn } from '@zuari/signals';
import type { ChildPart } from '@zuari/dom';

export interface BrowserAILanguageModelSession {
  prompt(input: string, options?: { signal?: AbortSignal }): Promise<string>;
  promptStreaming(input: string, options?: { signal?: AbortSignal }): AsyncIterable<string> | ReadableStream<string>;
  destroy?(): void;
}

export interface PromptStreamOptions {
  /** Optional system prompt for the on-device language model */
  readonly systemPrompt?: string | undefined;
  /** Sampling temperature */
  readonly temperature?: number | undefined;
  /** Top-K sampling parameter */
  readonly topK?: number | undefined;
  /** Optional custom session or mock generator for offline/testing environments */
  readonly session?: BrowserAILanguageModelSession | undefined;
  /** If true, promptStreaming yields cumulative strings (like Chrome early window.ai); if false (default), yields token deltas */
  readonly cumulativeChunks?: boolean | undefined;
}

export interface PromptStreamController {
  /** Reactive signal holding the full accumulated response string */
  readonly text: Signal<string>;
  /** Reactive signal holding the latest streamed token delta */
  readonly latestToken: Signal<string>;
  /** Reactive signal indicating whether tokens are actively streaming */
  readonly isStreaming: Signal<boolean>;
  /** Total tokens/chunks received in the current or last stream */
  readonly tokenCount: Signal<number>;
  /** Error signal if generation failed */
  readonly error: Signal<Error | null>;
  /** Binds a W3C ChildPart or DOM Text node for direct O(1) character-data appending without VDOM thrashing */
  bindChildPart(target: ChildPart | Text | Element): CleanupFn;
  /** Streams tokens from window.ai or provided session directly into bound DOM nodes and signals */
  stream(promptText: string): Promise<string>;
  /** Aborts an active generation stream */
  abort(): void;
  /** Cleans up session and bound DOM parts */
  destroy: CleanupFn;
}

export type WebNNDeviceType = 'gpu' | 'npu' | 'cpu';

export interface WebNNGraphOptions {
  /** Target hardware accelerator ('npu', 'gpu', or 'cpu') */
  readonly deviceType?: WebNNDeviceType | undefined;
  /** Power preference ('default', 'high-performance', 'low-power') */
  readonly powerPreference?: 'default' | 'high-performance' | 'low-power' | undefined;
  /** Tensor shape dimensions, e.g. [1, 4] */
  readonly shape: readonly number[];
  /** Custom compute kernel or WebNN MLGraph executor */
  readonly executeKernel?: ((input: Float32Array) => Float32Array | Promise<Float32Array>) | undefined;
}

export interface WebNNReactiveRunner {
  readonly input: Signal<Float32Array>;
  readonly output: Signal<Float32Array>;
  readonly isComputing: Signal<boolean>;
  readonly deviceType: WebNNDeviceType;
  /** Executes the WebNN graph on the current input tensor signal and updates the output signal */
  compute(overrideInput?: Float32Array): Promise<Float32Array>;
  destroy: CleanupFn;
}
