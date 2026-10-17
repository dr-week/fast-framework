import { describe, it, expect, vi } from 'vitest';
import { effect } from '@zuari/signals';
import {
  createGPUBufferSignal,
  createComputeShader,
  createSimulatedGPUDevice,
  GPU_BUFFER_USAGE
} from './index.js';

describe('@zuari/webgpu', () => {
  it('binds a Float32Array signal directly to a GPUBuffer and flushes updates', async () => {
    const device = createSimulatedGPUDevice();
    const writeSpy = vi.spyOn(device.queue, 'writeBuffer');

    const gpuSig = createGPUBufferSignal({
      device,
      initialData: [1.0, 2.0, 3.0, 4.0],
      format: 'f32'
    });

    expect(gpuSig.byteLength).toBe(16);
    expect(gpuSig.gpuBuffer.usage & GPU_BUFFER_USAGE.STORAGE).toBeTruthy();
    expect(writeSpy).toHaveBeenCalledTimes(1);

    // Partial update via writeSubData
    let reactionCount = 0;
    effect(() => {
      void gpuSig.signal.value;
      reactionCount++;
    });

    gpuSig.writeSubData(2, [99.5, 100.25]);
    expect(gpuSig.signal.value[2]).toBe(99.5);
    expect(gpuSig.signal.value[3]).toBe(100.25);
    expect(reactionCount).toBeGreaterThanOrEqual(2);

    // Verify GPU readback
    const readback = await gpuSig.readFromGPU();
    expect(Array.from(readback)).toEqual([1.0, 2.0, 99.5, 100.25]);

    gpuSig.destroy();
  });

  it('executes WGSL compute shader pipeline and updates bound signal buffers', async () => {
    const dataBuffer = createGPUBufferSignal({
      initialData: new Float32Array([10, 20, 30, 40])
    });

    const wgsl = `
      @group(0) @binding(0) var<storage, read_write> data: array<f32>;
      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) id: vec3<u32>) {
        data[id.x] = data[id.x] * 2.0;
      }
    `;

    const pipeline = createComputeShader({
      code: wgsl,
      bindings: [dataBuffer],
      cpuFallback: ([buf]) => {
        if (!buf) return;
        for (let i = 0; i < buf.length; i++) {
          buf[i] = (buf[i] ?? 0) * 2;
        }
      }
    });

    expect(pipeline.dispatchCount.value).toBe(0);
    await pipeline.dispatch(1);
    expect(pipeline.dispatchCount.value).toBe(1);
    expect(Array.from(dataBuffer.signal.value)).toEqual([20, 40, 60, 80]);

    pipeline.destroy();
    dataBuffer.destroy();
  });
});
