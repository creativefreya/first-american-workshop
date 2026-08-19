/**
 * Modal — a centred dialog for a decision or a short form.
 *
 * Two entry points, because most modals in a CRM are one of two things:
 *   Modal()   — a form the user fills in
 *   confirm() — a destructive action they have to mean
 *
 * `confirm()` returns a Promise so calling code reads top to bottom:
 *
 *   if (await confirm({ ... })) await api.deleteDeal(id)
 *
 * rather than disappearing into a callback. Deletion is exactly the flow where
 * you want the code to be obvious.
 */

import { el } from '../lib/dom.js';
import { Button } from './Button.js';
import { Overlay } from './Overlay.js';

let uid = 0;

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {HTMLElement} props.body
 * @param {(close: () => void) => HTMLElement[]} props.footer
 * @param {'sm'|'md'} [props.size]
 * @param {() => void} [props.onClose]
 * @returns {{close: () => void}}
 */
export function Modal({ title, description, body, footer, size = 'md', onClose }) {
  uid += 1;
  const titleId = `modal-title-${uid}`;

  /** @type {{close: () => void}} */
  let overlay;

  const panel = el(
    'div',
    { class: `modal__panel modal__panel--${size}` },
    el(
      'header',
      { class: 'modal__header' },
      el(
        'div',
        {},
        el('h2', { class: 'modal__title', id: titleId }, title),
        description && el('p', { class: 'modal__description' }, description),
      ),
      Button({ icon: 'close', variant: 'ghost', title: 'Close', onClick: () => overlay.close() }),
    ),
    el('div', { class: 'modal__body' }, body),
    el('footer', { class: 'modal__footer' }, ...footer(() => overlay.close())),
  );

  overlay = Overlay({ panel, variant: 'modal', onClose, labelledBy: titleId });

  return { close: overlay.close };
}

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.body
 * @param {string} [props.confirmLabel]
 * @param {boolean} [props.destructive]
 * @returns {Promise<boolean>}
 */
export function confirm({ title, body, confirmLabel = 'Confirm', destructive = false }) {
  return new Promise((resolve) => {
    let answer = false;

    Modal({
      title,
      size: 'sm',
      body: el('p', { class: 'modal__prose' }, body),
      footer: (close) => [
        Button({ label: 'Cancel', onClick: close }),
        Button({
          label: confirmLabel,
          variant: destructive ? 'danger' : 'primary',
          onClick: () => {
            answer = true;
            close();
          },
        }),
      ],
      // Resolve on close rather than on click, so Escape and the backdrop
      // resolve false instead of leaving the promise hanging forever.
      onClose: () => resolve(answer),
    });
  });
}
