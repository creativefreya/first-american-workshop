/**
 * csv.js — turn rows into a downloadable file.
 *
 * Small, but worth having on its own: CSV escaping is one of those things that
 * looks trivial, is not, and breaks on the first client whose company name has
 * a comma in it.
 */

/**
 * Escape one cell.
 *
 * The rules that matter: wrap in quotes if the value contains a comma, a quote
 * or a newline, and double any quote inside. Get this wrong and Excel silently
 * shifts every column after the offending cell — the user sees a corrupt file
 * and blames the app, not the comma.
 *
 * @param {unknown} value
 * @returns {string}
 */
function escapeCell(value) {
  if (value === null || value === undefined) return '';

  const text = String(value);
  if (!/[",\n\r]/.test(text)) return text;

  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * @param {string[]} headers
 * @param {unknown[][]} rows
 * @returns {string}
 */
export function toCsv(headers, rows) {
  const lines = [headers.map(escapeCell).join(',')];
  for (const row of rows) lines.push(row.map(escapeCell).join(','));

  // CRLF, because that is what the spec says and what Excel expects.
  return lines.join('\r\n');
}

/**
 * Trigger a download in the browser.
 *
 * The BOM prefix (﻿) is not decoration — without it Excel opens UTF-8 as
 * Latin-1 and every accented name in the file arrives mangled.
 *
 * @param {string} filename
 * @param {string} csv
 */
export function download(filename, csv) {
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();

  // Release the blob once the download has started. Skipping this holds the
  // whole file in memory until the tab closes.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
