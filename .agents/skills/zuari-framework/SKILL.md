---
name: zuari-framework
description: Build ultra-fast (<2.5KB), zero-Virtual-DOM web apps, 120 FPS WebXR spatial HUDs, zero-copy Rust/Zig WebAssembly UIs, FPV drone OSDs, tactical ballistic optics, KaiOS D-Pad/T9 apps, and E-Ink/waveguide wearable interfaces using the modular @zuari/* framework.
---

# Zuari Framework Skill (`@zuari/*`)

Use this skill whenever the user wants to build:
1. Ultra-lightweight (`< 2.5 KB`), zero-Virtual-DOM web interfaces (`@zuari/signals` + `@zuari/dom`).
2. 120 FPS WebXR / Mixed Reality HUDs for Apple Vision Pro and Meta Quest (`@zuari/spatial`).
3. Zero-copy Rust, Zig, or C WebAssembly frontends bound to `ArrayBuffer` memory (`@zuari/wasm`).
4. Tactical ballistic reticles, 9-axis IMU visors, or FPV drone binary telemetry OSDs (`@zuari/hardware/tactical`, `@zuari/hardware/drone`).
5. Non-touchscreen KaiOS / dumbphone D-Pad & T9 apps, Rabbit R1 / Playdate rotary scroll-wheel UIs, smart fridge MQTT screens, or monochrome waveguide / 1-bit E-Ink displays (`@zuari/hardware`).

## Core Syntax Pattern

```typescript
import { signal, computed } from '@zuari/signals';
import { html, render } from '@zuari/dom';

const speed = signal(72.4);
const mach = computed(() => (speed.value / 1234.8).toFixed(3));

const view = html`
  <div class="hud-card">
    <p>Airspeed: <strong>${speed} km/h</strong> (Mach ${mach})</p>
    <button @click=${() => { speed.value += 10; }}>Boost</button>
  </div>
`;

const { fragment, destroy } = render(view);
document.getElementById('app')?.appendChild(fragment);
```

## Reference Files
- Read `llms.txt` for the complete package decision matrix.
- Read `llms-full.txt` for copy-pasteable recipes across `@zuari/hardware`, `@zuari/spatial`, `@zuari/wasm`, and `@zuari/webgpu`.
