# Zuari Native & Cross-Platform Specification ("Zuari Everywhere")
*Architectural Blueprint and Requirements for Extending Zuari to iOS, Windows, Android, watchOS, and Mixed Reality (visionOS / Meta Horizon).*

---

## 1. Executive Summary & Core Challenge
Web frameworks traditionally encounter a brick wall when attempting to run on native mobile, desktop, and wearables:
* **The DOM is a Web-Only Abstraction:** iOS (UIKit/SwiftUI), Android (Jetpack Compose), Windows (WinUI 3), and watchOS do not have a DOM (`document.createElement`, HTML nodes, CSS engine).
* **The React Native Pitfall:** Shipping a heavy JavaScript engine (Hermes/V8), a custom synthetic C++ bridge, and duplicating layout calculations with Yoga creates high memory usage and latency.
* **The Flutter Tradeoff:** Re-implementing every pixel with a custom canvas engine (Impeller/Skia) loses native OS accessibility, text rendering, and platform feel.

### The Zuari Architecture Solution:
Because **Zuari's core reactivity (`@zuari/signals`) has ZERO dependencies on the DOM or browser APIs**, we separate the framework into two distinct layers:
1. **The Agnostic Reactive Kernel (`@zuari/signals`):** Pure state graph executing identically in JavaScript, Node, QuickJS, or compiled native runtimes.
2. **Pluggable Platform Drivers (Render Backends):**
   - `@zuari/dom` ──► Web Browsers (DOM / HTMLTemplate)
   - `@zuari/native-mobile` ──► iOS & Android (Tauri v2 / Native Views)
   - `@zuari/windows` ──► Windows (WebView2 / WinUI 3 Native Controls)
   - `@zuari/wearables` ──► watchOS & WearOS (Micro-Signals + Headless Complications)
   - `@zuari/spatial` ──► Apple Vision Pro & Meta Quest (WebXR / RealityKit)

---

## 2. Platform-by-Platform Requirements Matrix

