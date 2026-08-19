/**
 * api.js — THE BOUNDARY.
 *
 * =============================================================================
 * If you read one file in this project, read this one.
 * =============================================================================
 *
 * The front end never touches the data directly. It asks.
 *
 * Every view in src/views calls functions from this file — getDeals(),
 * addDeal(), updateDeal(), deleteDeal(). Not one of them knows the data lives
 * in a JSON file and a browser key. They do not know whether there is a server.
 * They just ask.
 *
 * That is what "back end" means, and it is why this app is something you can
 * keep working on rather than something you eventually rewrite. Swap the guts
 * of these functions for `fetch('/api/deals')` and the rest of the app does not
 * change by a single character.
 *
 * Two deliberate choices that look odd at this size and are not:
 *
 *   1. Every function is `async`, even though localStorage is synchronous.
 *      A real back end is over a network. If these were synchronous, moving to
 *      one would mean rewriting every call site. They are async now so that
 *      day is a non-event.
 *
 *   2. Everything returns a copy (structuredClone). A view cannot reach into
 *      the store and mutate a record by accident — the only way to change data
 *      is to call a function that says so in its name. This is the difference
 *      between a bug you can find and a bug you cannot.
 */

import * as store from './store.js';
import { todayISO } from './format.js';

/* -----------------------------------------------------------------------------
   Types
   -------------------------------------------------------------------------- */

/**
 * @typedef {object} Deal
 * @property {string} id
 * @property {string} fileNumber        First American file reference
 * @property {string} clientName
 * @property {string} clientEmail
 * @property {string} clientPhone
 * @property {'buy' | 'sell'} side
 * @property {string} address
 * @property {string} city
 * @property {string} state
 * @property {string} zip
 * @property {string} propertyType
 * @property {number} price
 * @property {number} commissionRate    percent, e.g. 2.5
 * @property {import('./domain.js').StageId} stage
 * @property {string} stageSince        ISO date the deal entered its current stage
 * @property {string} openedOn          ISO date
 * @property {string} closingDate       ISO date, target or actual
 * @property {string} source
 * @property {string} escrowOfficer
 * @property {string} lender
 * @property {string} titleOfficer
 * @property {import('./domain.js').RiskId[]} risks
 * @property {Note[]} notes
 * @property {TimelineEvent[]} timeline
 *
 * @typedef {object} Note
 * @property {string} id
 * @property {string} body
 * @property {string} createdAt         ISO datetime
 * @property {string} author
 *
 * @typedef {object} TimelineEvent
 * @property {string} id
 * @property {string} label
 * @property {string} at                ISO datetime
 * @property {'stage' | 'document' | 'message' | 'risk' | 'system'} kind
 *
 * @typedef {object} Contact
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} role
 * @property {string} company
 * @property {string} city
 * @property {string[]} dealIds
 * @property {string} addedOn           ISO date
 *
 * @typedef {object} Task
 * @property {string} id
 * @property {string} title
 * @property {string | null} dealId
 * @property {string} dueDate           ISO date
 * @property {boolean} done
 * @property {'call' | 'document' | 'showing' | 'follow-up' | 'compliance'} kind
 *
 * @typedef {object} Agent
 * @property {string} name
 * @property {string} title
 * @property {string} brokerage
 * @property {string} email
 * @property {string} license
 */

/* -----------------------------------------------------------------------------
   In-memory state
   --------------------------------------------------------------------------

   Loaded once at startup, kept in memory, written through to the store on every
   change. Reads are instant; writes are durable. Same shape a real client-side
   cache in front of an API would have.
   -------------------------------------------------------------------------- */

/** @type {import('./store.js').Database | null} */
let db = null;

/** @type {Set<() => void>} */
const subscribers = new Set();

/**
 * Load the database: saved data if there is any, otherwise the seed file.
 * Called once, by main.js, before the first render.
 *
 * @returns {Promise<void>}
 */
export async function init() {
  const saved = store.read();

  if (saved) {
    db = saved;
    return;
  }

  db = await loadSeed();
  persist();
}

/**
 * Fetch the fake database off disk.
 *
 * This is a real network request, which is why the app needs to be served over
 * http rather than opened as a file:// URL — `fetch` refuses file://, and the
 * error it gives is not obvious. See the README.
 *
 * @returns {Promise<import('./store.js').Database>}
 */
async function loadSeed() {
  const response = await fetch(new URL('../data/seed.json', import.meta.url));
  if (!response.ok) throw new Error(`Could not load seed data (${response.status})`);

  const seed = await response.json();
  return { version: 1, ...seed };
}

/** Write the current state through to the store and tell everyone watching. */
function persist() {
  if (!db) return;
  store.write({ deals: db.deals, contacts: db.contacts, tasks: db.tasks, agent: db.agent });
  subscribers.forEach((fn) => fn());
}

