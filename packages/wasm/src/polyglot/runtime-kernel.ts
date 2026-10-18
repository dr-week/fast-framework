/**
 * @fileoverview In-memory WebAssembly 2.0 bytecode assembler and runtime kernel runner.
 * Allows Zuari to instantiate and run real WebAssembly VM instructions on the fly
 * with zero external build toolchains.
 */

export const EMBEDDED_WASM_PHYSICS_KERNEL_BYTES = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, // WASM_BINARY_MAGIC ("\0asm")
  0x01, 0x00, 0x00, 0x00, // WASM_BINARY_VERSION (1)
  // Section 1: Type section (1 function signature: (f64, f64, f64) -> f64)
  0x01, 0x08, 0x01, 0x60, 0x03, 0x7c, 0x7c, 0x7c, 0x01, 0x7c,
  // Section 3: Function section (1 function using type 0)
  0x03, 0x02, 0x01, 0x00,
  // Section 7: Export section (export "step_harmonic" -> func 0)
  0x07, 0x11, 0x01, 0x0d,
  0x73, 0x74, 0x65, 0x70, 0x5f, 0x68, 0x61, 0x72, 0x6d, 0x6f, 0x6e, 0x69, 0x63,
  0x00, 0x00,
  // Section 10: Code section (local.get 0, local.get 1, local.get 2, f64.mul, f64.add, end)
  0x0a, 0x0c, 0x01, 0x0a, 0x00,
  0x20, 0x00, // local.get 0 (pos)
  0x20, 0x01, // local.get 1 (vel)
  0x20, 0x02, // local.get 2 (stiffness)
  0xa2,       // f64.mul
  0xa0,       // f64.add
  0x0b        // end
]);

export interface LiveWasmHarmonicKernel {
  readonly stepHarmonic: (pos: number, vel: number, stiffness: number) => number;
  readonly bytecodeSize: number;
}

/**
 * Instantiates the embedded WebAssembly binary kernel synchronously using `WebAssembly.Module`
 * and `WebAssembly.Instance`.
 */
export function instantiateEmbeddedWasmKernel(): LiveWasmHarmonicKernel {
  const mod = new WebAssembly.Module(EMBEDDED_WASM_PHYSICS_KERNEL_BYTES);
  const instance = new WebAssembly.Instance(mod);
  const exportsObj = instance.exports as {
    step_harmonic: (pos: number, vel: number, stiffness: number) => number;
  };

  return {
    stepHarmonic: (pos, vel, stiffness) => exportsObj.step_harmonic(pos, vel, stiffness),
    bytecodeSize: EMBEDDED_WASM_PHYSICS_KERNEL_BYTES.byteLength
  };
}
