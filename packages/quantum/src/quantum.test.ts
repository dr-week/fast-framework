import { describe, it, expect } from 'vitest';
import {
  createQuantumNodeState,
  entangleQuantumNodes,
  createQuantumRegister,
  createCognitiveUnit
} from './index.js';

describe('@zuari/quantum', () => {
  it('initializes QuantumNodeState at |0> and applies Hadamard & Pauli-X gates accurately', () => {
    const q0 = createQuantumNodeState({ id: 'qubit-0' });
    expect(q0.probZero.value).toBe(1);
    expect(q0.probOne.value).toBe(0);
    expect(q0.blochVector.value.z).toBe(1);

    // Apply Hadamard H -> equal superposition |+> (P(|0>) = 0.5, P(|1>) = 0.5, x = 1, z = 0)
    q0.applyGate('H');
    expect(q0.probZero.value).toBeCloseTo(0.5, 3);
    expect(q0.probOne.value).toBeCloseTo(0.5, 3);
    expect(q0.blochVector.value.x).toBeCloseTo(1, 3);

    // Verify 32-byte zero-copy linear memory buffer synchronization
    const view = new DataView(q0.buffer);
    expect(view.getFloat64(0, true)).toBeCloseTo(Math.PI / 2, 4);

    // Reset and apply Pauli-X -> |1>
    q0.reset();
    q0.applyGate('X');
    expect(q0.probZero.value).toBeCloseTo(0, 3);
    expect(q0.probOne.value).toBeCloseTo(1, 3);
    expect(q0.blochVector.value.z).toBeCloseTo(-1, 3);
  });

  it('models T2 decoherence relaxation and entangles QuantumNodeState pairs', () => {
    const qA = createQuantumNodeState({ id: 'qA', t2Micros: 50 });
    const qB = createQuantumNodeState({ id: 'qB', t2Micros: 50 });

    entangleQuantumNodes(qA, qB);
    expect(qA.entangledWith.value).toBe('qB');
    expect(qB.entangledWith.value).toBe('qA');

    qA.stepDecoherence(50);
    expect(qA.coherence.value).toBeCloseTo(Math.exp(-1), 2);
  });

  it('prepares a maximally entangled Bell state (|00> + |11>)/sqrt(2) and emits OpenQASM 3.0', () => {
    const reg = createQuantumRegister(2);
    reg.entangleBellPair(0, 1);

    // Probabilities for |00>, |01>, |10>, |11> should be [0.5, 0, 0, 0.5]
    expect(reg.probabilities.value[0]).toBeCloseTo(0.5, 3);
    expect(reg.probabilities.value[1]).toBeCloseTo(0, 3);
    expect(reg.probabilities.value[2]).toBeCloseTo(0, 3);
    expect(reg.probabilities.value[3]).toBeCloseTo(0.5, 3);

    // Maximal Bell entanglement concurrence = 1.0
    expect(reg.entanglementConcurrence.value).toBeCloseTo(1.0, 3);

    const qasm = reg.toOpenQASM3();
    expect(qasm).toContain('OPENQASM 3.0;');
    expect(qasm).toContain('h q[0];');
    expect(qasm).toContain('cx q[0], q[1];');

    // Deterministic measurement collapse to |11>
    const bitstring = reg.measureAll(0.95);
    expect(bitstring).toBe('11');
    expect(reg.probabilities.value[3]).toBe(1);
  });

  it('integrates stimuli, triggers action potential spikes, and applies STDP in CognitiveUnit', () => {
    const qNode = createQuantumNodeState({ id: 'attention-qubit' });
    qNode.applyGate('H');

    const neuron = createCognitiveUnit({
      id: 'lif-cortical-01',
      firingThreshold: 1.0,
      coupledQuantumNode: qNode
    });

    // Sub-threshold stimulus integrates potential without spiking
    const spiked1 = neuron.integrateStimulus(0.5);
    expect(spiked1).toBe(false);
    expect(neuron.membranePotential.value).toBeGreaterThan(0);

    // Supra-threshold stimulus triggers action potential spike
    const spiked2 = neuron.integrateStimulus(1.5);
    expect(spiked2).toBe(true);
    expect(neuron.spikeCount.value).toBe(1);

    // Apply causal STDP (+10ms) -> Long-Term Potentiation increases synaptic weight
    const prevWeight = neuron.synapticWeight.value;
    neuron.applySTDP(10);
    expect(neuron.synapticWeight.value).toBeGreaterThan(prevWeight);
  });
});
