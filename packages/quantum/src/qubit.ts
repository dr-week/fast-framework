/**
 * @fileoverview `QuantumNodeState` & Multi-Qubit Statevector Engine (`@zuari/quantum`).
 * Implements zero-copy C-ABI / Wasm linear memory synchronization, 3D Bloch sphere
 * kinematics, T1/T2 thermal decoherence, unitary gates, and OpenQASM 3.0 compilation.
 */

import { signal, computed, effect, batch } from '@zuari/signals';
import type {
  QuantumNodeConfig,
  QuantumNodeState,
  QuantumGateKind,
  QuantumRegister,
  QuantumInstruction,
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
    coherence.value = Number(clamp(coherence.value * decay, 0, 1).toFixed(4));
  }

  function measure(deterministicRandom?: number): 0 | 1 {
    const r = deterministicRandom ?? Math.random();
    const outcome: 0 | 1 = r < probZero.value ? 0 : 1;
    batch(() => {
      theta.value = outcome === 0 ? 0 : Math.PI;
      phi.value = 0;
      coherence.value = 1.0;
      entangledWith.value = null;
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

/**
 * Creates an N-qubit statevector register supporting unitary gates, CNOT entanglement,
 * concurrence calculation, and OpenQASM 3.0 export.
 */
export function createQuantumRegister(numQubits = 2): QuantumRegister {
  const n = clamp(Math.trunc(numQubits), 1, 8);
  const dim = 1 << n; // 2^n basis states

  function createGroundState(): Float64Array {
    const vec = new Float64Array(dim * 2);
    vec[0] = 1.0; // |00...0> amplitude = 1 + 0i
    return vec;
  }

  const stateVector = signal<Float64Array>(createGroundState());
  const circuitLog = signal<readonly QuantumInstruction[]>([]);

  const probabilities = computed<readonly number[]>(() => {
    const vec = stateVector.value;
    const probs: number[] = [];
    for (let i = 0; i < dim; i++) {
      const re = vec[i * 2]!;
      const im = vec[i * 2 + 1]!;
      probs.push(Number((re * re + im * im).toFixed(4)));
    }
    return probs;
  });

  // For a 2-qubit register, Concurrence C = 2 * |a00 * a11 - a01 * a10|
  const entanglementConcurrence = computed<number>(() => {
    const vec = stateVector.value;
    if (n < 2) return 0;
    const a00Re = vec[0]!, a00Im = vec[1]!;
    const a01Re = vec[2]!, a01Im = vec[3]!;
    const a10Re = vec[4]!, a10Im = vec[5]!;
    const a11Re = vec[6]!, a11Im = vec[7]!;

    // (a00 * a11) - (a01 * a10)
    const p1Re = a00Re * a11Re - a00Im * a11Im;
    const p1Im = a00Re * a11Im + a00Im * a11Re;
    const p2Re = a01Re * a10Re - a01Im * a10Im;
    const p2Im = a01Re * a10Im + a01Im * a10Re;

    const diffRe = p1Re - p2Re;
    const diffIm = p1Im - p2Im;
    const c = 2 * Math.hypot(diffRe, diffIm);
    return Number(clamp(c, 0, 1).toFixed(4));
  });

  function applySingleGate(
    gate: Exclude<QuantumGateKind, 'CNOT' | 'CZ'>,
    target: number,
    thetaRad = Math.PI / 2
  ): void {
    const q = clamp(Math.trunc(target), 0, n - 1);
    const bitMask = 1 << (n - 1 - q);
    const next = stateVector.value.slice();

    // 2x2 complex unitary matrix entries: [[u00Re, u00Im, u01Re, u01Im], [u10Re, u10Im, u11Re, u11Im]]
    const invSqrt2 = Math.SQRT1_2;
    let u00Re = 1, u00Im = 0, u01Re = 0, u01Im = 0;
    let u10Re = 0, u10Im = 0, u11Re = 1, u11Im = 0;

    switch (gate) {
      case 'H':
        u00Re = invSqrt2; u01Re = invSqrt2;
        u10Re = invSqrt2; u11Re = -invSqrt2;
        break;
      case 'X':
        u00Re = 0; u01Re = 1;
        u10Re = 1; u11Re = 0;
        break;
      case 'Y':
        u00Re = 0; u01Im = -1;
        u10Im = 1; u11Re = 0;
        break;
      case 'Z':
        u00Re = 1; u11Re = -1;
        break;
      case 'S':
        u00Re = 1; u11Re = 0; u11Im = 1;
        break;
      case 'T':
        u00Re = 1; u11Re = invSqrt2; u11Im = invSqrt2;
        break;
      case 'RY': {
        const c = Math.cos(thetaRad / 2);
        const s = Math.sin(thetaRad / 2);
        u00Re = c; u01Re = -s;
        u10Re = s; u11Re = c;
        break;
      }
      case 'RX': {
        const c = Math.cos(thetaRad / 2);
        const s = Math.sin(thetaRad / 2);
        u00Re = c; u01Im = -s;
        u10Im = -s; u11Re = c;
        break;
      }
      case 'RZ': {
        const c = Math.cos(thetaRad / 2);
        const s = Math.sin(thetaRad / 2);
        u00Re = c; u00Im = -s;
        u11Re = c; u11Im = s;
        break;
      }
    }

    for (let i = 0; i < dim; i++) {
      if ((i & bitMask) === 0) {
        const j = i | bitMask;
        const aRe = next[i * 2]!, aIm = next[i * 2 + 1]!;
        const bRe = next[j * 2]!, bIm = next[j * 2 + 1]!;

        next[i * 2] = u00Re * aRe - u00Im * aIm + (u01Re * bRe - u01Im * bIm);
        next[i * 2 + 1] = u00Re * aIm + u00Im * aRe + (u01Re * bIm + u01Im * bRe);

        next[j * 2] = u10Re * aRe - u10Im * aIm + (u11Re * bRe - u11Im * bIm);
        next[j * 2 + 1] = u10Re * aIm + u10Im * aRe + (u11Re * bIm + u11Im * bRe);
      }
    }

    batch(() => {
      stateVector.value = next;
      circuitLog.value = [
        ...circuitLog.value,
        {
          gate,
          target: q,
          ...(gate === 'RX' || gate === 'RY' || gate === 'RZ' ? { thetaRad } : {})
        }
      ];
    });
  }

  function applyCNOT(control: number, target: number): void {
    const c = clamp(Math.trunc(control), 0, n - 1);
    const t = clamp(Math.trunc(target), 0, n - 1);
    if (c === t) return;

    const controlMask = 1 << (n - 1 - c);
    const targetMask = 1 << (n - 1 - t);
    const next = stateVector.value.slice();

    for (let i = 0; i < dim; i++) {
      if ((i & controlMask) !== 0 && (i & targetMask) === 0) {
        const j = i | targetMask;
        const tmpRe = next[i * 2]!;
        const tmpIm = next[i * 2 + 1]!;
        next[i * 2] = next[j * 2]!;
        next[i * 2 + 1] = next[j * 2 + 1]!;
        next[j * 2] = tmpRe;
        next[j * 2 + 1] = tmpIm;
      }
    }

    batch(() => {
      stateVector.value = next;
      circuitLog.value = [...circuitLog.value, { gate: 'CNOT', control: c, target: t }];
    });
  }

  function entangleBellPair(qA = 0, qB = 1): void {
    reset();
    applySingleGate('H', qA);
    applyCNOT(qA, qB);
  }

  function measureAll(deterministicRandom?: number): string {
    const r = deterministicRandom ?? Math.random();
    const probs = probabilities.value;
    let cumulative = 0;
    let chosenIdx = dim - 1;
    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i]!;
      if (r <= cumulative) {
        chosenIdx = i;
        break;
      }
    }

    const collapsed = new Float64Array(dim * 2);
    collapsed[chosenIdx * 2] = 1.0;
    stateVector.value = collapsed;
    return chosenIdx.toString(2).padStart(n, '0');
  }

  function reset(): void {
    batch(() => {
      stateVector.value = createGroundState();
      circuitLog.value = [];
    });
  }

  function toOpenQASM3(): string {
    const lines = [
      'OPENQASM 3.0;',
      'include "stdgates.inc";',
      `qubit[${n}] q;`,
      `bit[${n}] c;`,
      ''
    ];
    for (const op of circuitLog.value) {
      if (op.gate === 'CNOT') {
        lines.push(`cx q[${op.control}], q[${op.target}];`);
      } else if (op.gate === 'RX' || op.gate === 'RY' || op.gate === 'RZ') {
        lines.push(`${op.gate.toLowerCase()}(${(op.thetaRad ?? 0).toFixed(4)}) q[${op.target}];`);
      } else {
        lines.push(`${op.gate.toLowerCase()} q[${op.target}];`);
      }
    }
    lines.push('c = measure q;');
    return lines.join('\n');
  }

  return {
    numQubits: n,
    stateVector,
    probabilities,
    entanglementConcurrence,
    circuitLog,
    applySingleGate,
    applyCNOT,
    entangleBellPair,
    measureAll,
    reset,
    toOpenQASM3
  };
}