| Target Platform | Tier | Primary Runtime Strategy | Native UI Engine Target | Memory Footprint Target |
| :--- | :---: | :--- | :--- | :---: |
| **Android** | Tier 1 | Rust Native Shell (Tauri v2 Mobile) or JNI Bridge | Android View / Jetpack Compose | < 15 MB |
| **iOS** | Tier 1 | Rust Native Shell (Tauri v2 Mobile) or JavaScriptCore C-Bridge | UIKit / SwiftUI View Hierarchy | < 15 MB |
| **Windows** | Tier 1 | Rust Native Host (Tauri v2 / WinUI 3 C# Native Host) | Windows App SDK / WinUI 3 | < 20 MB |
| **visionOS / Meta Quest (MR)** | Tier 2 | WebXR Spatial Canvas + RealityKit Bridge | 3D Volumetric Windows & Anchors | < 35 MB |
| **watchOS / WearOS** | Tier 3 | Embedded JS Core (QuickJS / Hermes micro) to Native Watch Primitives | SwiftUI WatchKit / WearOS Tiles | < 8 MB |

---

## 3. Detailed Platform Requirements

### A. iOS & Android (Mobile)

#### Functional Requirements:
* **REQ-MOB-01 (Dual-Track Deployment):**
  1. *Track 1 (Instant / Zero-Effort):* Official **Tauri v2 Mobile** starter template compiling `@zuari/core` into native `.ipa` (iOS) and `.apk` / `.aab` (Android) with native hardware bridge (camera, haptics, geolocation, biometric auth).
  2. *Track 2 (Pure Native Views):* A headless driver emitting native platform widgets (SwiftUI `Button`/`VStack` on iOS; Compose `Button`/`Column` on Android) bound directly to Zuari signals via C FFI.
* **REQ-MOB-02 (Native Hardware Haptics):**
  * Tactile feedback integrated directly into `@zuari/headless` glyph buttons (calling `UIImpactFeedbackGenerator` on iOS, `Vibrator` on Android).
* **REQ-MOB-03 (Sub-100ms Cold Start):**
  * Total app cold-launch to interactive frame under **100ms** on mid-range Android devices (leveraging Zuari’s 0ms hydration overhead).

---

### B. Windows (Desktop)

#### Functional Requirements:
* **REQ-WIN-01 (Tauri v2 + WebView2 Shell):**
  * Native Windows installer (`.msi` / `.exe`) targeting Evergreen WebView2 runtime with native title bar, mica/acrylic glassmorphism blur, and system tray integration.
* **REQ-WIN-02 (WinUI 3 Native Control Driver):**
  * Provide `@zuari/winui` driver binding Zuari signals directly to C++/WinRT native XAML elements for enterprise-grade non-web apps.
* **REQ-WIN-03 (Keyboard & Window State Binding):**
  * Native OS global hotkeys (e.g. `Win + Alt + K` to open the Zuari Command Palette anywhere on the OS).

---

### C. Mixed Reality & Wearable Spatial Devices (Apple Vision Pro, Meta Quest)

#### Functional Requirements:
* **REQ-MR-01 (Spatial Anchor Positioning):**
  * Extend CSS Anchor Positioning into 3D space (`spatial-anchor: --spatial-target`) mapping to WebXR volumetric transforms (`xr-layer`).
* **REQ-MR-02 (Aether-Glyph Volumetric Floating Docks):**
  * The Zuari dock renders as a floating glass ribbon in 3D world-space with native Apple Vision Pro eye-tracking hover states (`hover: spatial-highlight`).
* **REQ-MR-03 (Spatial Sound & Depth Cues):**
  * Interacting with glyph tiles triggers localized spatial audio cues and Z-axis spring displacement (pushing backward into virtual space upon finger pinch).

---

### D. watchOS & WearOS (Smartwatches)

#### Functional Requirements:
* **REQ-WATCH-01 (Extreme Memory Constraint < 8 MB):**
  * Standalone watchOS does not allow full web browser engines. The watchOS driver compiles Zuari signals to run inside an ultra-compact embedded **QuickJS engine (<200 KB)**.
* **REQ-WATCH-02 (Glanceable Glyph Complications):**
  * Provide `@zuari/wearables` templates that render SVG glyphs directly into Apple Watch **Complications** and WearOS **Tiles**.
* **REQ-WATCH-03 (Rotary / Digital Crown Integration):**
  * Native driver binding Digital Crown rotation events directly to Zuari numeric signals (e.g. `scrollSignal.value += delta`).

---

## 4. Cross-Platform Architectural Blueprint

```
┌────────────────────────────────────────────────────────┐
│               Developer Code (TypeScript)              │
│       Signals + State Machine + Headless Primitives    │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────▼────────────┐
               │     @zuari/signals      │
               │ (Platform-Agnostic Core)│
               └────────────┬────────────┘
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
┌─────────────────┐┌─────────────────┐┌─────────────────┐
│ Web & PWA       ││ iOS / Android / ││ watchOS / MR    │
│ Driver          ││ Windows Driver  ││ Spatial Driver  │
│ (@zuari/dom)    ││ (Tauri / Bridge)││ (QuickJS/WebXR) │
│ - <template>    ││ - Native Views  ││ - Watch Tiles   │
│ - CSS Anchor    ││ - Hardware API  ││ - 3D Anchors    │
│ - @scope        ││ - OS Windows    ││ - Eye Tracking  │
└─────────────────┘└─────────────────┘└─────────────────┘
```

---

## 5. Implementation Roadmap for Native Support

### Phase 1: Hybrid-Native Mobile & Desktop Starter (Quick Win)
* Create official template `create-zuari-app --mobile` utilizing **Tauri v2 Mobile (Rust engine)**.
* Enables developers to build iOS, Android, and Windows binaries with native camera, biometric, and filesystem access immediately with zero framework bloat.

### Phase 2: WebXR Spatial Extension (`@zuari/spatial`)
* Implement 3D spatial anchor positioning and eye-tracking gesture support for Vision Pro (Safari) and Meta Quest.

### Phase 3: Headless WatchOS / WearOS Tile Generator (`@zuari/wearables`)
* Provide standalone watch complication compiler converting Zuari signal state into static OS widget manifests.
