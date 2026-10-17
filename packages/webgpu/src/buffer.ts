/**
 * @fileoverview Zero-copy WebGPU GPUBuffer Reactive Signal Bridge & Compute Pipeline.
 * Allows reactive signal arrays to bind directly to GPUBuffers so UI charts, data grids,
 * and spatial shaders update on the GPU without CPU-to-GPU copy bottlenecks.
 */

import { signal, effect } from '@zuari/signals';
import type {
  GPUBufferNumericFormat,
  TypedArrayView,
  WebGPUBufferLike,
  WebGPUDeviceLike,
  GPUBufferSignalOptions,
  GPUBoundSignal,
  ComputeShaderOptions,
  ComputePipelineController
} from './types.js';

// Standard WebGPU GPUBufferUsage bitflags
export const GPU_BUFFER_USAGE = {
  MAP_READ: 0x0001,
  MAP_WRITE: 0x0002,
  COPY_SRC: 0x0004,
  COPY_DST: 0x0008,
  INDEX: 0x0010,
  VERTEX: 0x0020,
  UNIFORM: 0x0040,
  STORAGE: 0x0080,
  INDIRECT: 0x0100,
  QUERY_RESOLVE: 0x0200
} as const;

function toTypedArray<T extends TypedArrayView>(
  data: T | readonly number[],
  format: GPUBufferNumericFormat
): T {
  if (ArrayBuffer.isView(data)) {
    return data as T;
  }
  switch (format) {
    case 'i32':
      return new Int32Array(data) as unknown as T;
    case 'u32':
      return new Uint32Array(data) as unknown as T;
    case 'f32':
    default:
      return new Float32Array(data) as unknown as T;
  }
}

/**
 * Creates a simulated in-memory WebGPU device for headless environments or browsers without WebGPU.
 * Preserves identical zero-copy ArrayBuffer semantics for unit tests and SSR.
 */
export function createSimulatedGPUDevice(): WebGPUDeviceLike {
  const bufferMemoryMap = new WeakMap<WebGPUBufferLike, ArrayBuffer>();

  return {
    queue: {
      writeBuffer(buffer, bufferOffset, data, dataOffset = 0, size) {
        const target = bufferMemoryMap.get(buffer);
        if (!target) return;
        const srcBuffer = ArrayBuffer.isView(data)
          ? new Uint8Array(data.buffer, data.byteOffset + dataOffset, size ?? data.byteLength - dataOffset)
          : new Uint8Array(data, dataOffset, size);
        new Uint8Array(target, bufferOffset, srcBuffer.byteLength).set(srcBuffer);
      },
      submit() {
        // Simulated command queue submission
      }
    },
    createBuffer(descriptor) {
      const raw = new ArrayBuffer(descriptor.size);
      const buf: WebGPUBufferLike = {
        size: descriptor.size,
        usage: descriptor.usage,
        async mapAsync() {},
        getMappedRange(offset = 0, size = descriptor.size - offset) {
          return raw.slice(offset, offset + size);
        },
        unmap() {},
        destroy() {
          bufferMemoryMap.delete(buf);
        }
      };
      bufferMemoryMap.set(buf, raw);
      return buf;
    }
  };
}

/**
 * Binds a reactive Signal TypedArray directly to a WebGPU GPUBuffer.
 * Mutations to the signal or via writeSubData automatically flush to the GPU queue.
 */
