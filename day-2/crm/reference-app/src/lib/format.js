/**
 * format.js — every number and date in the UI passes through here.
 *
 * Formatting lives in one file for the same reason colour lives in one file:
 * so "show cents on the dashboard" is one change, not forty. Components
 * receive raw values and call these; they never build a date string by hand.
 */

const LOCALE = 'en-US';

/** Milliseconds in a day. Named because it appeared as a bare 86_400_000 in
 *  two files, which is exactly how the two copies drift apart. */
const MS_PER_DAY = 86_400_000;

const currency0 = new Intl.NumberFormat(LOCALE, {
  style: 'currency', currency: 'USD', maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat(LOCALE, {
  style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1,
});

const dateShort = new Intl.DateTimeFormat(LOCALE, {
  month: 'short', day: 'numeric', year: 'numeric',
});

const dateTime = new Intl.DateTimeFormat(LOCALE, {
  month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
});

const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

/** @param {number} value */
export function money(value) {
  return currency0.format(value);
}

/** Compact form for stat cards, where $1.2M beats $1,240,000. @param {number} value */
export function moneyCompact(value) {
  return compactCurrency.format(value);
}

/** @param {number} value */
export function number(value) {
  return new Intl.NumberFormat(LOCALE).format(value);
}

/** @param {string} iso @returns {string} */
export function date(iso) {
  return dateShort.format(new Date(iso));
}

/** @param {string} iso @returns {string} */
export function datetime(iso) {
  return dateTime.format(new Date(iso));
}

/**
 * Whole days from today to `iso`. Negative means the date has passed.
 * Both sides are floored to midnight so "tomorrow at 9am" is 1 day, not 0.
 *
 * @param {string} iso
 * @returns {number}
 */
export function daysUntil(iso) {
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / MS_PER_DAY);
}

/**
 * "in 5 days", "yesterday", "3 weeks ago".
 * @param {string} iso
 * @returns {string}
 */
export function relativeDay(iso) {
  const days = daysUntil(iso);
  if (Math.abs(days) < 7) return relative.format(days, 'day');
  if (Math.abs(days) < 30) return relative.format(Math.round(days / 7), 'week');
  return relative.format(Math.round(days / 30), 'month');
}

/**
 * Initials for an avatar. Takes the first and last word so
 * "Mary-Anne van der Berg" gives MB rather than MV.
 *
 * @param {string} name
 * @returns {string}
 */
export function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format a US phone number for display, leaving anything unexpected alone
 * rather than mangling it.
 *
 * @param {string} raw
 * @returns {string}
 */
export function phone(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 10) return raw;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Today as an ISO date string (YYYY-MM-DD), in local time.
 * `new Date().toISOString()` is UTC and quietly gives the wrong day for
 * anyone west of Greenwich in the evening.
 *
 * @returns {string}
 */
export function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now - offset).toISOString().slice(0, 10);
}
