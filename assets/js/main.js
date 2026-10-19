import { initCore } from './core.js';

const pages = {
  home: () => import('./pages/home.js'),
  chiens: () => import('./pages/chiens.js'),
  portees: () => import('./pages/portees.js'),
  adopter: () => import('./pages/adopter.js'),
  contact: () => import('./pages/contact.js'),
};
const html = document.documentElement;

/* Quoi qu'il arrive, la page finit visible : pas d'écran noir ni de rideau bloqué. */
function failsafe() {
  html.classList.remove('play-intro', 'from-transition');
  document.querySelector('[data-intro]')?.remove();
  const c = document.querySelector('[data-curtain]');
  if (c) c.style.visibility = 'hidden';
  document.querySelectorAll('[data-hero-title], [data-hero-fade], .phero__media, .phero__duo .duo-card').forEach((el) => { el.style.opacity = 1; });
}

(async () => {
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) { html.classList.add('is-calm'); failsafe(); return; }
  let core;
  try { core = await initCore(); } catch (e) { console.error(e); failsafe(); return; }
  const key = document.body.dataset.page;
  let entry = null;
  try {
    if (pages[key]) entry = await (await pages[key]()).default(core);
  } catch (e) { console.error(e); }
  try { await core.afterPage(); } catch (e) { console.error(e); }
  try {
    if (typeof entry === 'function') entry();
    else {
      document.querySelector('[data-intro]')?.remove();
      html.classList.remove('play-intro');
      await core.curtainOut();
      core.heroIn();
    }
  } catch (e) { console.error(e); failsafe(); }
  const later = window.requestIdleCallback || ((fn) => setTimeout(fn, 300));
  later(() => core.loadAurora());
})();
