import { effect, type CleanupFn, type Signal } from '@zuari/signals';
import { render, type TemplateResult, type RenderInstance } from './index.js';

/**
 * Keyed List Reconciliation Primitive (repeat / keyed).
 *
 * Efficiently reconciles an array of items without Virtual DOM diffing.
 * Tracks items by unique key, preserving existing DOM nodes and their component/state
 * lifecycles across reorders, insertions, and deletions.
 *
 * @param itemsSignal Array or reactive signal of items
 * @param keyFn Pure function returning a unique key (string or number) per item
 * @param templateFn Renderer returning a TemplateResult for each item
 *
 * @example
 * ```ts
 * const todos = signal([{ id: 1, text: 'Build Zuari' }]);
 * const view = html`
 *   <ul>
 *     ${repeat(todos, t => t.id, (todo, index) => html`<li>${todo.text}</li>`)}
 *   </ul>
 * `;
 * ```
 */
export function repeat<T>(
  itemsSignal: Signal<readonly T[]> | Signal<T[]> | (() => readonly T[]) | (() => T[]) | readonly T[] | T[],
  keyFn: (item: T, index: number) => string | number,
  templateFn: (item: T, index: number) => TemplateResult
): () => Node {
  return () => {
    // Marker comment pair acting as a virtual anchor range
    const startMarker = document.createComment('zuari-repeat-start');
    const endMarker = document.createComment('zuari-repeat-end');
    const fragment = document.createDocumentFragment();
    fragment.appendChild(startMarker);
    fragment.appendChild(endMarker);

    interface ItemEntry {
      key: string | number;
      nodes: Node[];
      instance: RenderInstance;
      index: number;
    }

    let currentEntries = new Map<string | number, ItemEntry>();

    const getItems = (): T[] => {
      if (typeof itemsSignal === 'function') {
        return (itemsSignal as () => T[])();
      }
      if (itemsSignal && typeof itemsSignal === 'object' && 'value' in itemsSignal) {
        return (itemsSignal as Signal<T[]>).value;
      }
      return itemsSignal as T[];
    };

    effect(() => {
      const items = getItems() || [];
      const parent = startMarker.parentNode;

      // First run before insertion into live DOM
      const targetParent = parent || fragment;

      const newEntries = new Map<string | number, ItemEntry>();
      const newEntryList: ItemEntry[] = [];

      // Step 1: Render new items or reuse existing nodes
      for (let i = 0; i < items.length; i++) {
        const item = items[i]!;
        const key = keyFn(item, i);
        let entry = currentEntries.get(key);

        if (entry) {
          entry.index = i;
          newEntries.set(key, entry);
          newEntryList.push(entry);
        } else {
          // Render item freshly
          const res = templateFn(item, i);
          const inst = render(res);
          // Snapshot child nodes created by fragment
          const nodes = Array.from(inst.fragment.childNodes);
          entry = {
            key,
            nodes,
            instance: inst,
            index: i
          };
          newEntries.set(key, entry);
          newEntryList.push(entry);
        }
      }

      // Step 2: Remove unkeyed/deleted entries and invoke teardowns
      for (const [key, entry] of currentEntries) {
        if (!newEntries.has(key)) {
          for (const node of entry.nodes) {
            if (node.parentNode) {
              node.parentNode.removeChild(node);
            }
          }
          entry.instance.destroy();
        }
      }

      // Step 3: Reorder / insert in single pass
      let cursor: Node = endMarker;
      // Loop backwards from end of list and insertBefore cursor
      for (let i = newEntryList.length - 1; i >= 0; i--) {
        const entry = newEntryList[i]!;
        const nodes = entry.nodes;
        // Insert nodes in reverse order right before cursor
        for (let j = nodes.length - 1; j >= 0; j--) {
          const n = nodes[j]!;
          if (n.nextSibling !== cursor || n.parentNode !== targetParent) {
            targetParent.insertBefore(n, cursor);
          }
        }
        if (nodes.length > 0) {
          cursor = nodes[0]!;
        }
      }

      currentEntries = newEntries;
    });

    return fragment;
  };
}

/**
 * Keyed alias matching Solid / Svelte style.
 */
export const keyed = repeat;