/**
 * Watch for data changes.
 *
 * Views call this on mount and call the returned function on unmount. It is
 * how a note added in the drawer updates the count in the table behind it
 * without either component knowing the other exists.
 *
 * @param {() => void} fn
 * @returns {() => void} unsubscribe
 */
export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

/** @returns {import('./store.js').Database} */
function requireDb() {
  if (!db) throw new Error('api.init() must be awaited before any other api call.');
  return db;
}

/**
 * Ids only need to be unique within one browser's data, so this is enough.
 * A real back end would issue these.
 *
 * @param {string} prefix
 * @returns {string}
 */
function makeId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/* -----------------------------------------------------------------------------
   Deals
   -------------------------------------------------------------------------- */

/** @returns {Promise<Deal[]>} */
export async function getDeals() {
  return structuredClone(requireDb().deals);
}

/**
 * @param {string} id
 * @returns {Promise<Deal | undefined>}
 */
export async function getDeal(id) {
  const found = requireDb().deals.find((deal) => deal.id === id);
  return found ? structuredClone(found) : undefined;
}

/**
 * @param {Partial<Deal> & Pick<Deal, 'clientName' | 'address' | 'price'>} input
 * @returns {Promise<Deal>}
 */
export async function addDeal(input) {
  const now = new Date().toISOString();

  // todayISO(), not now.slice(0, 10). `toISOString()` is UTC, so slicing it
  // gives tomorrow's date to anyone east of Greenwich in the evening — the
  // deal would show as opened a day early, and "days in stage" would start at
  // -1. That is the whole reason todayISO() exists; bypassing it here was the
  // bug it was written to prevent.
  const today = todayISO();

  /** @type {Deal} */
  const deal = {
    id: makeId('deal'),
    fileNumber: nextFileNumber(),
    clientName: input.clientName,
    clientEmail: input.clientEmail ?? '',
    clientPhone: input.clientPhone ?? '',
    side: input.side ?? 'buy',
    address: input.address,
    city: input.city ?? 'Santa Ana',
    state: input.state ?? 'CA',
    zip: input.zip ?? '',
    propertyType: input.propertyType ?? 'Single family',
    price: input.price,
    commissionRate: input.commissionRate ?? 2.5,
    stage: input.stage ?? 'lead',
    stageSince: today,
    openedOn: today,
    closingDate: input.closingDate ?? '',
    source: input.source ?? 'referral',
    escrowOfficer: input.escrowOfficer ?? '',
    lender: input.lender ?? '',
    titleOfficer: input.titleOfficer ?? '',
    risks: input.risks ?? [],
    notes: [],
    timeline: [{ id: makeId('evt'), label: 'Transaction opened', at: now, kind: 'system' }],
  };

  requireDb().deals.unshift(deal);
  persist();
  return structuredClone(deal);
}

/**
 * Patch a deal.
 *
 * Moving stage is special-cased: it resets stageSince (so "days in stage" is
 * honest) and writes a timeline entry. Doing that here rather than in the view
 * means it happens no matter who moves the deal — the drawer, the table, a
 * future bulk action, an import.
 *
 * @param {string} id
 * @param {Partial<Deal>} patch
 * @returns {Promise<Deal>}
 */
