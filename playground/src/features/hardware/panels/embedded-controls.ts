import { effect, type Signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import type { DpadNavigator, RotaryController } from '@zuari/hardware';

const T9_DIGITS = ['2', '3', '4', '5', '6', '7', '8', '9'] as const;

export function renderKaiosPanel(
  stage: HTMLElement,
  dpad: DpadNavigator,
  kaiosMenu: readonly string[],
  lastSelectedMenu: Signal<string>,
  onInteraction: () => void
): () => void {
  const view = html`
    <div class="hw-panel-grid">
      <div class="hw-kaios-phone">
        <div class="hw-kaios-statusbar">
          <span>KaiOS 3.0 • 4G</span>
          <span>RAM: 1.8MB</span>
        </div>
        <div class="hw-kaios-list" id="kaios-menu-list"></div>
        <div class="hw-kaios-t9bar">T9 Input: <strong>${dpad.t9Buffer}</strong></div>
        <div class="hw-kaios-softkeys">
          <span>Options</span>
          <strong>SELECT</strong>
          <span>Clear</span>
        </div>
      </div>

      <div class="hw-controls-col">
        <div class="repl-demo-header">
          <span class="badge-pill">@zuari/hardware/dpad</span>
          <span class="repl-muted">Selected: ${lastSelectedMenu}</span>
        </div>
        <div class="hw-dpad-cluster">
          <button class="repl-action-btn secondary" @click=${() => { dpad.moveUp(); onInteraction(); }}>▲ Up</button>
          <button class="repl-action-btn" @click=${() => { dpad.selectCurrent(); }}>● OK / Select</button>
          <button class="repl-action-btn secondary" @click=${() => { dpad.moveDown(); onInteraction(); }}>▼ Down</button>
        </div>
        <div class="hw-t9-grid" id="hw-t9-grid"></div>
      </div>
    </div>
  `;

  const cleanups: Array<() => void> = [render(view, stage).destroy];

  const t9Grid = stage.querySelector('#hw-t9-grid');
  if (t9Grid) {
    for (const digit of T9_DIGITS) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'repl-preset-btn';
      btn.textContent = `Key ${digit}`;
      btn.addEventListener('click', () => {
        dpad.pressT9Digit(digit);
        onInteraction();
      });
      t9Grid.appendChild(btn);
    }
  }

  const menuContainer = stage.querySelector('#kaios-menu-list');
  if (menuContainer) {
    kaiosMenu.forEach((itemText, idx) => {
      const row = document.createElement('div');
      row.className = 'hw-kaios-item';
      row.textContent = itemText;
      cleanups.push(
        effect(() => {
          row.setAttribute('data-focused', String(dpad.focusedIndex.value === idx));
        })
      );
      menuContainer.appendChild(row);
    });
  }

  return () => {
    for (const fn of cleanups) fn();
  };
}

export function renderRotaryPanel(
  stage: HTMLElement,
  rotary: RotaryController,
  onInteraction: () => void
): () => void {
  const view = html`
    <div class="hw-panel-grid">
      <div class="hw-rotary-dial-box">
        <div class="hw-wheel-gauge">
          <strong class="repl-big-num">${rotary.value}%</strong>
          <small>Detent Clicks: ${rotary.totalClicks}</small>
        </div>
      </div>
      <div class="hw-controls-col">
        <div class="repl-demo-header">
          <span class="badge-pill">@zuari/hardware/gaming</span>
          <span class="repl-muted">Scroll Wheel / Crank / 240Hz Input</span>
        </div>
        <p class="repl-muted">
          Zero-VDOM hardware rotary encoder for Rabbit R1-style scroll wheels, Playdate cranks, &amp; handhelds.
        </p>
        <div class="repl-btn-row">
          <button class="repl-action-btn secondary" @click=${() => { rotary.rotateSteps(-1); onInteraction(); }}>
            ↺ Detent -1
          </button>
          <button class="repl-action-btn" @click=${() => { rotary.rotateSteps(1); onInteraction(); }}>
            ↻ Detent +1
          </button>
        </div>
      </div>
    </div>
  `;

  return render(view, stage).destroy;
}
