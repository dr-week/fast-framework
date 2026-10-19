/**
 * @fileoverview Scaffolding generator engine for create-zuari CLI.
 */

import type { ScaffoldOptions, GeneratedFile, ZuariTemplate } from './types.js';

export function getTemplateFiles(projectName: string, rawTemplate: ZuariTemplate = 'vanilla-ts'): GeneratedFile[] {
  // Normalize template name aliases
  let template: 'vanilla-ts' | 'tauri-desktop' | 'spatial-webxr' | 'kotlin-android' | 'wasm' = 'vanilla-ts';
  if (rawTemplate === 'spatial' || rawTemplate === 'spatial-webxr') {
    template = 'spatial-webxr';
  } else if (rawTemplate === 'tauri' || rawTemplate === 'tauri-desktop') {
    template = 'tauri-desktop';
  } else if (rawTemplate === 'kotlin-android') {
    template = 'kotlin-android';
  } else if (rawTemplate === 'wasm') {
    template = 'wasm';
  } else {
    template = 'vanilla-ts';
  }

  // --- 1. vanilla-ts (Core Web) ---
  if (template === 'vanilla-ts') {
    const packageJson = JSON.stringify(
      {
        name: projectName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview'
        },
        dependencies: {
          '@zuari/core': '^0.1.0',
          '@zuari/signals': '^0.1.0',
          '@zuari/dom': '^0.1.0',
          '@zuari/ui': '^0.1.0',
          '@zuari/tokens': '^0.1.0',
          '@zuari/presets': '^0.1.0'
        },
        devDependencies: {
          typescript: '^5.9.0',
          vite: '^6.0.0'
        }
      },
      null,
      2
    );

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName} • Zuari App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`;

    const mainTs = `import { signal, computed, effectScope, onMount } from '@zuari/signals';
import { html, render, repeat, when } from '@zuari/dom';

const count = signal(0);
const doubled = computed(() => count.value * 2);

const todos = signal([
  { id: 1, text: 'Install Zuari CLI' },
  { id: 2, text: 'Experience 0% Virtual DOM Velocity' },
  { id: 3, text: 'Ship Production Web App' }
]);

const scope = effectScope(() => {
  onMount(() => {
    console.log('⚡ [Zuari] App mounted with fine-grained reactivity.');
  });
});

