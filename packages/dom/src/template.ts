import type { CleanupFn, Signal } from '@zuari/signals'
import { bindDynamicHole } from './binding.js'

export type TemplateValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Node
  | Signal<unknown>
  | (() => unknown)
  | TemplateResult

export interface TemplateResult {
  strings: TemplateStringsArray
  values: TemplateValue[]
}

export interface RenderInstance {
  fragment: DocumentFragment
  destroy: CleanupFn
}

const templateCache = new Map<string, HTMLTemplateElement>()
const HOLE_PREFIX = '<!--zuari-hole-'
const HOLE_SUFFIX = '-->'
const ATTR_PREFIX = 'data-zuari-attr-'

export function html(strings: TemplateStringsArray, ...values: TemplateValue[]): TemplateResult {
  return { strings, values }
}

export function render(result: TemplateResult, container?: Element | DocumentFragment): RenderInstance {
  const { strings, values } = result
  const key = strings.join('<!--?-->')
  let template = templateCache.get(key)
  if (!template) {
    template = document.createElement('template')
    template.innerHTML = strings.reduce((markup, text, index) => {
      if (index >= values.length) return markup + text
      const attribute = /=["']?[^"'>]*$/.test(text)
      const marker = attribute ? `"${ATTR_PREFIX}${index}"` : `${HOLE_PREFIX}${index}${HOLE_SUFFIX}`
      return markup + text + marker
    }, '')
    templateCache.set(key, template)
  }

  const fragment = template.content.cloneNode(true) as DocumentFragment
  const ownedNodes = Array.from(fragment.childNodes)
  const cleanups: CleanupFn[] = []
  values.forEach((value, index) => bindDynamicHole(fragment, index, value, cleanups))
  if (container) container.appendChild(fragment)

  return {
    fragment,
    destroy() {
      cleanups.forEach(cleanup => cleanup())
      ownedNodes.forEach(node => node.parentNode?.removeChild(node))
    }
  }
}
