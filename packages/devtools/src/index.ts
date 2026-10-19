import { signal, computed, effect, type Signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';

export interface DevToolsSignalRecord {
  id: string;
  label: string;
  value: unknown;
  subscribersCount: number;
}

export interface DevToolsWasmBufferRecord {
  id: string;
  byteLength: number;
  ptr: number;
  format: string;
}

export interface ZuariDevToolsState {
  signals: Map<string, DevToolsSignalRecord>;
  buffers: Map<string, DevToolsWasmBufferRecord>;
  fps: Signal<number>;
  memoryMB: Signal<number>;
  activePartsCount: Signal<number>;
  isVisible: Signal<boolean>;
}

class DevToolsHub {
  private _state: ZuariDevToolsState;
  private _rafId: number | null = null;
  private _lastTime = performance.now();
  private _frames = 0;

  constructor() {
    this._state = {
      signals: new Map(),
      buffers: new Map(),
      fps: signal(60),
      memoryMB: signal(0),
      activePartsCount: signal(0),
      isVisible: signal(false)
    };
  }

  get state(): ZuariDevToolsState {
    return this._state;
  }

  /**
   * Register a reactive signal for DevTools inspection.
   */
  registerSignal(id: string, label: string, sig: Signal<unknown>): void {
    this._state.signals.set(id, {
      id,
      label,
      value: sig.peek(),
      subscribersCount: 1
    });

    effect(() => {
      const val = sig.value;
      const rec = this._state.signals.get(id);
      if (rec) {
        rec.value = val;
      }
    });
  }

  /**
   * Register an active WebAssembly linear memory buffer for inspection.
   */
  registerWasmBuffer(id: string, byteLength: number, ptr: number, format: string): void {
    this._state.buffers.set(id, { id, byteLength, ptr, format });
  }

  /**
   * Track DOM parts count.
   */
  incrementParts(count = 1): void {
    this._state.activePartsCount.value += count;
  }

  /**
   * Toggle visual DevTools overlay HUD.
   */
  toggle(): void {
    this._state.isVisible.value = !this._state.isVisible.value;
  }

  /**
   * Start live FPS and performance monitoring ticker.
   */
  startTicker(): void {
    if (typeof window === 'undefined') return;

    const tick = () => {
      this._frames++;
      const now = performance.now();
      if (now - this._lastTime >= 1000) {
        this._state.fps.value = Math.round((this._frames * 1000) / (now - this._lastTime));
        this._frames = 0;
        this._lastTime = now;

        // Check memory if available in browser
        const perf = window.performance as unknown as { memory?: { usedJSHeapSize: number } };
        if (perf.memory) {
          this._state.memoryMB.value = Math.round((perf.memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
        }
      }
      this._rafId = requestAnimationFrame(tick);
    };

    this._rafId = requestAnimationFrame(tick);
  }

  stopTicker(): void {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  /**
   * Mounts the lightweight in-app HUD directly into the page body.
   */
  mountOverlay(target: HTMLElement = document.body): () => void {
    this.startTicker();

    const view = html`
      <aside
        id="zuari-devtools-hud"
        style="position: fixed; bottom: 16px; right: 16px; z-index: 999999; font-family: monospace; font-size: 12px; background: rgba(10, 15, 25, 0.92); color: #00ffcc; border: 1px solid #00ffcc44; border-radius: 8px; padding: 12px 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); backdrop-filter: blur(8px); min-width: 240px; pointer-events: auto;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #00ffcc22; padding-bottom: 6px; margin-bottom: 8px;">
          <span style="font-weight: bold; letter-spacing: 0.05em; color: #fff;">⚡ ZUARI DEVTOOLS</span>
          <span style="color: #69f0ae; font-weight: bold;">\${this._state.fps} FPS</span>
        </div>
        <div style="line-height: 1.6; color: #e0e0e0;">
          <div>Heap Memory: <strong style="color: #ffb74d;">\${this._state.memoryMB} MB</strong></div>
          <div>Active DOM Parts: <strong style="color: #80d8ff;">\${this._state.activePartsCount}</strong></div>
          <div>Active Signals: <strong style="color: #b388ff;">\${() => this._state.signals.size}</strong></div>
          <div>Wasm Buffers: <strong style="color: #ff80ab;">\${() => this._state.buffers.size}</strong></div>
        </div>
      </aside>
    `;

    const { fragment, destroy } = render(view);
    target.appendChild(fragment);

    return () => {
      this.stopTicker();
      destroy();
      const el = target.querySelector('#zuari-devtools-hud');
      el?.parentNode?.removeChild(el);
    };
  }
}

export const zuariDevTools = new DevToolsHub();

// Expose to window for browser extension content scripts
if (typeof window !== 'undefined') {
  (window as unknown as { __ZUARI_DEVTOOLS_GLOBAL_HOOK__?: DevToolsHub }).__ZUARI_DEVTOOLS_GLOBAL_HOOK__ = zuariDevTools;
}
