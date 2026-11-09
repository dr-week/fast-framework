import type { GeneratedFile } from '../../types.js';

export function createProductStylesFiles(): GeneratedFile[] {
const styles = `:root {
  color-scheme: dark;
  --nova-color-background: oklch(18% 0.02 255);
  --nova-color-surface: oklch(22% 0.025 255);
  --nova-color-surface-elevated: oklch(25% 0.03 255);
  --nova-color-text: oklch(94% 0.01 255);
  --nova-color-text-muted: oklch(72% 0.02 255);
  --nova-color-border: oklch(38% 0.025 255);
  --nova-color-brand: oklch(72% 0.14 190);
  --nova-radius-squircle: 8px;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  color: var(--nova-color-text);
  background: var(--nova-color-background);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}

* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; min-height: 100vh; }
button { font: inherit; }
button:focus-visible, a:focus-visible { outline: 2px solid var(--nova-color-brand); outline-offset: 3px; }
.app-shell { min-height: 100vh; }
.app-header { height: 68px; display: flex; align-items: center; justify-content: space-between; padding: 0 28px; border-bottom: 1px solid var(--nova-color-border); background: var(--nova-color-surface); }
.brand, .header-actions, .nav-item { display: flex; align-items: center; }
.brand { gap: 11px; color: inherit; font-weight: 650; text-decoration: none; }
.brand-mark { display: grid; width: 30px; height: 30px; place-items: center; border-radius: 8px; background: var(--nova-color-brand); color: oklch(18% 0.02 255); }
.header-actions { gap: 18px; }
.status-pill, .panel-badge { display: inline-flex; align-items: center; gap: 8px; padding: 7px 10px; border: 1px solid var(--nova-color-border); border-radius: var(--nova-radius-squircle); color: var(--nova-color-text-muted); font-size: 12px; }
.status-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--nova-color-brand); }
.icon-button, .nav-item, .primary-button, .text-button { cursor: pointer; }
.icon-button { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid var(--nova-color-border); border-radius: var(--nova-radius-squircle); color: inherit; background: transparent; }
.app-body { display: grid; grid-template-columns: 220px minmax(0, 1fr); min-height: calc(100vh - 68px); }
.primary-nav { display: flex; flex-direction: column; gap: 6px; padding: 24px 14px; border-right: 1px solid var(--nova-color-border); background: var(--nova-color-surface); }
.nav-item { gap: 12px; width: 100%; padding: 11px 12px; border: 1px solid transparent; border-radius: var(--nova-radius-squircle); color: var(--nova-color-text-muted); text-align: left; background: transparent; }
.nav-item.is-active { color: var(--nova-color-text); border-color: var(--nova-color-border); background: var(--nova-color-surface-elevated); }
.nav-item:disabled { cursor: not-allowed; opacity: .5; }
.main-content { width: min(1120px, 100%); margin: 0 auto; padding: 42px clamp(20px, 4vw, 56px); }
.page-heading, .panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.page-heading { margin-bottom: 30px; }
.eyebrow { margin: 0 0 8px; color: var(--nova-color-brand); font-size: 10px; font-weight: 700; letter-spacing: .12em; }
h1, h2, h3, p { margin-top: 0; }
h1 { margin-bottom: 8px; font-size: clamp(26px, 3vw, 34px); }
.page-description, .data-card p, .empty-state p { margin-bottom: 0; color: var(--nova-color-text-muted); line-height: 1.6; }
.primary-button { padding: 10px 15px; border: 1px solid var(--nova-color-brand); border-radius: var(--nova-radius-squircle); color: oklch(18% 0.02 255); font-weight: 650; background: var(--nova-color-brand); }
.feature-panel, .data-card, .empty-state { border: 1px solid var(--nova-color-border); border-radius: var(--nova-radius-squircle); background: var(--nova-color-surface-elevated); box-shadow: 0 8px 22px oklch(8% 0.02 255 / .18); }
.feature-panel { padding: 24px; }
.panel-heading { padding-bottom: 18px; border-bottom: 1px solid var(--nova-color-border); }
.panel-heading h2 { margin: 0; font-size: 18px; }
.resource-content { padding-top: 20px; }
.empty-state { padding: 28px; text-align: center; }
.empty-state h3 { margin-bottom: 8px; }
.state-message { color: var(--nova-color-text-muted); }
.state-error { color: oklch(78% 0.13 25); }
.text-button { margin-left: 10px; border: 0; color: var(--nova-color-brand); background: transparent; text-decoration: underline; }
.item-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin: 0; padding: 0; list-style: none; }
.data-card { padding: 18px; }
.data-card h3 { margin-bottom: 8px; font-size: 15px; }
@media (max-width: 680px) {
  .app-header { padding: 0 16px; }
  .app-body { grid-template-columns: 1fr; }
  .primary-nav { flex-direction: row; padding: 10px 14px; border-right: 0; border-bottom: 1px solid var(--nova-color-border); }
  .nav-item { justify-content: center; }
  .nav-item span { display: none; }
  .main-content { padding-top: 28px; }
  .page-heading { align-items: flex-start; flex-direction: column; }
  .status-pill { display: none; }
}
`;

  return [
    { path: 'src/styles.css', content: styles }
  ];
}
