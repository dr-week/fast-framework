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

  it('generates a modular product starter with API, feature, and app boundaries', () => {
    const files = getTemplateFiles('my-product', 'modular-product');
    const paths = files.map(file => file.path);

    expect(paths).toContain('src/api/client.ts');
    expect(paths).toContain('src/api/contracts.ts');
    expect(paths).toContain('src/api/contracts.test.ts');
    expect(paths).toContain('src/features/overview/index.ts');
    expect(paths).toContain('src/features/overview/model.ts');
    expect(paths).toContain('src/features/overview/controller.ts');
    expect(paths).toContain('src/features/overview/view.ts');
    expect(paths).toContain('src/app/shell.ts');
    expect(paths).toContain('src/app/settings.ts');
    expect(paths).toContain('README.md');

    const model = files.find(file => file.path === 'src/features/overview/model.ts');
    expect(model?.content).toContain("'loading'");
    expect(model?.content).toContain("'empty'");
    expect(model?.content).toContain("'error'");

    const featureView = files.find(file => file.path === 'src/features/overview/view.ts');
    expect(featureView?.content).toContain('repeat(model.items, item => item.id');

    const settings = files.find(file => file.path === 'src/app/settings.ts');
    expect(settings?.content).toContain('createDesignPresets');
    expect(settings?.content).toContain("'midnight'");

    const parser = files.find(file => file.path === 'src/api/contracts.ts');
    expect(parser?.content).toContain('parseOverviewItems');
    expect(parser?.content).toContain('invalid shape');

    const packageJson = files.find(file => file.path === 'package.json');
    expect(packageJson?.content).toContain('"test": "vitest run"');

    const readme = files.find(file => file.path === 'README.md');
    expect(readme?.content).toContain('no fake business data');
    expect(readme?.content).toContain('modular monolith');
  });
});
