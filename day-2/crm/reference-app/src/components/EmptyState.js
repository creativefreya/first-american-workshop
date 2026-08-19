/**
 * EmptyState — what the screen says when there is nothing on it.
 *
 * Empty states matter more than they look. "No results" is the difference
 * between a prototype and a product, and there are two distinct empties that
 * get wrongly collapsed into one:
 *
 *   - nothing exists yet          → offer the action that creates the first one
 *   - nothing matches the filter  → offer to clear the filter
 *
 * Showing "Add your first deal" to someone who has 28 deals and a typo in the
 * search box is the single most common version of this mistake.
 */

import { el } from '../lib/dom.js';
import { Icon } from './Icon.js';
import { Button } from './Button.js';

/**
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.body
 * @param {string} [props.icon]
 * @param {{label: string, icon?: string, onClick: () => void}} [props.action]
 * @returns {HTMLElement}
 */
export function EmptyState({ title, body, icon = 'file', action }) {
  return el(
    'div',
    { class: 'empty' },
    el('div', { class: 'empty__icon', 'aria-hidden': 'true' }, Icon({ name: icon, size: 22 })),
    el('h3', { class: 'empty__title' }, title),
    el('p', { class: 'empty__body' }, body),
    action && Button({ ...action, variant: 'primary' }),
  );
}

/**
 * The filtered-to-nothing case, with a reset that actually clears the toolbar.
 *
 * @param {string} term
 * @param {() => void} onReset
 * @returns {HTMLElement}
 */
export function NoResults(term, onReset) {
  return EmptyState({
    icon: 'search',
    title: 'Nothing matches',
    body: term
      ? `No records match “${term}” with the current filters.`
      : 'No records match the current filters.',
    action: { label: 'Clear filters', icon: 'refresh', onClick: onReset },
  });
}
