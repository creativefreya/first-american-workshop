/**
 * domain.js — what the words in this app mean.
 *
 * Every stage, source, risk and task type is defined once, here, with its
 * label and its visual tone. Nothing else in the app is allowed to write the
 * string "Under contract" or decide that a stalled deal is amber.
 *
 * Why bother: a CRM's vocabulary leaks everywhere — the table, the filters,
 * the drawer, the charts, the CSV export. Define it in one place and adding a
 * stage is a two-line change. Define it in six places and it is a bug hunt.
 *
 * The stage list is the transaction lifecycle a US residential agent actually
 * works through, mapped to the customer jobs in the product brain:
 *   docs/customer/jobs-to-be-done.md
 */

import { daysUntil } from './format.js';

/**
 * @typedef {'lead' | 'under-contract' | 'title-escrow' | 'clear-to-close' | 'closed' | 'fell-through'} StageId
 * @typedef {'neutral' | 'info' | 'accent' | 'success' | 'warning' | 'danger' | 'brand' | 'purple'} Tone
 */

/**
 * @typedef {object} Stage
 * @property {StageId} id
 * @property {string} label
 * @property {Tone} tone
 * @property {boolean} open      — counts toward the active pipeline
 * @property {boolean} terminal  — no further stage follows
 * @property {number} stalledAfterDays — days in stage before it needs chasing (JTBD P1)
 * @property {string} description
 */

/** @type {Stage[]} */
export const STAGES = [
  {
    id: 'lead',
    label: 'Lead',
    tone: 'neutral',
    open: true,
    terminal: false,
    stalledAfterDays: 14,
    description: 'Interested, not yet under contract.',
  },
  {
    id: 'under-contract',
    label: 'Under contract',
    tone: 'info',
    open: true,
    terminal: false,
    stalledAfterDays: 10,
    description: 'Offer accepted. Inspection and financing contingencies live.',
  },
  {
    id: 'title-escrow',
    label: 'Title & escrow',
    tone: 'accent',
    open: true,
    terminal: false,
    stalledAfterDays: 12,
    description: 'Title search underway, escrow opened, exceptions being cleared.',
  },
  {
    id: 'clear-to-close',
    label: 'Clear to close',
    tone: 'success',
    open: true,
    terminal: false,
    stalledAfterDays: 7,
    description: 'Lender has signed off. Scheduling signing and funding.',
  },
  {
    id: 'closed',
    label: 'Closed',
    tone: 'brand',
    open: false,
    terminal: true,
    stalledAfterDays: Infinity,
    description: 'Funded and recorded.',
  },
  {
    id: 'fell-through',
    label: 'Fell through',
    tone: 'danger',
    open: false,
    terminal: true,
    stalledAfterDays: Infinity,
    description: 'Terminated before closing.',
  },
];

/** Stages that make up the forward path, in order. Drives the progress track. */
export const PIPELINE_STAGES = STAGES.filter((stage) => !stage.terminal || stage.id === 'closed');

/** @type {Record<StageId, Stage>} */
export const STAGE_BY_ID = Object.fromEntries(STAGES.map((stage) => [stage.id, stage]));

/**
 * @param {StageId} id
 * @returns {Stage}
 */
export function stage(id) {
  return STAGE_BY_ID[id] ?? STAGE_BY_ID.lead;
}

/* -----------------------------------------------------------------------------
   Risk flags — JTBD P1 "nothing dies on my watch", C4 "not lose my money to fraud"
   -------------------------------------------------------------------------- */

/**
 * @typedef {'wire-fraud-unconfirmed' | 'title-exception' | 'appraisal-gap' | 'financing-at-risk' | 'docs-outstanding'} RiskId
 */

/**
 * @typedef {object} Risk
 * @property {RiskId} id
 * @property {string} label
 * @property {Tone} tone
 * @property {string} detail
 */

