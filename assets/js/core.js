/* Moteur commun : défilement fluide, en-tête, menu, transitions, curseur,
   révélations, parallaxe, givre, neige, aurore. */
import { Lenis } from '../vendor/lenis/lenis.js';
import { initSnow } from './fx/snow.js';
import { initFrost } from './fx/frost.js';

const { gsap, ScrollTrigger, SplitText } = window;
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const calm = document.documentElement.classList.contains('is-calm');
export const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const safe = (fn, fb = null) => { try { return fn(); } catch (e) { return fb; } };
export const store = {
  get: (k) => safe(() => localStorage.getItem(k)), set: (k, v) => safe(() => localStorage.setItem(k, v)),
  sget: (k) => safe(() => sessionStorage.getItem(k)), sset: (k, v) => safe(() => sessionStorage.setItem(k, v)), sdel: (k) => safe(() => sessionStorage.removeItem(k)),
};
const bound = new WeakSet();
/* Chemins comparables : /chiens, /chiens.html et /chiens/ désignent la même page ; / et /index.html aussi */
export const pageKey = (path) => (path.replace(/\/index(\.html)?$/, '/').replace(/\.html$/, '').replace(/(.)\/$/, '$1') || '/');
const cleanHost = /(^|\.)vercel\.app$/.test(location.hostname) || (location.pathname.length > 1 && !/(\.html|\/)$/.test(location.pathname));
const navHref = (url) => {
  if (!cleanHost || !/\.html$/.test(url.pathname)) return url.href;
  const u = new URL(url.href); u.pathname = pageKey(u.pathname); return u.href;
};
const once = (el) => (bound.has(el) ? false : (bound.add(el), true));
export const focusTarget = (el) => {
  if (!el) return;
  if (!el.matches('a[href], button, input, select, textarea, [tabindex]')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
};

export async function initCore() {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  gsap.config({ nullTargetWarn: false });
  const core = { calm, fine, lenis: null, aurora: null, frost: null, fromTransition: false };

  /* Mode calme : on recharge la page et on revient à la même section */
  const sections = () => $$('main > section, main > .marquee, main > .pin-spacer > section');
  $$('[data-calm-toggle]').forEach((b) => {
    b.setAttribute('aria-pressed', String(calm));
    b.addEventListener('click', () => {
      store.set('ptits-loups-calme', calm ? '0' : '1');
      const list = sections(); let idx = 0;
      list.forEach((sec, i) => { if (sec.getBoundingClientRect().top <= 120) idx = i; });
      store.sset('ptits-loups-section', String(idx));
      location.reload();
    });
  });
  core.restoreSection = () => {
    const v = store.sget('ptits-loups-section');
    if (v == null) return false;
    store.sdel('ptits-loups-section');
    const sec = sections()[+v];
    if (sec && +v > 0) { window.scrollTo(0, sec.getBoundingClientRect().top + window.scrollY); core.lenis?.scrollTo(window.scrollY, { immediate: true }); }
    return true;
  };

  /* Défilement fluide */
  if (!calm) {
    core.lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true, autoRaf: false });
    core.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => core.lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  core.scrollTo = (target, offset = -80) => {
    const el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    if (core.lenis) core.lenis.scrollTo(el, { offset, duration: 1.4 });
    else window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'auto' });
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (pageKey(url.pathname) !== pageKey(location.pathname) || !url.hash || url.hash.length < 2) return;
    const t = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!t) return;
    e.preventDefault();
    closeMenu();
    core.scrollTo(t);
    focusTarget(t);
    history.replaceState(null, '', url.hash);
  });

  /* En-tête */
  const header = $('[data-header]');
  let lastY = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 30);
    const d = y - lastY;
    if (d > 3 && y > 320 && !document.body.classList.contains('menu-open')) header.classList.add('is-hidden');
    else if (d < -3 || y < 120) header.classList.remove('is-hidden');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  let lightCount = 0;
  $$('[data-tone="light"]').forEach((sec) => ScrollTrigger.create({
    trigger: sec, start: 'top top+=40', end: 'bottom top+=40',
    onToggle: (self) => { lightCount += self.isActive ? 1 : -1; header.classList.toggle('on-light', lightCount > 0); },
  }));

  /* Menu (téléphone) */
  const burger = $('[data-burger]'), menu = $('[data-menu]');
  function openMenu() {
    document.body.classList.add('menu-open'); burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Fermer le menu');
    menu.setAttribute('aria-hidden', 'false'); header.classList.remove('is-hidden'); core.lenis?.stop(); core.aurora?.useMenu(true);
    $$('main, footer, .actionbar').forEach((el) => { el.inert = true; });
    if (!calm) gsap.fromTo($$('.menu__links a', menu), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.8, ease: 'expo.out', delay: 0.15 });
    setTimeout(() => $('.menu__links a', menu)?.focus({ preventScroll: true }), calm ? 0 : 350);
  }
  function closeMenu() {
    if (!document.body.classList.contains('menu-open')) return;
    document.body.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Ouvrir le menu');
    menu.setAttribute('aria-hidden', 'true'); core.lenis?.start(); core.aurora?.useMenu(false);
    $$('main, footer, .actionbar').forEach((el) => { el.inert = false; });
    if (menu.contains(document.activeElement)) burger.focus({ preventScroll: true });
  }
  burger?.addEventListener('click', () => (document.body.classList.contains('menu-open') ? closeMenu() : openMenu()));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  core.closeMenu = closeMenu;

  /* Transitions de page : rideau de givre */
  const curtain = $('[data-curtain]'), panel = $('.curtain__panel', curtain), clogo = $('.curtain__logo', curtain);
  if (!calm) $('.curtain__frost', curtain).style.backgroundImage = `url(${new URL('../img/grok/commun-texture-givre-1x1.webp', import.meta.url)})`;
  if (!calm && (store.sget('ptits-loups-transition') === '1' || document.documentElement.classList.contains('from-transition'))) {
    store.sdel('ptits-loups-transition');
    core.fromTransition = true;
    gsap.set(curtain, { visibility: 'visible' }); gsap.set(panel, { yPercent: 0 }); gsap.set(clogo, { opacity: 1 });
  }
  core.curtainOut = () => {
    if (!core.fromTransition) return Promise.resolve();
    return new Promise((res) => gsap.timeline({ onComplete: () => { gsap.set(curtain, { visibility: 'hidden' }); document.documentElement.classList.remove('from-transition'); res(); } })
      .to(clogo, { opacity: 0, duration: 0.25 })
      .to(panel, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, 0.05));
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || calm || e.defaultPrevented || a.target === '_blank' || a.hasAttribute('download') || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !/^https?:$/.test(url.protocol)) return;
    if (pageKey(url.pathname) === pageKey(location.pathname)) return;
    e.preventDefault();
    const dest = navHref(url);
    $$('dialog[open]').forEach((d) => d.close());
    closeMenu();
    store.sset('ptits-loups-transition', '1');
    gsap.timeline()
      .set(curtain, { visibility: 'visible' })
      .fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: 0.75, ease: 'expo.inOut' })
      .to(clogo, { opacity: 1, duration: 0.25 }, '-=.2')
      .add(() => { location.href = dest; });
  });
  window.addEventListener('pageshow', (e) => { if (e.persisted) { store.sdel('ptits-loups-transition'); gsap.set(curtain, { visibility: 'hidden' }); gsap.set(panel, { yPercent: 100 }); gsap.set(clogo, { opacity: 0 }); } });

  /* Curseur */
  const cursor = $('[data-cursor]');
  if (fine && !calm && cursor) {
    document.documentElement.classList.add('has-cursor');
    const ring = $('.cursor__ring', cursor), dot = $('.cursor__dot', cursor);
    const rx = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
    const dx = gsap.quickTo(dot, 'x', { duration: 0.1 }), dy = gsap.quickTo(dot, 'y', { duration: 0.1 });
    window.addEventListener('pointermove', (e) => { rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY); cursor.style.opacity = 1; }, { passive: true });
    document.addEventListener('pointerleave', () => { cursor.style.opacity = 0; });
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      const wipe = !!t.closest('[data-frost]') && !calm;
      cursor.classList.toggle('is-wipe', wipe && !t.closest('a, button'));
      cursor.classList.toggle('is-link', !!t.closest('a, button, summary, .choice, [data-cursor-link]') && !cursor.classList.contains('is-wipe'));
    });
  } else if (cursor) cursor.remove();

  /* Copier */
  document.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-copy]');
    if (!b) return;
    const txt = b.dataset.copy;
    const label = b.lastChild;
    if (!b.dataset.label) b.dataset.label = label.textContent;
    const done = () => { b.classList.add('ok'); label.textContent = 'Copié'; clearTimeout(b._t); b._t = setTimeout(() => { b.classList.remove('ok'); label.textContent = b.dataset.label; }, 1800); };
    try { await navigator.clipboard.writeText(txt); done(); } catch (err) {
      const r = document.createRange(); const target = b.previousElementSibling || b; r.selectNodeContents(target);
      const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    }
  });

  /* Dates */
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  $$('[data-years]').forEach((el) => { const n = new Date().getFullYear() - 2020; el.textContent = n; el.dataset.count = n; });

  /* Ambiance */
  core.aurora = null;
  core.loadAurora = () => import('./fx/aurora.js').then(({ initAurora }) => {
    core.aurora = initAurora({ calm });
    core.aurora?.setIntensity(1, calm ? 0 : 2.4);
    if (document.body.classList.contains('menu-open')) core.aurora?.useMenu(true);
  }).catch(() => {});
  if (!calm) { const c = $('[data-snow]'); if (c) initSnow(c); } else $('[data-snow]')?.remove();
  core.frost = calm ? null : await initFrost();

  core.bind = (root = document) => bind(root, core);
  core.heroIn = () => heroIn(core);
  core.afterPage = () => afterPage(core);
  return core;
}