const view = html\`
  <main style="font-family: system-ui, -apple-system, sans-serif; max-width: 640px; margin: 40px auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h1 style="margin-top: 0;">⚡ ${projectName}</h1>
    <p style="color: #666;">Built on <strong>Zuari</strong> — zero Virtual DOM, fine-grained TC39 Signals, pure W3C DOM Parts.</p>

    <div style="margin: 24px 0; padding: 16px; background: #fafafa; border-radius: 8px;">
      <button style="padding: 10px 20px; font-size: 16px; cursor: pointer; border-radius: 6px; border: 1px solid #333; background: #222; color: #fff;" @click=\${() => { count.value++; }}>
        Clicked: \${count} times
      </button>
      <span style="margin-left: 16px; font-weight: 500;">Doubled: \${doubled}</span>
    </div>

    <h3>Keyed Checklist:</h3>
    <ul style="line-height: 1.8;">
      \${repeat(todos, item => item.id, item => html\`
        <li>\${item.text}</li>
      \`)}
    </ul>

    \${when(count, () => html\`
      <div style="margin-top: 20px; color: #2e7d32; font-weight: bold;">
        Awesome! Counter is active (\${count}).
      </div>
    \`)}
  </main>
\`;

const { fragment } = render(view);
document.getElementById('app')?.appendChild(fragment);
`;

    const tsconfig = JSON.stringify(
      {
        compilerOptions: {
          target: 'ESNext',
          module: 'ESNext',
          moduleResolution: 'Bundler',
          strict: true,
          skipLibCheck: true
        },
        include: ['src/**/*']
      },
      null,
      2
    );

    return [
      { path: 'package.json', content: packageJson },
      { path: 'index.html', content: indexHtml },
      { path: 'tsconfig.json', content: tsconfig },
      { path: 'src/main.ts', content: mainTs }
    ];
  }

  // --- 2. tauri-desktop (Rust + Zuari) ---
  if (template === 'tauri-desktop') {
    const packageJson = JSON.stringify(
      {
        name: projectName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          'tauri:dev': 'tauri dev',
          'tauri:build': 'tauri build'
        },
        dependencies: {
          '@zuari/core': '^0.1.0',
          '@zuari/signals': '^0.1.0',
          '@zuari/dom': '^0.1.0',
          '@zuari/wasm': '^0.1.0',
          '@tauri-apps/api': '^2.0.0'
        },
        devDependencies: {
          '@tauri-apps/cli': '^2.0.0',
          typescript: '^5.9.0',
          vite: '^6.0.0'
        }
      },
      null,
      2
    );

    const tauriConf = JSON.stringify(
      {
        productName: projectName,
        version: '0.1.0',
        identifier: `com.zuari.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
        build: {
          beforeDevCommand: 'pnpm dev',
          devUrl: 'http://localhost:5173',
          beforeBuildCommand: 'pnpm build',
          frontendDist: '../dist'
        },
        app: {
          windows: [
            {
              title: `${projectName} (Tauri + Zuari Native)`,
              width: 900,
              height: 650
            }
          ]
        }
      },
      null,
      2
    );

    const cargoToml = `[package]
name = "${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_src"
version = "0.1.0"
edition = "2021"

[dependencies]
tauri = { version = "2.0", features = [] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

[build-dependencies]
tauri-build = { version = "2.0", features = [] }
`;

    const mainRs = `// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[tauri::command]
fn greet_zuari(name: &str) -> String {
    format!("Hello, {}! Driven by Rust and Zuari's zero-VDOM reactivity.", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet_zuari])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
`;

    const mainTs = `import { signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';
import { invoke } from '@tauri-apps/api/core';

const response = signal('Waiting for Rust IPC...');

async function pingRust() {
  try {
    const res = await invoke<string>('greet_zuari', { name: 'Native Developer' });
    response.value = res;
  } catch (err) {
    response.value = String(err);
  }
}

const view = html\`
  <main style="font-family: system-ui; padding: 32px; text-align: center;">
    <h1>🦀 Tauri v2 + ⚡ Zuari</h1>
    <p>Zero-overhead native desktop app powered by Rust backend and Zuari reactive DOM.</p>
    <div style="margin: 24px 0;">
      <button style="padding: 12px 24px; font-size: 15px; cursor: pointer;" @click=\${pingRust}>
        Invoke Rust Command
      </button>
    </div>
    <div style="padding: 16px; background: #f0f0f0; border-radius: 8px; font-family: monospace;">
      \${response}
    </div>
  </main>
\`;

const { fragment } = render(view);
document.getElementById('app')?.appendChild(fragment);
`;

    return [
      { path: 'package.json', content: packageJson },
      { path: 'src-tauri/tauri.conf.json', content: tauriConf },
      { path: 'src-tauri/Cargo.toml', content: cargoToml },
      { path: 'src-tauri/src/main.rs', content: mainRs },
      { path: 'src/main.ts', content: mainTs },
      {
        path: 'index.html',
        content: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${projectName}</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>`
      },
      {
        path: 'tsconfig.json',
        content: `{\n  "compilerOptions": { "target": "ESNext", "module": "ESNext", "moduleResolution": "Bundler", "strict": true }\n}`
      }
    ];
  }

  // --- 3. spatial-webxr (Apple Vision Pro / Meta Quest 3) ---
  if (template === 'spatial-webxr') {
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

  // --- 4. kotlin-android (KMP / Android NDK / WebView Zero-Copy Bridge) ---
  if (template === 'kotlin-android') {
    const packageJson = JSON.stringify(
      {
        name: projectName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          build: 'tsc && vite build'
        },
        dependencies: {
          '@zuari/core': '^0.1.0',
          '@zuari/signals': '^0.1.0',
          '@zuari/dom': '^0.1.0',
          '@zuari/hardware': '^0.1.0'
        },
        devDependencies: {
          typescript: '^5.9.0',
          vite: '^6.0.0'
        }
      },
      null,
      2
    );

    const mainActivityKt = `package com.zuari.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}

import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        webView = WebView(this)
        setContentView(webView)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.addJavascriptInterface(ZuariAndroidBridge(this), "ZuariNativeBridge")
        webView.webViewClient = WebViewClient()
        webView.loadUrl("file:///android_asset/dist/index.html")
    }

    class ZuariAndroidBridge(private val activity: MainActivity) {
        @JavascriptInterface
        fun postTelemetry(json: String) {
            println("[Zuari Android NDK Telemetry]: $json")
        }
    }
}
`;

    const mainTs = `import { signal } from '@zuari/signals';
import { html, render } from '@zuari/dom';

declare global {
  interface Window {
    ZuariNativeBridge?: { postTelemetry: (json: string) => void };
  }
}

const batteryLevel = signal(98);
const isCharging = signal(true);

function syncToAndroid() {
  const payload = JSON.stringify({ battery: batteryLevel.value, charging: isCharging.value });
  window.ZuariNativeBridge?.postTelemetry(payload);
}

const view = html\`
  <main style="padding: 24px; font-family: sans-serif; text-align: center;">
    <h2>🤖 Android NDK + Zuari Web Layer</h2>
    <p>Zero-overhead reactive WebView interface for Kotlin Multiplatform.</p>
    <div style="margin: 20px; font-size: 18px;">
      Battery: <strong>\${batteryLevel}%</strong> | Charging: <strong>\${() => (isCharging.value ? 'YES' : 'NO')}</strong>
    </div>
    <button style="padding: 12px 24px; font-size: 16px; border-radius: 8px;" @click=\${() => { batteryLevel.value--; syncToAndroid(); }}>
      Simulate Discharge & Send to Kotlin
    </button>
  </main>
\`;

const { fragment } = render(view);
document.getElementById('app')?.appendChild(fragment);
`;

    return [
      { path: 'package.json', content: packageJson },
      { path: 'android/src/main/kotlin/MainActivity.kt', content: mainActivityKt },
      { path: 'src/main.ts', content: mainTs },
      {
        path: 'index.html',
        content: `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${projectName}</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>`
      },
      {
        path: 'tsconfig.json',
        content: `{\n  "compilerOptions": { "target": "ESNext", "module": "ESNext", "moduleResolution": "Bundler", "strict": true }\n}`
      }
    ];
  }

  // Fallback minimal
  return getTemplateFiles(projectName, 'vanilla-ts');
}

export * from './types.js';
