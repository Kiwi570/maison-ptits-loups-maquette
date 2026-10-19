/* Accueil : ouverture « le regard dans la nuit », meute, portées, mosaïque. */
import { CHIENS, portesTriees } from '../data.js';
import { dogCard, seasonCard, litterChips } from '../render.js';
import { animateMoon, startCountdown } from '../fx/moon.js';
import { $, $$, store } from '../core.js';

const { gsap, ScrollTrigger, SplitText } = window;
const EYES = [[0.313, 0.453], [0.505, 0.444]]; // position des yeux dans la photo (fractions)

export default async function home(core) {
  const { calm } = core;
  // Données
  $$('[data-litter-chips]').forEach((el) => { el.innerHTML = litterChips(); });
  const g = portesTriees();
  const season = $('[data-season]');
  season.innerHTML = [...g.disponible, ...g['a-venir']].map(seasonCard).join('') || '<p class="lead">Nouvelles portées très bientôt.</p>';
  season.querySelectorAll('[data-countdown-target]').forEach((card) => {
    const iso = card.dataset.countdownTarget;
    animateMoon($('.moon', card), iso, calm);
    startCountdown(card, iso);
  });
  const track = $('[data-pack-track]');
  track.innerHTML = CHIENS.map((c) => dogCard(c, { href: `chiens.html#${c.id}` })).join('');
  $$('[data-dog-count]').forEach((el) => { el.textContent = CHIENS.length; el.dataset.count = CHIENS.length; });
  $('[data-pack-count]').textContent = `01 / ${String(CHIENS.length).padStart(2, '0')}`;

  // l'épinglage doit exister avant les autres déclencheurs (sinon ils se calculent trop tôt)
  if (!calm) {
    pack(track, core);
    mosaic();
    quote();
  } else {
    track.style.overflowX = 'auto';
  }
  core.bind(document);
  return () => intro(core);
}

/* La meute défile à l'horizontale, le fond prend la teinte du chien affiché */
function pack(track, core) {
  const section = $('[data-pack]');
  const count = $('[data-pack-count]'), bar = $('[data-pack-progress]');
  const cards = $$('.dog', track);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: {
        trigger: section, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: (self) => {
          const i = Math.min(cards.length - 1, Math.round(self.progress * (cards.length - 1)));
          count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
          gsap.set(bar, { scaleX: self.progress });
          section.style.backgroundColor = CHIENS[i].teinte;
        },
        onLeave: () => { section.style.backgroundColor = ''; }, onLeaveBack: () => { section.style.backgroundColor = ''; },
      },
    });
    cards.forEach((c, i) => gsap.from($('.dog__meta', c), { y: 30, opacity: 0, duration: 0.8, ease: 'expo.out', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left 85%', once: true } }));
    // clavier : la carte qui reçoit le focus est amenée à l'écran
    const onFocus = (e) => {
      const card = e.target.closest('.dog');
      const st = tween.scrollTrigger;
      if (!card || !st) return;
      const d = dist();
      const p = d ? Math.min(1, Math.max(0, (card.offsetLeft - window.innerWidth * 0.3) / d)) : 0;
      window.scrollTo(0, st.start + (st.end - st.start) * p);
      core.lenis?.scrollTo(window.scrollY, { immediate: true });
      requestAnimationFrame(() => { section.scrollLeft = 0; });
    };
    track.addEventListener('focusin', onFocus);
    return () => { section.style.backgroundColor = ''; track.removeEventListener('focusin', onFocus); };
  });
  mm.add('(max-width: 900px)', () => {
    track.style.overflowX = 'auto'; track.style.scrollSnapType = 'x mandatory';
    cards.forEach((c) => { c.style.scrollSnapAlign = 'center'; });
    const onS = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      const i = Math.round(p * (cards.length - 1));
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
      gsap.set(bar, { scaleX: p });
    };
    track.addEventListener('scroll', onS, { passive: true });
    return () => {
      track.removeEventListener('scroll', onS);
      track.style.overflowX = ''; track.style.scrollSnapType = ''; track.scrollLeft = 0;
      cards.forEach((c) => { c.style.scrollSnapAlign = ''; });
    };
  });
}

