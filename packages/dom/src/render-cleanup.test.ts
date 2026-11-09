import { describe, expect, it, vi } from 'vitest'
import { html, render } from './index.js'

describe('render cleanup', () => {
  it('removes only owned nodes and releases event listeners', () => {
    const container = document.createElement('div')
    const existing = document.createElement('span')
    const clickHandler = vi.fn()
    container.append(existing)
    const instance = render(html`<button @click=${clickHandler}>Click</button>`, container)
    const button = container.querySelector('button')!

    instance.destroy()
    button.click()

    expect(container.firstElementChild).toBe(existing)
    expect(button.parentNode).toBeNull()
    expect(clickHandler).not.toHaveBeenCalled()
  })
})
