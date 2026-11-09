import type { GeneratedFile } from '../types.js';

export function createSpatialWebxrFiles(projectName: string): GeneratedFile[] {
    const packageJson = JSON.stringify(
      {
        name: projectName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite --host',
          build: 'tsc && vite build',
          preview: 'vite preview'
        },
        dependencies: {
          '@zuari/core': '^0.1.0',
          '@zuari/signals': '^0.1.0',
          '@zuari/dom': '^0.1.0',
          '@zuari/spatial': '^0.1.0',
          '@zuari/webgpu': '^0.1.0'
        },
        devDependencies: {
          typescript: '^5.9.0',
          vite: '^6.0.0'
        }
      },
      null,
      2
    );

    const mainTs = `import { signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import { createSpatialAnchor, bindAnchorToElement } from '@zuari/spatial';

const hudActive = signal(true);
const anchor = createSpatialAnchor({
  id: 'spatial-hud-main',
  initialPosition: { x: 0, y: 0.2, z: -1.2 }
});

const view = html\`
  <div style="font-family: system-ui; width: 360px; padding: 24px; background: rgba(20,20,30,0.85); backdrop-filter: blur(16px); color: #fff; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
    <h2 style="margin: 0 0 12px 0;">🥽 120 FPS WebXR HUD</h2>
    <p style="font-size: 14px; opacity: 0.8;">Anchored in 3D stereoscopic space for Apple Vision Pro & Meta Quest 3.</p>
    <div style="margin: 16px 0;">
      Status: <strong style="color: #69f0ae;">\${() => (hudActive.value ? 'TRACKING 120Hz' : 'STANDBY')}</strong>
    </div>
    <button style="padding: 10px 18px; border-radius: 8px; border: none; background: #6200ea; color: #fff; cursor: pointer;" @click=\${() => { hudActive.value = !hudActive.value; }}>
      Toggle Anchor State
    </button>
  </div>
\`;

const { fragment } = render(view);
const card = fragment.firstElementChild as HTMLElement;
bindAnchorToElement(anchor, card);
document.getElementById('app')?.appendChild(fragment);
`;

    return [
      { path: 'package.json', content: packageJson },
      { path: 'src/main.ts', content: mainTs },
      {
        path: 'index.html',
        content: `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${projectName} • Spatial WebXR</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>`
      },
      {
        path: 'tsconfig.json',
        content: `{\n  "compilerOptions": { "target": "ESNext", "module": "ESNext", "moduleResolution": "Bundler", "strict": true }\n}`
      }
    ];
  
}
