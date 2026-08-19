/**
 * dom.js — the one primitive everything else is built from.
 *
 * There is no framework in this app. `el()` is the whole rendering story:
 * a function that takes a tag, some props and some children, and returns a
 * real DOM element.
 *
 * Read this file first. Once you understand `el`, every component in
 * src/components is just a function that calls it.
 */

/**
 * A value that can be a child of an element.
 * `null`, `undefined` and `false` are skipped, which is what makes
 * `condition && el(...)` work inline.
 *
 * @typedef {Node | string | number | null | undefined | false | Child[]} Child
 */

/**
 * Create an element.
 *
 *   el('div', { class: 'card' }, el('h2', {}, 'Title'))
 *   el('button', { class: 'btn', onClick: save }, 'Save')
 *   el('input', { type: 'text', value: name, 'aria-label': 'Name' })
 *
 * Prop handling, in order:
 *   - `class`            → className
 *   - `style` object     → individual style properties
 *   - `dataset` object   → data-* attributes
 *   - `onFoo` function   → addEventListener('foo', fn)
 *   - `value`/`checked`  → set as a property, not an attribute, so form
 *                          controls actually update
 *   - anything else      → setAttribute, skipped when null/undefined/false
 *
 * @param {string} tag
 * @param {Record<string, unknown>} [props]
 * @param {...Child} children
 * @returns {HTMLElement}
 */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'class') {
      node.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(node.style, value);
    } else if (key === 'dataset' && typeof value === 'object') {
      Object.assign(node.dataset, value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'value' || key === 'checked' || key === 'disabled') {
      node[key] = value;
    } else {
      node.setAttribute(key, value === true ? '' : String(value));
    }
  }

  append(node, children);
  return node;
}

/**
 * Create an SVG element. Separate from `el` because SVG needs a namespace and
 * silently renders nothing if you forget it — a genuinely nasty hour to debug.
 *
 * @param {string} tag
 * @param {Record<string, unknown>} [attrs]
 * @param {...Child} children
 * @returns {SVGElement}
 */
export function svg(tag, attrs = {}, ...children) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, String(value));
    }
  }

  append(node, children);
  return node;
}

/**
 * Append children to a node, flattening arrays and skipping empty values.
 *
 * @param {Node} parent
 * @param {Child[]} children
 */
export function append(parent, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

/**
 * Build a class string from parts, dropping anything falsy.
 *
 *   cx('pill', tone && `pill--${tone}`, isActive && 'is-active')
 *
 * @param {...(string | false | null | undefined)} parts
 * @returns {string}
 */
export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/**
 * Replace an element's children in one operation.
 *
 * Used by every view's `render()`. It is deliberately blunt — this app has a
 * few hundred rows, not a few hundred thousand, so rebuilding a subtree costs
 * less than the complexity of diffing it. If a view ever gets slow, that is the
 * moment to reach for something smarter, and not before.
 *
 * @param {Element} parent
 * @param {...Child} children
 */
export function replace(parent, ...children) {
  parent.replaceChildren();
  append(parent, children);
}

/**
 * Trap Tab focus inside a container, and restore it when released.
 * Used by Drawer and Modal — both are required to do this to be usable at all
 * with a keyboard, and both would otherwise leak focus to the page behind.
 *
 * @param {HTMLElement} container
 * @returns {() => void} release
 */
export function trapFocus(container) {
  const previouslyFocused = /** @type {HTMLElement | null} */ (document.activeElement);
  const selector = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  /** @param {KeyboardEvent} event */
  function onKeydown(event) {
    if (event.key !== 'Tab') return;

    const focusable = /** @type {HTMLElement[]} */ ([...container.querySelectorAll(selector)])
      .filter((node) => node.offsetParent !== null);
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', onKeydown);

  // Defer so the element is in the document and measurable before we focus it.
  requestAnimationFrame(() => {
    const target = /** @type {HTMLElement | null} */ (container.querySelector(selector));
    target?.focus();
  });

  return () => {
    container.removeEventListener('keydown', onKeydown);
    previouslyFocused?.focus?.();
  };
}
