import { html, render } from '@zuari/dom'
import { signal } from '@zuari/signals'
import { createButton } from '@zuari/ui/button'

export function mountZuariCounter(root: HTMLElement, onChange: (value: number) => void): () => void {
  const count = signal(0)
  const view = render(html`
    <section class="zuari-card" aria-labelledby="zuari-title">
      <h2 id="zuari-title">Zuari interactive island</h2>
      <p aria-live="polite">Zuari count: <strong>${count}</strong></p>
      <div class="zuari-action"></div>
    </section>
  `, root)
  const action = root.querySelector<HTMLElement>('.zuari-action')
  if (!action) {
    view.destroy()
    throw new Error('Zuari action container was not rendered.')
  }

  const button = createButton({
    label: 'Increment count',
    ariaLabel: 'Increment Zuari count',
    onClick: () => {
      count.value += 1
      onChange(count.value)
    }
  })
  action.append(button.element)

  return () => {
    button.destroy()
    view.destroy()
  }
}
