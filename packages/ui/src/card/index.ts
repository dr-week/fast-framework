export interface CardProps {
  title?: string | undefined;
  subtitle?: string | undefined;
  class?: string | undefined;
}

export function createCard(props: CardProps = {}): HTMLDivElement {
  const card = document.createElement('div');
  card.classList.add('zuari-card');
  card.style.border = '1px solid var(--nova-color-border, oklch(100% 0 0 / 0.18))';
  card.style.background = 'var(--nova-color-surface-elevated, var(--nova-color-surface, #141721))';
  card.style.borderRadius = 'var(--nova-radius-squircle, 8px)';
  card.style.boxShadow = 'var(--zuari-elevation-soft, 0 4px 16px -2px rgba(0,0,0,0.4))';
  if (props.class) {
    card.classList.add(props.class);
  }

  if (props.title || props.subtitle) {
    const header = document.createElement('header');
    header.classList.add('zuari-card-header');

    if (props.title) {
      const h3 = document.createElement('h3');
      h3.textContent = props.title;
      header.appendChild(h3);
    }

    if (props.subtitle) {
      const p = document.createElement('p');
      p.textContent = props.subtitle;
      header.appendChild(p);
    }

    card.appendChild(header);
  }

  return card;
}
