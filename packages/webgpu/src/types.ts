/**
 * @fileoverview Type definitions for @zuari/webgpu.
 * Binds TC39 reactive signal arrays directly to WebGPU GPUBuffer memory and WGSL compute shaders.
 */

import type { Signal, CleanupFn } from '@zuari/signals';

export type GPUBufferNumericFormat = 'f32' | 'i32' | 'u32';

export type TypedArrayView = Float32Array | Int32Array | Uint32Array;

/** Minimal WebGPU GPUBuffer interface for zero-dependency compatibility */
export interface WebGPUBufferLike {
  readonly size: number;
  readonly usage: number;
  mapAsync?(mode: number, offset?: number, size?: number): Promise<void>;
  getMappedRange?(offset?: number, size?: number): ArrayBuffer;
  unmap?(): void;
  destroy(): void;
}

/** Minimal WebGPU GPUQueue interface */
export interface WebGPUQueueLike {
  writeBuffer(
    buffer: WebGPUBufferLike,
    bufferOffset: number,
    data: ArrayBufferView | ArrayBufferLike,
    dataOffset?: number,
    size?: number
  ): void;
  submit(commandBuffers: unknown[]): void;
}


/** Minimal WebGPU GPUDevice interface */
export interface WebGPUDeviceLike {
  readonly queue: WebGPUQueueLike;
  createBuffer(descriptor: {
    size: number;
    usage: number;
    mappedAtCreation?: boolean;
    label?: string;
  }): WebGPUBufferLike;
  createShaderModule?(descriptor: { code: string; label?: string }): unknown;
  createComputePipeline?(descriptor: unknown): unknown;
  createBindGroup?(descriptor: unknown): unknown;
  createCommandEncoder?(descriptor?: { label?: string }): {
    beginComputePass(descriptor?: { label?: string }): {
      setPipeline(pipeline: unknown): void;
      setBindGroup(index: number, bindGroup: unknown): void;
      dispatchWorkgroups(workgroupCountX: number, workgroupCountY?: number, workgroupCountZ?: number): void;
      end(): void;
    };
    copyBufferToBuffer?(
      source: WebGPUBufferLike,
      sourceOffset: number,
      destination: WebGPUBufferLike,
      destinationOffset: number,
      size: number
    ): void;
    finish(): unknown;
  };
}

export interface GPUBufferSignalOptions<T extends TypedArrayView = Float32Array> {
  /** Optional WebGPU device (falls back to simulated in-memory GPU buffer when unavailable) */
  readonly device?: WebGPUDeviceLike | undefined;
  /** Initial TypedArray or array of numbers */
  readonly initialData: T | readonly number[];
  /** Element data format (default: 'f32') */
  readonly format?: GPUBufferNumericFormat | undefined;
  /** Custom GPUBufferUsage flags (defaults to STORAGE | COPY_DST | COPY_SRC) */
  readonly usage?: number | undefined;
  /** Optional debug label */
  readonly label?: string | undefined;
}

export interface GPUBoundSignal<T extends TypedArrayView = Float32Array> {
  /** Reactive signal wrapping the underlying TypedArray view */
  readonly signal: Signal<T>;
  /** Bound WebGPU buffer handle */
  readonly gpuBuffer: WebGPUBufferLike;
  /** Size of the buffer in bytes */
  readonly byteLength: number;
  /** Format of elements */
  readonly format: GPUBufferNumericFormat;
  /** Writes a slice or full array to the GPU buffer without full array reallocation */
  writeSubData(offsetIndex: number, values: ArrayLike<number>): void;
  /** Flushes current CPU TypedArray view to GPUBuffer via queue.writeBuffer */
  flushToGPU(): void;
  /** Reads back data from GPUBuffer into the reactive signal */
  readFromGPU(): Promise<T>;
  /** Cleans up reactive effect and destroys the GPUBuffer */
  destroy: CleanupFn;
}

export interface ComputeShaderOptions {
  /** WGSL compute shader source code */
  readonly code: string;
  /** Shader entry point function name (default: 'main') */
  readonly entryPoint?: string | undefined;
  /** Bound GPUBoundSignal buffers indexed by @binding(n) */
  readonly bindings: readonly GPUBoundSignal<TypedArrayView>[];
  /** Optional WebGPU device */
  readonly device?: WebGPUDeviceLike | undefined;
  /** Optional CPU fallback compute kernel for headless/non-WebGPU environments */
  readonly cpuFallback?: ((buffers: TypedArrayView[], workgroups: [number, number, number]) => void) | undefined;
}

export interface ComputePipelineController {
  readonly code: string;
  readonly entryPoint: string;
  readonly dispatchCount: Signal<number>;
  /** Dispatches compute workgroups on the GPU (or fallback) and updates bound signals */
  dispatch(workgroupCountX?: number, workgroupCountY?: number, workgroupCountZ?: number): Promise<void>;
  destroy: CleanupFn;
}
