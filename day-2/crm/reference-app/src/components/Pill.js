/**
 * Pill — a small piece of status.
 *
 * Takes a *tone*, never a colour. `Pill({ tone: 'danger' })`, not
 * `Pill({ color: 'red' })`. That indirection is the point of a design system:
 * when the danger colour changes it changes in tokens.css, and every pill in
 * the app follows without anyone editing a component.
 *
 * The tone → colour mapping lives entirely in Pill.css, so this file has no
 * opinion about what "warning" looks like.
 */

import { el, cx } from '../lib/dom.js';
import { Icon } from './Icon.js';

/**
 * @param {object} props
 * @param {string} props.label
 * @param {import('../lib/domain.js').Tone} [props.tone]
 * @param {boolean} [props.dot]     leading status dot — for stage, where the
 *                                  colour carries meaning on its own
 * @param {string} [props.icon]
 * @param {string} [props.title]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Pill({ label, tone = 'neutral', dot = false, icon, title, class: className = '' }) {
  return el(
    'span',
    { class: cx('pill', `pill--${tone}`, className), title },
    dot && el('span', { class: 'pill__dot', 'aria-hidden': 'true' }),
    icon && Icon({ name: icon, size: 12 }),
    el('span', {}, label),
  );
}

/**
 * A pill for a deal stage. Wraps Pill so the stage → tone lookup happens once
 * rather than at every call site.
 *
 * @param {import('../lib/domain.js').Stage} stage
 * @returns {HTMLElement}
 */
export function StagePill(stage) {
  return Pill({ label: stage.label, tone: stage.tone, dot: true, title: stage.description });
}
