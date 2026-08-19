/**
 * AppShell — sidebar, top bar, and the outlet the router renders into.
 *
 * Built once at startup and never rebuilt. Only the outlet's contents change
 * on navigation, which is what keeps the sidebar's scroll position and the
 * search field's focus intact across route changes.
 *
 * The one exception is the top bar's primary action, which swaps on every
 * route change — see `paintAction`. The shell has no opinion about what that
 * action is; each route brings its own.
 */

import { el, cx, replace } from '../lib/dom.js';
import { onNavigate, currentPath } from '../lib/router.js';
import { Icon } from './Icon.js';
import { Avatar } from './Avatar.js';
import { Button } from './Button.js';

/**
 * @param {object} props
 * @param {import('../lib/router.js').Route[]} props.routes
 * @param {import('../lib/api.js').Agent} props.agent
 * @param {() => void} props.onResetData
 * @returns {{root: HTMLElement, outlet: HTMLElement}}
 */
export function AppShell({ routes, agent, onResetData }) {
  const outlet = el('main', { class: 'shell__main', id: 'main', tabindex: '-1' });

  /** @param {string} path */
  function routeFor(path) {
    return routes.find((route) => route.path === path) ?? routes[0];
  }

  const navLinks = routes.map((route) =>
    el(
      'a',
      {
        class: cx('nav__link', route.path === currentPath() && 'is-active'),
        href: `#${route.path}`,
        dataset: { path: route.path },
      },
      Icon({ name: route.icon, size: 17 }),
      el('span', {}, route.label),
    ),
  );

  const sidebar = el(
    'aside',
    { class: 'shell__sidebar' },
    el(
      'a',
      { class: 'brand', href: '#/', 'aria-label': `${agent.brokerage} — home` },
      el('span', { class: 'brand__mark', 'aria-hidden': 'true' }),
      el('span', { class: 'brand__name' }, 'First American'),
    ),

    el('nav', { class: 'nav', 'aria-label': 'Main' }, ...navLinks),

    el(
      'div',
      { class: 'shell__sidebar-footer' },
      // The demo-data reset lives in the chrome rather than a settings page.
      // This app has fake data by definition; hiding the reset two clicks deep
      // would be pretending otherwise.
      el(
        'button',
        { class: 'nav__link nav__link--quiet', onClick: onResetData },
        Icon({ name: 'refresh', size: 16 }),
        el('span', {}, 'Reset demo data'),
      ),
      el(
        'div',
        { class: 'account' },
        Avatar({ name: agent.name, size: 'md' }),
        el(
          'div',
          { class: 'account__text' },
          el('span', { class: 'account__name' }, agent.name),
          el('span', { class: 'account__meta' }, agent.brokerage),
        ),
      ),
    ),
  );

  /* --- Top bar ------------------------------------------------------------ */

  const crumb = el('span', { class: 'shell__crumb-current' });
  const searchHost = el('div', { class: 'shell__search-slot' });
  const actionHost = el('div', { class: 'shell__action-slot' });

  /**
   * Repaint the parts of the top bar that belong to the current screen.
   *
   * Rebuilt rather than mutated: a "New task" button and a "New contact"
   * button differ in label, icon and handler, and swapping three properties on
   * a shared node is more code and more ways to leave one of them stale.
   *
   * @param {string} path
   */
  function paintAction(path) {
    const route = routeFor(path);

    crumb.textContent = route.label;

    replace(
      searchHost,
      route.searchLabel
        ? el(
            'button',
            {
              class: 'shell__search-hint',
              // Focuses the real search input on the current screen. Two search
              // fields on one page is a coin toss about which one filters.
              onClick: () => {
                const input = outlet.querySelector('.toolbar__search-input');
                if (input) input.focus();
              },
            },
            Icon({ name: 'search', size: 14 }),
            el('span', {}, route.searchLabel),
            el('kbd', {}, '/'),
          )
        : null,
    );

    replace(
      actionHost,
      route.action
        ? Button({
            label: route.action.label,
            icon: route.action.icon ?? 'plus',
            variant: 'primary',
            onClick: route.action.onClick,
          })
        : null,
    );
  }

  const topbar = el(
    'header',
    { class: 'shell__topbar' },
    el(
      'button',
      { class: 'shell__menu', 'aria-label': 'Toggle navigation', onClick: () => root.classList.toggle('is-nav-open') },
      Icon({ name: 'tasks', size: 18 }),
    ),
    el(
      'div',
      { class: 'shell__breadcrumb' },
      el('span', { class: 'shell__crumb-root' }, agent.brokerage),
      Icon({ name: 'chevronRight', size: 13, class: 'shell__crumb-sep' }),
      crumb,
    ),
    el('div', { class: 'shell__topbar-actions' }, searchHost, actionHost),
  );

  onNavigate((path) => {
    for (const link of navLinks) link.classList.toggle('is-active', link.dataset.path === path);
    paintAction(path);
    root.classList.remove('is-nav-open');
  });

  const root = el(
    'div',
    { class: 'shell' },
    el('a', { class: 'skip-link', href: '#main' }, 'Skip to content'),
    sidebar,
    el('div', { class: 'shell__backdrop', onClick: () => root.classList.remove('is-nav-open') }),
    el('div', { class: 'shell__content' }, topbar, outlet),
  );

  paintAction(currentPath());

  return { root, outlet };
}
