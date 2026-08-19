/**
 * BarChart / ColumnChart — two small charts, no charting library, no SVG.
 *
 * Both charts here are categorical, under a dozen bars, and have no axes.
 * A bar is a box with a width, and CSS already draws boxes with widths.
 *
 * What that buys, concretely:
 *   - no ~50KB dependency that arrives with its own colours, fonts and
 *     tooltip opinions, all of which then get overridden back into the design
 *     system anyway
 *   - the bars use the same tokens as everything else, because they are
 *     ordinary elements
 *   - responsive with no resize handler and no measurement
 *   - the labels are real text, so they are selectable, searchable, and
 *     readable by a screen reader without an aria-label describing the picture
 *
 * When to stop doing this: a real axis, a time series, zooming, or more than
 * about twenty data points. At that line, install a charting library — the
 * work of hand-rolling those is the work the library exists to do.
 */

import { el, cx } from '../lib/dom.js';
import { navigate } from '../lib/router.js';

/**
 * @typedef {object} Bar
 * @property {string} label
 * @property {number} value
 * @property {string} [color]     any CSS colour; defaults to the chart ramp
 * @property {string} [href]      route this bar drills into
 * @property {string} [caption]   secondary figure, e.g. '$4.2M'
 */

/**
 * Horizontal bars.
 *
 * Horizontal rather than vertical for a decisive reason: the categories are
 * "Under contract" and "Clear to close". Vertical bars would need those labels
 * rotated or truncated, and a rotated axis label is a readability cost paid on
 * every glance for the life of the product.
 *
 * @param {object} props
 * @param {Bar[]} props.bars
 * @param {string} [props.emptyMessage]
 * @returns {HTMLElement}
 */
export function BarChart({ bars, emptyMessage = 'No data yet.' }) {
  const total = bars.reduce((sum, bar) => sum + bar.value, 0);
  if (total === 0) return el('p', { class: 'chart__empty' }, emptyMessage);

  // Scale against the largest bar, not the total. Scaling to the total makes
  // every bar short as soon as there are more than a handful of categories.
  const max = Math.max(...bars.map((bar) => bar.value));

  return el(
    'div',
    { class: 'chart' },
    ...bars.map((bar, index) => {
      const fill = el('span', {
        class: 'chart__fill',
        style: {
          width: `${(bar.value / max) * 100}%`,
          background: bar.color ?? `var(--chart-${(index % 5) + 1})`,
        },
      });

      const content = [
        el('span', { class: 'chart__label' }, bar.label),
        el('span', { class: 'chart__track' }, fill),
        el(
          'span',
          { class: 'chart__figure' },
          el('span', { class: 'chart__value' }, String(bar.value)),
          bar.caption && el('span', { class: 'chart__caption' }, bar.caption),
        ),
      ];

      if (!bar.href) return el('div', { class: 'chart__row' }, ...content);

      return el(
        'a',
        {
          class: 'chart__row chart__row--link',
          href: bar.href,
          onClick: (event) => {
            event.preventDefault();
            navigate(bar.href.replace(/^#/, ''));
          },
        },
        ...content,
      );
    }),
  );
}

/**
 * Vertical columns, for counts over a short span of time.
 *
 * @param {object} props
 * @param {{label: string, value: number, highlight?: boolean}[]} props.columns
 * @param {string} [props.caption]
 * @returns {HTMLElement}
 */
export function ColumnChart({ columns, caption }) {
  const max = Math.max(1, ...columns.map((column) => column.value));

  return el(
    'div',
    { class: 'columns-wrap' },
    el(
      'div',
      { class: 'columns' },
      ...columns.map((column) =>
        el(
          'div',
          {
            class: cx('columns__col', column.highlight && 'is-highlight'),
            title: `${column.label}: ${column.value}`,
          },
          el('span', { class: 'columns__value' }, String(column.value)),
          el('span', {
            class: 'columns__bar',
            // A zero week still gets a visible stub. A gap where a column
            // should be reads as a rendering bug, not as "nothing happened".
            style: { height: `${Math.max((column.value / max) * 100, 3)}%` },
          }),
          el('span', { class: 'columns__label' }, column.label),
        ),
      ),
    ),
    caption && el('p', { class: 'columns__caption' }, caption),
  );
}
