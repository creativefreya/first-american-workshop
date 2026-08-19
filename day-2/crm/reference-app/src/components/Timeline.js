/**
 * Timeline — what has happened on this record, newest first.
 *
 * Newest first because the question people actually bring to a timeline is
 * "what changed?", not "how did we get here". Chronological order is right for
 * an audit log and wrong for a working panel.
 */

import { el } from '../lib/dom.js';
import { datetime, relativeDay } from '../lib/format.js';
import { Icon } from './Icon.js';
import { EmptyState } from './EmptyState.js';

/** Event kind → icon. Kept here rather than in domain.js because it is purely
 *  presentational: the data layer should not know what a stage change looks
 *  like. */
const KIND_ICON = {
  stage: 'arrowRight',
  document: 'file',
  message: 'mail',
  risk: 'alert',
  system: 'clock',
};

/**
 * @param {object} props
 * @param {import('../lib/api.js').TimelineEvent[]} props.events
 * @returns {HTMLElement}
 */
export function Timeline({ events }) {
  if (events.length === 0) {
    return EmptyState({
      icon: 'clock',
      title: 'Nothing yet',
      body: 'Activity on this transaction will appear here as it happens.',
    });
  }

  return el(
    'ol',
    { class: 'timeline' },
    ...events.map((event) =>
      el(
        'li',
        { class: `timeline__item timeline__item--${event.kind}` },
        el('span', { class: 'timeline__marker', 'aria-hidden': 'true' }, Icon({ name: KIND_ICON[event.kind] ?? 'clock', size: 12 })),
        el(
          'div',
          { class: 'timeline__content' },
          el('span', { class: 'timeline__label' }, event.label),
          el('time', { class: 'timeline__time', datetime: event.at, title: datetime(event.at) }, relativeDay(event.at.slice(0, 10))),
        ),
      ),
    ),
  );
}
