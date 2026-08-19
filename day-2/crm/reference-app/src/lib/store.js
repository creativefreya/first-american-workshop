/**
 * store.js — the persistence layer, and nothing else.
 *
 * This file knows about localStorage. NOTHING ELSE IN THE APP DOES.
 *
 * That is the entire reason it exists. Today the database is a JSON file and a
 * browser key; tomorrow it could be Postgres behind a Netlify function. When
 * that day comes, this file is rewritten and every other file is untouched —
 * because api.js is the only thing that imports it, and views only talk to api.
 *
 * If you find yourself typing `localStorage` anywhere else, that is the bug.
 */

const KEY = 'fa-transactions/v1';

/** Bumped when the shape of stored data changes, so stale saves get discarded. */
const SCHEMA_VERSION = 1;

/**
 * @typedef {object} Database
 * @property {number} version
 * @property {import('./api.js').Deal[]} deals
 * @property {import('./api.js').Contact[]} contacts
 * @property {import('./api.js').Task[]} tasks
 * @property {import('./api.js').Agent} agent
 */

/**
 * Read the whole database.
 *
 * Returns null when there is nothing usable stored — a first visit, a cleared
 * browser, a schema bump, or corrupted JSON. The caller decides what to do
 * about it (api.js seeds from the JSON file). We do not throw: a broken save
 * should degrade to "start fresh", never to a blank screen.
 *
 * @returns {Database | null}
 */
export function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.version !== SCHEMA_VERSION) return null;

    return parsed;
  } catch (error) {
    console.warn('[store] Could not read saved data, starting fresh.', error);
    return null;
  }
}

/**
 * Write the whole database.
 *
 * Whole-database writes are fine at this scale and much easier to reason about
 * than partial ones — there is no way to end up with a deal saved and its task
 * lost. Revisit if the dataset ever gets big enough for the serialise cost to
 * show up, which for a few hundred records it will not.
 *
 * @param {Omit<Database, 'version'>} data
 */
export function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ version: SCHEMA_VERSION, ...data }));
  } catch (error) {
    // Quota exceeded, or private browsing in some browsers. The app keeps
    // working in memory; the user just loses the save.
    console.error('[store] Could not save. Changes will be lost on refresh.', error);
  }
}

/** Forget everything. Used by "Reset demo data". */
export function clear() {
  localStorage.removeItem(KEY);
}
