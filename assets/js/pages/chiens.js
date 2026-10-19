/* Nos chiens : grille filtrable, fiche détaillée, échelle des hanches. */
import { CHIENS, chien } from '../data.js';
import { dogCard, dogSheet, hdScale, todo, img } from '../render.js';
import { $, $$ } from '../core.js';

const { gsap, ScrollTrigger } = window;

export default async function chiens(core) {
  const grid = $('[data-dogs-grid]');
  grid.innerHTML = CHIENS.map((c) => dogCard(c)).join('');
  $$('.dog', grid).forEach((c) => c.setAttribute('data-reveal', ''));

  // Échelle HD
  $('[data-hd-scale]').innerHTML = CHIENS.map((c) => {
    const hd = c.tests.find((t) => t.code === 'HD');
    return `<div class="scale__dog" data-reveal><span><b>${c.nom}</b></span>${hd ? hdScale(hd.valeur) : `<span>${todo('Hanches : résultat à compléter')}</span>`}</div>`;
  }).join('');

  // Filtres
  const buttons = $$('[data-filter]');
  const apply = (f, animate = true) => {
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === f)));
    const cards = $$('.dog', grid);
    const show = cards.filter((c) => f === 'tous' || c.dataset.sex === f);
    const hide = cards.filter((c) => !show.includes(c));
    if (!animate || core.calm) { hide.forEach((c) => { c.hidden = true; }); show.forEach((c) => { c.hidden = false; }); ScrollTrigger.refresh(); return; }
    gsap.timeline()
      .to(cards, { opacity: 0, y: 20, duration: 0.25, ease: 'power2.in' })
      .add(() => { hide.forEach((c) => { c.hidden = true; }); show.forEach((c) => { c.hidden = false; }); ScrollTrigger.refresh(); })
      .fromTo(show, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.07, ease: 'expo.out' });
  };
  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
  $$('[data-filter-link]').forEach((a) => a.addEventListener('click', () => apply(a.dataset.filterLink, false)));

  // Fiche (dialogue)
  const sheet = $('[data-sheet]'), content = $('[data-sheet-content]');
  let lastFocus = null;
  const open = (id) => {
    const c = chien(id);
    if (!c) return;
    lastFocus = document.activeElement;
    content.innerHTML = dogSheet(c);
    sheet.showModal();
    core.lenis?.stop();
    sheet.querySelectorAll('.tests').forEach((t) => requestAnimationFrame(() => t.classList.add('is-in')));
    history.replaceState(null, '', `#${id}`);
    $$('[data-thumb]', sheet).forEach((b) => b.addEventListener('click', () => {
      const media = $('[data-sheet-media]', sheet);
      const im = $('img', media);
      const swap = () => { im.outerHTML = img(b.dataset.thumb, im.alt, '(max-width: 900px) 100vw, 50vw', c.position, true); $$('[data-thumb]', sheet).forEach((x) => x.setAttribute('aria-current', String(x === b))); };
      if (core.calm) return swap();
      gsap.to(im, { opacity: 0, duration: 0.2, onComplete: () => { swap(); gsap.from($('img', media), { opacity: 0, scale: 1.05, duration: 0.6, ease: 'expo.out' }); } });
    }));
  };
  const close = () => { if (sheet.open) sheet.close(); };
  sheet.addEventListener('close', () => { core.lenis?.start(); history.replaceState(null, '', location.pathname); lastFocus?.focus?.(); });
  sheet.addEventListener('click', (e) => { if (e.target === sheet || e.target.closest('[data-sheet-close]')) close(); });
  grid.addEventListener('click', (e) => { const b = e.target.closest('[data-dog]'); if (b) open(b.dataset.dog); });

  core.bind(document);
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash && chien(hash)) setTimeout(() => open(hash), core.calm ? 0 : 900);
}
