/**
 * DashboardView — the morning screen.
 *
 * A summary, not a working surface. It answers "how are things?" in four
 * numbers and two charts, and hands off to Contacts and Tasks for anything
 * that needs doing.
 *
 * Deliberately holds no record-level transaction data: no table, no list of
 * clients. Everything here is an aggregate. That keeps the screen readable at
 * a glance, which is the only thing a dashboard is good at — the moment it
 * grows rows, it stops being a summary and becomes a worse version of a list.
 */

import { el, replace } from '../lib/dom.js';
import * as api from '../lib/api.js';
import { STAGES, stage, needsAttention } from '../lib/domain.js';
import { moneyCompact, date, daysUntil, relativeDay, todayISO } from '../lib/format.js';
import { StatCard, StatRow } from '../components/StatCard.js';
import { BarChart, ColumnChart } from '../components/BarChart.js';
import { Pill } from '../components/Pill.js';
import { Icon } from '../components/Icon.js';
import { EmptyState } from '../components/EmptyState.js';

export function DashboardView() {
  const root = el('div', { class: 'page' });

  async function render() {
    const [deals, tasks, agent] = await Promise.all([api.getDeals(), api.getTasks(), api.getAgent()]);

    const open = deals.filter((deal) => stage(deal.stage).open);
    const attention = deals.filter(needsAttention);
    const closingSoon = open
      .filter((deal) => deal.closingDate && daysUntil(deal.closingDate) >= 0 && daysUntil(deal.closingDate) <= 14)
      .sort((a, b) => a.closingDate.localeCompare(b.closingDate));

    const pipelineValue = open.reduce((sum, deal) => sum + deal.price, 0);
    const commission = open.reduce((sum, deal) => sum + deal.price * (deal.commissionRate / 100), 0);

    const today = todayISO();
    const overdue = tasks.filter((task) => !task.done && task.dueDate < today);
    const dueToday = tasks.filter((task) => !task.done && task.dueDate === today);

    replace(
      root,

      el(
        'div',
        { class: 'page__header' },
        el(
          'div',
          {},
          el('h1', { class: 'page__title' }, `Good morning, ${agent.name.split(' ')[0]}`),
          el(
            'p',
            { class: 'page__lede' },
            attention.length > 0
              ? `${attention.length} ${attention.length === 1 ? 'transaction needs' : 'transactions need'} attention, and ${closingSoon.length} ${closingSoon.length === 1 ? 'closes' : 'close'} in the next two weeks.`
              : `Nothing flagged. ${closingSoon.length} ${closingSoon.length === 1 ? 'transaction closes' : 'transactions close'} in the next two weeks.`,
          ),
        ),
      ),

      StatRow(
        StatCard({
          label: 'Open pipeline',
          value: String(open.length),
          meta: `${moneyCompact(pipelineValue)} in flight`,
          tone: 'info',
        }),
        StatCard({
          label: 'Closing ≤ 14 days',
          value: String(closingSoon.length),
          meta: closingSoon.length ? `Next: ${date(closingSoon[0].closingDate)}` : 'Nothing scheduled',
          tone: 'success',
        }),
        StatCard({
          label: 'Needs attention',
          value: String(attention.length),
          meta: 'Stalled or risk-flagged',
          tone: attention.length ? 'danger' : 'neutral',
        }),
        StatCard({
          label: 'Est. commission',
          value: moneyCompact(commission),
          meta: 'On open transactions',
          tone: 'brand',
        }),
      ),

      el(
        'div',
        { class: 'grid-2' },

        /* ---- Pipeline by stage -------------------------------------------- */
        el(
          'section',
          { class: 'card' },
          el('div', { class: 'card__head' }, el('h2', { class: 'card__title' }, 'Pipeline by stage')),
          el(
            'div',
            { class: 'card__body' },
            BarChart({
              bars: STAGES.filter((item) => item.id !== 'fell-through').map((item) => {
                const inStage = deals.filter((deal) => deal.stage === item.id);
                return {
                  label: item.label,
                  value: inStage.length,
                  caption: inStage.length ? moneyCompact(inStage.reduce((sum, deal) => sum + deal.price, 0)) : undefined,
                };
              }),
            }),
          ),
          el('div', { class: 'card__foot' }, `${deals.length} transactions total · ${moneyCompact(pipelineValue)} open`),
        ),

        /* ---- Today --------------------------------------------------------- */
        el(
          'section',
          { class: 'card' },
          el(
            'div',
            { class: 'card__head' },
            el('h2', { class: 'card__title' }, 'Today'),
            el('a', { class: 'section__link', href: '#/tasks' }, 'All tasks'),
          ),
          el(
            'div',
            { class: 'card__body' },
            overdue.length + dueToday.length === 0
              ? EmptyState({ icon: 'check', title: 'Nothing due', body: 'No tasks are due today and nothing is overdue.' })
              : el(
                  'div',
                  { class: 'stack stack--tight' },
                  el(
                    'div',
                    { class: 'row' },
                    overdue.length > 0 && Pill({ label: `${overdue.length} overdue`, tone: 'danger', icon: 'alert' }),
                    dueToday.length > 0 && Pill({ label: `${dueToday.length} due today`, tone: 'warning', icon: 'clock' }),
                  ),
                  ...[...overdue, ...dueToday].slice(0, 6).map((task) =>
                    el(
                      'div',
                      { class: 'mini-task' },
                      Icon({
                        name: task.dueDate < today ? 'alert' : 'clock',
                        size: 14,
                        class: task.dueDate < today ? 'mini-task__icon--overdue' : '',
                      }),
                      el(
                        'div',
                        { class: 'mini-task__text' },
                        el('span', { class: 'mini-task__title' }, task.title),
                        el('span', { class: 'mini-task__meta' }, relativeDay(task.dueDate)),
                      ),
                    ),
                  ),
                ),
          ),
        ),
      ),

      /* ---- Scheduled closings -------------------------------------------- */
      el(
        'section',
        { class: 'card' },
        el('div', { class: 'card__head' }, el('h2', { class: 'card__title' }, 'Scheduled closings')),
        el(
          'div',
          { class: 'card__body' },
          ColumnChart({
            columns: closingsByWeek(open),
            caption: 'Open transactions grouped by the week their closing date falls in.',
          }),
        ),
      ),
    );
  }

  /**
   * Group open deals into the next six weeks by closing date.
   *
   * Weeks rather than days, because a daily chart of 14 open deals is mostly
   * empty columns; and six weeks rather than a quarter, because beyond that a
   * closing date is an intention, not a plan.
   *
   * @param {import('../lib/api.js').Deal[]} open
   */
  function closingsByWeek(open) {
    const weeks = Array.from({ length: 6 }, (_, index) => ({
      label: index === 0 ? 'This wk' : `+${index}`,
      value: 0,
      highlight: index === 0,
    }));

    for (const deal of open) {
      if (!deal.closingDate) continue;
      const days = daysUntil(deal.closingDate);
      if (days < 0) continue;

      const week = Math.floor(days / 7);
      if (week < weeks.length) weeks[week].value += 1;
    }

    return weeks;
  }

  root.destroy = api.subscribe(render);
  render();

  return root;
}
