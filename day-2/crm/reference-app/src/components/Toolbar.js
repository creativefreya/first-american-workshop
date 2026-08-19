/**
 * Toolbar — search, filters, result count, actions.
 *
 * The row above every table. It owns no data: it reports changes upward via
 * `onChange` and the view decides what that means. A toolbar that filtered its
 * own table would work exactly once, then break the moment two things needed
 * to filter the same data — which happens on the very first dashboard.
 *
 * The search input is debounced. Not for performance at 28 rows, but because
 * re-rendering the table on every keystroke moves the rows under the cursor
 * mid-click.
 */

import { el } from '../lib/dom.js';
import { Icon } from './Icon.js';

/**
 * @typedef {object} FilterConfig
 * @property {string} key
 * @property {string} label            shown as the "all" option
 * @property {{value: string, label: string}[]} options
 */

/**
 * @param {object} props
 * @param {string} [props.searchPlaceholder]
 * @param {FilterConfig[]} [props.filters]
 * @param {{value: string, label: string}[]} [props.sorts]
 * @param {(state: {search: string, filters: Record<string, string>, sort: string}) => void} props.onChange
 * @param {HTMLElement[]} [props.actions]
 * @returns {HTMLElement}
 */
export function Toolbar({
  searchPlaceholder = 'Search…',
  filters = [],
  sorts = [],
  onChange,
  actions = [],
}) {
  const state = {
    search: '',
    filters: Object.fromEntries(filters.map((filter) => [filter.key, ''])),
    sort: sorts[0]?.value ?? '',
  };

  /** @type {number | undefined} */
  let debounce;

  function emit() {
    onChange({ ...state, filters: { ...state.filters } });
  }

  const searchInput = el('input', {
    type: 'search',
    class: 'toolbar__search-input',
    placeholder: searchPlaceholder,
    'aria-label': searchPlaceholder,
    onInput: (event) => {
      state.search = event.target.value;
      clearTimeout(debounce);
      debounce = setTimeout(emit, 140);
    },
  });

  const count = el('span', { class: 'toolbar__count', role: 'status', 'aria-live': 'polite' });

  const root = el(
    'div',
    { class: 'toolbar' },
    el(
      'div',
      { class: 'toolbar__search' },
      Icon({ name: 'search', size: 15, class: 'toolbar__search-icon' }),
      searchInput,
    ),

    ...filters.map((filter) =>
      el(
        'select',
        {
          class: 'toolbar__select',
          'aria-label': filter.label,
          onChange: (event) => {
            state.filters[filter.key] = event.target.value;
            emit();
          },
        },
        el('option', { value: '' }, filter.label),
        ...filter.options.map((option) => el('option', { value: option.value }, option.label)),
      ),
    ),

    sorts.length > 0 &&
      el(
        'select',
        {
          class: 'toolbar__select',
          'aria-label': 'Sort by',
          onChange: (event) => {
            state.sort = event.target.value;
            emit();
          },
        },
        ...sorts.map((option) => el('option', { value: option.value }, option.label)),
      ),

    count,
    el('div', { class: 'toolbar__actions' }, ...actions),
  );

  /**
   * @param {number} shown
   * @param {number} total
   */
  root.setCount = (shown, total) => {
    count.textContent = shown === total
      ? `${total} ${total === 1 ? 'entry' : 'entries'}`
      : `${shown} of ${total} entries`;
    count.classList.toggle('is-filtered', shown !== total);
  };

  /** Clear search and filters — used by the empty state's reset action. */
  root.reset = () => {
    searchInput.value = '';
    state.search = '';
    for (const key of Object.keys(state.filters)) state.filters[key] = '';
    root.querySelectorAll('.toolbar__select').forEach((select, index) => {
      if (index < filters.length) select.value = '';
    });
    emit();
  };

  root.focusSearch = () => searchInput.focus();

  return root;
}
