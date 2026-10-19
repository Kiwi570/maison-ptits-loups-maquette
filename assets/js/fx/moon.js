/* Lune de la portée (se remplit à l'approche de la naissance) et compte à rebours. */
import { dateParis } from '../data.js';
const GESTATION = 63; // jours

let uid = 0;
export function moonSVG() {
  const id = `m${++uid}`;
  return `<svg class="moon" viewBox="0 0 200 200" role="img" aria-label="Lune : plus elle est pleine, plus la naissance approche">
  <defs>
    <radialGradient id="${id}lit" cx="40%" cy="38%" r="70%"><stop offset="0" stop-color="#FBFCFF"/><stop offset=".6" stop-color="#DCE6F3"/><stop offset="1" stop-color="#AFC2DA"/></radialGradient>
    <radialGradient id="${id}dark" cx="50%" cy="50%" r="60%"><stop offset="0" stop-color="#1B2A47"/><stop offset="1" stop-color="#101A2E"/></radialGradient>
    <clipPath id="${id}clip"><path data-lit-clip d=""/></clipPath>
  </defs>
  <circle cx="100" cy="100" r="92" fill="url(#${id}dark)" stroke="rgba(238,243,247,.18)" stroke-width="1"/>
  <path data-lit d="" fill="url(#${id}lit)"/>
  <g clip-path="url(#${id}clip)" fill="#9FB2CC" opacity=".45">
    <circle cx="70" cy="74" r="13"/><circle cx="122" cy="58" r="8"/><circle cx="132" cy="118" r="17"/><circle cx="84" cy="136" r="9"/><circle cx="106" cy="96" r="5"/><circle cx="58" cy="112" r="6"/>
  </g>
</svg>`;
}

export function phasePath(f, cx = 100, cy = 100, r = 92) {
  f = Math.max(0, Math.min(1, f));
  if (f <= 0.001) return '';
  if (f >= 0.999) return `M${cx} ${cy - r}A${r} ${r} 0 1 1 ${cx} ${cy + r}A${r} ${r} 0 1 1 ${cx} ${cy - r}Z`;
  const rx = Math.abs(1 - 2 * f) * r;
  const sweep = f > 0.5 ? 1 : 0;
  return `M${cx} ${cy - r}A${r} ${r} 0 0 1 ${cx} ${cy + r}A${rx.toFixed(2)} ${r} 0 0 ${sweep} ${cx} ${cy - r}Z`;
}

export function moonPhaseFor(iso, now = new Date()) {
  const target = dateParis(iso);
  const days = (target - now) / 864e5;
  return Math.max(0, Math.min(1, 1 - days / GESTATION));
}

export function setMoon(svg, f) {
  const d = phasePath(f);
  svg.querySelector('[data-lit]').setAttribute('d', d);
  svg.querySelector('[data-lit-clip]').setAttribute('d', d);
}

export function animateMoon(svg, iso, calm) {
  const f = moonPhaseFor(iso);
  if (calm) { setMoon(svg, f); return; }
  const st = { f: 0.02 };
  setMoon(svg, st.f);
  window.ScrollTrigger.create({ trigger: svg, start: 'top 85%', once: true, onEnter: () => window.gsap.to(st, { f, duration: 2.4, ease: 'expo.out', onUpdate: () => setMoon(svg, st.f) }) });
}

export function countdownHTML() {
  return `<div class="countdown tabnum" aria-live="off"><div><b data-cd="j">00</b><span>jours</span></div><div><b data-cd="h">00</b><span>heures</span></div><div><b data-cd="m">00</b><span>min</span></div><div><b data-cd="s">00</b><span>s</span></div></div>`;
}

export function startCountdown(root, iso, { onDone } = {}) {
  const target = dateParis(iso);
  const el = (k) => root.querySelector(`[data-cd="${k}"]`);
  const pad = (n) => String(n).padStart(2, '0');
  let done = false;
  const tick = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const j = Math.floor(s / 86400); s -= j * 86400;
    const h = Math.floor(s / 3600); s -= h * 3600;
    const m = Math.floor(s / 60); s -= m * 60;
    el('j').textContent = pad(j); el('h').textContent = pad(h); el('m').textContent = pad(m); el('s').textContent = pad(s);
    if (target - Date.now() <= 0 && !done) { done = true; onDone?.(); }
  };
  tick();
  setInterval(tick, 1000);
}

export function joursAvant(iso, now = new Date()) {
  return Math.ceil((dateParis(iso) - now) / 864e5);
}
