/**
 * main.js — the entry point, and deliberately the shortest file here.
 *
 * Four jobs, in order:
 *   1. load the data
 *   2. build the shell
 *   3. register the routes
 *   4. start the router
 *
 * Nothing else belongs in here. Every time an entry point grows a helper
 * function it becomes the file nobody can find anything in.
 */

import * as api from './lib/api.js';
import { start } from './lib/router.js';
import { AppShell } from './components/AppShell.js';
import { toast } from './components/Toast.js';
import { confirm } from './components/Modal.js';
import { DashboardView } from './views/DashboardView.js';
import { ContactsView } from './views/ContactsView.js';
import { TasksView } from './views/TasksView.js';
import { openDealForm } from './views/DealForm.js';
import { openDealDrawer } from './views/DealDrawer.js';
import { openContactForm } from './views/ContactForm.js';
import { openTaskForm } from './views/TaskForm.js';

/**
 * Routes, and the primary action each one offers.
 *
 * The action lives on the route rather than in the shell because the shell
 * should not have to know what any given screen is for. Add a route, give it
 * an action, and the top bar updates itself — nothing in AppShell changes.
 *
 * `searchLabel` does the same job for the search affordance: "Search contacts"
 * on the contacts screen, not a permanent "Search transactions" that is wrong
 * on two screens out of three.
 *
 * @type {import('./lib/router.js').Route[]}
 */
const ROUTES = [
  {
    path: '/',
    label: 'Dashboard',
    icon: 'dashboard',
    view: DashboardView,
    action: {
      label: 'New transaction',
      icon: 'plus',
      onClick: () => openDealForm({ onSaved: (deal) => openDealDrawer(deal.id) }),
    },
  },
  {
    path: '/contacts',
    label: 'Contacts',
    icon: 'contacts',
    view: ContactsView,
    searchLabel: 'Search contacts',
    action: { label: 'New contact', icon: 'plus', onClick: () => openContactForm() },
  },
  {
    path: '/tasks',
    label: 'Tasks',
    icon: 'tasks',
    view: TasksView,
    searchLabel: 'Search tasks',
    action: { label: 'New task', icon: 'plus', onClick: () => openTaskForm() },
  },
];

async function boot() {
  const mount = document.getElementById('app');

  try {
    await api.init();
  } catch (error) {
    // The overwhelmingly likely cause is the app being opened as a file:// URL,
    // where fetch() refuses to load seed.json and the browser's own error says
    // nothing useful. Name the real fix rather than showing a stack trace.
    console.error(error);
    mount.replaceChildren(bootError());
    return;
  }

  const agent = await api.getAgent();

  const { root, outlet } = AppShell({
    routes: ROUTES,
    agent,
    onResetData: async () => {
      const ok = await confirm({
        title: 'Reset demo data?',
        body: 'Every change you have made is discarded and the original sample transactions come back.',
        confirmLabel: 'Reset',
        destructive: true,
      });
      if (!ok) return;

      await api.resetDemoData();
      toast('Demo data reset');
    },
  });

  mount.replaceChildren(root);
  start({ routes: ROUTES, outlet });
}

/** @returns {HTMLElement} */
function bootError() {
  const node = document.createElement('div');
  node.className = 'boot-error';
  node.innerHTML = `
    <h1>This app needs to be served, not opened</h1>
    <p>
      It loads its data with <code>fetch()</code>, and browsers block
      <code>fetch()</code> on <code>file://</code> URLs for security reasons.
      Opening <code>index.html</code> by double-clicking will always fail here.
    </p>
    <p>Run a local server from this folder instead:</p>
    <pre><code>python3 -m http.server 8000</code></pre>
    <p>Then open <a href="http://localhost:8000">http://localhost:8000</a>.</p>
  `;
  return node;
}

boot();
