import type { GeneratedFile } from '../types.js';

export function createKotlinAndroidFiles(projectName: string): GeneratedFile[] {
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
