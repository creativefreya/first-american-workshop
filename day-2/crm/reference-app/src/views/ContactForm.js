/**
 * ContactForm — create or edit a contact.
 *
 * Lifted out of ContactsView so the app shell can open it too. The rule that
 * fell out of it: a form that more than one screen can trigger belongs in its
 * own module. Left inside the view, the only way to reach it from the top bar
 * would have been to export a function from a view — which quietly makes every
 * view a public API.
 */

import { el } from '../lib/dom.js';
import { CONTACT_ROLES } from '../lib/domain.js';
import * as api from '../lib/api.js';
import { Field } from '../components/Field.js';
import { Button } from '../components/Button.js';
import { Modal } from '../components/Modal.js';
import { toast } from '../components/Toast.js';

/**
 * @param {object} [props]
 * @param {import('../lib/api.js').Contact} [props.contact]  omit to create
 * @param {(contact: import('../lib/api.js').Contact) => void} [props.onSaved]
 */
export function openContactForm({ contact, onSaved } = {}) {
  const isEdit = Boolean(contact);

  const form = el(
    'form',
    { class: 'field-grid', onSubmit: (event) => event.preventDefault() },
    Field({ label: 'Name', name: 'name', value: contact?.name ?? '', required: true, class: 'field--full' }),
    Field({
      label: 'Role', name: 'role', type: 'select', value: contact?.role ?? 'buyer',
      options: CONTACT_ROLES.map((role) => ({ value: role.id, label: role.label })),
    }),
    Field({ label: 'Company', name: 'company', value: contact?.company ?? '' }),
    Field({ label: 'Email', name: 'email', type: 'email', value: contact?.email ?? '' }),
    Field({ label: 'Phone', name: 'phone', type: 'tel', value: contact?.phone ?? '' }),
    Field({ label: 'City', name: 'city', value: contact?.city ?? 'Santa Ana', class: 'field--full' }),
  );

  Modal({
    title: isEdit ? 'Edit contact' : 'New contact',
    body: form,
    footer: (close) => [
      Button({ label: 'Cancel', onClick: close }),
      Button({
        label: isEdit ? 'Save changes' : 'Add contact',
        variant: 'primary',
        onClick: async () => {
          if (!form.reportValidity()) return;

          const data = Object.fromEntries(new FormData(form));
          const saved = isEdit ? await api.updateContact(contact.id, data) : await api.addContact(data);

          close();
          toast(isEdit ? 'Contact updated' : `${saved.name} added`);
          onSaved?.(saved);
        },
      }),
    ],
  });
}
