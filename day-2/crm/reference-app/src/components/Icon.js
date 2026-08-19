/**
 * Icon — one 24×24 grid, one stroke weight, one source of truth.
 *
 * Inline SVG rather than an icon font or a sprite sheet, because inline icons
 * inherit `currentColor` for free. That is what lets a Pill tint its icon by
 * changing one text colour, and it is why every path here uses `stroke` and
 * never a hardcoded fill.
 *
 * Adding an icon: draw it on a 24×24 grid at 1.6 stroke, add it below, done.
 * Do not paste an SVG with its own width, height or colour attributes — those
 * will fight the component.
 */

import { svg } from '../lib/dom.js';

/** @type {Record<string, string[]>} — name → path `d` strings */
const PATHS = {
  dashboard: ['M3 13h8V3H3v10Z', 'M13 21h8V11h-8v10Z', 'M13 7h8V3h-8v4Z', 'M3 21h8v-4H3v4Z'],
  deals: ['M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5Z', 'M9 21v-7h6v7'],
  contacts: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  tasks: ['M9 6h11', 'M9 12h11', 'M9 18h11', 'm3 6 1.5 1.5L7 5', 'm3 12 1.5 1.5L7 11', 'm3 18 1.5 1.5L7 17'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm21 21-4.35-4.35'],
  plus: ['M12 5v14', 'M5 12h14'],
  close: ['M18 6 6 18', 'M6 6l12 12'],
  chevronDown: ['m6 9 6 6 6-6'],
  chevronRight: ['m9 6 6 6-6 6'],
  chevronUp: ['m18 15-6-6-6 6'],
  arrowRight: ['M5 12h14', 'm12 5 7 7-7 7'],
  download: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5', 'M12 15V3'],
  alert: ['M12 9v4', 'M12 17h.01', 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z', 'm9 12 2 2 4-4'],
  check: ['m20 6-11 11-5-5'],
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
  mail: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'm22 7-10 6L2 7'],
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z', 'M14 2v6h6'],
  trash: ['M3 6h18', 'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'],
  edit: ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', 'M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z'],
  copy: ['M20 9H11a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2Z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'],
  filter: ['M22 3H2l8 9.46V19l4 2v-8.54L22 3Z'],
  refresh: ['M3 12a9 9 0 0 1 15-6.7L21 8', 'M21 3v5h-5', 'M21 12a9 9 0 0 1-15 6.7L3 16', 'M3 21v-5h5'],
  calendar: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z', 'M16 2v4', 'M8 2v4', 'M3 10h18'],
  external: ['M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6', 'M15 3h6v6', 'M10 14 21 3'],
  user: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  building: ['M4 22V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v18', 'M15 9h4a1 1 0 0 1 1 1v12', 'M8 7h3', 'M8 11h3', 'M8 15h3', 'M2 22h20'],
  trendUp: ['m22 7-8.5 8.5-5-5L2 17', 'M16 7h6v6'],
};

/**
 * @param {object} props
 * @param {keyof typeof PATHS} props.name
 * @param {number} [props.size]  px, defaults to 16 — the dense-UI default
 * @param {string} [props.class]
 * @returns {SVGElement}
 */
export function Icon({ name, size = 16, class: className = '' }) {
  const paths = PATHS[name];
  if (!paths) throw new Error(`Icon "${name}" does not exist. Add it to Icon.js.`);

  return svg(
    'svg',
    {
      class: `icon ${className}`.trim(),
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': 1.6,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    ...paths.map((d) => svg('path', { d })),
  );
}
