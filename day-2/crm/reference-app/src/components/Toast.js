/**
 * Toast — confirmation that something happened.
 *
 * Every write in this app is silent otherwise. Save a deal and the drawer
 * closes; without a toast the user cannot tell the difference between "saved"
 * and "the button did nothing", and the honest response to that is to click it
 * again.
 *
 * The host is an aria-live region, so a screen reader announces the message
 * without the focus moving. `polite` rather than `assertive` — a save
 * confirmation should not interrupt someone mid-sentence.
 */

import { el } from '../lib/dom.js';
import { Icon } from './Icon.js';

/** @type {HTMLElement | null} */
let host = null;

function ensureHost() {
  if (host) return host;

  host = el('div', {
    class: 'toast-host',
    role: 'status',
    'aria-live': 'polite',
    'aria-atomic': 'false',
  });

  document.body.append(host);
  return host;
}

/**
 * @param {string} message
 * @param {object} [options]
 * @param {'success'|'danger'|'info'} [options.tone]
 * @param {{label: string, onClick: () => void}} [options.action]  e.g. Undo
 * @param {number} [options.duration]  ms
 */
export function toast(message, { tone = 'success', action, duration = 3600 } = {}) {
  const icon = { success: 'check', danger: 'alert', info: 'clock' }[tone];

  let dismiss = () => {};

  const node = el(
    'div',
    { class: `toast toast--${tone}` },
    el('span', { class: 'toast__icon', 'aria-hidden': 'true' }, Icon({ name: icon, size: 15 })),
    el('span', { class: 'toast__message' }, message),
    action &&
      el(
        'button',
        {
          class: 'toast__action',
          onClick: () => {
            action.onClick();
            dismiss();
          },
        },
        action.label,
      ),
    el(
      'button',
      { class: 'toast__close', 'aria-label': 'Dismiss', onClick: () => dismiss() },
      Icon({ name: 'close', size: 13 }),
    ),
  );

  ensureHost().append(node);
  requestAnimationFrame(() => node.classList.add('is-visible'));

  const timer = setTimeout(() => dismiss(), duration);

  dismiss = () => {
    clearTimeout(timer);
    node.classList.remove('is-visible');
    setTimeout(() => node.remove(), 200);
  };

  // Do not time out a toast the user is reading or reaching for. An Undo that
  // disappears while the cursor is on the way to it is worse than no Undo.
  node.addEventListener('mouseenter', () => clearTimeout(timer));

  return dismiss;
}
