import { describe, it, expect, vi } from 'vitest';
import { createChildPart } from '@zuari/dom';
import { createPromptStream, createWebNNGraph } from './index.js';

describe('@zuari/ai', () => {
  it('streams tokens directly into a ChildNodePart text node via appendData without VDOM re-allocation', async () => {
    const container = document.createElement('div');
    const commentHole = document.createComment('zuari-hole-0');
    container.appendChild(commentHole);

    const childPart = createChildPart(commentHole);

    const promptStream = createPromptStream({
      session: {
        async prompt(input) {
          return `Hello ${input}`;
        },
        async *promptStreaming() {
          yield 'Zero-';
          yield 'latency ';
          yield 'WebNN ';
          yield 'stream!';
        }
      }
    });

    const unbind = promptStream.bindChildPart(childPart);
    const initialTextNode = container.firstChild as Text;
    expect(initialTextNode).toBeInstanceOf(Text);

    const appendSpy = vi.spyOn(initialTextNode, 'appendData');

    const finalOutput = await promptStream.stream('test prompt');

    expect(finalOutput).toBe('Zero-latency WebNN stream!');
    expect(promptStream.text.value).toBe('Zero-latency WebNN stream!');
    expect(promptStream.tokenCount.value).toBe(4);
    expect(promptStream.latestToken.value).toBe('stream!');
    // Verify the exact same Text node instance was mutated in-place via appendData 4 times
    expect(container.firstChild).toBe(initialTextNode);
    expect(initialTextNode.data).toBe('Zero-latency WebNN stream!');
    expect(appendSpy).toHaveBeenCalledTimes(4);

    unbind();
    promptStream.destroy();
  });

  it('executes reactive WebNN tensor graphs with NPU/GPU device configuration', async () => {
    const runner = createWebNNGraph({
      deviceType: 'npu',
      shape: [1, 4]
    });

    expect(runner.deviceType).toBe('npu');
    const res = await runner.compute(new Float32Array([-2.5, 0.0, 3.5, 8.0]));
    expect(Array.from(res)).toEqual([0, 0, 3.5, 8.0]);
    expect(Array.from(runner.output.value)).toEqual([0, 0, 3.5, 8.0]);

    runner.destroy();
  });

  it('runs AI fast prototyping and creates reactive Aether badges', async () => {
    const { createAIWorkflowEngine } = await import('./index.js');
    const engine = createAIWorkflowEngine();

    const badge = engine.createAetherBadge();
    expect(badge.classList.contains('aether-ai-badge')).toBe(true);

    const proto = await engine.synthesizePrototype('Create motor calibration settings');
    expect(proto.recommendedPlane).toBe('drawer');
    expect(proto.title).toContain('Settings');
    expect(engine.state.value).toBe('complete');
    expect(engine.activeTokens.value).toBeGreaterThan(0);

    engine.destroy();
  });
});