function mosaic() {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 641px)', () => {
    $$('.mosaic__col').forEach((col) => {
      const s = parseFloat(col.dataset.speed || 0);
      gsap.fromTo(col, { y: () => -s * window.innerHeight }, { y: () => s * window.innerHeight, ease: 'none', scrollTrigger: { trigger: '[data-mosaic]', start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
  });
}

function quote() {
  const q = $('[data-quote]');
  if (!q) return;
  SplitText.create(q, {
    type: 'words', autoSplit: true,
    onSplit: (self) => gsap.from(self.words, { opacity: 0.08, y: 24, filter: 'blur(8px)', stagger: 0.06, ease: 'none', scrollTrigger: { trigger: q, start: 'top 80%', end: 'bottom 55%', scrub: true } }),
  });
}

/* Ouverture : deux yeux bleus s'allument dans la nuit, clignent, puis la scène apparaît depuis le regard */
function intro(core) {
  const el = $('[data-intro]');
  const html = document.documentElement;
  const skip = core.calm || core.fromTransition || !html.classList.contains('play-intro') || !el;
  if (skip) {
    el?.remove();
    html.classList.remove('play-intro');
    core.curtainOut().then(() => core.heroIn());
    return;
  }
  store.sset('ptits-loups-intro', '1');
  core.lenis?.stop();
  const portrait = $('[data-hero-portrait]'), img = $('img', portrait);
  const r = portrait.getBoundingClientRect();
  const iw = img.naturalWidth || 4000, ih = img.naturalHeight || 3000;
  const s = Math.max(r.width / iw, r.height / ih), rw = iw * s, rh = ih * s;
  const ox = (r.width - rw) * 0.4, oy = (r.height - rh) * 0.45;
  const pts = EYES.map(([fx, fy]) => [r.left + ox + fx * rw, r.top + oy + fy * rh]);
  const eyes = $$('[data-eye]', el);
  const gap = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]);
  const size = gsap.utils.clamp(10, 26, gap * 0.22);
  eyes.forEach((e, i) => gsap.set(e, { left: pts[i][0], top: pts[i][1], width: size, height: size * 0.62, marginLeft: -size / 2, marginTop: -size * 0.31 }));
  const mx = (pts[0][0] + pts[1][0]) / 2, my = (pts[0][1] + pts[1][1]) / 2;
  const R = Math.hypot(Math.max(mx, innerWidth - mx), Math.max(my, innerHeight - my)) + 120;
  const st = { r: 0 };
  const setMask = () => { const m = `radial-gradient(circle at ${mx}px ${my}px, transparent ${st.r}px, #000 ${st.r + 140}px)`; el.style.webkitMaskImage = m; el.style.maskImage = m; };
  let heroStarted = false;
  const startHero = () => { if (heroStarted) return; heroStarted = true; core.heroIn(); };
  const tl = gsap.timeline({ onComplete: () => { el.remove(); html.classList.remove('play-intro'); core.lenis?.start(); startHero(); } });
  tl.to(eyes, { opacity: 1, duration: 0.55, stagger: 0.07, ease: 'power2.out' }, 0.2)
    .to(eyes, { scaleY: 0.06, duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0.95)
    .to(eyes, { scale: 1.35, duration: 0.5, ease: 'power2.out' }, 1.15)
    .to(st, { r: R, duration: 1.15, ease: 'power3.in', onUpdate: setMask }, 1.2)
    .to(eyes, { opacity: 0, duration: 0.45 }, 1.6)
    .add(startHero, 1.08);
  $('[data-intro-skip]', el)?.addEventListener('click', () => tl.progress(1));
}
