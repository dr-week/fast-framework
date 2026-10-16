# @zuari/signals

> *Because diffing an entire Virtual DOM tree when a counter increments is a crime against battery life.*

[![Bundle Size](https://img.shields.io/badge/Size-%3C1.2KB_gzipped-purple.svg?style=flat-square)](#)
[![Dependencies](https://img.shields.io/badge/Dependencies-0-brightgreen.svg?style=flat-square)](#)
[![TypeScript](https://img.shields.io/badge/Strict-100%25-blue.svg?style=flat-square)](#)

`@zuari/signals` is a fine-grained, dependency-tracking reactive state graph designed in alignment with the emerging TC39 Signals standard. 

It does not reconcile trees. It does not re-render component functions. When a value changes, it notifies only the exact downstream computations that depend on it.

---

## 📦 Installation

```bash
pnpm add @zuari/signals
# Or directly from GitHub:
pnpm add github:dr-week/fast-framework#packages/signals
```

---

## 🚀 Usage

### 1. Atomic State (`signal`)
```typescript
import { signal } from '@zuari/signals';

const count = signal(0);

console.log(count.value); // 0
count.value = 42;
console.log(count.value); // 42
```

### 2. Memoized Computations (`computed`)
Computed values evaluate lazily and cache their results. If none of the dependencies change, re-reading the computed value costs zero CPU cycles.

```typescript
import { signal, computed } from '@zuari/signals';

const price = signal(100);
const taxRate = signal(0.18);

const total = computed(() => price.value + (price.value * taxRate.value));

console.log(total.value); // 118
```

### 3. Reactive Effects (`effect`)
Effects automatically record their dependencies upon execution and re-run whenever any tracked dependency updates. If your effect returns a cleanup function, it will run before the next execution.

```typescript
import { signal, effect } from '@zuari/signals';

const status = signal('idle');

const dispose = effect(() => {
  console.log(`Current status: ${status.value}`);
  
  return () => {
    console.log('Cleaning up previous effect...');
  };
});

status.value = 'running'; // Logs cleanup, then logs "Current status: running"
dispose(); // Clean teardown
```

### 4. Micro-Batching (`batch`)
Got 5 signal updates in a row? Don't trigger 5 separate render cascades like it's 2014. Batch them into a single synchronous commit:

```typescript
import { signal, batch } from '@zuari/signals';

const x = signal(0);
const y = signal(0);

batch(() => {
  x.value = 10;
  y.value = 20;
  // Subscribers are alerted exactly ONCE after this block exits.
});
```

---

## 🏛️ Modular Subpath Imports
No monoliths here. You can import internal modules directly:

```typescript
import { Signal, signal } from '@zuari/signals/signal';
import { batch } from '@zuari/signals/scheduler';
```

---

## ⚖️ License
MIT