/** @type {Risk[]} */
export const RISKS = [
  {
    id: 'wire-fraud-unconfirmed',
    label: 'Wire instructions unverified',
    tone: 'danger',
    detail: 'Buyer has not confirmed wire instructions by phone with escrow. Call before funds move.',
  },
  {
    id: 'title-exception',
    label: 'Title exception open',
    tone: 'warning',
    detail: 'An exception surfaced on the preliminary report and is not yet cleared.',
  },
  {
    id: 'appraisal-gap',
    label: 'Appraisal gap',
    tone: 'warning',
    detail: 'Appraised below contract price. Renegotiation or buyer cash required.',
  },
  {
    id: 'financing-at-risk',
    label: 'Financing at risk',
    tone: 'danger',
    detail: 'Lender has flagged a condition that could delay or block approval.',
  },
  {
    id: 'docs-outstanding',
    label: 'Documents outstanding',
    tone: 'warning',
    detail: 'Signed documents still owed by one or more parties.',
  },
];

/* -----------------------------------------------------------------------------
   Lead sources — where the deal came from
   -------------------------------------------------------------------------- */

export const SOURCES = [
  { id: 'referral', label: 'Referral' },
  { id: 'repeat-client', label: 'Repeat client' },
  { id: 'open-house', label: 'Open house' },
  { id: 'listing-site', label: 'Listing site' },
  { id: 'website', label: 'Website' },
  { id: 'sphere', label: 'Sphere' },
];

/** @type {Record<string, string>} */
export const SOURCE_LABEL = Object.fromEntries(SOURCES.map((source) => [source.id, source.label]));

/* -----------------------------------------------------------------------------
   Transaction sides and contact roles
   -------------------------------------------------------------------------- */

export const SIDES = [
  { id: 'buy', label: 'Buy side' },
  { id: 'sell', label: 'List side' },
];

/** @type {Record<string, string>} */
export const SIDE_LABEL = Object.fromEntries(SIDES.map((side) => [side.id, side.label]));

export const CONTACT_ROLES = [
  { id: 'buyer', label: 'Buyer', tone: 'info' },
  { id: 'seller', label: 'Seller', tone: 'accent' },
  { id: 'lender', label: 'Lender', tone: 'purple' },
  { id: 'escrow', label: 'Escrow officer', tone: 'brand' },
  { id: 'co-agent', label: 'Co-agent', tone: 'neutral' },
  { id: 'attorney', label: 'Attorney', tone: 'neutral' },
];

/** @type {Record<string, {id: string, label: string, tone: Tone}>} */
export const ROLE_BY_ID = Object.fromEntries(CONTACT_ROLES.map((role) => [role.id, role]));

/* -----------------------------------------------------------------------------
   Derived state — computed from a deal, never stored on it
   --------------------------------------------------------------------------

   These are functions rather than fields on purpose. "Is this deal stalled?"
   depends on today's date, so storing the answer means storing something that
   silently goes stale. Anything derivable gets derived.
   -------------------------------------------------------------------------- */

/**
 * Days the deal has sat in its current stage.
 * @param {import('./api.js').Deal} deal
 * @returns {number}
 */
export function daysInStage(deal) {
  // Reuses daysUntil rather than repeating the midnight-flooring arithmetic.
  // The same calculation written twice is the same bug written twice.
  return Math.max(0, -daysUntil(deal.stageSince));
}

/**
 * Has this deal been sitting too long without movement? (JTBD P1)
 * @param {import('./api.js').Deal} deal
 * @returns {boolean}
 */
export function isStalled(deal) {
  return daysInStage(deal) > stage(deal.stage).stalledAfterDays;
}

/**
 * A deal needs attention if it is stalled or carries any risk flag.
 * This is the single definition of "at risk" — the dashboard tile, the table
 * filter and the row indicator all call it, so they can never disagree.
 *
 * @param {import('./api.js').Deal} deal
 * @returns {boolean}
 */
export function needsAttention(deal) {
  return stage(deal.stage).open && (isStalled(deal) || deal.risks.length > 0);
}
