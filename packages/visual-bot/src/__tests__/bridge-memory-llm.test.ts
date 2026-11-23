import { describe, expect, it } from 'vitest';
import {
  createFetchInterceptor,
  getReactFiber,
  getReactProps,
  traverseFiberUpwards,
} from '../bridge/index.js';
import {
  computeTasteProfile,
  createDedupeMemory,
  parseSnapshot,
  serializeSnapshot,
} from '../memory/index.js';
import { createLlmCascade, extractJsonBlock } from '../llm/index.js';

describe('@zuari/visual-bot/bridge, memory & llm', () => {
  it('traverses React Fiber trees and passively intercepts fetch JSON streams', async () => {
    const parentFiber = { memoizedProps: { media: { id: 'm1', url: 'https://cdn/video.mp4' } }, return: null };
    const childFiber = { memoizedProps: { className: 'obfuscated' }, return: parentFiber };
    const domNode = { __reactFiber$xyz: childFiber, __reactProps$xyz: { onClick: () => {} } };

    expect(getReactFiber(domNode)).toBe(childFiber);
    expect(getReactProps(domNode)).toHaveProperty('onClick');
    const found = traverseFiberUpwards(getReactFiber(domNode), (p) => Boolean(p.media));
    expect(found?.media).toEqual({ id: 'm1', url: 'https://cdn/video.mp4' });

    const mockTarget = {
      fetch: (async () =>
        new Response(JSON.stringify({ users: [{ username: 'zuari_dev' }] }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })) as unknown as typeof fetch,
    };

    const interceptor = createFetchInterceptor(
      [
        {
          id: 'users',
          match: '/api/users',
          transform: (json) => (json as { users?: unknown[] }).users,
        },
      ],
      { target: mockTarget }
    );

    interceptor.install();
    expect(interceptor.active.value).toBe(true);
    await mockTarget.fetch('https://example.com/api/users');
    await new Promise((r) => setTimeout(r, 10));

    expect(interceptor.events.value.length).toBe(1);
    expect(interceptor.lastEvent.value?.ruleId).toBe('users');
    interceptor.uninstall();
    expect(interceptor.active.value).toBe(false);
  });

  it('maintains bounded zero-repeat memory, 5x viral Taste DNA, and portable snapshots', () => {
    const mem = createDedupeMemory({ maxItems: 3, storage: null });
    expect(mem.add('Alpha')).toBe(true);
    expect(mem.add('alpha')).toBe(false);
    mem.addMany(['Beta', 'Gamma', 'Delta']);
    expect(mem.size()).toBe(3);
    expect(mem.has('alpha')).toBe(false); // Evicted by FIFO cap
    expect(mem.has('delta')).toBe(true);

    const unseen = mem.filterUnseen([{ t: 'Delta' }, { t: 'Epsilon' }], (x) => x.t);
    expect(unseen).toEqual([{ t: 'Epsilon' }]);

    const taste = computeTasteProfile([
      { tags: { hook: 'Over-Engineer', world: 'Goa' }, outcome: 'viral' },
      { tags: { hook: 'Fake Hacks', world: 'Spam' }, outcome: 'flop' },
      { tags: { hook: 'Over-Engineer', world: 'Space' }, vote: 'up' },
    ]);
    expect(taste.viralCount).toBe(1);
    expect(taste.topByDimension.hook[0]).toBe('Over-Engineer');
    expect(taste.avoidTags).toContain('Spam');
    expect(taste.promptSummary).toContain('Over-Engineer');

    const json = serializeSnapshot({ seen: mem.exportList(), viralCount: taste.viralCount });
    const restored = parseSnapshot<{ seen: string[]; viralCount: number }>(json);
    expect(restored.version).toBe(1);
    expect(restored.data.viralCount).toBe(1);
  });

  it('extracts JSON from fenced LLM output and falls back cleanly on cooldown or failure', async () => {
    const raw = 'Here is the result:\n```json\n{"ok":true,"count":3}\n```';
    expect(JSON.parse(extractJsonBlock(raw))).toEqual({ ok: true, count: 3 });

    let calls = 0;
    const mockFetch = (async () => {
      calls++;
      return new Response(
        JSON.stringify({ choices: [{ message: { content: '{"source":"free"}' } }] }),
        { status: 200 }
      );
    }) as unknown as typeof fetch;

    const llm = createLlmCascade(
      { mode: 'pollinations', cooldownMs: 60_000, fetchImpl: mockFetch },
      { localFallback: () => '{"source":"local"}' }
    );

    const first = await llm.generate({ system: 's', user: 'u' });
    expect(first.provider).toBe('pollinations');
    expect(first.fallbackUsed).toBe(false);

    // Second call within cooldown automatically falls back to local deterministic generator
    const second = await llm.generate({ system: 's', user: 'u' });
    expect(second.provider).toBe('local');
    expect(second.fallbackUsed).toBe(true);
    expect(calls).toBe(1);
  });
});
