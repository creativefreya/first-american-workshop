/**
 * Overlay — the shared machinery behind Drawer and Modal.
 *
 * A drawer and a modal look nothing alike and behave almost identically:
 * both trap focus, both close on Escape, both close on a backdrop click, both
 * have to lock the page behind them, and both must restore focus to whatever
 * opened them. That is five things to get right, and getting them right twice
 * means getting them wrong once.
 *
 * So the behaviour lives here and the two components only decide how they look.
 */

import { el, trapFocus } from '../lib/dom.js';

/** Open overlays, innermost last. Escape only ever closes the top one. */
const stack = [];

/**
 * @param {object} props
 * @param {HTMLElement} props.panel        the visible surface
 * @param {string} props.variant           'drawer' | 'modal' — drives class names
 * @param {() => void} [props.onClose]
 * @param {string} props.labelledBy        id of the element naming this overlay
 * @returns {{root: HTMLElement, close: () => void}}
 */
export function Overlay({ panel, variant, onClose, labelledBy }) {
  const backdrop = el('div', { class: `${variant}__backdrop`, onClick: () => close() });

  const root = el(
    'div',
    {
      class: `overlay overlay--${variant}`,
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': labelledBy,
    },
    backdrop,
    panel,
  );

  let releaseFocus = () => {};
  let isClosing = false;

  function close() {
    if (isClosing) return;
    isClosing = true;

    root.classList.add('is-closing');
    releaseFocus();
    document.removeEventListener('keydown', onKeydown);

    const index = stack.indexOf(close);
    if (index !== -1) stack.splice(index, 1);
    if (stack.length === 0) document.body.classList.remove('is-overlay-open');

    // Wait for the exit transition before removing, so the panel does not
    // vanish mid-slide. `transitionend` would be more precise but does not
    // fire at all under prefers-reduced-motion, which would leak the node.
    setTimeout(() => {
      root.remove();
      onClose?.();
    }, 200);
  }

  /** @param {KeyboardEvent} event */
  function onKeydown(event) {
    if (event.key !== 'Escape') return;
    if (stack[stack.length - 1] !== close) return;
    event.stopPropagation();
    close();
  }

  // On `document`, not on `root`.
  //
  // This looks like the lazier option and is actually the correct one. When a
  // panel re-renders its own body — which the deal drawer does after every
  // write — the focused element is removed from the document and focus falls
  // back to <body>. A keydown listener on `root` never sees the event, because
  // <body> is not inside `root`, so Escape silently stops working after the
  // first save. The stack check above is what keeps this safe.
  document.addEventListener('keydown', onKeydown);

  document.body.append(root);
  document.body.classList.add('is-overlay-open');
  stack.push(close);
  releaseFocus = trapFocus(root);

  // One frame before adding the open class, so the browser has a chance to
  // paint the closed state and actually animate the transition between them.
  requestAnimationFrame(() => root.classList.add('is-open'));

  return { root, close };
}
