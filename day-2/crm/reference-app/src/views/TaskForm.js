/**
 * TaskForm — create a task.
 *
 * Same reasoning as ContactForm: the app shell opens this too, so it lives on
 * its own rather than inside TasksView.
 *
 * It fetches the transaction list itself instead of taking one as an argument.
 * A caller in the top bar has no reason to know that a task can be linked to a
 * transaction, and making it fetch the list first would leak that detail into
 * every call site.
 */

import { el } from '../lib/dom.js';
import { todayISO } from '../lib/format.js';
import * as api from '../lib/api.js';
import { Field } from '../components/Field.js';
import { Button } from '../components/Button.js';
import { Modal } from '../components/Modal.js';
import { toast } from '../components/Toast.js';

/** Task types. Presentation-side vocabulary, so it lives with the form. */
export const TASK_KINDS = [
  { id: 'call', label: 'Call' },
  { id: 'document', label: 'Document' },
  { id: 'showing', label: 'Showing' },
  { id: 'follow-up', label: 'Follow-up' },
  { id: 'compliance', label: 'Compliance' },
];

/**
 * @param {object} [props]
 * @param {string} [props.dealId]  pre-link to a transaction
 * @param {() => void} [props.onSaved]
 */
export async function openTaskForm({ dealId, onSaved } = {}) {
  const deals = await api.getDeals();

  const form = el(
    'form',
    { class: 'field-grid', onSubmit: (event) => event.preventDefault() },
    Field({
      label: 'What needs doing?',
      name: 'title',
      required: true,
      class: 'field--full',
      placeholder: 'Call the lender about the appraisal gap',
    }),
    Field({ label: 'Due', name: 'dueDate', type: 'date', value: todayISO(), required: true }),
    Field({
      label: 'Type', name: 'kind', type: 'select', value: 'follow-up',
      options: TASK_KINDS.map((kind) => ({ value: kind.id, label: kind.label })),
    }),
    Field({
      label: 'Transaction',
      name: 'dealId',
      type: 'select',
      value: dealId ?? '',
      class: 'field--full',
      options: [
        { value: '', label: 'Not linked to a transaction' },
        ...deals.map((deal) => ({ value: deal.id, label: `${deal.fileNumber} — ${deal.clientName}` })),
      ],
    }),
  );

  Modal({
    title: 'New task',
    body: form,
    footer: (close) => [
      Button({ label: 'Cancel', onClick: close }),
      Button({
        label: 'Add task',
        variant: 'primary',
        onClick: async () => {
          if (!form.reportValidity()) return;

          const data = Object.fromEntries(new FormData(form));
          await api.addTask({ ...data, dealId: data.dealId || null });

          close();
          toast('Task added');
          onSaved?.();
        },
      }),
    ],
  });
}
