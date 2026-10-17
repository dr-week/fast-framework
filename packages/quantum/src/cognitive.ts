/**
 * @fileoverview Bio-Inspired Neuromorphic `CognitiveUnit` Primitives (`@zuari/quantum`).
 * Implements Leaky Integrate-and-Fire (LIF) spiking dynamics, Spike-Timing-Dependent
 * Plasticity (STDP), and Quantum-Cognitive coherence coupling.
 */

import { signal, computed, batch } from '@zuari/signals';
import type { CognitiveUnitConfig, CognitiveUnit } from './types.js';

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Creates a reactive Neuromorphic `CognitiveUnit` (Leaky Integrate-and-Fire Spiking Node)
 * optionally coupled to a `QuantumNodeState` for quantum-modulated attention salience.
 */
export function createCognitiveUnit(config: CognitiveUnitConfig): CognitiveUnit {
  const vRest = config.restingPotential ?? 0.0;
  const vThresh = config.firingThreshold ?? 1.0;
  const leak = clamp(config.leakFactor ?? 0.9, 0.1, 0.999);
  const qNode = config.coupledQuantumNode;

  const membranePotential = signal<number>(vRest);
  const firingTrace = signal<number>(0.0);
  const spikeCount = signal<number>(0);
  const synapticWeight = signal<number>(0.65);

  const salienceScore = computed<number>(() => {
    const qBoost = qNode ? 0.5 + 0.5 * qNode.coherence.value * (0.5 + qNode.probOne.value) : 1.0;
    const raw = (membranePotential.value * 0.4 + firingTrace.value * 0.6) * synapticWeight.value * qBoost;
    return Number(clamp(raw, 0, 2).toFixed(4));
  });

  function integrateStimulus(inputCurrent: number): boolean {
    const quantumGain = qNode ? 1 + 0.35 * qNode.coherence.value : 1.0;
    const nextV = membranePotential.value * leak + inputCurrent * synapticWeight.value * quantumGain;

    if (nextV >= vThresh) {
      batch(() => {
        membranePotential.value = vRest;
        firingTrace.value = Number(clamp(firingTrace.value * 0.65 + 0.55, 0, 1).toFixed(4));
        spikeCount.value += 1;
        // Quantum back-action: spiking slightly rotates coupled qubit phase
        if (qNode) {
          qNode.applyGate('RZ', Math.PI / 8);
        }
      });
      return true;
    }

    batch(() => {
      membranePotential.value = Number(Math.max(vRest, nextV).toFixed(4));
      firingTrace.value = Number((firingTrace.value * leak).toFixed(4));
    });
    return false;
  }

  function applySTDP(deltaTimeMs: number): void {
    // Biologically plausible STDP window:
    // deltaTimeMs > 0 (pre before post) -> Long-Term Potentiation (LTP)
    // deltaTimeMs < 0 (post before pre) -> Long-Term Depression (LTD)
    const tauPlus = 20.0;
    const tauMinus = 20.0;
    const aPlus = 0.08;
    const aMinus = -0.06;

    const deltaW =
      deltaTimeMs >= 0
        ? aPlus * Math.exp(-deltaTimeMs / tauPlus)
        : aMinus * Math.exp(deltaTimeMs / tauMinus);

    synapticWeight.value = Number(clamp(synapticWeight.value + deltaW, 0.05, 2.0).toFixed(4));
  }

  function reset(): void {
    batch(() => {
      membranePotential.value = vRest;
      firingTrace.value = 0.0;
      spikeCount.value = 0;
      synapticWeight.value = 0.65;
    });
  }

  return {
    id: config.id,
    membranePotential,
    firingTrace,
    spikeCount,
    synapticWeight,
    salienceScore,
    integrateStimulus,
    applySTDP,
    reset
  };
}
