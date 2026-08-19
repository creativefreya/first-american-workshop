/**
 * ContactsView — everyone who is not the client.
 *
 * Escrow officers, lenders, co-agents, attorneys. Deliberately a separate
 * screen from Deals rather than a tab inside it, because these people outlast
 * any individual transaction — the reason to keep them is that you will work
 * with them again (JTBD P1: the deal moves faster when you already know who
 * to call).
 */

import { el, replace } from '../lib/dom.js';
import * as api from '../lib/api.js';
import { CONTACT_ROLES, ROLE_BY_ID } from '../lib/domain.js';
import { phone as formatPhone, date } from '../lib/format.js';
import { toCsv, download } from '../lib/csv.js';
import { DataTable } from '../components/DataTable.js';
import { Toolbar } from '../components/Toolbar.js';
import { Pill } from '../components/Pill.js';
import { Avatar } from '../components/Avatar.js';
import { Button } from '../components/Button.js';
import { confirm } from '../components/Modal.js';
import { EmptyState, NoResults } from '../components/EmptyState.js';
import { toast } from '../components/Toast.js';
import { openDealDrawer } from './DealDrawer.js';
import { openContactForm } from './ContactForm.js';

export function ContactsView() {
  /** @type {import('../lib/api.js').Contact[]} */
  let contacts = [];
  /** @type {import('../lib/api.js').Deal[]} */
  let deals = [];

  let filters = { search: '', filters: { role: '' }, sort: 'name' };

  const tableHost = el('div', {});

  const toolbar = Toolbar({
    searchPlaceholder: 'Search name, company or email…',
    filters: [{ key: 'role', label: 'All roles', options: CONTACT_ROLES.map((role) => ({ value: role.id, label: role.label })) }],
    sorts: [
      { value: 'name', label: 'Name A–Z' },
      { value: 'recent', label: 'Recently added' },
      { value: 'deals', label: 'Most transactions' },
    ],
    onChange: (state) => {
      filters = state;
      paint();
    },
    actions: [
      Button({
        label: 'Export CSV',
        icon: 'download',
        onClick: () => {
          const rows = visible();
          download(
            `contacts-${todayISO()}.csv`,
            toCsv(
              ['Name', 'Role', 'Company', 'Email', 'Phone', 'City', 'Transactions'],
              rows.map((contact) => [
                contact.name, ROLE_BY_ID[contact.role]?.label ?? contact.role, contact.company,
                contact.email, contact.phone, contact.city, contact.dealIds.length,
              ]),
            ),
          );
          toast(`Exported ${rows.length} ${rows.length === 1 ? 'contact' : 'contacts'}`);
        },
      }),
      Button({ label: 'New contact', icon: 'plus', variant: 'primary', onClick: () => openContactForm() }),
    ],
  });

  function visible() {
    const term = filters.search.trim().toLowerCase();

    const matched = contacts.filter((contact) => {
      if (filters.filters.role && contact.role !== filters.filters.role) return false;
      if (!term) return true;
      return `${contact.name} ${contact.company} ${contact.email} ${contact.city}`.toLowerCase().includes(term);
    });

    const copy = [...matched];
    switch (filters.sort) {
      case 'recent': return copy.sort((a, b) => b.addedOn.localeCompare(a.addedOn));
      case 'deals': return copy.sort((a, b) => b.dealIds.length - a.dealIds.length);
      default: return copy.sort((a, b) => a.name.localeCompare(b.name));
    }
  }

  /** @type {import('../components/DataTable.js').Column<import('../lib/api.js').Contact>[]} */
  const columns = [
    {
      key: 'name',
      label: 'Name',
      width: '20%',
      sortValue: (contact) => contact.name,
      render: (contact) =>
        el(
          'div',
          { class: 'cell-primary' },
          Avatar({ name: contact.name, size: 'sm' }),
          el(
            'div',
            { class: 'cell-primary__text' },
            el('span', { class: 'cell-title' }, contact.name),
            el('span', { class: 'cell-sub' }, contact.company || contact.city),
          ),
        ),
    },
    {
      key: 'role',
      label: 'Role',
      width: '11%',
      sortValue: (contact) => contact.role,
      render: (contact) => {
        const role = ROLE_BY_ID[contact.role];
        return Pill({ label: role?.label ?? contact.role, tone: role?.tone ?? 'neutral' });
      },
    },
    {
      key: 'email',
      label: 'Email',
      width: '17%',
      sortValue: (contact) => contact.email,
      render: (contact) =>
        contact.email
          ? el('a', { href: `mailto:${contact.email}`, class: 'cell-mono' }, contact.email)
          : el('span', { class: 'cell-muted' }, '—'),
    },
    {
      key: 'phone',
      label: 'Phone',
      width: '12%',
      render: (contact) =>
        contact.phone
          ? el('a', { href: `tel:${contact.phone}`, class: 'cell-mono' }, formatPhone(contact.phone))
          : el('span', { class: 'cell-muted' }, '—'),
    },
    {
      key: 'deals',
      label: 'Transactions',
      width: '13%',
      sortValue: (contact) => contact.dealIds.length,
      render: (contact) => {
        if (contact.dealIds.length === 0) return el('span', { class: 'cell-muted' }, 'None');

        // Link straight to the first one, and say how many more there are.
        // Listing all of an escrow officer's eleven file numbers in one cell
        // would truncate to uselessness; the count is the useful part.
        const first = deals.find((deal) => deal.id === contact.dealIds[0]);
        return el(
          'div',
          { class: 'row' },
          first &&
            el(
              'button',
              { class: 'link-button', onClick: () => openDealDrawer(first.id) },
              first.fileNumber,
            ),
          contact.dealIds.length > 1 && el('span', { class: 'cell-sub' }, `+${contact.dealIds.length - 1}`),
        );
      },
    },
    {
      key: 'added',
      label: 'Added',
      width: '12%',
      sortValue: (contact) => contact.addedOn,
      render: (contact) => el('span', { class: 'cell-mono cell-muted' }, date(contact.addedOn)),
    },
    {
      key: 'actions',
      label: '',
      width: '11%',
      align: 'right',
      render: (contact) =>
        el(
          'div',
          { class: 'cell-actions' },
          Button({
            icon: 'copy',
            variant: 'ghost',
            size: 'sm',
            title: `Copy ${contact.name}'s email`,
            onClick: async () => {
              if (!contact.email) {
                toast('No email on file.', { tone: 'info' });
                return;
              }
              await navigator.clipboard.writeText(contact.email);
              toast(`Copied ${contact.email}`);
            },
          }),
          Button({ icon: 'edit', variant: 'ghost', size: 'sm', title: `Edit ${contact.name}`, onClick: () => openContactForm({ contact }) }),
          Button({
            icon: 'trash',
            variant: 'ghost',
            size: 'sm',
            title: `Delete ${contact.name}`,
            onClick: async () => {
              const ok = await confirm({
                title: 'Delete this contact?',
                body: `${contact.name} will be removed. Their transactions are not affected.`,
                confirmLabel: 'Delete',
                destructive: true,
              });
              if (!ok) return;
              await api.deleteContact(contact.id);
              toast('Contact deleted', { tone: 'danger' });
            },
          }),
        ),
    },
  ];

  function paint() {
    const rows = visible();
    toolbar.setCount(rows.length, contacts.length);

    const empty = contacts.length === 0
      ? EmptyState({
          icon: 'contacts',
          title: 'No contacts yet',
          body: 'Escrow officers, lenders and co-agents you work with repeatedly belong here.',
          action: { label: 'New contact', icon: 'plus', onClick: () => openContactForm() },
        })
      : NoResults(filters.search, () => toolbar.reset());

    replace(
      tableHost,
      DataTable({ columns, rows, numbered: true, rowKey: (contact) => contact.id, empty }),
    );
  }

  async function load() {
    [contacts, deals] = await Promise.all([api.getContacts(), api.getDeals()]);
    paint();
  }

  const root = el(
    'div',
    { class: 'page' },
    el(
      'div',
      { class: 'page__header' },
      el(
        'div',
        {},
        el('h1', { class: 'page__title' }, 'Contacts'),
        el('p', { class: 'page__lede' }, 'The people around your transactions — escrow, lending, co-agents and counsel.'),
      ),
    ),
    toolbar,
    tableHost,
  );

  root.destroy = api.subscribe(load);
  load();

  return root;
}
