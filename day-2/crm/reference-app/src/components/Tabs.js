/**
 * Tabs — switch between panels of one record.
 *
 * Implements the ARIA tabs pattern properly, including arrow-key navigation,
 * because the browser gives you none of it for free and a half-implemented
 * tablist is worse for a screen reader than plain buttons would have been.
 *
 * Panels are built lazily and then cached. The Timeline panel on a busy deal
 * is a few dozen nodes nobody may ever look at; building all four up front
 * makes opening the drawer slower for everyone to save a click for some.
 */

import { el, cx, replace } from '../lib/dom.js';

let uid = 0;

/**
 * @param {object} props
 * @param {{id: string, label: string, badge?: string | number, panel: () => HTMLElement}[]} props.tabs
 * @param {string} [props.initial]
 * @param {(id: string) => void} [props.onChange]  fires on every selection,
 *   so a caller that rebuilds this component can restore the tab the user was
 *   actually on instead of dumping them back on the first one
 * @returns {HTMLElement}
 */
export function Tabs({ tabs, initial, onChange }) {
  uid += 1;
  const group = `tabs-${uid}`;

  let activeId = initial ?? tabs[0].id;

  /** @type {Map<string, HTMLElement>} */
  const cache = new Map();

  const panelHost = el('div', { class: 'tabs__panel', id: `${group}-panel`, role: 'tabpanel', tabindex: '0' });

  /** @param {string} id */
  function select(id) {
    activeId = id;

    for (const button of tabList.children) {
      const isActive = button.dataset.tab === id;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    }

    if (!cache.has(id)) cache.set(id, tabs.find((tab) => tab.id === id).panel());
    replace(panelHost, cache.get(id));
    panelHost.setAttribute('aria-labelledby', `${group}-${id}`);
    onChange?.(id);
  }

  /** @param {KeyboardEvent} event */
  function onKeydown(event) {
    const keys = { ArrowRight: 1, ArrowLeft: -1 };
    const step = keys[event.key];
    if (!step) return;

    event.preventDefault();
    const index = tabs.findIndex((tab) => tab.id === activeId);
    const next = tabs[(index + step + tabs.length) % tabs.length];
    select(next.id);
    /** @type {HTMLElement} */ (tabList.querySelector(`[data-tab="${next.id}"]`)).focus();
  }

  const tabList = el(
    'div',
    { class: 'tabs__list', role: 'tablist', onKeydown },
    ...tabs.map((tab) =>
      el(
        'button',
        {
          class: cx('tabs__tab', tab.id === activeId && 'is-active'),
          id: `${group}-${tab.id}`,
          role: 'tab',
          dataset: { tab: tab.id },
          'aria-selected': String(tab.id === activeId),
          'aria-controls': `${group}-panel`,
          tabindex: tab.id === activeId ? '0' : '-1',
          onClick: () => select(tab.id),
        },
        tab.label,
        (tab.badge || tab.badge === 0) && el('span', { class: 'tabs__badge' }, String(tab.badge)),
      ),
    ),
  );

  const root = el('div', { class: 'tabs' }, tabList, panelHost);
  select(activeId);

  return root;
}
