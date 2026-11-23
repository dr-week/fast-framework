import { describe, expect, it } from 'vitest';
import { createEventBus, createQuotaGuard, createWorkflowEngine } from '../runtime/index.js';
import { createActionRunner, createAdbDriver, createDomDriver } from '../drivers/index.js';
import { createItemFilter, cryptoShuffle, stratifyBatch } from '../pipeline/index.js';
import { createDedupeMemory } from '../memory/index.js';

describe('@zuari/visual-bot/runtime', () => {
  it('routes typed and wildcard events through reactive EventBus', async () => {
    const bus = createEventBus<{ healed: { key: string; selector: string } }>();
    const seen: string[] = [];
    const offTopic = bus.on('healed', (p) => {
      seen.push(`topic:${p.key}`);
    });
    const offAny = bus.onAny((env) => {
      seen.push(`any:${env.type}`);
    });

    await bus.emit('healed', { key: 'follow', selector: '[data-testid="follow"]' });
    expect(seen).toEqual(['topic:follow', 'any:healed']);
    expect(bus.eventCount.value).toBe(1);
    expect(bus.lastEvent.value?.type).toBe('healed');

    offTopic();
    offAny();
    await bus.emit('healed', { key: 'like', selector: 'button' });
    expect(seen.length).toBe(2);
  });

  it('enforces sliding-window safety quotas and resumes failed workflows from failed step', async () => {
    let clock = 1000;
    const quota = createQuotaGuard({ maxPerWindow: 2, windowMs: 1000, now: () => clock });
    quota.record();
    quota.record();
    expect(quota.canRun()).toBe(false);
    expect(() => quota.record()).toThrow(/Safety Quota Exceeded/);

    clock += 1001;
    expect(quota.canRun()).toBe(true);
    expect(quota.remaining.value).toBe(2);

    let failStep1Once = true;
    const executed: string[] = [];
    const engine = createWorkflowEngine<{ enabled: boolean }>(async (action) => {
      executed.push(action.type);
      if (action.type === 'step2' && failStep1Once) {
        failStep1Once = false;
        throw new Error('Transient network failure');
      }
      return { ok: true };
    });

    const rule = {
      id: 'engage',
      condition: (input: { enabled: boolean }) => input.enabled,
      actions: [{ type: 'step1' }, { type: 'step2' }, { type: 'step3' }],
    };

    const firstRun = await engine.run(rule, { enabled: true });
    expect(firstRun.status).toBe('failed');
    expect(firstRun.actionResults.length).toBe(1);
    expect(executed).toEqual(['step1', 'step2']);

    // Retry resumes directly at step2 without re-running step1
    const retried = await engine.retry(firstRun.id, rule);
    expect(retried.status).toBe('succeeded');
    expect(retried.actionResults.length).toBe(3);
    expect(executed).toEqual(['step1', 'step2', 'step2', 'step3']);
  });
});

describe('@zuari/visual-bot/drivers', () => {
  it('runs biometric ActionRunner on DOM driver with self-healing resolveAndClick', async () => {
    document.body.innerHTML = `<button aria-label="Approve Draft">Approve</button>`;
    const btn = document.querySelector('button') as HTMLButtonElement;
    btn.getBoundingClientRect = () => ({ x: 50, y: 60, width: 100, height: 32 } as DOMRect);
    let clicks = 0;
    btn.addEventListener('click', () => {
      clicks++;
    });

    const domDriver = createDomDriver({
      doc: document,
      win: window,
      initialSelectors: { approve: '.stale-selector' },
    });
    const runner = createActionRunner(domDriver, { maxActionsPerHour: 10 });

    const res = await runner.resolveAndClick('approve', { query: 'Approve Draft' });
    expect(res.found).toBe(true);
    expect(res.healed).toBe(true);
    expect(clicks).toBe(1);
    expect(runner.quota.used.value).toBe(1);
  });

  it('builds safe Android ADB commands via injectable ShellExecutor', async () => {
    const commands: string[] = [];
    const adb = createAdbDriver({
      deviceId: 'emulator-5554',
      appRegistry: {
        demo: { package: 'com.zuari.demo', activity: '.MainActivity', name: 'Zuari Demo' },
      },
      exec: async (cmd) => {
        commands.push(cmd);
        if (cmd.endsWith('devices')) {
          return { stdout: 'List of devices attached\nemulator-5554\tdevice\n' };
        }
        return { stdout: '' };
      },
    });

    expect(await adb.isDeviceReady()).toBe(true);
    const launched = await adb.launchApp('demo');
    expect(launched.success).toBe(true);
    await adb.click(300, 640);
    await adb.type('hello world');

    expect(commands.some((c) => c.includes('input tap 300 640'))).toBe(true);
    expect(commands.some((c) => c.includes('input text "hello%sworld"'))).toBe(true);
  });
});

describe('@zuari/visual-bot/pipeline', () => {
  it('filters, deduplicates, ranks, and stratifies diverse batches without adjacent repeats', () => {
    const dedupe = createDedupeMemory({ storage: null });
    dedupe.add('Old Seen Headline');

    const filter = createItemFilter<{ title: string; category: string; world: string }>({
      getText: (x) => x.title,
      blockPatterns: [/\bcve-\d+/i],
      boostPatterns: [{ pattern: /\bspace|mars|robot\b/i, weight: 25 }],
      dedupeMemory: dedupe,
    });

    const raw = [
      { title: 'Old Seen Headline', category: 'a', world: 'w1' },
      { title: 'Kernel CVE-2026-1234 patch notes', category: 'a', world: 'w2' },
      { title: 'Mars robot opens tea stall', category: 'sci', world: 'mars' },
      { title: 'Space elevator delayed by traffic', category: 'sci', world: 'orbit' },
      { title: 'Mayor bans Mondays', category: 'news', world: 'city' },
      { title: 'Cat elected HOA president', category: 'news', world: 'suburb' },
    ];

    const ranked = filter.filterAndRank(raw);
    expect(ranked.length).toBe(4);
    expect(ranked[0]?.score).toBe(75); // Boosted space/mars/robot

    const shuffled = cryptoShuffle([1, 2, 3, 4, 5], () => 0.4);
    expect(shuffled.length).toBe(5);

    const batch = stratifyBatch(
      ranked.map((r) => r.item),
      {
        batchSize: 4,
        getCategory: (x) => x.category,
        getGroup: (x) => x.world,
        rng: () => 0.3,
      }
    );
    expect(batch.length).toBe(4);
    for (let i = 1; i < batch.length; i++) {
      expect(batch[i]!.category).not.toBe(batch[i - 1]!.category);
    }
  });
});
