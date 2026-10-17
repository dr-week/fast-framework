/**
 * @fileoverview Type definitions for @zuari/quantum.
 * Defines `QuantumNodeState`, multi-qubit registers, OpenQASM 3.0 ASTs,
 * and Neuromorphic Cognitive Units (Spiking LIF Neurons, STDP Synapses, Cortical Oscillators).
 */

import type { Signal, Computed } from '@zuari/signals';

/** 3D Cartesian coordinates on the unit Bloch Sphere: x, y, z in [-1, 1] */
export interface BlochVector3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Complex probability amplitude: a + b*i */
export interface ComplexAmplitude {
  readonly re: number;
  readonly im: number;
}

/** Supported quantum gates for single-qubit and multi-qubit unitary transforms */
export type QuantumGateKind = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'RX' | 'RY' | 'RZ' | 'CNOT' | 'CZ';

/** Recorded quantum gate instruction for OpenQASM 3.0 & QIR emission */
export interface QuantumInstruction {
  readonly gate: QuantumGateKind;
  readonly target: number;
  readonly control?: number;
  readonly thetaRad?: number;
}

/** Configuration options for creating a reactive QuantumNodeState */
export interface QuantumNodeConfig {
  readonly id: string;
  /** Initial polar angle theta in radians [0, PI] (0 = |0>, PI = |1>) */
  readonly initialTheta?: number;
  /** Initial azimuthal phase angle phi in radians [0, 2*PI] */
  readonly initialPhi?: number;
  /** T1 longitudinal relaxation time in microseconds (default: 120 us) */
  readonly t1Micros?: number;
  /** T2 transverse dephasing time in microseconds (default: 85 us) */
  readonly t2Micros?: number;
  /** Optional shared ArrayBuffer for zero-copy C-ABI / Rust / Zig synchronization */
  readonly memory?: ArrayBuffer;
  /** Byte offset in the shared ArrayBuffer (32-byte aligned struct) */
  readonly baseOffset?: number;
}

/**
 * `QuantumNodeState`: First-class reactive Quantum Qubit & Coherence Node.
 * Tracks complex amplitudes (alpha, beta), Bloch vector (x, y, z), coherence purity,
 * T1/T2 decoherence decay, and entanglement partner linkage.
 */
export interface QuantumNodeState {
  readonly id: string;
  /** Polar angle theta in radians [0, PI] */
  readonly theta: Signal<number>;
  /** Azimuthal phase angle phi in radians [0, 2*PI] */
  readonly phi: Signal<number>;
  /** Quantum phase coherence purity in [0.0, 1.0] (1.0 = pure state, 0.0 = maximally mixed/decohered) */
  readonly coherence: Signal<number>;
  /** ID of the entangled partner QuantumNodeState, or null if separable */
  readonly entangledWith: Signal<string | null>;
  /** Probability of measuring basis state |0>: P(|0>) = cos^2(theta/2) */
  readonly probZero: Computed<number>;
  /** Probability of measuring basis state |1>: P(|1>) = sin^2(theta/2) */
  readonly probOne: Computed<number>;
  /** Live 3D Bloch sphere coordinates scaled by coherence */
  readonly blochVector: Computed<BlochVector3D>;
  /** Complex amplitudes [alpha, beta] */
  readonly amplitudes: Computed<{ readonly alpha: ComplexAmplitude; readonly beta: ComplexAmplitude }>;
  /** Applies a single-qubit unitary gate ('H' | 'X' | 'Y' | 'Z' | 'S' | 'T' | 'RX' | 'RY' | 'RZ') */
  applyGate(gate: Exclude<QuantumGateKind, 'CNOT' | 'CZ'>, angleRad?: number): void;
  /** Simulates T1/T2 thermal decoherence over elapsedMicroseconds */
  stepDecoherence(elapsedMicroseconds: number): void;
  /** Performs a projective Born-rule measurement, collapsing superposition to 0 or 1 */
  measure(deterministicRandom?: number): 0 | 1;
  /** Resets qubit to pure ground state |0> with 1.0 coherence */
  reset(): void;
  /** Underlying 32-byte zero-copy C-ABI linear memory buffer */
  readonly buffer: ArrayBuffer;
}

/**
 * Multi-Qubit Quantum Register supporting genuine 2^N complex statevector simulation,
 * Bell-state / GHZ entanglement, and OpenQASM 3.0 code generation.
 */
export interface QuantumRegister {
  readonly numQubits: number;
  /** Interleaved [re_0, im_0, re_1, im_1, ...] statevector of length 2 * 2^numQubits */
  readonly stateVector: Signal<Float64Array>;
  /** Basis state probabilities [P(|00...0>), ..., P(|11...1>)] of length 2^numQubits */
  readonly probabilities: Computed<readonly number[]>;
  /** Bipartite entanglement purity / Bell concurrence metric in [0, 1] */
  readonly entanglementConcurrence: Computed<number>;
  /** History of applied quantum gate instructions */
  readonly circuitLog: Signal<readonly QuantumInstruction[]>;
  /** Applies a single-qubit gate to target qubit */
  applySingleGate(gate: Exclude<QuantumGateKind, 'CNOT' | 'CZ'>, target: number, thetaRad?: number): void;
  /** Applies a two-qubit entangling CNOT (CX) gate */
  applyCNOT(control: number, target: number): void;
  /** Prepares a maximally entangled Bell state (|00> + |11>) / sqrt(2) on qubits (qA, qB) */
  entangleBellPair(qA?: number, qB?: number): void;
  /** Collapses the register according to Born-rule probabilities and returns the bitstring (e.g. "11") */
  measureAll(deterministicRandom?: number): string;
  /** Resets register to |00...0> and clears the circuit log */
  reset(): void;
  /** Emits industry-standard OpenQASM 3.0 source code for the current circuit */
  toOpenQASM3(): string;
}

/** Configuration for a Leaky Integrate-and-Fire (LIF) Neuromorphic Cognitive Unit */
export interface CognitiveUnitConfig {
  readonly id: string;
  /** Resting membrane potential (default: 0.0) */
  readonly restingPotential?: number;
  /** Firing action potential threshold (default: 1.0) */
  readonly firingThreshold?: number;
  /** Membrane leak decay factor per tick in (0, 1) (default: 0.92) */
  readonly leakFactor?: number;
  /** Coupled QuantumNodeState modulating stochastic quantum tunneling / attention gain */
  readonly coupledQuantumNode?: QuantumNodeState;
}

/**
 * `CognitiveUnit`: Bio-inspired Spiking Neural / Neuromorphic Cognitive Primitive.
 * Models membrane potential integration, spike-timing firing, synaptic plasticity,
 * and quantum-modulated attention coherence.
 */
export interface CognitiveUnit {
  readonly id: string;
  /** Current membrane potential v(t) */
  readonly membranePotential: Signal<number>;
  /** Firing rate / activation energy trace in [0, 1] */
  readonly firingTrace: Signal<number>;
  /** Total cumulative action potential spikes emitted */
  readonly spikeCount: Signal<number>;
  /** Synaptic plasticity weight w_ij (updated via Hebbian / STDP learning) */
  readonly synapticWeight: Signal<number>;
  /** Combined Quantum-Cognitive Free Energy / Salience metric */
  readonly salienceScore: Computed<number>;
  /** Injects synaptic current I(t) and returns true if an action potential spike occurred */
  integrateStimulus(inputCurrent: number): boolean;
  /** Applies Spike-Timing-Dependent Plasticity (STDP) given pre-post delta time in ms */
  applySTDP(deltaTimeMs: number): void;
  /** Resets potential and spike counters */
  reset(): void;
}
