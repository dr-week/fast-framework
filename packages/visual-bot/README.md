# `@zuari/visual-bot`

Modular, zero-VDOM, signal-reactive **Visual Bot & Content Automation Framework** for Zuari (`@zuari/*`).

Extracted and generalized from battle-tested visual automation and content-engine primitives:

## Modular Subpaths (`"sideEffects": false`)

| Subpath | Capabilities |
| :--- | :--- |
| `@zuari/visual-bot/vision` | Theme-invariant Sobel edge detection, coarse-to-fine 2D NCC template matching, bilinear multi-scale pyramid matching (HiDPI/Retina), geometric icon synthesizer & extensible registry |
| `@zuari/visual-bot/som` | Stagehand-style Set-of-Mark (SoM) semantic DOM indexer with fail-closed sensitive/payment/OTP redaction, deterministic safe selector builder, and `#1, #2` visual debug overlay |
| `@zuari/visual-bot/cascade` | 3-Layer Self-Healing Cascade (`Tier 1 Cached Selector` -> `Tier 2 SoM + Auto-Heal` -> `Tier 3 Sobel + Multi-Scale NCC`) + reactive `@zuari/signals` `createVisualBot()` controller |
| `@zuari/visual-bot/motion` | Biometric cubic Bezier pointer trajectories with micro-tremor, Box-Muller Gaussian delays, human jitter, contextual keystroke cadence, and stochastic scroll steps with reading pauses |
| `@zuari/visual-bot/recorder` | Fail-closed browser interaction recorder & deterministic workflow replayer with optional Layer-2 Set-of-Mark self-healing |
| `@zuari/visual-bot/bridge` | Generic React Fiber upward prop traversal & zero-network passive `fetch` JSON stream interceptor |
| `@zuari/visual-bot/memory` | Persistent bounded zero-repeat `createDedupeMemory`, weighted multi-dimensional `computeTasteProfile` (5x viral feedback loop), and versioned portable JSON snapshots |
| `@zuari/visual-bot/llm` | Resilient `extractJsonBlock` and tiered `createLlmCascade` (Gemini, OpenAI-compatible, cooldown-gated zero-key Pollinations, and deterministic local fallback) |
| `@zuari/visual-bot/runtime` | Typed reactive `createEventBus`, sliding-window `createQuotaGuard`, and deterministic `createWorkflowEngine` with step checkpointing & idempotent retry |
| `@zuari/visual-bot/drivers` | Pluggable `BotDriver` contract + biometric `createActionRunner`, browser `createDomDriver`, and injectable `createAdbDriver` (Android ADB) |
| `@zuari/visual-bot/pipeline` | Crypto-entropic `cryptoShuffle`, diversity `stratifyBatch` (zero adjacent same-category repeats), and composable `createItemFilter` with dedupe memory |

## Quick Start

```ts
import { createVisualBot } from '@zuari/visual-bot/cascade';

const bot = createVisualBot({
  initialSelectors: { followBtn: '.legacy-selector' },
});

// Automatically falls back to Layer-2 Set-of-Mark & heals `followBtn` in selectorCache
const result = bot.resolve('followBtn', { query: 'Following' });
console.log(result.layer, result.healed, bot.selectorCache.value.followBtn);
```
