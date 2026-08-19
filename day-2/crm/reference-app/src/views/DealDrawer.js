/**
 * DealDrawer — everything about one transaction.
 *
 * Four tabs, in the order the agent's questions arrive:
 *   Overview   where is it, what is it worth, when does it close
 *   Risks      what could kill it        (JTBD P1, C4)
 *   Notes      what did I say last time  (JTBD P2)
 *   Activity   what changed              (JTBD P3)
 *
 * The drawer re-reads its deal from the api after every write rather than
 * patching its own copy. Slower by an amount nobody can perceive, and it makes
 * an entire category of bug impossible: the panel cannot drift out of sync
 * with the record it is showing.
 */

import { el, replace } from '../lib/dom.js';
import * as api from '../lib/api.js';
import { money, date, phone as formatPhone, daysUntil, relativeDay, datetime } from '../lib/format.js';
import { stage, RISKS, SIDE_LABEL, SOURCE_LABEL, daysInStage, isStalled } from '../lib/domain.js';
import { Drawer } from '../components/Drawer.js';
import { Tabs } from '../components/Tabs.js';
import { Pill, StagePill } from '../components/Pill.js';
import { Button } from '../components/Button.js';
import { ProgressTrack } from '../components/ProgressTrack.js';
import { Timeline } from '../components/Timeline.js';
import { EmptyState } from '../components/EmptyState.js';
import { toast } from '../components/Toast.js';
import { confirm } from '../components/Modal.js';
import { openDealForm } from './DealForm.js';

/**
 * @param {string} dealId
 */
