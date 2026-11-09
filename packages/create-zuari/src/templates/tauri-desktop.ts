import type { GeneratedFile } from '../types.js';

export function createTauriDesktopFiles(projectName: string): GeneratedFile[] {
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
