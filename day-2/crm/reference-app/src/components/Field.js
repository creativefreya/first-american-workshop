/**
 * Field — a labelled form control.
 *
 * One component covers text, number, date, select and textarea, because the
 * label / hint / error / focus behaviour is identical across all of them and
 * only the inner element differs. Five near-identical components would be five
 * places to fix the next accessibility bug.
 *
 * The label is always a real <label> bound by id. Placeholder-as-label is the
 * single most common form mistake and it fails the moment someone starts
 * typing — the label disappears exactly when it is needed.
 */

import { el, cx } from '../lib/dom.js';

let uid = 0;

/**
 * @param {object} props
 * @param {string} props.label
 * @param {string} [props.name]
 * @param {'text'|'email'|'tel'|'number'|'date'|'select'|'textarea'} [props.type]
 * @param {string|number} [props.value]
 * @param {{value: string, label: string}[]} [props.options]   select only
 * @param {string} [props.placeholder]
 * @param {string} [props.hint]
 * @param {boolean} [props.required]
 * @param {string} [props.prefix]        static adornment, e.g. '$'
 * @param {(value: string) => void} [props.onInput]
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Field({
  label,
  name,
  type = 'text',
  value = '',
  options = [],
  placeholder,
  hint,
  required = false,
  prefix,
  onInput,
  class: className = '',
}) {
  uid += 1;
  const id = `field-${uid}`;
  const hintId = hint ? `${id}-hint` : null;

  /** @type {HTMLElement} */
  let control;

  if (type === 'select') {
    control = el(
      'select',
      {
        id,
        name,
        class: 'field__control field__control--select',
        required,
        'aria-describedby': hintId,
        onChange: (event) => onInput?.(event.target.value),
      },
      ...options.map((option) => el('option', { value: option.value, selected: option.value === String(value) }, option.label)),
    );
  } else if (type === 'textarea') {
    control = el('textarea', {
      id,
      name,
      class: 'field__control field__control--textarea',
      rows: 3,
      placeholder,
      required,
      'aria-describedby': hintId,
      onInput: (event) => onInput?.(event.target.value),
    });
    control.value = String(value);
  } else {
    control = el('input', {
      id,
      name,
      type,
      class: 'field__control',
      value,
      placeholder,
      required,
      'aria-describedby': hintId,
      onInput: (event) => onInput?.(event.target.value),
    });
  }

  return el(
    'div',
    { class: cx('field', className) },
    el(
      'label',
      { class: 'field__label', for: id },
      label,
      required && el('span', { class: 'field__required', 'aria-hidden': 'true' }, '*'),
    ),
    el(
      'div',
      { class: cx('field__shell', prefix && 'field__shell--has-prefix') },
      prefix && el('span', { class: 'field__prefix', 'aria-hidden': 'true' }, prefix),
      control,
    ),
    hint && el('p', { class: 'field__hint', id: hintId }, hint),
  );
}
