/**
 * @fileoverview N-qubit statevector register for quantum state simulation,
 * multi-qubit unitary gate transformations, entanglement concurrence, and OpenQASM 3.0 export.
 */

import { signal, computed, batch } from '@zuari/signals';
import type {
  QuantumGateKind,
  QuantumRegister,
  QuantumInstruction
} from './types.js';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
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
