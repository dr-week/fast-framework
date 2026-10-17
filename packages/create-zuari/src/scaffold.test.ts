import { describe, it, expect } from 'vitest';
import { getTemplateFiles } from './index.js';

describe('create-zuari Scaffolder', () => {
  it('generates minimal web starter template with valid structure', () => {
    const files = getTemplateFiles('my-zuari-app', 'minimal');
    expect(files).toHaveLength(4);

    const pkg = files.find(f => f.path === 'package.json');
    expect(pkg).toBeDefined();
    expect(pkg?.content).toContain('"name": "my-zuari-app"');
    expect(pkg?.content).toContain('@zuari/dom');

    const main = files.find(f => f.path === 'src/main.ts');
    expect(main?.content).toContain('signal(0)');
    expect(main?.content).toContain('render(view)');
  });

  it('generates spatial WebXR starter template with 3D anchors', () => {
    const files = getTemplateFiles('my-spatial-game', 'spatial');
    const pkg = files.find(f => f.path === 'package.json');
    expect(pkg?.content).toContain('@zuari/spatial');

    const main = files.find(f => f.path === 'src/main.ts');
    expect(main?.content).toContain('createSpatialAnchor');
    expect(main?.content).toContain('bindAnchorToElement');
  });
});
