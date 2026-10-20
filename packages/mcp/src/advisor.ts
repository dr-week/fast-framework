/**
 * @fileoverview @zuari/mcp - Intelligent Copilot & Feature Advisor System.
 * Analyzes developer & AI prompts, recommends optimal architecture, placement plane,
 * exact components, vector glyphs, and generates copy-paste starter code.
 */

export interface FeatureAdvice {
  scenario: string;
  recommendedPlane: 'surface' | 'dock' | 'drawer' | 'command' | 'ambient';
  recommendedPackages: string[];
  recommendedComponents: string[];
  recommendedGlyphs: string[];
  optimalPattern: string;
  codeSnippet: string;
  antiPatternsToAvoid: string[];
}

export interface AdvisorQuery {
  task: string;
  platform?: 'web' | 'mobile' | 'desktop' | 'embedded' | 'xr';
  currentIssue?: string;
}

export interface GuidanceResponse {
  querySummary: string;
  advice: FeatureAdvice;
  verificationSteps: string[];
}

/**
 * Intelligent Advisor Engine for Developers and AI Agents.
 * Evaluates any task or problem and provides optimal feature division,
 * layout placement, and zero-VDOM implementation guidance.
 */
export function getZuariGuidance(query: AdvisorQuery): GuidanceResponse {
  const text = `${query.task} ${query.currentIssue ?? ''}`.toLowerCase();

  // 1. Settings / Configuration / Hardware Calibration
  if (text.includes('setting') || text.includes('config') || text.includes('tuning') || text.includes('inspector') || text.includes('calibrate')) {
    return {
      querySummary: 'Configuration / Property Inspection / Calibration',
      advice: {
        scenario: 'Deep Configuration / Hardware Calibration',
        recommendedPlane: 'drawer',
        recommendedPackages: ['@zuari/ui', '@zuari/glyphs', '@zuari/signals'],
        recommendedComponents: ['createUiDrawer({ placement: "right" })', 'createSwitch', 'createSlider', 'createButton'],
        recommendedGlyphs: ['TunerGlyph', 'CloseGlyph', 'CheckGlyph'],
        optimalPattern: 'Tuck deep settings in a sliding right drawer to keep the surface plane uncluttered.',
        codeSnippet: `import { signal } from '@zuari/signals';
import { html } from '@zuari/dom';
import { createUiDrawer, createSlider, createButton } from '@zuari/ui';
import { TunerGlyph, CloseGlyph } from '@zuari/glyphs';

const isOpen = signal(false);
const drawer = createUiDrawer({
  isOpen,
  placement: 'right',
  title: 'Settings & Calibration',
  content: html\`
    <div class="drawer-body">
      \${createSlider({ min: 0, max: 100, value: signal(50) }).element}
      \${createButton({ label: 'Save', variant: 'primary', onClick: () => { isOpen.value = false; } }).element}
    </div>
  \`
});`,
        antiPatternsToAvoid: [
          'Do not place wide setting panels directly on the primary viewport (Surface Plane).',
          'Do not use generic raw <input> without validation; use @zuari/ui primitives.',
          'Do not use emojis (⚙️); use TunerGlyph.'
        ]
      },
      verificationSteps: [
        'Ensure drawer backdrop triggers dismissal on outside click.',
        'Verify Escape key dismisses the drawer.',
        'Ensure drawer animation completes within 220ms without layout thrash.'
      ]
    };
  }

  // 2. Navigation / Section Switching / Tool Switching
  if (text.includes('nav') || text.includes('dock') || text.includes('tab') || text.includes('switch') || text.includes('menu')) {
    return {
      querySummary: 'Section Switching / Primary Navigation',
      advice: {
        scenario: 'High-Frequency Navigation & Tool Selection',
        recommendedPlane: 'dock',
        recommendedPackages: ['@zuari/presets', '@zuari/glyphs', '@zuari/signals'],
        recommendedComponents: ['createMinimalDock', 'createTabs'],
        recommendedGlyphs: ['HomeGlyph', 'SearchGlyph', 'BellGlyph', 'GridGlyph', 'LayersGlyph'],
        optimalPattern: 'Use a compact floating dock centered horizontally with vector glyphs and hover tooltips.',
        codeSnippet: `import { signal } from '@zuari/signals';
import { createMinimalDock } from '@zuari/presets';
import { HomeGlyph, SearchGlyph, BellGlyph } from '@zuari/glyphs';

const activeTab = signal('home');
const dock = createMinimalDock({
  items: [
    { id: 'home', label: 'Home', icon: HomeGlyph({ size: 20 }), onClick: () => activeTab.value = 'home' },
    { id: 'search', label: 'Search', icon: SearchGlyph({ size: 20 }), onClick: () => activeTab.value = 'search' },
    { id: 'alerts', label: 'Alerts', icon: BellGlyph({ size: 20 }), badge: '2', onClick: () => activeTab.value = 'alerts' }
  ]
});`,
        antiPatternsToAvoid: [
          'Do not create deep multi-level nested sidebars.',
          'Do not use raw emojis (🏠, 🔍, 🔔); use @zuari/glyphs.',
          'Do not re-render the whole page on tab switch; switch content via when() or match().'
        ]
      },
      verificationSteps: [
        'Check keyboard roving tab-index navigation across dock items.',
        'Ensure active indicators update reactively without Virtual DOM diffing.'
      ]
    };
  }

  // 3. Alerts, Notifications & System Feedback
  if (text.includes('alert') || text.includes('toast') || text.includes('notification') || text.includes('feedback') || text.includes('error message')) {
    return {
      querySummary: 'System Alerts & Transient Feedback',
      advice: {
        scenario: 'Non-Intrusive Notification & Status Reporting',
        recommendedPlane: 'ambient',
        recommendedPackages: ['@zuari/ui', '@zuari/headless'],
        recommendedComponents: ['createUiToast({ position: "bottom-right" })', 'createBadge'],
        recommendedGlyphs: ['BellGlyph', 'CheckGlyph', 'CloseGlyph'],
        optimalPattern: 'Mount an ambient toast container at bottom-right with auto-dismiss timers and aria-live announcements.',
        codeSnippet: `import { createUiToast } from '@zuari/ui';

const toast = createUiToast({ position: 'bottom-right' });
document.body.appendChild(toast.container);

// Trigger reactive alerts
toast.success('Operation Complete', 'Telemetry successfully synchronized.');
toast.error('Connection Lost', 'Re-establishing WebSocket link...');`,
        antiPatternsToAvoid: [
          'Never use window.alert() or blocking modals for non-critical status updates.',
          'Do not clutter the central task canvas with static warning banners.'
        ]
      },
      verificationSteps: [
        'Verify aria-live="polite" reads notification content to screen readers.',
        'Verify auto-dismiss timer cleans up and removes DOM nodes without memory leaks.'
      ]
    };
  }

  // 4. Hardware, 3D Printers, Drones & Telemetry
  if (text.includes('printer') || text.includes('drone') || text.includes('telemetry') || text.includes('sensor') || text.includes('gcode')) {
    return {
      querySummary: 'Hardware & Binary Telemetry Streaming',
      advice: {
        scenario: 'Real-Time Hardware Telemetry & Control',
        recommendedPlane: 'surface',
        recommendedPackages: ['@zuari/hardware', '@zuari/signals', '@zuari/dom', '@zuari/glyphs'],
        recommendedComponents: ['createPrinterTelemetry', 'createDroneTelemetry', 'createUiToast'],
        recommendedGlyphs: ['PrinterGlyph', 'FlameGlyph', 'MonitorGlyph'],
        optimalPattern: 'Bind raw hardware signals directly into W3C DOM parts without JSON or VDOM overhead.',
        codeSnippet: `import { html, render } from '@zuari/dom';
import { createPrinterTelemetry } from '@zuari/hardware/printer';
import { PrinterGlyph, FlameGlyph } from '@zuari/glyphs';

const printer = createPrinterTelemetry();
const view = html\`
  <div class="telemetry-hud">
    <div class="pill">Bed: \${printer.bedTemp}°C</div>
    <div class="pill">Hotend: \${printer.hotendTemp}°C</div>
    <div class="progress">Progress: \${printer.progress}%</div>
  </div>
\`;
document.body.appendChild(render(view).fragment);`,
        antiPatternsToAvoid: [
          'Do not JSON.stringify high-frequency hardware streams.',
          'Do not trigger full-tree re-renders on telemetry ticks (10-100Hz).'
        ]
      },
      verificationSteps: [
        'Ensure frame rate sustains 60-120 FPS under continuous hardware telemetry streams.',
        'Verify memory stays flat with zero garbage collection spikes.'
      ]
    };
  }

  // 5. Default General App Architecture
  return {
    querySummary: 'General Reactive Web Application',
    advice: {
      scenario: 'Clean, Fast, Zero-VDOM Application Layout',
      recommendedPlane: 'surface',
      recommendedPackages: ['@zuari/signals', '@zuari/dom', '@zuari/presets', '@zuari/ui', '@zuari/glyphs'],
      recommendedComponents: ['html\`...\`', 'render()', 'createMinimalDock', 'createStoryCard'],
      recommendedGlyphs: ['HomeGlyph', 'SearchGlyph', 'UserGlyph', 'PlusGlyph'],
      optimalPattern: 'Organize features across the 5 canonical planes with direct signal binding and zero emojis.',
      codeSnippet: `import { signal } from '@zuari/signals';
import { html, render, repeat } from '@zuari/dom';
import { createMinimalDock } from '@zuari/presets';
import { HomeGlyph, PlusGlyph } from '@zuari/glyphs';

const items = signal([{ id: '1', title: 'First Task' }]);
const view = html\`
  <main class="surface-stage">
    \${repeat(items, item => item.id, item => html\`<div class="card">\${item.title}</div>\`)}
  </main>
\`;
render(view, document.body);`,
      antiPatternsToAvoid: [
        'Never use React/JSX or Virtual DOM diffing.',
        'Never use raw emojis for UI buttons or actions.',
        'Never mix settings into the primary canvas; place them in a drawer.'
      ]
    },
    verificationSteps: [
      'Verify all signals bind directly into template holes (${signal}).',
      'Verify tests pass with pnpm test.'
    ]
  };
}
