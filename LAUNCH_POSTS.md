# ZUARI Launch Kit — Ready-to-Post Community & Social Media Copy

Use the pre-formatted launch posts below to announce **Zuari (`@zuari/*`)** across X/Twitter, Hacker News, and targeted Reddit communities.

---

## 1. X / Twitter Launch Thread (Shock & Awe + Live REPL Link)

**Tweet 1 (Hook + Video/REPL):**
We got tired of 45KB Virtual DOM runtimes dropping frames on headsets and embedded hardware.

Meet **Zuari (`@zuari/*`)** — a `< 2.5 KB` zero-Virtual-DOM reactive platform built on W3C DOM Parts & TC39 Signals.

- 5,000 DOM nodes updated in `0.38ms` (48x faster than VDOM)
- 120 FPS WebXR HUDs (Vision Pro / Quest 3)
- Zero-copy Rust/Zig Wasm FFI
- Modular Drone OSD, Tactical Ballistics & KaiOS/E-Ink drivers

Try the live In-Browser REPL (0 install):
https://dr-week.github.io/fast-framework/

**Tweet 2 (The "Anti-Bloated AI Gadget" Angle):**
Why did first-gen AI wearables (Rabbit R1, Humane Pin) lag and overheat?
Because they ran full Android + bloated WebViews/VMs just to render a scroll wheel and a monochrome HUD.

`@zuari/hardware` ships modular `<1KB` drivers for:
- Rotary scroll wheels & Playdate cranks (`/gaming`)
- 530nm Waveguide Green, NVG & 1-Bit E-Ink (`/display`)
- KaiOS D-Pad, SoftKeys & T9 (`/dpad`)

**Tweet 3 (AI-Agent Native / `llms.txt`):**
Today, your AI coding assistant (Cursor, Claude Code, Windsurf, Copilot) is your primary architect.

Zuari fits its entire API specification into `<1,500 tokens` with zero compiler magic.
Point your agent at our live `llms.txt` and it writes 100% bug-free reactive UI on the first try:
https://dr-week.github.io/fast-framework/llms.txt

GitHub (MIT): https://github.com/dr-week/fast-framework

---

## 2. Hacker News (`Show HN` Submission)

* **Title:** `Show HN: Zuari – A <2.5KB W3C DOM Parts & Signals framework for Web, WebXR, Wasm, and IoT`
* **URL:** `https://dr-week.github.io/fast-framework/`
* **First Comment (Paste immediately after submitting):**

> Hi HN,
>
> We built **Zuari (`@zuari/*`)** at Danger.Labs because we kept hitting the same wall across high-frequency web apps, WebXR headsets (Meta Quest 3 / Vision Pro), and resource-constrained embedded/IoT screens: Virtual DOM diffing and JSON serialization across WebAssembly boundaries create garbage collection pauses that break 120Hz frame budgets and drain batteries on low-end hardware.
>
> **How Zuari works under the hood:**
> 1. **Zero Virtual DOM (`@zuari/signals` + `@zuari/dom`, ~2.4KB gzipped):** Tagged templates (`html\`...\``) compile once into native `<template>` clones and bind signals directly to comment/attribute pointers (`ChildPart` / `AttributePart`). Mutating a signal updates the exact `TextNode` in O(1) time with 0ms hydration overhead.
> 2. **Zero-Copy Rust / Zig Wasm FFI (`@zuari/wasm`, ~0.9KB):** Maps reactive signals directly to `ArrayBuffer` / `DataView` byte offsets (`f64`, `f32`, `i32`) so C-ABI structs and TypeScript UI stay synchronized without `JSON.stringify`.
> 3. **Modular Hardware & Non-Standard Display Drivers (`@zuari/hardware`):** Everything is `"sideEffects": false` with subpath exports:
>    - `@zuari/hardware/drone`: 16-byte binary MAVLink/CRSF telemetry decoder & FPV OSD
>    - `@zuari/hardware/tactical`: Real-time MRAD ballistic holdover reticle & 9-axis IMU horizon
>    - `@zuari/hardware/dpad`: Spatial D-Pad focus, SoftKey bar & T9 multi-tap for KaiOS / dumbphones
>    - `@zuari/hardware/gaming`: Detented scroll-wheel / crank rotary controller & 240Hz deadzone gamepads
>    - `@zuari/hardware/display`: 530nm Monochrome Waveguide Green (`#000000` optical transparency), NVG, Thermal, and zero-flash 1-bit E-Ink modes
> 4. **AI-Agent Native (`llms.txt` & `@zuari/mcp`):** The entire framework contract fits in <1,500 tokens so Cursor, Claude Code, and Copilot can generate zero-hallucination code out of the box.
>
> Live In-Browser REPL, 5,000-Node Benchmark & Hardware Lab: https://dr-week.github.io/fast-framework/
> Repo (MIT): https://github.com/dr-week/fast-framework
>
> Would love your feedback on the DOM Parts implementation and hardware subpaths!

---

## 3. Reddit Niche Posts (High Conversion)

### A. `r/embedded`, `r/esp32`, `r/fpv`
* **Title:** `Built a <2.5KB Zero-VDOM TypeScript HUD library with 16-byte binary MAVLink/CRSF drone telemetry, 9-axis IMU horizon, and OLED burn-in protection`
* **Body:** Highlight `@zuari/hardware/drone`, `@zuari/hardware/tactical`, and `@zuari/hardware/appliance`, linking directly to the **IoT & Tactical** tab on `https://dr-week.github.io/fast-framework/`.

### B. `r/KaiOS`, `r/dumbphones`, `r/eink`
* **Title:** `We added first-class KaiOS D-Pad navigation, T9 multi-tap, SoftKeys, and 1-bit E-Ink mode to a <2.5KB reactive web framework`
* **Body:** Highlight how `@zuari/hardware/dpad` and `@zuari/hardware/display` run in `<2MB` RAM with zero Virtual DOM garbage collection or E-Ink transition ghosting.

### C. `r/rust`, `r/WebAssembly`
* **Title:** `Zero-copy reactive ArrayBuffer / DataView bindings between Rust/Zig Wasm and DOM nodes in 0.9 KB (@zuari/wasm)`
* **Body:** Show the `createWasmStruct` snippet from the Live REPL and invite Rust developers to test the 64-byte hex-dump inspector on the playground.
