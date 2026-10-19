/* Portées & chiots : portées triées automatiquement, lune, compte à rebours, constellation. */
import { portesTriees } from '../data.js';
import { litterBlock, litterChips, esc } from '../render.js';
import { animateMoon, startCountdown } from '../fx/moon.js';
import { initConstellation } from '../fx/constellation.js';
import { $, $$ } from '../core.js';

const { gsap, ScrollTrigger } = window;
const TITRES = { 'a-venir': 'À venir', disponible: 'Disponibles', passee: 'Passées' };

export default async function portees(core) {
  $$('[data-litter-chips]').forEach((el) => { el.innerHTML = litterChips(); });
  const g = portesTriees();
  const host = $('[data-litters]');
  const order = ['disponible', 'a-venir', 'passee'];
  host.innerHTML = order.map((k) => `<div class="litter-group" data-group="${k}" style="margin-bottom:clamp(80px,10vw,140px)">
      <p class="label eyebrow" style="margin-bottom:36px">${TITRES[k]} · ${g[k].length}</p>
      ${g[k].length ? g[k].map(litterBlock).join('') : `<div class="empty"><b style="color:var(--glacier)">${k === 'passee' ? 'Les portées passées apparaîtront ici automatiquement.' : 'Aucune portée pour le moment.'}</b><span>${k === 'passee' ? 'Historique des portées précédentes : à compléter.' : 'Revenez bientôt ou suivez-nous sur les réseaux.'}</span></div>`}
    </div>`).join('');
  $$('.litter', host).forEach((l) => { $('.litter__body', l).setAttribute('data-reveal', ''); });
  host.querySelectorAll('[data-countdown-target]').forEach((el) => {
    const iso = el.dataset.countdownTarget;
    if (!iso) return;
    animateMoon($('.moon', el), iso, core.calm);
    startCountdown(el, iso);
  });

  // Filtres
  const btns = $$('[data-lfilter]');
  btns.forEach((b) => b.addEventListener('click', () => {
    const f = b.dataset.lfilter;
    btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $$('[data-group]', host).forEach((grp) => { grp.hidden = !(f === 'tous' || grp.dataset.group === f); });
    if (!core.calm) gsap.fromTo($$('[data-group]:not([hidden])', host), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
    ScrollTrigger.refresh();
  }));

  // Affiches en grand
  const sheet = $('[data-sheet]'), content = $('[data-sheet-content]');
  host.addEventListener('click', (e) => {
    const b = e.target.closest('[data-poster]');
    if (!b) return;
    const n = b.dataset.poster;
    content.innerHTML = `<button class="sheet__close" type="button" data-sheet-close aria-label="Fermer"><svg><use href="#i-close"></use></svg></button>
      <div style="padding:clamp(16px,3vw,32px);display:grid;gap:14px;justify-items:center;max-height:calc(100dvh - 24px);overflow:auto">
        <h2 class="h3" id="sheet-title">${esc(b.dataset.posterAlt)}</h2>
        <img src="assets/img/photos/${n}-1920.webp" alt="${esc(b.dataset.posterAlt)}" style="border-radius:12px;max-height:78dvh;width:auto">
      </div>`;
    sheet.showModal(); core.lenis?.stop();
  });
  sheet.addEventListener('close', () => core.lenis?.start());
  sheet.addEventListener('click', (e) => { if (e.target === sheet || e.target.closest('[data-sheet-close]')) sheet.close(); });

  initConstellation($('[data-sky]'), { calm: core.calm });
  core.bind(document);

}
