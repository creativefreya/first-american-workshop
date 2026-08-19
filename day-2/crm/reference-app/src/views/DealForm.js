/**
 * DealForm — create or edit a transaction.
 *
 * One form for both, because "new" and "edit" differ only in whether the
 * fields start populated and which api function gets called at the end. Two
 * forms would be two places to add the next field and two places to forget it.
 *
 * Validation is the browser's. `required` and `type="email"` give real
 * messages in the user's own language, for free, and a custom validation layer
 * here would be worse in every respect except that it would be ours.
 */

import { el } from '../lib/dom.js';
import { STAGES, SOURCES, SIDES } from '../lib/domain.js';
import * as api from '../lib/api.js';
import { Field } from '../components/Field.js';
import { Button } from '../components/Button.js';
import { Modal } from '../components/Modal.js';
import { toast } from '../components/Toast.js';

const PROPERTY_TYPES = ['Single family', 'Condominium', 'Townhouse', 'Multi-family', 'Land'];

/**
 * @param {object} props
 * @param {import('../lib/api.js').Deal} [props.deal]  omit to create
 * @param {(deal: import('../lib/api.js').Deal) => void} [props.onSaved]
 */
export function openDealForm({ deal, onSaved } = {}) {
  const isEdit = Boolean(deal);

  const form = el(
    'form',
    { id: 'deal-form', class: 'field-grid', onSubmit: (event) => event.preventDefault() },

    Field({ label: 'Client name', name: 'clientName', value: deal?.clientName ?? '', required: true, class: 'field--full' }),
    Field({ label: 'Email', name: 'clientEmail', type: 'email', value: deal?.clientEmail ?? '' }),
    Field({ label: 'Phone', name: 'clientPhone', type: 'tel', value: deal?.clientPhone ?? '' }),

    Field({
      label: 'Property address',
      name: 'address',
      value: deal?.address ?? '',
      required: true,
      class: 'field--full',
      hint: 'For a lead who has not chosen a property yet, describe the search — “Searching — Irvine / Tustin”.',
    }),
    Field({ label: 'City', name: 'city', value: deal?.city ?? 'Santa Ana' }),
    Field({ label: 'ZIP', name: 'zip', value: deal?.zip ?? '' }),

    Field({
      label: 'Side', name: 'side', type: 'select', value: deal?.side ?? 'buy',
      options: SIDES.map((side) => ({ value: side.id, label: side.label })),
    }),
    Field({
      label: 'Property type', name: 'propertyType', type: 'select', value: deal?.propertyType ?? 'Single family',
      options: PROPERTY_TYPES.map((type) => ({ value: type, label: type })),
    }),

    Field({ label: 'Price', name: 'price', type: 'number', value: deal?.price ?? '', required: true, prefix: '$' }),
    Field({ label: 'Target closing', name: 'closingDate', type: 'date', value: deal?.closingDate ?? '' }),

    Field({
      label: 'Stage', name: 'stage', type: 'select', value: deal?.stage ?? 'lead',
      options: STAGES.map((stage) => ({ value: stage.id, label: stage.label })),
    }),
    Field({
      label: 'Source', name: 'source', type: 'select', value: deal?.source ?? 'referral',
      options: SOURCES.map((source) => ({ value: source.id, label: source.label })),
    }),

    Field({ label: 'Lender', name: 'lender', value: deal?.lender ?? '' }),
    Field({ label: 'Escrow officer', name: 'escrowOfficer', value: deal?.escrowOfficer ?? '' }),
  );

  Modal({
    title: isEdit ? 'Edit transaction' : 'New transaction',
    description: isEdit ? deal.fileNumber : 'A file number is issued automatically on save.',
    body: form,
    footer: (close) => [
      Button({ label: 'Cancel', onClick: close }),
      Button({
        label: isEdit ? 'Save changes' : 'Create transaction',
        variant: 'primary',
        onClick: async () => {
          // reportValidity() runs the browser's own checks and shows its own
          // messages. Submitting an invalid form silently is the failure mode
          // this one line prevents.
          if (!form.reportValidity()) return;

          const data = Object.fromEntries(new FormData(form));
          const payload = { ...data, price: Number(data.price) };

          const saved = isEdit ? await api.updateDeal(deal.id, payload) : await api.addDeal(payload);

          close();
          toast(isEdit ? 'Transaction updated' : `${saved.fileNumber} created`);
          onSaved?.(saved);
        },
      }),
    ],
  });
}
