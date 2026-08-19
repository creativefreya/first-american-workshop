/**
 * Drawer — a slide-over panel for one record.
 *
 * A drawer rather than a separate page, because the job it serves is
 * "check something and get back to the list" (JTBD P3 — know where every deal
 * stands without chasing). A full page navigation loses the list's scroll
 * position and sort order, so the user pays for a five-second look with a
 * ten-second recovery.
 */

import { el, replace } from '../lib/dom.js';
import { Button } from './Button.js';
import { Overlay } from './Overlay.js';

let uid = 0;

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {HTMLElement[]} [props.headerAside]  pills or actions beside the title
 * @param {HTMLElement} props.body
 * @param {HTMLElement[]} [props.footer]
 * @param {() => void} [props.onClose]
 * @returns {{close: () => void, setHeader: (next: {title?: string, subtitle?: string, aside?: HTMLElement[]}) => void}}
 */
export function Drawer({ title, subtitle, headerAside = [], body, footer = [], onClose }) {
  uid += 1;
  const titleId = `drawer-title-${uid}`;

  /** @type {{close: () => void}} */
  let overlay;

  const titleNode = el('h2', { class: 'drawer__title', id: titleId }, title);
  const subtitleNode = el('p', { class: 'drawer__subtitle' }, subtitle ?? '');
  const asideNode = el('div', { class: 'drawer__header-aside' }, ...headerAside);

  const panel = el(
    'div',
    { class: 'drawer__panel' },
    el(
      'header',
      { class: 'drawer__header' },
      el('div', { class: 'drawer__heading' }, titleNode, subtitle && subtitleNode),
      asideNode,
      Button({
        icon: 'close',
        variant: 'ghost',
        title: 'Close panel',
        class: 'drawer__close',
        onClick: () => overlay.close(),
      }),
    ),
    el('div', { class: 'drawer__body' }, body),
    footer.length > 0 && el('footer', { class: 'drawer__footer' }, ...footer),
  );

  overlay = Overlay({ panel, variant: 'drawer', onClose, labelledBy: titleId });

  return {
    close: overlay.close,

    /**
     * Update the header without rebuilding the drawer.
     *
     * The header shows live state — the stage pill, in particular. A caller
     * that re-renders only the body leaves a pill saying "Lead" above a body
     * that has already moved to "Title & escrow", and the header is the part
     * people read. Anything in the header that can change needs a way to be
     * told.
     *
     * @param {{title?: string, subtitle?: string, aside?: HTMLElement[]}} next
     */
    setHeader(next) {
      if (next.title !== undefined) titleNode.textContent = next.title;
      if (next.subtitle !== undefined) subtitleNode.textContent = next.subtitle;
      if (next.aside !== undefined) replace(asideNode, ...next.aside);
    },
  };
}
