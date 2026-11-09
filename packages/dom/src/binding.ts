import { effect, type CleanupFn } from '@zuari/signals'
import { createChildPart, createAttributePart } from './parts/index.js'
import type { TemplateValue } from './template.js'

export function bindDynamicHole(
  root: DocumentFragment,
  index: number,
  value: TemplateValue,
  cleanups: CleanupFn[]
): void {
  const commentNode = findCommentHole(root, `<!--zuari-hole-${index}-->`)
  if (commentNode) {
    const childPart = createChildPart(commentNode)
    if (isReactive(value)) {
      const dispose = effect(() => childPart.setValue(unwrap(value)))
      cleanups.push(() => {
        dispose()
        childPart.disconnect?.()
      })
    } else {
      childPart.setValue(value)
    }
    return
  }

  const marker = `data-zuari-attr-${index}`
  const found = findElementWithAttributeMarker(root, marker)
  if (!found) return
  const { element, attrName } = found
  if (attrName.startsWith('@') || attrName.startsWith('on')) {
    const eventName = (attrName.startsWith('@') ? attrName.slice(1) : attrName.slice(2)).toLowerCase()
    element.removeAttribute(attrName)
    if (typeof value !== 'function') return
    const handler = value as EventListener
    element.addEventListener(eventName, handler)
    cleanups.push(() => element.removeEventListener(eventName, handler))
    return
  }

  const part = createAttributePart(element, attrName)
  if (isReactive(value)) {
    const dispose = effect(() => part.setValue(unwrap(value)))
    cleanups.push(() => {
      dispose()
      part.disconnect?.()
    })
  } else {
    part.setValue(value)
  }
}

function isReactive(value: unknown): boolean {
  return (typeof value === 'object' && value !== null && 'value' in value) || typeof value === 'function'
}

function unwrap(value: unknown): unknown {
  if (typeof value === 'object' && value !== null && 'value' in value) {
    return (value as { value: unknown }).value
  }
  return typeof value === 'function' ? (value as () => unknown)() : value
}

function findCommentHole(node: Node, target: string): Comment | null {
  const iterator = document.createNodeIterator(node, NodeFilter.SHOW_COMMENT)
  let current = iterator.nextNode() as Comment | null
  while (current) {
    if (`<!--${current.data}-->` === target) return current
    current = iterator.nextNode() as Comment | null
  }
  return null
}

function findElementWithAttributeMarker(
  root: Node,
  marker: string
): { element: Element; attrName: string } | null {
  const iterator = document.createNodeIterator(root, NodeFilter.SHOW_ELEMENT)
  let current = iterator.nextNode() as Element | null
  while (current) {
    for (const attr of Array.from(current.attributes)) {
      if (attr.value.includes(marker)) return { element: current, attrName: attr.name }
    }
    current = iterator.nextNode() as Element | null
  }
  return null
}
