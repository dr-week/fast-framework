// [WGSL WebGPU Parallel Compute Shader] — Zero-Copy GPUBuffer Signal Kernel
// Bound directly to @zuari/webgpu createGPUBufferSignal & createComputeShader

struct QuantumTelemetryFrame {
    frame_tick: u32,
    harmonic_pos: f32,
    plasma_flux: f32,
    _pad: u32,
};

@group(0) @binding(0) var<storage, read_write> particle_field: array<f32>;
@group(0) @binding(1) var<uniform> telemetry: QuantumTelemetryFrame;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let idx = global_id.x;
    if (idx >= arrayLength(&particle_field)) {
        return;
    }
    particle_field[idx] = fma(particle_field[idx], 1.15, telemetry.plasma_flux * 0.25);
}
