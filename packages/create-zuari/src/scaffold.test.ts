import { describe, it, expect } from 'vitest';
import { getTemplateFiles } from './index.js';

describe('create-zuari Scaffolder', () => {
  it('generates vanilla-ts (Core Web) starter template with valid structure', () => {
    const files = getTemplateFiles('my-zuari-app', 'vanilla-ts');
    expect(files).toHaveLength(4);

    const pkg = files.find(f => f.path === 'package.json');
    expect(pkg).toBeDefined();
    expect(pkg?.content).toContain('"name": "my-zuari-app"');
    expect(pkg?.content).toContain('@zuari/dom');

    const main = files.find(f => f.path === 'src/main.ts');
    expect(main?.content).toContain('signal(0)');
    expect(main?.content).toContain('repeat(');
    expect(main?.content).toContain('when(');
    expect(main?.content).toContain('render(view)');
  });

  it('generates tauri-desktop (Rust + Zuari) template with Cargo and Tauri config', () => {
    const files = getTemplateFiles('my-desktop-app', 'tauri-desktop');
    expect(files.some(f => f.path === 'src-tauri/Cargo.toml')).toBe(true);
    expect(files.some(f => f.path === 'src-tauri/tauri.conf.json')).toBe(true);
    expect(files.some(f => f.path === 'src-tauri/src/main.rs')).toBe(true);

    const pkg = files.find(f => f.path === 'package.json');
    expect(pkg?.content).toContain('@tauri-apps/api');
  });

  it('generates spatial-webxr starter template with 3D anchors', () => {
    const files = getTemplateFiles('my-spatial-game', 'spatial-webxr');
    const pkg = files.find(f => f.path === 'package.json');
    expect(pkg?.content).toContain('@zuari/spatial');

    const main = files.find(f => f.path === 'src/main.ts');
    expect(main?.content).toContain('createSpatialAnchor');
    expect(main?.content).toContain('bindAnchorToElement');
  });

  it('generates kotlin-android (KMP / Android NDK) template with MainActivity', () => {
    const files = getTemplateFiles('my-android-app', 'kotlin-android');
    const ktFile = files.find(f => f.path.endsWith('MainActivity.kt'));
    expect(ktFile).toBeDefined();
    expect(ktFile?.content).toContain('class MainActivity : AppCompatActivity()');
    expect(ktFile?.content).toContain('ZuariAndroidBridge');

    const mainTs = files.find(f => f.path === 'src/main.ts');
    expect(mainTs?.content).toContain('ZuariNativeBridge');
  });
});
