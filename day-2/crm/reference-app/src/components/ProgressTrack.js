/**
 * ProgressTrack — where a transaction is in its lifecycle.
 *
 * The single most useful thing on the drawer, and the direct answer to JTBD P3:
 * "know where every deal stands without chasing". A stage pill tells you the
 * name of the current step; a track tells you how far through you are and what
 * is next, which is the actual question.
 *
 * A deal that fell through gets no track at all. Rendering a half-complete
 * progress bar for a dead deal implies it might still move.
 */

import { el, cx } from '../lib/dom.js';
import { PIPELINE_STAGES } from '../lib/domain.js';
import { Icon } from './Icon.js';

/**
 * @param {object} props
 * @param {import('../lib/domain.js').StageId} props.current
 * @param {(stage: import('../lib/domain.js').StageId) => void} [props.onSelect]
 * @returns {HTMLElement | null}
 */
export function ProgressTrack({ current, onSelect }) {
  if (current === 'fell-through') {
    return el(
      'div',
      { class: 'track track--terminated' },
      Icon({ name: 'alert', size: 15 }),
      el('span', {}, 'Transaction terminated before closing.'),
    );
  }

  const currentIndex = PIPELINE_STAGES.findIndex((stage) => stage.id === current);

  return el(
    'ol',
    { class: 'track', 'aria-label': 'Transaction progress' },
    ...PIPELINE_STAGES.map((stage, index) => {
      const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo';

      return el(
        'li',
        { class: cx('track__step', `track__step--${state}`) },
        el(
          onSelect ? 'button' : 'span',
          {
            class: 'track__hit',
            title: onSelect ? `Move to ${stage.label}` : stage.description,
            'aria-current': state === 'current' ? 'step' : null,
            onClick: onSelect ? () => onSelect(stage.id) : null,
          },
          el(
            'span',
            { class: 'track__marker', 'aria-hidden': 'true' },
            state === 'done' ? Icon({ name: 'check', size: 11 }) : null,
          ),
          el('span', { class: 'track__label' }, stage.label),
        ),
      );
    }),
  );
}
