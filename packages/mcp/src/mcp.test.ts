import { describe, it, expect } from 'vitest';
import {
  ZUARI_MCP_TOOLS,
  recommendZuariArchitecture,
  getCompactAiSystemPrompt,
  submitZuariFeedback
} from './index.js';

describe('@zuari/mcp AI Agent Recommendation & MCP Engine', () => {
  it('exposes valid Model Context Protocol (MCP) tool schemas for AI agents', () => {
    expect(ZUARI_MCP_TOOLS.length).toBeGreaterThanOrEqual(2);
    expect(ZUARI_MCP_TOOLS[0]!.name).toBe('zuari_recommend_architecture');
  });

  it('recommends exact modular @zuari/* packages across drones, optics, KaiOS, Rabbit R1, and Wasm', () => {
    const droneRec = recommendZuariArchitecture('Build an FPV drone MAVLink OSD');
    expect(droneRec.recommendedPackages).toContain('@zuari/hardware/drone');

    const opticRec = recommendZuariArchitecture('Smart rifle scope ballistic reticle with NVG');
    expect(opticRec.recommendedPackages).toContain('@zuari/hardware/tactical');

    const kaiosRec = recommendZuariArchitecture('KaiOS dumbphone app with T9 and E-Ink display');
    expect(kaiosRec.recommendedPackages).toContain('@zuari/hardware/dpad');

    const rotaryRec = recommendZuariArchitecture('Rabbit R1 scroll wheel and Playdate crank UI');
    expect(rotaryRec.recommendedPackages).toContain('@zuari/hardware/gaming');

    const wasmRec = recommendZuariArchitecture('Rust WebAssembly physics engine');
    expect(wasmRec.recommendedPackages).toContain('@zuari/wasm');
  });

  it('returns a compact zero-hallucination system prompt under 400 tokens', () => {
    const prompt = getCompactAiSystemPrompt();
    expect(prompt).toContain('@zuari/signals');
    expect(prompt).toContain('@zuari/hardware/tactical');
    expect(prompt.length).toBeLessThan(1500);
  });

  it('handles developer and AI agent feedback submissions with structured GitHub issue receipts', () => {
    const receipt = submitZuariFeedback({
      category: 'ui-ux',
      summary: 'Backdrop outside-click ordering in responsive drawer',
      details: 'Base CSS hides backdrop after mobile media query tries to show it, preventing click dismissal.',
      reporter: 'AI Coding Agent (Claude)'
    });

    expect(receipt.status).toBe('received');
    expect(receipt.feedbackId).toMatch(/^zfb_\d+_/);
    expect(receipt.githubIssueUrl).toContain('github.com/dr-week/fast-framework/issues/new');
    expect(receipt.githubIssueUrl).toContain('Backdrop');
  });

  it('provides optimal feature advice and code guidance for any developer query', async () => {
    const { getZuariGuidance } = await import('./index.js');

    // 1. Settings query -> recommends drawer
    const settingsAdvice = getZuariGuidance({ task: 'Build a calibration and motor settings panel' });
    expect(settingsAdvice.advice.recommendedPlane).toBe('drawer');
    expect(settingsAdvice.advice.recommendedComponents).toContain('createUiDrawer({ placement: "right" })');
    expect(settingsAdvice.advice.recommendedGlyphs).toContain('TunerGlyph');

    // 2. Navigation query -> recommends dock
    const navAdvice = getZuariGuidance({ task: 'Quick tool switcher and dock navigation' });
    expect(navAdvice.advice.recommendedPlane).toBe('dock');
    expect(navAdvice.advice.recommendedComponents).toContain('createMinimalDock');
    expect(navAdvice.advice.recommendedGlyphs).toContain('HomeGlyph');

    // 3. Alerts query -> recommends ambient toast
    const alertAdvice = getZuariGuidance({ task: 'Show system error alerts and toasts' });
    expect(alertAdvice.advice.recommendedPlane).toBe('ambient');
    expect(alertAdvice.advice.recommendedComponents).toContain('createUiToast({ position: "bottom-right" })');
  });
});