export function createGPUBufferSignal<T extends TypedArrayView = Float32Array>(
  options: GPUBufferSignalOptions<T>
): GPUBoundSignal<T> {
  const format = options.format ?? 'f32';
  const device = options.device ?? createSimulatedGPUDevice();
  const initialArray = toTypedArray<T>(options.initialData, format);
  const byteLength = Math.max(4, Math.ceil(initialArray.byteLength / 4) * 4);
  const usage =
    options.usage ??
    (GPU_BUFFER_USAGE.STORAGE | GPU_BUFFER_USAGE.COPY_DST | GPU_BUFFER_USAGE.COPY_SRC);

  const gpuBuffer = device.createBuffer({
    size: byteLength,
    usage,
    label: options.label ?? 'zuari-gpu-signal-buffer'
  });

  const sig = signal<T>(initialArray);
  let isReadingBack = false;

  const flushToGPU = () => {
    const current = sig.value;
    device.queue.writeBuffer(gpuBuffer, 0, current, 0, current.byteLength);
  };

  const disposeEffect = effect(() => {
    // Track reactive array signal replacements and flush on initialization + mutations
    void sig.value;
    if (!isReadingBack) {
      flushToGPU();
    }
  });


  const writeSubData = (offsetIndex: number, values: ArrayLike<number>) => {
    const current = sig.value;
    current.set(values, offsetIndex);
    const bytesPerElement = current.BYTES_PER_ELEMENT;
    const byteOffset = offsetIndex * bytesPerElement;
    const subView = current.subarray(offsetIndex, offsetIndex + values.length);
    device.queue.writeBuffer(gpuBuffer, byteOffset, subView, 0, subView.byteLength);
    // Clone view reference to trigger fine-grained reactive subscribers with zero GPU re-allocation
    isReadingBack = true;
    try {
      sig.value = current.slice() as unknown as T;
    } finally {
      isReadingBack = false;
    }
  };

  const readFromGPU = async (): Promise<T> => {
    if (typeof gpuBuffer.mapAsync === 'function' && typeof gpuBuffer.getMappedRange === 'function') {
      await gpuBuffer.mapAsync(GPU_BUFFER_USAGE.MAP_READ);
      const mapped = gpuBuffer.getMappedRange(0, initialArray.byteLength);
      const copy = mapped.slice(0);
      gpuBuffer.unmap?.();

      let updated: T;
      switch (format) {
        case 'i32':
          updated = new Int32Array(copy) as unknown as T;
          break;
        case 'u32':
          updated = new Uint32Array(copy) as unknown as T;
          break;
        case 'f32':
        default:
          updated = new Float32Array(copy) as unknown as T;
          break;
      }

      isReadingBack = true;
      try {
        sig.value = updated;
      } finally {
        isReadingBack = false;
      }
      return updated;
    }
    return sig.value;
  };

  return {
    signal: sig,
    gpuBuffer,
    byteLength,
    format,
    writeSubData,
    flushToGPU,
    readFromGPU,
    destroy: () => {
      disposeEffect();
      gpuBuffer.destroy();
    }
  };
}

/**
 * Compiles a WGSL compute shader and binds it to reactive GPUBoundSignal buffers.
 */
export function createComputeShader(options: ComputeShaderOptions): ComputePipelineController {
  const entryPoint = options.entryPoint ?? 'main';
  const device = options.device ?? createSimulatedGPUDevice();
  const dispatchCount = signal(0);

  let shaderModule: unknown = null;
  let pipeline: unknown = null;

  if (device.createShaderModule && device.createComputePipeline) {
    shaderModule = device.createShaderModule({
      code: options.code,
      label: `zuari-wgsl-${entryPoint}`
    });
    pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint
      }
    });
  }

  const dispatch = async (
    workgroupCountX = 1,
    workgroupCountY = 1,
    workgroupCountZ = 1
  ): Promise<void> => {
    if (pipeline && device.createCommandEncoder && device.createBindGroup) {
      const entries = options.bindings.map((b, index) => ({
        binding: index,
        resource: { buffer: b.gpuBuffer }
      }));
      const bindGroup = device.createBindGroup({
        layout: (pipeline as { getBindGroupLayout?: (idx: number) => unknown }).getBindGroupLayout?.(0) ?? 'auto',
        entries
      });

      const encoder = device.createCommandEncoder({ label: 'zuari-compute-encoder' });
      const pass = encoder.beginComputePass({ label: 'zuari-compute-pass' });
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      pass.dispatchWorkgroups(workgroupCountX, workgroupCountY, workgroupCountZ);
      pass.end();
      device.queue.submit([encoder.finish()]);
    } else if (options.cpuFallback) {
      const views = options.bindings.map((b) => b.signal.value);
      options.cpuFallback(views, [workgroupCountX, workgroupCountY, workgroupCountZ]);
      for (const bound of options.bindings) {
        bound.flushToGPU();
        // Notify signal subscribers of in-place compute update
        bound.signal.value = bound.signal.value.slice() as TypedArrayView;
      }
    }

    dispatchCount.value = dispatchCount.value + 1;
  };

  return {
    code: options.code,
    entryPoint,
    dispatchCount,
    dispatch,
    destroy: () => {
      shaderModule = null;
      pipeline = null;
    }
  };
}
