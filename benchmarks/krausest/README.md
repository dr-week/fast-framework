# js-framework-benchmark Submission Guide for Zuari

This directory contains the official keyed implementation of **Zuari** ready for upstream submission to the [krausest/js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) repository.

## Upstream Integration Steps

1. Fork and clone `https://github.com/krausest/js-framework-benchmark`.
2. Copy this directory into `frameworks/keyed/zuari`:
   ```bash
   cp -r benchmarks/krausest/ <js-framework-benchmark-path>/frameworks/keyed/zuari
   ```
3. In `<js-framework-benchmark-path>/frameworks/keyed/zuari`:
   - Replace `"workspace:*"` in `package.json` with the released npm package version (e.g. `"^0.1.0"`).
   - Run `npm install && npm run build`.
4. Test with the benchmark driver:
   ```bash
   npm run bench keyed/zuari
   ```
5. Submit a Pull Request titled:
   `Add Zuari (keyed) framework implementation`

## Benchmarked Architecture
- **Framework:** Zuari (`@zuari/signals` + `@zuari/dom`)
- **Type:** Keyed
- **Engine:** Direct-to-DOM compilation using W3C DOM Parts and fine-grained TC39 Signal subscriptions.
- **Virtual DOM:** 0% (Zero VDOM tree allocation or full-tree diffing).