export async function updateDeal(id, patch) {
  const database = requireDb();
  const index = database.deals.findIndex((deal) => deal.id === id);
  if (index === -1) throw new Error(`No deal with id ${id}`);

  const current = database.deals[index];
  const next = { ...current, ...patch };

  if (patch.stage && patch.stage !== current.stage) {
    next.stageSince = todayISO();
    next.timeline = [
      { id: makeId('evt'), label: `Moved to ${patch.stage.replace(/-/g, ' ')}`, at: new Date().toISOString(), kind: 'stage' },
      ...current.timeline,
    ];
  }

  database.deals[index] = next;
  persist();
  return structuredClone(next);
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteDeal(id) {
  const database = requireDb();
  database.deals = database.deals.filter((deal) => deal.id !== id);

  // Tasks belonging to a deleted deal have nowhere to point. Cascading here
  // rather than leaving orphans is the kind of thing that is cheap now and
  // expensive to retrofit once there are three places that create tasks.
  database.tasks = database.tasks.filter((task) => task.dealId !== id);

  persist();
}

/**
 * @param {string} dealId
 * @param {string} body
 * @returns {Promise<Note>}
 */
export async function addNote(dealId, body) {
  const database = requireDb();
  const deal = database.deals.find((item) => item.id === dealId);
  if (!deal) throw new Error(`No deal with id ${dealId}`);

  /** @type {Note} */
  const note = {
    id: makeId('note'),
    body,
    createdAt: new Date().toISOString(),
    author: database.agent.name,
  };

  deal.notes.unshift(note);
  deal.timeline.unshift({ id: makeId('evt'), label: 'Note added', at: note.createdAt, kind: 'message' });
  persist();
  return structuredClone(note);
}

/**
 * Toggle a risk flag on or off. (JTBD P1, C4.)
 *
 * @param {string} dealId
 * @param {import('./domain.js').RiskId} riskId
 * @returns {Promise<Deal>}
 */
export async function toggleRisk(dealId, riskId) {
  const database = requireDb();
  const deal = database.deals.find((item) => item.id === dealId);
  if (!deal) throw new Error(`No deal with id ${dealId}`);

  const isSet = deal.risks.includes(riskId);
  deal.risks = isSet ? deal.risks.filter((id) => id !== riskId) : [...deal.risks, riskId];
  deal.timeline.unshift({
    id: makeId('evt'),
    label: `${isSet ? 'Cleared' : 'Flagged'}: ${riskId.replace(/-/g, ' ')}`,
    at: new Date().toISOString(),
    kind: 'risk',
  });

  persist();
  return structuredClone(deal);
}

/**
 * Sequential file numbers in First American's format, continuing from the
 * highest already issued rather than counting records — deleting a deal must
 * not cause the next one to reuse its number.
 *
 * @returns {string}
 */
function nextFileNumber() {
  const year = new Date().getFullYear();
  const highest = requireDb().deals.reduce((max, deal) => {
    const match = /^FA-\d{4}-(\d+)$/.exec(deal.fileNumber);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `FA-${year}-${String(highest + 1).padStart(4, '0')}`;
}

/* -----------------------------------------------------------------------------
   Contacts
   -------------------------------------------------------------------------- */

/** @returns {Promise<Contact[]>} */
export async function getContacts() {
  return structuredClone(requireDb().contacts);
}

/**
 * @param {Partial<Contact> & Pick<Contact, 'name'>} input
 * @returns {Promise<Contact>}
 */
export async function addContact(input) {
  /** @type {Contact} */
  const contact = {
    id: makeId('contact'),
    name: input.name,
    email: input.email ?? '',
    phone: input.phone ?? '',
    role: input.role ?? 'buyer',
    company: input.company ?? '',
    city: input.city ?? 'Santa Ana',
    dealIds: input.dealIds ?? [],
    addedOn: todayISO(),
  };

  requireDb().contacts.unshift(contact);
  persist();
  return structuredClone(contact);
}

/**
 * @param {string} id
 * @param {Partial<Contact>} patch
 * @returns {Promise<Contact>}
 */
export async function updateContact(id, patch) {
  const database = requireDb();
  const index = database.contacts.findIndex((contact) => contact.id === id);
  if (index === -1) throw new Error(`No contact with id ${id}`);

  database.contacts[index] = { ...database.contacts[index], ...patch };
  persist();
  return structuredClone(database.contacts[index]);
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteContact(id) {
  const database = requireDb();
  database.contacts = database.contacts.filter((contact) => contact.id !== id);
  persist();
}

/* -----------------------------------------------------------------------------
   Tasks
   -------------------------------------------------------------------------- */

/** @returns {Promise<Task[]>} */
export async function getTasks() {
  return structuredClone(requireDb().tasks);
}

/**
 * @param {Partial<Task> & Pick<Task, 'title' | 'dueDate'>} input
 * @returns {Promise<Task>}
 */
export async function addTask(input) {
  /** @type {Task} */
  const task = {
    id: makeId('task'),
    title: input.title,
    dealId: input.dealId ?? null,
    dueDate: input.dueDate,
    done: false,
    kind: input.kind ?? 'follow-up',
  };

  requireDb().tasks.unshift(task);
  persist();
  return structuredClone(task);
}

/**
 * @param {string} id
 * @param {Partial<Task>} patch
 * @returns {Promise<Task>}
 */
export async function updateTask(id, patch) {
  const database = requireDb();
  const index = database.tasks.findIndex((task) => task.id === id);
  if (index === -1) throw new Error(`No task with id ${id}`);

  database.tasks[index] = { ...database.tasks[index], ...patch };
  persist();
  return structuredClone(database.tasks[index]);
}

/**
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteTask(id) {
  const database = requireDb();
  database.tasks = database.tasks.filter((task) => task.id !== id);
  persist();
}

/* -----------------------------------------------------------------------------
   Account and demo control
   -------------------------------------------------------------------------- */

/** @returns {Promise<Agent>} */
export async function getAgent() {
  return structuredClone(requireDb().agent);
}

/**
 * Throw away every local change and reload the seed file.
 * The escape hatch that makes a demo repeatable.
 *
 * @returns {Promise<void>}
 */
export async function resetDemoData() {
  store.clear();
  db = await loadSeed();
  persist();
}
