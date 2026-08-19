/**
 * TasksView — what has to happen, and by when.
 *
 * Grouped by urgency rather than listed flat, because the only question this
 * screen answers is "what now?". A single sorted list makes the reader work
 * out where the line between late and not-yet-late falls; groups draw it for
 * them.
 *
 * Completed tasks stay visible in their own group instead of disappearing.
 * Ticking something off and watching it vanish removes the only evidence you
 * did anything today.
 */

import { el, replace, cx } from '../lib/dom.js';
import * as api from '../lib/api.js';
import { date, relativeDay, todayISO } from '../lib/format.js';
import { Button } from '../components/Button.js';
import { Icon } from '../components/Icon.js';
import { Pill } from '../components/Pill.js';
import { confirm } from '../components/Modal.js';
import { EmptyState } from '../components/EmptyState.js';
import { toast } from '../components/Toast.js';
import { openDealDrawer } from './DealDrawer.js';
import { openTaskForm, TASK_KINDS } from './TaskForm.js';

export function TasksView() {
  const listHost = el('div', { class: 'stack' });

  /**
   * @param {import('../lib/api.js').Task[]} tasks
   * @param {import('../lib/api.js').Deal[]} deals
   */
  function groups(tasks, deals) {
    const today = todayISO();
    const open = tasks.filter((task) => !task.done);

    const inSevenDays = new Date();
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    const weekEnd = inSevenDays.toISOString().slice(0, 10);

    return [
      { id: 'overdue', title: 'Overdue', tone: 'danger', items: open.filter((task) => task.dueDate < today) },
      { id: 'today', title: 'Today', tone: 'warning', items: open.filter((task) => task.dueDate === today) },
      { id: 'week', title: 'Next 7 days', tone: 'info', items: open.filter((task) => task.dueDate > today && task.dueDate <= weekEnd) },
      { id: 'later', title: 'Later', tone: 'neutral', items: open.filter((task) => task.dueDate > weekEnd) },
      { id: 'done', title: 'Completed', tone: 'success', items: tasks.filter((task) => task.done) },
    ]
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
        deals,
      }))
      .filter((group) => group.items.length > 0);
  }

  /**
   * @param {import('../lib/api.js').Task} task
   * @param {import('../lib/api.js').Deal[]} deals
   */
  function taskRow(task, deals) {
    const deal = deals.find((item) => item.id === task.dealId);
    const today = todayISO();
    const dueClass = task.done
      ? ''
      : task.dueDate < today ? 'task__due--overdue' : task.dueDate === today ? 'task__due--today' : '';

    return el(
      'div',
      { class: cx('task', task.done && 'is-done') },

      el(
        'button',
        {
          class: 'task__check',
          'aria-label': task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`,
          'aria-pressed': String(task.done),
          onClick: async () => {
            await api.updateTask(task.id, { done: !task.done });
            if (!task.done) toast('Task completed');
          },
        },
        Icon({ name: 'check', size: 12 }),
      ),

      el(
        'div',
        { class: 'task__body' },
        el('span', { class: 'task__title' }, task.title),
        el(
          'span',
          { class: 'task__meta' },
          el('span', { class: dueClass }, `${date(task.dueDate)} · ${relativeDay(task.dueDate)}`),
          deal && el('span', {}, ' · '),
          deal &&
            el(
              'button',
              { class: 'link-button', onClick: () => openDealDrawer(deal.id) },
              `${deal.fileNumber} — ${deal.clientName}`,
            ),
        ),
      ),

      Pill({ label: TASK_KINDS.find((kind) => kind.id === task.kind)?.label ?? task.kind, tone: 'neutral', class: 'pill--quiet' }),

      Button({
        icon: 'trash',
        variant: 'ghost',
        size: 'sm',
        title: `Delete "${task.title}"`,
        onClick: async () => {
          const ok = await confirm({
            title: 'Delete this task?',
            body: task.title,
            confirmLabel: 'Delete',
            destructive: true,
          });
          if (!ok) return;
          await api.deleteTask(task.id);
          toast('Task deleted', { tone: 'danger' });
        },
      }),
    );
  }

  async function render() {
    const [tasks, deals] = await Promise.all([api.getTasks(), api.getDeals()]);
    const grouped = groups(tasks, deals);

    if (tasks.length === 0) {
      replace(
        listHost,
        el(
          'div',
          { class: 'card' },
          EmptyState({
            icon: 'tasks',
            title: 'No tasks yet',
            body: 'Anything you would otherwise keep in your head — a callback, a document to chase, a signing to confirm.',
            action: { label: 'New task', icon: 'plus', onClick: () => openTaskForm() },
          }),
        ),
      );
      return;
    }

    replace(
      listHost,
      ...grouped.map((group) =>
        el(
          'section',
          { class: 'section' },
          el(
            'div',
            { class: 'section__head' },
            el(
              'h2',
              { class: 'section__title' },
              group.title,
              ' ',
              Pill({ label: String(group.items.length), tone: group.tone }),
            ),
          ),
          el('div', { class: 'card' }, ...group.items.map((task) => taskRow(task, deals))),
        ),
      ),
    );
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
        el('h1', { class: 'page__title' }, 'Tasks'),
        el('p', { class: 'page__lede' }, 'Grouped by when they are due, so the top of the page is always what matters now.'),
      ),
      Button({
        label: 'New task',
        icon: 'plus',
        variant: 'primary',
        onClick: () => openTaskForm(),
      }),
    ),
    listHost,
  );

  root.destroy = api.subscribe(render);
  render();

  return root;
}
