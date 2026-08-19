/**
 * Avatar — initials in a tinted circle.
 *
 * No photos anywhere in this app, so there is no image fallback path to get
 * wrong. The tint is derived from the name rather than stored, which means two
 * people never need a colour assigned and the same person is always the same
 * colour on every screen.
 */

import { el, cx } from '../lib/dom.js';
import { initials } from '../lib/format.js';

/** Five tints from the brand blue ramp. Deliberately low-contrast — an avatar
 *  is orientation, not emphasis, and a wall of saturated circles in a table is
 *  noise. */
const TINT_COUNT = 5;

/**
 * Stable hash of a string → a tint index.
 * Same input always gives the same output, across reloads and machines.
 *
 * @param {string} value
 * @returns {number}
 */
function tintFor(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % TINT_COUNT;
}

/**
 * @param {object} props
 * @param {string} props.name
 * @param {'sm'|'md'|'lg'} [props.size]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Avatar({ name, size = 'md', class: className = '' }) {
  return el(
    'span',
    {
      class: cx('avatar', `avatar--${size}`, `avatar--tint-${tintFor(name)}`, className),
      title: name,
      'aria-hidden': 'true',
    },
    initials(name),
  );
}