export async function openDealDrawer(dealId) {
  let deal = await api.getDeal(dealId);
  if (!deal) {
    toast('That transaction no longer exists.', { tone: 'danger' });
    return;
  }

  const bodyHost = el('div', { class: 'drawer-content' });

  /** Pull a fresh copy and repaint. Called after every write. */
  async function refresh() {
    const next = await api.getDeal(dealId);
    if (!next) {
      drawer.close();
      return;
    }

    deal = next;
    replace(bodyHost, buildTabs());

    // The header carries live state too — repaint it or the stage pill keeps
    // showing whatever the deal was when the drawer opened.
    drawer.setHeader({
      title: deal.clientName,
      subtitle: `${deal.fileNumber} · ${deal.address}`,
      aside: [StagePill(stage(deal.stage))],
    });
  }

  /* --- Tab panels --------------------------------------------------------- */

  function overviewPanel() {
    const closing = deal.closingDate ? daysUntil(deal.closingDate) : null;

    return el(
      'div',
      { class: 'stack' },

      ProgressTrack({
        current: deal.stage,
        onSelect: async (next) => {
          if (next === deal.stage) return;
          await api.updateDeal(deal.id, { stage: next });
          toast(`Moved to ${stage(next).label.toLowerCase()}`);
          refresh();
        },
      }),

      el(
        'dl',
        { class: 'details' },
        el('dt', {}, 'Property'),
        el('dd', {}, `${deal.address}`, deal.zip ? el('span', { class: 'text-muted' }, `, ${deal.city} ${deal.state} ${deal.zip}`) : el('span', { class: 'text-muted' }, `, ${deal.city} ${deal.state}`)),

        el('dt', {}, 'Type'),
        el('dd', {}, deal.propertyType, ' · ', SIDE_LABEL[deal.side]),

        el('dt', {}, 'Price'),
        el('dd', { class: 'mono' }, money(deal.price)),

        el('dt', {}, 'Commission'),
        el('dd', { class: 'mono' }, `${deal.commissionRate}% · ${money(deal.price * (deal.commissionRate / 100))}`),

        el('dt', {}, 'Closing'),
        el(
          'dd',
          {},
          deal.closingDate
            ? el(
                'span',
                {},
                date(deal.closingDate),
                el('span', { class: 'text-muted' }, ` · ${relativeDay(deal.closingDate)}`),
                closing !== null && closing <= 7 && closing >= 0 && stage(deal.stage).open
                  ? el('span', {}, ' ', Pill({ label: 'This week', tone: 'warning' }))
                  : null,
              )
            : el('span', { class: 'text-muted' }, 'Not set'),
        ),

        el('dt', {}, 'In stage'),
        el(
          'dd',
          {},
          `${daysInStage(deal)} ${daysInStage(deal) === 1 ? 'day' : 'days'}`,
          isStalled(deal) && stage(deal.stage).open
            ? el('span', {}, ' ', Pill({ label: 'Stalled', tone: 'warning', icon: 'clock' }))
            : null,
        ),

        el('dt', {}, 'Opened'),
        el('dd', {}, date(deal.openedOn)),

        el('dt', {}, 'Source'),
        el('dd', {}, SOURCE_LABEL[deal.source] ?? deal.source),
      ),

      el(
        'div',
        { class: 'stack stack--tight' },
        el('h3', { class: 'block-title' }, 'Client'),
        el(
          'dl',
          { class: 'details' },
          el('dt', {}, 'Name'),
          el('dd', {}, deal.clientName),
          el('dt', {}, 'Email'),
          el('dd', {}, deal.clientEmail ? el('a', { href: `mailto:${deal.clientEmail}` }, deal.clientEmail) : el('span', { class: 'text-muted' }, '—')),
          el('dt', {}, 'Phone'),
          el('dd', {}, deal.clientPhone ? el('a', { href: `tel:${deal.clientPhone}` }, formatPhone(deal.clientPhone)) : el('span', { class: 'text-muted' }, '—')),
        ),
      ),

      el(
        'div',
        { class: 'stack stack--tight' },
        el('h3', { class: 'block-title' }, 'Transaction team'),
        el(
          'dl',
          { class: 'details' },
          el('dt', {}, 'Escrow'),
          el('dd', {}, deal.escrowOfficer || el('span', { class: 'text-muted' }, 'Not assigned')),
          el('dt', {}, 'Title officer'),
          el('dd', {}, deal.titleOfficer || el('span', { class: 'text-muted' }, 'Not assigned')),
          el('dt', {}, 'Lender'),
          el('dd', {}, deal.lender || el('span', { class: 'text-muted' }, '—')),
        ),
      ),
    );
  }

  function risksPanel() {
    return el(
      'div',
      { class: 'stack stack--tight' },
      el(
        'p',
        { class: 'text-sm text-muted' },
        'Tap a flag to raise or clear it. Cleared flags stay listed so the history is visible.',
      ),
      ...RISKS.map((risk) => {
        const isActive = deal.risks.includes(risk.id);

        return el(
          'button',
          {
            class: `risk risk--${isActive ? risk.tone : 'cleared'}`,
            onClick: async () => {
              await api.toggleRisk(deal.id, risk.id);
              toast(isActive ? `Cleared: ${risk.label.toLowerCase()}` : `Flagged: ${risk.label.toLowerCase()}`, {
                tone: isActive ? 'success' : 'danger',
              });
              refresh();
            },
          },
          el(
            'span',
            { class: 'risk__body' },
            el('span', { class: 'risk__label' }, risk.label),
            el('span', { class: 'risk__detail' }, risk.detail),
          ),
          Pill({ label: isActive ? 'Open' : 'Clear', tone: isActive ? risk.tone : 'neutral' }),
        );
      }),
    );
  }

  function notesPanel() {
    const input = el('textarea', {
      class: 'field__control field__control--textarea',
      rows: 3,
      placeholder: 'What happened? Who said what?',
      'aria-label': 'New note',
    });

    async function save() {
      const body = input.value.trim();
      if (!body) return;
      await api.addNote(deal.id, body);
      input.value = '';
      toast('Note added');
      refresh();
    }

    return el(
      'div',
      { class: 'stack' },
      el(
        'div',
        { class: 'stack stack--tight' },
        input,
        el(
          'div',
          { class: 'row row--between' },
          el('span', { class: 'text-sm text-muted' }, 'Notes are visible to you only.'),
          Button({ label: 'Add note', variant: 'primary', size: 'sm', onClick: save }),
        ),
      ),

      deal.notes.length === 0
        ? EmptyState({
            icon: 'edit',
            title: 'No notes yet',
            body: 'Write down what was said while you still remember it. Future you will not.',
          })
        : el(
            'div',
            { class: 'stack stack--tight' },
            ...deal.notes.map((note) =>
              el(
                'article',
                { class: 'note' },
                el('p', { class: 'note__body' }, note.body),
                el('p', { class: 'note__meta' }, `${note.author} · `, el('time', { datetime: note.createdAt }, datetime(note.createdAt))),
              ),
            ),
          ),
    );
  }

  /**
   * Which tab the user is on. Held out here rather than inside Tabs, because
   * refresh() rebuilds the tabs after every write — without this, adding a
   * note in the Notes tab would dump you back on Overview, which is the kind
   * of small rudeness that makes an app feel unfinished.
   */
  let activeTab = 'overview';

  function buildTabs() {
    return Tabs({
      initial: activeTab,
      onChange: (id) => { activeTab = id; },
      tabs: [
        { id: 'overview', label: 'Overview', panel: overviewPanel },
        { id: 'risks', label: 'Risks', badge: deal.risks.length || undefined, panel: risksPanel },
        { id: 'notes', label: 'Notes', badge: deal.notes.length || undefined, panel: notesPanel },
        { id: 'activity', label: 'Activity', panel: () => Timeline({ events: deal.timeline }) },
      ],
    });
  }

  replace(bodyHost, buildTabs());

  const drawer = Drawer({
    title: deal.clientName,
    subtitle: `${deal.fileNumber} · ${deal.address}`,
    headerAside: [StagePill(stage(deal.stage))],
    body: bodyHost,
    footer: [
      Button({
        label: 'Delete',
        variant: 'danger',
        onClick: async () => {
          const ok = await confirm({
            title: 'Delete this transaction?',
            body: `${deal.fileNumber} — ${deal.clientName}. This also removes its tasks. It cannot be undone.`,
            confirmLabel: 'Delete',
            destructive: true,
          });
          if (!ok) return;

          await api.deleteDeal(deal.id);
          drawer.close();
          toast('Transaction deleted', { tone: 'danger' });
        },
      }),
      Button({
        label: 'Edit',
        icon: 'edit',
        variant: 'primary',
        onClick: () => openDealForm({ deal, onSaved: refresh }),
      }),
    ],
  });
}
