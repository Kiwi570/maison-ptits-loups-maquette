/* Constellation des unions : chaque reproducteur est une étoile, les portées relient les parents. */
import { CHIENS, PORTEES, chien, statutPortee } from '../data.js';

const LAYOUTS = {
  wide: { vb: [1000, 560], pos: { apache: [150, 150], volverine: [500, 120], abysse: [850, 150], yarna: [290, 390], vixie: [710, 390], zira: [500, 480] } },
  tall: { vb: [600, 860], pos: { apache: [110, 110], volverine: [300, 210], abysse: [490, 110], yarna: [120, 560], vixie: [480, 560], zira: [300, 770] } },
};

export function initConstellation(host, { calm }) {
  const { gsap, ScrollTrigger } = window;
  let layoutKey = null, tl = null;
  const tip = document.createElement('div');
  tip.className = 'sky__tip'; tip.setAttribute('aria-hidden', 'true');
  const render = () => {
    const key = host.clientWidth < 640 ? 'tall' : 'wide';
    if (key === layoutKey) return;
    layoutKey = key;
    gsap.killTweensOf(host.querySelectorAll('*'));
    const L = LAYOUTS[key], [W, H] = L.vb;
    const used = new Set();
    let lines = '', pups = '';
    PORTEES.forEach((p) => {
      const a = L.pos[p.pere], b = L.pos[p.mere];
      if (!a || !b) return;
      used.add(p.pere); used.add(p.mere);
      const st = statutPortee(p);
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const nx = -(b[1] - a[1]), ny = b[0] - a[0], nl = Math.hypot(nx, ny);
      const ox = (nx / nl) * 70 * (mx < W / 2 ? 1 : -1), oy = Math.abs((ny / nl) * 70);
      const cx = mx + ox * 0.6, cy = my + oy * 0.6;
      lines += `<path class="link-line ${st === 'a-venir' ? 'link-line--future' : ''}" d="M${a[0]} ${a[1]}Q${cx} ${cy} ${b[0]} ${b[1]}" data-line/>`;
      const list = [];
      if (p.disponibles) { for (let i = 0; i < (p.disponibles.femelles || 0); i++) list.push('f'); for (let i = 0; i < (p.disponibles.males || 0); i++) list.push('m'); }
      const n = list.length || 3;
      for (let i = 0; i < n; i++) {
        const t = n === 1 ? 0 : i / (n - 1) - 0.5;
        const px = mx + ox + t * 64, py = my + oy + Math.abs(t) * -14 + 26;
        const cls = list.length ? (list[i] === 'f' ? 'pupstar pupstar--f' : 'pupstar') : 'pupstar pupstar--q';
        pups += `<circle class="${cls}" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${list.length ? 6 : 5}" data-pup${list.length ? '' : ' data-pulse'}/>`;
      }
      const label = st === 'a-venir' ? 'Naissance attendue' : st === 'disponible' ? 'Chiots disponibles' : 'Portée passée';
      pups += `<text class="sub" x="${(mx + ox).toFixed(1)}" y="${(my + oy + 68).toFixed(1)}" text-anchor="middle" data-pup>${label}</text>`;
    });
    const stars = CHIENS.map((c) => {
      const [x, y] = L.pos[c.id] || [W / 2, H / 2];
      const faint = !used.has(c.id);
      const r = faint ? 7 : 10;
      return `<g class="star ${faint ? 'star--faint' : ''}" data-star="${c.id}" tabindex="0" role="link" aria-label="Fiche de ${c.nom}, ${c.sexe === 'male' ? 'mâle' : 'femelle'}${faint ? ', prochaine union à compléter' : ''}" transform="translate(${x} ${y})">
        <circle class="star-glow" r="${r * 5}"/><circle class="star-core" r="${r}"/>
        <text y="${r + 34}" text-anchor="middle">${c.nom}</text>
        <text class="sub" y="${r + 54}" text-anchor="middle">${c.sexe === 'male' ? 'Mâle' : 'Femelle'}</text>
      </g>`;
    }).join('');
    host.innerHTML = `<svg class="sky__svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="Constellation des reproducteurs et de leurs portées">
      <defs><radialGradient id="starGlow"><stop offset="0" stop-color="#CFE6FF" stop-opacity=".55"/><stop offset=".35" stop-color="#8FD3FF" stop-opacity=".16"/><stop offset="1" stop-color="#8FD3FF" stop-opacity="0"/></radialGradient></defs>
      <g>${lines}</g><g>${pups}</g><g>${stars}</g></svg>`;
    host.appendChild(tip);
    bindTips();
    animate();
  };
  const bindTips = () => {
    host.querySelectorAll('[data-star]').forEach((g) => {
      const c = chien(g.dataset.star);
      const show = () => {
        const r = g.getBoundingClientRect(), hr = host.getBoundingClientRect();
        tip.innerHTML = `<img src="assets/img/photos/${c.photo}-640.webp" alt=""><span><b>${c.nom}</b><br><small style="color:var(--mist)">${c.nomComplet}</small></span>`;
        tip.style.left = `${r.left - hr.left + r.width / 2}px`; tip.style.top = `${r.top - hr.top + r.height * 0.3}px`;
        tip.classList.add('on');
      };
      const hide = () => tip.classList.remove('on');
      g.addEventListener('pointerenter', show); g.addEventListener('pointerleave', hide);
      g.addEventListener('focus', show); g.addEventListener('blur', hide);
      g.addEventListener('click', () => { location.href = `chiens.html#${c.id}`; });
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); location.href = `chiens.html#${c.id}`; } });
    });
  };
  const animate = () => {
    if (calm) return;
    tl?.scrollTrigger?.kill(); tl?.kill();
    const lines = host.querySelectorAll('[data-line]');
    lines.forEach((l) => { const len = l.getTotalLength(); if (!l.classList.contains('link-line--future')) { l.style.strokeDasharray = len; l.style.strokeDashoffset = len; } else { l.style.opacity = 0; } });
    tl = gsap.timeline({ scrollTrigger: { trigger: host, start: 'top 75%', once: true } })
      .from(host.querySelectorAll('[data-star]'), { opacity: 0, scale: 0.2, transformOrigin: 'center', duration: 1, stagger: 0.12, ease: 'back.out(2)' })
      .to([...lines].filter((l) => !l.classList.contains('link-line--future')), { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, 0.5)
      .to([...lines].filter((l) => l.classList.contains('link-line--future')), { opacity: 1, duration: 1.2 }, 0.9)
      .from(host.querySelectorAll('[data-pup]'), { opacity: 0, scale: 0, transformOrigin: 'center', duration: 0.7, stagger: 0.08, ease: 'back.out(3)' }, 1.4);
    gsap.to(host.querySelectorAll('.star-glow'), { opacity: 0.55, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: { each: 0.4, from: 'random' } });
    gsap.to(host.querySelectorAll('[data-pulse]'), { opacity: 0.25, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.3 });
    gsap.to(host.querySelectorAll('.link-line--future'), { strokeDashoffset: -44, duration: 2.2, repeat: -1, ease: 'none' });
  };
  render();
  let t; window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => { render(); ScrollTrigger.refresh(); }, 200); });
}
