/**
 * router.js — hash routing in forty lines.
 *
 * Hash routes (`#/contacts`) rather than real paths, for one practical reason:
 * they work when the app is served from any directory and deployed to any
 * host, with no server rewrite rules. Real paths need the server to send
 * index.html for every URL, which is one more thing to configure and one more
 * thing to get wrong on deploy day.
 *
 * The cost is a `#` in the URL. Worth it here.
 */

/**
 * @typedef {object} Route
 * @property {string} path            e.g. '/contacts'
 * @property {string} label           nav label, also the breadcrumb
 * @property {string} icon            icon name from components/Icon.js
 * @property {() => HTMLElement} view
 * @property {string} [searchLabel]   label for the top bar's search affordance
 * @property {{label: string, icon?: string, onClick: () => void}} [action]
 *   the screen's primary action, rendered in the top bar
 */

/** @type {Route[]} */
let routes = [];

/** @type {HTMLElement | null} */
let outlet = null;

/** Cleanup for the view currently on screen. */
let teardown = () => {};

/**
 * @param {object} config
 * @param {Route[]} config.routes
 * @param {HTMLElement} config.outlet
 */
export function start(config) {
  routes = config.routes;
  outlet = config.outlet;

  window.addEventListener('hashchange', render);
  render();
}

/**
 * The current path, without its query string.
 *
 * Routes are matched on the path alone, so `#/contacts` and
 * `#/contacts?role=lender` are the same screen. The query is a parameter of
 * the view, not a different view — which lets a view read a preset off the URL
 * without the router needing to know that filters exist.
 *
 * @returns {string} always with a leading slash
 */
export function currentPath() {
  const hash = window.location.hash.slice(1).split('?')[0];
  return hash.startsWith('/') ? hash : '/';
}

/** @param {string} path */
export function navigate(path) {
  window.location.hash = path;
}

/**
 * Listeners that want to know the route changed — the sidebar, so it can move
 * its active state.
 * @type {Set<(path: string) => void>}
 */
const listeners = new Set();

/**
 * @param {(path: string) => void} fn
 * @returns {() => void} unsubscribe
 */
export function onNavigate(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function render() {
  if (!outlet) return;

  const path = currentPath();
  const route = routes.find((item) => item.path === path) ?? routes[0];

  // Let the outgoing view unsubscribe from data changes before it leaves the
  // document. Skip this and every visited view keeps re-rendering forever
  // against a detached DOM node — a slow, silent leak.
  teardown();

  const view = route.view();
  teardown = typeof view.destroy === 'function' ? () => view.destroy() : () => {};

  outlet.replaceChildren(view);
  outlet.scrollTop = 0;

  listeners.forEach((fn) => fn(route.path));
  document.title = `${route.label} · First American`;
}
