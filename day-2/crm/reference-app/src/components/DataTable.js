/**
 * DataTable — a real <table>, driven by a column config.
 *
 * Two decisions worth defending, because both look like extra work:
 *
 * 1. A real <table>, not a grid of divs.
 *    Screen readers announce "row 4 of 28, column Closing" for free. Rebuilding
 *    that with ARIA on divs is a lot of attributes to get subtly wrong, and the
 *    only thing it buys is easier CSS — which `table-layout: fixed` gives us
 *    anyway.
 *
 * 2. Columns are data, not markup.
 *    Each column declares how to render its cell and how to sort itself. Adding
 *    a column is one object in one array; nothing else changes. If cells were
 *    written inline in the row loop, adding a column would mean touching the
 *    header, the body, the sort logic and the CSV export separately — four
 *    places to forget one.
 *
 * Sorting is deliberately here rather than in the view. Every table wants it,
 * every table wants it to behave identically, and the sort indicator has to
 * agree with the actual order.
 */

import { el, cx, replace } from '../lib/dom.js';
import { Icon } from './Icon.js';

/**
 * @template T
 * @typedef {object} Column
 * @property {string} key                          unique, also the sort key
 * @property {string} label
 * @property {(row: T) => Node | string} render
 * @property {(row: T) => string | number} [sortValue]  omit to disable sorting
 * @property {string} [width]                      CSS width for the fixed layout
 * @property {'left' | 'right'} [align]
 * @property {string} [className]
 */

/**
 * @template T
 * @param {object} props
 * @param {Column<T>[]} props.columns
 * @param {T[]} props.rows
 * @param {(row: T) => string} props.rowKey
 * @param {(row: T) => void} [props.onRowClick]
 * @param {HTMLElement} [props.empty]                   shown when rows is empty
 * @param {boolean} [props.numbered]                    leading # column
 * @param {{key: string, direction: 'asc'|'desc'}} [props.defaultSort]
 * @returns {HTMLElement}
 */
export function DataTable({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  numbered = false,
  defaultSort,
}) {
  let sort = defaultSort ?? null;

  const root = el('div', { class: 'table-wrap' });

  function sorted() {
    if (!sort) return rows;

    const column = columns.find((item) => item.key === sort.key);
    if (!column?.sortValue) return rows;

    const direction = sort.direction === 'asc' ? 1 : -1;

    // Copy before sorting: Array.prototype.sort mutates, and `rows` belongs to
    // the caller. Sorting someone else's array in place is a classic
    // action-at-a-distance bug.
    return [...rows].sort((a, b) => {
      const left = column.sortValue(a);
      const right = column.sortValue(b);
      if (left === right) return 0;
      return (left > right ? 1 : -1) * direction;
    });
  }

  /** @param {Column<T>} column */
  function toggleSort(column) {
    if (!column.sortValue) return;

    sort = sort?.key === column.key
      ? { key: column.key, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
      : { key: column.key, direction: 'asc' };

    render();
  }

  function header() {
    return el(
      'thead',
      {},
      el(
        'tr',
        {},
        numbered && el('th', { class: 'table__th table__th--index', scope: 'col' }, '#'),
        ...columns.map((column) => {
          const isSorted = sort?.key === column.key;
          const sortable = Boolean(column.sortValue);

          return el(
            'th',
            {
              class: cx(
                'table__th',
                column.align === 'right' && 'table__th--right',
                sortable && 'table__th--sortable',
                isSorted && 'is-sorted',
                column.className,
              ),
              scope: 'col',
              style: column.width ? { width: column.width } : undefined,
              'aria-sort': isSorted ? (sort.direction === 'asc' ? 'ascending' : 'descending') : null,
            },
            sortable
              ? el(
                  'button',
                  { class: 'table__sort', onClick: () => toggleSort(column) },
                  column.label,
                  Icon({ name: isSorted && sort.direction === 'desc' ? 'chevronDown' : 'chevronUp', size: 12 }),
                )
              : column.label,
          );
        }),
      ),
    );
  }

  function body() {
    const data = sorted();

    return el(
      'tbody',
      {},
      ...data.map((row, index) =>
        el(
          'tr',
          {
            class: cx('table__row', onRowClick && 'table__row--clickable'),
            dataset: { key: rowKey(row) },
            tabindex: onRowClick ? '0' : null,
            role: onRowClick ? 'button' : null,
            onClick: onRowClick
              ? (event) => {
                  // Let buttons and links inside a row do their own thing
                  // instead of also opening the row behind them.
                  if (/** @type {HTMLElement} */ (event.target).closest('button, a')) return;
                  onRowClick(row);
                }
              : null,
            onKeydown: onRowClick
              ? (event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  if (/** @type {HTMLElement} */ (event.target).closest('button, a')) return;
                  event.preventDefault();
                  onRowClick(row);
                }
              : null,
          },
          numbered && el('td', { class: 'table__td table__td--index' }, String(index + 1)),
          ...columns.map((column) =>
            el(
              'td',
              {
                class: cx('table__td', column.align === 'right' && 'table__td--right', column.className),
                'data-label': column.label,
              },
              column.render(row),
            ),
          ),
        ),
      ),
    );
  }

  function render() {
    if (rows.length === 0 && empty) {
      replace(root, empty);
      return;
    }

    replace(
      root,
      el('table', { class: 'table' }, header(), body()),
    );
  }

  render();

  return root;
}
