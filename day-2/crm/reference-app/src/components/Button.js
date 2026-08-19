/**
 * Button — the only way this app makes something clickable.
 *
 * Four variants and two sizes, and that is the whole set on purpose. Every
 * time a design system grows a fifth button variant it is because somebody
 * needed one pixel of difference on one screen, and the cost is paid forever
 * by everyone who then has to choose between five.
 *
 *   primary    one per screen region — the thing you came here to do
 *   secondary  the safe, common actions
 *   ghost      dense contexts: table rows, toolbars, drawer headers
 *   danger     destructive, and always behind a confirm
 */

import { el, cx } from '../lib/dom.js';
import { Icon } from './Icon.js';

/**
 * @param {object} props
 * @param {string} [props.label]                   omit for an icon-only button
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant]
 * @param {'sm'|'md'} [props.size]
 * @param {string} [props.icon]                    leading icon name
 * @param {string} [props.iconAfter]               trailing icon name
 * @param {(event: MouseEvent) => void} [props.onClick]
 * @param {boolean} [props.disabled]
 * @param {string} [props.title]                   required when there is no label
 * @param {'button'|'submit'} [props.type]
 * @param {string} [props.class]
 * @returns {HTMLButtonElement}
 */
export function Button({
  label,
  variant = 'secondary',
  size = 'md',
  icon,
  iconAfter,
  onClick,
  disabled = false,
  title,
  type = 'button',
  class: className = '',
}) {
  const iconOnly = !label;

  // An icon-only button with no accessible name is invisible to a screen
  // reader and unlabelled on hover. Failing loudly in development is kinder
  // than shipping it.
  if (iconOnly && !title) {
    throw new Error('Button: an icon-only button needs a `title` for its accessible name.');
  }

  return /** @type {HTMLButtonElement} */ (el(
    'button',
    {
      type,
      class: cx('btn', `btn--${variant}`, `btn--${size}`, iconOnly && 'btn--icon-only', className),
      disabled,
      title,
      'aria-label': iconOnly ? title : null,
      onClick,
    },
    icon && Icon({ name: icon, size: size === 'sm' ? 14 : 16 }),
    label && el('span', { class: 'btn__label' }, label),
    iconAfter && Icon({ name: iconAfter, size: size === 'sm' ? 14 : 16 }),
  ));
}
