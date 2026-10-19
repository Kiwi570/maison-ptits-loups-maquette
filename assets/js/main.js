import { initCore } from './core.js';

const pages = {
  home: () => import('./pages/home.js'),
  chiens: () => import('./pages/chiens.js'),
  portees: () => import('./pages/portees.js'),
  adopter: () => import('./pages/adopter.js'),
  contact: () => import('./pages/contact.js'),
};

(async () => {
  if (!window.gsap) { document.documentElement.classList.add('is-calm'); return; }
  const core = await initCore();
  const key = document.body.dataset.page;
  let entry = null;
  if (pages[key]) {
    const mod = await pages[key]();
    entry = await mod.default(core);
  }
  await core.afterPage();
  if (typeof entry === 'function') entry();
  else { await core.curtainOut(); core.heroIn(); }
})();
