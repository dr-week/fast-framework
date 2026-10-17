export type BadgeVariant = 'accent' | 'surface' | 'danger' | 'glow';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant | undefined;
  pulse?: boolean | undefined;
}

export function createBadge(props: BadgeProps): HTMLSpanElement {
  const badge = document.createElement('span');
  badge.classList.add('zuari-badge');
  badge.setAttribute('data-variant', props.variant ?? 'accent');

  if (props.pulse) {
    const dot = document.createElement('span');
    dot.classList.add('zuari-badge-dot');
    badge.appendChild(dot);
  }

  const text = document.createElement('span');
  text.textContent = props.label;
  badge.appendChild(text);

  return badge;
}
