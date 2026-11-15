import { signal, effect } from '@zuari/signals';
import { REPL_PRESETS, type ReplPreset } from './presets.js';
import { executeReplCode } from './runner.js';

export { REPL_PRESETS, type ReplPreset };

export function createReplView(onInteraction: () => void): HTMLElement {
  const container = document.createElement('div');
  container.className = 'repl-shell';

  const activePresetId = signal<string>(REPL_PRESETS[0]!.id);
  const execTimeMs = signal<string>('0.18');
  const errorMsg = signal<string | null>(null);

  const topBar = document.createElement('div');
  topBar.className = 'repl-topbar';

  const presetTabs = document.createElement('div');
  presetTabs.className = 'repl-preset-tabs';

  const editorArea = document.createElement('textarea');
  editorArea.className = 'repl-editor';
  editorArea.spellcheck = false;
  editorArea.setAttribute('aria-label', 'Zuari Live Code Editor');
  editorArea.value = REPL_PRESETS[0]!.code;

  const previewStage = document.createElement('div');
  previewStage.className = 'repl-preview-stage';

  const statusFooter = document.createElement('div');
  statusFooter.className = 'repl-status-footer';

  const currentCleanups: Array<() => void> = [];

  function updateFooter(): void {
    statusFooter.replaceChildren();
    if (errorMsg.value) {
      const errSpan = document.createElement('span');
      errSpan.className = 'repl-status-err';
      errSpan.textContent = `Syntax / Runtime Error: ${errorMsg.value}`;
      statusFooter.appendChild(errSpan);
      return;
    }

    const okSpan = document.createElement('span');
    okSpan.className = 'repl-status-ok';
    okSpan.textContent = '● Live Direct-to-DOM Execution';

    const timeSpan = document.createElement('span');
    timeSpan.className = 'repl-status-time';
    timeSpan.append('Compiled & mounted in ');
    const strong = document.createElement('strong');
    strong.textContent = `${execTimeMs.value} ms`;
    timeSpan.append(strong, ' (0 Virtual DOM nodes)');

    statusFooter.append(okSpan, timeSpan);
  }

  function runUserCode(rawCode: string): void {
    const result = executeReplCode(rawCode, previewStage, currentCleanups);
    execTimeMs.value = result.execTimeMs;
    errorMsg.value = result.errorMsg;
    updateFooter();
  }

  REPL_PRESETS.forEach((preset) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'repl-preset-btn';
    btn.textContent = preset.title;

    effect(() => {
      btn.setAttribute('data-active', String(activePresetId.value === preset.id));
    });

    btn.addEventListener('click', () => {
      activePresetId.value = preset.id;
      editorArea.value = preset.code;
      runUserCode(preset.code);
      onInteraction();
    });

    presetTabs.appendChild(btn);
  });

  topBar.appendChild(presetTabs);

  const workbench = document.createElement('div');
  workbench.className = 'repl-workbench';

  const editorPane = document.createElement('div');
  editorPane.className = 'repl-editor-pane';

  const editorHeader = document.createElement('div');
  editorHeader.className = 'repl-pane-header';
  editorHeader.innerHTML = '<span>LIVE SIGNAL EDITOR (EDITABLE)</span><span class="repl-kbd-hint">Auto-runs on edit</span>';

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  editorArea.addEventListener('input', () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      runUserCode(editorArea.value);
      onInteraction();
    }, 180);
  });

  editorPane.append(editorHeader, editorArea);

  const outputPane = document.createElement('div');
  outputPane.className = 'repl-output-pane';

  const outputHeader = document.createElement('div');
  outputHeader.className = 'repl-pane-header';
  outputHeader.innerHTML = '<span>LIVE DOM OUTPUT</span><span class="repl-kbd-hint">W3C DOM Parts</span>';

  outputPane.append(outputHeader, previewStage);
  workbench.append(editorPane, outputPane);
  container.append(topBar, workbench, statusFooter);

  runUserCode(REPL_PRESETS[0]!.code);

  return container;
}
