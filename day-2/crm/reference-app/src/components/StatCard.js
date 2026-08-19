/**
 * StatCard — one number, said once.
 *
 * A stat card earns its space only if the number changes something the reader
 * would do. Each one here answers a question the agent actually has:
 * how much is in flight, what closes this week, what needs chasing.
 *
 * Read-only by design. These are a summary, not controls — the screens that
 * let you act on records are Contacts and Tasks.
 */

import { el, cx } from '../lib/dom.js';
import { Icon } from './Icon.js';

/**
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.value
 * @param {string} [props.meta]     small line under the value
 * @param {import('../lib/domain.js').Tone} [props.tone]  colours the dot only
 * @param {{direction: 'up'|'down', label: string}} [props.trend]
 * @returns {HTMLElement}
 */
export function StatCard({ label, value, meta, tone = 'brand', trend }) {
  return el(
    'div',
    { class: 'stat' },
    el(
      'span',
      { class: 'stat__label' },
      el('span', { class: cx('stat__dot', `stat__dot--${tone}`), 'aria-hidden': 'true' }),
      label,
    ),
    el('span', { class: 'stat__value' }, value),
    meta && el('span', { class: 'stat__meta' }, meta),
    trend && el(
      'span',
      { class: cx('stat__trend', `stat__trend--${trend.direction}`) },
      Icon({ name: 'trendUp', size: 12 }),
      trend.label,
    ),
  );
}

/**
 * Row of stat cards. Wraps rather than scrolls, so nothing hides off-screen on
 * a laptop.
 *
 * @param {...HTMLElement} cards
 * @returns {HTMLElement}
 */
export function StatRow(...cards) {
  return el('div', { class: 'stat-row' }, ...cards);
}