/* ---------------- Révélations et interactions ---------------- */
function bind(root, core) {
  // Givre
  if (core.frost) $$('[data-frost]', root).forEach((el) => once(el) && core.frost.add(el));
  // Boutons magnétiques
  if (fine && !calm) $$('[data-magnetic]', root).forEach((el) => {
    if (!once(el)) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'elastic.out(1, .45)' }), yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'elastic.out(1, .45)' });
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.28); yTo((e.clientY - r.top - r.height / 2) * 0.38); });
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
  });
  // Cartes inclinables
  if (fine && !calm) $$('[data-tilt]', root).forEach((el) => {
    if (!once(el)) return;
    gsap.set(el, { transformPerspective: 1000 });
    const rx = gsap.quickTo(el, 'rotationX', { duration: 0.9, ease: 'power3' }), ry = gsap.quickTo(el, 'rotationY', { duration: 0.9, ease: 'power3' });
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 12); rx(-((e.clientY - r.top) / r.height - 0.5) * 9); });
    el.addEventListener('pointerleave', () => { rx(0); ry(0); });
  });
  // Cristaux et classes d'entrée
  $$('[data-reveal], .tests, .badges, .texp, .pledge, .season-card, .marquee, .rule, .legal', root).forEach((el) => {
    if (el.dataset.inBound) return; el.dataset.inBound = '1';
    if (calm) { el.classList.add('is-in'); return; }
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => el.classList.add('is-in') });
  });
  if (calm) return;
  // Apparitions
  $$('[data-reveal]', root).forEach((el) => {
    if (el.dataset.revBound) return; el.dataset.revBound = '1';
    gsap.from(el, { y: 48, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } });
  });
  // Titres découpés en lignes
  $$('[data-split]', root).forEach((el) => {
    if (el.dataset.splitBound) return; el.dataset.splitBound = '1';
    SplitText.create(el, {
      type: 'lines', mask: 'lines', autoSplit: true, linesClass: 'split-line',
      onSplit: (self) => gsap.from(self.lines, { yPercent: 105, duration: 1.25, stagger: 0.09, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }),
    });
  });
  // Grande phrase : les mots s'éclairent au défilement
  $$('[data-statement]', root).forEach((el) => {
    if (el.dataset.stBound) return; el.dataset.stBound = '1';
    SplitText.create(el, {
      type: 'words', autoSplit: true,
      onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 48%', scrub: true } }),
    });
  });
  // Parallaxe des fonds
  $$('[data-parallax-bg]', root).forEach((bg) => {
    if (bg.dataset.pxBound) return; bg.dataset.pxBound = '1';
    const img = $('img', bg); const sec = bg.parentElement;
    const isTop = sec.getBoundingClientRect().top + window.scrollY < 10;
    gsap.fromTo(img, { yPercent: isTop ? 0 : -9 }, { yPercent: isTop ? 12 : 3, ease: 'none', scrollTrigger: { trigger: sec, start: isTop ? 'top top' : 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('[data-parallax-img]', root).forEach((fig) => {
    if (fig.dataset.piBound) return; fig.dataset.piBound = '1';
    const img = $('img', fig);
    gsap.fromTo(img, { scale: 1.16, yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  // Compteurs
  $$('[data-count]', root).forEach((el) => {
    if (el.dataset.cBound) return; el.dataset.cBound = '1';
    const end = +el.dataset.count; const o = { v: 0 };
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: end, duration: 1.8, ease: 'expo.out', onUpdate: () => { el.firstChild.textContent = Math.round(o.v); } }) });
    el.firstChild.textContent = '0';
  });
  // Bandeau défilant (vitesse liée au défilement)
  $$('[data-marquee]', root).forEach((m) => {
    if (m.dataset.mBound) return; m.dataset.mBound = '1';
    const inner = $('.marquee__inner', m);
    const tw = gsap.to(inner, { xPercent: -50, duration: 38, ease: 'none', repeat: -1 });
    ScrollTrigger.create({ trigger: m, start: 'top bottom', end: 'bottom top', onUpdate: (self) => {
      const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 260);
      gsap.to(tw, { timeScale: (self.direction < 0 ? -1 : 1) * (1 + Math.abs(v)), duration: 0.4, overwrite: true });
    } });
  });
  // Géant du pied de page
  $$('[data-giant]', root).forEach((el) => {
    if (el.dataset.gBound) return; el.dataset.gBound = '1';
    SplitText.create(el, { type: 'chars', onSplit: (self) => gsap.from(self.chars, { yPercent: 70, opacity: 0, stagger: 0.035, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 98%', once: true } }) });
  });
}

function heroIn(core) {
  const title = $('[data-hero-title]');
  const fades = $$('[data-hero-fade]');
  const header = $('[data-header]');
  if (calm) return;
  const tl = gsap.timeline();
  if (title) {
    gsap.set(title, { opacity: 1 });
    const split = SplitText.create(title, { type: 'words,chars', charsClass: 'ch' });
    tl.from(split.chars, { yPercent: 118, rotate: 6, duration: 1.35, stagger: 0.026, ease: 'expo.out' }, 0);
  }
  if (fades.length) tl.fromTo(fades, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.09, ease: 'expo.out', clearProps: 'transform' }, 0.35);
  tl.from($('.header__inner', header), { y: -40, opacity: 0, duration: 1.1, ease: 'expo.out', clearProps: 'transform,opacity' }, 0.2);
  const media = $$('.phero__media, .phero__duo .duo-card');
  if (media.length) tl.fromTo(media, { y: 70, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, stagger: 0.12, ease: 'expo.out', clearProps: 'transform' }, 0.25);
  return tl;
}

async function afterPage(core) {
  core.bind(document);
  // Images chargées tardivement : recalcul des positions
  await (document.fonts?.ready || Promise.resolve());
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  if (core.restoreSection()) return;
  const id = decodeURIComponent(location.hash.slice(1));
  const target = id && /^[\w-]+$/.test(id) ? document.getElementById(id) : null;
  if (target && target.tagName !== 'MAIN') {
    window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY - 90);
    core.lenis?.scrollTo(window.scrollY, { immediate: true });
  }
}
