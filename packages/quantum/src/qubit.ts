/**
 * @fileoverview Single Qubit `QuantumNodeState` Implementation.
 * Implements zero-copy C-ABI / Wasm linear memory synchronization, 3D Bloch sphere
 * kinematics, T1/T2 thermal decoherence, and single-qubit unitary gates.
 */

import { signal, computed, effect, batch } from '@zuari/signals';
import type {
  QuantumNodeConfig,
  QuantumNodeState,
  QuantumGateKind,
  BlochVector3D
} from './types.js';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function normalizeAngle(rad: number): number {
  const twoPi = Math.PI * 2;
  return ((rad % twoPi) + twoPi) % twoPi;
}

/**
 * Creates a reactive `QuantumNodeState` bound to a 32-byte C-ABI aligned ArrayBuffer:
 *   offset +0B : theta (f64)
 *   offset +8B : phi (f64)
 *   offset +16B: coherence (f64)
 *   offset +24B: entangled flag (f64: 1.0 or 0.0)
 */
export function createQuantumNodeState(config: QuantumNodeConfig): QuantumNodeState {
  const buffer = config.memory ?? new ArrayBuffer(32);
  const base = config.baseOffset ?? 0;
  const view = new DataView(buffer, base, 32);

  const initialTheta = clamp(config.initialTheta ?? 0, 0, Math.PI);
  const initialPhi = normalizeAngle(config.initialPhi ?? 0);
  const t2Micros = Math.max(1, config.t2Micros ?? 85);

  const theta = signal<number>(initialTheta);
  const phi = signal<number>(initialPhi);
  const coherence = signal<number>(1.0);
  const entangledWith = signal<string | null>(null);

  // Flush reactive mutations directly into the 32-byte linear memory buffer
  effect(() => {
    view.setFloat64(0, theta.value, true);
    view.setFloat64(8, phi.value, true);
    view.setFloat64(16, coherence.value, true);
    view.setFloat64(24, entangledWith.value ? 1.0 : 0.0, true);
  });

  const probZero = computed<number>(() => {
    const pureP0 = Math.cos(theta.value / 2) ** 2;
    const c = coherence.value;
    // As coherence -> 0, probabilities relax toward maximally mixed 0.5
    return Number((c * pureP0 + (1 - c) * 0.5).toFixed(4));
  });

  const probOne = computed<number>(() => {
    const pureP1 = Math.sin(theta.value / 2) ** 2;
    const c = coherence.value;
    return Number((c * pureP1 + (1 - c) * 0.5).toFixed(4));
  });

  const blochVector = computed<BlochVector3D>(() => {
    const t = theta.value;
    const p = phi.value;
    const c = coherence.value;
    return {
      x: Number((c * Math.sin(t) * Math.cos(p)).toFixed(4)),
      y: Number((c * Math.sin(t) * Math.sin(p)).toFixed(4)),
      z: Number((c * Math.cos(t)).toFixed(4))
    };
  });

  const amplitudes = computed(() => {
    const halfT = theta.value / 2;
    const p = phi.value;
    const alphaRe = Number(Math.cos(halfT).toFixed(4));
    const sinHalf = Math.sin(halfT);
    const betaRe = Number((sinHalf * Math.cos(p)).toFixed(4));
    const betaIm = Number((sinHalf * Math.sin(p)).toFixed(4));
    return {
      alpha: { re: alphaRe, im: 0 },
      beta: { re: betaRe, im: betaIm }
    };
  });

  function applyGate(gate: Exclude<QuantumGateKind, 'CNOT' | 'CZ'>, angleRad = Math.PI / 2): void {
    // Convert current Bloch state to unit vector, rotate on SO(3), and extract new (theta, phi)
    const t = theta.value;
    const p = phi.value;
    let x = Math.sin(t) * Math.cos(p);
    let y = Math.sin(t) * Math.sin(p);
    let z = Math.cos(t);

    switch (gate) {
      case 'H': {
        // Hadamard swaps X and Z axes and negates Y
        const nx = z;
        const ny = -y;
        const nz = x;
        x = nx;
        y = ny;
        z = nz;
        break;
      }
      case 'X': {
        // Pauli-X: PI rotation around X axis (y -> -y, z -> -z)
        y = -y;
        z = -z;
        break;
      }
      case 'Y': {
        // Pauli-Y: PI rotation around Y axis (x -> -x, z -> -z)
        x = -x;
        z = -z;
        break;
      }
      case 'Z': {
        // Pauli-Z: PI rotation around Z axis (x -> -x, y -> -y)
        x = -x;
        y = -y;
        break;
      }
      case 'S': {
        // Phase S gate: +PI/2 around Z
        const nx = -y;
        const ny = x;
        x = nx;
        y = ny;
        break;
      }
      case 'T': {
        // Pi/8 T gate: +PI/4 around Z
        const c4 = Math.cos(Math.PI / 4);
        const s4 = Math.sin(Math.PI / 4);
        const nx = x * c4 - y * s4;
        const ny = x * s4 + y * c4;
        x = nx;
        y = ny;
        break;
      }
      case 'RX': {
        const c = Math.cos(angleRad);
        const s = Math.sin(angleRad);
        const ny = y * c - z * s;
        const nz = y * s + z * c;
        y = ny;
        z = nz;
        break;
      }
      case 'RY': {
        const c = Math.cos(angleRad);
        const s = Math.sin(angleRad);
        const nx = x * c + z * s;
        const nz = -x * s + z * c;
        x = nx;
        z = nz;
        break;
      }
      case 'RZ': {
        const c = Math.cos(angleRad);
        const s = Math.sin(angleRad);
        const nx = x * c - y * s;
        const ny = x * s + y * c;
        x = nx;
        y = ny;
        break;
      }
    }

    const nextTheta = Math.acos(clamp(z, -1, 1));
    const nextPhi = Math.hypot(x, y) < 1e-7 ? 0 : normalizeAngle(Math.atan2(y, x));

    batch(() => {
      theta.value = Number(nextTheta.toFixed(6));
      phi.value = Number(nextPhi.toFixed(6));
    });
  }

  function stepDecoherence(elapsedMicroseconds: number): void {
    if (elapsedMicroseconds <= 0) return;
    const decay = Math.exp(-elapsedMicroseconds / t2Micros);
    coherence.value = Math.max(0, Number((coherence.value * decay).toFixed(4)));
  }

  function measure(deterministicRandom?: number): 0 | 1 {
    const r = deterministicRandom ?? Math.random();
    const p0 = probZero.value;
    const outcome: 0 | 1 = r < p0 ? 0 : 1;

    batch(() => {
      theta.value = outcome === 0 ? 0 : Math.PI;
      phi.value = 0;
      coherence.value = 1.0;
    });

    return outcome;
  }

  function reset(): void {
    batch(() => {
      theta.value = initialTheta;
      phi.value = initialPhi;
      coherence.value = 1.0;
      entangledWith.value = null;
    });
  }

  return {
    id: config.id,
    theta,
    phi,
    coherence,
    entangledWith,
    probZero,
    probOne,
    blochVector,
    amplitudes,
    applyGate,
    stepDecoherence,
    measure,
    reset,
    buffer
  };
}

/**
 * Entangles two `QuantumNodeState` instances into a correlated Bell pair.
 */
export function entangleQuantumNodes(nodeA: QuantumNodeState, nodeB: QuantumNodeState): void {
  batch(() => {
    nodeA.applyGate('H');
    nodeB.theta.value = nodeA.theta.value;
    nodeB.phi.value = nodeA.phi.value;
    nodeA.entangledWith.value = nodeB.id;
    nodeB.entangledWith.value = nodeA.id;
  });
}
